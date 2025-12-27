'use client';

import { useEffect, useState } from 'react';
import {
  Trophy,
  Medal,
  Award,
  Crown,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Target,
  Flame,
  Star,
} from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';

type LeaderboardType = 'points' | 'events_attended' | 'spending' | 'referrals' | 'check_ins';
type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'all_time';

interface LeaderboardEntry {
  leaderboardId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rank: number;
  score: number;
  badge?: 'gold' | 'silver' | 'bronze';
  change?: number;
  metadata?: {
    eventsAttended?: number;
    totalSpent?: number;
    referralsCount?: number;
  };
}

export default function LeaderboardsPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<LeaderboardType>('points');
  const [selectedPeriod, setSelectedPeriod] = useState<LeaderboardPeriod>('all_time');
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [selectedType, selectedPeriod]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const functions = getFunctions();
      const getLeaderboard = httpsCallable(functions, 'getLeaderboard');

      const result = await getLeaderboard({
        type: selectedType,
        period: selectedPeriod,
        scope: 'global',
        limit: 100,
      });

      const entries = (result.data as any).entries || [];
      setLeaderboard(entries);

      // Find current user in leaderboard
      // In a real app, you'd get this from auth context
      const currentUser = entries.find((e: LeaderboardEntry) => e.userId === 'current-user-id');
      setCurrentUserRank(currentUser || null);

      setLoading(false);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      setLoading(false);
    }
  };

  const getTypeIcon = (type: LeaderboardType) => {
    switch (type) {
      case 'points':
        return Star;
      case 'events_attended':
        return Calendar;
      case 'spending':
        return DollarSign;
      case 'referrals':
        return Users;
      case 'check_ins':
        return Target;
    }
  };

  const getTypeLabel = (type: LeaderboardType) => {
    const labels: Record<LeaderboardType, string> = {
      points: 'Pontos',
      events_attended: 'Eventos',
      spending: 'Gastos',
      referrals: 'Referências',
      check_ins: 'Check-ins',
    };
    return labels[type];
  };

  const getPeriodLabel = (period: LeaderboardPeriod) => {
    const labels: Record<LeaderboardPeriod, string> = {
      daily: 'Hoje',
      weekly: 'Esta Semana',
      monthly: 'Este Mês',
      all_time: 'Todos os Tempos',
    };
    return labels[period];
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-400" />
            <span className="text-yellow-400 font-bold">#1</span>
          </div>
        );
      case 2:
        return (
          <div className="flex items-center gap-2">
            <Medal className="w-6 h-6 text-gray-400" />
            <span className="text-gray-400 font-bold">#2</span>
          </div>
        );
      case 3:
        return (
          <div className="flex items-center gap-2">
            <Medal className="w-6 h-6 text-orange-600" />
            <span className="text-orange-600 font-bold">#3</span>
          </div>
        );
      default:
        return <span className="text-zinc-400 font-medium">#{rank}</span>;
    }
  };

  const getScoreLabel = (type: LeaderboardType, score: number) => {
    switch (type) {
      case 'points':
        return `${score.toLocaleString()} pontos`;
      case 'events_attended':
        return `${score} eventos`;
      case 'spending':
        return `${score.toLocaleString()}$00`;
      case 'referrals':
        return `${score} referências`;
      case 'check_ins':
        return `${score} check-ins`;
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

  const topTypes: LeaderboardType[] = ['points', 'events_attended', 'spending', 'referrals', 'check_ins'];
  const periods: LeaderboardPeriod[] = ['daily', 'weekly', 'monthly', 'all_time'];

  return (
    <main className="min-h-screen bg-background pt-20 pb-16">
      <div className="container-app">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Leaderboards</h1>
          <p className="text-zinc-400">Veja quem está no topo e desafie-se a subir no ranking</p>
        </div>

        {/* Type Selector */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
          {topTypes.map((type) => {
            const Icon = getTypeIcon(type);
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`p-4 rounded-xl font-medium transition-all ${
                  selectedType === type
                    ? 'bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-lg'
                    : 'bg-background-secondary text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5 mx-auto mb-2" />
                <span className="text-sm">{getTypeLabel(type)}</span>
              </button>
            );
          })}
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {periods.map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
                selectedPeriod === period
                  ? 'bg-brand-primary text-white'
                  : 'bg-background-secondary text-zinc-400 hover:text-white'
              }`}
            >
              {getPeriodLabel(period)}
            </button>
          ))}
        </div>

        {/* Current User Position (if not in top 10) */}
        {currentUserRank && currentUserRank.rank > 10 && (
          <div className="glass-card p-4 mb-6 border-2 border-brand-primary/50">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white font-bold">
                  {currentUserRank.rank}
                </div>
              </div>
              <div className="flex-1">
                <p className="font-bold text-white">A Tua Posição</p>
                <p className="text-sm text-zinc-400">{currentUserRank.userName}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-white">
                  {getScoreLabel(selectedType, currentUserRank.score)}
                </p>
                {currentUserRank.change && (
                  <p
                    className={`text-sm flex items-center gap-1 ${
                      currentUserRank.change > 0 ? 'text-success' : 'text-error'
                    }`}
                  >
                    <TrendingUp
                      className={`w-3 h-3 ${currentUserRank.change < 0 ? 'rotate-180' : ''}`}
                    />
                    {Math.abs(currentUserRank.change)} posições
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* 2nd Place */}
            <div className="flex flex-col items-center pt-8">
              <div className="relative mb-3">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center border-4 border-background">
                  {leaderboard[1].userAvatar ? (
                    <img
                      src={leaderboard[1].userAvatar}
                      alt={leaderboard[1].userName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <Users className="w-10 h-10 text-white" />
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center border-2 border-background">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
              </div>
              <p className="font-bold text-white text-center mb-1">
                {leaderboard[1].userName}
              </p>
              <p className="text-sm text-gray-400">
                {getScoreLabel(selectedType, leaderboard[1].score)}
              </p>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center">
              <Crown className="w-8 h-8 text-yellow-400 mb-2 animate-bounce" />
              <div className="relative mb-3">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 flex items-center justify-center border-4 border-background shadow-xl">
                  {leaderboard[0].userAvatar ? (
                    <img
                      src={leaderboard[0].userAvatar}
                      alt={leaderboard[0].userName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <Users className="w-12 h-12 text-white" />
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center border-2 border-background">
                  <span className="text-white font-bold">1</span>
                </div>
              </div>
              <p className="font-bold text-white text-center mb-1">
                {leaderboard[0].userName}
              </p>
              <p className="text-sm text-yellow-400 font-semibold">
                {getScoreLabel(selectedType, leaderboard[0].score)}
              </p>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center pt-12">
              <div className="relative mb-3">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-700 flex items-center justify-center border-4 border-background">
                  {leaderboard[2].userAvatar ? (
                    <img
                      src={leaderboard[2].userAvatar}
                      alt={leaderboard[2].userName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <Users className="w-10 h-10 text-white" />
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center border-2 border-background">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
              </div>
              <p className="font-bold text-white text-center mb-1">
                {leaderboard[2].userName}
              </p>
              <p className="text-sm text-orange-500">
                {getScoreLabel(selectedType, leaderboard[2].score)}
              </p>
            </div>
          </div>
        )}

        {/* Full Leaderboard List */}
        <div className="glass-card divide-y divide-white/5">
          {leaderboard.length === 0 ? (
            <div className="p-12 text-center">
              <Trophy className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                Nenhum dado disponível
              </h3>
              <p className="text-zinc-400">
                Seja o primeiro a aparecer neste leaderboard!
              </p>
            </div>
          ) : (
            leaderboard.map((entry, index) => (
              <div
                key={entry.userId}
                className={`flex items-center gap-4 p-4 hover:bg-white/5 transition-colors ${
                  entry.userId === 'current-user-id' ? 'bg-brand-primary/10' : ''
                }`}
              >
                {/* Rank */}
                <div className="w-16 text-center flex-shrink-0">
                  {getRankBadge(entry.rank)}
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center flex-shrink-0">
                    {entry.userAvatar ? (
                      <img
                        src={entry.userAvatar}
                        alt={entry.userName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <Users className="w-6 h-6 text-zinc-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{entry.userName}</p>
                    {entry.metadata && (
                      <p className="text-xs text-zinc-500">
                        {entry.metadata.eventsAttended && `${entry.metadata.eventsAttended} eventos`}
                        {entry.metadata.totalSpent && ` • ${entry.metadata.totalSpent.toLocaleString()}$00`}
                        {entry.metadata.referralsCount && ` • ${entry.metadata.referralsCount} refs`}
                      </p>
                    )}
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <p className="text-lg font-bold text-white">
                    {getScoreLabel(selectedType, entry.score)}
                  </p>
                  {entry.change !== undefined && entry.change !== 0 && (
                    <p
                      className={`text-xs flex items-center gap-1 justify-end ${
                        entry.change > 0 ? 'text-success' : 'text-error'
                      }`}
                    >
                      <TrendingUp className={`w-3 h-3 ${entry.change < 0 ? 'rotate-180' : ''}`} />
                      {Math.abs(entry.change)}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
