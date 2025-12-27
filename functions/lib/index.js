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
exports.editChatMessage = exports.sendChatMessage = exports.leaveChatRoom = exports.joinChatRoom = exports.createChatRoom = exports.onCalendarEventCreated = exports.getCalendarSubscribers = exports.getUserSubscriptions = exports.updateSubscriptionPreferences = exports.unsubscribeFromCalendar = exports.subscribeToCalendar = exports.listOrganizationCalendars = exports.getCalendarBySlug = exports.getCalendar = exports.deleteCalendar = exports.updateCalendar = exports.createCalendar = exports.onEquipmentRentalCreated = exports.updateRentalStatus = exports.createEquipmentRental = exports.calculateRentalPrice = exports.checkEquipmentAvailability = exports.searchTranscript = exports.editTranscriptSegment = exports.downloadTranscript = exports.getSessionTranscript = exports.processAudioChunk = exports.trackListener = exports.getTranslationSession = exports.updateSessionStatus = exports.endTranslationSession = exports.startTranslationSession = exports.autoGenerateInsights = exports.generateInsights = exports.createEventEmbedding = exports.generateDailyRecommendations = exports.getRecommendations = exports.setPosterAsCover = exports.generatePoster = exports.lyraChat = exports.analytics = exports.createGuestRegistration = exports.generateEventQRCode = exports.transferWristbandBalance = exports.toggleWristbandBlock = exports.topUpWristband = exports.processNFCPayment = exports.activateWristband = exports.initializeSuperAdmin = exports.setSuperAdmin = void 0;
exports.onEventPublished = exports.unmuteUser = exports.muteUser = exports.flagMessage = exports.reactToMessage = exports.deleteChatMessage = void 0;
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
// ============================================
// AI FUNCTIONS
// ============================================
// AI Chat Assistant (Lyra)
var lyra_1 = require("./ai/chat/lyra");
Object.defineProperty(exports, "lyraChat", { enumerable: true, get: function () { return lyra_1.chat; } });
// AI Content Generation
var posterGenerator_1 = require("./ai/generation/posterGenerator");
Object.defineProperty(exports, "generatePoster", { enumerable: true, get: function () { return posterGenerator_1.generatePoster; } });
Object.defineProperty(exports, "setPosterAsCover", { enumerable: true, get: function () { return posterGenerator_1.setPosterAsCover; } });
// AI Recommendations
var personalized_1 = require("./ai/recommendations/personalized");
Object.defineProperty(exports, "getRecommendations", { enumerable: true, get: function () { return personalized_1.getRecommendations; } });
Object.defineProperty(exports, "generateDailyRecommendations", { enumerable: true, get: function () { return personalized_1.generateDailyRecommendations; } });
Object.defineProperty(exports, "createEventEmbedding", { enumerable: true, get: function () { return personalized_1.createEventEmbedding; } });
// AI Analytics & Insights
var insights_1 = require("./ai/analytics/insights");
Object.defineProperty(exports, "generateInsights", { enumerable: true, get: function () { return insights_1.generateInsights; } });
Object.defineProperty(exports, "autoGenerateInsights", { enumerable: true, get: function () { return insights_1.autoGenerateInsights; } });
// ============================================
// TRANSLATION SERVICE FUNCTIONS
// ============================================
// Translation Session Management
var session_1 = require("./translation/session");
Object.defineProperty(exports, "startTranslationSession", { enumerable: true, get: function () { return session_1.startTranslationSession; } });
Object.defineProperty(exports, "endTranslationSession", { enumerable: true, get: function () { return session_1.endTranslationSession; } });
Object.defineProperty(exports, "updateSessionStatus", { enumerable: true, get: function () { return session_1.updateSessionStatus; } });
Object.defineProperty(exports, "getTranslationSession", { enumerable: true, get: function () { return session_1.getTranslationSession; } });
Object.defineProperty(exports, "trackListener", { enumerable: true, get: function () { return session_1.trackListener; } });
// Audio Processing & Real-time Translation
var audioProcessor_1 = require("./translation/audioProcessor");
Object.defineProperty(exports, "processAudioChunk", { enumerable: true, get: function () { return audioProcessor_1.processAudioChunk; } });
// Transcript Management
var transcript_1 = require("./translation/transcript");
Object.defineProperty(exports, "getSessionTranscript", { enumerable: true, get: function () { return transcript_1.getSessionTranscript; } });
Object.defineProperty(exports, "downloadTranscript", { enumerable: true, get: function () { return transcript_1.downloadTranscript; } });
Object.defineProperty(exports, "editTranscriptSegment", { enumerable: true, get: function () { return transcript_1.editTranscriptSegment; } });
Object.defineProperty(exports, "searchTranscript", { enumerable: true, get: function () { return transcript_1.searchTranscript; } });
// Equipment Rental
var equipment_1 = require("./translation/equipment");
Object.defineProperty(exports, "checkEquipmentAvailability", { enumerable: true, get: function () { return equipment_1.checkEquipmentAvailability; } });
Object.defineProperty(exports, "calculateRentalPrice", { enumerable: true, get: function () { return equipment_1.calculateRentalPrice; } });
Object.defineProperty(exports, "createEquipmentRental", { enumerable: true, get: function () { return equipment_1.createEquipmentRental; } });
Object.defineProperty(exports, "updateRentalStatus", { enumerable: true, get: function () { return equipment_1.updateRentalStatus; } });
Object.defineProperty(exports, "onEquipmentRentalCreated", { enumerable: true, get: function () { return equipment_1.onEquipmentRentalCreated; } });
// ============================================
// EVENT CALENDARS & SUBSCRIBERS
// ============================================
// Calendar CRUD Operations
var calendars_1 = require("./calendars");
Object.defineProperty(exports, "createCalendar", { enumerable: true, get: function () { return calendars_1.createCalendar; } });
Object.defineProperty(exports, "updateCalendar", { enumerable: true, get: function () { return calendars_1.updateCalendar; } });
Object.defineProperty(exports, "deleteCalendar", { enumerable: true, get: function () { return calendars_1.deleteCalendar; } });
Object.defineProperty(exports, "getCalendar", { enumerable: true, get: function () { return calendars_1.getCalendar; } });
Object.defineProperty(exports, "getCalendarBySlug", { enumerable: true, get: function () { return calendars_1.getCalendarBySlug; } });
Object.defineProperty(exports, "listOrganizationCalendars", { enumerable: true, get: function () { return calendars_1.listOrganizationCalendars; } });
// Subscription Management
var calendars_2 = require("./calendars");
Object.defineProperty(exports, "subscribeToCalendar", { enumerable: true, get: function () { return calendars_2.subscribeToCalendar; } });
Object.defineProperty(exports, "unsubscribeFromCalendar", { enumerable: true, get: function () { return calendars_2.unsubscribeFromCalendar; } });
Object.defineProperty(exports, "updateSubscriptionPreferences", { enumerable: true, get: function () { return calendars_2.updateSubscriptionPreferences; } });
Object.defineProperty(exports, "getUserSubscriptions", { enumerable: true, get: function () { return calendars_2.getUserSubscriptions; } });
Object.defineProperty(exports, "getCalendarSubscribers", { enumerable: true, get: function () { return calendars_2.getCalendarSubscribers; } });
Object.defineProperty(exports, "onCalendarEventCreated", { enumerable: true, get: function () { return calendars_2.onCalendarEventCreated; } });
// ============================================
// EVENT CHAT SYSTEM
// ============================================
// Chat Room Management
var chat_1 = require("./chat");
Object.defineProperty(exports, "createChatRoom", { enumerable: true, get: function () { return chat_1.createChatRoom; } });
Object.defineProperty(exports, "joinChatRoom", { enumerable: true, get: function () { return chat_1.joinChatRoom; } });
Object.defineProperty(exports, "leaveChatRoom", { enumerable: true, get: function () { return chat_1.leaveChatRoom; } });
// Message Management
var chat_2 = require("./chat");
Object.defineProperty(exports, "sendChatMessage", { enumerable: true, get: function () { return chat_2.sendChatMessage; } });
Object.defineProperty(exports, "editChatMessage", { enumerable: true, get: function () { return chat_2.editChatMessage; } });
Object.defineProperty(exports, "deleteChatMessage", { enumerable: true, get: function () { return chat_2.deleteChatMessage; } });
Object.defineProperty(exports, "reactToMessage", { enumerable: true, get: function () { return chat_2.reactToMessage; } });
Object.defineProperty(exports, "flagMessage", { enumerable: true, get: function () { return chat_2.flagMessage; } });
// Moderation
var chat_3 = require("./chat");
Object.defineProperty(exports, "muteUser", { enumerable: true, get: function () { return chat_3.muteUser; } });
Object.defineProperty(exports, "unmuteUser", { enumerable: true, get: function () { return chat_3.unmuteUser; } });
Object.defineProperty(exports, "onEventPublished", { enumerable: true, get: function () { return chat_3.onEventPublished; } });
//# sourceMappingURL=index.js.map