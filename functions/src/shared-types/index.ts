// ============================================
// PLATFORM ROLES & PERMISSIONS (SaaS Multi-tenant)
// ============================================

/**
 * Platform-level roles (Super Admin only)
 */
export type PlatformRole = 'super_admin';

/**
 * Organization-level roles
 */
export type OrganizationRole = 'admin' | 'promoter' | 'staff';

/**
 * User role for end consumers
 */
export type UserRole = 'user';

/**
 * All possible roles in the system
 */
export type SystemRole = PlatformRole | OrganizationRole | UserRole;

/**
 * Firebase Auth Custom Claims structure
 */
export interface UserClaims {
  platformRole?: PlatformRole;
  organizationId?: string;
  organizationRole?: OrganizationRole;
  permissions?: Permission[];
}

/**
 * Granular permissions for organization members
 */
export type Permission =
  // Event permissions
  | 'events:create'
  | 'events:read'
  | 'events:update'
  | 'events:delete'
  | 'events:publish'
  // Ticket permissions
  | 'tickets:read'
  | 'tickets:checkin'
  | 'tickets:refund'
  // Financial permissions
  | 'finance:read'
  | 'finance:payouts'
  | 'finance:refunds'
  // Team permissions
  | 'team:read'
  | 'team:invite'
  | 'team:manage'
  // Analytics permissions
  | 'analytics:read'
  | 'analytics:export'
  // Settings permissions
  | 'settings:read'
  | 'settings:update'
  // Vendor permissions
  | 'vendors:create'
  | 'vendors:read'
  | 'vendors:update'
  | 'vendors:delete';

/**
 * Default permissions per role
 */
export const DEFAULT_PERMISSIONS: Record<OrganizationRole, Permission[]> = {
  admin: [
    'events:create', 'events:read', 'events:update', 'events:delete', 'events:publish',
    'tickets:read', 'tickets:checkin', 'tickets:refund',
    'finance:read', 'finance:payouts', 'finance:refunds',
    'team:read', 'team:invite', 'team:manage',
    'analytics:read', 'analytics:export',
    'settings:read', 'settings:update',
    'vendors:create', 'vendors:read', 'vendors:update', 'vendors:delete',
  ],
  promoter: [
    'events:create', 'events:read', 'events:update', 'events:publish',
    'tickets:read', 'tickets:checkin',
    'finance:read',
    'team:read',
    'analytics:read',
    'vendors:create', 'vendors:read', 'vendors:update',
  ],
  staff: [
    'events:read',
    'tickets:read', 'tickets:checkin',
    'vendors:read',
  ],
};

// ============================================
// SUBSCRIPTION & BILLING TYPES
// ============================================

export type SubscriptionPlan = 'starter' | 'pro' | 'business' | 'enterprise';
export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'trialing';
export type BillingCycle = 'monthly' | 'yearly';

export interface PlanLimits {
  eventsPerMonth: number;
  ticketsPerEvent: number;
  teamMembers: number;
  commissionRate: number;
  features: {
    nfcEnabled: boolean;
    cashlessEnabled: boolean;
    customBranding: boolean;
    apiAccess: boolean;
    prioritySupport: boolean;
    advancedAnalytics: boolean;
    multiplePayoutMethods: boolean;
    whiteLabel: boolean;
  };
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  starter: {
    eventsPerMonth: 2,
    ticketsPerEvent: 500,
    teamMembers: 2,
    commissionRate: 5,
    features: {
      nfcEnabled: false,
      cashlessEnabled: false,
      customBranding: false,
      apiAccess: false,
      prioritySupport: false,
      advancedAnalytics: false,
      multiplePayoutMethods: false,
      whiteLabel: false,
    },
  },
  pro: {
    eventsPerMonth: 10,
    ticketsPerEvent: 2000,
    teamMembers: 5,
    commissionRate: 3.5,
    features: {
      nfcEnabled: true,
      cashlessEnabled: true,
      customBranding: true,
      apiAccess: false,
      prioritySupport: false,
      advancedAnalytics: true,
      multiplePayoutMethods: true,
      whiteLabel: false,
    },
  },
  business: {
    eventsPerMonth: 50,
    ticketsPerEvent: 10000,
    teamMembers: 15,
    commissionRate: 2.5,
    features: {
      nfcEnabled: true,
      cashlessEnabled: true,
      customBranding: true,
      apiAccess: true,
      prioritySupport: true,
      advancedAnalytics: true,
      multiplePayoutMethods: true,
      whiteLabel: false,
    },
  },
  enterprise: {
    eventsPerMonth: -1, // unlimited
    ticketsPerEvent: -1, // unlimited
    teamMembers: -1, // unlimited
    commissionRate: 1.5, // negotiable
    features: {
      nfcEnabled: true,
      cashlessEnabled: true,
      customBranding: true,
      apiAccess: true,
      prioritySupport: true,
      advancedAnalytics: true,
      multiplePayoutMethods: true,
      whiteLabel: true,
    },
  },
};

export interface Subscription {
  id: string;
  organizationId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// USER TYPES
// ============================================

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface UserWallet {
  balance: number;
  bonusBalance: number;
  loyaltyPoints: number;
  loyaltyTier: LoyaltyTier;
  currency: string;
  lastTopUp?: Date;
  totalSpent: number;
}

export interface UserLoyalty {
  points: number;
  lifetimePoints: number;
  tier: LoyaltyTier;
  tierExpiresAt?: Date;
  nextTierAt: number;
}

export interface UserReferral {
  code: string;
  referredBy?: string;
  referralCount: number;
  totalEarned: number;
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  avatarUrl?: string;
  // Platform role (only for super admins)
  platformRole?: PlatformRole;
  // Organization membership (for org members)
  organizationId?: string;
  organizationRole?: OrganizationRole;
  // Consumer data (for end users)
  wallet?: UserWallet;
  loyalty?: UserLoyalty;
  referral?: UserReferral;
  // Preferences
  preferredLanguage: 'pt' | 'en';
  notificationsEnabled: boolean;
  // Metadata
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// ORGANIZATION TYPES (Multi-tenant)
// ============================================

export type OrganizationStatus = 'pending' | 'active' | 'suspended' | 'banned';

export interface PayoutMethod {
  id: string;
  type: 'bank_transfer' | 'mobile_money';
  accountName: string;
  accountNumber: string;
  bankName?: string;
  mobileProvider?: 'pagali' | 'cvmovel' | 'unitel';
  isDefault: boolean;
  verified: boolean;
}

export interface OrganizationBranding {
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  bannerUrl?: string;
  customDomain?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  description?: string;
  // Status
  status: OrganizationStatus;
  verified: boolean;
  verifiedAt?: Date;
  // Subscription
  subscriptionId?: string;
  plan: SubscriptionPlan;
  // Financial
  commissionRate: number;
  payoutMethods: PayoutMethod[];
  defaultPayoutMethodId?: string;
  // Branding
  branding?: OrganizationBranding;
  // Legal
  taxId?: string;
  legalName?: string;
  address?: string;
  // Ownership
  ownerId: string;
  // Metadata
  eventsCount: number;
  totalRevenue: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// ORGANIZATION MEMBER TYPES
// ============================================

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  permissions: Permission[];
  // Events this member can manage (empty = all)
  assignedEventIds: string[];
  invitedBy: string;
  joinedAt: Date;
  updatedAt: Date;
}

export interface OrganizationInvitation {
  id: string;
  organizationId: string;
  email: string;
  role: OrganizationRole;
  permissions: Permission[];
  status: InvitationStatus;
  invitedBy: string;
  token: string;
  expiresAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
}

// ============================================
// EVENT TYPES
// ============================================

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';
export type EventCategory =
  | 'music'
  | 'sports'
  | 'arts'
  | 'food'
  | 'business'
  | 'education'
  | 'community'
  | 'nightlife'
  | 'festival'
  | 'other';

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface EventSettings {
  requiresApproval: boolean;
  allowTransfers: boolean;
  allowRefunds: boolean;
  refundDeadlineHours: number;
  checkInStartMinutes: number;
  maxTicketsPerUser: number;
  ageRestriction: number;
}

export interface Event {
  id: string;
  organizationId: string;
  createdBy: string;
  title: string;
  slug: string;
  description: string;
  category: EventCategory;
  tags: string[];
  // Location
  venue: string;
  address: string;
  city: string;
  island?: string;
  country: string;
  location?: GeoPoint;
  // Schedule
  startDate: Date;
  endDate: Date;
  doorsOpen?: Date;
  timezone: string;
  // Media
  coverImage: string;
  gallery: string[];
  // Status
  status: EventStatus;
  publishedAt?: Date;
  isFeatured: boolean;
  featuredUntil?: Date;
  // Privacy
  isPublic: boolean;
  // Features
  nfcEnabled: boolean;
  cashlessEnabled: boolean;
  // Capacity & Sales
  totalCapacity: number;
  ticketsSold: number;
  checkIns: number;
  revenue: number;
  views: number;
  // Settings
  settings: EventSettings;
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  // QR Code Registration
  registration?: EventRegistration;
  qrScans?: number;
}

// ============================================
// EVENT REGISTRATION & QR CODE TYPES
// ============================================

export interface EventRegistration {
  enabled: boolean;
  guestRegistrationEnabled: boolean;
  customFields: CustomField[];
  qrCodeUrl?: string;
  qrCodeData?: string; // URL encoded in QR
  qrCodeGeneratedAt?: Date;
}

export interface CustomField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'select' | 'multiselect' | 'checkbox' | 'textarea';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select/multiselect
  order: number;
}

export interface GuestRegistration {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone: string;
  customFieldResponses?: Record<string, any>;
  demographics?: {
    ageRange?: string;
    gender?: string;
    island?: string;
    city?: string;
  };
  source: 'web' | 'qr' | 'social';
  registeredAt: Date;
  convertedToOrder?: boolean;
  orderId?: string;
}

// ============================================
// TICKET TYPES
// ============================================

export type TicketStatus = 'valid' | 'active' | 'used' | 'cancelled' | 'refunded' | 'transferred' | 'expired';

export interface TicketType {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  quantityTotal: number;
  quantitySold: number;
  quantityReserved: number;
  saleStart: Date;
  saleEnd: Date;
  maxPerOrder: number;
  minPerOrder: number;
  transferable: boolean;
  refundable: boolean;
  benefits?: string[];
  // Visibility
  isHidden: boolean;
  accessCode?: string;
  // Sorting
  sortOrder: number;
}

export interface Ticket {
  id: string;
  eventId: string;
  ticketTypeId: string;
  orderId: string;
  userId: string;
  organizationId: string;
  // Denormalized event/ticket data
  eventName: string;
  ticketTypeName: string;
  price: number;
  // Buyer info
  buyerName?: string;
  buyerEmail?: string;
  // Codes
  qrCode: string;
  qrCodeUrl?: string;
  nfcUid?: string;
  // Status
  status: TicketStatus;
  checkedInAt?: Date;
  checkedInBy?: string;
  checkedInGate?: string;
  // Transfer history
  transferredFrom?: string;
  transferredAt?: Date;
  originalUserId: string;
  // Metadata
  purchasedAt: Date;
}

// ============================================
// ORDER TYPES
// ============================================

export type OrderStatus = 'pending' | 'reserved' | 'paid' | 'cancelled' | 'refunded' | 'partially_refunded';
export type PaymentMethod = 'wallet' | 'stripe' | 'pagali' | 'vinti4' | 'free';

export interface OrderItem {
  ticketTypeId: string;
  ticketTypeName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderFees {
  serviceFee: number;
  platformFee: number;
  paymentProcessingFee: number;
  total: number;
}

export interface Order {
  id: string;
  eventId: string;
  organizationId: string;
  userId?: string; // Optional for guest orders
  // Guest information
  guestInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  source?: 'direct' | 'qr' | 'social' | 'email';
  // Items
  items: OrderItem[];
  subtotal: number;
  fees: OrderFees;
  totalAmount: number;
  currency: string;
  // Payment
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  stripePaymentIntentId?: string;
  // Reservation
  reservedUntil?: Date;
  // Refund
  refundedAmount?: number;
  refundedAt?: Date;
  refundReason?: string;
  // Timestamps
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// WALLET TRANSACTION TYPES
// ============================================

export type WalletTransactionType =
  | 'topup'
  | 'purchase'
  | 'cashback'
  | 'refund'
  | 'transfer_in'
  | 'transfer_out'
  | 'cashless_topup'
  | 'cashless_refund'
  | 'bonus_credit'
  | 'bonus_expiry';

export type WalletTransactionStatus = 'pending' | 'completed' | 'failed';
export type BalanceType = 'main' | 'bonus';

export interface WalletTransaction {
  id: string;
  userId: string;
  type: WalletTransactionType;
  amount: number;
  balanceType: BalanceType;
  balanceAfter: number;
  currency: string;
  status: WalletTransactionStatus;
  description: string;
  reference?: string;
  paymentMethod?: PaymentMethod;
  // Related entities
  orderId?: string;
  eventId?: string;
  createdAt: Date;
}

// ============================================
// NFC WRISTBAND TYPES
// ============================================

export type WristbandStatus = 'inactive' | 'active' | 'blocked' | 'lost';

export interface NfcWristband {
  uid: string;
  eventId: string;
  organizationId: string;
  userId?: string;
  ticketId?: string;
  balance: number;
  status: WristbandStatus;
  activatedAt?: Date;
  lastTransaction?: Date;
  offlineBalance: number;
  pin?: string;
  // Batch info
  batchId?: string;
}

// ============================================
// CASHLESS TRANSACTION TYPES
// ============================================

export type CashlessTransactionType = 'payment' | 'topup' | 'refund' | 'correction';
export type CashlessTransactionStatus = 'pending' | 'completed' | 'failed' | 'synced';

export interface CashlessTransaction {
  id: string;
  wristbandUid: string;
  eventId: string;
  organizationId: string;
  vendorId: string;
  terminalId: string;
  amount: number;
  balanceAfter: number;
  type: CashlessTransactionType;
  status: CashlessTransactionStatus;
  // Offline sync
  offline: boolean;
  offlineId?: string;
  syncedAt?: Date;
  // Items purchased
  items?: CashlessItem[];
  createdAt: Date;
}

export interface CashlessItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// ============================================
// CHECK-IN TYPES
// ============================================

export type CheckinType = 'in' | 'out';
export type CheckinMethod = 'qr' | 'nfc' | 'manual';

export interface Checkin {
  id: string;
  eventId: string;
  organizationId: string;
  ticketId: string;
  userId: string;
  type: CheckinType;
  method: CheckinMethod;
  gate?: string;
  zone?: string;
  staffId: string;
  staffName?: string;
  // Device info
  deviceId?: string;
  // Location
  location?: GeoPoint;
  timestamp: Date;
}

// ============================================
// VENDOR TYPES
// ============================================

export type VendorCategory = 'food' | 'drinks' | 'merchandise' | 'services' | 'other';

export interface Vendor {
  id: string;
  eventId: string;
  organizationId: string;
  name: string;
  category: VendorCategory;
  description?: string;
  logoUrl?: string;
  // Location at event
  location?: string;
  // Terminals
  terminalIds: string[];
  // Sales
  totalSales: number;
  transactionCount: number;
  // Commission
  commissionRate: number;
  // Contact
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  // Status
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface VendorProduct {
  id: string;
  vendorId: string;
  eventId: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
  sortOrder: number;
}

// ============================================
// REWARD TYPES
// ============================================

export type RewardType = 'discount' | 'freeTicket' | 'merchandise' | 'experience' | 'cashback';

export interface Reward {
  id: string;
  name: string;
  description: string;
  type: RewardType;
  pointsCost: number;
  value?: number;
  stock?: number;
  stockRemaining?: number;
  validFrom?: Date;
  validUntil?: Date;
  terms?: string;
  imageUrl?: string;
  isActive: boolean;
  // Restrictions
  minTier?: LoyaltyTier;
  eventIds?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RewardRedemption {
  id: string;
  rewardId: string;
  userId: string;
  pointsSpent: number;
  code?: string;
  usedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
}

// ============================================
// PAYOUT TYPES
// ============================================

export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Payout {
  id: string;
  organizationId: string;
  eventId?: string;
  // Amount
  grossAmount: number;
  platformFee: number;
  processingFee: number;
  netAmount: number;
  currency: string;
  // Status
  status: PayoutStatus;
  failureReason?: string;
  // Method
  payoutMethodId: string;
  payoutMethod: PayoutMethod;
  // Reference
  reference?: string;
  // Timestamps
  processedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

// ============================================
// PLATFORM ANALYTICS (Super Admin)
// ============================================

export interface PlatformStats {
  totalOrganizations: number;
  activeOrganizations: number;
  totalEvents: number;
  activeEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  platformFees: number;
  // Period stats
  periodStart: Date;
  periodEnd: Date;
  newOrganizations: number;
  newEvents: number;
  periodTicketsSold: number;
  periodRevenue: number;
}

export interface OrganizationStats {
  organizationId: string;
  totalEvents: number;
  activeEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  totalPayouts: number;
  pendingPayouts: number;
  // Period stats
  periodStart: Date;
  periodEnd: Date;
  periodEvents: number;
  periodTicketsSold: number;
  periodRevenue: number;
}

// ============================================
// AUDIT LOG TYPES
// ============================================

export type AuditAction =
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'organization.created'
  | 'organization.updated'
  | 'organization.suspended'
  | 'organization.verified'
  | 'member.invited'
  | 'member.joined'
  | 'member.removed'
  | 'member.role_changed'
  | 'event.created'
  | 'event.updated'
  | 'event.published'
  | 'event.cancelled'
  | 'ticket.purchased'
  | 'ticket.refunded'
  | 'ticket.transferred'
  | 'payout.requested'
  | 'payout.completed'
  | 'subscription.changed'
  | 'settings.updated';

export interface AuditLog {
  id: string;
  action: AuditAction;
  actorId: string;
  actorEmail: string;
  actorRole: SystemRole;
  // Target
  targetType: 'user' | 'organization' | 'event' | 'ticket' | 'order' | 'payout' | 'member';
  targetId: string;
  // Context
  organizationId?: string;
  eventId?: string;
  // Changes
  changes?: Record<string, { before: unknown; after: unknown }>;
  metadata?: Record<string, unknown>;
  // Request info
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  cursor?: string;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType =
  // Order notifications
  | 'order_confirmed'
  | 'order_cancelled'
  | 'order_refunded'
  // Ticket notifications
  | 'ticket_transferred'
  | 'ticket_received'
  | 'ticket_checkin'
  // Event notifications
  | 'event_reminder'
  | 'event_cancelled'
  | 'event_updated'
  // Wallet notifications
  | 'wallet_topup'
  | 'cashback_received'
  | 'bonus_received'
  | 'bonus_expiring'
  // Loyalty notifications
  | 'loyalty_tier_upgrade'
  | 'reward_available'
  // Organization notifications
  | 'org_invitation'
  | 'org_member_joined'
  | 'payout_completed'
  | 'subscription_expiring';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
  // Channels
  channels: ('push' | 'email' | 'sms')[];
  // Status
  read: boolean;
  readAt?: Date;
  // Delivery status per channel
  deliveryStatus?: Record<string, 'pending' | 'sent' | 'delivered' | 'failed'>;
  createdAt: Date;
}

// ============================================
// SUPPORT TICKET TYPES (Super Admin)
// ============================================

export type SupportTicketStatus = 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed';
export type SupportTicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type SupportTicketCategory =
  | 'billing'
  | 'technical'
  | 'account'
  | 'event'
  | 'payout'
  | 'verification'
  | 'other';

export interface SupportTicket {
  id: string;
  organizationId?: string;
  userId: string;
  // Content
  subject: string;
  description: string;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  // Assignment
  assignedTo?: string;
  // Resolution
  resolvedAt?: Date;
  resolution?: string;
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface SupportTicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: SystemRole;
  message: string;
  attachments?: string[];
  isInternal: boolean;
  createdAt: Date;
}

// ============================================
// ANALYTICS & AGGREGATIONS
// ============================================

/**
 * Daily analytics aggregation for platform-wide metrics
 * Stored in /analytics_daily/{date} collection
 */
export interface DailyAnalytics {
  id: string; // Format: YYYY-MM-DD
  date: Date;

  // Core metrics
  revenue: number;
  ticketsSold: number;
  newUsers: number;
  newOrganizations: number;
  newEvents: number;
  activeEvents: number;
  platformFees: number;
  refunds: number;

  // Breakdowns
  byCategory: Record<string, {
    events: number;
    tickets: number;
    revenue: number;
  }>;

  byOrganization: Record<string, {
    events: number;
    tickets: number;
    revenue: number;
  }>;

  // Payment methods
  byPaymentMethod: Record<string, {
    count: number;
    volume: number;
  }>;

  // Metadata
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Monthly analytics aggregation (rolled up from daily)
 * Stored in /analytics_monthly/{month} collection
 */
export interface MonthlyAnalytics {
  id: string; // Format: YYYY-MM
  month: string; // "2025-12"
  year: number;

  // Core metrics
  revenue: number;
  ticketsSold: number;
  newUsers: number;
  newOrganizations: number;
  eventsCreated: number;
  platformFees: number;

  // Trends (comparison to previous month)
  revenueGrowth: number; // Percentage
  ticketsGrowth: number;
  usersGrowth: number;
  organizationsGrowth: number;

  // Top performers
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

  // Category breakdown
  byCategory: Record<string, {
    events: number;
    tickets: number;
    revenue: number;
  }>;

  // Metadata
  createdAt: Date;
}

/**
 * Platform analytics response (for API/UI)
 */
export interface PlatformAnalytics {
  overview: {
    totalRevenue: number;
    totalTicketsSold: number;
    totalUsers: number;
    totalOrganizations: number;
    totalEvents: number;
    platformFees: number;
    avgTicketPrice: number;
  };

  trends: {
    revenue: Array<{ date: string; value: number }>;
    tickets: Array<{ date: string; value: number }>;
    organizations: Array<{ date: string; value: number }>;
    users: Array<{ date: string; value: number }>;
  };

  comparison: {
    revenueChange: number; // % vs previous period
    ticketsChange: number;
    usersChange: number;
    organizationsChange: number;
  };

  distribution: {
    byCategory: Array<{ category: string; count: number; revenue: number }>;
    byStatus: Array<{ status: string; count: number }>;
  };
}

/**
 * Date range for analytics queries
 */
export interface DateRange {
  start: Date;
  end: Date;
}

// ============================================
// EXPORT NEW MODULES
// ============================================

export * from './ai';
export * from './gamification';
export * from './calendar';
export * from './webhooks';
export * from './translation';
export * from './chat';
