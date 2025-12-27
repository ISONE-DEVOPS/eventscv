// ============================================
// CALENDAR TYPES (Event Series & Communities)
// ============================================

export type CalendarVisibility = 'public' | 'private' | 'unlisted';

/**
 * Event calendar (series of events by same organizer)
 */
export interface Calendar {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description: string;
  coverImage?: string;
  bannerImage?: string;
  visibility: CalendarVisibility;
  // Settings
  settings: {
    allowMemberEvents: boolean; // Members can submit events
    requireApproval: boolean; // Events need approval
    allowDiscussions: boolean; // Enable discussion board
    membershipRequired: boolean; // Must be member to subscribe
  };
  // Stats
  subscriberCount: number;
  eventCount: number;
  totalAttendees: number;
  // Membership (if enabled)
  membershipEnabled: boolean;
  membershipPrice?: number; // Monthly fee
  membershipBenefits?: string[];
  // Social
  website?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Calendar theme/branding
 */
export interface CalendarTheme {
  calendarId: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily?: string;
  logoUrl?: string;
  customCSS?: string;
  updatedAt: Date;
}

// ============================================
// CALENDAR SUBSCRIBERS
// ============================================

export type SubscriptionTier = 'free' | 'premium';

/**
 * User subscribed to calendar
 */
export interface CalendarSubscriber {
  id: string;
  calendarId: string;
  userId: string;
  tier: SubscriptionTier;
  // Notification preferences
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  notificationFrequency: 'all' | 'daily' | 'weekly' | 'monthly';
  // Membership
  isMember: boolean;
  memberSince?: Date;
  membershipExpiresAt?: Date;
  // Stats
  eventsAttended: number;
  lastEventDate?: Date;
  // Metadata
  subscribedAt: Date;
  unsubscribedAt?: Date;
}

/**
 * Calendar newsletter
 */
export interface CalendarNewsletter {
  id: string;
  calendarId: string;
  subject: string;
  content: string; // HTML or Markdown
  // Targeting
  sendToAll: boolean;
  sendToTier?: SubscriptionTier;
  sendToMembers?: boolean;
  // Stats
  recipientCount: number;
  sentCount: number;
  openedCount: number;
  clickedCount: number;
  // Schedule
  scheduledFor?: Date;
  sentAt?: Date;
  // Metadata
  createdBy: string;
  createdAt: Date;
}

// ============================================
// CALENDAR EVENTS
// ============================================

/**
 * Extension to Event type for calendar events
 */
export interface CalendarEvent {
  eventId: string;
  calendarId: string;
  // Calendar-specific settings
  memberExclusive: boolean; // Only members can attend
  memberDiscount?: number; // Percentage discount for members
  earlyAccess?: {
    enabled: boolean;
    hoursBeforePublic: number;
  };
  // Recurring
  isRecurring: boolean;
  recurrenceRule?: RecurrenceRule;
  seriesId?: string; // Groups recurring events
  // Status
  featured: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  addedAt: Date;
}

/**
 * Recurrence rule for recurring events
 */
export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  interval: number; // Every X days/weeks/months
  daysOfWeek?: number[]; // 0-6 (Sunday-Saturday) for weekly
  dayOfMonth?: number; // 1-31 for monthly
  endDate?: Date;
  occurrences?: number; // End after X occurrences
  exceptions?: Date[]; // Skip these dates
}

// ============================================
// CALENDAR MEMBERS
// ============================================

export type MemberRole = 'owner' | 'admin' | 'moderator' | 'member';
export type MemberStatus = 'active' | 'pending' | 'suspended' | 'cancelled';

/**
 * Calendar member (paid membership)
 */
export interface CalendarMember {
  id: string;
  calendarId: string;
  userId: string;
  role: MemberRole;
  status: MemberStatus;
  // Billing
  subscriptionId?: string; // Stripe subscription
  nextBillingDate?: Date;
  // Permissions
  canPostEvents: boolean;
  canModerate: boolean;
  canAccessMemberArea: boolean;
  // Stats
  eventsAttended: number;
  eventsCreated: number;
  // Metadata
  joinedAt: Date;
  suspendedAt?: Date;
  cancelledAt?: Date;
}

/**
 * Calendar member application (if approval required)
 */
export interface MemberApplication {
  id: string;
  calendarId: string;
  userId: string;
  answers?: {
    question: string;
    answer: string;
  }[];
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
  appliedAt: Date;
}

// ============================================
// CALENDAR DISCUSSIONS
// ============================================

/**
 * Discussion topic in calendar community
 */
export interface CalendarDiscussion {
  id: string;
  calendarId: string;
  userId: string;
  title: string;
  content: string;
  isPinned: boolean;
  isLocked: boolean;
  // Stats
  replyCount: number;
  viewCount: number;
  likeCount: number;
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastReplyAt?: Date;
}

/**
 * Reply to discussion
 */
export interface DiscussionReply {
  id: string;
  discussionId: string;
  userId: string;
  content: string;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
}
