// ============================================
// EVENT BLASTS TYPES
// Multi-channel messaging for event organizers
// ============================================

export type BlastChannel = 'email' | 'sms' | 'push';
export type BlastStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled' | 'failed';
export type BlastType = 'announcement' | 'reminder' | 'update' | 'promotion' | 'last_call';

/**
 * Recipient filter criteria
 */
export interface BlastRecipientFilter {
  // Ticket filters
  ticketTypes?: string[]; // Filter by ticket type IDs
  ticketStatus?: ('valid' | 'active' | 'used')[]; // Filter by ticket status
  purchasedAfter?: Date | any; // Purchased after date
  purchasedBefore?: Date | any; // Purchased before date

  // User filters
  hasAttended?: boolean; // Users who checked in
  hasNotAttended?: boolean; // Users who haven't checked in
  city?: string[]; // Filter by city
  island?: string[]; // Filter by island (Cape Verde specific)

  // Engagement filters
  loyaltyTier?: ('bronze' | 'silver' | 'gold' | 'platinum')[]; // Filter by loyalty tier
  minEventsAttended?: number; // Minimum events attended

  // Custom filters
  tags?: string[]; // Custom tags
  customFieldFilters?: {
    fieldId: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
    value: string | number;
  }[];

  // Exclusions
  excludeUserIds?: string[]; // Exclude specific users
  excludeTicketIds?: string[]; // Exclude specific tickets
}

/**
 * Blast template for different channels
 */
export interface BlastTemplate {
  // Email template
  email?: {
    subject: string;
    bodyHtml?: string; // HTML body
    bodyText: string; // Plain text fallback
    replyTo?: string;
    fromName?: string;
  };

  // SMS template
  sms?: {
    message: string; // Max 160 chars for single SMS
    sender?: string; // Sender ID (max 11 chars)
  };

  // Push notification template
  push?: {
    title: string;
    body: string;
    icon?: string;
    image?: string;
    clickAction?: string; // URL to open on click
    data?: Record<string, string>; // Additional data
  };
}

/**
 * Blast scheduling options
 */
export interface BlastSchedule {
  sendAt: Date | any; // When to send
  timezone?: string; // Timezone for scheduling (default: Atlantic/Cape_Verde)
  sendImmediately?: boolean; // Override schedule and send now
}

/**
 * Blast delivery statistics
 */
export interface BlastDeliveryStats {
  // Overall stats
  totalRecipients: number;
  totalSent: number;
  totalFailed: number;
  totalPending: number;

  // Per channel stats
  byChannel: {
    [key in BlastChannel]?: {
      sent: number;
      delivered: number;
      failed: number;
      opened?: number; // Email only
      clicked?: number; // Email/Push only
      bounced?: number; // Email/SMS only
    };
  };

  // Engagement
  openRate?: number; // Email
  clickRate?: number; // Email/Push
  bounceRate?: number; // Email/SMS

  // Cost (if applicable)
  estimatedCost?: number;
  actualCost?: number;
  currency?: string;
}

/**
 * Event blast
 */
export interface EventBlast {
  id: string;
  eventId: string;
  organizationId: string;

  // Metadata
  name: string; // Internal name for blast
  description?: string;
  type: BlastType;

  // Channels
  channels: BlastChannel[];
  template: BlastTemplate;

  // Recipients
  recipientFilter: BlastRecipientFilter;
  recipientCount?: number; // Calculated recipient count

  // Scheduling
  schedule: BlastSchedule;
  status: BlastStatus;

  // Delivery
  deliveryStats?: BlastDeliveryStats;

  // Errors
  errors?: {
    channel: BlastChannel;
    error: string;
    count: number;
  }[];

  // Metadata
  createdBy: string;
  createdAt: Date | any;
  updatedAt?: Date | any;
  scheduledAt?: Date | any;
  sentAt?: Date | any;
  cancelledAt?: Date | any;
  cancelledBy?: string;
  cancellationReason?: string;
}

/**
 * Blast recipient (individual delivery record)
 */
export interface BlastRecipient {
  id: string;
  blastId: string;
  eventId: string;

  // Recipient info
  userId: string;
  userEmail?: string;
  userPhone?: string;
  userName?: string;
  ticketId?: string;

  // Delivery status per channel
  deliveryStatus: {
    [key in BlastChannel]?: {
      status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced' | 'opened' | 'clicked';
      sentAt?: Date | any;
      deliveredAt?: Date | any;
      openedAt?: Date | any;
      clickedAt?: Date | any;
      failedAt?: Date | any;
      error?: string;
      provider?: string; // Email/SMS provider used
      providerMessageId?: string; // Provider's message ID
    };
  };

  // Metadata
  createdAt: Date | any;
  updatedAt?: Date | any;
}

/**
 * Blast template library (reusable templates)
 */
export interface BlastTemplateLibrary {
  id: string;
  organizationId: string;

  // Template info
  name: string;
  description?: string;
  category: 'announcement' | 'reminder' | 'promotion' | 'update' | 'custom';

  // Template content
  template: BlastTemplate;

  // Usage stats
  usageCount: number;
  lastUsedAt?: Date | any;

  // Metadata
  isPublic: boolean; // Available to all organizations
  createdBy: string;
  createdAt: Date | any;
  updatedAt?: Date | any;
}

/**
 * Blast campaign (group of related blasts)
 */
export interface BlastCampaign {
  id: string;
  organizationId: string;

  // Campaign info
  name: string;
  description?: string;
  eventIds: string[]; // Events in this campaign

  // Blasts
  blastIds: string[];

  // Stats (aggregated from blasts)
  totalRecipients: number;
  totalSent: number;
  totalOpened: number;
  totalClicked: number;

  // Status
  isActive: boolean;

  // Metadata
  createdBy: string;
  createdAt: Date | any;
  updatedAt?: Date | any;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface CreateBlastRequest {
  eventId: string;
  name: string;
  description?: string;
  type: BlastType;
  channels: BlastChannel[];
  template: BlastTemplate;
  recipientFilter: BlastRecipientFilter;
  schedule: BlastSchedule;
}

export interface CreateBlastResponse {
  blastId: string;
  estimatedRecipients: number;
  estimatedCost?: number;
  scheduledFor?: Date;
}

export interface GetBlastStatusRequest {
  blastId: string;
}

export interface GetBlastStatusResponse {
  blast: EventBlast;
  deliveryStats: BlastDeliveryStats;
  recentErrors?: {
    channel: BlastChannel;
    error: string;
    count: number;
  }[];
}

export interface CancelBlastRequest {
  blastId: string;
  reason?: string;
}

export interface SendTestBlastRequest {
  blastId: string;
  testRecipients: {
    email?: string;
    phone?: string;
    pushToken?: string;
  }[];
}
