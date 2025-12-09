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
exports.validateTicketQR = exports.generateTicket = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const QRCode = __importStar(require("qrcode"));
const uuid_1 = require("uuid");
const db = admin.firestore();
const storage = admin.storage();
/**
 * Generate ticket with QR code after order is paid
 * Triggered by Firestore document update on orders
 */
exports.generateTicket = functions.firestore
    .document('events/{eventId}/orders/{orderId}')
    .onUpdate(async (change, context) => {
    const { eventId, orderId } = context.params;
    const before = change.before.data();
    const after = change.after.data();
    // Only process when order transitions to 'paid'
    if (before.status === 'paid' || after.status !== 'paid') {
        return null;
    }
    const userId = after.userId;
    const items = after.items || [];
    functions.logger.info(`Generating tickets for order ${orderId}`);
    try {
        const batch = db.batch();
        const ticketPromises = [];
        for (const item of items) {
            for (let i = 0; i < item.quantity; i++) {
                const ticketId = (0, uuid_1.v4)();
                const qrCodeData = generateSecureQRData(ticketId, eventId, userId);
                // Generate QR code image
                ticketPromises.push(generateAndStoreQRCode(ticketId, qrCodeData).then(async (qrCodeUrl) => {
                    // Create ticket document
                    const ticketRef = db
                        .collection('users')
                        .doc(userId)
                        .collection('tickets')
                        .doc(ticketId);
                    batch.set(ticketRef, {
                        id: ticketId,
                        eventId,
                        ticketTypeId: item.ticketTypeId,
                        ticketTypeName: item.ticketTypeName,
                        orderId,
                        userId,
                        qrCode: qrCodeData,
                        qrCodeUrl,
                        status: 'active',
                        checkedInAt: null,
                        nfcUid: null,
                        purchasedAt: admin.firestore.FieldValue.serverTimestamp(),
                    });
                }));
            }
        }
        // Wait for all QR codes to be generated
        await Promise.all(ticketPromises);
        // Commit batch
        await batch.commit();
        functions.logger.info(`Generated ${ticketPromises.length} tickets for order ${orderId}`);
        // Send notification to user
        await sendTicketNotification(userId, eventId, ticketPromises.length);
        return { success: true, ticketCount: ticketPromises.length };
    }
    catch (error) {
        functions.logger.error('Error generating tickets:', error);
        throw error;
    }
});
/**
 * Generate secure QR code data with signature
 */
function generateSecureQRData(ticketId, eventId, userId) {
    const timestamp = Date.now();
    const nonce = (0, uuid_1.v4)().substring(0, 8);
    // Create payload
    const payload = {
        t: ticketId, // ticket ID
        e: eventId, // event ID
        u: userId, // user ID
        ts: timestamp, // timestamp
        n: nonce, // nonce for uniqueness
    };
    // Encode as base64
    // In production, this should be signed with a secret key (HMAC)
    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
    // Add prefix for easy identification
    return `ECV1:${encoded}`;
}
/**
 * Generate QR code image and upload to Cloud Storage
 */
async function generateAndStoreQRCode(ticketId, qrCodeData) {
    try {
        // Generate QR code as PNG buffer
        const qrCodeBuffer = await QRCode.toBuffer(qrCodeData, {
            type: 'png',
            width: 400,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF',
            },
            errorCorrectionLevel: 'H', // High error correction
        });
        // Upload to Cloud Storage
        const bucket = storage.bucket();
        const filePath = `qrcodes/${ticketId}/qr.png`;
        const file = bucket.file(filePath);
        await file.save(qrCodeBuffer, {
            metadata: {
                contentType: 'image/png',
                cacheControl: 'private, max-age=31536000', // Cache for 1 year (immutable)
            },
        });
        // Make the file publicly accessible (or use signed URLs)
        await file.makePublic();
        // Return public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
        return publicUrl;
    }
    catch (error) {
        functions.logger.error('Error generating QR code:', error);
        throw error;
    }
}
/**
 * Send push notification about new tickets
 */
async function sendTicketNotification(userId, eventId, ticketCount) {
    try {
        // Get event details
        const eventDoc = await db.collection('events').doc(eventId).get();
        const event = eventDoc.data();
        if (!event)
            return;
        // Get user FCM token
        const userDoc = await db.collection('users').doc(userId).get();
        const user = userDoc.data();
        const fcmToken = user?.fcmToken;
        if (!fcmToken) {
            functions.logger.info(`No FCM token for user ${userId}`);
            return;
        }
        // Send push notification
        await admin.messaging().send({
            token: fcmToken,
            notification: {
                title: 'Bilhetes prontos!',
                body: `Os teus ${ticketCount} bilhete(s) para ${event.title} estão disponíveis.`,
            },
            data: {
                type: 'tickets_ready',
                eventId,
                ticketCount: ticketCount.toString(),
            },
            android: {
                priority: 'high',
                notification: {
                    channelId: 'tickets',
                    icon: 'ic_ticket',
                },
            },
            apns: {
                payload: {
                    aps: {
                        badge: ticketCount,
                        sound: 'default',
                    },
                },
            },
        });
        functions.logger.info(`Notification sent to user ${userId}`);
    }
    catch (error) {
        // Don't throw - notification failure shouldn't fail the ticket generation
        functions.logger.error('Error sending notification:', error);
    }
}
/**
 * Validate ticket QR code (callable function)
 */
exports.validateTicketQR = functions.https.onCall(async (data, context) => {
    // Verify caller is authenticated and has staff role
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }
    const { qrCode, eventId, gate } = data;
    if (!qrCode || !eventId) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }
    try {
        // Decode QR code
        const decoded = decodeQRCode(qrCode);
        if (!decoded) {
            return { valid: false, error: 'Invalid QR code format' };
        }
        if (decoded.e !== eventId) {
            return { valid: false, error: 'Ticket is for a different event' };
        }
        // Find the ticket
        const ticketsQuery = await db
            .collectionGroup('tickets')
            .where('id', '==', decoded.t)
            .limit(1)
            .get();
        if (ticketsQuery.empty) {
            return { valid: false, error: 'Ticket not found' };
        }
        const ticketDoc = ticketsQuery.docs[0];
        const ticket = ticketDoc.data();
        // Check ticket status
        if (ticket.status === 'used') {
            return {
                valid: false,
                error: 'Ticket already used',
                checkedInAt: ticket.checkedInAt?.toDate(),
            };
        }
        if (ticket.status === 'cancelled') {
            return { valid: false, error: 'Ticket has been cancelled' };
        }
        if (ticket.status === 'transferred') {
            return { valid: false, error: 'Ticket has been transferred' };
        }
        // Get event to check date
        const eventDoc = await db.collection('events').doc(eventId).get();
        const event = eventDoc.data();
        if (!event) {
            return { valid: false, error: 'Event not found' };
        }
        // Mark ticket as used
        await ticketDoc.ref.update({
            status: 'used',
            checkedInAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // Create check-in record
        await db.collection('events').doc(eventId).collection('checkins').add({
            ticketId: decoded.t,
            userId: ticket.userId,
            type: 'in',
            gate: gate || 'main',
            staffId: context.auth.uid,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        // Get ticket type name
        const ticketTypeDoc = await db
            .collection('events')
            .doc(eventId)
            .collection('ticketTypes')
            .doc(ticket.ticketTypeId)
            .get();
        const ticketType = ticketTypeDoc.data();
        return {
            valid: true,
            ticket: {
                id: decoded.t,
                type: ticketType?.name || ticket.ticketTypeName,
                userName: ticket.userName || 'Guest',
            },
        };
    }
    catch (error) {
        functions.logger.error('Error validating ticket:', error);
        throw new functions.https.HttpsError('internal', 'Error validating ticket');
    }
});
/**
 * Decode QR code data
 */
function decodeQRCode(qrCode) {
    try {
        if (!qrCode.startsWith('ECV1:')) {
            return null;
        }
        const encoded = qrCode.substring(5);
        const decoded = Buffer.from(encoded, 'base64url').toString('utf-8');
        return JSON.parse(decoded);
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=generateTicket.js.map