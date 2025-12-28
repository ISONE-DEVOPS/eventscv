'use client';

import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';
import { ToastProvider } from '@/contexts/ToastContext';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ToastProvider>
        {children}
      </ToastProvider>
    </ThemeProvider>
  );
}
