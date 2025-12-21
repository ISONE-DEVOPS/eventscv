import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

const db = admin.firestore();

interface ProcessPaymentData {
  wristbandId?: string;
  serialNumber?: string;
  amount: number;
  description: string;
  vendorId: string;
  eventId: string;
  terminalId?: string;
}

interface PaymentResult {
  success: boolean;
  transactionId: string;
  newBalance: number;
  timestamp: string;
}

/**
 * Process an NFC payment from a wristband
 * Can be called by vendor terminals at events
 */
export const processNFCPayment = onCall(
  { region: 'europe-west1' },
  async (request: CallableRequest<ProcessPaymentData>): Promise<PaymentResult> => {
    const context = request;
    const data = request.data;
    // Check authentication (vendor or admin)
    if (!context.auth) {
      throw new HttpsError(
        'unauthenticated',
        'Autenticação necessária.'
      );
    }

    const { wristbandId, serialNumber, amount, description, vendorId, eventId, terminalId } = data;

    // Validate input
    if (!wristbandId && !serialNumber) {
      throw new HttpsError(
        'invalid-argument',
        'ID da pulseira ou número de série é obrigatório.'
      );
    }

    if (!amount || amount <= 0) {
      throw new HttpsError(
        'invalid-argument',
        'Valor inválido. O montante deve ser positivo.'
      );
    }

    if (!vendorId || !eventId) {
      throw new HttpsError(
        'invalid-argument',
        'Vendor e evento são obrigatórios.'
      );
    }

    // Find the wristband
    let wristbandRef: admin.firestore.DocumentReference;
    let wristbandDoc: admin.firestore.DocumentSnapshot;

    if (wristbandId) {
      wristbandRef = db.collection('wristbands').doc(wristbandId);
      wristbandDoc = await wristbandRef.get();
    } else {
      const query = await db
        .collection('wristbands')
        .where('serialNumber', '==', serialNumber)
        .limit(1)
        .get();

      if (query.empty) {
        throw new HttpsError(
          'not-found',
          'Pulseira não encontrada.'
        );
      }

      wristbandDoc = query.docs[0];
      wristbandRef = wristbandDoc.ref;
    }

    if (!wristbandDoc.exists) {
      throw new HttpsError(
        'not-found',
        'Pulseira não encontrada.'
      );
    }

    const wristband = wristbandDoc.data()!;

    // Check wristband status
    if (wristband.status === 'blocked') {
      throw new HttpsError(
        'failed-precondition',
        'Pulseira bloqueada. Contacta o suporte.'
      );
    }

    if (wristband.status === 'inactive') {
      throw new HttpsError(
        'failed-precondition',
        'Pulseira inativa. Precisa ser ativada primeiro.'
      );
    }

    // Check balance
    if (wristband.balance < amount) {
      throw new HttpsError(
        'failed-precondition',
        `Saldo insuficiente. Disponível: ${wristband.balance}$00`
      );
    }

    // Get vendor info
    const vendorDoc = await db.collection('vendors').doc(vendorId).get();
    const vendorName = vendorDoc.exists ? vendorDoc.data()?.name : 'Vendor';

    // Process payment with transaction
    const now = admin.firestore.Timestamp.now();
    const transactionRef = db.collection('nfcTransactions').doc();
    const newBalance = wristband.balance - amount;

    await db.runTransaction(async (transaction) => {
      // Re-read wristband to ensure consistency
      const freshWristband = await transaction.get(wristbandRef);
      const freshBalance = freshWristband.data()?.balance || 0;

      if (freshBalance < amount) {
        throw new HttpsError(
          'failed-precondition',
          'Saldo insuficiente.'
        );
      }

      // Update wristband balance and stats
      transaction.update(wristbandRef, {
        balance: admin.firestore.FieldValue.increment(-amount),
        lastUsedAt: now,
        'stats.totalSpent': admin.firestore.FieldValue.increment(amount),
        'stats.transactionsCount': admin.firestore.FieldValue.increment(1),
        updatedAt: now,
      });

      // Create transaction record
      transaction.set(transactionRef, {
        wristbandId: wristbandRef.id,
        serialNumber: wristband.serialNumber,
        userId: wristband.userId,
        type: 'payment',
        amount: -amount,
        description,
        vendor: vendorName,
        vendorId,
        eventId,
        terminalId: terminalId || null,
        balanceAfter: freshBalance - amount,
        status: 'completed',
        createdAt: now,
      });

      // Update vendor daily sales (for reporting)
      const todayStr = now.toDate().toISOString().split('T')[0];
      const vendorSalesRef = db
        .collection('vendors')
        .doc(vendorId)
        .collection('dailySales')
        .doc(todayStr);

      transaction.set(
        vendorSalesRef,
        {
          totalSales: admin.firestore.FieldValue.increment(amount),
          transactionsCount: admin.firestore.FieldValue.increment(1),
          updatedAt: now,
        },
        { merge: true }
      );

      // Update event daily revenue
      const eventRevenueRef = db
        .collection('events')
        .doc(eventId)
        .collection('dailyRevenue')
        .doc(todayStr);

      transaction.set(
        eventRevenueRef,
        {
          nfcRevenue: admin.firestore.FieldValue.increment(amount),
          nfcTransactions: admin.firestore.FieldValue.increment(1),
          updatedAt: now,
        },
        { merge: true }
      );
    });

    return {
      success: true,
      transactionId: transactionRef.id,
      newBalance: newBalance,
      timestamp: now.toDate().toISOString(),
    };
  });

/**
 * Top up a wristband balance
 * Can be done at event kiosks or online
 */
export const topUpWristband = onCall(
  { region: 'europe-west1' },
  async (request: CallableRequest<{
    wristbandId: string;
    amount: number;
    paymentMethod: 'wallet' | 'card' | 'cash';
    eventId?: string;
  }>) => {
    const context = request;
    const data = request.data;
    if (!context.auth) {
      throw new HttpsError(
        'unauthenticated',
        'Autenticação necessária.'
      );
    }

    const { wristbandId, amount, paymentMethod, eventId } = data;
    const userId = context.auth.uid;

    if (!wristbandId || !amount || amount <= 0) {
      throw new HttpsError(
        'invalid-argument',
        'Dados inválidos.'
      );
    }

    // Validate minimum top-up amount
    const minTopup = 500;
    if (amount < minTopup) {
      throw new HttpsError(
        'invalid-argument',
        `Carregamento mínimo: ${minTopup}$00`
      );
    }

    // Get wristband
    const wristbandRef = db.collection('wristbands').doc(wristbandId);
    const wristbandDoc = await wristbandRef.get();

    if (!wristbandDoc.exists) {
      throw new HttpsError(
        'not-found',
        'Pulseira não encontrada.'
      );
    }

    const wristband = wristbandDoc.data()!;

    // Verify ownership
    if (wristband.userId !== userId) {
      throw new HttpsError(
        'permission-denied',
        'Não tens permissão para carregar esta pulseira.'
      );
    }

    // If using wallet, check balance
    if (paymentMethod === 'wallet') {
      const userDoc = await db.collection('users').doc(userId).get();
      const walletBalance = userDoc.data()?.walletBalance || 0;

      if (walletBalance < amount) {
        throw new HttpsError(
          'failed-precondition',
          `Saldo da carteira insuficiente. Disponível: ${walletBalance}$00`
        );
      }
    }

    const now = admin.firestore.Timestamp.now();
    const transactionRef = db.collection('nfcTransactions').doc();

    await db.runTransaction(async (transaction) => {
      // Update wristband balance
      transaction.update(wristbandRef, {
        balance: admin.firestore.FieldValue.increment(amount),
        'stats.totalTopups': admin.firestore.FieldValue.increment(amount),
        'stats.transactionsCount': admin.firestore.FieldValue.increment(1),
        updatedAt: now,
      });

      // If using wallet, deduct from wallet
      if (paymentMethod === 'wallet') {
        const userRef = db.collection('users').doc(userId);
        transaction.update(userRef, {
          walletBalance: admin.firestore.FieldValue.increment(-amount),
          updatedAt: now,
        });
      }

      // Create transaction record
      transaction.set(transactionRef, {
        wristbandId,
        serialNumber: wristband.serialNumber,
        userId,
        type: 'topup',
        amount,
        description: `Carregamento via ${paymentMethod === 'wallet' ? 'carteira' : paymentMethod === 'card' ? 'cartão' : 'dinheiro'}`,
        vendor: eventId ? 'Bilheteira' : 'EventsCV',
        eventId: eventId || null,
        paymentMethod,
        balanceAfter: wristband.balance + amount,
        status: 'completed',
        createdAt: now,
      });
    });

    return {
      success: true,
      transactionId: transactionRef.id,
      newBalance: wristband.balance + amount,
      message: `Carregamento de ${amount}$00 efetuado com sucesso!`,
    };
  });

/**
 * Block or unblock a wristband
 */
export const toggleWristbandBlock = onCall(
  { region: 'europe-west1' },
  async (request: CallableRequest<{ wristbandId: string; block: boolean }>) => {
    const context = request;
    const data = request.data;
    if (!context.auth) {
      throw new HttpsError(
        'unauthenticated',
        'Autenticação necessária.'
      );
    }

    const { wristbandId, block } = data;
    const userId = context.auth.uid;

    const wristbandRef = db.collection('wristbands').doc(wristbandId);
    const wristbandDoc = await wristbandRef.get();

    if (!wristbandDoc.exists) {
      throw new HttpsError(
        'not-found',
        'Pulseira não encontrada.'
      );
    }

    const wristband = wristbandDoc.data()!;

    // Verify ownership
    if (wristband.userId !== userId) {
      throw new HttpsError(
        'permission-denied',
        'Não tens permissão para modificar esta pulseira.'
      );
    }

    const now = admin.firestore.Timestamp.now();

    await wristbandRef.update({
      status: block ? 'blocked' : 'active',
      blockedAt: block ? now : null,
      updatedAt: now,
    });

    return {
      success: true,
      status: block ? 'blocked' : 'active',
      message: block
        ? 'Pulseira bloqueada com sucesso. O saldo está protegido.'
        : 'Pulseira desbloqueada com sucesso.',
    };
  });

/**
 * Transfer balance between wristbands or to wallet
 */
export const transferWristbandBalance = onCall(
  { region: 'europe-west1' },
  async (request: CallableRequest<{
    sourceWristbandId: string;
    destinationType: 'wristband' | 'wallet';
    destinationId?: string;
    amount: number;
  }>) => {
    const context = request;
    const data = request.data;
    if (!context.auth) {
      throw new HttpsError(
        'unauthenticated',
        'Autenticação necessária.'
      );
    }

    const { sourceWristbandId, destinationType, destinationId, amount } = data;
    const userId = context.auth.uid;

    if (amount <= 0) {
      throw new HttpsError(
        'invalid-argument',
        'Valor inválido.'
      );
    }

    // Get source wristband
    const sourceRef = db.collection('wristbands').doc(sourceWristbandId);
    const sourceDoc = await sourceRef.get();

    if (!sourceDoc.exists) {
      throw new HttpsError(
        'not-found',
        'Pulseira de origem não encontrada.'
      );
    }

    const source = sourceDoc.data()!;

    // Verify ownership
    if (source.userId !== userId) {
      throw new HttpsError(
        'permission-denied',
        'Não tens permissão para esta operação.'
      );
    }

    // Check balance
    if (source.balance < amount) {
      throw new HttpsError(
        'failed-precondition',
        'Saldo insuficiente.'
      );
    }

    const now = admin.firestore.Timestamp.now();

    await db.runTransaction(async (transaction) => {
      // Deduct from source
      transaction.update(sourceRef, {
        balance: admin.firestore.FieldValue.increment(-amount),
        updatedAt: now,
      });

      if (destinationType === 'wallet') {
        // Transfer to user's wallet
        const userRef = db.collection('users').doc(userId);
        transaction.update(userRef, {
          walletBalance: admin.firestore.FieldValue.increment(amount),
          updatedAt: now,
        });
      } else if (destinationType === 'wristband' && destinationId) {
        // Transfer to another wristband
        const destRef = db.collection('wristbands').doc(destinationId);
        const destDoc = await transaction.get(destRef);

        if (!destDoc.exists || destDoc.data()?.userId !== userId) {
          throw new HttpsError(
            'not-found',
            'Pulseira de destino não encontrada.'
          );
        }

        transaction.update(destRef, {
          balance: admin.firestore.FieldValue.increment(amount),
          'stats.totalTopups': admin.firestore.FieldValue.increment(amount),
          updatedAt: now,
        });
      }

      // Create transaction records
      const sourceTransRef = db.collection('nfcTransactions').doc();
      transaction.set(sourceTransRef, {
        wristbandId: sourceWristbandId,
        userId,
        type: 'transfer_out',
        amount: -amount,
        description: `Transferência para ${destinationType === 'wallet' ? 'carteira' : 'pulseira'}`,
        createdAt: now,
      });
    });

    return {
      success: true,
      message: `${amount}$00 transferido com sucesso.`,
      newSourceBalance: source.balance - amount,
    };
  });
