"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activateWristband = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
/**
 * Activate a new NFC wristband for a user
 */
exports.activateWristband = (0, https_1.onCall)({ region: 'europe-west1' }, async (request) => {
    const context = request;
    const data = request.data;
    // Check authentication
    if (!context.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Tens de estar autenticado para ativar uma pulseira.');
    }
    const { serialNumber, name, eventId } = data;
    const userId = context.auth.uid;
    // Validate serial number format
    if (!serialNumber || !/^ECV-\d{4}-[A-Z0-9]{8}$/.test(serialNumber)) {
        throw new https_1.HttpsError('invalid-argument', 'Número de série inválido. Formato: ECV-YYYY-XXXXXXXX');
    }
    // Check if serial number is valid (exists in inventory)
    const inventoryRef = db.collection('wristbandInventory').doc(serialNumber);
    const inventoryDoc = await inventoryRef.get();
    if (!inventoryDoc.exists) {
        throw new https_1.HttpsError('not-found', 'Número de série não encontrado. Verifica se está correto.');
    }
    const inventory = inventoryDoc.data();
    if (inventory?.status === 'activated') {
        throw new https_1.HttpsError('already-exists', 'Esta pulseira já foi ativada por outro utilizador.');
    }
    if (inventory?.status === 'blocked') {
        throw new https_1.HttpsError('failed-precondition', 'Esta pulseira está bloqueada e não pode ser ativada.');
    }
    // Check if user already has this wristband
    const existingWristband = await db
        .collection('wristbands')
        .where('userId', '==', userId)
        .where('serialNumber', '==', serialNumber)
        .get();
    if (!existingWristband.empty) {
        throw new https_1.HttpsError('already-exists', 'Já tens esta pulseira associada à tua conta.');
    }
    // Validate event if provided
    if (eventId) {
        const eventDoc = await db.collection('events').doc(eventId).get();
        if (!eventDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Evento não encontrado.');
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
    const wristbandData = {
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
//# sourceMappingURL=activateWristband.js.map