import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

interface ActivateWristbandData {
  serialNumber: string;
  name?: string;
  eventId?: string;
}

interface WristbandDoc {
  serialNumber: string;
  name: string;
  userId: string;
  status: 'active' | 'inactive' | 'blocked';
  balance: number;
  linkedEventId: string | null;
  activatedAt: admin.firestore.Timestamp;
  lastUsedAt: admin.firestore.Timestamp | null;
  stats: {
    totalSpent: number;
    totalTopups: number;
    transactionsCount: number;
  };
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}

/**
 * Activate a new NFC wristband for a user
 */
export const activateWristband = functions
  .region('europe-west1')
  .https.onCall(async (data: ActivateWristbandData, context) => {
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Tens de estar autenticado para ativar uma pulseira.'
      );
    }

    const { serialNumber, name, eventId } = data;
    const userId = context.auth.uid;

    // Validate serial number format
    if (!serialNumber || !/^ECV-\d{4}-[A-Z0-9]{8}$/.test(serialNumber)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Número de série inválido. Formato: ECV-YYYY-XXXXXXXX'
      );
    }

    // Check if serial number is valid (exists in inventory)
    const inventoryRef = db.collection('wristbandInventory').doc(serialNumber);
    const inventoryDoc = await inventoryRef.get();

    if (!inventoryDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Número de série não encontrado. Verifica se está correto.'
      );
    }

    const inventory = inventoryDoc.data();

    if (inventory?.status === 'activated') {
      throw new functions.https.HttpsError(
        'already-exists',
        'Esta pulseira já foi ativada por outro utilizador.'
      );
    }

    if (inventory?.status === 'blocked') {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Esta pulseira está bloqueada e não pode ser ativada.'
      );
    }

    // Check if user already has this wristband
    const existingWristband = await db
      .collection('wristbands')
      .where('userId', '==', userId)
      .where('serialNumber', '==', serialNumber)
      .get();

    if (!existingWristband.empty) {
      throw new functions.https.HttpsError(
        'already-exists',
        'Já tens esta pulseira associada à tua conta.'
      );
    }

    // Validate event if provided
    if (eventId) {
      const eventDoc = await db.collection('events').doc(eventId).get();
      if (!eventDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'Evento não encontrado.'
        );
      }
    }

    // Check if this is user's first wristband (for bonus)
    const userWristbands = await db
      .collection('wristbands')
      .where('userId', '==', userId)
      .limit(1)
      .get();

    const isFirstWristband = userWristbands.empty;
    const activationBonus = isFirstWristband ? 500 : 0;

    // Create wristband document
    const wristbandRef = db.collection('wristbands').doc();
    const now = admin.firestore.Timestamp.now();

    const wristbandData: WristbandDoc = {
      serialNumber,
      name: name || 'Pulseira NFC',
      userId,
      status: 'active',
      balance: activationBonus,
      linkedEventId: eventId || null,
      activatedAt: now,
      lastUsedAt: null,
      stats: {
        totalSpent: 0,
        totalTopups: activationBonus,
        transactionsCount: activationBonus > 0 ? 1 : 0,
      },
      createdAt: now,
      updatedAt: now,
    };

    // Use transaction to ensure consistency
    await db.runTransaction(async (transaction) => {
      // Create wristband
      transaction.set(wristbandRef, wristbandData);

      // Update inventory status
      transaction.update(inventoryRef, {
        status: 'activated',
        activatedAt: now,
        activatedBy: userId,
        wristbandId: wristbandRef.id,
      });

      // If there's a bonus, create a transaction record
      if (activationBonus > 0) {
        const transactionRef = db.collection('nfcTransactions').doc();
        transaction.set(transactionRef, {
          wristbandId: wristbandRef.id,
          userId,
          type: 'bonus',
          amount: activationBonus,
          description: 'Bónus de ativação',
          vendor: 'EventsCV',
          eventId: eventId || null,
          createdAt: now,
        });
      }

      // Update user's wristband count
      const userRef = db.collection('users').doc(userId);
      transaction.update(userRef, {
        wristbandsCount: admin.firestore.FieldValue.increment(1),
        updatedAt: now,
      });
    });

    return {
      success: true,
      wristbandId: wristbandRef.id,
      serialNumber,
      balance: activationBonus,
      bonusAwarded: activationBonus > 0,
      message: activationBonus > 0
        ? `Pulseira ativada com sucesso! Recebeste ${activationBonus}$00 de bónus.`
        : 'Pulseira ativada com sucesso!',
    };
  });
