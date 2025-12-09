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
// SCHEDULED FUNCTIONS
// ============================================
// export { dailyReports } from './scheduled/dailyReports';
// export { cleanupOldData } from './scheduled/cleanupOldData';
