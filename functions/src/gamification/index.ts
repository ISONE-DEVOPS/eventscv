/**
 * Gamification System
 * Achievements, challenges, leaderboards, points & rewards
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import type {
  Achievement,
  UserAchievement,
  Challenge,
  UserChallenge,
  LeaderboardEntry,
  PointTransaction,
  Reward,
  RewardRedemption,
  UserStreak,
  Badge,
  UserBadge,
  AchievementCategory,
  ChallengeType,
  LeaderboardType,
  LeaderboardPeriod,
  PointTransactionType,
} from '../shared-types/gamification';

const db = getFirestore();

// ============================================
// ACHIEVEMENTS
// ============================================

/**
 * Create a new achievement
 */
export const createAchievement = onCall<{
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  points: number;
  rarity: string;
  requirement: any;
  reward?: any;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Check if user is admin
  const userDoc = await db.collection('users').doc(userId).get();
  if (!userDoc.data()?.isSuperAdmin) {
    throw new HttpsError('permission-denied', 'Only admins can create achievements');
  }

  const { name, description, icon, category, points, rarity, requirement, reward } = request.data;

  const achievementData: Partial<Achievement> = {
    name,
    description,
    icon,
    category,
    points,
    rarity: rarity as any,
    requirement,
    reward,
    isActive: true,
    createdAt: FieldValue.serverTimestamp() as any,
  };

  const achievementRef = await db.collection('achievements').add(achievementData);

  return { achievementId: achievementRef.id, success: true };
});

/**
 * Get user's achievements
 */
export const getUserAchievements = onCall<{
  userId?: string;
}>(async (request) => {
  const currentUserId = request.auth?.uid;

  if (!currentUserId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const targetUserId = request.data.userId || currentUserId;

  // Get user's achievement progress
  const userAchievementsSnapshot = await db
    .collection('user-achievements')
    .where('userId', '==', targetUserId)
    .get();

  const achievements = [];

  for (const doc of userAchievementsSnapshot.docs) {
    const userAchievement = doc.data() as UserAchievement;
    const achievementDoc = await db.collection('achievements').doc(userAchievement.achievementId).get();

    if (achievementDoc.exists) {
      achievements.push({
        ...achievementDoc.data(),
        id: achievementDoc.id,
        userProgress: userAchievement.progress,
        completed: userAchievement.completed,
        completedAt: userAchievement.completedAt,
        claimed: userAchievement.claimed,
      });
    }
  }

  return { achievements };
});

/**
 * Unlock achievement for user
 */
export const unlockAchievement = onCall<{
  userId: string;
  achievementId: string;
}>(async (request) => {
  const currentUserId = request.auth?.uid;

  if (!currentUserId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { userId, achievementId } = request.data;

  // Check if achievement exists
  const achievementDoc = await db.collection('achievements').doc(achievementId).get();

  if (!achievementDoc.exists) {
    throw new HttpsError('not-found', 'Achievement not found');
  }

  const achievement = achievementDoc.data() as Achievement;

  // Check if user already has this achievement
  const existingAchievement = await db
    .collection('user-achievements')
    .where('userId', '==', userId)
    .where('achievementId', '==', achievementId)
    .limit(1)
    .get();

  if (!existingAchievement.empty) {
    const existing = existingAchievement.docs[0].data() as UserAchievement;
    if (existing.completed) {
      return { alreadyUnlocked: true };
    }

    // Update progress to 100% and mark as completed
    await existingAchievement.docs[0].ref.update({
      progress: 100,
      completed: true,
      completedAt: FieldValue.serverTimestamp(),
      notified: false,
    });
  } else {
    // Create new achievement record
    const userAchievementData: Partial<UserAchievement> = {
      userId,
      achievementId,
      progress: 100,
      completed: true,
      completedAt: FieldValue.serverTimestamp() as any,
      claimed: false,
      notified: false,
    };

    await db.collection('user-achievements').add(userAchievementData);
  }

  // Award points
  await awardPoints({
    userId,
    type: 'achievement_unlocked',
    points: achievement.points,
    description: `Unlocked achievement: ${achievement.name}`,
    metadata: { achievementId },
  });

  return {
    success: true,
    points: achievement.points,
    achievement: {
      id: achievementId,
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      points: achievement.points,
    },
  };
});

/**
 * Claim achievement reward
 */
export const claimAchievementReward = onCall<{
  achievementId: string;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { achievementId } = request.data;

  // Get user's achievement
  const userAchievementSnapshot = await db
    .collection('user-achievements')
    .where('userId', '==', userId)
    .where('achievementId', '==', achievementId)
    .limit(1)
    .get();

  if (userAchievementSnapshot.empty) {
    throw new HttpsError('not-found', 'Achievement not unlocked');
  }

  const userAchievement = userAchievementSnapshot.docs[0].data() as UserAchievement;

  if (!userAchievement.completed) {
    throw new HttpsError('failed-precondition', 'Achievement not completed');
  }

  if (userAchievement.claimed) {
    throw new HttpsError('failed-precondition', 'Reward already claimed');
  }

  // Mark as claimed
  await userAchievementSnapshot.docs[0].ref.update({
    claimed: true,
    claimedAt: FieldValue.serverTimestamp(),
  });

  // Get achievement details for reward
  const achievementDoc = await db.collection('achievements').doc(achievementId).get();
  const achievement = achievementDoc.data() as Achievement;

  return {
    success: true,
    reward: achievement.reward,
  };
});

// ============================================
// CHALLENGES
// ============================================

/**
 * Create a new challenge
 */
export const createChallenge = onCall<{
  eventId?: string;
  organizationId?: string;
  name: string;
  description: string;
  type: ChallengeType;
  icon: string;
  points: number;
  requirement: any;
  reward?: any;
  startsAt: Date;
  expiresAt: Date;
  maxParticipants?: number;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const {
    eventId,
    organizationId,
    name,
    description,
    type,
    icon,
    points,
    requirement,
    reward,
    startsAt,
    expiresAt,
    maxParticipants,
  } = request.data;

  // Check permissions
  if (eventId) {
    const eventDoc = await db.collection('events').doc(eventId).get();
    if (!eventDoc.exists) {
      throw new HttpsError('not-found', 'Event not found');
    }

    const event = eventDoc.data();
    if (event?.createdBy !== userId) {
      throw new HttpsError('permission-denied', 'Only event organizers can create challenges');
    }
  }

  const challengeData: Partial<Challenge> = {
    eventId,
    organizationId,
    name,
    description,
    type,
    icon,
    points,
    requirement,
    reward,
    startsAt: startsAt as any,
    expiresAt: expiresAt as any,
    participantCount: 0,
    completionCount: 0,
    maxParticipants,
    isActive: true,
    createdAt: FieldValue.serverTimestamp() as any,
  };

  const challengeRef = await db.collection('challenges').add(challengeData);

  return { challengeId: challengeRef.id, success: true };
});

/**
 * Join a challenge
 */
export const joinChallenge = onCall<{
  challengeId: string;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { challengeId } = request.data;

  const challengeDoc = await db.collection('challenges').doc(challengeId).get();

  if (!challengeDoc.exists) {
    throw new HttpsError('not-found', 'Challenge not found');
  }

  const challenge = challengeDoc.data() as Challenge;

  if (!challenge.isActive) {
    throw new HttpsError('failed-precondition', 'Challenge is not active');
  }

  if (new Date() > new Date(challenge.expiresAt)) {
    throw new HttpsError('failed-precondition', 'Challenge has expired');
  }

  if (challenge.maxParticipants && challenge.participantCount >= challenge.maxParticipants) {
    throw new HttpsError('failed-precondition', 'Challenge is full');
  }

  // Check if user already joined
  const existingParticipation = await db
    .collection('user-challenges')
    .where('userId', '==', userId)
    .where('challengeId', '==', challengeId)
    .limit(1)
    .get();

  if (!existingParticipation.empty) {
    return { alreadyJoined: true };
  }

  // Create participation record
  const userChallengeData: Partial<UserChallenge> = {
    userId,
    challengeId,
    status: 'active',
    progress: 0,
    target: challenge.requirement.target,
    startedAt: FieldValue.serverTimestamp() as any,
    rewardClaimed: false,
  };

  await db.collection('user-challenges').add(userChallengeData);

  // Increment participant count
  await challengeDoc.ref.update({
    participantCount: FieldValue.increment(1),
  });

  return { success: true };
});

/**
 * Update challenge progress
 */
export const updateChallengeProgress = onCall<{
  challengeId: string;
  progress: number;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { challengeId, progress } = request.data;

  const userChallengeSnapshot = await db
    .collection('user-challenges')
    .where('userId', '==', userId)
    .where('challengeId', '==', challengeId)
    .limit(1)
    .get();

  if (userChallengeSnapshot.empty) {
    throw new HttpsError('not-found', 'User not participating in this challenge');
  }

  const userChallenge = userChallengeSnapshot.docs[0].data() as UserChallenge;
  const challengeDoc = await db.collection('challenges').doc(challengeId).get();
  const challenge = challengeDoc.data() as Challenge;

  // Check if completed
  const completed = progress >= userChallenge.target;

  const updateData: any = {
    progress,
  };

  if (completed && userChallenge.status !== 'completed') {
    updateData.status = 'completed';
    updateData.completedAt = FieldValue.serverTimestamp();

    // Increment completion count
    await challengeDoc.ref.update({
      completionCount: FieldValue.increment(1),
    });

    // Award points
    await awardPoints({
      userId,
      type: 'challenge_completed',
      points: challenge.points,
      description: `Completed challenge: ${challenge.name}`,
      metadata: { challengeId },
    });
  }

  await userChallengeSnapshot.docs[0].ref.update(updateData);

  return {
    success: true,
    completed,
    points: completed ? challenge.points : 0,
  };
});

/**
 * Get active challenges
 */
export const getActiveChallenges = onCall<{
  eventId?: string;
  limit?: number;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { eventId, limit = 20 } = request.data;

  let query = db.collection('challenges').where('isActive', '==', true);

  if (eventId) {
    query = query.where('eventId', '==', eventId) as any;
  }

  const challengesSnapshot = await query.limit(limit).get();

  const challenges = [];

  for (const doc of challengesSnapshot.docs) {
    const challenge = doc.data();

    // Get user's participation
    const userChallengeSnapshot = await db
      .collection('user-challenges')
      .where('userId', '==', userId)
      .where('challengeId', '==', doc.id)
      .limit(1)
      .get();

    const userProgress = userChallengeSnapshot.empty
      ? null
      : userChallengeSnapshot.docs[0].data();

    challenges.push({
      ...challenge,
      id: doc.id,
      userProgress,
    });
  }

  return { challenges };
});

// ============================================
// LEADERBOARDS
// ============================================

/**
 * Get leaderboard rankings
 */
export const getLeaderboard = onCall<{
  type: LeaderboardType;
  period: LeaderboardPeriod;
  limit?: number;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { type, period, limit = 50 } = request.data;

  const leaderboardId = `${type}_${period}`;

  const entriesSnapshot = await db
    .collection('leaderboard-entries')
    .where('leaderboardId', '==', leaderboardId)
    .orderBy('rank', 'asc')
    .limit(limit)
    .get();

  const entries = entriesSnapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }));

  // Get current user's rank
  const userEntrySnapshot = await db
    .collection('leaderboard-entries')
    .where('leaderboardId', '==', leaderboardId)
    .where('userId', '==', userId)
    .limit(1)
    .get();

  const userRank = userEntrySnapshot.empty ? null : userEntrySnapshot.docs[0].data();

  return {
    leaderboard: {
      id: leaderboardId,
      type,
      period,
    },
    entries,
    userRank,
  };
});

/**
 * Update user ranking in leaderboard
 */
export const updateLeaderboardRank = onCall<{
  userId: string;
  type: LeaderboardType;
  period: LeaderboardPeriod;
  score: number;
}>(async (request) => {
  const currentUserId = request.auth?.uid;

  if (!currentUserId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { userId, type, period, score } = request.data;

  const leaderboardId = `${type}_${period}`;

  // Get or create user's entry
  const entrySnapshot = await db
    .collection('leaderboard-entries')
    .where('leaderboardId', '==', leaderboardId)
    .where('userId', '==', userId)
    .limit(1)
    .get();

  const userDoc = await db.collection('users').doc(userId).get();
  const user = userDoc.data();

  if (entrySnapshot.empty) {
    // Create new entry
    const entryData: Partial<LeaderboardEntry> = {
      leaderboardId,
      userId,
      userName: user?.displayName || user?.email || 'User',
      userAvatar: user?.photoURL,
      rank: 0, // Will be recalculated
      score,
    };

    await db.collection('leaderboard-entries').add(entryData);
  } else {
    // Update existing entry
    await entrySnapshot.docs[0].ref.update({
      score,
    });
  }

  // Trigger rank recalculation (in production, use a Cloud Task)
  // For now, just return success
  return { success: true };
});

// ============================================
// POINTS & REWARDS
// ============================================

/**
 * Award points to user (internal function)
 */
async function awardPoints(params: {
  userId: string;
  type: PointTransactionType;
  points: number;
  description: string;
  metadata?: any;
}): Promise<void> {
  const { userId, type, points, description, metadata } = params;

  // Get current balance
  const userDoc = await db.collection('users').doc(userId).get();
  const currentBalance = userDoc.data()?.gamificationPoints || 0;
  const newBalance = currentBalance + points;

  // Create transaction
  const transactionData: Partial<PointTransaction> = {
    userId,
    type,
    points,
    balanceAfter: newBalance,
    description,
    metadata,
    createdAt: FieldValue.serverTimestamp() as any,
  };

  await db.collection('point-transactions').add(transactionData);

  // Update user's balance
  await userDoc.ref.update({
    gamificationPoints: newBalance,
  });
}

/**
 * Get user points balance
 */
export const getUserPoints = onCall<{
  userId?: string;
}>(async (request) => {
  const currentUserId = request.auth?.uid;

  if (!currentUserId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const targetUserId = request.data.userId || currentUserId;

  const userDoc = await db.collection('users').doc(targetUserId).get();

  if (!userDoc.exists) {
    throw new HttpsError('not-found', 'User not found');
  }

  const balance = userDoc.data()?.gamificationPoints || 0;

  return { balance };
});

/**
 * Get points transaction history
 */
export const getPointsHistory = onCall<{
  limit?: number;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { limit = 50 } = request.data;

  const transactionsSnapshot = await db
    .collection('point-transactions')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();

  const transactions = transactionsSnapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }));

  return { transactions };
});

/**
 * Create a reward
 */
export const createReward = onCall<{
  name: string;
  description: string;
  type: string;
  pointsCost: number;
  value?: number;
  stock?: number;
  imageUrl?: string;
  terms?: string;
  validFrom?: Date;
  validUntil?: Date;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Check if user is admin
  const userDoc = await db.collection('users').doc(userId).get();
  if (!userDoc.data()?.isSuperAdmin) {
    throw new HttpsError('permission-denied', 'Only admins can create rewards');
  }

  const { name, description, type, pointsCost, value, stock, imageUrl, terms, validFrom, validUntil } =
    request.data;

  const rewardData: Partial<Reward> = {
    name,
    description,
    type: type as any,
    pointsCost,
    value,
    stock,
    stockRemaining: stock,
    imageUrl,
    terms,
    validFrom: validFrom as any,
    validUntil: validUntil as any,
    isActive: true,
    createdAt: FieldValue.serverTimestamp() as any,
    updatedAt: FieldValue.serverTimestamp() as any,
  };

  const rewardRef = await db.collection('rewards').add(rewardData);

  return { rewardId: rewardRef.id, success: true };
});

/**
 * Get available rewards
 */
export const getAvailableRewards = onCall<{
  limit?: number;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { limit = 50 } = request.data;

  const rewardsSnapshot = await db
    .collection('rewards')
    .where('isActive', '==', true)
    .limit(limit)
    .get();

  const rewards = rewardsSnapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }));

  return { rewards };
});

/**
 * Redeem a reward
 */
export const redeemReward = onCall<{
  rewardId: string;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { rewardId } = request.data;

  const rewardDoc = await db.collection('rewards').doc(rewardId).get();

  if (!rewardDoc.exists) {
    throw new HttpsError('not-found', 'Reward not found');
  }

  const reward = rewardDoc.data() as Reward;

  if (!reward.isActive) {
    throw new HttpsError('failed-precondition', 'Reward is not active');
  }

  // Check stock
  if (reward.stock && reward.stockRemaining !== undefined && reward.stockRemaining <= 0) {
    throw new HttpsError('failed-precondition', 'Reward is out of stock');
  }

  // Check user's points balance
  const userDoc = await db.collection('users').doc(userId).get();
  const currentBalance = userDoc.data()?.gamificationPoints || 0;

  if (currentBalance < reward.pointsCost) {
    throw new HttpsError('failed-precondition', 'Insufficient points');
  }

  // Generate unique redemption code
  const code = `RWD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // Create redemption record
  const redemptionData: Partial<RewardRedemption> = {
    rewardId,
    userId,
    pointsSpent: reward.pointsCost,
    code,
    status: 'active',
    expiresAt: reward.validUntil || (new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) as any),
    createdAt: FieldValue.serverTimestamp() as any,
  };

  const redemptionRef = await db.collection('reward-redemptions').add(redemptionData);

  // Deduct points
  await awardPoints({
    userId,
    type: 'reward_redeemed',
    points: -reward.pointsCost,
    description: `Redeemed: ${reward.name}`,
    metadata: { rewardId, redemptionId: redemptionRef.id },
  });

  // Update stock
  if (reward.stock) {
    await rewardDoc.ref.update({
      stockRemaining: FieldValue.increment(-1),
    });
  }

  return {
    success: true,
    code,
    reward: {
      name: reward.name,
      description: reward.description,
      type: reward.type,
    },
  };
});

// ============================================
// STREAKS
// ============================================

/**
 * Update user streak after event check-in
 */
export const updateUserStreak = onDocumentWritten('tickets/{ticketId}', async (event) => {
  const ticketData = event.data?.after?.data();

  if (!ticketData || !ticketData.checkedInAt) {
    return;
  }

  const userId = ticketData.userId;

  // Get or create streak record
  const streakSnapshot = await db
    .collection('user-streaks')
    .where('userId', '==', userId)
    .limit(1)
    .get();

  const now = new Date();
  const oneDayMs = 24 * 60 * 60 * 1000;

  if (streakSnapshot.empty) {
    // Create new streak
    const streakData: Partial<UserStreak> = {
      userId,
      currentStreak: 1,
      longestStreak: 1,
      lastEventDate: FieldValue.serverTimestamp() as any,
      streakBonusEarned: 0,
      updatedAt: FieldValue.serverTimestamp() as any,
    };

    await db.collection('user-streaks').add(streakData);
  } else {
    const streakDoc = streakSnapshot.docs[0];
    const streak = streakDoc.data() as UserStreak;
    const lastEventDate = new Date(streak.lastEventDate);
    const daysSinceLastEvent = Math.floor((now.getTime() - lastEventDate.getTime()) / oneDayMs);

    let newStreak = streak.currentStreak;

    if (daysSinceLastEvent <= 7) {
      // Continue streak (within 7 days)
      newStreak++;

      // Award streak bonus every 5 events
      if (newStreak % 5 === 0) {
        const bonusPoints = newStreak * 10;
        await awardPoints({
          userId,
          type: 'streak_bonus',
          points: bonusPoints,
          description: `${newStreak}-event streak bonus!`,
          metadata: { streak: newStreak },
        });

        await streakDoc.ref.update({
          streakBonusEarned: FieldValue.increment(bonusPoints),
        });
      }
    } else {
      // Reset streak
      newStreak = 1;
    }

    await streakDoc.ref.update({
      currentStreak: newStreak,
      longestStreak: Math.max(streak.longestStreak, newStreak),
      lastEventDate: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
});

/**
 * Get user streak
 */
export const getUserStreak = onCall(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const streakSnapshot = await db
    .collection('user-streaks')
    .where('userId', '==', userId)
    .limit(1)
    .get();

  if (streakSnapshot.empty) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      streakBonusEarned: 0,
    };
  }

  const streak = streakSnapshot.docs[0].data();

  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    streakBonusEarned: streak.streakBonusEarned,
    lastEventDate: streak.lastEventDate,
  };
});

// ============================================
// BADGES
// ============================================

/**
 * Create a badge
 */
export const createBadge = onCall<{
  name: string;
  description: string;
  imageUrl: string;
  type: string;
  rarity: string;
  requirement?: string;
}>(async (request) => {
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Check if user is admin
  const userDoc = await db.collection('users').doc(userId).get();
  if (!userDoc.data()?.isSuperAdmin) {
    throw new HttpsError('permission-denied', 'Only admins can create badges');
  }

  const { name, description, imageUrl, type, rarity, requirement } = request.data;

  const badgeData: Partial<Badge> = {
    name,
    description,
    imageUrl,
    type: type as any,
    rarity: rarity as any,
    requirement,
    isActive: true,
    createdAt: FieldValue.serverTimestamp() as any,
  };

  const badgeRef = await db.collection('badges').add(badgeData);

  return { badgeId: badgeRef.id, success: true };
});

/**
 * Award badge to user
 */
export const awardBadge = onCall<{
  userId: string;
  badgeId: string;
}>(async (request) => {
  const currentUserId = request.auth?.uid;

  if (!currentUserId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { userId, badgeId } = request.data;

  // Check if badge exists
  const badgeDoc = await db.collection('badges').doc(badgeId).get();

  if (!badgeDoc.exists) {
    throw new HttpsError('not-found', 'Badge not found');
  }

  // Check if user already has this badge
  const existingBadge = await db
    .collection('user-badges')
    .where('userId', '==', userId)
    .where('badgeId', '==', badgeId)
    .limit(1)
    .get();

  if (!existingBadge.empty) {
    return { alreadyAwarded: true };
  }

  // Award badge
  const userBadgeData: Partial<UserBadge> = {
    userId,
    badgeId,
    earnedAt: FieldValue.serverTimestamp() as any,
    displayOnProfile: true,
  };

  await db.collection('user-badges').add(userBadgeData);

  return { success: true };
});

/**
 * Get user badges
 */
export const getUserBadges = onCall<{
  userId?: string;
}>(async (request) => {
  const currentUserId = request.auth?.uid;

  if (!currentUserId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const targetUserId = request.data.userId || currentUserId;

  const userBadgesSnapshot = await db
    .collection('user-badges')
    .where('userId', '==', targetUserId)
    .get();

  const badges = [];

  for (const doc of userBadgesSnapshot.docs) {
    const userBadge = doc.data() as UserBadge;
    const badgeDoc = await db.collection('badges').doc(userBadge.badgeId).get();

    if (badgeDoc.exists) {
      badges.push({
        ...badgeDoc.data(),
        id: badgeDoc.id,
        earnedAt: userBadge.earnedAt,
        displayOnProfile: userBadge.displayOnProfile,
      });
    }
  }

  return { badges };
});
