// ============================================
// LIVE EVENT DASHBOARD TYPES
// Real-time event analytics and metrics
// ============================================

/**
 * Real-time event sales statistics
 */
export interface EventDashboardStats {
  eventId: string;

  // Sales metrics
  totalTicketsSold: number;
  totalRevenue: number;
  currency: string;

  // Capacity metrics
  totalCapacity: number;
  capacityUsed: number;
  capacityPercentage: number;
  ticketsRemaining: number;

  // Sales velocity
  salesLast1Hour: number;
  salesLast24Hours: number;
  salesLast7Days: number;
  averageSalesPerHour: number;

  // Revenue metrics
  revenueLast1Hour: number;
  revenueLast24Hours: number;
  revenueLast7Days: number;

  // Ticket type breakdown
  ticketTypeBreakdown: {
    ticketTypeId: string;
    ticketTypeName: string;
    sold: number;
    capacity: number;
    revenue: number;
  }[];

  // Peak times
  peakSalesHour?: {
    hour: number;
    ticketsSold: number;
  };

  // Projections
  projectedSelloutTime?: Date;
  estimatedFinalSales?: number;

  // Last updated
  lastUpdated: Date;
}

/**
 * Recent buyer activity
 */
export interface RecentBuyer {
  id: string;
  eventId: string;

  // Buyer info (anonymized for privacy)
  buyerName?: string; // First name + last initial (e.g., "João P.")
  buyerCity?: string;
  buyerCountry?: string;

  // Purchase details
  ticketCount: number;
  ticketType: string;
  amount: number;
  currency: string;

  // Timing
  purchasedAt: Date;

  // Display settings
  showName: boolean; // Privacy setting
  showLocation: boolean;
}

/**
 * Price countdown/urgency indicator
 */
export interface PriceCountdown {
  eventId: string;

  // Current pricing
  currentPrice: number;
  currency: string;

  // Next price change
  nextPrice?: number;
  nextPriceChange?: Date;
  priceIncreasePercentage?: number;

  // Urgency indicators
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  urgencyMessage: string;

  // Countdown
  timeUntilPriceIncrease?: number; // milliseconds
  ticketsRemainingAtCurrentPrice?: number;

  // Dynamic pricing info
  isDynamicPricing: boolean;
  priceHistory?: {
    price: number;
    timestamp: Date;
  }[];
}

/**
 * Live activity feed item
 */
export interface LiveActivityItem {
  id: string;
  eventId: string;
  type: 'purchase' | 'capacity_milestone' | 'price_change' | 'social_proof' | 'urgency';

  // Activity details
  message: string;
  icon?: string;

  // Associated data
  data?: {
    ticketCount?: number;
    amount?: number;
    milestone?: string; // "50%", "75%", "90%"
    location?: string;
  };

  // Timing
  timestamp: Date;

  // Display
  priority: 'low' | 'medium' | 'high';
  showDuration?: number; // milliseconds to show this item
}

/**
 * Dashboard configuration
 */
export interface DashboardConfig {
  eventId: string;

  // Display settings
  showRecentBuyers: boolean;
  showSalesCounter: boolean;
  showCapacityBar: boolean;
  showPriceCountdown: boolean;
  showLiveActivity: boolean;

  // Privacy settings
  anonymizeBuyerNames: boolean;
  showBuyerLocations: boolean;

  // Update frequency
  updateInterval: number; // seconds

  // Thresholds for urgency
  urgencyThresholds: {
    highCapacity: number; // percentage (e.g., 80)
    criticalCapacity: number; // percentage (e.g., 95)
    lowTicketsRemaining: number; // absolute number
  };

  // Auto-refresh
  autoRefresh: boolean;
}

/**
 * Sales trend data point
 */
export interface SalesTrendDataPoint {
  timestamp: Date;
  ticketsSold: number;
  revenue: number;
  cumulativeTickets: number;
  cumulativeRevenue: number;
}

/**
 * Complete dashboard data
 */
export interface LiveEventDashboard {
  eventId: string;

  // Core metrics
  stats: EventDashboardStats;

  // Recent activity
  recentBuyers: RecentBuyer[];

  // Urgency indicators
  priceCountdown?: PriceCountdown;

  // Live feed
  liveActivity: LiveActivityItem[];

  // Trends
  salesTrend: SalesTrendDataPoint[];

  // Configuration
  config: DashboardConfig;

  // Last updated
  lastUpdated: Date;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface GetDashboardStatsRequest {
  eventId: string;
  includeProjections?: boolean;
}

export interface GetDashboardStatsResponse {
  stats: EventDashboardStats;
}

export interface GetRecentBuyersRequest {
  eventId: string;
  limit?: number;
  anonymize?: boolean;
}

export interface GetRecentBuyersResponse {
  buyers: RecentBuyer[];
}

export interface GetPriceCountdownRequest {
  eventId: string;
  ticketTypeId?: string;
}

export interface GetPriceCountdownResponse {
  countdown: PriceCountdown;
}

export interface GetLiveActivityRequest {
  eventId: string;
  limit?: number;
  since?: Date;
}

export interface GetLiveActivityResponse {
  activity: LiveActivityItem[];
}

export interface GetCompleteDashboardRequest {
  eventId: string;
}

export interface GetCompleteDashboardResponse {
  dashboard: LiveEventDashboard;
}

export interface UpdateDashboardConfigRequest {
  eventId: string;
  config: Partial<DashboardConfig>;
}

export interface CapacityMilestoneEvent {
  eventId: string;
  milestone: number; // percentage
  ticketsSold: number;
  totalCapacity: number;
  timestamp: Date;
}
