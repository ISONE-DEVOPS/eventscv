'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Ticket,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // TODO: Implement Firebase authentication
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push('/');
    } catch (err) {
      setError('Email ou password incorretos. Tenta novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      // TODO: Implement Google authentication
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push('/');
    } catch (err) {
      setError('Erro ao autenticar com Google. Tenta novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20" />
        <div className="relative z-10 flex flex-col justify-center p-16">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="relative h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Ticket className="h-6 w-6 text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-white">
              Events<span className="text-gradient">CV</span>
            </span>
          </Link>

          <h1 className="heading-display text-4xl xl:text-5xl mb-6">
            Bem-vindo de volta ao{' '}
            <span className="text-gradient">EventsCV</span>
          </h1>
          <p className="text-xl text-zinc-400 leading-relaxed">
            Descobre os melhores eventos em Cabo Verde. Música, desporto, cultura e muito mais à tua espera.
          </p>

          <div className="mt-16 grid grid-cols-3 gap-8">
            <div>
              <p className="text-3xl font-bold text-gradient">500+</p>
              <p className="text-zinc-500 mt-1">Eventos</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gradient">50K+</p>
              <p className="text-zinc-500 mt-1">Utilizadores</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gradient">9</p>
              <p className="text-zinc-500 mt-1">Ilhas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Ticket className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-white">
                Events<span className="text-gradient">CV</span>
              </span>
            </Link>
          </div>

          <div className="glass-card p-8">
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl font-bold text-white mb-2">
                Entrar na conta
              </h2>
              <p className="text-zinc-400">
                Ainda não tens conta?{' '}
                <Link href="/auth/register" className="text-brand-primary hover:text-brand-secondary transition-colors">
                  Criar conta
                </Link>
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="input pl-12"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input pl-12 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-background-secondary text-brand-primary focus:ring-brand-primary focus:ring-offset-0" />
                  <span className="text-sm text-zinc-400">Lembrar-me</span>
                </label>
                <Link href="/auth/forgot-password" className="text-sm text-brand-primary hover:text-brand-secondary transition-colors">
                  Esqueci a password
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-background-secondary text-sm text-zinc-500">ou continua com</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="btn btn-ghost w-full"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
          </div>

          <p className="text-center text-xs text-zinc-500 mt-8">
            Ao continuar, aceitas os nossos{' '}
            <Link href="/terms" className="text-zinc-400 hover:text-white transition-colors">
              Termos de Serviço
            </Link>{' '}
            e{' '}
            <Link href="/privacy" className="text-zinc-400 hover:text-white transition-colors">
              Política de Privacidade
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
