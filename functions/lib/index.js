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
exports.updateCalendar = exports.createCalendar = exports.onEquipmentRentalCreated = exports.updateRentalStatus = exports.createEquipmentRental = exports.calculateRentalPrice = exports.checkEquipmentAvailability = exports.searchTranscript = exports.editTranscriptSegment = exports.downloadTranscript = exports.getSessionTranscript = exports.processAudioChunk = exports.trackListener = exports.getTranslationSession = exports.updateSessionStatus = exports.endTranslationSession = exports.startTranslationSession = exports.autoGenerateInsights = exports.generateInsights = exports.createEventEmbedding = exports.generateDailyRecommendations = exports.getRecommendations = exports.setPosterAsCover = exports.generatePoster = exports.lyraChat = exports.analytics = exports.createGuestRegistration = exports.generateEventQRCode = exports.sendPaymentFailure = exports.sendPurchaseConfirmation = exports.transferWristbandBalance = exports.toggleWristbandBlock = exports.topUpWristband = exports.processNFCPayment = exports.activateWristband = exports.onOrderWalletPayment = exports.refundToWallet = exports.payWithWallet = exports.topUpWallet = exports.getWalletTransactions = exports.getWalletBalance = exports.releaseExpiredOrders = exports.getOrder = exports.cancelOrder = exports.createOrder = exports.getPagaliPaymentStatus = exports.pagaliWebhook = exports.initiatePagaliPayment = exports.initializeSuperAdmin = exports.setSuperAdmin = void 0;
exports.getDashboardStats = exports.getUserBadges = exports.awardBadge = exports.createBadge = exports.getUserStreak = exports.updateUserStreak = exports.redeemReward = exports.getAvailableRewards = exports.createReward = exports.getPointsHistory = exports.getUserPoints = exports.updateLeaderboardRank = exports.getLeaderboard = exports.getActiveChallenges = exports.updateChallengeProgress = exports.joinChallenge = exports.createChallenge = exports.claimAchievementReward = exports.unlockAchievement = exports.getUserAchievements = exports.createAchievement = exports.processScheduledBlasts = exports.getEventBlasts = exports.sendTestBlast = exports.getBlastStatus = exports.cancelBlast = exports.sendBlast = exports.createBlast = exports.calculateBlastRecipients = exports.onEventPublished = exports.unmuteUser = exports.muteUser = exports.flagMessage = exports.reactToMessage = exports.deleteChatMessage = exports.editChatMessage = exports.sendChatMessage = exports.leaveChatRoom = exports.joinChatRoom = exports.createChatRoom = exports.onCalendarEventCreated = exports.getCalendarSubscribers = exports.getUserSubscriptions = exports.updateSubscriptionPreferences = exports.unsubscribeFromCalendar = exports.subscribeToCalendar = exports.listOrganizationCalendars = exports.getCalendarBySlug = exports.getCalendar = exports.deleteCalendar = void 0;
exports.onTicketCancelled = exports.processAutoPricing = exports.getPriceHistory = exports.applyPriceChange = exports.getPriceRecommendation = exports.configureDynamicPricing = exports.getUserWaitlists = exports.notifyWaitlist = exports.cancelWaitlistEntry = exports.getWaitlistPosition = exports.joinWaitlist = exports.onTicketPurchased = exports.updateDashboardConfig = exports.getCompleteDashboard = exports.getLiveActivity = exports.getPriceCountdown = exports.getRecentBuyers = void 0;
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
// Pagali Payment Gateway (Cabo Verde)
var pagali_1 = require("./payments/pagali");
Object.defineProperty(exports, "initiatePagaliPayment", { enumerable: true, get: function () { return pagali_1.initiatePagaliPayment; } });
Object.defineProperty(exports, "pagaliWebhook", { enumerable: true, get: function () { return pagali_1.pagaliWebhook; } });
Object.defineProperty(exports, "getPagaliPaymentStatus", { enumerable: true, get: function () { return pagali_1.getPagaliPaymentStatus; } });
// ============================================
// TICKET FUNCTIONS
// ============================================
// export { generateTicket } from './tickets/generateTicket';
// ============================================
// ORDER FUNCTIONS
// ============================================
var createOrder_1 = require("./orders/createOrder");
Object.defineProperty(exports, "createOrder", { enumerable: true, get: function () { return createOrder_1.createOrder; } });
Object.defineProperty(exports, "cancelOrder", { enumerable: true, get: function () { return createOrder_1.cancelOrder; } });
Object.defineProperty(exports, "getOrder", { enumerable: true, get: function () { return createOrder_1.getOrder; } });
Object.defineProperty(exports, "releaseExpiredOrders", { enumerable: true, get: function () { return createOrder_1.releaseExpiredOrders; } });
// ============================================
// WALLET FUNCTIONS
// ============================================
var walletOperations_1 = require("./wallet/walletOperations");
Object.defineProperty(exports, "getWalletBalance", { enumerable: true, get: function () { return walletOperations_1.getWalletBalance; } });
Object.defineProperty(exports, "getWalletTransactions", { enumerable: true, get: function () { return walletOperations_1.getWalletTransactions; } });
Object.defineProperty(exports, "topUpWallet", { enumerable: true, get: function () { return walletOperations_1.topUpWallet; } });
Object.defineProperty(exports, "payWithWallet", { enumerable: true, get: function () { return walletOperations_1.payWithWallet; } });
Object.defineProperty(exports, "refundToWallet", { enumerable: true, get: function () { return walletOperations_1.refundToWallet; } });
Object.defineProperty(exports, "onOrderWalletPayment", { enumerable: true, get: function () { return walletOperations_1.onOrderWalletPayment; } });
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
var email_1 = require("./notifications/email");
Object.defineProperty(exports, "sendPurchaseConfirmation", { enumerable: true, get: function () { return email_1.sendPurchaseConfirmation; } });
Object.defineProperty(exports, "sendPaymentFailure", { enumerable: true, get: function () { return email_1.sendPaymentFailure; } });
// export { sendPushNotification } from './notifications/sendPush';
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
// ============================================
// EVENT BLASTS - MULTI-CHANNEL MESSAGING
// ============================================
// Blast Management
var blasts_1 = require("./blasts");
Object.defineProperty(exports, "calculateBlastRecipients", { enumerable: true, get: function () { return blasts_1.calculateBlastRecipients; } });
Object.defineProperty(exports, "createBlast", { enumerable: true, get: function () { return blasts_1.createBlast; } });
Object.defineProperty(exports, "sendBlast", { enumerable: true, get: function () { return blasts_1.sendBlast; } });
Object.defineProperty(exports, "cancelBlast", { enumerable: true, get: function () { return blasts_1.cancelBlast; } });
Object.defineProperty(exports, "getBlastStatus", { enumerable: true, get: function () { return blasts_1.getBlastStatus; } });
Object.defineProperty(exports, "sendTestBlast", { enumerable: true, get: function () { return blasts_1.sendTestBlast; } });
Object.defineProperty(exports, "getEventBlasts", { enumerable: true, get: function () { return blasts_1.getEventBlasts; } });
// Scheduled Blast Processing
var blasts_2 = require("./blasts");
Object.defineProperty(exports, "processScheduledBlasts", { enumerable: true, get: function () { return blasts_2.processScheduledBlasts; } });
// ============================================
// GAMIFICATION SYSTEM
// ============================================
// Achievements
var gamification_1 = require("./gamification");
Object.defineProperty(exports, "createAchievement", { enumerable: true, get: function () { return gamification_1.createAchievement; } });
Object.defineProperty(exports, "getUserAchievements", { enumerable: true, get: function () { return gamification_1.getUserAchievements; } });
Object.defineProperty(exports, "unlockAchievement", { enumerable: true, get: function () { return gamification_1.unlockAchievement; } });
Object.defineProperty(exports, "claimAchievementReward", { enumerable: true, get: function () { return gamification_1.claimAchievementReward; } });
// Challenges
var gamification_2 = require("./gamification");
Object.defineProperty(exports, "createChallenge", { enumerable: true, get: function () { return gamification_2.createChallenge; } });
Object.defineProperty(exports, "joinChallenge", { enumerable: true, get: function () { return gamification_2.joinChallenge; } });
Object.defineProperty(exports, "updateChallengeProgress", { enumerable: true, get: function () { return gamification_2.updateChallengeProgress; } });
Object.defineProperty(exports, "getActiveChallenges", { enumerable: true, get: function () { return gamification_2.getActiveChallenges; } });
// Leaderboards
var gamification_3 = require("./gamification");
Object.defineProperty(exports, "getLeaderboard", { enumerable: true, get: function () { return gamification_3.getLeaderboard; } });
Object.defineProperty(exports, "updateLeaderboardRank", { enumerable: true, get: function () { return gamification_3.updateLeaderboardRank; } });
// Points & Rewards
var gamification_4 = require("./gamification");
Object.defineProperty(exports, "getUserPoints", { enumerable: true, get: function () { return gamification_4.getUserPoints; } });
Object.defineProperty(exports, "getPointsHistory", { enumerable: true, get: function () { return gamification_4.getPointsHistory; } });
Object.defineProperty(exports, "createReward", { enumerable: true, get: function () { return gamification_4.createReward; } });
Object.defineProperty(exports, "getAvailableRewards", { enumerable: true, get: function () { return gamification_4.getAvailableRewards; } });
Object.defineProperty(exports, "redeemReward", { enumerable: true, get: function () { return gamification_4.redeemReward; } });
// Streaks
var gamification_5 = require("./gamification");
Object.defineProperty(exports, "updateUserStreak", { enumerable: true, get: function () { return gamification_5.updateUserStreak; } });
Object.defineProperty(exports, "getUserStreak", { enumerable: true, get: function () { return gamification_5.getUserStreak; } });
// Badges
var gamification_6 = require("./gamification");
Object.defineProperty(exports, "createBadge", { enumerable: true, get: function () { return gamification_6.createBadge; } });
Object.defineProperty(exports, "awardBadge", { enumerable: true, get: function () { return gamification_6.awardBadge; } });
Object.defineProperty(exports, "getUserBadges", { enumerable: true, get: function () { return gamification_6.getUserBadges; } });
// ============================================
// LIVE EVENT DASHBOARD
// ============================================
// Dashboard Stats
var dashboard_1 = require("./dashboard");
Object.defineProperty(exports, "getDashboardStats", { enumerable: true, get: function () { return dashboard_1.getDashboardStats; } });
Object.defineProperty(exports, "getRecentBuyers", { enumerable: true, get: function () { return dashboard_1.getRecentBuyers; } });
Object.defineProperty(exports, "getPriceCountdown", { enumerable: true, get: function () { return dashboard_1.getPriceCountdown; } });
Object.defineProperty(exports, "getLiveActivity", { enumerable: true, get: function () { return dashboard_1.getLiveActivity; } });
Object.defineProperty(exports, "getCompleteDashboard", { enumerable: true, get: function () { return dashboard_1.getCompleteDashboard; } });
Object.defineProperty(exports, "updateDashboardConfig", { enumerable: true, get: function () { return dashboard_1.updateDashboardConfig; } });
// Auto-triggers
var dashboard_2 = require("./dashboard");
Object.defineProperty(exports, "onTicketPurchased", { enumerable: true, get: function () { return dashboard_2.onTicketPurchased; } });
// ============================================
// WAITLIST & DYNAMIC PRICING
// ============================================
// Waitlist Management
var waitlist_1 = require("./waitlist");
Object.defineProperty(exports, "joinWaitlist", { enumerable: true, get: function () { return waitlist_1.joinWaitlist; } });
Object.defineProperty(exports, "getWaitlistPosition", { enumerable: true, get: function () { return waitlist_1.getWaitlistPosition; } });
Object.defineProperty(exports, "cancelWaitlistEntry", { enumerable: true, get: function () { return waitlist_1.cancelWaitlistEntry; } });
Object.defineProperty(exports, "notifyWaitlist", { enumerable: true, get: function () { return waitlist_1.notifyWaitlist; } });
Object.defineProperty(exports, "getUserWaitlists", { enumerable: true, get: function () { return waitlist_1.getUserWaitlists; } });
// Dynamic Pricing
var waitlist_2 = require("./waitlist");
Object.defineProperty(exports, "configureDynamicPricing", { enumerable: true, get: function () { return waitlist_2.configureDynamicPricing; } });
Object.defineProperty(exports, "getPriceRecommendation", { enumerable: true, get: function () { return waitlist_2.getPriceRecommendation; } });
Object.defineProperty(exports, "applyPriceChange", { enumerable: true, get: function () { return waitlist_2.applyPriceChange; } });
Object.defineProperty(exports, "getPriceHistory", { enumerable: true, get: function () { return waitlist_2.getPriceHistory; } });
// Auto-triggers
var waitlist_3 = require("./waitlist");
Object.defineProperty(exports, "processAutoPricing", { enumerable: true, get: function () { return waitlist_3.processAutoPricing; } });
Object.defineProperty(exports, "onTicketCancelled", { enumerable: true, get: function () { return waitlist_3.onTicketCancelled; } });
//# sourceMappingURL=index.js.map