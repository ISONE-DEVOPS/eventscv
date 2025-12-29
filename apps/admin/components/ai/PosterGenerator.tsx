'use client';

import { useState } from 'react';
import { Sparkles, Wand2, Download, Check, Loader2, X } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../lib/firebase';
import type { PosterStyle } from '@eventscv/shared-types';

interface PosterGeneratorProps {
  eventId: string;
  eventTitle: string;
  currentCoverImage?: string;
  onPosterGenerated?: (imageUrl: string) => void;
}

interface GeneratedPoster {
  posterId: string;
  imageUrl: string;
  thumbnailUrl: string;
  style: PosterStyle;
}

const POSTER_STYLES: {
  value: PosterStyle;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    value: 'vibrant',
    label: 'Vibrante',
    description: 'Cores energéticas, design ousado e moderno',
    icon: '🌈',
  },
  {
    value: 'minimal',
    label: 'Minimalista',
    description: 'Limpo, elegante, com muito espaço em branco',
    icon: '⚪',
  },
  {
    value: 'elegant',
    label: 'Elegante',
    description: 'Sofisticado, premium, com acentos dourados',
    icon: '✨',
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Sombrio, atmosférico, estética cyberpunk',
    icon: '🌑',
  },
];

export function PosterGenerator({
  eventId,
  eventTitle,
  currentCoverImage,
  onPosterGenerated,
}: PosterGeneratorProps) {
  const [selectedStyle, setSelectedStyle] = useState<PosterStyle>('vibrant');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPosters, setGeneratedPosters] = useState<GeneratedPoster[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedPoster, setSelectedPoster] = useState<string | null>(null);
  const [isSettingCover, setIsSettingCover] = useState(false);

  const handleGenerate = async () => {
    setError(null);
    setIsGenerating(true);

    try {
      const generateFn = httpsCallable<
        {
          eventId: string;
          style: PosterStyle;
          customPrompt?: string;
          userId: string;
        },
        {
          posterId: string;
          imageUrl: string;
          thumbnailUrl: string;
        }
      >(functions, 'generatePoster');

      const result = await generateFn({
        eventId,
        style: selectedStyle,
        customPrompt: customPrompt || undefined,
        userId: 'current-user', // TODO: Get from auth context
      });

      const newPoster: GeneratedPoster = {
        posterId: result.data.posterId,
        imageUrl: result.data.imageUrl,
        thumbnailUrl: result.data.thumbnailUrl,
        style: selectedStyle,
      };

      setGeneratedPosters((prev) => [newPoster, ...prev]);
      setSelectedPoster(newPoster.posterId);

      // Notify parent
      if (onPosterGenerated) {
        onPosterGenerated(newPoster.imageUrl);
      }
    } catch (err: any) {
      console.error('Error generating poster:', err);
      setError(err.message || 'Erro ao gerar poster. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSetAsCover = async (posterId: string) => {
    setIsSettingCover(true);
    setError(null);

    try {
      const setPosterFn = httpsCallable<
        {
          posterId: string;
          eventId: string;
          userId: string;
        },
        {
          success: boolean;
          coverImage: string;
        }
      >(functions, 'setPosterAsCover');

      const result = await setPosterFn({
        posterId,
        eventId,
        userId: 'current-user', // TODO: Get from auth context
      });

      if (result.data.success && onPosterGenerated) {
        onPosterGenerated(result.data.coverImage);
      }
    } catch (err: any) {
      console.error('Error setting cover:', err);
      setError(err.message || 'Erro ao definir capa. Tente novamente.');
    } finally {
      setIsSettingCover(false);
    }
  };

  const handleDownload = (imageUrl: string, style: PosterStyle) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${eventTitle}-${style}-poster.png`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10">
          <Sparkles className="w-6 h-6 text-purple-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Gerador de Posters com IA</h3>
          <p className="text-sm text-zinc-400">
            Crie posters profissionais em segundos com FLUX Pro
          </p>
        </div>
      </div>

      {/* Style Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-white">Estilo do Poster</label>
        <div className="grid grid-cols-2 gap-3">
          {POSTER_STYLES.map((style) => (
            <button
              key={style.value}
              type="button"
              onClick={() => setSelectedStyle(style.value)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                selectedStyle === style.value
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-white/10 bg-zinc-800/50 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{style.icon}</span>
                <span className="font-semibold text-white">{style.label}</span>
              </div>
              <p className="text-xs text-zinc-400">{style.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Prompt (Optional) */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white">
          Prompt Personalizado (Opcional)
        </label>
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Descreva detalhes adicionais que quer incluir no poster..."
          className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
          rows={3}
          maxLength={500}
        />
        <p className="text-xs text-zinc-500">
          {customPrompt.length}/500 caracteres
        </p>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-white transition-colors"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Gerando Poster...
          </>
        ) : (
          <>
            <Wand2 className="w-5 h-5" />
            Gerar Poster com IA
          </>
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <div className="flex items-start gap-3">
            <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-500">Erro</p>
              <p className="text-sm text-red-400 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Generated Posters Gallery */}
      {generatedPosters.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white">Posters Gerados</h4>
            <span className="text-xs text-zinc-400">
              {generatedPosters.length} {generatedPosters.length === 1 ? 'poster' : 'posters'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {generatedPosters.map((poster) => (
              <div
                key={poster.posterId}
                className={`relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  selectedPoster === poster.posterId
                    ? 'border-purple-500 ring-2 ring-purple-500/20'
                    : 'border-white/10 hover:border-white/20'
                }`}
                onClick={() => setSelectedPoster(poster.posterId)}
              >
                <div className="aspect-[3/4] relative">
                  <img
                    src={poster.imageUrl}
                    alt={`Poster ${poster.style}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Style Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-xs text-white font-medium">
                      {POSTER_STYLES.find((s) => s.value === poster.style)?.icon}{' '}
                      {POSTER_STYLES.find((s) => s.value === poster.style)?.label}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(poster.imageUrl, poster.style);
                        }}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-xs text-white font-medium transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetAsCover(poster.posterId);
                        }}
                        disabled={isSettingCover}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 rounded-lg text-xs text-white font-medium transition-colors"
                      >
                        {isSettingCover ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )}
                        Usar como Capa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-500">Como funciona</p>
            <ul className="text-sm text-blue-400 mt-2 space-y-1">
              <li>• Escolha um estilo que combine com o seu evento</li>
              <li>• Adicione detalhes personalizados (opcional)</li>
              <li>• A IA gera um poster profissional em segundos</li>
              <li>• Faça download ou use como capa do evento</li>
            </ul>
            <p className="text-xs text-blue-400/60 mt-3">
              Powered by FLUX 1.1 Pro • Cada geração custa ~€0.04
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
