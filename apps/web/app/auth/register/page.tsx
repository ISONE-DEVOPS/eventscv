'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Ticket,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Check,
} from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../../lib/firebase';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const passwordRequirements = [
    { label: 'Mínimo 8 caracteres', met: formData.password.length >= 8 },
    { label: 'Uma letra maiúscula', met: /[A-Z]/.test(formData.password) },
    { label: 'Uma letra minúscula', met: /[a-z]/.test(formData.password) },
    { label: 'Um número', met: /[0-9]/.test(formData.password) },
  ];

  // Email validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone validation for Cabo Verde (+238)
  const isValidPhone = (phone: string): boolean => {
    // Remove spaces and dashes
    const cleanPhone = phone.replace(/[\s-]/g, '');
    // Cabo Verde phone: +238 followed by 7 digits, or just 7 digits
    const phoneRegex = /^(\+238|238)?[0-9]{7}$/;
    return phoneRegex.test(cleanPhone);
  };

  // Name validation (min 2 characters, only letters and spaces)
  const isValidName = (name: string): boolean => {
    return name.trim().length >= 2 && /^[a-zA-ZÀ-ÿ\s]+$/.test(name);
  };

  // Helper function to create user document in Firestore
  const createUserDocument = async (userId: string, email: string, name: string, phone?: string) => {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      id: userId,
      email,
      name,
      phone: phone || '',
      preferredLanguage: 'pt',
      notificationsEnabled: true,
      wallet: {
        balance: 0,
        currency: 'CVE',
        transactions: [],
      },
      loyalty: {
        points: 0,
        tier: 'bronze',
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate name
    if (!isValidName(formData.name)) {
      setError('Nome inválido. Usa apenas letras e espaços (mínimo 2 caracteres).');
      return;
    }

    // Validate email
    if (!isValidEmail(formData.email)) {
      setError('Formato de email inválido.');
      return;
    }

    // Validate phone
    if (formData.phone && !isValidPhone(formData.phone)) {
      setError('Número de telefone inválido. Usa o formato: +238 999 9999 ou 9999999');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As passwords não coincidem.');
      return;
    }

    if (!passwordRequirements.every((req) => req.met)) {
      setError('A password não cumpre os requisitos mínimos.');
      return;
    }

    if (!acceptTerms) {
      setError('Tens de aceitar os termos e condições.');
      return;
    }

    setIsLoading(true);

    try {
      // Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: formData.name,
      });

      // Send email verification
      try {
        await sendEmailVerification(userCredential.user, {
          url: `${window.location.origin}/profile`,
          handleCodeInApp: false,
        });
        console.log('Verification email sent successfully');
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        // Don't fail registration if email sending fails
      }

      // Create user document in Firestore
      await createUserDocument(
        userCredential.user.uid,
        formData.email,
        formData.name,
        formData.phone
      );

      // Redirect to profile page
      router.push('/profile?newUser=true');
    } catch (err: any) {
      console.error('Registration error:', err);

      // Handle specific Firebase errors
      if (err.code === 'auth/email-already-in-use') {
        setError('Este email já está registado. Tenta fazer login.');
      } else if (err.code === 'auth/weak-password') {
        setError('A password é muito fraca. Usa uma password mais forte.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Formato de email inválido.');
      } else {
        setError('Erro ao criar conta. Tenta novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    if (!acceptTerms) {
      setError('Tens de aceitar os termos e condições.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Create user document in Firestore
      await createUserDocument(
        result.user.uid,
        result.user.email || '',
        result.user.displayName || 'Utilizador',
        result.user.phoneNumber || undefined
      );

      // Redirect to profile page
      router.push('/profile');
    } catch (err: any) {
      console.error('Google auth error:', err);

      if (err.code === 'auth/popup-closed-by-user') {
        setError('Autenticação cancelada.');
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setError('Já existe uma conta com este email. Usa outro método de login.');
      } else {
        setError('Erro ao autenticar com Google. Tenta novamente.');
      }
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
            Junta-te à maior comunidade de{' '}
            <span className="text-gradient">eventos</span> de Cabo Verde
          </h1>
          <p className="text-xl text-zinc-400 leading-relaxed">
            Cria a tua conta gratuita e começa a descobrir eventos incríveis nas 9 ilhas.
          </p>

          <div className="mt-16 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-primary/20 flex items-center justify-center">
                <Check className="h-6 w-6 text-brand-primary" />
              </div>
              <div>
                <p className="font-semibold text-white">Compra fácil e segura</p>
                <p className="text-zinc-500">Bilhetes digitais no teu telemóvel</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-accent/20 flex items-center justify-center">
                <Check className="h-6 w-6 text-brand-accent" />
              </div>
              <div>
                <p className="font-semibold text-white">Carteira digital</p>
                <p className="text-zinc-500">Pagamentos rápidos com saldo pré-carregado</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-secondary/20 flex items-center justify-center">
                <Check className="h-6 w-6 text-brand-secondary" />
              </div>
              <div>
                <p className="font-semibold text-white">Pulseira NFC</p>
                <p className="text-zinc-500">Pagamentos sem contacto nos eventos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 overflow-y-auto">
        <div className="w-full max-w-md py-8">
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
                Criar conta
              </h2>
              <p className="text-zinc-400">
                Já tens conta?{' '}
                <Link href="/auth/login" className="text-brand-primary hover:text-brand-secondary transition-colors">
                  Entrar
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
                <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-2">
                  Nome completo
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="João Silva"
                    className="input pl-12"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="seu@email.com"
                    className="input pl-12"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-zinc-300 mb-2">
                  Telefone
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="+238 999 9999"
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
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
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
                {formData.password && (
                  <div className="mt-3 space-y-2">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${req.met ? 'bg-success' : 'bg-zinc-700'}`}>
                          {req.met && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className={`text-xs ${req.met ? 'text-success' : 'text-zinc-500'}`}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-300 mb-2">
                  Confirmar password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                    placeholder="••••••••"
                    className="input pl-12 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-white/10 bg-background-secondary text-brand-primary focus:ring-brand-primary focus:ring-offset-0"
                />
                <span className="text-sm text-zinc-400">
                  Aceito os{' '}
                  <Link href="/terms" className="text-brand-primary hover:text-brand-secondary transition-colors">
                    Termos de Serviço
                  </Link>{' '}
                  e a{' '}
                  <Link href="/privacy" className="text-brand-primary hover:text-brand-secondary transition-colors">
                    Política de Privacidade
                  </Link>
                </span>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Criar conta
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
              onClick={handleGoogleRegister}
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
        </div>
      </div>
    </main>
  );
}
