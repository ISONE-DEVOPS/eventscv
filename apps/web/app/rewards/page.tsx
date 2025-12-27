'use client';

import { useEffect, useState } from 'react';
import {
  Gift,
  Ticket,
  ShoppingBag,
  Sparkles,
  Tag,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  TrendingUp,
  Award,
  DollarSign,
} from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';

type RewardType = 'discount' | 'free_ticket' | 'merchandise' | 'experience' | 'cashback';

interface Reward {
  id: string;
  name: string;
  description: string;
  type: RewardType;
  pointsCost: number;
  value?: number;
  stock?: number;
  stockRemaining?: number;
  imageUrl?: string;
  terms?: string;
  validFrom?: Date;
  validUntil?: Date;
  isActive: boolean;
  minTier?: string;
  maxRedemptionsPerUser?: number;
}

interface RewardRedemption {
  id: string;
  rewardId: string;
  rewardName: string;
  rewardType: RewardType;
  pointsSpent: number;
  code?: string;
  status: 'pending' | 'active' | 'used' | 'expired';
  usedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
}

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [myRedemptions, setMyRedemptions] = useState<RewardRedemption[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<RewardType | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'available' | 'redeemed'>('available');

  useEffect(() => {
    loadRewardsData();
  }, []);

  const loadRewardsData = async () => {
    try {
      const functions = getFunctions();

      // Load available rewards
      const getAvailableRewards = httpsCallable(functions, 'getAvailableRewards');
      const rewardsResult = await getAvailableRewards({});
      setRewards((rewardsResult.data as any).rewards || []);

      // Load user points
      const getUserPoints = httpsCallable(functions, 'getUserPoints');
      const pointsResult = await getUserPoints({});
      setTotalPoints((pointsResult.data as any).totalPoints || 0);

      // Load user redemptions (would need a new Cloud Function)
      // For now, using empty array
      setMyRedemptions([]);

      setLoading(false);
    } catch (err) {
      console.error('Error loading rewards:', err);
      setLoading(false);
    }
  };

  const handleRedeemReward = async (rewardId: string) => {
    const reward = rewards.find((r) => r.id === rewardId);
    if (!reward) return;

    if (totalPoints < reward.pointsCost) {
      alert('Pontos insuficientes para resgatar esta recompensa');
      return;
    }

    if (!confirm(`Resgatar ${reward.name} por ${reward.pointsCost} pontos?`)) {
      return;
    }

    try {
      const functions = getFunctions();
      const redeemReward = httpsCallable(functions, 'redeemReward');

      await redeemReward({ rewardId });
      alert('Recompensa resgatada com sucesso!');
      await loadRewardsData();
      setActiveTab('redeemed');
    } catch (err: any) {
      alert('Erro ao resgatar recompensa: ' + err.message);
    }
  };

  const getTypeIcon = (type: RewardType) => {
    switch (type) {
      case 'discount':
        return Tag;
      case 'free_ticket':
        return Ticket;
      case 'merchandise':
        return ShoppingBag;
      case 'experience':
        return Sparkles;
      case 'cashback':
        return DollarSign;
    }
  };

  const getTypeLabel = (type: RewardType) => {
    const labels: Record<RewardType, string> = {
      discount: 'Desconto',
      free_ticket: 'Bilhete Grátis',
      merchandise: 'Merchandise',
      experience: 'Experiência',
      cashback: 'Cashback',
    };
    return labels[type];
  };

  const getTypeColor = (type: RewardType) => {
    switch (type) {
      case 'discount':
        return 'from-yellow-400 to-orange-500';
      case 'free_ticket':
        return 'from-purple-400 to-pink-500';
      case 'merchandise':
        return 'from-blue-400 to-cyan-500';
      case 'experience':
        return 'from-green-400 to-emerald-500';
      case 'cashback':
        return 'from-brand-primary to-brand-secondary';
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background pt-20 pb-16">
        <div className="container-app flex items-center justify-center h-64">
          <div className="animate-spin">
            <Gift className="w-8 h-8 text-brand-primary" />
          </div>
        </div>
      </main>
    );
  }

  const filteredRewards =
    selectedCategory === 'all'
      ? rewards
      : rewards.filter((r) => r.type === selectedCategory);

  const categories: (RewardType | 'all')[] = ['all', 'discount', 'free_ticket', 'merchandise', 'experience', 'cashback'];

  return (
    <main className="min-h-screen bg-background pt-20 pb-16">
      <div className="container-app">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 mb-4">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Marketplace de Recompensas</h1>
          <p className="text-zinc-400">Troque seus pontos por recompensas exclusivas</p>
        </div>

        {/* Points Balance */}
        <div className="glass-card p-6 mb-6 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
                <Star className="w-7 h-7 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Saldo de Pontos</p>
                <p className="text-3xl font-bold text-white">
                  {totalPoints.toLocaleString()} <span className="text-lg">pts</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => (window.location.href = '/gamification')}
              className="btn btn-ghost btn-sm"
            >
              <TrendingUp className="w-4 h-4" />
              Ganhar mais pontos
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('available')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === 'available'
                ? 'bg-brand-primary text-white'
                : 'bg-background-secondary text-zinc-400 hover:text-white'
            }`}
          >
            <Gift className="w-4 h-4 inline-block mr-2" />
            Disponíveis
          </button>
          <button
            onClick={() => setActiveTab('redeemed')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === 'redeemed'
                ? 'bg-brand-primary text-white'
                : 'bg-background-secondary text-zinc-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4 inline-block mr-2" />
            Minhas Recompensas
          </button>
        </div>

        {activeTab === 'available' ? (
          <>
            {/* Category Filter */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {categories.map((category) => {
                const Icon = category === 'all' ? Gift : getTypeIcon(category as RewardType);
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                      selectedCategory === category
                        ? 'bg-brand-primary text-white'
                        : 'bg-background-secondary text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {category === 'all' ? 'Todos' : getTypeLabel(category as RewardType)}
                  </button>
                );
              })}
            </div>

            {/* Rewards Grid */}
            {filteredRewards.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <Gift className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  Nenhuma recompensa disponível
                </h3>
                <p className="text-zinc-400">
                  Novas recompensas serão adicionadas em breve. Fique atento!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRewards.map((reward) => {
                  const TypeIcon = getTypeIcon(reward.type);
                  const canAfford = totalPoints >= reward.pointsCost;
                  const isAvailable = reward.stock
                    ? (reward.stockRemaining || 0) > 0
                    : true;

                  return (
                    <div
                      key={reward.id}
                      className={`glass-card overflow-hidden ${
                        !canAfford || !isAvailable ? 'opacity-60' : ''
                      }`}
                    >
                      {/* Image */}
                      <div className="relative h-48 bg-gradient-to-br from-zinc-800 to-zinc-900">
                        {reward.imageUrl ? (
                          <img
                            src={reward.imageUrl}
                            alt={reward.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <TypeIcon className="w-20 h-20 text-zinc-700" />
                          </div>
                        )}
                        <div
                          className={`absolute top-3 right-3 px-3 py-1 rounded-full bg-gradient-to-r ${getTypeColor(
                            reward.type
                          )} text-white text-xs font-medium`}
                        >
                          {getTypeLabel(reward.type)}
                        </div>
                        {!isAvailable && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <div className="text-center">
                              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
                              <p className="text-white font-medium">Esgotado</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-white mb-2">{reward.name}</h3>
                        <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
                          {reward.description}
                        </p>

                        {/* Value */}
                        {reward.value && (
                          <div className="flex items-center gap-2 mb-3">
                            <Tag className="w-4 h-4 text-brand-primary" />
                            <span className="text-sm text-zinc-300">
                              Valor: {reward.value}$00
                            </span>
                          </div>
                        )}

                        {/* Stock */}
                        {reward.stock && (
                          <div className="flex items-center gap-2 mb-3">
                            <Info className="w-4 h-4 text-zinc-500" />
                            <span className="text-sm text-zinc-400">
                              {reward.stockRemaining} / {reward.stock} disponíveis
                            </span>
                          </div>
                        )}

                        {/* Expiry */}
                        {reward.validUntil && (
                          <div className="flex items-center gap-2 mb-4">
                            <Clock className="w-4 h-4 text-zinc-500" />
                            <span className="text-sm text-zinc-400">
                              Válido até{' '}
                              {new Date(reward.validUntil).toLocaleDateString('pt-CV')}
                            </span>
                          </div>
                        )}

                        {/* Points Cost */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-400" />
                            <span className="text-xl font-bold text-white">
                              {reward.pointsCost.toLocaleString()}
                            </span>
                            <span className="text-sm text-zinc-500">pontos</span>
                          </div>
                        </div>

                        {/* Redeem Button */}
                        <button
                          onClick={() => handleRedeemReward(reward.id)}
                          disabled={!canAfford || !isAvailable}
                          className={`btn w-full ${
                            canAfford && isAvailable
                              ? 'btn-primary'
                              : 'btn-ghost cursor-not-allowed'
                          }`}
                        >
                          {!isAvailable ? (
                            <>
                              <AlertCircle className="w-4 h-4" />
                              Esgotado
                            </>
                          ) : !canAfford ? (
                            <>
                              <AlertCircle className="w-4 h-4" />
                              Pontos Insuficientes
                            </>
                          ) : (
                            <>
                              <Gift className="w-4 h-4" />
                              Resgatar
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* My Redemptions */
          <div>
            {myRedemptions.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <Award className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  Nenhuma recompensa resgatada
                </h3>
                <p className="text-zinc-400 mb-6">
                  Explore as recompensas disponíveis e comece a resgatar!
                </p>
                <button
                  onClick={() => setActiveTab('available')}
                  className="btn btn-primary"
                >
                  Ver Recompensas
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myRedemptions.map((redemption) => {
                  const TypeIcon = getTypeIcon(redemption.rewardType);
                  return (
                    <div key={redemption.id} className="glass-card p-6">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getTypeColor(
                            redemption.rewardType
                          )} flex items-center justify-center flex-shrink-0`}
                        >
                          <TypeIcon className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-bold text-white mb-1">
                                {redemption.rewardName}
                              </h3>
                              <p className="text-sm text-zinc-400">
                                {getTypeLabel(redemption.rewardType)} •{' '}
                                {redemption.pointsSpent.toLocaleString()} pontos
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                redemption.status === 'active'
                                  ? 'bg-success/20 text-success'
                                  : redemption.status === 'used'
                                  ? 'bg-zinc-700 text-zinc-400'
                                  : redemption.status === 'expired'
                                  ? 'bg-error/20 text-error'
                                  : 'bg-warning/20 text-warning'
                              }`}
                            >
                              {redemption.status === 'active' && 'Activo'}
                              {redemption.status === 'used' && 'Usado'}
                              {redemption.status === 'expired' && 'Expirado'}
                              {redemption.status === 'pending' && 'Pendente'}
                            </span>
                          </div>

                          {redemption.code && (
                            <div className="mb-3 p-3 rounded-lg bg-background-secondary">
                              <p className="text-xs text-zinc-500 mb-1">Código de Resgate</p>
                              <p className="text-lg font-mono font-bold text-white tracking-wider">
                                {redemption.code}
                              </p>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>
                                Resgatado{' '}
                                {new Date(redemption.createdAt).toLocaleDateString('pt-CV')}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              <span>
                                Expira {new Date(redemption.expiresAt).toLocaleDateString('pt-CV')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
