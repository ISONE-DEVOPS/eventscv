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
  const now = new Date();
  const startDate = dateRange?.startDate || new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endDate = dateRange?.endDate || now;

  // Get users
  const usersSnapshot = await getDocs(collection(db, 'users'));
  const usersByRole: Record<string, number> = {};
  let totalUsers = 0;

  usersSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    totalUsers++;
    usersByRole[data.role] = (usersByRole[data.role] || 0) + 1;
  });

  // Get organizations
  const orgsSnapshot = await getDocs(collection(db, 'organizations'));
  const organizationsByStatus: Record<string, number> = {};
  let totalOrganizations = 0;

  orgsSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    totalOrganizations++;
    organizationsByStatus[data.status] = (organizationsByStatus[data.status] || 0) + 1;
  });

  // Get events
  const eventsSnapshot = await getDocs(collection(db, 'events'));
  const eventsByStatus: Record<string, number> = {};
  let totalEvents = 0;
  let totalTicketsSold = 0;
  let totalRevenue = 0;

  eventsSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    totalEvents++;
    eventsByStatus[data.status] = (eventsByStatus[data.status] || 0) + 1;
    totalTicketsSold += data.ticketsSold || 0;
    totalRevenue += data.totalRevenue || 0;
  });

  // Calculate platform fees (assuming 5% platform fee)
  const platformFees = totalRevenue * 0.05;

  // Calculate growth (simplified - would need historical data for accurate calculation)
  const usersGrowth = 12.5; // Mock
  const eventsGrowth = 8.3; // Mock
  const revenueGrowth = 15.7; // Mock

  return {
    overview: {
      totalUsers,
      totalOrganizations,
      totalEvents,
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
