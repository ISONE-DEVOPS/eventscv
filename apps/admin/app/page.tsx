'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      const tokenResult = await user.getIdTokenResult();

      if (tokenResult.claims.platformRole === 'super_admin') {
        router.push('/super-admin');
      } else if (tokenResult.claims.organizationId) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary animate-pulse" />
        <p className="text-zinc-400">A redirecionar...</p>
      </div>
    </div>
  );
}
