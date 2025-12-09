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
exports.cancelOrder = exports.releaseExpiredReservations = exports.reserveTickets = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
// Reservation timeout in minutes
const RESERVATION_TIMEOUT_MINUTES = 10;
/**
 * Reserve tickets for checkout
 * Creates a pending order with reserved ticket quantities
 */
exports.reserveTickets = functions.https.onCall(async (data, context) => {
    // Verify user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }
    const { eventId, items } = data;
    const userId = context.auth.uid;
    // Validate input
    if (!eventId || !items || !Array.isArray(items) || items.length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing or invalid eventId or items');
    }
    try {
        // Run reservation in a transaction to ensure atomicity
        const result = await db.runTransaction(async (transaction) => {
            // Get event
            const eventRef = db.collection('events').doc(eventId);
            const eventDoc = await transaction.get(eventRef);
            if (!eventDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'Event not found');
            }
            const event = eventDoc.data();
            // Check event is published
            if (event.status !== 'published') {
                throw new functions.https.HttpsError('failed-precondition', 'Event is not available for purchase');
            }
            // Check event hasn't started (or allow if configured)
            const now = new Date();
            if (event.startDate.toDate() < now && !event.allowLateTickets) {
                throw new functions.https.HttpsError('failed-precondition', 'Event has already started');
            }
            // Process each item
            const orderItems = [];
            let subtotal = 0;
            for (const item of items) {
                const ticketTypeRef = eventRef
                    .collection('ticketTypes')
                    .doc(item.ticketTypeId);
                const ticketTypeDoc = await transaction.get(ticketTypeRef);
                if (!ticketTypeDoc.exists) {
                    throw new functions.https.HttpsError('not-found', `Ticket type ${item.ticketTypeId} not found`);
                }
                const ticketType = ticketTypeDoc.data();
                // Check sale period
                const saleStart = ticketType.saleStart?.toDate();
                const saleEnd = ticketType.saleEnd?.toDate();
                if (saleStart && now < saleStart) {
                    throw new functions.https.HttpsError('failed-precondition', `${ticketType.name} não está disponível ainda`);
                }
                if (saleEnd && now > saleEnd) {
                    throw new functions.https.HttpsError('failed-precondition', `${ticketType.name} já não está disponível`);
                }
                // Check availability
                const available = ticketType.quantityTotal -
                    ticketType.quantitySold -
                    ticketType.quantityReserved;
                if (available < item.quantity) {
                    throw new functions.https.HttpsError('resource-exhausted', `Apenas ${available} bilhete(s) ${ticketType.name} disponíveis`);
                }
                // Check max per order
                if (item.quantity > ticketType.maxPerOrder) {
                    throw new functions.https.HttpsError('invalid-argument', `Máximo ${ticketType.maxPerOrder} bilhetes ${ticketType.name} por compra`);
                }
                // Reserve tickets
                transaction.update(ticketTypeRef, {
                    quantityReserved: admin.firestore.FieldValue.increment(item.quantity),
                });
                // Add to order items
                const itemTotal = ticketType.price * item.quantity;
                orderItems.push({
                    ticketTypeId: item.ticketTypeId,
                    ticketTypeName: ticketType.name,
                    quantity: item.quantity,
                    unitPrice: ticketType.price,
                    totalPrice: itemTotal,
                });
                subtotal += itemTotal;
            }
            // Calculate fees (example: 5% platform fee)
            const feePercentage = 0.05;
            const fees = Math.round(subtotal * feePercentage);
            const totalAmount = subtotal + fees;
            // Create order
            const orderId = db.collection('events').doc().id;
            const orderRef = eventRef.collection('orders').doc(orderId);
            const reservedUntil = new Date(Date.now() + RESERVATION_TIMEOUT_MINUTES * 60 * 1000);
            transaction.set(orderRef, {
                id: orderId,
                eventId,
                userId,
                items: orderItems,
                subtotal,
                fees,
                totalAmount,
                currency: 'CVE',
                status: 'reserved',
                reservedUntil,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            return {
                orderId,
                items: orderItems,
                subtotal,
                fees,
                totalAmount,
                currency: 'CVE',
                reservedUntil: reservedUntil.toISOString(),
                expiresIn: RESERVATION_TIMEOUT_MINUTES * 60, // seconds
            };
        });
        functions.logger.info(`Tickets reserved for user ${userId}: ${result.orderId}`);
        return result;
    }
    catch (error) {
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        functions.logger.error('Error reserving tickets:', error);
        throw new functions.https.HttpsError('internal', 'Error reserving tickets');
    }
});
/**
 * Release expired reservations
 * Runs every minute via Cloud Scheduler
 */
exports.releaseExpiredReservations = functions.pubsub
    .schedule('every 1 minutes')
    .onRun(async () => {
    const now = admin.firestore.Timestamp.now();
    try {
        // Find all expired reservations across all events
        const expiredQuery = await db
            .collectionGroup('orders')
            .where('status', '==', 'reserved')
            .where('reservedUntil', '<', now)
            .get();
        if (expiredQuery.empty) {
            functions.logger.info('No expired reservations to release');
            return null;
        }
        functions.logger.info(`Found ${expiredQuery.size} expired reservations`);
        // Process each expired order
        const releasePromises = expiredQuery.docs.map(async (orderDoc) => {
            const order = orderDoc.data();
            const eventId = order.eventId;
            try {
                await db.runTransaction(async (transaction) => {
                    // Release each ticket type
                    for (const item of order.items) {
                        const ticketTypeRef = db
                            .collection('events')
                            .doc(eventId)
                            .collection('ticketTypes')
                            .doc(item.ticketTypeId);
                        transaction.update(ticketTypeRef, {
                            quantityReserved: admin.firestore.FieldValue.increment(-item.quantity),
                        });
                    }
                    // Update order status
                    transaction.update(orderDoc.ref, {
                        status: 'cancelled',
                        cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
                        cancelReason: 'reservation_expired',
                    });
                });
                functions.logger.info(`Released reservation: ${orderDoc.id}`);
            }
            catch (error) {
                functions.logger.error(`Error releasing reservation ${orderDoc.id}:`, error);
            }
        });
        await Promise.all(releasePromises);
        return { released: expiredQuery.size };
    }
    catch (error) {
        functions.logger.error('Error in releaseExpiredReservations:', error);
        throw error;
    }
});
/**
 * Cancel an order (user-initiated or admin)
 */
exports.cancelOrder = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }
    const { eventId, orderId, reason } = data;
    const userId = context.auth.uid;
    if (!eventId || !orderId) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing eventId or orderId');
    }
    try {
        const orderRef = db.collection('events').doc(eventId).collection('orders').doc(orderId);
        const orderDoc = await orderRef.get();
        if (!orderDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Order not found');
        }
        const order = orderDoc.data();
        // Check ownership (or admin)
        const isAdmin = context.auth.token.role === 'admin';
        if (order.userId !== userId && !isAdmin) {
            throw new functions.https.HttpsError('permission-denied', 'Not authorized');
        }
        // Can only cancel reserved or pending orders
        if (!['reserved', 'pending'].includes(order.status)) {
            throw new functions.https.HttpsError('failed-precondition', 'Order cannot be cancelled');
        }
        await db.runTransaction(async (transaction) => {
            // Release tickets if reserved
            for (const item of order.items) {
                const ticketTypeRef = db
                    .collection('events')
                    .doc(eventId)
                    .collection('ticketTypes')
                    .doc(item.ticketTypeId);
                transaction.update(ticketTypeRef, {
                    quantityReserved: admin.firestore.FieldValue.increment(-item.quantity),
                });
            }
            // Update order
            transaction.update(orderRef, {
                status: 'cancelled',
                cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
                cancelReason: reason || 'user_cancelled',
                cancelledBy: userId,
            });
        });
        functions.logger.info(`Order ${orderId} cancelled by ${userId}`);
        return { success: true };
    }
    catch (error) {
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        functions.logger.error('Error cancelling order:', error);
        throw new functions.https.HttpsError('internal', 'Error cancelling order');
    }
});
//# sourceMappingURL=reservations.js.map