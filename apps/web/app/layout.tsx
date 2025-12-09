import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
});

export const metadata: Metadata = {
  title: {
    default: 'EventsCV - Plataforma de Eventos de Cabo Verde',
    template: '%s | EventsCV',
  },
  description:
    'Descubra e compre bilhetes para os melhores eventos em Cabo Verde. Música, desporto, cultura e muito mais.',
  keywords: [
    'eventos',
    'cabo verde',
    'bilhetes',
    'concertos',
    'festivais',
    'praia',
    'mindelo',
  ],
  authors: [{ name: 'EventsCV' }],
  creator: 'EventsCV',
  openGraph: {
    type: 'website',
    locale: 'pt_PT',
    url: 'https://eventscv.cv',
    siteName: 'EventsCV',
    title: 'EventsCV - Plataforma de Eventos de Cabo Verde',
    description:
      'Descubra e compre bilhetes para os melhores eventos em Cabo Verde.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'EventsCV',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EventsCV - Plataforma de Eventos de Cabo Verde',
    description:
      'Descubra e compre bilhetes para os melhores eventos em Cabo Verde.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body className="min-h-screen bg-background font-body text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
