// ============================================
// WAITLIST & DYNAMIC PRICING TYPES
// Waitlist management and surge pricing
// ============================================

export type WaitlistStatus = 'active' | 'notified' | 'converted' | 'expired' | 'cancelled';
export type WaitlistPriority = 'low' | 'normal' | 'high' | 'vip';

/**
 * Waitlist entry for sold-out events
 */
export interface WaitlistEntry {
  id: string;
  eventId: string;
  ticketTypeId?: string; // Specific ticket type or any

  // User info
  userId: string;
  userEmail: string;
  userName?: string;
  userPhone?: string;

  // Waitlist details
  status: WaitlistStatus;
  priority: WaitlistPriority;
  position: number; // Position in queue

  // Preferences
  quantity: number; // Number of tickets wanted
  maxPrice?: number; // Maximum willing to pay
  autoConvert?: boolean; // Auto-purchase when available

  // Notifications
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;

  // Tracking
  notifiedAt?: Date;
  notificationsSent: number;
  convertedAt?: Date; // When they bought tickets
  expiresAt?: Date; // When waitlist entry expires

  // Metadata
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Waitlist notification
 */
export interface WaitlistNotification {
  id: string;
  waitlistEntryId: string;
  eventId: string;
  userId: string;

  // Notification details
  type: 'availability' | 'price_drop' | 'reminder' | 'expiration';
  channel: 'email' | 'sms' | 'push';
  message: string;

  // Availability info
  ticketsAvailable?: number;
  currentPrice?: number;
  expiresIn?: number; // milliseconds

  // Tracking
  sentAt: Date;
  openedAt?: Date;
  clickedAt?: Date;
  convertedAt?: Date;

  // Status
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'converted' | 'failed';
  error?: string;
}

// ============================================
// DYNAMIC PRICING
// ============================================

export type PricingStrategy = 'fixed' | 'tiered' | 'dynamic' | 'surge' | 'early_bird';
export type PricingTrigger = 'time_based' | 'capacity_based' | 'demand_based' | 'manual';

/**
 * Dynamic pricing configuration
 */
export interface DynamicPricingConfig {
  id: string;
  eventId: string;
  ticketTypeId: string;

  // Strategy
  strategy: PricingStrategy;
  isActive: boolean;

  // Base pricing
  basePrice: number;
  minPrice: number;
  maxPrice: number;
  currency: string;

  // Surge pricing rules
  surgePricing?: {
    enabled: boolean;
    multiplierMin: number; // e.g., 1.0 (no surge)
    multiplierMax: number; // e.g., 3.0 (3x price)
    triggers: {
      highDemand?: boolean; // Surge when sales velocity is high
      lowCapacity?: boolean; // Surge when < X% tickets remain
      timeToEvent?: boolean; // Surge as event approaches
      customRules?: SurgePricingRule[];
    };
  };

  // Tiered pricing
  tieredPricing?: {
    enabled: boolean;
    tiers: PricingTier[];
  };

  // Time-based pricing
  timeBased?: {
    enabled: boolean;
    schedule: TimeBasedPrice[];
  };

  // Demand-based adjustments
  demandBased?: {
    enabled: boolean;
    checkInterval: number; // minutes
    adjustmentStep: number; // percentage per adjustment
    salesVelocityThreshold: number; // tickets/hour
  };

  // Auto-adjustment settings
  autoAdjust: boolean;
  adjustmentFrequency?: number; // minutes
  lastAdjusted?: Date;

  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Surge pricing rule
 */
export interface SurgePricingRule {
  id: string;
  name: string;
  description?: string;

  // Conditions
  condition: {
    type: 'capacity' | 'time' | 'velocity' | 'custom';
    operator: 'less_than' | 'greater_than' | 'equals' | 'between';
    value: number | [number, number]; // Single value or range
    unit?: string; // 'percent', 'hours', 'tickets_per_hour', etc.
  };

  // Price adjustment
  action: {
    type: 'multiply' | 'add' | 'set';
    value: number;
  };

  // Priority (higher = applied first)
  priority: number;
  isActive: boolean;
}

/**
 * Pricing tier for tiered pricing
 */
export interface PricingTier {
  id: string;
  name: string; // e.g., "Early Bird", "Regular", "Last Minute"
  price: number;

  // Tier bounds
  startQuantity?: number; // Start at X tickets sold
  endQuantity?: number; // End at Y tickets sold
  startDate?: Date; // Start at date/time
  endDate?: Date; // End at date/time

  // Availability
  isActive: boolean;
  ticketsRemaining?: number;
}

/**
 * Time-based price schedule
 */
export interface TimeBasedPrice {
  id: string;
  name: string; // e.g., "Super Early Bird"
  price: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

/**
 * Price change history
 */
export interface PriceHistory {
  id: string;
  eventId: string;
  ticketTypeId: string;

  // Price change
  oldPrice: number;
  newPrice: number;
  changePercentage: number;
  changeAmount: number;

  // Reason
  trigger: PricingTrigger;
  reason: string;
  appliedRule?: string; // Rule ID if applicable

  // Context
  ticketsSoldAtTime: number;
  capacityPercentage: number;
  salesVelocity?: number; // tickets/hour

  // Metadata
  changedBy?: string; // User ID if manual
  changedAt: Date;
  automatic: boolean;
}

/**
 * Price recommendation
 */
export interface PriceRecommendation {
  eventId: string;
  ticketTypeId: string;

  // Current state
  currentPrice: number;
  currentSales: number;
  currentVelocity: number; // tickets/hour

  // Recommendation
  recommendedPrice: number;
  confidence: number; // 0-100
  expectedImpact: {
    salesIncrease?: number; // percentage
    revenueIncrease?: number; // percentage
    selloutTime?: Date; // projected
  };

  // Reasoning
  factors: {
    factor: string;
    weight: number;
    impact: 'increase' | 'decrease' | 'neutral';
  }[];

  reasons: string[];

  // Metadata
  generatedAt: Date;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface JoinWaitlistRequest {
  eventId: string;
  ticketTypeId?: string;
  quantity: number;
  maxPrice?: number;
  autoConvert?: boolean;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
}

export interface JoinWaitlistResponse {
  waitlistId: string;
  position: number;
  estimatedWaitTime?: string;
}

export interface GetWaitlistPositionRequest {
  waitlistId: string;
}

export interface GetWaitlistPositionResponse {
  position: number;
  totalInQueue: number;
  estimatedWaitTime?: string;
}

export interface NotifyWaitlistRequest {
  eventId: string;
  ticketTypeId?: string;
  ticketsAvailable: number;
}

export interface NotifyWaitlistResponse {
  notified: number;
  notifications: string[]; // Notification IDs
}

export interface ConfigureDynamicPricingRequest {
  eventId: string;
  ticketTypeId: string;
  config: Partial<DynamicPricingConfig>;
}

export interface ConfigureDynamicPricingResponse {
  configId: string;
  success: boolean;
}

export interface GetPriceRecommendationRequest {
  eventId: string;
  ticketTypeId: string;
}

export interface GetPriceRecommendationResponse {
  recommendation: PriceRecommendation;
}

export interface ApplyPriceChangeRequest {
  eventId: string;
  ticketTypeId: string;
  newPrice: number;
  reason?: string;
}

export interface ApplyPriceChangeResponse {
  success: boolean;
  oldPrice: number;
  newPrice: number;
  affectedTickets: number;
}

export interface GetPriceHistoryRequest {
  eventId: string;
  ticketTypeId?: string;
  limit?: number;
}

export interface GetPriceHistoryResponse {
  history: PriceHistory[];
}
