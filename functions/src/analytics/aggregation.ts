import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';

// Type definitions (duplicated from shared-types to avoid import issues)
interface DailyAnalytics {
  id: string;
  date: Date | admin.firestore.Timestamp;
  revenue: number;
  ticketsSold: number;
  newUsers: number;
  newOrganizations: number;
  newEvents: number;
  activeEvents: number;
  platformFees: number;
  refunds: number;
  byCategory: Record<string, { events: number; tickets: number; revenue: number }>;
  byOrganization: Record<string, { events: number; tickets: number; revenue: number }>;
  byPaymentMethod: Record<string, { count: number; volume: number }>;
  createdAt: Date | admin.firestore.Timestamp;
  updatedAt?: Date | admin.firestore.Timestamp;
}

interface MonthlyAnalytics {
  id: string;
  month: string;
  year: number;
  revenue: number;
  ticketsSold: number;
  newUsers: number;
  newOrganizations: number;
  eventsCreated: number;
  platformFees: number;
  revenueGrowth: number;
  ticketsGrowth: number;
  usersGrowth: number;
  organizationsGrowth: number;
  topEvents: Array<{
    id: string;
    name: string;
    organizationName: string;
    revenue: number;
    ticketsSold: number;
  }>;
  topOrganizations: Array<{
    id: string;
    name: string;
    revenue: number;
    eventsCount: number;
    ticketsSold: number;
  }>;
  byCategory: Record<string, { events: number; tickets: number; revenue: number }>;
  createdAt: Date | admin.firestore.Timestamp;
}

const db = admin.firestore();

/**
 * Aggregates previous day's platform data into analytics_daily collection
 * Runs daily at 1:00 AM UTC
 */
export const aggregateDailyAnalytics = onSchedule(
  {
    schedule: '0 1 * * *', // Every day at 1 AM UTC
    timeZone: 'UTC',
    region: 'europe-west1',
  },
  async (event) => {
    try {
      console.log('Starting daily analytics aggregation...');

      // Calculate yesterday's date range
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const tomorrow = new Date(yesterday);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const dateId = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD

      // Query all data from yesterday
      const [
        ordersSnapshot,
        ticketsSnapshot,
        usersSnapshot,
        organizationsSnapshot,
        eventsSnapshot,
      ] = await Promise.all([
        // Orders completed yesterday
        db
          .collection('orders')
          .where('status', '==', 'paid')
          .where('createdAt', '>=', yesterday)
          .where('createdAt', '<', tomorrow)
          .get(),

        // Tickets sold yesterday
        db
          .collection('tickets')
          .where('createdAt', '>=', yesterday)
          .where('createdAt', '<', tomorrow)
          .get(),

        // New users registered yesterday
        db
          .collection('users')
          .where('createdAt', '>=', yesterday)
          .where('createdAt', '<', tomorrow)
          .get(),

        // New organizations registered yesterday
        db
          .collection('organizations')
          .where('createdAt', '>=', yesterday)
          .where('createdAt', '<', tomorrow)
          .get(),

        // Events created yesterday
        db
          .collection('events')
          .where('createdAt', '>=', yesterday)
          .where('createdAt', '<', tomorrow)
          .get(),
      ]);

      // Calculate core metrics
      let revenue = 0;
      let platformFees = 0;
      let refunds = 0;
      const byCategory: Record<string, { events: number; tickets: number; revenue: number }> = {};
      const byOrganization: Record<string, { events: number; tickets: number; revenue: number }> = {};
      const byPaymentMethod: Record<string, { count: number; volume: number }> = {};

      // Process orders for revenue and payment methods
      ordersSnapshot.forEach((doc) => {
        const order = doc.data();
        const amount = order.totalAmount || 0;
        const fees = order.platformFee || 0;

        revenue += amount;
        platformFees += fees;

        // Track by payment method
        const paymentMethod = order.paymentMethod || 'unknown';
        if (!byPaymentMethod[paymentMethod]) {
          byPaymentMethod[paymentMethod] = { count: 0, volume: 0 };
        }
        byPaymentMethod[paymentMethod].count += 1;
        byPaymentMethod[paymentMethod].volume += amount;

        // Track refunds
        if (order.refunded) {
          refunds += order.refundAmount || amount;
        }

        // Track by organization
        const orgId = order.organizationId || 'unknown';
        if (!byOrganization[orgId]) {
          byOrganization[orgId] = { events: 0, tickets: 0, revenue: 0 };
        }
        byOrganization[orgId].revenue += amount;
        byOrganization[orgId].tickets += order.ticketCount || 1;
      });

      // Process tickets by category and organization
      const eventCache = new Map<string, any>();

      for (const ticketDoc of ticketsSnapshot.docs) {
        const ticket = ticketDoc.data();
        const eventId = ticket.eventId;

        // Fetch event data (with caching)
        if (!eventCache.has(eventId)) {
          const eventDoc = await db.collection('events').doc(eventId).get();
          eventCache.set(eventId, eventDoc.exists ? eventDoc.data() : null);
        }

        const event = eventCache.get(eventId);
        if (event) {
          const category = event.category || 'other';

          // Track by category
          if (!byCategory[category]) {
            byCategory[category] = { events: 0, tickets: 0, revenue: 0 };
          }
          byCategory[category].tickets += 1;

          // Increment events count (only once per event)
          if (!byCategory[category].events) {
            byCategory[category].events = 0;
          }
        }
      }

      // Count unique events per category
      const eventsPerCategory = new Map<string, Set<string>>();
      for (const ticketDoc of ticketsSnapshot.docs) {
        const ticket = ticketDoc.data();
        const event = eventCache.get(ticket.eventId);
        if (event) {
          const category = event.category || 'other';
          if (!eventsPerCategory.has(category)) {
            eventsPerCategory.set(category, new Set());
          }
          eventsPerCategory.get(category)!.add(ticket.eventId);
        }
      }

      // Update event counts in byCategory
      eventsPerCategory.forEach((eventIds, category) => {
        if (byCategory[category]) {
          byCategory[category].events = eventIds.size;
        }
      });

      // Count active events (published on this date)
      const activeEventsSnapshot = await db
        .collection('events')
        .where('status', '==', 'published')
        .where('startDate', '>=', yesterday)
        .where('startDate', '<', tomorrow)
        .get();

      // Build daily analytics document
      const dailyAnalytics: DailyAnalytics = {
        id: dateId,
        date: admin.firestore.Timestamp.fromDate(yesterday) as any,
        revenue,
        ticketsSold: ticketsSnapshot.size,
        newUsers: usersSnapshot.size,
        newOrganizations: organizationsSnapshot.size,
        newEvents: eventsSnapshot.size,
        activeEvents: activeEventsSnapshot.size,
        platformFees,
        refunds,
        byCategory,
        byOrganization,
        byPaymentMethod,
        createdAt: admin.firestore.Timestamp.now() as any,
      };

      // Save to Firestore
      await db.collection('analytics_daily').doc(dateId).set(dailyAnalytics);

      console.log(`Daily analytics aggregated for ${dateId}:`, {
        revenue,
        tickets: ticketsSnapshot.size,
        users: usersSnapshot.size,
        organizations: organizationsSnapshot.size,
        events: eventsSnapshot.size,
      });
    } catch (error) {
      console.error('Error aggregating daily analytics:', error);
      throw error;
    }
  }
);

/**
 * Aggregates previous month's data from daily analytics into monthly collection
 * Runs on the 1st of each month at 2:00 AM UTC
 */
export const aggregateMonthlyAnalytics = onSchedule(
  {
    schedule: '0 2 1 * *', // 1st day of every month at 2 AM UTC
    timeZone: 'UTC',
    region: 'europe-west1',
  },
  async (event) => {
    try {
      console.log('Starting monthly analytics aggregation...');

      // Calculate previous month
      const now = new Date();
      const firstDayOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayOfLastMonth = new Date(firstDayOfThisMonth);
      firstDayOfLastMonth.setMonth(firstDayOfLastMonth.getMonth() - 1);

      const lastMonth = firstDayOfLastMonth;
      const monthId = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

      // Query all daily analytics for previous month
      const startDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
      const endDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 1);

      const dailyDocsSnapshot = await db
        .collection('analytics_daily')
        .where('date', '>=', startDate)
        .where('date', '<', endDate)
        .get();

      // Aggregate monthly totals
      let revenue = 0;
      let ticketsSold = 0;
      let newUsers = 0;
      let newOrganizations = 0;
      let eventsCreated = 0;
      let platformFees = 0;

      const byCategory: Record<string, { events: number; tickets: number; revenue: number }> = {};
      const eventRevenues = new Map<string, { id: string; name: string; orgName: string; revenue: number; tickets: number }>();
      const orgRevenues = new Map<string, { id: string; name: string; revenue: number; events: Set<string>; tickets: number }>();

      dailyDocsSnapshot.forEach((doc) => {
        const daily = doc.data() as DailyAnalytics;

        revenue += daily.revenue || 0;
        ticketsSold += daily.ticketsSold || 0;
        newUsers += daily.newUsers || 0;
        newOrganizations += daily.newOrganizations || 0;
        eventsCreated += daily.newEvents || 0;
        platformFees += daily.platformFees || 0;

        // Aggregate categories
        Object.entries(daily.byCategory || {}).forEach(([category, stats]: [string, any]) => {
          if (!byCategory[category]) {
            byCategory[category] = { events: 0, tickets: 0, revenue: 0 };
          }
          byCategory[category].events += stats.events || 0;
          byCategory[category].tickets += stats.tickets || 0;
          byCategory[category].revenue += stats.revenue || 0;
        });

        // Aggregate organizations
        Object.entries(daily.byOrganization || {}).forEach(([orgId, stats]: [string, any]) => {
          if (!orgRevenues.has(orgId)) {
            orgRevenues.set(orgId, {
              id: orgId,
              name: '', // Will be populated later
              revenue: 0,
              events: new Set(),
              tickets: 0,
            });
          }
          const org = orgRevenues.get(orgId)!;
          org.revenue += stats.revenue || 0;
          org.tickets += stats.tickets || 0;
        });
      });

      // Get top events for the month
      const topEventsSnapshot = await db
        .collection('events')
        .where('createdAt', '>=', startDate)
        .where('createdAt', '<', endDate)
        .orderBy('createdAt', 'desc')
        .limit(100) // Get more than needed for sorting
        .get();

      // Calculate revenue per event and sort
      for (const eventDoc of topEventsSnapshot.docs) {
        const event = eventDoc.data();

        // Get orders for this event
        const ordersSnapshot = await db
          .collection('orders')
          .where('eventId', '==', eventDoc.id)
          .where('status', '==', 'paid')
          .where('createdAt', '>=', startDate)
          .where('createdAt', '<', endDate)
          .get();

        let eventRevenue = 0;
        let eventTickets = 0;

        ordersSnapshot.forEach((orderDoc) => {
          const order = orderDoc.data();
          eventRevenue += order.totalAmount || 0;
          eventTickets += order.ticketCount || 1;
        });

        if (eventRevenue > 0) {
          // Get organization name
          const orgDoc = await db.collection('organizations').doc(event.organizationId).get();
          const orgName = orgDoc.exists ? orgDoc.data()?.name || 'Unknown' : 'Unknown';

          eventRevenues.set(eventDoc.id, {
            id: eventDoc.id,
            name: event.title || event.name || 'Unnamed Event',
            orgName,
            revenue: eventRevenue,
            tickets: eventTickets,
          });
        }
      }

      // Get top 10 events by revenue
      const topEvents = Array.from(eventRevenues.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)
        .map(e => ({
          id: e.id,
          name: e.name,
          organizationName: e.orgName,
          revenue: e.revenue,
          ticketsSold: e.tickets,
        }));

      // Get organization names and create top organizations list
      const topOrganizations = await Promise.all(
        Array.from(orgRevenues.entries())
          .sort(([, a], [, b]) => b.revenue - a.revenue)
          .slice(0, 10)
          .map(async ([orgId, stats]) => {
            const orgDoc = await db.collection('organizations').doc(orgId).get();
            const orgName = orgDoc.exists ? orgDoc.data()?.name || 'Unknown' : 'Unknown';

            return {
              id: orgId,
              name: orgName,
              revenue: stats.revenue,
              eventsCount: stats.events.size,
              ticketsSold: stats.tickets,
            };
          })
      );

      // Calculate growth compared to previous month
      const previousMonthDate = new Date(lastMonth);
      previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
      const previousMonthId = `${previousMonthDate.getFullYear()}-${String(previousMonthDate.getMonth() + 1).padStart(2, '0')}`;

      const previousMonthDoc = await db.collection('analytics_monthly').doc(previousMonthId).get();
      const previousMonth = previousMonthDoc.exists ? previousMonthDoc.data() as MonthlyAnalytics : null;

      const calculateGrowth = (current: number, previous: number): number => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      const revenueGrowth = previousMonth ? calculateGrowth(revenue, previousMonth.revenue) : 0;
      const ticketsGrowth = previousMonth ? calculateGrowth(ticketsSold, previousMonth.ticketsSold) : 0;
      const usersGrowth = previousMonth ? calculateGrowth(newUsers, previousMonth.newUsers) : 0;
      const organizationsGrowth = previousMonth ? calculateGrowth(newOrganizations, previousMonth.newOrganizations) : 0;

      // Build monthly analytics document
      const monthlyAnalytics: MonthlyAnalytics = {
        id: monthId,
        month: monthId,
        year: lastMonth.getFullYear(),
        revenue,
        ticketsSold,
        newUsers,
        newOrganizations,
        eventsCreated,
        platformFees,
        revenueGrowth,
        ticketsGrowth,
        usersGrowth,
        organizationsGrowth,
        topEvents,
        topOrganizations,
        byCategory,
        createdAt: admin.firestore.Timestamp.now() as any,
      };

      // Save to Firestore
      await db.collection('analytics_monthly').doc(monthId).set(monthlyAnalytics);

      console.log(`Monthly analytics aggregated for ${monthId}:`, {
        revenue,
        tickets: ticketsSold,
        users: newUsers,
        organizations: newOrganizations,
        events: eventsCreated,
      });
    } catch (error) {
      console.error('Error aggregating monthly analytics:', error);
      throw error;
    }
  }
);
