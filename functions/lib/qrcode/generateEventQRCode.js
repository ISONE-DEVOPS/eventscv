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
exports.generateEventQRCode = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const QRCode = __importStar(require("qrcode"));
const admin = __importStar(require("firebase-admin"));
/**
 * Gera QR Code automaticamente quando um evento é publicado
 * Triggered on: events/{eventId} write
 */
exports.generateEventQRCode = (0, firestore_1.onDocumentWritten)('events/{eventId}', async (event) => {
    const eventId = event.params.eventId;
    const after = event.data?.after.data();
    const before = event.data?.before.data();
    // Só gerar QR quando evento é publicado pela primeira vez
    if (after?.status === 'published' &&
        before?.status !== 'published' &&
        !after?.registration?.qrCodeUrl) {
        try {
            const eventSlug = after.slug;
            const eventUrl = `https://eventscv.cv/events/${eventSlug}?src=qr`;
            console.log(`Generating QR code for event ${eventId} with URL: ${eventUrl}`);
            // Gerar QR code PNG
            const qrBuffer = await QRCode.toBuffer(eventUrl, {
                errorCorrectionLevel: 'H',
                width: 512,
                margin: 2,
            });
            // Upload para Firebase Storage
            const bucket = admin.storage().bucket();
            const fileName = `qrcodes/${eventId}.png`;
            const file = bucket.file(fileName);
            await file.save(qrBuffer, {
                metadata: {
                    contentType: 'image/png',
                    metadata: {
                        eventId,
                        eventSlug,
                        generatedAt: new Date().toISOString(),
                    },
                },
            });
            // Tornar arquivo público
            await file.makePublic();
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
            console.log(`QR code uploaded to: ${publicUrl}`);
            // Atualizar evento com informações do QR code
            if (event.data?.after) {
                await event.data.after.ref.update({
                    'registration.enabled': true,
                    'registration.guestRegistrationEnabled': true,
                    'registration.customFields': [],
                    'registration.qrCodeUrl': publicUrl,
                    'registration.qrCodeData': eventUrl,
                    'registration.qrCodeGeneratedAt': admin.firestore.FieldValue.serverTimestamp(),
                    qrScans: 0,
                });
            }
            console.log(`Successfully generated QR code for event ${eventId}`);
        }
        catch (error) {
            console.error(`Error generating QR code for event ${eventId}:`, error);
            throw error;
        }
    }
});
//# sourceMappingURL=generateEventQRCode.js.map