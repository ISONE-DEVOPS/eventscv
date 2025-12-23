/**
 * Analytics Service - Platform and event analytics
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

// ============================================
// TYPES
// ============================================

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface PlatformAnalytics {
  overview: {
    totalUsers: number;
    totalOrganizations: number;
    totalEvents: number;
    totalTicketsSold: number;
    totalRevenue: number;
    platformFees: number;
  };
  trends: {
    usersGrowth: number; // percentage
    eventsGrowth: number;
    revenueGrowth: number;
  };
  usersByRole: Record<string, number>;
  organizationsByStatus: Record<string, number>;
  eventsByStatus: Record<string, number>;
}

export interface OrganizationAnalytics {
  overview: {
    totalEvents: number;
    totalTicketsSold: number;
    totalRevenue: number;
    totalAttendees: number;
    averageTicketPrice: number;
    checkInRate: number;
  };
  trends: {
    ticketSalesGrowth: number;
    revenueGrowth: number;
    attendeeGrowth: number;
  };
  topEvents: {
    id: string;
    name: string;
    ticketsSold: number;
    revenue: number;
  }[];
  revenueByMonth: {
    month: string;
    revenue: number;
    tickets: number;
  }[];
  ticketsByType: {
    type: string;
    count: number;
    revenue: number;
  }[];
}

export interface EventAnalytics {
  overview: {
    totalTickets: number;
    ticketsSold: number;
    ticketsAvailable: number;
    totalRevenue: number;
    checkIns: number;
    checkInRate: number;
  };
  salesByDay: {
    date: string;
    tickets: number;
    revenue: number;
  }[];
  salesByTicketType: {
    typeId: string;
    typeName: string;
    sold: number;
    available: number;
    revenue: number;
  }[];
  checkInsByHour: {
    hour: string;
    count: number;
  }[];
  demographics: {
    newVsReturning: {
      new: number;
      returning: number;
    };
    paymentMethods: Record<string, number>;
  };
}

export interface RealtimeStats {
  activeUsers: number;
  ticketsSoldToday: number;
  revenueToday: number;
  checkInsToday: number;
  pendingPayouts: number;
}

// ============================================
// PLATFORM ANALYTICS (Super Admin)
// ============================================

export async function getPlatformAnalytics(
  dateRange?: DateRange
): Promise<PlatformAnalytics> {
  // Get current and previous month for comparison
  const now = new Date();
  const currentMonthId = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthId = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, '0')}`;

  // Get monthly analytics data
  const [currentMonthDoc, previousMonthDoc] = await Promise.all([
    getDoc(doc(db, 'analytics_monthly', currentMonthId)),
    getDoc(doc(db, 'analytics_monthly', previousMonthId)),
  ]);

  const currentMonth = currentMonthDoc.exists() ? currentMonthDoc.data() : null;
  const prevMonth = previousMonthDoc.exists() ? previousMonthDoc.data() : null;

  // Get cumulative totals from all collections (for totals, not monthly)
  const [usersSnapshot, orgsSnapshot, eventsSnapshot] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'organizations')),
    getDocs(collection(db, 'events')),
  ]);

  // Build distribution data
  const usersByRole: Record<string, number> = {};
  usersSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    usersByRole[data.role] = (usersByRole[data.role] || 0) + 1;
  });

  const organizationsByStatus: Record<string, number> = {};
  orgsSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    organizationsByStatus[data.status] = (organizationsByStatus[data.status] || 0) + 1;
  });

  const eventsByStatus: Record<string, number> = {};
  eventsSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    eventsByStatus[data.status] = (eventsByStatus[data.status] || 0) + 1;
  });

  // Calculate cumulative revenue and tickets from all monthly analytics
  const allMonthlyDocs = await getDocs(
    query(collection(db, 'analytics_monthly'), orderBy('id', 'desc'))
  );

  let totalRevenue = 0;
  let totalTicketsSold = 0;
  let platformFees = 0;

  allMonthlyDocs.docs.forEach((doc) => {
    const data = doc.data();
    totalRevenue += data.revenue || 0;
    totalTicketsSold += data.ticketsSold || 0;
    platformFees += data.platformFees || 0;
  });

  // Use real growth data from current month analytics
  const revenueGrowth = currentMonth?.revenueGrowth || 0;
  const usersGrowth = currentMonth?.usersGrowth || 0;
  const eventsGrowth = currentMonth ?
    ((currentMonth.eventsCreated - (prevMonth?.eventsCreated || 0)) / (prevMonth?.eventsCreated || 1)) * 100 : 0;

  return {
    overview: {
      totalUsers: usersSnapshot.size,
      totalOrganizations: orgsSnapshot.size,
      totalEvents: eventsSnapshot.size,
      totalTicketsSold,
      totalRevenue,
      platformFees,
    },
    trends: {
      usersGrowth,
      eventsGrowth,
      revenueGrowth,
    },
    usersByRole,
    organizationsByStatus,
    eventsByStatus,
  };
}

// ============================================
// TOP PERFORMERS (Super Admin)
// ============================================

export interface TopEvent {
  id: string;
  name: string;
  organizationName: string;
  revenue: number;
  ticketsSold: number;
}

export interface TopOrganization {
  id: string;
  name: string;
  revenue: number;
  eventsCount: number;
  ticketsSold: number;
}

export async function getTopEvents(
  limit: number = 10,
  monthId?: string
): Promise<TopEvent[]> {
  // Use current month if not specified
  const now = new Date();
  const targetMonthId = monthId || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const monthDoc = await getDoc(doc(db, 'analytics_monthly', targetMonthId));

  if (!monthDoc.exists()) {
    return [];
  }

  const monthData = monthDoc.data();
  return (monthData.topEvents || []).slice(0, limit);
}

export async function getTopOrganizations(
  limit: number = 10,
  monthId?: string
): Promise<TopOrganization[]> {
  // Use current month if not specified
  const now = new Date();
  const targetMonthId = monthId || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const monthDoc = await getDoc(doc(db, 'analytics_monthly', targetMonthId));

  if (!monthDoc.exists()) {
    return [];
  }

  const monthData = monthDoc.data();
  return (monthData.topOrganizations || []).slice(0, limit);
}

export async function getRevenueChartData(months: number = 6): Promise<Array<{ month: string; value: number }>> {
  const now = new Date();
  const chartData: Array<{ month: string; value: number }> = [];

  // Generate month IDs for the last N months
  for (let i = months - 1; i >= 0; i--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthId = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;

    const monthDoc = await getDoc(doc(db, 'analytics_monthly', monthId));

    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthName = monthNames[targetDate.getMonth()];

    chartData.push({
      month: monthName,
      value: monthDoc.exists() ? (monthDoc.data().revenue || 0) : 0,
    });
  }

  return chartData;
}

export async function getOrganizationGrowthData(months: number = 6): Promise<Array<{ month: string; count: number }>> {
  const now = new Date();
  const chartData: Array<{ month: string; count: number }> = [];
  let cumulativeOrgs = 0;

  // Generate month IDs for the last N months
  for (let i = months - 1; i >= 0; i--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthId = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;

    const monthDoc = await getDoc(doc(db, 'analytics_monthly', monthId));

    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthName = monthNames[targetDate.getMonth()];

    cumulativeOrgs += monthDoc.exists() ? (monthDoc.data().newOrganizations || 0) : 0;

    chartData.push({
      month: monthName,
      count: cumulativeOrgs,
    });
  }

  return chartData;
}

export async function getDailyTicketSalesData(days: number = 30): Promise<Array<{ day: string; count: number }>> {
  const now = new Date();
  const chartData: Array<{ day: string; count: number }> = [];

  // Generate date IDs for the last N days
  for (let i = days - 1; i >= 0; i--) {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() - i);
    const dateId = targetDate.toISOString().split('T')[0];

    const dailyDoc = await getDoc(doc(db, 'analytics_daily', dateId));

    chartData.push({
      day: String(targetDate.getDate()).padStart(2, '0'),
      count: dailyDoc.exists() ? (dailyDoc.data().ticketsSold || 0) : 0,
    });
  }

  return chartData;
}

// ============================================
// ORGANIZATION ANALYTICS
// ============================================

export async function getOrganizationAnalytics(
  organizationId: string,
  dateRange?: DateRange
): Promise<OrganizationAnalytics> {
  const now = new Date();
  const startDate = dateRange?.startDate || new Date(now.getFullYear(), 0, 1);
  const endDate = dateRange?.endDate || now;

  // Get organization events
  const eventsQuery = query(
    collection(db, 'events'),
    where('organizationId', '==', organizationId)
  );
  const eventsSnapshot = await getDocs(eventsQuery);

  let totalEvents = 0;
  let totalTicketsSold = 0;
  let totalRevenue = 0;
  let totalAttendees = 0;
  const topEvents: OrganizationAnalytics['topEvents'] = [];
  const ticketsByType: Record<string, { count: number; revenue: number }> = {};

  eventsSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    totalEvents++;
    totalTicketsSold += data.ticketsSold || 0;
    totalRevenue += data.totalRevenue || 0;
    totalAttendees += data.checkIns || 0;

    topEvents.push({
      id: doc.id,
      name: data.name,
      ticketsSold: data.ticketsSold || 0,
      revenue: data.totalRevenue || 0,
    });
  });

  // Sort and limit top events
  topEvents.sort((a, b) => b.revenue - a.revenue);
  const limitedTopEvents = topEvents.slice(0, 5);

  // Calculate averages
  const averageTicketPrice = totalTicketsSold > 0 ? totalRevenue / totalTicketsSold : 0;
  const checkInRate = totalTicketsSold > 0 ? (totalAttendees / totalTicketsSold) * 100 : 0;

  // Mock revenue by month (would need aggregated data in production)
  const revenueByMonth = generateMockRevenueByMonth();

  // Mock tickets by type
  const ticketsByTypeArray = [
    { type: 'VIP', count: Math.floor(totalTicketsSold * 0.15), revenue: totalRevenue * 0.35 },
    { type: 'Regular', count: Math.floor(totalTicketsSold * 0.6), revenue: totalRevenue * 0.45 },
    { type: 'Early Bird', count: Math.floor(totalTicketsSold * 0.25), revenue: totalRevenue * 0.2 },
  ];

  return {
    overview: {
      totalEvents,
      totalTicketsSold,
      totalRevenue,
      totalAttendees,
      averageTicketPrice,
      checkInRate,
    },
    trends: {
      ticketSalesGrowth: 18.5,
      revenueGrowth: 22.3,
      attendeeGrowth: 15.8,
    },
    topEvents: limitedTopEvents,
    revenueByMonth,
    ticketsByType: ticketsByTypeArray,
  };
}

// ============================================
// EVENT ANALYTICS
// ============================================

export async function getEventAnalytics(eventId: string): Promise<EventAnalytics> {
  const eventRef = doc(db, 'events', eventId);
  const eventSnap = await getDoc(eventRef);

  if (!eventSnap.exists()) {
    throw new Error('Event not found');
  }

  const eventData = eventSnap.data();

  // Get ticket types
  const ticketTypesSnapshot = await getDocs(
    collection(db, 'events', eventId, 'ticketTypes')
  );

  const salesByTicketType: EventAnalytics['salesByTicketType'] = [];
  let totalTickets = 0;
  let ticketsSold = 0;

  ticketTypesSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    const quantity = data.quantity || 0;
    const sold = data.sold || 0;

    totalTickets += quantity;
    ticketsSold += sold;

    salesByTicketType.push({
      typeId: doc.id,
      typeName: data.name,
      sold,
      available: quantity - sold,
      revenue: sold * (data.price || 0),
    });
  });

  const ticketsAvailable = totalTickets - ticketsSold;
  const totalRevenue = eventData.totalRevenue || 0;
  const checkIns = eventData.checkIns || 0;
  const checkInRate = ticketsSold > 0 ? (checkIns / ticketsSold) * 100 : 0;

  // Mock sales by day (would need order data in production)
  const salesByDay = generateMockSalesByDay(ticketsSold, totalRevenue);

  // Mock check-ins by hour
  const checkInsByHour = generateMockCheckInsByHour(checkIns);

  return {
    overview: {
      totalTickets,
      ticketsSold,
      ticketsAvailable,
      totalRevenue,
      checkIns,
      checkInRate,
    },
    salesByDay,
    salesByTicketType,
    checkInsByHour,
    demographics: {
      newVsReturning: {
        new: Math.floor(ticketsSold * 0.65),
        returning: Math.floor(ticketsSold * 0.35),
      },
      paymentMethods: {
        wallet: Math.floor(ticketsSold * 0.4),
        card: Math.floor(ticketsSold * 0.35),
        mbway: Math.floor(ticketsSold * 0.2),
        cash: Math.floor(ticketsSold * 0.05),
      },
    },
  };
}

// ============================================
// REALTIME STATS
// ============================================

export async function getRealtimeStats(organizationId?: string): Promise<RealtimeStats> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = Timestamp.fromDate(today);

  // This would need real-time listeners in production
  // For now, return mock data
  return {
    activeUsers: Math.floor(Math.random() * 100) + 50,
    ticketsSoldToday: Math.floor(Math.random() * 50) + 10,
    revenueToday: Math.floor(Math.random() * 50000) + 10000,
    checkInsToday: Math.floor(Math.random() * 30) + 5,
    pendingPayouts: Math.floor(Math.random() * 5) + 1,
  };
}

// ============================================
// DASHBOARD STATS
// ============================================

export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  ticketsSold: number;
  ticketsChange: number;
  activeEvents: number;
  eventsChange: number;
  checkInRate: number;
  checkInChange: number;
}

export async function getDashboardStats(organizationId: string): Promise<DashboardStats> {
  const eventsQuery = query(
    collection(db, 'events'),
    where('organizationId', '==', organizationId)
  );
  const eventsSnapshot = await getDocs(eventsQuery);

  let totalRevenue = 0;
  let ticketsSold = 0;
  let activeEvents = 0;
  let totalCheckIns = 0;

  eventsSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    totalRevenue += data.totalRevenue || 0;
    ticketsSold += data.ticketsSold || 0;
    totalCheckIns += data.checkIns || 0;

    if (data.status === 'published' || data.status === 'ongoing') {
      activeEvents++;
    }
  });

  const checkInRate = ticketsSold > 0 ? (totalCheckIns / ticketsSold) * 100 : 0;

  return {
    totalRevenue,
    revenueChange: 12.5, // Mock - would need historical comparison
    ticketsSold,
    ticketsChange: 8.3,
    activeEvents,
    eventsChange: 2,
    checkInRate,
    checkInChange: 5.2,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateMockRevenueByMonth(): OrganizationAnalytics['revenueByMonth'] {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const currentMonth = new Date().getMonth();

  return months.slice(0, currentMonth + 1).map((month, index) => ({
    month,
    revenue: Math.floor(Math.random() * 500000) + 100000,
    tickets: Math.floor(Math.random() * 500) + 100,
  }));
}

function generateMockSalesByDay(
  totalTickets: number,
  totalRevenue: number
): EventAnalytics['salesByDay'] {
  const days = [];
  const now = new Date();

  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const dailyTickets = Math.floor((totalTickets / 30) * (0.5 + Math.random()));
    const dailyRevenue = Math.floor((totalRevenue / 30) * (0.5 + Math.random()));

    days.push({
      date: date.toISOString().split('T')[0],
      tickets: dailyTickets,
      revenue: dailyRevenue,
    });
  }

  return days;
}

function generateMockCheckInsByHour(totalCheckIns: number): EventAnalytics['checkInsByHour'] {
  const hours = [];
  const peakHours = [19, 20, 21, 22]; // Peak hours for events

  for (let i = 18; i <= 24; i++) {
    const hour = i === 24 ? '00:00' : `${i}:00`;
    const isPeak = peakHours.includes(i);
    const count = Math.floor((totalCheckIns / 7) * (isPeak ? 1.5 : 0.5));

    hours.push({ hour, count });
  }

  return hours;
}

// ============================================
// EXPORT REPORTS
// ============================================

export async function exportAnalyticsReport(
  organizationId: string,
  dateRange: DateRange,
  format: 'csv' | 'pdf' = 'csv'
): Promise<string> {
  const analytics = await getOrganizationAnalytics(organizationId, dateRange);

  if (format === 'csv') {
    const headers = ['Métrica', 'Valor'];
    const rows = [
      ['Total de Eventos', analytics.overview.totalEvents.toString()],
      ['Bilhetes Vendidos', analytics.overview.totalTicketsSold.toString()],
      ['Receita Total', `${analytics.overview.totalRevenue} CVE`],
      ['Total de Participantes', analytics.overview.totalAttendees.toString()],
      ['Preço Médio do Bilhete', `${analytics.overview.averageTicketPrice.toFixed(2)} CVE`],
      ['Taxa de Check-in', `${analytics.overview.checkInRate.toFixed(1)}%`],
    ];

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    return csvContent;
  }

  // PDF generation would require a library like jsPDF
  throw new Error('PDF export not yet implemented');
}
