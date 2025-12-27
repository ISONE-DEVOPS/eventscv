'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  Zap,
  BarChart3,
  Settings,
  RefreshCcw,
  Lightbulb,
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { getFunctions, httpsCallable } from 'firebase/functions';

type PricingStrategy = 'fixed' | 'tiered' | 'dynamic' | 'surge' | 'early_bird';
type PricingTrigger = 'time_based' | 'capacity_based' | 'demand_based' | 'manual';

interface PriceHistory {
  id: string;
  eventId: string;
  ticketTypeId: string;
  oldPrice: number;
  newPrice: number;
  changePercentage: number;
  changeAmount: number;
  trigger: PricingTrigger;
  reason: string;
  ticketsSoldAtTime: number;
  capacityPercentage: number;
  salesVelocity?: number;
  changedAt: Date;
  automatic: boolean;
}

interface PriceRecommendation {
  eventId: string;
  ticketTypeId: string;
  currentPrice: number;
  currentSales: number;
  currentVelocity: number;
  recommendedPrice: number;
  confidence: number;
  expectedImpact: {
    salesIncrease?: number;
    revenueIncrease?: number;
    selloutTime?: Date;
  };
  factors: {
    factor: string;
    weight: number;
    impact: 'increase' | 'decrease' | 'neutral';
  }[];
  reasons: string[];
  generatedAt: Date;
}

interface DynamicPricingConfig {
  id: string;
  eventId: string;
  ticketTypeId: string;
  strategy: PricingStrategy;
  isActive: boolean;
  basePrice: number;
  minPrice: number;
  maxPrice: number;
  currency: string;
  autoAdjust: boolean;
  adjustmentFrequency?: number;
  lastAdjusted?: Date;
}

export default function EventPricingPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [recommendation, setRecommendation] = useState<PriceRecommendation | null>(null);
  const [config, setConfig] = useState<DynamicPricingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicketType, setSelectedTicketType] = useState<string>('');

  const loadPricingData = async () => {
    try {
      const functions = getFunctions();

      // Load price history
      const getPriceHistory = httpsCallable(functions, 'getPriceHistory');
      const historyResult = await getPriceHistory({ eventId, limit: 20 });
      const history = (historyResult.data as any).history || [];
      setPriceHistory(history);

      // Load recommendation if ticket type selected
      if (selectedTicketType) {
        const getPriceRecommendation = httpsCallable(functions, 'getPriceRecommendation');
        const recResult = await getPriceRecommendation({
          eventId,
          ticketTypeId: selectedTicketType,
        });
        setRecommendation((recResult.data as any).recommendation);
      }

      setLoading(false);
      setError(null);
    } catch (err: any) {
      console.error('Error loading pricing data:', err);
      setError(err.message || 'Failed to load pricing data');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPricingData();
  }, [eventId, selectedTicketType]);

  const handleApplyRecommendation = async () => {
    if (!recommendation) return;

    if (
      !confirm(
        `Aplicar novo preço de ${formatCurrency(recommendation.recommendedPrice)}? (actual: ${formatCurrency(recommendation.currentPrice)})`
      )
    ) {
      return;
    }

    try {
      const functions = getFunctions();
      const applyPriceChange = httpsCallable(functions, 'applyPriceChange');

      await applyPriceChange({
        eventId,
        ticketTypeId: recommendation.ticketTypeId,
        newPrice: recommendation.recommendedPrice,
        reason: 'Applied AI recommendation',
      });

      alert('Preço actualizado com sucesso!');
      await loadPricingData();
    } catch (err: any) {
      alert('Erro ao actualizar preço: ' + err.message);
    }
  };

  const handleManualPriceChange = async () => {
    const newPriceStr = prompt('Introduza o novo preço:');
    if (!newPriceStr) return;

    const newPrice = parseFloat(newPriceStr);
    if (isNaN(newPrice) || newPrice <= 0) {
      alert('Preço inválido');
      return;
    }

    const reason = prompt('Razão para a mudança de preço:') || 'Manual price adjustment';

    try {
      const functions = getFunctions();
      const applyPriceChange = httpsCallable(functions, 'applyPriceChange');

      await applyPriceChange({
        eventId,
        ticketTypeId: selectedTicketType,
        newPrice,
        reason,
      });

      alert('Preço actualizado com sucesso!');
      await loadPricingData();
    } catch (err: any) {
      alert('Erro ao actualizar preço: ' + err.message);
    }
  };

  const getTriggerLabel = (trigger: PricingTrigger) => {
    const labels: Record<PricingTrigger, string> = {
      time_based: 'Baseado no Tempo',
      capacity_based: 'Baseado na Lotação',
      demand_based: 'Baseado na Procura',
      manual: 'Manual',
    };
    return labels[trigger] || trigger;
  };

  const getImpactIcon = (impact: 'increase' | 'decrease' | 'neutral') => {
    switch (impact) {
      case 'increase':
        return <TrendingUp className="w-4 h-4 text-success" />;
      case 'decrease':
        return <TrendingDown className="w-4 h-4 text-error" />;
      case 'neutral':
        return <div className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Preços Dinâmicos">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <RefreshCcw className="w-8 h-8 text-brand-primary animate-spin" />
            <p className="text-zinc-400">A carregar dados de preços...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Preços Dinâmicos">
        <div className="card">
          <div className="card-body text-center">
            <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Erro ao carregar preços</h3>
            <p className="text-zinc-400 mb-4">{error}</p>
            <button onClick={loadPricingData} className="btn btn-primary">
              Tentar novamente
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Preços Dinâmicos"
      actions={
        <div className="flex items-center gap-2">
          {selectedTicketType && (
            <button onClick={handleManualPriceChange} className="btn btn-ghost btn-sm">
              <Settings className="w-4 h-4" />
              Ajustar Preço
            </button>
          )}
          <button onClick={loadPricingData} className="btn btn-ghost btn-sm">
            <RefreshCcw className="w-4 h-4" />
            Actualizar
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* AI Price Recommendation */}
        {recommendation && (
          <div className="card border-2 border-brand-primary bg-brand-primary/5">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-brand-primary" />
                <h2 className="card-title">Recomendação de Preço IA</h2>
                <span className="badge badge-sm badge-success">
                  {recommendation.confidence}% confiança
                </span>
              </div>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Current Price */}
                <div>
                  <p className="text-sm text-zinc-400 mb-1">Preço Actual</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(recommendation.currentPrice)}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {formatNumber(recommendation.currentSales)} vendidos
                  </p>
                </div>

                {/* Recommended Price */}
                <div>
                  <p className="text-sm text-zinc-400 mb-1">Preço Recomendado</p>
                  <p className="text-2xl font-bold text-brand-primary">
                    {formatCurrency(recommendation.recommendedPrice)}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {recommendation.recommendedPrice > recommendation.currentPrice ? (
                      <span className="text-success flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />+
                        {(
                          ((recommendation.recommendedPrice - recommendation.currentPrice) /
                            recommendation.currentPrice) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    ) : (
                      <span className="text-error flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        {(
                          ((recommendation.currentPrice - recommendation.recommendedPrice) /
                            recommendation.currentPrice) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    )}
                  </p>
                </div>

                {/* Expected Impact */}
                <div>
                  <p className="text-sm text-zinc-400 mb-1">Impacto Esperado</p>
                  {recommendation.expectedImpact.revenueIncrease !== undefined && (
                    <p className="text-2xl font-bold text-success">
                      +{recommendation.expectedImpact.revenueIncrease.toFixed(1)}%
                    </p>
                  )}
                  <p className="text-xs text-zinc-500 mt-1">Aumento de receita</p>
                </div>
              </div>

              {/* Reasons */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-white mb-3">Factores Considerados</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {recommendation.factors.map((factor, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-lg bg-background-secondary"
                    >
                      {getImpactIcon(factor.impact)}
                      <div className="flex-1">
                        <p className="text-sm text-white">{factor.factor}</p>
                        <div className="h-1.5 bg-background rounded-full mt-1">
                          <div
                            className="h-full bg-brand-primary rounded-full"
                            style={{ width: `${factor.weight * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-zinc-500">
                        {(factor.weight * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reasons List */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-white mb-3">Análise Detalhada</h3>
                <ul className="space-y-2">
                  {recommendation.reasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-zinc-300">
                      <CheckCircle className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Apply Button */}
              <button onClick={handleApplyRecommendation} className="btn btn-primary w-full">
                <Zap className="w-4 h-4" />
                Aplicar Recomendação
              </button>
            </div>
          </div>
        )}

        {/* Price History Chart Placeholder */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-brand-primary" />
              <h2 className="card-title">Histórico de Preços</h2>
            </div>
          </div>
          <div className="card-body">
            {priceHistory.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  Nenhum histórico de preços
                </h3>
                <p className="text-zinc-400">
                  As mudanças de preço aparecerão aqui quando ocorrerem.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {priceHistory.map((change) => (
                  <div
                    key={change.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-background-secondary hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {change.changePercentage > 0 ? (
                          <TrendingUp className="w-5 h-5 text-success" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-error" />
                        )}
                        <div>
                          <p className="font-medium text-white">
                            {formatCurrency(change.oldPrice)} → {formatCurrency(change.newPrice)}
                          </p>
                          <p className="text-sm text-zinc-400">{change.reason}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(change.changedAt).toLocaleString('pt-CV', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                        <span>{getTriggerLabel(change.trigger)}</span>
                        <span>
                          {formatNumber(change.ticketsSoldAtTime)} vendidos (
                          {change.capacityPercentage.toFixed(1)}% lotação)
                        </span>
                        {change.salesVelocity && (
                          <span>{change.salesVelocity.toFixed(1)} bilhetes/hora</span>
                        )}
                        {change.automatic && (
                          <span className="flex items-center gap-1 text-brand-primary">
                            <Zap className="w-3 h-3" />
                            Automático
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${
                          change.changePercentage > 0 ? 'text-success' : 'text-error'
                        }`}
                      >
                        {change.changePercentage > 0 ? '+' : ''}
                        {change.changePercentage.toFixed(1)}%
                      </p>
                      <p className="text-xs text-zinc-500">
                        {change.changePercentage > 0 ? '+' : ''}
                        {formatCurrency(change.changeAmount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pricing Strategy Info */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-brand-primary" />
              <h2 className="card-title">Configuração de Preços</h2>
            </div>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-white mb-3">
                  Estratégia de Preços Dinâmicos
                </h3>
                <p className="text-zinc-400 text-sm mb-4">
                  O sistema ajusta automaticamente os preços com base na procura, tempo e
                  lotação para maximizar a receita.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-zinc-300">Preços baseados na procura</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-zinc-300">Ajustes automáticos de preço</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-zinc-300">Recomendações IA em tempo real</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-zinc-300">Controlo manual sempre disponível</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-white mb-3">Como Funciona</h3>
                <ol className="space-y-3 text-sm text-zinc-400">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center text-xs font-medium">
                      1
                    </span>
                    <span>
                      O sistema analisa vendas, procura e comportamento dos compradores
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center text-xs font-medium">
                      2
                    </span>
                    <span>
                      A IA calcula o preço óptimo para maximizar receita e vendas
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center text-xs font-medium">
                      3
                    </span>
                    <span>Recebe recomendações para aprovar ou ajustar manualmente</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center text-xs font-medium">
                      4
                    </span>
                    <span>
                      Os preços são actualizados automaticamente (se configurado)
                    </span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
