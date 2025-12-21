"use strict";
/**
 * EventsCV Cloud Functions
 *
 * This file exports all Cloud Functions for the EventsCV platform.
 * Functions are organized by domain/feature.
 */
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
exports.analytics = exports.createGuestRegistration = exports.generateEventQRCode = exports.transferWristbandBalance = exports.toggleWristbandBlock = exports.topUpWristband = exports.processNFCPayment = exports.activateWristband = exports.initializeSuperAdmin = exports.setSuperAdmin = void 0;
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin SDK
admin.initializeApp();
// ============================================
// ADMIN FUNCTIONS
// ============================================
var setSuperAdmin_1 = require("./admin/setSuperAdmin");
Object.defineProperty(exports, "setSuperAdmin", { enumerable: true, get: function () { return setSuperAdmin_1.setSuperAdmin; } });
Object.defineProperty(exports, "initializeSuperAdmin", { enumerable: true, get: function () { return setSuperAdmin_1.initializeSuperAdmin; } });
// ============================================
// AUTH FUNCTIONS
// ============================================
// export { onUserCreate, onUserDelete } from './auth/userTriggers';
// ============================================
// PAYMENT FUNCTIONS
// ============================================
// export { stripeWebhook } from './payments/stripeWebhook';
// ============================================
// TICKET FUNCTIONS
// ============================================
// export { generateTicket } from './tickets/generateTicket';
// ============================================
// ORDER FUNCTIONS
// ============================================
// export { reserveTickets, releaseExpiredReservations } from './orders/reservations';
// ============================================
// WALLET FUNCTIONS
// ============================================
// export { topUpWallet } from './wallet/topUp';
// export { processBonus } from './wallet/processBonus';
// export { updateLoyalty } from './wallet/updateLoyalty';
// ============================================
// NFC FUNCTIONS
// ============================================
var nfc_1 = require("./nfc");
Object.defineProperty(exports, "activateWristband", { enumerable: true, get: function () { return nfc_1.activateWristband; } });
Object.defineProperty(exports, "processNFCPayment", { enumerable: true, get: function () { return nfc_1.processNFCPayment; } });
Object.defineProperty(exports, "topUpWristband", { enumerable: true, get: function () { return nfc_1.topUpWristband; } });
Object.defineProperty(exports, "toggleWristbandBlock", { enumerable: true, get: function () { return nfc_1.toggleWristbandBlock; } });
Object.defineProperty(exports, "transferWristbandBalance", { enumerable: true, get: function () { return nfc_1.transferWristbandBalance; } });
// ============================================
// NOTIFICATION FUNCTIONS
// ============================================
// export { sendPushNotification } from './notifications/sendPush';
// export { sendEmail } from './notifications/sendEmail';
// export { eventReminder } from './notifications/eventReminder';
// ============================================
// QR CODE & REGISTRATION FUNCTIONS
// ============================================
var generateEventQRCode_1 = require("./qrcode/generateEventQRCode");
Object.defineProperty(exports, "generateEventQRCode", { enumerable: true, get: function () { return generateEventQRCode_1.generateEventQRCode; } });
var createGuestRegistration_1 = require("./registration/createGuestRegistration");
Object.defineProperty(exports, "createGuestRegistration", { enumerable: true, get: function () { return createGuestRegistration_1.createGuestRegistration; } });
// ============================================
// ANALYTICS FUNCTIONS
// ============================================
exports.analytics = __importStar(require("./analytics"));
// ============================================
// SCHEDULED FUNCTIONS
// ============================================
// export { dailyReports } from './scheduled/dailyReports';
// export { cleanupOldData } from './scheduled/cleanupOldData';
//# sourceMappingURL=index.js.map