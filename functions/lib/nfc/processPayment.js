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
exports.transferWristbandBalance = exports.toggleWristbandBlock = exports.topUpWristband = exports.processNFCPayment = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
/**
 * Process an NFC payment from a wristband
 * Can be called by vendor terminals at events
 */
exports.processNFCPayment = (0, https_1.onCall)({ region: 'europe-west1' }, async (request) => {
    const context = request;
    const data = request.data;
    // Check authentication (vendor or admin)
    if (!context.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Autenticação necessária.');
    }
    const { wristbandId, serialNumber, amount, description, vendorId, eventId, terminalId } = data;
    // Validate input
    if (!wristbandId && !serialNumber) {
        throw new https_1.HttpsError('invalid-argument', 'ID da pulseira ou número de série é obrigatório.');
    }
    if (!amount || amount <= 0) {
        throw new https_1.HttpsError('invalid-argument', 'Valor inválido. O montante deve ser positivo.');
    }
    if (!vendorId || !eventId) {
        throw new https_1.HttpsError('invalid-argument', 'Vendor e evento são obrigatórios.');
    }
    // Find the wristband
    let wristbandRef;
    let wristbandDoc;
    if (wristbandId) {
        wristbandRef = db.collection('wristbands').doc(wristbandId);
        wristbandDoc = await wristbandRef.get();
    }
    else {
        const query = await db
            .collection('wristbands')
            .where('serialNumber', '==', serialNumber)
            .limit(1)
            .get();
        if (query.empty) {
            throw new https_1.HttpsError('not-found', 'Pulseira não encontrada.');
        }
        wristbandDoc = query.docs[0];
        wristbandRef = wristbandDoc.ref;
    }
    if (!wristbandDoc.exists) {
        throw new https_1.HttpsError('not-found', 'Pulseira não encontrada.');
    }
    const wristband = wristbandDoc.data();
    // Check wristband status
    if (wristband.status === 'blocked') {
        throw new https_1.HttpsError('failed-precondition', 'Pulseira bloqueada. Contacta o suporte.');
    }
    if (wristband.status === 'inactive') {
        throw new https_1.HttpsError('failed-precondition', 'Pulseira inativa. Precisa ser ativada primeiro.');
    }
    // Check balance
    if (wristband.balance < amount) {
        throw new https_1.HttpsError('failed-precondition', `Saldo insuficiente. Disponível: ${wristband.balance}$00`);
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
            throw new https_1.HttpsError('failed-precondition', 'Saldo insuficiente.');
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
        transaction.set(vendorSalesRef, {
            totalSales: admin.firestore.FieldValue.increment(amount),
            transactionsCount: admin.firestore.FieldValue.increment(1),
            updatedAt: now,
        }, { merge: true });
        // Update event daily revenue
        const eventRevenueRef = db
            .collection('events')
            .doc(eventId)
            .collection('dailyRevenue')
            .doc(todayStr);
        transaction.set(eventRevenueRef, {
            nfcRevenue: admin.firestore.FieldValue.increment(amount),
            nfcTransactions: admin.firestore.FieldValue.increment(1),
            updatedAt: now,
        }, { merge: true });
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
exports.topUpWristband = (0, https_1.onCall)({ region: 'europe-west1' }, async (request) => {
    const context = request;
    const data = request.data;
    if (!context.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Autenticação necessária.');
    }
    const { wristbandId, amount, paymentMethod, eventId } = data;
    const userId = context.auth.uid;
    if (!wristbandId || !amount || amount <= 0) {
        throw new https_1.HttpsError('invalid-argument', 'Dados inválidos.');
    }
    // Validate minimum top-up amount
    const minTopup = 500;
    if (amount < minTopup) {
        throw new https_1.HttpsError('invalid-argument', `Carregamento mínimo: ${minTopup}$00`);
    }
    // Get wristband
    const wristbandRef = db.collection('wristbands').doc(wristbandId);
    const wristbandDoc = await wristbandRef.get();
    if (!wristbandDoc.exists) {
        throw new https_1.HttpsError('not-found', 'Pulseira não encontrada.');
    }
    const wristband = wristbandDoc.data();
    // Verify ownership
    if (wristband.userId !== userId) {
        throw new https_1.HttpsError('permission-denied', 'Não tens permissão para carregar esta pulseira.');
    }
    // If using wallet, check balance
    if (paymentMethod === 'wallet') {
        const userDoc = await db.collection('users').doc(userId).get();
        const walletBalance = userDoc.data()?.walletBalance || 0;
        if (walletBalance < amount) {
            throw new https_1.HttpsError('failed-precondition', `Saldo da carteira insuficiente. Disponível: ${walletBalance}$00`);
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
exports.toggleWristbandBlock = (0, https_1.onCall)({ region: 'europe-west1' }, async (request) => {
    const context = request;
    const data = request.data;
    if (!context.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Autenticação necessária.');
    }
    const { wristbandId, block } = data;
    const userId = context.auth.uid;
    const wristbandRef = db.collection('wristbands').doc(wristbandId);
    const wristbandDoc = await wristbandRef.get();
    if (!wristbandDoc.exists) {
        throw new https_1.HttpsError('not-found', 'Pulseira não encontrada.');
    }
    const wristband = wristbandDoc.data();
    // Verify ownership
    if (wristband.userId !== userId) {
        throw new https_1.HttpsError('permission-denied', 'Não tens permissão para modificar esta pulseira.');
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
exports.transferWristbandBalance = (0, https_1.onCall)({ region: 'europe-west1' }, async (request) => {
    const context = request;
    const data = request.data;
    if (!context.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Autenticação necessária.');
    }
    const { sourceWristbandId, destinationType, destinationId, amount } = data;
    const userId = context.auth.uid;
    if (amount <= 0) {
        throw new https_1.HttpsError('invalid-argument', 'Valor inválido.');
    }
    // Get source wristband
    const sourceRef = db.collection('wristbands').doc(sourceWristbandId);
    const sourceDoc = await sourceRef.get();
    if (!sourceDoc.exists) {
        throw new https_1.HttpsError('not-found', 'Pulseira de origem não encontrada.');
    }
    const source = sourceDoc.data();
    // Verify ownership
    if (source.userId !== userId) {
        throw new https_1.HttpsError('permission-denied', 'Não tens permissão para esta operação.');
    }
    // Check balance
    if (source.balance < amount) {
        throw new https_1.HttpsError('failed-precondition', 'Saldo insuficiente.');
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
        }
        else if (destinationType === 'wristband' && destinationId) {
            // Transfer to another wristband
            const destRef = db.collection('wristbands').doc(destinationId);
            const destDoc = await transaction.get(destRef);
            if (!destDoc.exists || destDoc.data()?.userId !== userId) {
                throw new https_1.HttpsError('not-found', 'Pulseira de destino não encontrada.');
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
//# sourceMappingURL=processPayment.js.map