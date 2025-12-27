/**
 * EventsCV Cloud Functions
 *
 * This file exports all Cloud Functions for the EventsCV platform.
 * Functions are organized by domain/feature.
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();

// ============================================
// ADMIN FUNCTIONS
// ============================================
export { setSuperAdmin, initializeSuperAdmin } from './admin/setSuperAdmin';

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
export {
  activateWristband,
  processNFCPayment,
  topUpWristband,
  toggleWristbandBlock,
  transferWristbandBalance,
} from './nfc';

// ============================================
// NOTIFICATION FUNCTIONS
// ============================================
// export { sendPushNotification } from './notifications/sendPush';
// export { sendEmail } from './notifications/sendEmail';
// export { eventReminder } from './notifications/eventReminder';

// ============================================
// QR CODE & REGISTRATION FUNCTIONS
// ============================================
export { generateEventQRCode } from './qrcode/generateEventQRCode';
export { createGuestRegistration } from './registration/createGuestRegistration';

// ============================================
// ANALYTICS FUNCTIONS
// ============================================
export * as analytics from './analytics';

// ============================================
// SCHEDULED FUNCTIONS
// ============================================
// export { dailyReports } from './scheduled/dailyReports';
// export { cleanupOldData } from './scheduled/cleanupOldData';

// ============================================
// AI FUNCTIONS
// ============================================

// AI Chat Assistant (Lyra)
export { chat as lyraChat } from './ai/chat/lyra';

// AI Content Generation
export {
  generatePoster,
  setPosterAsCover,
} from './ai/generation/posterGenerator';

// AI Recommendations
export {
  getRecommendations,
  generateDailyRecommendations,
  createEventEmbedding,
} from './ai/recommendations/personalized';

// AI Analytics & Insights
export {
  generateInsights,
  autoGenerateInsights,
} from './ai/analytics/insights';

// ============================================
// TRANSLATION SERVICE FUNCTIONS
// ============================================

// Translation Session Management
export {
  startTranslationSession,
  endTranslationSession,
  updateSessionStatus,
  getTranslationSession,
  trackListener,
} from './translation/session';

// Audio Processing & Real-time Translation
export { processAudioChunk } from './translation/audioProcessor';

// Transcript Management
export {
  getSessionTranscript,
  downloadTranscript,
  editTranscriptSegment,
  searchTranscript,
} from './translation/transcript';

// Equipment Rental
export {
  checkEquipmentAvailability,
  calculateRentalPrice,
  createEquipmentRental,
  updateRentalStatus,
  onEquipmentRentalCreated,
} from './translation/equipment';

// ============================================
// EVENT CALENDARS & SUBSCRIBERS
// ============================================

// Calendar CRUD Operations
export {
  createCalendar,
  updateCalendar,
  deleteCalendar,
  getCalendar,
  getCalendarBySlug,
  listOrganizationCalendars,
} from './calendars';

// Subscription Management
export {
  subscribeToCalendar,
  unsubscribeFromCalendar,
  updateSubscriptionPreferences,
  getUserSubscriptions,
  getCalendarSubscribers,
  onCalendarEventCreated,
} from './calendars';

// ============================================
// EVENT CHAT SYSTEM
// ============================================

// Chat Room Management
export {
  createChatRoom,
  joinChatRoom,
  leaveChatRoom,
} from './chat';

// Message Management
export {
  sendChatMessage,
  editChatMessage,
  deleteChatMessage,
  reactToMessage,
  flagMessage,
} from './chat';

// Moderation
export {
  muteUser,
  unmuteUser,
  onEventPublished,
} from './chat';

// ============================================
// EVENT BLASTS - MULTI-CHANNEL MESSAGING
// ============================================

// Blast Management
export {
  calculateBlastRecipients,
  createBlast,
  sendBlast,
  cancelBlast,
  getBlastStatus,
  sendTestBlast,
  getEventBlasts,
} from './blasts';

// Scheduled Blast Processing
export {
  processScheduledBlasts,
} from './blasts';

// ============================================
// GAMIFICATION SYSTEM
// ============================================

// Achievements
export {
  createAchievement,
  getUserAchievements,
  unlockAchievement,
  claimAchievementReward,
} from './gamification';

// Challenges
export {
  createChallenge,
  joinChallenge,
  updateChallengeProgress,
  getActiveChallenges,
} from './gamification';

// Leaderboards
export {
  getLeaderboard,
  updateLeaderboardRank,
} from './gamification';

// Points & Rewards
export {
  getUserPoints,
  getPointsHistory,
  createReward,
  getAvailableRewards,
  redeemReward,
} from './gamification';

// Streaks
export {
  updateUserStreak,
  getUserStreak,
} from './gamification';

// Badges
export {
  createBadge,
  awardBadge,
  getUserBadges,
} from './gamification';

// ============================================
// LIVE EVENT DASHBOARD
// ============================================

// Dashboard Stats
export {
  getDashboardStats,
  getRecentBuyers,
  getPriceCountdown,
  getLiveActivity,
  getCompleteDashboard,
  updateDashboardConfig,
} from './dashboard';

// Auto-triggers
export {
  onTicketPurchased,
} from './dashboard';
