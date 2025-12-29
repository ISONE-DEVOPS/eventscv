// ============================================
// AI & CHAT ASSISTANT TYPES (LYRA)
// ============================================

export type ChatRole = 'user' | 'assistant' | 'system';
export type ChatLanguage = 'pt' | 'en' | 'cv';
export type ChatIntent = 'question' | 'purchase' | 'support' | 'feedback' | 'discovery';

/**
 * Chat message between user and Lyra
 */
export interface ChatMessage {
  id: string;
  eventId?: string;
  userId: string;
  role: ChatRole;
  content: string;
  language: ChatLanguage;
  metadata?: {
    intent?: ChatIntent;
    confidence?: number;
    suggestions?: string[];
    eventIds?: string[]; // Referenced events
  };
  createdAt: Date;
}

/**
 * Context provided to Lyra for personalized responses
 */
export interface ChatContext {
  user: {
    id: string;
    name: string;
    language: ChatLanguage;
    location?: string;
    pastEvents: string[];
    loyaltyTier: string;
    loyaltyPoints: number;
    favoriteCategories: string[];
  };
  event?: {
    id: string;
    title: string;
    category: string;
    date: Date;
    time: string;
    venue: string;
    address: string;
    city: string;
    ticketTypes: {
      name: string;
      price: number;
      available: number;
    }[];
    totalAvailable: number;
    percentageSold: number;
    friendsGoing: number;
  };
  conversationHistory: {
    role: ChatRole;
    content: string;
  }[];
}

/**
 * Action button suggested by Lyra
 */
export interface AIAction {
  label: string;
  action: 'buy_tickets' | 'show_map' | 'share' | 'add_to_calendar' | 'view_tickets' | 'contact_support' | 'view_event' | 'browse_events' | 'create_account';
  data?: {
    eventId?: string;
    ticketTypeId?: string;
    url?: string;
  };
}

/**
 * Chat response from Lyra
 */
export interface ChatResponse {
  message: string;
  actions: AIAction[];
  conversationId: string;
  language: ChatLanguage;
}

// ============================================
// AI CONTENT GENERATION TYPES
// ============================================

export type ContentType = 'description' | 'email' | 'social_post' | 'blast';
export type PosterStyle = 'vibrant' | 'minimal' | 'elegant' | 'dark';

/**
 * AI-generated content
 */
export interface AIGeneratedContent {
  id: string;
  eventId?: string;
  organizationId: string;
  type: ContentType;
  prompt: string;
  content: string;
  language: ChatLanguage;
  metadata?: {
    model?: string;
    tokensUsed?: number;
    generationTime?: number;
  };
  approved: boolean;
  usedInProduction: boolean;
  generatedBy: string;
  createdAt: Date;
}

/**
 * AI-generated poster
 */
export interface AIPoster {
  id: string;
  eventId: string;
  organizationId: string;
  style: PosterStyle;
  prompt: string;
  imageUrl: string;
  thumbnailUrl?: string;
  metadata?: {
    model?: string;
    generationTime?: number;
    resolution?: string;
  };
  approved: boolean;
  setAsCover: boolean;
  generatedBy: string;
  createdAt: Date;
}

// ============================================
// AI RECOMMENDATIONS TYPES
// ============================================

/**
 * Personalized event recommendation
 */
export interface EventRecommendation {
  eventId: string;
  userId: string;
  score: number; // 0-1
  reasons: RecommendationReason[];
  friendsGoing: {
    userId: string;
    userName: string;
    userAvatar?: string;
  }[];
  generatedAt: Date;
}

export interface RecommendationReason {
  type: 'category_match' | 'friend_attending' | 'location_nearby' | 'price_match' | 'past_behavior' | 'trending';
  weight: number;
  description: string;
}

/**
 * Event embedding for vector search
 */
export interface EventEmbedding {
  eventId: string;
  embedding: number[]; // 1536 dimensions (OpenAI)
  metadata: {
    title: string;
    category: string;
    tags: string[];
    city: string;
    price: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// AI ANALYTICS & INSIGHTS TYPES
// ============================================

export type InsightType = 'positive' | 'alert' | 'suggestion' | 'neutral';
export type InsightCategory = 'sales' | 'marketing' | 'pricing' | 'operations' | 'audience';

/**
 * AI-generated insight about event
 */
export interface AIInsight {
  id: string;
  eventId: string;
  organizationId: string;
  type: InsightType;
  category: InsightCategory;
  title: string;
  description: string;
  actionable: boolean;
  actions?: {
    label: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
  }[];
  metadata?: {
    dataPoints?: any;
    confidence?: number;
  };
  acknowledged: boolean;
  acknowledgedAt?: Date;
  createdAt: Date;
}

/**
 * Complete AI analytics report
 */
export interface AIAnalyticsReport {
  eventId: string;
  organizationId: string;
  insights: AIInsight[];
  summary: string;
  predictions?: {
    expectedSales: number;
    expectedRevenue: number;
    sellOutDate?: Date;
    confidence: number;
  };
  comparisons?: {
    vsLastEvent?: {
      metric: string;
      change: number; // percentage
      better: boolean;
    }[];
    vsSimilarEvents?: {
      metric: string;
      vsAverage: number; // percentage
      rank?: number;
    }[];
  };
  generatedAt: Date;
}

// ============================================
// AI MODERATION TYPES
// ============================================

export type ModerationCategory = 'spam' | 'hate' | 'violence' | 'sexual' | 'harassment' | 'self_harm';

/**
 * Content moderation result
 */
export interface ModerationResult {
  id: string;
  contentId: string; // Message ID, comment ID, etc
  contentType: 'chat_message' | 'event_description' | 'review' | 'comment';
  flagged: boolean;
  categories: {
    [key in ModerationCategory]: boolean;
  };
  scores: {
    [key in ModerationCategory]: number;
  };
  action: 'none' | 'flag' | 'delete' | 'warn_user' | 'ban_user';
  actionTaken: boolean;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
}

// ============================================
// AI TRANSLATION TYPES
// ============================================

export interface TranslatedContent {
  originalText: string;
  originalLanguage: ChatLanguage;
  translations: {
    [key in ChatLanguage]?: string;
  };
  translatedAt: Date;
}

export interface EventTranslation {
  eventId: string;
  title: TranslatedContent;
  description: TranslatedContent;
  autoTranslated: boolean;
  verified: boolean;
  verifiedBy?: string;
  updatedAt: Date;
}
