import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui-components/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        foreground: {
          DEFAULT: 'hsl(var(--foreground))',
          secondary: 'hsl(var(--foreground-secondary))',
          muted: 'hsl(var(--foreground-muted))',
        },
        background: {
          DEFAULT: 'hsl(var(--background))',
          secondary: 'hsl(var(--background-secondary))',
          tertiary: 'hsl(var(--background-tertiary))',
          elevated: 'hsl(var(--background-elevated))',
        },
        brand: {
          DEFAULT: 'hsl(var(--brand-primary))',
          primary: 'hsl(var(--brand-primary))',
          secondary: 'hsl(var(--brand-secondary))',
          accent: 'hsl(var(--brand-accent))',
          light: 'hsl(var(--brand-light))',
          muted: 'hsl(var(--brand-muted))',
          dark: 'hsl(var(--brand-dark))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          light: 'hsl(var(--success-light))',
          dark: 'hsl(var(--success-dark))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          light: 'hsl(var(--warning-light))',
          dark: 'hsl(var(--warning-dark))',
        },
        error: {
          DEFAULT: 'hsl(var(--error))',
          light: 'hsl(var(--error-light))',
          dark: 'hsl(var(--error-dark))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar))',
          hover: 'hsl(var(--sidebar-hover))',
          active: 'hsl(var(--sidebar-active))',
        },
        // Glass Effect
        glass: {
          DEFAULT: 'hsl(var(--glass))',
          light: 'hsl(var(--glass-strong))',
          border: 'hsl(var(--glass-border))',
        },
      },
      fontFamily: {
        display: ['var(--font-plus-jakarta)', 'system-ui', 'sans-serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
      },
      boxShadow: {
        'glow-sm': '0 0 20px rgba(121, 112, 246, 0.3)',
        'glow-md': '0 0 40px rgba(121, 112, 246, 0.4)',
        'glow-lg': '0 0 60px rgba(121, 112, 246, 0.5)',
        'glow-accent': '0 0 40px rgba(249, 168, 69, 0.4)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #7970F6 0%, #9089F7 50%, #B0AAF9 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #5B52D4 0%, #7970F6 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #F9A845 0%, #FCCA7C 50%, #B0AAF9 100%)',
        'gradient-night': 'linear-gradient(135deg, #111827 0%, #1F2937 50%, #374151 100%)',
        'gradient-dark': 'linear-gradient(135deg, #111827 0%, #1F2937 100%)',
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(249, 168, 69, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(249, 168, 69, 0.6)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
