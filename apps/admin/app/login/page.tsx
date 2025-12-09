'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const tokenResult = await userCredential.user.getIdTokenResult();

      // Redirect based on role
      if (tokenResult.claims.platformRole === 'super_admin') {
        router.push('/super-admin');
      } else if (tokenResult.claims.organizationId) {
        router.push('/dashboard');
      } else {
        setError('Conta sem permissoes de acesso ao painel de administracao.');
        await auth.signOut();
      }
    } catch (err: unknown) {
      const errorCode = (err as { code?: string })?.code;
      switch (errorCode) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Email ou palavra-passe incorretos.');
          break;
        case 'auth/too-many-requests':
          setError('Demasiadas tentativas. Tente novamente mais tarde.');
          break;
        default:
          setError('Ocorreu um erro. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Introduza o email para recuperar a palavra-passe.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch {
      setError('Erro ao enviar email de recuperacao.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-secondary/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary mb-4">
            <span className="text-white font-bold text-2xl">E</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-white">EventsCV Admin</h1>
          <p className="text-zinc-400 mt-2">Faca login para aceder ao painel</p>
        </div>

        {/* Login Form */}
        <div className="card">
          <div className="card-body">
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-error/10 border border-error/20">
                  <AlertCircle size={20} className="text-error flex-shrink-0" />
                  <p className="text-sm text-error">{error}</p>
                </div>
              )}

              {resetSent && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/20">
                  <Mail size={20} className="text-success flex-shrink-0" />
                  <p className="text-sm text-success">
                    Email de recuperacao enviado para {email}
                  </p>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                  />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input pl-12"
                    placeholder="seu@email.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Palavra-passe
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                  />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input pl-12"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="text-sm text-brand-primary hover:text-brand-secondary transition-colors"
                >
                  Esqueceu a palavra-passe?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg w-full"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    A entrar...
                  </>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-sm text-zinc-500 mt-6">
          EventsCV 2024. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
