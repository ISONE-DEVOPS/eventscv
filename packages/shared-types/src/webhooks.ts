// ============================================
// WEBHOOKS & INTEGRATIONS
// ============================================

/**
 * Webhook events that can trigger notifications
 */
export type WebhookEvent =
  // Event lifecycle
  | 'event.created'
  | 'event.updated'
  | 'event.published'
  | 'event.cancelled'
  | 'event.deleted'
  // Ticket events
  | 'ticket.purchased'
  | 'ticket.refunded'
  | 'ticket.transferred'
  | 'ticket.cancelled'
  // Check-in events
  | 'attendee.checked_in'
  | 'attendee.checked_out'
  // Order events
  | 'order.created'
  | 'order.completed'
  | 'order.failed'
  | 'order.refunded'
  // Payout events
  | 'payout.requested'
  | 'payout.processing'
  | 'payout.completed'
  | 'payout.failed'
  // Calendar events
  | 'calendar.created'
  | 'calendar.subscriber_added'
  | 'calendar.newsletter_sent'
  // Other
  | 'user.registered'
  | 'review.submitted';

/**
 * Webhook configuration
 */
export interface Webhook {
  id: string;
  organizationId: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  secret: string; // For signature validation
  enabled: boolean;
  // Retry configuration
  retryConfig: {
    maxAttempts: number;
    backoffMultiplier: number; // Exponential backoff
  };
  // Stats
  lastDeliveryAt?: Date;
  lastStatus?: 'success' | 'failed';
  successCount: number;
  failureCount: number;
  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Webhook delivery attempt
 */
export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  payload: any; // Event-specific data
  // HTTP details
  url: string;
  method: 'POST';
  headers: Record<string, string>;
  // Response
  status: 'pending' | 'success' | 'failed';
  statusCode?: number;
  responseBody?: string;
  errorMessage?: string;
  // Retry
  attempts: number;
  maxAttempts: number;
  nextRetryAt?: Date;
  // Timing
  deliveredAt?: Date;
  durationMs?: number;
  createdAt: Date;
}

/**
 * Webhook signature for validation
 */
export interface WebhookSignature {
  algorithm: 'sha256';
  signature: string;
  timestamp: number;
}

// ============================================
// N8N INTEGRATION
// ============================================

/**
 * n8n workflow configuration
 */
export interface N8NWorkflow {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  webhookUrl: string; // n8n.pagali.ai webhook URL
  triggerEvents: WebhookEvent[];
  enabled: boolean;
  // Stats
  executionCount: number;
  lastExecutionAt?: Date;
  lastStatus?: 'success' | 'failed';
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * n8n workflow execution log
 */
export interface N8NExecutionLog {
  id: string;
  workflowId: string;
  event: WebhookEvent;
  payload: any;
  status: 'running' | 'success' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  durationMs?: number;
  errorMessage?: string;
}

// ============================================
// ZOOM INTEGRATION
// ============================================

/**
 * Zoom meeting configuration for virtual events
 */
export interface ZoomMeeting {
  id: string;
  eventId: string;
  organizationId: string;
  // Zoom details
  meetingId: string; // Zoom meeting ID
  meetingPassword?: string;
  joinUrl: string;
  startUrl: string; // For host
  // Settings
  settings: {
    hostVideo: boolean;
    participantVideo: boolean;
    joinBeforeHost: boolean;
    waitingRoom: boolean;
    muteUponEntry: boolean;
    autoRecording: 'none' | 'local' | 'cloud';
    approvalType: 'automatic' | 'manual';
  };
  // Stats
  participantCount?: number;
  duration?: number; // minutes
  // Status
  status: 'scheduled' | 'started' | 'ended';
  startedAt?: Date;
  endedAt?: Date;
  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Zoom OAuth credentials per organization
 */
export interface ZoomCredentials {
  organizationId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scope: string;
  // Zoom account info
  accountId: string;
  accountEmail: string;
  // Metadata
  connectedAt: Date;
  updatedAt: Date;
}

/**
 * Zoom meeting participant
 */
export interface ZoomParticipant {
  meetingId: string;
  eventId: string;
  userId?: string; // Events.cv user ID if linked
  zoomUserId: string;
  name: string;
  email?: string;
  joinedAt: Date;
  leftAt?: Date;
  duration?: number; // seconds
}

// ============================================
// GOOGLE MEET INTEGRATION
// ============================================

/**
 * Google Meet configuration
 */
export interface GoogleMeet {
  id: string;
  eventId: string;
  organizationId: string;
  // Google Calendar event
  calendarEventId: string;
  meetingUrl: string;
  // Settings
  autoSendLink: boolean;
  sendReminderHours: number; // Hours before event
  // Stats
  estimatedParticipants?: number;
  // Status
  status: 'scheduled' | 'active' | 'ended';
  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// SPOTIFY INTEGRATION (Collaborative Playlists)
// ============================================

/**
 * Spotify playlist for event
 */
export interface SpotifyPlaylist {
  id: string;
  eventId: string;
  organizationId: string;
  // Spotify details
  playlistId: string;
  playlistUrl: string;
  playlistName: string;
  // Settings
  collaborative: boolean;
  allowRequests: boolean;
  requireApproval: boolean;
  allowVoting: boolean;
  // Stats
  trackCount: number;
  followerCount: number;
  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Song request for playlist
 */
export interface SongRequest {
  id: string;
  eventId: string;
  playlistId: string;
  userId: string;
  userName: string;
  // Song details
  spotifyUri: string;
  songTitle: string;
  artist: string;
  albumArt?: string;
  duration?: number; // seconds
  // Voting
  votes: number;
  voters: string[]; // User IDs
  // Tip (optional)
  tipAmount?: number;
  tipPaid: boolean;
  // Status
  status: 'pending' | 'approved' | 'rejected' | 'played';
  approvedBy?: string;
  playedAt?: Date;
  // Metadata
  requestedAt: Date;
}
