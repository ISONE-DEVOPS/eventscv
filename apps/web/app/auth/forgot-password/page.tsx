'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Ticket,
  Mail,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../../lib/firebase';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Email validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      setError('Formato de email inválido.');
      return;
    }

    setIsLoading(true);

    try {
      // Send password reset email
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/auth/login`,
        handleCodeInApp: false,
      });

      setSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);

      // Handle specific Firebase errors
      if (err.code === 'auth/user-not-found') {
        // Don't reveal if user exists or not for security
        setSuccess(true);
      } else if (err.code === 'auth/invalid-email') {
        setError('Formato de email inválido.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Demasiadas tentativas. Aguarda alguns minutos.');
      } else {
        setError('Erro ao enviar email de recuperação. Tenta novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="glass-card p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-4">
              Email Enviado!
            </h1>

            <p className="text-zinc-400 mb-8">
              Se existe uma conta associada a <strong className="text-white">{email}</strong>,
              receberás um email com instruções para redefinir a tua password.
            </p>

            <div className="space-y-3">
              <Link href="/auth/login" className="btn btn-primary w-full inline-flex items-center justify-center gap-2">
                Voltar ao Login
                <ArrowRight className="w-5 h-5" />
              </Link>

              <button
                onClick={() => setSuccess(false)}
                className="btn btn-ghost w-full"
              >
                Tentar outro email
              </button>
            </div>

            <div className="mt-8 p-4 bg-zinc-900 rounded-xl text-left">
              <p className="text-sm font-semibold text-white mb-2">
                Não recebeste o email?
              </p>
              <ul className="text-xs text-zinc-400 space-y-1">
                <li>• Verifica a pasta de spam</li>
                <li>• Aguarda alguns minutos (pode demorar)</li>
                <li>• Confirma se o email está correto</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    );
  }

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
            Esqueceste a tua{' '}
            <span className="text-gradient">password</span>?
          </h1>
          <p className="text-xl text-zinc-400 leading-relaxed">
            Sem problema! Envia-te um email com instruções para redefinires a tua password.
          </p>

          <div className="mt-16 p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-brand-primary flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-white mb-2">Dica de Segurança</p>
                <p className="text-sm text-zinc-400">
                  Nunca partilhes a tua password com ninguém. O EventsCV nunca te pedirá
                  a password por email ou telefone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Forgot Password Form */}
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
            {/* Back Button */}
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Voltar ao login</span>
            </Link>

            <div className="mb-8">
              <h2 className="font-display text-2xl font-bold text-white mb-2">
                Recuperar password
              </h2>
              <p className="text-zinc-400">
                Insere o teu email e envia-te um link para redefinires a password.
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
                    autoFocus
                  />
                </div>
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
                    Enviar link de recuperação
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-center text-sm text-zinc-400">
                Ainda não tens conta?{' '}
                <Link href="/auth/register" className="text-brand-primary hover:text-brand-secondary transition-colors">
                  Criar conta
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
