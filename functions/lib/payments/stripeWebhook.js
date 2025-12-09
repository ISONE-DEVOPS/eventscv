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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhook = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const stripe_1 = __importDefault(require("stripe"));
const db = admin.firestore();
// Initialize Stripe with secret key from environment
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
});
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
/**
 * Stripe Webhook Handler
 * Processes payment events from Stripe
 */
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    }
    catch (err) {
        functions.logger.error('Webhook signature verification failed:', err);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    // Handle the event
    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutComplete(event.data.object);
                break;
            case 'payment_intent.succeeded':
                await handlePaymentSuccess(event.data.object);
                break;
            case 'payment_intent.payment_failed':
                await handlePaymentFailed(event.data.object);
                break;
            case 'charge.refunded':
                await handleRefund(event.data.object);
                break;
            default:
                functions.logger.info(`Unhandled event type: ${event.type}`);
        }
        res.json({ received: true });
    }
    catch (error) {
        functions.logger.error('Error processing webhook:', error);
        res.status(500).send('Internal Server Error');
    }
});
/**
 * Handle successful checkout session
 */
async function handleCheckoutComplete(session) {
    const { metadata } = session;
    if (!metadata) {
        functions.logger.warn('Checkout session without metadata');
        return;
    }
    const { orderId, type } = metadata;
    if (type === 'ticket_purchase' && orderId) {
        await completeTicketOrder(orderId, session);
    }
    else if (type === 'wallet_topup') {
        await completeWalletTopup(session);
    }
}
/**
 * Complete a ticket order after payment
 */
async function completeTicketOrder(orderId, session) {
    const { eventId } = session.metadata || {};
    if (!eventId) {
        functions.logger.error('Missing eventId in session metadata');
        return;
    }
    const orderRef = db.collection('events').doc(eventId).collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();
    if (!orderDoc.exists) {
        functions.logger.error(`Order not found: ${orderId}`);
        return;
    }
    const order = orderDoc.data();
    if (order?.status === 'paid') {
        functions.logger.info(`Order ${orderId} already processed`);
        return;
    }
    // Start a batch write
    const batch = db.batch();
    // Update order status
    batch.update(orderRef, {
        status: 'paid',
        paymentMethod: 'stripe',
        paymentReference: session.payment_intent,
        paidAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    // Generate tickets for each item
    const userId = order?.userId;
    const items = order?.items || [];
    for (const item of items) {
        for (let i = 0; i < item.quantity; i++) {
            const ticketId = db.collection('users').doc(userId).collection('tickets').doc().id;
            const qrCode = generateQRCodeData(ticketId, eventId);
            const ticketRef = db.collection('users').doc(userId).collection('tickets').doc(ticketId);
            batch.set(ticketRef, {
                id: ticketId,
                eventId,
                ticketTypeId: item.ticketTypeId,
                orderId,
                userId,
                qrCode,
                status: 'active',
                purchasedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            // Update ticket type sold count
            const ticketTypeRef = db
                .collection('events')
                .doc(eventId)
                .collection('ticketTypes')
                .doc(item.ticketTypeId);
            batch.update(ticketTypeRef, {
                quantitySold: admin.firestore.FieldValue.increment(1),
                quantityReserved: admin.firestore.FieldValue.increment(-1),
            });
        }
    }
    // Update event tickets sold count
    const totalTickets = items.reduce((sum, item) => sum + item.quantity, 0);
    const eventRef = db.collection('events').doc(eventId);
    batch.update(eventRef, {
        ticketsSold: admin.firestore.FieldValue.increment(totalTickets),
    });
    // Create transaction record for user
    const transactionRef = db.collection('users').doc(userId).collection('transactions').doc();
    batch.set(transactionRef, {
        id: transactionRef.id,
        type: 'purchase',
        amount: -session.amount_total / 100, // Convert from cents
        currency: session.currency?.toUpperCase(),
        status: 'completed',
        paymentMethod: 'stripe',
        description: `Compra de bilhetes`,
        reference: orderId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    // Commit all changes
    await batch.commit();
    functions.logger.info(`Order ${orderId} completed successfully`);
    // TODO: Send confirmation email and push notification
    // await sendOrderConfirmation(userId, orderId, eventId);
}
/**
 * Complete wallet top-up after payment
 */
async function completeWalletTopup(session) {
    const { userId } = session.metadata || {};
    if (!userId) {
        functions.logger.error('Missing userId in session metadata');
        return;
    }
    const amount = session.amount_total / 100; // Convert from cents
    const batch = db.batch();
    // Update user wallet balance
    const userRef = db.collection('users').doc(userId);
    batch.update(userRef, {
        'wallet.balance': admin.firestore.FieldValue.increment(amount),
        'wallet.lastTopUp': admin.firestore.FieldValue.serverTimestamp(),
    });
    // Create wallet transaction
    const transactionRef = db.collection('users').doc(userId).collection('walletTransactions').doc();
    batch.set(transactionRef, {
        id: transactionRef.id,
        userId,
        type: 'topup',
        amount,
        balanceType: 'main',
        currency: session.currency?.toUpperCase(),
        status: 'completed',
        paymentMethod: 'stripe',
        description: 'Carregamento via cartão',
        reference: session.payment_intent,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    await batch.commit();
    functions.logger.info(`Wallet top-up completed for user ${userId}: ${amount}`);
}
/**
 * Handle successful payment intent
 */
async function handlePaymentSuccess(paymentIntent) {
    functions.logger.info(`Payment succeeded: ${paymentIntent.id}`);
    // Most logic is handled in checkout.session.completed
}
/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent) {
    const { orderId, eventId } = paymentIntent.metadata || {};
    functions.logger.warn(`Payment failed: ${paymentIntent.id}`);
    if (orderId && eventId) {
        // Update order status
        await db
            .collection('events')
            .doc(eventId)
            .collection('orders')
            .doc(orderId)
            .update({
            status: 'cancelled',
            failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
        });
        // Release reserved tickets
        // This will be handled by releaseExpiredReservations scheduled function
    }
}
/**
 * Handle refund
 */
async function handleRefund(charge) {
    functions.logger.info(`Refund processed: ${charge.id}`);
    // TODO: Implement refund logic
    // - Update order status
    // - Cancel tickets
    // - Credit wallet if applicable
}
/**
 * Generate QR code data for a ticket
 */
function generateQRCodeData(ticketId, eventId) {
    const timestamp = Date.now();
    const data = `ECV:${eventId}:${ticketId}:${timestamp}`;
    // In production, this should be encrypted/signed
    return Buffer.from(data).toString('base64');
}
//# sourceMappingURL=stripeWebhook.js.map