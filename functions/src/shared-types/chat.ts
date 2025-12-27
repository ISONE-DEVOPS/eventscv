// ============================================
// EVENT CHAT TYPES
// ============================================

export type MessageType = 'text' | 'image' | 'announcement' | 'system';
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'deleted' | 'moderated';

/**
 * Chat message in event chat room
 */
export interface EventChatMessage {
  id: string;
  eventId: string;
  roomId?: string; // Optional: for private rooms or channels

  // Sender
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderRole?: 'guest' | 'attendee' | 'organizer' | 'staff' | 'moderator';

  // Content
  type: MessageType;
  content: string;
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;

  // Status
  status: MessageStatus;
  edited: boolean;
  editedAt?: Date | any;

  // Replies
  replyTo?: string; // Message ID being replied to
  replyPreview?: {
    senderName: string;
    content: string;
  };

  // Reactions
  reactions?: {
    [emoji: string]: {
      count: number;
      users: string[]; // User IDs who reacted
    };
  };

  // Moderation
  flagged: boolean;
  flagCount: number;
  moderatedBy?: string;
  moderatedAt?: Date | any;
  moderationReason?: string;

  // Metadata
  createdAt: Date | any;
  updatedAt?: Date | any;
}

/**
 * Event chat room configuration
 */
export interface ChatRoom {
  id: string;
  eventId: string;

  // Configuration
  name: string;
  description?: string;
  type: 'public' | 'vip' | 'backstage' | 'private';

  // Access control
  allowedTicketTypes?: string[]; // Empty = all ticket holders
  allowedUserIds?: string[]; // Specific users (for private rooms)
  requiresApproval: boolean;

  // Features
  allowImages: boolean;
  allowReactions: boolean;
  allowReplies: boolean;
  slowMode?: number; // Seconds between messages per user

  // Moderation
  moderationEnabled: boolean;
  autoModerateKeywords?: string[];
  moderatorIds: string[];

  // Stats
  messageCount: number;
  participantCount: number;

  // Status
  isActive: boolean;

  // Metadata
  createdBy: string;
  createdAt: Date | any;
  updatedAt?: Date | any;
}

/**
 * Chat participant (user in chat room)
 */
export interface ChatParticipant {
  id: string;
  roomId: string;
  eventId: string;

  // User info
  userId: string;
  userName: string;
  userAvatar?: string;

  // Role & permissions
  role: 'guest' | 'attendee' | 'organizer' | 'staff' | 'moderator';
  canSendMessages: boolean;
  canSendImages: boolean;
  canModerate: boolean;

  // Status
  isOnline: boolean;
  lastSeen?: Date | any;

  // Restrictions
  isMuted: boolean;
  mutedUntil?: Date | any;
  isBanned: boolean;
  bannedUntil?: Date | any;

  // Stats
  messagesSent: number;
  lastMessageAt?: Date | any;

  // Metadata
  joinedAt: Date | any;
  leftAt?: Date | any;
}

/**
 * Message flag report
 */
export interface MessageFlag {
  id: string;
  messageId: string;
  eventId: string;
  roomId?: string;

  // Reporter
  reportedBy: string;
  reporterName: string;

  // Reason
  reason: 'spam' | 'harassment' | 'offensive' | 'inappropriate' | 'other';
  details?: string;

  // Status
  status: 'pending' | 'reviewed' | 'dismissed' | 'action_taken';
  reviewedBy?: string;
  reviewedAt?: Date | any;
  actionTaken?: string;

  // Metadata
  createdAt: Date | any;
}

/**
 * Chat analytics
 */
export interface ChatAnalytics {
  eventId: string;
  roomId?: string;

  // Metrics
  totalMessages: number;
  totalParticipants: number;
  activeParticipants: number; // Last hour
  peakParticipants: number;

  // Message breakdown
  messagesByType: {
    text: number;
    image: number;
    announcement: number;
    system: number;
  };

  // Moderation stats
  flaggedMessages: number;
  deletedMessages: number;
  mutedUsers: number;
  bannedUsers: number;

  // Engagement
  averageMessagesPerUser: number;
  topContributors: Array<{
    userId: string;
    userName: string;
    messageCount: number;
  }>;

  // Timeline
  messagesPerHour: Array<{
    hour: string; // ISO timestamp
    count: number;
  }>;

  // Metadata
  generatedAt: Date | any;
}

/**
 * Typing indicator
 */
export interface TypingIndicator {
  roomId: string;
  userId: string;
  userName: string;
  startedAt: Date | any;
  expiresAt: Date | any; // Auto-expire after 5 seconds
}

/**
 * Chat notification preferences
 */
export interface ChatNotificationSettings {
  userId: string;
  eventId: string;

  // Preferences
  enableNotifications: boolean;
  enableSounds: boolean;
  notifyOnMention: boolean;
  notifyOnReply: boolean;
  notifyOnReaction: boolean;

  // Muted rooms
  mutedRooms: string[];

  // Metadata
  updatedAt: Date | any;
}
