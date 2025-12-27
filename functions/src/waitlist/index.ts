/**
 * Waitlist & Dynamic Pricing System
 * Waitlist management and intelligent pricing
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import type {
  WaitlistEntry,
  WaitlistNotification,
  WaitlistStatus,
  DynamicPricingConfig,
  PriceHistory,
  PriceRecommendation,
  PricingTrigger,
} from '../shared-types/waitlist';

const db = getFirestore();

// ============================================
// WAITLIST MANAGEMENT
// ============================================

/**
 * Join event waitlist
 */
export const joinWaitlist = onCall<{
  eventId: string;
  ticketTypeId?: string;
  quantity: number;
  maxPrice?: number;
  autoConvert?: boolean;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const {
    eventId,
    ticketTypeId,
    quantity,
    maxPrice,
    autoConvert = false,
    emailNotifications = true,
    smsNotifications = false,
  } = request.data;

  // Get event
  const eventDoc = await db.collection('events').doc(eventId).get();

  if (!eventDoc.exists) {
    throw new HttpsError('not-found', 'Event not found');
  }

  // Get user info
  const userDoc = await db.collection('users').doc(userId).get();
  const user = userDoc.data();

  // Check if user already on waitlist
  const existingEntry = await db
    .collection('waitlist-entries')
    .where('eventId', '==', eventId)
    .where('userId', '==', userId)
    .where('status', '==', 'active')
    .limit(1)
    .get();

  if (!existingEntry.empty) {
    const existing = existingEntry.docs[0].data();
    return {
      waitlistId: existingEntry.docs[0].id,
      position: existing.position,
      estimatedWaitTime: 'Already on waitlist',
    };
  }

  // Calculate position (count active entries)
  const activeEntries = await db
    .collection('waitlist-entries')
    .where('eventId', '==', eventId)
    .where('status', '==', 'active')
    .count()
    .get();

  const position = activeEntries.data().count + 1;

  // Create waitlist entry
  const waitlistData: Partial<WaitlistEntry> = {
    eventId,
    ticketTypeId,
    userId,
    userEmail: user?.email || '',
    userName: user?.displayName || user?.email || 'User',
    userPhone: user?.phone,
    status: 'active',
    priority: 'normal',
    position,
    quantity,
    maxPrice,
    autoConvert,
    emailNotifications,
    smsNotifications,
    pushNotifications: true,
    notificationsSent: 0,
    createdAt: FieldValue.serverTimestamp() as any,
  };

  const waitlistRef = await db.collection('waitlist-entries').add(waitlistData);

  return {
    waitlistId: waitlistRef.id,
    position,
    estimatedWaitTime: 'Will notify when tickets available',
  };
});

/**
 * Get waitlist position
 */
export const getWaitlistPosition = onCall<{
  waitlistId: string;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { waitlistId } = request.data;

  const waitlistDoc = await db.collection('waitlist-entries').doc(waitlistId).get();

  if (!waitlistDoc.exists) {
    throw new HttpsError('not-found', 'Waitlist entry not found');
  }

  const entry = waitlistDoc.data() as WaitlistEntry;

  if (entry.userId !== userId) {
    throw new HttpsError('permission-denied', 'Access denied');
  }

  // Count total in queue
  const totalInQueue = await db
    .collection('waitlist-entries')
    .where('eventId', '==', entry.eventId)
    .where('status', '==', 'active')
    .count()
    .get();

  return {
    position: entry.position,
    totalInQueue: totalInQueue.data().count,
    estimatedWaitTime: 'Will notify when tickets available',
  };
});

/**
 * Cancel waitlist entry
 */
export const cancelWaitlistEntry = onCall<{
  waitlistId: string;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { waitlistId } = request.data;

  const waitlistDoc = await db.collection('waitlist-entries').doc(waitlistId).get();

  if (!waitlistDoc.exists) {
    throw new HttpsError('not-found', 'Waitlist entry not found');
  }

  const entry = waitlistDoc.data() as WaitlistEntry;

  if (entry.userId !== userId) {
    throw new HttpsError('permission-denied', 'Access denied');
  }

  await waitlistDoc.ref.update({
    status: 'cancelled' as WaitlistStatus,
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Update positions for entries behind this one
  const entriesBehind = await db
    .collection('waitlist-entries')
    .where('eventId', '==', entry.eventId)
    .where('position', '>', entry.position)
    .where('status', '==', 'active')
    .get();

  const batch = db.batch();
  entriesBehind.docs.forEach((doc) => {
    batch.update(doc.ref, {
      position: FieldValue.increment(-1),
    });
  });
  await batch.commit();

  return { success: true };
});

/**
 * Notify waitlist when tickets available
 */
export const notifyWaitlist = onCall<{
  eventId: string;
  ticketTypeId?: string;
  ticketsAvailable: number;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { eventId, ticketTypeId, ticketsAvailable } = request.data;

  // Verify event ownership
  const eventDoc = await db.collection('events').doc(eventId).get();

  if (!eventDoc.exists) {
    throw new HttpsError('not-found', 'Event not found');
  }

  const event = eventDoc.data();

  if (event?.createdBy !== userId) {
    throw new HttpsError('permission-denied', 'Only event organizers can notify waitlist');
  }

  // Get waitlist entries (ordered by priority and position)
  let query = db
    .collection('waitlist-entries')
    .where('eventId', '==', eventId)
    .where('status', '==', 'active');

  if (ticketTypeId) {
    query = query.where('ticketTypeId', '==', ticketTypeId) as any;
  }

  const waitlistSnapshot = await query.orderBy('priority', 'desc').orderBy('position', 'asc').limit(ticketsAvailable).get();

  const notifications: string[] = [];

  for (const entryDoc of waitlistSnapshot.docs) {
    const entry = entryDoc.data() as WaitlistEntry;

    // Create notification
    const notificationData: Partial<WaitlistNotification> = {
      waitlistEntryId: entryDoc.id,
      eventId,
      userId: entry.userId,
      type: 'availability',
      channel: 'email', // Will send to all enabled channels
      message: `Tickets are now available for ${event?.title}!`,
      ticketsAvailable,
      currentPrice: event?.ticketTypes?.find((t: any) => t.id === ticketTypeId)?.price,
      expiresIn: 24 * 60 * 60 * 1000, // 24 hours
      sentAt: FieldValue.serverTimestamp() as any,
      status: 'sent',
    };

    const notificationRef = await db.collection('waitlist-notifications').add(notificationData);
    notifications.push(notificationRef.id);

    // Update waitlist entry
    await entryDoc.ref.update({
      status: 'notified' as WaitlistStatus,
      notifiedAt: FieldValue.serverTimestamp(),
      notificationsSent: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // In production, send actual email/SMS/push here
  }

  return {
    notified: notifications.length,
    notifications,
  };
});

/**
 * Get user's waitlist entries
 */
export const getUserWaitlists = onCall(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const waitlistSnapshot = await db
    .collection('waitlist-entries')
    .where('userId', '==', userId)
    .where('status', 'in', ['active', 'notified'])
    .orderBy('createdAt', 'desc')
    .get();

  const waitlists = [];

  for (const doc of waitlistSnapshot.docs) {
    const entry = doc.data();
    const eventDoc = await db.collection('events').doc(entry.eventId).get();

    waitlists.push({
      ...entry,
      id: doc.id,
      event: eventDoc.data(),
    });
  }

  return { waitlists };
});

// ============================================
// DYNAMIC PRICING
// ============================================

/**
 * Configure dynamic pricing
 */
export const configureDynamicPricing = onCall<{
  eventId: string;
  ticketTypeId: string;
  config: Partial<DynamicPricingConfig>;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { eventId, ticketTypeId, config } = request.data;

  // Verify event ownership
  const eventDoc = await db.collection('events').doc(eventId).get();

  if (!eventDoc.exists) {
    throw new HttpsError('not-found', 'Event not found');
  }

  const event = eventDoc.data();

  if (event?.createdBy !== userId) {
    throw new HttpsError('permission-denied', 'Only event organizers can configure pricing');
  }

  // Create or update pricing config
  const configId = `${eventId}_${ticketTypeId}`;

  const pricingData: Partial<DynamicPricingConfig> = {
    ...config,
    eventId,
    ticketTypeId,
    updatedAt: FieldValue.serverTimestamp() as any,
  };

  if (!config.createdAt) {
    pricingData.createdBy = userId;
    pricingData.createdAt = FieldValue.serverTimestamp() as any;
  }

  await db.collection('dynamic-pricing-configs').doc(configId).set(pricingData, { merge: true });

  return {
    configId,
    success: true,
  };
});

/**
 * Get price recommendation
 */
export const getPriceRecommendation = onCall<{
  eventId: string;
  ticketTypeId: string;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { eventId, ticketTypeId } = request.data;

  // Verify event ownership
  const eventDoc = await db.collection('events').doc(eventId).get();

  if (!eventDoc.exists) {
    throw new HttpsError('not-found', 'Event not found');
  }

  const event = eventDoc.data();

  if (event?.createdBy !== userId) {
    throw new HttpsError('permission-denied', 'Access denied');
  }

  // Get current pricing and sales data
  const ticketType = event?.ticketTypes?.find((t: any) => t.id === ticketTypeId);

  if (!ticketType) {
    throw new HttpsError('not-found', 'Ticket type not found');
  }

  const currentPrice = ticketType.price || 0;

  // Get sales data
  const ticketsSnapshot = await db
    .collection('tickets')
    .where('eventId', '==', eventId)
    .where('ticketTypeId', '==', ticketTypeId)
    .get();

  const currentSales = ticketsSnapshot.size;
  const capacity = ticketType.quantity || 0;
  const capacityPercentage = capacity > 0 ? (currentSales / capacity) * 100 : 0;

  // Calculate sales velocity (last 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentSales = ticketsSnapshot.docs.filter(
    (doc) => doc.data().purchasedAt && new Date(doc.data().purchasedAt) >= oneDayAgo
  ).length;
  const currentVelocity = recentSales / 24; // tickets per hour

  // Simple recommendation algorithm
  let recommendedPrice = currentPrice;
  const factors: { factor: string; weight: number; impact: 'increase' | 'decrease' | 'neutral' }[] = [];
  const reasons: string[] = [];

  // Factor 1: Capacity
  if (capacityPercentage > 80) {
    recommendedPrice *= 1.2; // Increase 20%
    factors.push({ factor: 'High capacity usage', weight: 0.4, impact: 'increase' });
    reasons.push('More than 80% sold - demand is high');
  } else if (capacityPercentage < 30) {
    recommendedPrice *= 0.9; // Decrease 10%
    factors.push({ factor: 'Low capacity usage', weight: 0.3, impact: 'decrease' });
    reasons.push('Less than 30% sold - consider lowering price');
  }

  // Factor 2: Sales velocity
  if (currentVelocity > 10) {
    recommendedPrice *= 1.15; // Increase 15%
    factors.push({ factor: 'High sales velocity', weight: 0.3, impact: 'increase' });
    reasons.push('High sales velocity - can increase price');
  } else if (currentVelocity < 2) {
    recommendedPrice *= 0.95; // Decrease 5%
    factors.push({ factor: 'Low sales velocity', weight: 0.2, impact: 'decrease' });
    reasons.push('Low sales velocity - consider promotion');
  }

  // Factor 3: Time to event
  const eventDate = event?.startDate ? new Date(event.startDate) : new Date();
  const daysUntilEvent = (eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);

  if (daysUntilEvent < 7) {
    recommendedPrice *= 1.1; // Increase 10%
    factors.push({ factor: 'Event approaching', weight: 0.2, impact: 'increase' });
    reasons.push('Event is less than a week away');
  }

  // Round to 2 decimals
  recommendedPrice = Math.round(recommendedPrice * 100) / 100;

  const priceChange = ((recommendedPrice - currentPrice) / currentPrice) * 100;
  const confidence = Math.min(95, 50 + Math.abs(priceChange) * 2); // Higher change = higher confidence

  const recommendation: PriceRecommendation = {
    eventId,
    ticketTypeId,
    currentPrice,
    currentSales,
    currentVelocity,
    recommendedPrice,
    confidence,
    expectedImpact: {
      salesIncrease: priceChange < 0 ? Math.abs(priceChange) * 0.5 : -priceChange * 0.3,
      revenueIncrease: priceChange,
    },
    factors,
    reasons,
    generatedAt: FieldValue.serverTimestamp() as any,
  };

  return { recommendation };
});

/**
 * Apply price change
 */
export const applyPriceChange = onCall<{
  eventId: string;
  ticketTypeId: string;
  newPrice: number;
  reason?: string;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { eventId, ticketTypeId, newPrice, reason = 'Manual adjustment' } = request.data;

  // Verify event ownership
  const eventDoc = await db.collection('events').doc(eventId).get();

  if (!eventDoc.exists) {
    throw new HttpsError('not-found', 'Event not found');
  }

  const event = eventDoc.data();

  if (event?.createdBy !== userId) {
    throw new HttpsError('permission-denied', 'Only event organizers can change prices');
  }

  // Get current ticket type
  const ticketTypes = event?.ticketTypes || [];
  const ticketTypeIndex = ticketTypes.findIndex((t: any) => t.id === ticketTypeId);

  if (ticketTypeIndex === -1) {
    throw new HttpsError('not-found', 'Ticket type not found');
  }

  const oldPrice = ticketTypes[ticketTypeIndex].price || 0;

  // Update ticket type price
  ticketTypes[ticketTypeIndex].price = newPrice;

  await eventDoc.ref.update({
    ticketTypes,
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Record price history
  const historyData: Partial<PriceHistory> = {
    eventId,
    ticketTypeId,
    oldPrice,
    newPrice,
    changePercentage: ((newPrice - oldPrice) / oldPrice) * 100,
    changeAmount: newPrice - oldPrice,
    trigger: 'manual' as PricingTrigger,
    reason,
    changedBy: userId,
    changedAt: FieldValue.serverTimestamp() as any,
    automatic: false,
  };

  await db.collection('price-history').add(historyData);

  return {
    success: true,
    oldPrice,
    newPrice,
    affectedTickets: 0, // Only affects future tickets
  };
});

/**
 * Get price history
 */
export const getPriceHistory = onCall<{
  eventId: string;
  ticketTypeId?: string;
  limit?: number;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { eventId, ticketTypeId, limit = 50 } = request.data;

  // Verify event ownership
  const eventDoc = await db.collection('events').doc(eventId).get();

  if (!eventDoc.exists) {
    throw new HttpsError('not-found', 'Event not found');
  }

  const event = eventDoc.data();

  if (event?.createdBy !== userId) {
    throw new HttpsError('permission-denied', 'Access denied');
  }

  let query = db.collection('price-history').where('eventId', '==', eventId);

  if (ticketTypeId) {
    query = query.where('ticketTypeId', '==', ticketTypeId) as any;
  }

  const historySnapshot = await query.orderBy('changedAt', 'desc').limit(limit).get();

  const history = historySnapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as PriceHistory[];

  return { history };
});

// ============================================
// AUTO-TRIGGERS - DYNAMIC PRICING
// ============================================

/**
 * Auto-adjust prices based on demand
 */
export const processAutoPricing = onSchedule('every 30 minutes', async (event) => {
  console.log('Processing automatic price adjustments...');

  // Get all active pricing configs with auto-adjust enabled
  const configsSnapshot = await db
    .collection('dynamic-pricing-configs')
    .where('autoAdjust', '==', true)
    .where('isActive', '==', true)
    .get();

  for (const configDoc of configsSnapshot.docs) {
    const config = configDoc.data() as DynamicPricingConfig;

    try {
      // Get event and ticket data
      const eventDoc = await db.collection('events').doc(config.eventId).get();
      if (!eventDoc.exists) continue;

      const event = eventDoc.data();
      const ticketType = event?.ticketTypes?.find((t: any) => t.id === config.ticketTypeId);
      if (!ticketType) continue;

      const currentPrice = ticketType.price || config.basePrice;

      // Calculate new price based on strategy
      let newPrice = currentPrice;

      if (config.strategy === 'dynamic' && config.demandBased?.enabled) {
        // Get sales data
        const ticketsSnapshot = await db
          .collection('tickets')
          .where('eventId', '==', config.eventId)
          .where('ticketTypeId', '==', config.ticketTypeId)
          .get();

        const sold = ticketsSnapshot.size;
        const capacity = ticketType.quantity || 0;
        const capacityPercentage = capacity > 0 ? (sold / capacity) * 100 : 0;

        // Adjust price based on capacity
        if (capacityPercentage > 80) {
          newPrice = Math.min(currentPrice * 1.1, config.maxPrice);
        } else if (capacityPercentage < 30) {
          newPrice = Math.max(currentPrice * 0.95, config.minPrice);
        }
      }

      // Apply price change if different
      if (Math.abs(newPrice - currentPrice) > 0.01) {
        const ticketTypes = event?.ticketTypes || [];
        const index = ticketTypes.findIndex((t: any) => t.id === config.ticketTypeId);
        ticketTypes[index].price = newPrice;

        await eventDoc.ref.update({
          ticketTypes,
          updatedAt: FieldValue.serverTimestamp(),
        });

        // Record in history
        await db.collection('price-history').add({
          eventId: config.eventId,
          ticketTypeId: config.ticketTypeId,
          oldPrice: currentPrice,
          newPrice,
          changePercentage: ((newPrice - currentPrice) / currentPrice) * 100,
          changeAmount: newPrice - currentPrice,
          trigger: 'demand_based' as PricingTrigger,
          reason: 'Automatic demand-based adjustment',
          changedAt: FieldValue.serverTimestamp(),
          automatic: true,
        });

        console.log(`Auto-adjusted price for ${config.eventId}/${config.ticketTypeId}: ${currentPrice} -> ${newPrice}`);
      }
    } catch (error) {
      console.error(`Error processing pricing for ${config.eventId}:`, error);
    }
  }
});

/**
 * Auto-notify waitlist when tickets released
 */
export const onTicketCancelled = onDocumentWritten('tickets/{ticketId}', async (event) => {
  const ticketData = event.data?.before?.data();
  const newData = event.data?.after?.data();

  // Check if ticket was cancelled (had data before, now doesn't or status changed)
  if (!ticketData || newData) {
    return; // Not a cancellation
  }

  const eventId = ticketData.eventId;

  // Check if there's a waitlist
  const waitlistCount = await db
    .collection('waitlist-entries')
    .where('eventId', '==', eventId)
    .where('status', '==', 'active')
    .count()
    .get();

  if (waitlistCount.data().count === 0) {
    return; // No waitlist
  }

  // Notify first person on waitlist
  const waitlistSnapshot = await db
    .collection('waitlist-entries')
    .where('eventId', '==', eventId)
    .where('status', '==', 'active')
    .orderBy('priority', 'desc')
    .orderBy('position', 'asc')
    .limit(1)
    .get();

  if (!waitlistSnapshot.empty) {
    const entry = waitlistSnapshot.docs[0].data() as WaitlistEntry;

    // Create notification
    await db.collection('waitlist-notifications').add({
      waitlistEntryId: waitlistSnapshot.docs[0].id,
      eventId,
      userId: entry.userId,
      type: 'availability',
      channel: 'email',
      message: 'A ticket just became available!',
      ticketsAvailable: 1,
      expiresIn: 2 * 60 * 60 * 1000, // 2 hours
      sentAt: FieldValue.serverTimestamp(),
      status: 'sent',
    });

    // Update entry
    await waitlistSnapshot.docs[0].ref.update({
      status: 'notified' as WaitlistStatus,
      notifiedAt: FieldValue.serverTimestamp(),
      notificationsSent: FieldValue.increment(1),
    });
  }
});
