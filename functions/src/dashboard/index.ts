/**
 * Live Event Dashboard
 * Real-time event analytics and metrics
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import type {
  EventDashboardStats,
  RecentBuyer,
  PriceCountdown,
  LiveActivityItem,
  LiveEventDashboard,
  DashboardConfig,
} from '../shared-types/dashboard';

const db = getFirestore();

// ============================================
// DASHBOARD STATISTICS
// ============================================

/**
 * Get real-time dashboard statistics
 */
export const getDashboardStats = onCall<{
  eventId: string;
  includeProjections?: boolean;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { eventId, includeProjections = false } = request.data;

  // Verify event exists and user has access
  const eventDoc = await db.collection('events').doc(eventId).get();

  if (!eventDoc.exists) {
    throw new HttpsError('not-found', 'Event not found');
  }

  const event = eventDoc.data();

  if (event?.createdBy !== userId) {
    throw new HttpsError('permission-denied', 'Only event organizers can view dashboard');
  }

  // Get all tickets for this event
  const ticketsSnapshot = await db
    .collection('tickets')
    .where('eventId', '==', eventId)
    .where('status', 'in', ['valid', 'active'])
    .get();

  const tickets = ticketsSnapshot.docs.map((doc) => doc.data());

  // Calculate basic metrics
  const totalTicketsSold = tickets.length;
  const totalRevenue = tickets.reduce((sum, ticket) => sum + (ticket.price || 0), 0);

  // Get event capacity
  const ticketTypes = event?.ticketTypes || [];
  const totalCapacity = ticketTypes.reduce((sum: number, type: any) => sum + (type.quantity || 0), 0);

  const capacityUsed = totalTicketsSold;
  const capacityPercentage = totalCapacity > 0 ? (capacityUsed / totalCapacity) * 100 : 0;
  const ticketsRemaining = totalCapacity - capacityUsed;

  // Calculate time-based metrics
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const salesLast1Hour = tickets.filter(
    (t) => t.purchasedAt && new Date(t.purchasedAt) >= oneHourAgo
  ).length;

  const salesLast24Hours = tickets.filter(
    (t) => t.purchasedAt && new Date(t.purchasedAt) >= oneDayAgo
  ).length;

  const salesLast7Days = tickets.filter(
    (t) => t.purchasedAt && new Date(t.purchasedAt) >= sevenDaysAgo
  ).length;

  const revenueLast1Hour = tickets
    .filter((t) => t.purchasedAt && new Date(t.purchasedAt) >= oneHourAgo)
    .reduce((sum, t) => sum + (t.price || 0), 0);

  const revenueLast24Hours = tickets
    .filter((t) => t.purchasedAt && new Date(t.purchasedAt) >= oneDayAgo)
    .reduce((sum, t) => sum + (t.price || 0), 0);

  const revenueLast7Days = tickets
    .filter((t) => t.purchasedAt && new Date(t.purchasedAt) >= sevenDaysAgo)
    .reduce((sum, t) => sum + (t.price || 0), 0);

  // Calculate average sales per hour
  const eventCreatedAt = event?.createdAt ? new Date(event.createdAt) : sevenDaysAgo;
  const hoursActive = Math.max(1, (now.getTime() - eventCreatedAt.getTime()) / (1000 * 60 * 60));
  const averageSalesPerHour = totalTicketsSold / hoursActive;

  // Ticket type breakdown
  const ticketTypeBreakdown = ticketTypes.map((type: any) => {
    const soldTickets = tickets.filter((t) => t.ticketTypeId === type.id);
    return {
      ticketTypeId: type.id,
      ticketTypeName: type.name,
      sold: soldTickets.length,
      capacity: type.quantity || 0,
      revenue: soldTickets.reduce((sum, t) => sum + (t.price || 0), 0),
    };
  });

  // Find peak sales hour (optional, basic implementation)
  let peakSalesHour: { hour: number; ticketsSold: number } | undefined;

  // Projections (if requested)
  let projectedSelloutTime: Date | undefined;
  let estimatedFinalSales: number | undefined;

  if (includeProjections && averageSalesPerHour > 0 && ticketsRemaining > 0) {
    const hoursToSellout = ticketsRemaining / averageSalesPerHour;
    projectedSelloutTime = new Date(now.getTime() + hoursToSellout * 60 * 60 * 1000);
    estimatedFinalSales = totalCapacity;
  }

  const stats: EventDashboardStats = {
    eventId,
    totalTicketsSold,
    totalRevenue,
    currency: event?.currency || 'EUR',
    totalCapacity,
    capacityUsed,
    capacityPercentage,
    ticketsRemaining,
    salesLast1Hour,
    salesLast24Hours,
    salesLast7Days,
    averageSalesPerHour,
    revenueLast1Hour,
    revenueLast24Hours,
    revenueLast7Days,
    ticketTypeBreakdown,
    peakSalesHour,
    projectedSelloutTime,
    estimatedFinalSales,
    lastUpdated: FieldValue.serverTimestamp() as any,
  };

  return { stats };
});

// ============================================
// RECENT BUYERS
// ============================================

/**
 * Get recent buyer activity
 */
export const getRecentBuyers = onCall<{
  eventId: string;
  limit?: number;
  anonymize?: boolean;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { eventId, limit = 10, anonymize = true } = request.data;

  // Verify event exists and user has access
  const eventDoc = await db.collection('events').doc(eventId).get();

  if (!eventDoc.exists) {
    throw new HttpsError('not-found', 'Event not found');
  }

  const event = eventDoc.data();

  if (event?.createdBy !== userId) {
    throw new HttpsError('permission-denied', 'Only event organizers can view buyers');
  }

  // Get recent tickets
  const ticketsSnapshot = await db
    .collection('tickets')
    .where('eventId', '==', eventId)
    .orderBy('purchasedAt', 'desc')
    .limit(limit)
    .get();

  const buyers: RecentBuyer[] = [];

  for (const ticketDoc of ticketsSnapshot.docs) {
    const ticket = ticketDoc.data();

    // Anonymize name if requested
    let buyerName = ticket.buyerName;
    if (anonymize && buyerName) {
      const nameParts = buyerName.split(' ');
      buyerName = nameParts[0] + (nameParts.length > 1 ? ' ' + nameParts[1][0] + '.' : '');
    }

    buyers.push({
      id: ticketDoc.id,
      eventId,
      buyerName,
      buyerCity: ticket.buyerCity,
      buyerCountry: ticket.buyerCountry || 'CV',
      ticketCount: 1, // Each ticket doc represents 1 ticket
      ticketType: ticket.ticketTypeName || 'General',
      amount: ticket.price || 0,
      currency: event?.currency || 'EUR',
      purchasedAt: ticket.purchasedAt,
      showName: !anonymize,
      showLocation: true,
    });
  }

  return { buyers };
});

// ============================================
// PRICE COUNTDOWN
// ============================================

/**
 * Get price countdown information
 */
export const getPriceCountdown = onCall<{
  eventId: string;
  ticketTypeId?: string;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { eventId, ticketTypeId } = request.data;

  // Get event
  const eventDoc = await db.collection('events').doc(eventId).get();

  if (!eventDoc.exists) {
    throw new HttpsError('not-found', 'Event not found');
  }

  const event = eventDoc.data();

  // Find ticket type
  const ticketTypes = event?.ticketTypes || [];
  const ticketType = ticketTypeId
    ? ticketTypes.find((t: any) => t.id === ticketTypeId)
    : ticketTypes[0];

  if (!ticketType) {
    throw new HttpsError('not-found', 'Ticket type not found');
  }

  const currentPrice = ticketType.price || 0;
  const currency = event?.currency || 'EUR';

  // Check if there are tiered prices
  let nextPrice: number | undefined;
  let nextPriceChange: Date | undefined;
  let priceIncreasePercentage: number | undefined;

  if (ticketType.tiers && ticketType.tiers.length > 0) {
    // Find current tier
    const soldCount = await db
      .collection('tickets')
      .where('eventId', '==', eventId)
      .where('ticketTypeId', '==', ticketType.id)
      .count()
      .get();

    const sold = soldCount.data().count;

    // Find next tier
    const nextTier = ticketType.tiers.find(
      (t: any) => t.startQuantity > sold
    );

    if (nextTier && nextTier.price && nextTier.price > currentPrice) {
      nextPrice = nextTier.price;
      priceIncreasePercentage = ((nextTier.price - currentPrice) / currentPrice) * 100;
    }
  }

  // Calculate urgency
  const ticketsSnapshot = await db
    .collection('tickets')
    .where('eventId', '==', eventId)
    .where('ticketTypeId', '==', ticketType.id)
    .count()
    .get();

  const sold = ticketsSnapshot.data().count;
  const capacity = ticketType.quantity || 0;
  const remaining = capacity - sold;
  const capacityPercentage = capacity > 0 ? (sold / capacity) * 100 : 0;

  let urgencyLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  let urgencyMessage = 'Tickets available';

  if (capacityPercentage >= 95) {
    urgencyLevel = 'critical';
    urgencyMessage = `Only ${remaining} tickets left!`;
  } else if (capacityPercentage >= 80) {
    urgencyLevel = 'high';
    urgencyMessage = `Hurry! ${remaining} tickets remaining`;
  } else if (capacityPercentage >= 50) {
    urgencyLevel = 'medium';
    urgencyMessage = `${Math.round(capacityPercentage)}% sold`;
  }

  const countdown: PriceCountdown = {
    eventId,
    currentPrice,
    currency,
    nextPrice,
    nextPriceChange,
    priceIncreasePercentage,
    urgencyLevel,
    urgencyMessage,
    ticketsRemainingAtCurrentPrice: remaining,
    isDynamicPricing: !!ticketType.tiers,
  };

  return { countdown };
});

// ============================================
// LIVE ACTIVITY FEED
// ============================================

/**
 * Get live activity feed
 */
export const getLiveActivity = onCall<{
  eventId: string;
  limit?: number;
  since?: Date;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { eventId, limit = 20, since } = request.data;

  // Verify event access
  const eventDoc = await db.collection('events').doc(eventId).get();

  if (!eventDoc.exists) {
    throw new HttpsError('not-found', 'Event not found');
  }

  const event = eventDoc.data();

  if (event?.createdBy !== userId) {
    throw new HttpsError('permission-denied', 'Access denied');
  }

  // Get activity items
  let query = db
    .collection('dashboard-activity')
    .where('eventId', '==', eventId)
    .orderBy('timestamp', 'desc')
    .limit(limit);

  if (since) {
    query = query.where('timestamp', '>', since) as any;
  }

  const activitySnapshot = await query.get();

  const activity = activitySnapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as LiveActivityItem[];

  return { activity };
});

/**
 * Get complete dashboard
 */
export const getCompleteDashboard = onCall<{
  eventId: string;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { eventId } = request.data;

  // Verify event access
  const eventDoc = await db.collection('events').doc(eventId).get();

  if (!eventDoc.exists) {
    throw new HttpsError('not-found', 'Event not found');
  }

  const event = eventDoc.data();

  if (event?.createdBy !== userId) {
    throw new HttpsError('permission-denied', 'Access denied');
  }

  // Get all tickets for stats calculation
  const ticketsSnapshot = await db
    .collection('tickets')
    .where('eventId', '==', eventId)
    .where('status', 'in', ['valid', 'active'])
    .get();

  const tickets = ticketsSnapshot.docs.map((doc) => doc.data());

  // Calculate stats inline
  const totalTicketsSold = tickets.length;
  const totalRevenue = tickets.reduce((sum, ticket) => sum + (ticket.price || 0), 0);

  const ticketTypes = event?.ticketTypes || [];
  const totalCapacity = ticketTypes.reduce((sum: number, type: any) => sum + (type.quantity || 0), 0);

  const stats: EventDashboardStats = {
    eventId,
    totalTicketsSold,
    totalRevenue,
    currency: event?.currency || 'EUR',
    totalCapacity,
    capacityUsed: totalTicketsSold,
    capacityPercentage: totalCapacity > 0 ? (totalTicketsSold / totalCapacity) * 100 : 0,
    ticketsRemaining: totalCapacity - totalTicketsSold,
    salesLast1Hour: 0,
    salesLast24Hours: 0,
    salesLast7Days: 0,
    averageSalesPerHour: 0,
    revenueLast1Hour: 0,
    revenueLast24Hours: 0,
    revenueLast7Days: 0,
    ticketTypeBreakdown: [],
    lastUpdated: FieldValue.serverTimestamp() as any,
  };

  // Get recent buyers inline
  const recentTicketsSnapshot = await db
    .collection('tickets')
    .where('eventId', '==', eventId)
    .orderBy('purchasedAt', 'desc')
    .limit(10)
    .get();

  const recentBuyers: RecentBuyer[] = recentTicketsSnapshot.docs.map((ticketDoc) => {
    const ticket = ticketDoc.data();
    let buyerName = ticket.buyerName || 'Someone';
    const nameParts = buyerName.split(' ');
    buyerName = nameParts[0] + (nameParts.length > 1 ? ' ' + nameParts[1][0] + '.' : '');

    return {
      id: ticketDoc.id,
      eventId,
      buyerName,
      buyerCity: ticket.buyerCity,
      buyerCountry: ticket.buyerCountry || 'CV',
      ticketCount: 1,
      ticketType: ticket.ticketTypeName || 'General',
      amount: ticket.price || 0,
      currency: event?.currency || 'EUR',
      purchasedAt: ticket.purchasedAt,
      showName: true,
      showLocation: true,
    };
  });

  // Get activity feed
  const activitySnapshot = await db
    .collection('dashboard-activity')
    .where('eventId', '==', eventId)
    .orderBy('timestamp', 'desc')
    .limit(20)
    .get();

  const liveActivity = activitySnapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as LiveActivityItem[];

  // Get dashboard config
  const configDoc = await db.collection('dashboard-configs').doc(eventId).get();
  const config: DashboardConfig = configDoc.exists
    ? (configDoc.data() as DashboardConfig)
    : {
        eventId,
        showRecentBuyers: true,
        showSalesCounter: true,
        showCapacityBar: true,
        showPriceCountdown: true,
        showLiveActivity: true,
        anonymizeBuyerNames: true,
        showBuyerLocations: true,
        updateInterval: 30,
        urgencyThresholds: {
          highCapacity: 80,
          criticalCapacity: 95,
          lowTicketsRemaining: 10,
        },
        autoRefresh: true,
      };

  // Construct complete dashboard
  const dashboard: LiveEventDashboard = {
    eventId,
    stats,
    recentBuyers,
    liveActivity,
    salesTrend: [],
    config,
    lastUpdated: FieldValue.serverTimestamp() as any,
  };

  return { dashboard };
});

/**
 * Update dashboard configuration
 */
export const updateDashboardConfig = onCall<{
  eventId: string;
  config: Partial<DashboardConfig>;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { eventId, config } = request.data;

  // Verify event ownership
  const eventDoc = await db.collection('events').doc(eventId).get();

  if (!eventDoc.exists) {
    throw new HttpsError('not-found', 'Event not found');
  }

  const event = eventDoc.data();

  if (event?.createdBy !== userId) {
    throw new HttpsError('permission-denied', 'Only event organizers can update config');
  }

  // Update config
  await db
    .collection('dashboard-configs')
    .doc(eventId)
    .set(
      {
        ...config,
        eventId,
      },
      { merge: true }
    );

  return { success: true };
});

// ============================================
// TRIGGERS - AUTO-UPDATE ACTIVITY FEED
// ============================================

/**
 * Create activity item when ticket is purchased
 */
export const onTicketPurchased = onDocumentWritten('tickets/{ticketId}', async (event) => {
  const ticketData = event.data?.after?.data();
  const previousData = event.data?.before?.data();

  // Only trigger on new tickets
  if (!ticketData || previousData) {
    return;
  }

  const eventId = ticketData.eventId;

  // Anonymize buyer name
  let buyerName = ticketData.buyerName || 'Someone';
  const nameParts = buyerName.split(' ');
  buyerName = nameParts[0] + (nameParts.length > 1 ? ' ' + nameParts[1][0] + '.' : '');

  // Create activity item
  const activityItem: Partial<LiveActivityItem> = {
    eventId,
    type: 'purchase',
    message: `${buyerName} just bought ${ticketData.ticketTypeName || 'a ticket'}`,
    icon: '🎟️',
    data: {
      ticketCount: 1,
      amount: ticketData.price,
      location: ticketData.buyerCity,
    },
    timestamp: FieldValue.serverTimestamp() as any,
    priority: 'medium',
    showDuration: 5000,
  };

  await db.collection('dashboard-activity').add(activityItem);

  // Check for capacity milestones
  const ticketsSnapshot = await db
    .collection('tickets')
    .where('eventId', '==', eventId)
    .count()
    .get();

  const totalSold = ticketsSnapshot.data().count;

  // Get event capacity
  const eventDoc = await db.collection('events').doc(eventId).get();
  const eventData = eventDoc.data();
  const ticketTypes = eventData?.ticketTypes || [];
  const totalCapacity = ticketTypes.reduce((sum: number, type: any) => sum + (type.quantity || 0), 0);

  const capacityPercentage = totalCapacity > 0 ? (totalSold / totalCapacity) * 100 : 0;

  // Check milestones: 25%, 50%, 75%, 90%, 95%
  const milestones = [25, 50, 75, 90, 95];
  for (const milestone of milestones) {
    if (
      capacityPercentage >= milestone &&
      capacityPercentage < milestone + (100 / totalCapacity) * 100
    ) {
      const milestoneActivity: Partial<LiveActivityItem> = {
        eventId,
        type: 'capacity_milestone',
        message: `${milestone}% sold! ${totalCapacity - totalSold} tickets remaining`,
        icon: milestone >= 90 ? '🔥' : '📈',
        data: {
          milestone: `${milestone}%`,
        },
        timestamp: FieldValue.serverTimestamp() as any,
        priority: milestone >= 90 ? 'high' : 'medium',
        showDuration: 10000,
      };

      await db.collection('dashboard-activity').add(milestoneActivity);
    }
  }
});
