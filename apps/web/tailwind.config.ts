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
        // Background Layers
        background: {
          DEFAULT: 'hsl(var(--background))',
          secondary: 'hsl(var(--background-secondary))',
          tertiary: 'hsl(var(--background-tertiary))',
          elevated: 'hsl(var(--background-elevated))',
        },
        // Brand Colors - EventsCV Mobile Palette
        brand: {
          DEFAULT: 'hsl(var(--brand-primary))',
          primary: 'hsl(var(--brand-primary))',
          secondary: 'hsl(var(--brand-secondary))',
          accent: 'hsl(var(--brand-accent))',
          light: 'hsl(var(--brand-light))',
          muted: 'hsl(var(--brand-muted))',
          dark: 'hsl(var(--brand-dark))',
        },
        // Semantic Colors
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
        border: {
          DEFAULT: 'hsl(var(--border-color))',
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
      fontSize: {
        'display-2xl': ['4.5rem', { lineHeight: '1.1', fontWeight: '700' }],
        'display-xl': ['3.75rem', { lineHeight: '1.1', fontWeight: '700' }],
        'display-lg': ['3rem', { lineHeight: '1.1', fontWeight: '700' }],
        'heading-xl': ['2.25rem', { lineHeight: '1.2', fontWeight: '600' }],
        'heading-lg': ['1.875rem', { lineHeight: '1.25', fontWeight: '600' }],
        'heading-md': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'heading-sm': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
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
        // Gradients - Updated with mobile primary color #7970F6
        'gradient-primary': 'linear-gradient(135deg, #7970F6 0%, #9089F7 50%, #B0AAF9 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #5B52D4 0%, #7970F6 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #F9A845 0%, #FCCA7C 50%, #B0AAF9 100%)',
        'gradient-night': 'linear-gradient(135deg, #111827 0%, #1F2937 50%, #374151 100%)',
        'gradient-dark': 'linear-gradient(135deg, #111827 0%, #1F2937 100%)',
        // Mesh Gradients - Updated with mobile primary color
        'mesh-gradient': `
          radial-gradient(at 40% 20%, rgba(121, 112, 246, 0.3) 0px, transparent 50%),
          radial-gradient(at 80% 0%, rgba(144, 137, 247, 0.3) 0px, transparent 50%),
          radial-gradient(at 0% 50%, rgba(249, 168, 69, 0.2) 0px, transparent 50%),
          radial-gradient(at 80% 80%, rgba(176, 170, 249, 0.2) 0px, transparent 50%)
        `,
        'mesh-gradient-subtle': `
          radial-gradient(at 40% 20%, rgba(121, 112, 246, 0.15) 0px, transparent 50%),
          radial-gradient(at 80% 0%, rgba(144, 137, 247, 0.15) 0px, transparent 50%),
          radial-gradient(at 0% 50%, rgba(249, 168, 69, 0.1) 0px, transparent 50%)
        `,
        // Radial
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        // Gradient Animations
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'gradient-xy': 'gradient-xy 15s ease infinite',
        // Float & Movement
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        // Glow Effects
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        // Entry Animations
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-in-up': 'fade-in-up 0.5s ease-out',
        'fade-in-down': 'fade-in-down 0.5s ease-out',
        'slide-in-right': 'slide-in-right 0.5s ease-out',
        'slide-in-left': 'slide-in-left 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        // Micro-interactions
        'bounce-subtle': 'bounce-subtle 0.4s ease-out',
        'wiggle': 'wiggle 0.3s ease-in-out',
        'heartbeat': 'heartbeat 0.4s ease-in-out',
        // Loading
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'gradient-xy': {
          '0%, 100%': { backgroundPosition: '0% 0%' },
          '25%': { backgroundPosition: '100% 0%' },
          '50%': { backgroundPosition: '100% 100%' },
          '75%': { backgroundPosition: '0% 100%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(249, 168, 69, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(249, 168, 69, 0.6)' },
        },
        'glow': {
          '0%': { boxShadow: '0 0 20px rgba(121, 112, 246, 0.4)' },
          '100%': { boxShadow: '0 0 30px rgba(144, 137, 247, 0.6)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'bounce-subtle': {
          '0%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.1)' },
          '50%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        'heartbeat': {
          '0%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.3)' },
          '50%': { transform: 'scale(1)' },
          '75%': { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
