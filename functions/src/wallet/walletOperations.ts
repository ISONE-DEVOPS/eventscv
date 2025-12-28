/**
 * Wallet Operations
 *
 * Handles wallet balance management, payments, and top-ups
 */

import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import type { WalletTransaction, PaymentMethod } from '../../../packages/shared-types/src';
import { sendPurchaseConfirmation } from '../notifications/email';

const db = admin.firestore();

/**
 * Get wallet balance for a user
 */
export const getWalletBalance = onCall(
  async (request: CallableRequest<{ userId?: string }>) => {
    const { userId: targetUserId } = request.data;
    const currentUserId = request.auth?.uid;

    if (!currentUserId) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Users can only query their own balance
    const userId = targetUserId || currentUserId;
    if (userId !== currentUserId) {
      throw new HttpsError('permission-denied', 'Cannot access another user\'s wallet');
    }

    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      throw new HttpsError('not-found', 'User not found');
    }

    const userData = userDoc.data();
    const wallet = userData?.wallet || {
      balance: 0,
      bonusBalance: 0,
      currency: 'CVE',
    };

    return {
      balance: wallet.balance || 0,
      bonusBalance: wallet.bonusBalance || 0,
      totalBalance: (wallet.balance || 0) + (wallet.bonusBalance || 0),
      currency: wallet.currency || 'CVE',
    };
  }
);

/**
 * Get wallet transaction history
 */
export const getWalletTransactions = onCall(
  async (request: CallableRequest<{ limit?: number; offset?: number }>) => {
    const { limit = 50, offset = 0 } = request.data;
    const userId = request.auth?.uid;

    if (!userId) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const transactionsQuery = db
      .collection('wallet_transactions')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset(offset);

    const snapshot = await transactionsQuery.get();

    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    }));

    return {
      transactions,
      hasMore: snapshot.size === limit,
    };
  }
);

/**
 * Top up wallet balance via payment gateway
 */
export const topUpWallet = onCall(
  async (request: CallableRequest<{
    amount: number;
    paymentMethod: PaymentMethod;
    paymentReference?: string;
  }>) => {
    const { amount, paymentMethod, paymentReference } = request.data;
    const userId = request.auth?.uid;

    if (!userId) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Validate amount
    if (!amount || amount <= 0) {
      throw new HttpsError('invalid-argument', 'Amount must be greater than 0');
    }

    if (amount < 100) {
      throw new HttpsError('invalid-argument', 'Minimum top-up amount is 100 CVE');
    }

    if (amount > 50000) {
      throw new HttpsError('invalid-argument', 'Maximum top-up amount is 50,000 CVE');
    }

    try {
      // Get user data
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        throw new HttpsError('not-found', 'User not found');
      }

      const userData = userDoc.data()!;
      const currentBalance = userData.wallet?.balance || 0;
      const newBalance = currentBalance + amount;

      // Calculate bonus (2% for top-ups above 1000 CVE)
      const bonusAmount = amount >= 1000 ? Math.floor(amount * 0.02) : 0;
      const currentBonusBalance = userData.wallet?.bonusBalance || 0;
      const newBonusBalance = currentBonusBalance + bonusAmount;

      // Update user wallet in a transaction
      await db.runTransaction(async (transaction) => {
        // Update user balance
        transaction.update(userRef, {
          'wallet.balance': newBalance,
          'wallet.bonusBalance': newBonusBalance,
          'wallet.lastTopUp': admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Create wallet transaction for main top-up
        const topUpTransactionRef = db.collection('wallet_transactions').doc();
        const topUpTransaction: Partial<WalletTransaction> = {
          userId,
          type: 'topup',
          amount,
          balanceType: 'main',
          balanceAfter: newBalance,
          currency: 'CVE',
          status: 'completed',
          description: `Top-up via ${paymentMethod}`,
          reference: paymentReference,
          paymentMethod,
          createdAt: admin.firestore.FieldValue.serverTimestamp() as any,
        };
        transaction.set(topUpTransactionRef, topUpTransaction);

        // Create bonus transaction if applicable
        if (bonusAmount > 0) {
          const bonusTransactionRef = db.collection('wallet_transactions').doc();
          const bonusTransaction: Partial<WalletTransaction> = {
            userId,
            type: 'bonus_credit',
            amount: bonusAmount,
            balanceType: 'bonus',
            balanceAfter: newBonusBalance,
            currency: 'CVE',
            status: 'completed',
            description: `Top-up bonus (2% of ${amount} CVE)`,
            reference: topUpTransactionRef.id,
            createdAt: admin.firestore.FieldValue.serverTimestamp() as any,
          };
          transaction.set(bonusTransactionRef, bonusTransaction);
        }
      });

      console.log(`Wallet topped up: User ${userId}, Amount ${amount} CVE, Bonus ${bonusAmount} CVE`);

      return {
        success: true,
        newBalance,
        newBonusBalance,
        bonusEarned: bonusAmount,
        message: bonusAmount > 0
          ? `Carteira carregada! Ganhaste ${bonusAmount} CVE de bónus.`
          : 'Carteira carregada com sucesso!',
      };
    } catch (error: any) {
      console.error('Error topping up wallet:', error);
      throw new HttpsError('internal', error.message || 'Failed to top up wallet');
    }
  }
);

/**
 * Pay for order using wallet balance
 */
export const payWithWallet = onCall(
  async (request: CallableRequest<{
    orderId: string;
    useBonusBalance?: boolean;
  }>) => {
    const { orderId, useBonusBalance = true } = request.data;
    const userId = request.auth?.uid;

    if (!userId) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
      // Get order
      const orderRef = db.collection('orders').doc(orderId);
      const orderDoc = await orderRef.get();

      if (!orderDoc.exists) {
        throw new HttpsError('not-found', 'Order not found');
      }

      const orderData = orderDoc.data()!;

      // Verify order belongs to user
      if (orderData.userId !== userId) {
        throw new HttpsError('permission-denied', 'This order does not belong to you');
      }

      // Check order status
      if (orderData.status !== 'reserved' && orderData.status !== 'pending') {
        throw new HttpsError('failed-precondition', `Order status is ${orderData.status}, cannot process payment`);
      }

      const totalAmount = orderData.totalAmount;

      // Get user wallet
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        throw new HttpsError('not-found', 'User not found');
      }

      const userData = userDoc.data()!;
      const mainBalance = userData.wallet?.balance || 0;
      const bonusBalance = userData.wallet?.bonusBalance || 0;
      const totalBalance = mainBalance + bonusBalance;

      // Check if user has enough balance
      if (totalBalance < totalAmount) {
        throw new HttpsError(
          'failed-precondition',
          `Saldo insuficiente. Necessário: ${totalAmount} CVE, Disponível: ${totalBalance} CVE`
        );
      }

      // Calculate how much to deduct from each balance
      let mainDeduction = 0;
      let bonusDeduction = 0;

      if (useBonusBalance && bonusBalance > 0) {
        // Use bonus balance first
        bonusDeduction = Math.min(bonusBalance, totalAmount);
        mainDeduction = totalAmount - bonusDeduction;
      } else {
        // Use only main balance
        mainDeduction = totalAmount;
      }

      const newMainBalance = mainBalance - mainDeduction;
      const newBonusBalance = bonusBalance - bonusDeduction;

      // Process payment in a transaction
      await db.runTransaction(async (transaction) => {
        // Update user balances
        transaction.update(userRef, {
          'wallet.balance': newMainBalance,
          'wallet.bonusBalance': newBonusBalance,
          'wallet.totalSpent': admin.firestore.FieldValue.increment(totalAmount),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Update order status
        transaction.update(orderRef, {
          status: 'paid',
          paymentMethod: 'wallet',
          paymentReference: `wallet_${Date.now()}`,
          paidAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Create wallet transactions
        if (mainDeduction > 0) {
          const mainTransactionRef = db.collection('wallet_transactions').doc();
          const mainTransaction: Partial<WalletTransaction> = {
            userId,
            type: 'purchase',
            amount: -mainDeduction,
            balanceType: 'main',
            balanceAfter: newMainBalance,
            currency: 'CVE',
            status: 'completed',
            description: `Compra de bilhetes - ${orderData.items?.[0]?.ticketTypeName || 'Evento'}`,
            orderId,
            eventId: orderData.eventId,
            createdAt: admin.firestore.FieldValue.serverTimestamp() as any,
          };
          transaction.set(mainTransactionRef, mainTransaction);
        }

        if (bonusDeduction > 0) {
          const bonusTransactionRef = db.collection('wallet_transactions').doc();
          const bonusTransaction: Partial<WalletTransaction> = {
            userId,
            type: 'purchase',
            amount: -bonusDeduction,
            balanceType: 'bonus',
            balanceAfter: newBonusBalance,
            currency: 'CVE',
            status: 'completed',
            description: `Compra de bilhetes (bónus) - ${orderData.items?.[0]?.ticketTypeName || 'Evento'}`,
            orderId,
            eventId: orderData.eventId,
            createdAt: admin.firestore.FieldValue.serverTimestamp() as any,
          };
          transaction.set(bonusTransactionRef, bonusTransaction);
        }
      });

      console.log(`Wallet payment completed: User ${userId}, Order ${orderId}, Amount ${totalAmount} CVE`);

      // Generate tickets and send email (same as Pagali flow)
      // This will be handled by the order.updated trigger

      return {
        success: true,
        orderId,
        amountPaid: totalAmount,
        mainBalanceUsed: mainDeduction,
        bonusBalanceUsed: bonusDeduction,
        newMainBalance,
        newBonusBalance,
        message: 'Pagamento realizado com sucesso!',
      };
    } catch (error: any) {
      console.error('Error processing wallet payment:', error);

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError('internal', error.message || 'Failed to process payment');
    }
  }
);

/**
 * Refund to wallet (when order is refunded)
 */
export const refundToWallet = onCall(
  async (request: CallableRequest<{
    orderId: string;
    amount: number;
    reason: string;
  }>) => {
    const { orderId, amount, reason } = request.data;
    const userId = request.auth?.uid;

    if (!userId) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Validate inputs
    if (!amount || amount <= 0) {
      throw new HttpsError('invalid-argument', 'Invalid refund amount');
    }

    try {
      // Get order to verify
      const orderDoc = await db.collection('orders').doc(orderId).get();

      if (!orderDoc.exists) {
        throw new HttpsError('not-found', 'Order not found');
      }

      const orderData = orderDoc.data()!;

      // Verify order belongs to user (or user is admin)
      if (orderData.userId !== userId) {
        // Check if user is admin (would need to verify platformRole or organizationRole)
        // For now, only allow user's own refunds
        throw new HttpsError('permission-denied', 'Cannot refund another user\'s order');
      }

      // Get user
      const userRef = db.collection('users').doc(orderData.userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        throw new HttpsError('not-found', 'User not found');
      }

      const userData = userDoc.data()!;
      const currentBalance = userData.wallet?.balance || 0;
      const newBalance = currentBalance + amount;

      // Process refund in transaction
      await db.runTransaction(async (transaction) => {
        // Update user balance
        transaction.update(userRef, {
          'wallet.balance': newBalance,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Create refund transaction
        const refundTransactionRef = db.collection('wallet_transactions').doc();
        const refundTransaction: Partial<WalletTransaction> = {
          userId: orderData.userId,
          type: 'refund',
          amount,
          balanceType: 'main',
          balanceAfter: newBalance,
          currency: 'CVE',
          status: 'completed',
          description: `Reembolso - ${reason}`,
          orderId,
          eventId: orderData.eventId,
          createdAt: admin.firestore.FieldValue.serverTimestamp() as any,
        };
        transaction.set(refundTransactionRef, refundTransaction);

        // Update order
        transaction.update(db.collection('orders').doc(orderId), {
          status: 'refunded',
          refundedAmount: amount,
          refundedAt: admin.firestore.FieldValue.serverTimestamp(),
          refundReason: reason,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      console.log(`Wallet refund completed: User ${orderData.userId}, Order ${orderId}, Amount ${amount} CVE`);

      return {
        success: true,
        refundedAmount: amount,
        newBalance,
        message: 'Reembolso processado com sucesso!',
      };
    } catch (error: any) {
      console.error('Error processing wallet refund:', error);

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError('internal', error.message || 'Failed to process refund');
    }
  }
);

/**
 * Trigger: Process order paid with wallet
 * Generate tickets and send email when order is paid via wallet
 */
export const onOrderWalletPayment = onDocumentUpdated(
  'orders/{orderId}',
  async (event: any) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();

    if (!before || !after) return;

    // Check if order just became paid via wallet
    const wasNotPaid = before.status !== 'paid';
    const isNowPaid = after.status === 'paid';
    const isPaidWithWallet = after.paymentMethod === 'wallet';

    if (!wasNotPaid || !isNowPaid || !isPaidWithWallet) {
      return;
    }

    const orderId = event.params.orderId;
    console.log(`Processing wallet payment for order ${orderId}`);

    try {
      await processWalletPaymentSuccess(orderId, after);
    } catch (error) {
      console.error(`Error processing wallet payment for order ${orderId}:`, error);
      // Don't throw - already paid, just log the error
    }
  }
);

/**
 * Process successful wallet payment
 * Generate tickets and send confirmation
 */
async function processWalletPaymentSuccess(orderId: string, orderData: any) {
  const { eventId, userId, items, totalAmount } = orderData;
  const buyerEmail = orderData.guestInfo?.email || (await getUserEmail(userId));
  const buyerName = orderData.guestInfo?.name || (await getUserName(userId));

  // Get event data
  const eventDoc = await db.collection('events').doc(eventId).get();
  const eventData = eventDoc.data();

  if (!eventData) {
    throw new Error(`Event ${eventId} not found`);
  }

  // Generate tickets for each item
  const allTickets = [];
  for (const item of items) {
    for (let i = 0; i < item.quantity; i++) {
      allTickets.push({
        eventId,
        userId: userId || null,
        orderId,
        organizationId: eventData.organizationId,
        ticketTypeId: item.ticketTypeId,
        eventName: eventData.title,
        ticketTypeName: item.ticketTypeName,
        price: item.unitPrice,
        buyerName,
        buyerEmail,
        status: 'valid',
        qrCode: generateQRCodeData(orderId, allTickets.length),
        originalUserId: userId || '',
        purchasedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }

  // Save tickets to Firestore
  const batch = db.batch();
  allTickets.forEach((ticket) => {
    const ticketRef = db.collection('tickets').doc();
    batch.set(ticketRef, ticket);
  });
  await batch.commit();

  // Update event ticket count
  await db.collection('events').doc(eventId).update({
    ticketsSold: admin.firestore.FieldValue.increment(allTickets.length),
    revenue: admin.firestore.FieldValue.increment(totalAmount),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`Tickets generated for wallet order ${orderId}:`, allTickets.length);

  // Send confirmation email
  try {
    await sendPurchaseConfirmation({
      orderId,
      eventTitle: eventData.title,
      eventDate: eventData.startDate?.toDate() || new Date(),
      eventLocation: `${eventData.city || ''}, ${eventData.island || ''}`.trim() || 'Cabo Verde',
      buyerName,
      buyerEmail,
      tickets: items.map((item: any) => ({
        ticketTypeName: item.ticketTypeName,
        quantity: item.quantity,
        price: item.unitPrice,
      })),
      total: totalAmount,
      currency: orderData.currency || 'CVE',
    });
  } catch (emailError) {
    console.error(`Error sending confirmation email for order ${orderId}:`, emailError);
    // Don't fail the payment process if email fails
  }

  // Award loyalty points (1 point per 100 CVE)
  if (userId) {
    const pointsToAward = Math.floor(totalAmount / 100);
    await db.collection('users').doc(userId).update({
      'loyalty.points': admin.firestore.FieldValue.increment(pointsToAward),
      'loyalty.lifetimePoints': admin.firestore.FieldValue.increment(pointsToAward),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Awarded ${pointsToAward} loyalty points to user ${userId}`);
  }
}

/**
 * Helper: Get user email
 */
async function getUserEmail(userId: string): Promise<string> {
  const userDoc = await db.collection('users').doc(userId).get();
  return userDoc.data()?.email || '';
}

/**
 * Helper: Get user name
 */
async function getUserName(userId: string): Promise<string> {
  const userDoc = await db.collection('users').doc(userId).get();
  return userDoc.data()?.name || '';
}

/**
 * Helper: Generate QR code data for ticket
 */
function generateQRCodeData(orderId: string, ticketIndex: number): string {
  // Simple QR code data - in production, use a secure token
  return `EVENTSCV-${orderId}-${ticketIndex}-${Date.now()}`;
}
