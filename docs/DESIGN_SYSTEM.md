# EventsCV Design System

## Análise Competitiva & Inspiração

### Plataformas Analisadas

| Plataforma | Pontos Fortes | O que Melhorar |
|------------|---------------|----------------|
| **DICE** | Mobile-first, design limpo, descoberta personalizada, sem taxas escondidas | Apenas mobile, processo de signup com fricção |
| **Fever** | Experiências imersivas, UI elegante, gamificação | Foco demasiado em experiências "instagramáveis" |
| **Resident Advisor** | Comunidade forte, credibilidade underground | UI datada, UX complexa |
| **Eventbrite** | Funcionalidades completas, marketing integrado | Design corporativo, pouco emocional |
| **Shotgun** | Comunidade, ferramentas de ambassador | Visual menos refinado |
| **Spotify** | Dark mode perfeito, gradientes, microinterações | - |
| **Apple Music** | Glassmorphism, tipografia bold, animações fluidas | - |

### Diferenciação EventsCV

```
┌─────────────────────────────────────────────────────────────────┐
│                    EVENTSCV DESIGN PHILOSOPHY                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🌊 CABO VERDE VIBES                                            │
│     Cores inspiradas no oceano, pôr-do-sol, música e alegria    │
│                                                                 │
│  🌙 DARK MODE FIRST                                             │
│     Como Spotify - conteúdo em destaque, UI em segundo plano    │
│                                                                 │
│  ✨ GLASSMORPHISM + GRADIENTS                                   │
│     Elegância moderna com profundidade visual                   │
│                                                                 │
│  🎭 EMOTION-DRIVEN                                              │
│     Cada evento conta uma história visual                       │
│                                                                 │
│  ⚡ MICRO-INTERACTIONS                                          │
│     Feedback tátil, animações que encantam                      │
│                                                                 │
│  📱 MOBILE-FIRST, WEB-EXCELLENT                                 │
│     Experiência premium em todos os dispositivos                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Sistema de Cores

### Paleta Principal (Dark Mode)

```css
/* Background Layers */
--bg-primary: #0A0A0F;        /* Fundo principal - quase preto com tom azul */
--bg-secondary: #12121A;       /* Cards, elevações */
--bg-tertiary: #1A1A24;        /* Inputs, elementos interativos */
--bg-elevated: #222230;        /* Modals, dropdowns */

/* Brand Colors - Inspirado em Cabo Verde */
--brand-primary: #6366F1;      /* Indigo vibrante - noite de festa */
--brand-secondary: #8B5CF6;    /* Violet - energia */
--brand-accent: #06B6D4;       /* Cyan - oceano */

/* Gradient Magic */
--gradient-primary: linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%);
--gradient-ocean: linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%);
--gradient-sunset: linear-gradient(135deg, #F59E0B 0%, #EF4444 50%, #EC4899 100%);
--gradient-night: linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4C1D95 100%);
--gradient-mesh: radial-gradient(at 40% 20%, #6366F1 0px, transparent 50%),
                 radial-gradient(at 80% 0%, #8B5CF6 0px, transparent 50%),
                 radial-gradient(at 0% 50%, #06B6D4 0px, transparent 50%);

/* Text */
--text-primary: #FFFFFF;
--text-secondary: #A1A1AA;     /* zinc-400 */
--text-tertiary: #71717A;      /* zinc-500 */
--text-muted: #52525B;         /* zinc-600 */

/* Status Colors */
--success: #10B981;            /* Emerald */
--warning: #F59E0B;            /* Amber */
--error: #EF4444;              /* Red */
--info: #3B82F6;               /* Blue */

/* Glassmorphism */
--glass-bg: rgba(255, 255, 255, 0.05);
--glass-border: rgba(255, 255, 255, 0.1);
--glass-blur: 20px;
```

### Paleta Light Mode (Opcional)

```css
--bg-primary: #FAFAFA;
--bg-secondary: #FFFFFF;
--text-primary: #18181B;
--text-secondary: #52525B;
```

---

## Tipografia

### Font Stack

```css
/* Display - Títulos impactantes */
--font-display: 'Plus Jakarta Sans', 'SF Pro Display', system-ui, sans-serif;

/* Body - Leitura confortável */
--font-body: 'Inter', 'SF Pro Text', system-ui, sans-serif;

/* Mono - Códigos, preços */
--font-mono: 'JetBrains Mono', 'SF Mono', monospace;
```

### Escala Tipográfica

```css
/* Display */
--text-display-2xl: 4.5rem;    /* 72px - Hero headlines */
--text-display-xl: 3.75rem;    /* 60px - Section headers */
--text-display-lg: 3rem;       /* 48px - Page titles */

/* Headings */
--text-heading-xl: 2.25rem;    /* 36px */
--text-heading-lg: 1.875rem;   /* 30px */
--text-heading-md: 1.5rem;     /* 24px */
--text-heading-sm: 1.25rem;    /* 20px */

/* Body */
--text-body-lg: 1.125rem;      /* 18px */
--text-body-md: 1rem;          /* 16px */
--text-body-sm: 0.875rem;      /* 14px */
--text-body-xs: 0.75rem;       /* 12px */

/* Line Heights */
--leading-tight: 1.1;
--leading-snug: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

---

## Espaçamento & Grid

### Spacing Scale

```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

### Border Radius

```css
--radius-sm: 0.5rem;      /* 8px - Badges, tags */
--radius-md: 0.75rem;     /* 12px - Buttons, inputs */
--radius-lg: 1rem;        /* 16px - Cards */
--radius-xl: 1.5rem;      /* 24px - Large cards */
--radius-2xl: 2rem;       /* 32px - Modals */
--radius-full: 9999px;    /* Pills, avatars */
```

---

## Componentes

### 1. Glassmorphic Card

```css
.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1.5rem;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.2),
    0 2px 4px -2px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.12);
  transform: translateY(-2px);
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.3),
    0 8px 10px -6px rgba(0, 0, 0, 0.2);
}
```

### 2. Gradient Button

```css
.btn-gradient {
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
  color: white;
  font-weight: 600;
  padding: 0.875rem 1.75rem;
  border-radius: 0.75rem;
  border: none;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.btn-gradient::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #818CF8 0%, #A78BFA 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.btn-gradient:hover::before {
  opacity: 1;
}

.btn-gradient:active {
  transform: scale(0.98);
}

/* Glow effect */
.btn-gradient::after {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
  border-radius: inherit;
  z-index: -1;
  opacity: 0;
  filter: blur(12px);
  transition: opacity 0.3s ease;
}

.btn-gradient:hover::after {
  opacity: 0.6;
}
```

### 3. Event Card (Signature Component)

```
┌─────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │                    [EVENT IMAGE]                        │   │
│  │                    Full bleed                           │   │
│  │                    Aspect ratio 16:10                   │   │
│  │                                                         │   │
│  │  ┌─────────┐                              ┌─────────┐  │   │
│  │  │ 🔥 HOT  │                              │  ❤️ 234  │  │   │
│  │  └─────────┘                              └─────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─ Glassmorphic overlay at bottom ──────────────────────────┐ │
│  │                                                           │ │
│  │  SAB, 15 DEZ                                             │ │
│  │  Festival Baía das Gatas 2024                            │ │
│  │                                                           │ │
│  │  📍 Mindelo, São Vicente                                 │ │
│  │                                                           │ │
│  │  ┌──────────────────┐  ┌─────────────────────────────┐   │ │
│  │  │  A partir de     │  │     COMPRAR BILHETES        │   │ │
│  │  │  2.500$00        │  │     [Gradient Button]       │   │ │
│  │  └──────────────────┘  └─────────────────────────────┘   │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Ticket Card (3D Effect)

```css
.ticket-card {
  background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
  border-radius: 1.5rem;
  padding: 1.5rem;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.5s ease;
}

.ticket-card:hover {
  transform: perspective(1000px) rotateY(-5deg) rotateX(5deg);
}

/* Notch effect */
.ticket-card::before,
.ticket-card::after {
  content: '';
  position: absolute;
  width: 24px;
  height: 24px;
  background: var(--bg-primary);
  border-radius: 50%;
  top: 50%;
  transform: translateY(-50%);
}

.ticket-card::before { left: -12px; }
.ticket-card::after { right: -12px; }

/* Dashed line */
.ticket-divider {
  border-left: 2px dashed rgba(255, 255, 255, 0.2);
  height: 100%;
  position: absolute;
  right: 30%;
  top: 0;
}
```

### 5. Wallet Balance Card

```css
.wallet-card {
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%);
  border-radius: 1.5rem;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

/* Animated mesh background */
.wallet-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 50%);
  animation: mesh-float 10s ease-in-out infinite;
}

@keyframes mesh-float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-10px, 10px); }
}

.wallet-balance {
  font-family: var(--font-display);
  font-size: 3rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
}
```

---

## Animações & Microinterações

### Easing Functions

```css
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
```

### Page Transitions

```css
@keyframes page-enter {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-content {
  animation: page-enter 0.5s var(--ease-smooth) forwards;
}
```

### Skeleton Loading

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-secondary) 0%,
    var(--bg-tertiary) 50%,
    var(--bg-secondary) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  border-radius: var(--radius-md);
}

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Button Feedback

```css
.btn-haptic:active {
  transform: scale(0.97);
  transition: transform 0.1s ease;
}

/* Success state */
.btn-success {
  animation: btn-pulse 0.3s ease;
}

@keyframes btn-pulse {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  100% { box-shadow: 0 0 0 20px rgba(16, 185, 129, 0); }
}
```

### Heart Like Animation

```css
.heart-btn.liked .heart-icon {
  animation: heart-pop 0.4s var(--ease-bounce);
}

@keyframes heart-pop {
  0% { transform: scale(1); }
  25% { transform: scale(1.3); }
  50% { transform: scale(0.9); }
  100% { transform: scale(1); }
}

/* Particle burst */
.heart-btn.liked::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, #EF4444 0%, transparent 70%);
  animation: particle-burst 0.5s ease-out forwards;
}

@keyframes particle-burst {
  0% { transform: scale(0); opacity: 1; }
  100% { transform: scale(2); opacity: 0; }
}
```

---

## Layout Patterns

### Hero Section (Homepage)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ┌─── Animated Gradient Mesh Background ──────────────────────────────┐│
│  │                                                                     ││
│  │     ██████╗ ██╗   ██╗███████╗███╗   ██╗████████╗███████╗           ││
│  │     ██╔══██╗██║   ██║██╔════╝████╗  ██║╚══██╔══╝██╔════╝           ││
│  │     █████╗  ██║   ██║█████╗  ██╔██╗ ██║   ██║   ███████╗           ││
│  │     ██╔══╝  ╚██╗ ██╔╝██╔══╝  ██║╚██╗██║   ██║   ╚════██║           ││
│  │     ███████╗ ╚████╔╝ ███████╗██║ ╚████║   ██║   ███████║           ││
│  │     ╚══════╝  ╚═══╝  ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝           ││
│  │                                                                     ││
│  │            Descobre os melhores eventos                             ││
│  │                  em Cabo Verde                                      ││
│  │                                                                     ││
│  │    ┌─────────────────────────────────────────────────────────┐     ││
│  │    │  🔍  Pesquisar eventos, artistas, locais...             │     ││
│  │    └─────────────────────────────────────────────────────────┘     ││
│  │                                                                     ││
│  │    [🎵 Música]  [🎭 Cultura]  [⚽ Desporto]  [🍽️ Food]              ││
│  │                                                                     ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  ┌─── Featured Events (Horizontal Scroll) ────────────────────────────┐│
│  │                                                                     ││
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           ││
│  │  │          │  │          │  │          │  │          │  ←→       ││
│  │  │  Event   │  │  Event   │  │  Event   │  │  Event   │           ││
│  │  │   Card   │  │   Card   │  │   Card   │  │   Card   │           ││
│  │  │          │  │          │  │          │  │          │           ││
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘           ││
│  │                                                                     ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Mobile Navigation (Bottom Tab Bar)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                      [App Content]                          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─── Glassmorphic Tab Bar ───────────────────────────────┐│
│  │                                                         ││
│  │    🏠        🔍        🎫        👤                     ││
│  │   Home    Discover   Tickets   Profile                  ││
│  │    ●                                                    ││
│  │                                                         ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘

/* Active indicator: Gradient pill behind active icon */
```

---

## Iconografia

### Estilo de Ícones
- **Biblioteca:** Lucide Icons (consistente, customizável)
- **Stroke:** 1.5px para ícones de navegação
- **Tamanhos:** 16px (inline), 20px (UI), 24px (nav), 32px+ (features)
- **Ícones customizados:** Ticket, Wallet, NFC com gradiente

### Ícones de Categorias (Customizados)

```
🎵 Música      → Waveform + gradiente
🎭 Cultura     → Máscara estilizada
⚽ Desporto    → Bola com motion blur
🍽️ Food       → Garfo/faca minimalista
🎉 Festas     → Confetti animado
📚 Workshops  → Livro com spark
```

---

## Responsividade

### Breakpoints

```css
--screen-sm: 640px;    /* Mobile landscape */
--screen-md: 768px;    /* Tablet */
--screen-lg: 1024px;   /* Desktop */
--screen-xl: 1280px;   /* Large desktop */
--screen-2xl: 1536px;  /* Wide screens */
```

### Container Widths

```css
.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) { .container { max-width: 640px; padding: 0 1.5rem; } }
@media (min-width: 768px) { .container { max-width: 768px; } }
@media (min-width: 1024px) { .container { max-width: 1024px; padding: 0 2rem; } }
@media (min-width: 1280px) { .container { max-width: 1280px; } }
```

---

## Acessibilidade

### Requisitos

- **Contraste:** Mínimo 4.5:1 para texto, 3:1 para elementos gráficos
- **Focus States:** Visible focus ring em todos os elementos interativos
- **Motion:** Respeitar `prefers-reduced-motion`
- **Screen Readers:** Labels descritivas, ARIA attributes

### Focus States

```css
.focusable:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
  border-radius: var(--radius-md);
}

/* Para elementos escuros */
.dark .focusable:focus-visible {
  outline-color: var(--brand-accent);
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Tokens de Design (Tailwind Config)

```javascript
// tailwind.config.ts
const config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0A0A0F',
          secondary: '#12121A',
          tertiary: '#1A1A24',
          elevated: '#222230',
        },
        brand: {
          primary: '#6366F1',
          secondary: '#8B5CF6',
          accent: '#06B6D4',
        },
        // ... resto das cores
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'gradient-shift': 'gradient 8s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(99, 102, 241, 0.6)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': `
          radial-gradient(at 40% 20%, rgba(99, 102, 241, 0.3) 0px, transparent 50%),
          radial-gradient(at 80% 0%, rgba(139, 92, 246, 0.3) 0px, transparent 50%),
          radial-gradient(at 0% 50%, rgba(6, 182, 212, 0.2) 0px, transparent 50%)
        `,
      },
    },
  },
};
```

---

*EventsCV Design System v1.0*
*Criado para uma experiência moderna, disruptiva e única em Cabo Verde*
