// ============================================
// GAMIFICATION TYPES
// ============================================

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type AchievementCategory = 'attendance' | 'social' | 'spending' | 'engagement' | 'loyalty';

/**
 * Achievement definition
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji or icon name
  category: AchievementCategory;
  points: number;
  rarity: AchievementRarity;
  requirement: {
    type: 'event_count' | 'check_in_time' | 'spending' | 'referrals' | 'shares' | 'reviews' | 'streak';
    threshold: number;
    timeframe?: 'day' | 'week' | 'month' | 'year' | 'all_time';
    metadata?: any; // Type-specific data
  };
  reward?: {
    type: 'discount' | 'free_ticket' | 'merchandise' | 'access' | 'badge';
    value: number | string;
  };
  isActive: boolean;
  createdAt: Date;
}

/**
 * User's achievement progress
 */
export interface UserAchievement {
  userId: string;
  achievementId: string;
  progress: number; // 0-100
  completed: boolean;
  completedAt?: Date;
  claimed: boolean;
  claimedAt?: Date;
  notified: boolean;
}

// ============================================
// CHALLENGES
// ============================================

export type ChallengeType = 'check_in_early' | 'bring_friends' | 'spend_amount' | 'share_social' | 'leave_review' | 'complete_profile';
export type ChallengeStatus = 'active' | 'completed' | 'expired';

/**
 * Time-limited challenge
 */
export interface Challenge {
  id: string;
  eventId?: string; // Event-specific or platform-wide
  organizationId?: string;
  name: string;
  description: string;
  type: ChallengeType;
  icon: string;
  points: number;
  requirement: {
    target: number;
    unit?: string;
  };
  reward?: {
    type: 'points' | 'discount' | 'free_item' | 'badge';
    value: number | string;
  };
  startsAt: Date;
  expiresAt: Date;
  participantCount: number;
  completionCount: number;
  maxParticipants?: number;
  isActive: boolean;
  createdAt: Date;
}

/**
 * User's challenge participation
 */
export interface UserChallenge {
  userId: string;
  challengeId: string;
  status: ChallengeStatus;
  progress: number; // Current value
  target: number; // Required value
  startedAt: Date;
  completedAt?: Date;
  rewardClaimed: boolean;
}

// ============================================
// LEADERBOARDS
// ============================================

export type LeaderboardType = 'points' | 'events_attended' | 'spending' | 'referrals' | 'check_ins';
export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'all_time';
export type LeaderboardScope = 'global' | 'organization' | 'event' | 'category';

/**
 * Leaderboard configuration
 */
export interface Leaderboard {
  id: string;
  name: string;
  type: LeaderboardType;
  period: LeaderboardPeriod;
  scope: LeaderboardScope;
  scopeId?: string; // Organization ID, Event ID, etc
  topCount: number; // Show top N users
  updatedAt: Date;
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  leaderboardId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rank: number;
  score: number;
  badge?: 'gold' | 'silver' | 'bronze';
  change?: number; // Position change vs last period
  metadata?: {
    eventsAttended?: number;
    totalSpent?: number;
    referralsCount?: number;
  };
}

// ============================================
// POINTS & REWARDS
// ============================================

export type PointTransactionType =
  | 'achievement_unlocked'
  | 'challenge_completed'
  | 'event_attended'
  | 'referral_success'
  | 'review_submitted'
  | 'social_share'
  | 'early_bird'
  | 'streak_bonus'
  | 'birthday_bonus'
  | 'reward_redeemed';

/**
 * Points transaction
 */
export interface PointTransaction {
  id: string;
  userId: string;
  type: PointTransactionType;
  points: number; // Positive = earned, Negative = spent
  balanceAfter: number;
  description: string;
  metadata?: {
    achievementId?: string;
    challengeId?: string;
    eventId?: string;
    rewardId?: string;
  };
  createdAt: Date;
}

/**
 * Redeemable reward
 */
export interface Reward {
  id: string;
  name: string;
  description: string;
  type: 'discount' | 'free_ticket' | 'merchandise' | 'experience' | 'cashback';
  pointsCost: number;
  value?: number; // For discounts, cashback
  stock?: number;
  stockRemaining?: number;
  imageUrl?: string;
  terms?: string;
  validFrom?: Date;
  validUntil?: Date;
  isActive: boolean;
  // Restrictions
  minTier?: string; // Minimum loyalty tier
  eventIds?: string[]; // Specific events only
  organizationIds?: string[]; // Specific organizers only
  maxRedemptionsPerUser?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User's reward redemption
 */
export interface RewardRedemption {
  id: string;
  rewardId: string;
  userId: string;
  pointsSpent: number;
  code?: string; // Unique redemption code
  status: 'pending' | 'active' | 'used' | 'expired';
  usedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
}

// ============================================
// STREAKS
// ============================================

/**
 * User's event attendance streak
 */
export interface UserStreak {
  userId: string;
  currentStreak: number; // Consecutive events
  longestStreak: number;
  lastEventDate: Date;
  streakBonusEarned: number; // Total bonus points from streaks
  updatedAt: Date;
}

// ============================================
// BADGES
// ============================================

export type BadgeType = 'achievement' | 'milestone' | 'special' | 'tier';

/**
 * Visual badge earned by user
 */
export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  type: BadgeType;
  rarity: AchievementRarity;
  requirement?: string; // Human-readable requirement
  isActive: boolean;
  createdAt: Date;
}

/**
 * User's earned badge
 */
export interface UserBadge {
  userId: string;
  badgeId: string;
  earnedAt: Date;
  displayOnProfile: boolean;
}
