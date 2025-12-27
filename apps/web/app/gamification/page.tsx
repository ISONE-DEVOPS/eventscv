'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Award,
  Flame,
  Star,
  Gift,
  TrendingUp,
  Calendar,
  Target,
  Zap,
  Crown,
  CheckCircle,
  Lock,
  ArrowRight,
  Sparkles,
  Medal,
} from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';

type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';
type AchievementCategory = 'attendance' | 'social' | 'spending' | 'engagement' | 'loyalty';
type ChallengeStatus = 'active' | 'completed' | 'expired';

interface UserAchievement {
  achievementId: string;
  achievementName: string;
  achievementDescription: string;
  achievementIcon: string;
  achievementCategory: AchievementCategory;
  achievementRarity: AchievementRarity;
  points: number;
  progress: number;
  completed: boolean;
  completedAt?: Date;
  claimed: boolean;
}

interface UserChallenge {
  challengeId: string;
  challengeName: string;
  challengeDescription: string;
  challengeIcon: string;
  challengeType: string;
  points: number;
  status: ChallengeStatus;
  progress: number;
  target: number;
  expiresAt: Date;
}

interface UserStreak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastEventDate: Date;
  streakBonusEarned: number;
}

interface UserBadge {
  badgeId: string;
  badgeName: string;
  badgeDescription: string;
  badgeImageUrl: string;
  badgeRarity: AchievementRarity;
  earnedAt: Date;
  displayOnProfile: boolean;
}

interface PointTransaction {
  id: string;
  type: string;
  points: number;
  description: string;
  createdAt: Date;
}

export default function GamificationPage() {
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [challenges, setChallenges] = useState<UserChallenge[]>([]);
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [pointsHistory, setPointsHistory] = useState<PointTransaction[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'achievements' | 'challenges' | 'badges'>('achievements');

  useEffect(() => {
    loadGamificationData();
  }, []);

  const loadGamificationData = async () => {
    try {
      const functions = getFunctions();

      // Load user achievements
      const getUserAchievements = httpsCallable(functions, 'getUserAchievements');
      const achievementsResult = await getUserAchievements({});
      setAchievements((achievementsResult.data as any).achievements || []);

      // Load active challenges
      const getActiveChallenges = httpsCallable(functions, 'getActiveChallenges');
      const challengesResult = await getActiveChallenges({});
      setChallenges((challengesResult.data as any).challenges || []);

      // Load streak
      const getUserStreak = httpsCallable(functions, 'getUserStreak');
      const streakResult = await getUserStreak({});
      setStreak((streakResult.data as any).streak);

      // Load badges
      const getUserBadges = httpsCallable(functions, 'getUserBadges');
      const badgesResult = await getUserBadges({});
      setBadges((badgesResult.data as any).badges || []);

      // Load points history
      const getPointsHistory = httpsCallable(functions, 'getPointsHistory');
      const pointsResult = await getPointsHistory({ limit: 10 });
      const history = (pointsResult.data as any).transactions || [];
      setPointsHistory(history);

      // Calculate total points
      const getUserPoints = httpsCallable(functions, 'getUserPoints');
      const totalResult = await getUserPoints({});
      setTotalPoints((totalResult.data as any).totalPoints || 0);

      setLoading(false);
    } catch (err) {
      console.error('Error loading gamification data:', err);
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: AchievementRarity) => {
    switch (rarity) {
      case 'legendary':
        return 'from-yellow-400 to-orange-500';
      case 'epic':
        return 'from-purple-400 to-pink-500';
      case 'rare':
        return 'from-blue-400 to-cyan-500';
      case 'common':
      default:
        return 'from-zinc-400 to-zinc-500';
    }
  };

  const getRarityLabel = (rarity: AchievementRarity) => {
    const labels: Record<AchievementRarity, string> = {
      legendary: 'Lendário',
      epic: 'Épico',
      rare: 'Raro',
      common: 'Comum',
    };
    return labels[rarity];
  };

  const getCategoryIcon = (category: AchievementCategory) => {
    switch (category) {
      case 'attendance':
        return Calendar;
      case 'social':
        return Star;
      case 'spending':
        return Gift;
      case 'engagement':
        return Zap;
      case 'loyalty':
        return Crown;
      default:
        return Trophy;
    }
  };

  const handleClaimAchievement = async (achievementId: string) => {
    try {
      const functions = getFunctions();
      const claimAchievementReward = httpsCallable(functions, 'claimAchievementReward');
      await claimAchievementReward({ achievementId });
      await loadGamificationData();
    } catch (err: any) {
      alert('Erro ao resgatar achievement: ' + err.message);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background pt-20 pb-16">
        <div className="container-app flex items-center justify-center h-64">
          <div className="animate-spin">
            <Trophy className="w-8 h-8 text-brand-primary" />
          </div>
        </div>
      </main>
    );
  }

  const completedAchievements = achievements.filter((a) => a.completed);
  const inProgressAchievements = achievements.filter((a) => !a.completed);
  const activeChallenges = challenges.filter((c) => c.status === 'active');
  const completedChallenges = challenges.filter((c) => c.status === 'completed');

  return (
    <main className="min-h-screen bg-background pt-20 pb-16">
      <div className="container-app">
        {/* Header Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Total Points */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gradient">{totalPoints.toLocaleString()}</p>
            <p className="text-xs text-zinc-500">Pontos Totais</p>
          </div>

          {/* Achievements */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">
              {completedAchievements.length}/{achievements.length}
            </p>
            <p className="text-xs text-zinc-500">Conquistas</p>
          </div>

          {/* Streak */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{streak?.currentStreak || 0}</p>
            <p className="text-xs text-zinc-500">Dias de Streak</p>
          </div>

          {/* Badges */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{badges.length}</p>
            <p className="text-xs text-zinc-500">Badges</p>
          </div>
        </div>

        {/* Streak Card */}
        {streak && streak.currentStreak > 0 && (
          <div className="glass-card p-6 mb-6 bg-gradient-to-br from-orange-500/20 to-red-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Flame className="w-8 h-8 text-orange-400" />
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {streak.currentStreak} Dias de Streak!
                  </h2>
                  <p className="text-sm text-zinc-400">
                    Recorde: {streak.longestStreak} dias • {streak.streakBonusEarned} pontos bónus ganhos
                  </p>
                </div>
              </div>
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="h-2 bg-background rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
                style={{ width: `${Math.min((streak.currentStreak / 30) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              Próximo marco: {Math.ceil(streak.currentStreak / 7) * 7} dias
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('achievements')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === 'achievements'
                ? 'bg-brand-primary text-white'
                : 'bg-background-secondary text-zinc-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4 inline-block mr-2" />
            Conquistas
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === 'challenges'
                ? 'bg-brand-primary text-white'
                : 'bg-background-secondary text-zinc-400 hover:text-white'
            }`}
          >
            <Target className="w-4 h-4 inline-block mr-2" />
            Desafios
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === 'badges'
                ? 'bg-brand-primary text-white'
                : 'bg-background-secondary text-zinc-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4 inline-block mr-2" />
            Badges
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'achievements' && (
          <div className="space-y-6">
            {/* Completed Achievements */}
            {completedAchievements.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Conquistados</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completedAchievements.map((achievement) => {
                    const CategoryIcon = getCategoryIcon(achievement.achievementCategory);
                    return (
                      <div
                        key={achievement.achievementId}
                        className="glass-card p-4 relative overflow-hidden"
                      >
                        <div
                          className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${getRarityColor(
                            achievement.achievementRarity
                          )} opacity-10 blur-3xl`}
                        />
                        <div className="relative">
                          <div className="flex items-start gap-4">
                            <div className="text-4xl">{achievement.achievementIcon}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-white">
                                  {achievement.achievementName}
                                </h4>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${getRarityColor(
                                    achievement.achievementRarity
                                  )} text-white`}
                                >
                                  {getRarityLabel(achievement.achievementRarity)}
                                </span>
                              </div>
                              <p className="text-sm text-zinc-400 mb-2">
                                {achievement.achievementDescription}
                              </p>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1 text-brand-primary">
                                  <Star className="w-4 h-4" />
                                  <span className="text-sm font-medium">
                                    +{achievement.points} pontos
                                  </span>
                                </div>
                                <CategoryIcon className="w-4 h-4 text-zinc-500" />
                              </div>
                            </div>
                            {achievement.completed && !achievement.claimed && (
                              <button
                                onClick={() => handleClaimAchievement(achievement.achievementId)}
                                className="btn btn-primary btn-sm"
                              >
                                <Gift className="w-4 h-4" />
                                Resgatar
                              </button>
                            )}
                            {achievement.claimed && (
                              <CheckCircle className="w-6 h-6 text-success" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* In Progress Achievements */}
            {inProgressAchievements.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Em Progresso</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {inProgressAchievements.map((achievement) => {
                    const CategoryIcon = getCategoryIcon(achievement.achievementCategory);
                    return (
                      <div
                        key={achievement.achievementId}
                        className="glass-card p-4 opacity-60 hover:opacity-100 transition-opacity"
                      >
                        <div className="flex items-start gap-4">
                          <div className="text-4xl grayscale">{achievement.achievementIcon}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-white">
                                {achievement.achievementName}
                              </h4>
                              <Lock className="w-3 h-3 text-zinc-500" />
                            </div>
                            <p className="text-sm text-zinc-400 mb-2">
                              {achievement.achievementDescription}
                            </p>
                            <div className="mb-2">
                              <div className="h-2 bg-background rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full"
                                  style={{ width: `${achievement.progress}%` }}
                                />
                              </div>
                              <p className="text-xs text-zinc-500 mt-1">
                                {achievement.progress}% completo
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1 text-zinc-500">
                                <Star className="w-4 h-4" />
                                <span className="text-sm">+{achievement.points} pontos</span>
                              </div>
                              <CategoryIcon className="w-4 h-4 text-zinc-500" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'challenges' && (
          <div className="space-y-6">
            {/* Active Challenges */}
            {activeChallenges.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Desafios Activos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeChallenges.map((challenge) => (
                    <div key={challenge.challengeId} className="glass-card p-4">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">{challenge.challengeIcon}</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-white mb-1">
                            {challenge.challengeName}
                          </h4>
                          <p className="text-sm text-zinc-400 mb-3">
                            {challenge.challengeDescription}
                          </p>
                          <div className="mb-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-zinc-400">Progresso</span>
                              <span className="text-white font-medium">
                                {challenge.progress} / {challenge.target}
                              </span>
                            </div>
                            <div className="h-2 bg-background rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full"
                                style={{
                                  width: `${Math.min(
                                    (challenge.progress / challenge.target) * 100,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-brand-primary">
                              <Star className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                +{challenge.points} pontos
                              </span>
                            </div>
                            <span className="text-xs text-zinc-500">
                              Expira em{' '}
                              {Math.ceil(
                                (new Date(challenge.expiresAt).getTime() - Date.now()) /
                                  (1000 * 60 * 60 * 24)
                              )}{' '}
                              dias
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Challenges */}
            {completedChallenges.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Desafios Completados</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completedChallenges.map((challenge) => (
                    <div
                      key={challenge.challengeId}
                      className="glass-card p-4 border-2 border-success/20"
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">{challenge.challengeIcon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-white">{challenge.challengeName}</h4>
                            <CheckCircle className="w-5 h-5 text-success" />
                          </div>
                          <p className="text-sm text-zinc-400 mb-2">
                            {challenge.challengeDescription}
                          </p>
                          <div className="flex items-center gap-1 text-success">
                            <Star className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              +{challenge.points} pontos ganhos
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeChallenges.length === 0 && completedChallenges.length === 0 && (
              <div className="glass-card p-12 text-center">
                <Target className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  Nenhum desafio disponível
                </h3>
                <p className="text-zinc-400">
                  Novos desafios serão adicionados em breve. Fique atento!
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'badges' && (
          <div>
            {badges.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {badges.map((badge) => (
                  <div key={badge.badgeId} className="glass-card p-4 text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
                      {badge.badgeImageUrl ? (
                        <img
                          src={badge.badgeImageUrl}
                          alt={badge.badgeName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Medal className="w-8 h-8 text-brand-primary" />
                      )}
                    </div>
                    <h4 className="font-medium text-white text-sm mb-1">{badge.badgeName}</h4>
                    <p className="text-xs text-zinc-500 mb-2">{badge.badgeDescription}</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${getRarityColor(
                        badge.badgeRarity
                      )} text-white`}
                    >
                      {getRarityLabel(badge.badgeRarity)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <Award className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Nenhum badge ganho</h3>
                <p className="text-zinc-400 mb-6">
                  Complete conquistas e desafios para ganhar badges exclusivos!
                </p>
                <button
                  onClick={() => setActiveTab('achievements')}
                  className="btn btn-primary"
                >
                  Ver Conquistas
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Link href="/leaderboards" className="glass-card p-6 hover:border-white/20 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white group-hover:text-brand-primary transition-colors">
                  Leaderboards
                </h3>
                <p className="text-sm text-zinc-400">Veja o ranking global e compare-se</p>
              </div>
              <ArrowRight className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
            </div>
          </Link>

          <Link href="/rewards" className="glass-card p-6 hover:border-white/20 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white group-hover:text-brand-primary transition-colors">
                  Recompensas
                </h3>
                <p className="text-sm text-zinc-400">Troque seus pontos por prémios</p>
              </div>
              <ArrowRight className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
