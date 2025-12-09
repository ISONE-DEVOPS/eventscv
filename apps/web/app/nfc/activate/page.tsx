'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Ticket,
  Smartphone,
  QrCode,
  Camera,
  Keyboard,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Zap,
  Shield,
  Gift,
  Nfc,
  Watch,
} from 'lucide-react';

type WristbandType = 'qrcode' | 'rubber';
type ActivationStep = 'type' | 'method' | 'scan' | 'nfc' | 'manual' | 'event' | 'confirm' | 'success';

// Mock events for linking
const availableEvents = [
  {
    id: '1',
    name: 'Festival Baía das Gatas 2024',
    date: '15-17 Dez 2024',
    location: 'Mindelo, São Vicente',
  },
  {
    id: '3',
    name: 'Beach Party Sal 2024',
    date: '28 Dez 2024',
    location: 'Santa Maria, Sal',
  },
];

export default function ActivateNFCPage() {
  const router = useRouter();
  const [step, setStep] = useState<ActivationStep>('type');
  const [wristbandType, setWristbandType] = useState<WristbandType | null>(null);
  const [serialNumber, setSerialNumber] = useState('');
  const [wristbandName, setWristbandName] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isNfcReading, setIsNfcReading] = useState(false);
  const [error, setError] = useState('');

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!serialNumber || serialNumber.length < 10) {
      setError('Introduz um número de série válido');
      return;
    }

    setStep('event');
  };

  const handleActivate = async () => {
    setIsProcessing(true);
    setError('');

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStep('success');
    } catch (err) {
      setError('Erro ao ativar a pulseira. Tenta novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNfcRead = async () => {
    setIsNfcReading(true);
    setError('');

    try {
      // Check if Web NFC API is available
      if ('NDEFReader' in window) {
        const ndef = new (window as any).NDEFReader();
        await ndef.scan();

        ndef.addEventListener('reading', ({ serialNumber: nfcSerial }: any) => {
          setSerialNumber(nfcSerial.toUpperCase().replace(/:/g, ''));
          setIsNfcReading(false);
          setStep('event');
        });

        ndef.addEventListener('readingerror', () => {
          setError('Não foi possível ler a pulseira. Tenta novamente.');
          setIsNfcReading(false);
        });
      } else {
        // Simulate NFC read for demo purposes
        await new Promise((resolve) => setTimeout(resolve, 3000));
        setSerialNumber('ECV-2024-NFC' + Math.random().toString(36).substring(2, 8).toUpperCase());
        setIsNfcReading(false);
        setStep('event');
      }
    } catch (err) {
      setError('Erro ao ler NFC. Verifica se o NFC está ativado no teu dispositivo.');
      setIsNfcReading(false);
    }
  };

  const selectWristbandType = (type: WristbandType) => {
    setWristbandType(type);
    setStep('method');
  };

  const renderStep = () => {
    switch (step) {
      case 'type':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-10 w-10 text-white" />
              </div>
              <h2 className="heading-display text-2xl mb-2">Ativar Pulseira NFC</h2>
              <p className="text-zinc-400">
                Que tipo de pulseira tens?
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => selectWristbandType('qrcode')}
                className="w-full flex items-center gap-4 p-5 glass-card hover:border-brand-accent/50 transition-all group"
              >
                <div className="w-14 h-14 rounded-xl bg-brand-accent/20 flex items-center justify-center">
                  <QrCode className="h-7 w-7 text-brand-accent" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-white group-hover:text-brand-accent transition-colors">
                    Pulseira com QR Code
                  </h3>
                  <p className="text-sm text-zinc-500">
                    Pulseira de tecido ou plástico com código QR impresso
                  </p>
                </div>
              </button>

              <button
                onClick={() => selectWristbandType('rubber')}
                className="w-full flex items-center gap-4 p-5 glass-card hover:border-brand-primary/50 transition-all group"
              >
                <div className="w-14 h-14 rounded-xl bg-brand-primary/20 flex items-center justify-center">
                  <Watch className="h-7 w-7 text-brand-primary" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-white group-hover:text-brand-primary transition-colors">
                    Pulseira de Borracha NFC
                  </h3>
                  <p className="text-sm text-zinc-500">
                    Pulseira de silicone/borracha sem QR Code visível
                  </p>
                </div>
              </button>
            </div>

            <div className="mt-8 p-4 rounded-xl bg-brand-accent/10 border border-brand-accent/20">
              <div className="flex items-start gap-3">
                <Gift className="h-5 w-5 text-brand-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-brand-accent">Primeira pulseira?</p>
                  <p className="text-sm text-zinc-400 mt-1">
                    Recebe 500$00 de bónus ao ativar a tua primeira pulseira NFC!
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'method':
        return (
          <div className="space-y-6">
            <button
              onClick={() => setStep('type')}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Voltar
            </button>

            <div className="text-center mb-8">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                wristbandType === 'qrcode' ? 'bg-brand-accent/20' : 'bg-brand-primary/20'
              }`}>
                {wristbandType === 'qrcode' ? (
                  <QrCode className="h-10 w-10 text-brand-accent" />
                ) : (
                  <Watch className="h-10 w-10 text-brand-primary" />
                )}
              </div>
              <h2 className="heading-display text-2xl mb-2">
                {wristbandType === 'qrcode' ? 'Pulseira com QR Code' : 'Pulseira de Borracha'}
              </h2>
              <p className="text-zinc-400">
                Escolhe como queres ativar
              </p>
            </div>

            <div className="space-y-3">
              {wristbandType === 'qrcode' ? (
                <>
                  <button
                    onClick={() => setStep('scan')}
                    className="w-full flex items-center gap-4 p-5 glass-card hover:border-brand-accent/50 transition-all group"
                  >
                    <div className="w-14 h-14 rounded-xl bg-brand-accent/20 flex items-center justify-center">
                      <Camera className="h-7 w-7 text-brand-accent" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-white group-hover:text-brand-accent transition-colors">
                        Escanear QR Code
                      </h3>
                      <p className="text-sm text-zinc-500">
                        Usa a câmara para ler o código na pulseira
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => setStep('manual')}
                    className="w-full flex items-center gap-4 p-5 glass-card hover:border-white/20 transition-all group"
                  >
                    <div className="w-14 h-14 rounded-xl bg-background-tertiary flex items-center justify-center">
                      <Keyboard className="h-7 w-7 text-zinc-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-white group-hover:text-zinc-300 transition-colors">
                        Introduzir Manualmente
                      </h3>
                      <p className="text-sm text-zinc-500">
                        Digita o número de série da pulseira
                      </p>
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setStep('nfc')}
                    className="w-full flex items-center gap-4 p-5 glass-card hover:border-brand-primary/50 transition-all group"
                  >
                    <div className="w-14 h-14 rounded-xl bg-brand-primary/20 flex items-center justify-center">
                      <Nfc className="h-7 w-7 text-brand-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-white group-hover:text-brand-primary transition-colors">
                        Ler via NFC
                      </h3>
                      <p className="text-sm text-zinc-500">
                        Aproxima a pulseira do telemóvel para ler
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => setStep('manual')}
                    className="w-full flex items-center gap-4 p-5 glass-card hover:border-white/20 transition-all group"
                  >
                    <div className="w-14 h-14 rounded-xl bg-background-tertiary flex items-center justify-center">
                      <Keyboard className="h-7 w-7 text-zinc-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-white group-hover:text-zinc-300 transition-colors">
                        Introduzir Manualmente
                      </h3>
                      <p className="text-sm text-zinc-500">
                        Digita o código gravado na pulseira
                      </p>
                    </div>
                  </button>
                </>
              )}
            </div>

            {wristbandType === 'rubber' && (
              <div className="mt-4 p-4 rounded-xl bg-brand-primary/10 border border-brand-primary/20">
                <div className="flex items-start gap-3">
                  <Nfc className="h-5 w-5 text-brand-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-brand-light">Dica</p>
                    <p className="text-sm text-zinc-400 mt-1">
                      O código da pulseira de borracha está gravado na parte interior ou no fecho.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'scan':
        return (
          <div className="space-y-6">
            <button
              onClick={() => setStep('method')}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Voltar
            </button>

            <div className="text-center">
              <h2 className="heading-display text-2xl mb-2">Escanear QR Code</h2>
              <p className="text-zinc-400">
                Aponta a câmara para o código QR na pulseira
              </p>
            </div>

            {/* Camera Preview Placeholder */}
            <div className="aspect-square max-w-sm mx-auto rounded-3xl bg-background-secondary border-2 border-dashed border-white/20 flex flex-col items-center justify-center">
              <QrCode className="h-16 w-16 text-zinc-600 mb-4" />
              <p className="text-zinc-500 text-center px-8">
                A funcionalidade de câmara requer permissões do dispositivo
              </p>
              <button
                onClick={() => setStep('manual')}
                className="mt-4 text-brand-accent hover:text-brand-light transition-colors text-sm"
              >
                Introduzir manualmente
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-zinc-500">
                Não consegues escanear?{' '}
                <button
                  onClick={() => setStep('manual')}
                  className="text-brand-accent hover:text-brand-light transition-colors"
                >
                  Introduz o código manualmente
                </button>
              </p>
            </div>
          </div>
        );

      case 'nfc':
        return (
          <div className="space-y-6">
            <button
              onClick={() => {
                setIsNfcReading(false);
                setStep('method');
              }}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Voltar
            </button>

            <div className="text-center">
              <h2 className="heading-display text-2xl mb-2">Ler Pulseira NFC</h2>
              <p className="text-zinc-400">
                Aproxima a pulseira da parte de trás do telemóvel
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-error/10 border border-error/20 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-error flex-shrink-0" />
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            {/* NFC Reading Animation */}
            <div className="aspect-square max-w-sm mx-auto rounded-3xl bg-background-secondary border-2 border-brand-primary/30 flex flex-col items-center justify-center relative overflow-hidden">
              {isNfcReading && (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border-4 border-brand-primary/30 animate-ping" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 rounded-full border-2 border-brand-primary/20 animate-ping animation-delay-300" />
                  </div>
                </>
              )}
              <div className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center ${
                isNfcReading ? 'bg-brand-primary/20 animate-pulse' : 'bg-brand-primary/10'
              }`}>
                <Nfc className={`h-12 w-12 ${isNfcReading ? 'text-brand-primary' : 'text-zinc-500'}`} />
              </div>
              <p className={`mt-6 text-center px-8 ${isNfcReading ? 'text-brand-light' : 'text-zinc-500'}`}>
                {isNfcReading
                  ? 'A procurar pulseira...'
                  : 'Clica no botão abaixo para iniciar a leitura'}
              </p>
            </div>

            {!isNfcReading ? (
              <button
                onClick={handleNfcRead}
                className="btn btn-primary w-full"
              >
                <Nfc className="h-5 w-5" />
                Iniciar Leitura NFC
              </button>
            ) : (
              <button
                onClick={() => setIsNfcReading(false)}
                className="btn btn-ghost w-full"
              >
                Cancelar
              </button>
            )}

            <div className="text-center">
              <p className="text-sm text-zinc-500">
                Não funciona?{' '}
                <button
                  onClick={() => setStep('manual')}
                  className="text-brand-primary hover:text-brand-light transition-colors"
                >
                  Introduz o código manualmente
                </button>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-background-tertiary">
              <h4 className="font-medium text-white mb-2">Como funciona:</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-primary/20 text-brand-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                  Ativa o NFC no teu telemóvel
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-primary/20 text-brand-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                  Clica em &quot;Iniciar Leitura NFC&quot;
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-primary/20 text-brand-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                  Encosta a pulseira à parte de trás do telemóvel
                </li>
              </ul>
            </div>
          </div>
        );

      case 'manual':
        return (
          <div className="space-y-6">
            <button
              onClick={() => setStep('method')}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Voltar
            </button>

            <div className="text-center mb-8">
              <h2 className="heading-display text-2xl mb-2">
                {wristbandType === 'rubber' ? 'Código da Pulseira' : 'Número de Série'}
              </h2>
              <p className="text-zinc-400">
                {wristbandType === 'rubber'
                  ? 'Encontra o código gravado na parte interior ou no fecho'
                  : 'Encontra o código na parte interior da pulseira'}
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-error/10 border border-error/20 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-error flex-shrink-0" />
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            <form onSubmit={handleManualSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  {wristbandType === 'rubber' ? 'Código da Pulseira' : 'Número de Série'}
                </label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
                  placeholder={wristbandType === 'rubber' ? 'ECV-NFC-XXXXXXXX' : 'ECV-2024-XXXXXXXX'}
                  className="input text-center text-lg tracking-wider font-mono"
                  maxLength={20}
                />
                <p className="text-xs text-zinc-500 mt-2 text-center">
                  Formato: {wristbandType === 'rubber' ? 'ECV-NFC-XXXXXXXX' : 'ECV-2024-XXXXXXXX'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Nome da Pulseira (opcional)
                </label>
                <input
                  type="text"
                  value={wristbandName}
                  onChange={(e) => setWristbandName(e.target.value)}
                  placeholder="Ex: Pulseira Principal"
                  className="input"
                />
              </div>

              <button type="submit" className="btn btn-primary w-full">
                Continuar
              </button>
            </form>
          </div>
        );

      case 'event':
        return (
          <div className="space-y-6">
            <button
              onClick={() => setStep('manual')}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Voltar
            </button>

            <div className="text-center mb-8">
              <h2 className="heading-display text-2xl mb-2">Associar a Evento</h2>
              <p className="text-zinc-400">
                Associa a pulseira a um evento para pagamentos no local
              </p>
            </div>

            <div className="space-y-3">
              {availableEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    selectedEvent === event.id
                      ? 'border-brand-accent bg-brand-accent/10'
                      : 'border-white/10 bg-background-secondary hover:border-white/20'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedEvent === event.id
                      ? 'bg-brand-accent/20'
                      : 'bg-background-tertiary'
                  }`}>
                    <Zap className={`h-6 w-6 ${
                      selectedEvent === event.id ? 'text-brand-accent' : 'text-zinc-500'
                    }`} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-white">{event.name}</h3>
                    <p className="text-sm text-zinc-500">
                      {event.date} • {event.location}
                    </p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedEvent === event.id
                      ? 'border-brand-accent bg-brand-accent'
                      : 'border-zinc-600'
                  }`}>
                    {selectedEvent === event.id && (
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    )}
                  </div>
                </button>
              ))}

              <button
                onClick={() => setSelectedEvent('none')}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  selectedEvent === 'none'
                    ? 'border-brand-primary bg-brand-primary/10'
                    : 'border-white/10 bg-background-secondary hover:border-white/20'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  selectedEvent === 'none'
                    ? 'bg-brand-primary/20'
                    : 'bg-background-tertiary'
                }`}>
                  <Smartphone className={`h-6 w-6 ${
                    selectedEvent === 'none' ? 'text-brand-primary' : 'text-zinc-500'
                  }`} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-white">Sem evento específico</h3>
                  <p className="text-sm text-zinc-500">
                    Associar depois ou usar em qualquer evento
                  </p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedEvent === 'none'
                    ? 'border-brand-primary bg-brand-primary'
                    : 'border-zinc-600'
                }`}>
                  {selectedEvent === 'none' && (
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  )}
                </div>
              </button>
            </div>

            <button
              onClick={() => setStep('confirm')}
              disabled={!selectedEvent}
              className="btn btn-primary w-full"
            >
              Continuar
            </button>
          </div>
        );

      case 'confirm':
        const linkedEvent = availableEvents.find((e) => e.id === selectedEvent);

        return (
          <div className="space-y-6">
            <button
              onClick={() => setStep('event')}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Voltar
            </button>

            <div className="text-center mb-8">
              <h2 className="heading-display text-2xl mb-2">Confirmar Ativação</h2>
              <p className="text-zinc-400">
                Verifica os dados antes de ativar
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-error/10 border border-error/20 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-error flex-shrink-0" />
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="text-zinc-400">Número de Série</span>
                <span className="font-mono text-white">{serialNumber || 'ECV-2024-DEMO1234'}</span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="text-zinc-400">Nome</span>
                <span className="text-white">{wristbandName || 'Pulseira Principal'}</span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="text-zinc-400">Evento Associado</span>
                <span className="text-white">
                  {linkedEvent ? linkedEvent.name : 'Nenhum'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Saldo Inicial</span>
                <span className="text-brand-accent font-bold">0$00</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-success/10 border border-success/20">
              <div className="flex items-start gap-3">
                <Gift className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-success">Bónus de Ativação!</p>
                  <p className="text-sm text-zinc-400 mt-1">
                    Recebes 500$00 de bónus por ativar a tua primeira pulseira.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleActivate}
              disabled={isProcessing}
              className="btn btn-primary w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  A ativar...
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  Ativar Pulseira
                </>
              )}
            </button>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-12 w-12 text-success" />
            </div>
            <h2 className="heading-display text-2xl mb-2">Pulseira Ativada!</h2>
            <p className="text-zinc-400 mb-8">
              A tua pulseira está pronta para usar. Não te esqueças de carregar saldo!
            </p>

            <div className="glass-card p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-zinc-400">Saldo Atual</span>
                <span className="text-2xl font-bold text-brand-accent">500$00</span>
              </div>
              <p className="text-xs text-zinc-500">
                Bónus de ativação creditado automaticamente
              </p>
            </div>

            <div className="flex gap-4">
              <Link href="/nfc" className="btn btn-ghost flex-1">
                Ver Pulseiras
              </Link>
              <Link href="/profile/wallet/topup" className="btn btn-primary flex-1">
                Carregar Saldo
              </Link>
            </div>
          </div>
        );
    }
  };

  return (
    <main className="min-h-screen bg-background pt-20 pb-16">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-subtle">
        <div className="container-app">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/nfc"
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Voltar</span>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <div className="relative h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Ticket className="h-4 w-4 text-white" />
              </div>
              <span className="font-display text-lg font-bold text-white">
                Events<span className="text-gradient">CV</span>
              </span>
            </Link>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <div className="container-app max-w-md">
        {renderStep()}
      </div>
    </main>
  );
}
