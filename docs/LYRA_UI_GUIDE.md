# 💬 Lyra Chat Widget - Guia de Implementação UI

## 🎨 Design Overview

A Lyra é a assistente virtual do Events.cv - simpática, profissional e genuinamente cabo-verdiana. O chat widget deve refletir esta personalidade através de um design acolhedor mas moderno.

### Avatar da Lyra
- **Localização:** `/apps/web/public/images/lyra-avatar.jpg`
- **Descrição:** Profissional cabo-verdiana, sorriso amigável, cabelo encaracolado, blazer verde
- **Uso:** Widget de chat, mensagens, página sobre

---

## 📐 Layout do Widget

### Posição: Canto inferior direito (Fixed)
```
┌─────────────────────────────────┐
│                                 │
│                                 │
│                                 │
│                            ┌────┤
│                            │ 💬 │ ← Chat Button (closed)
│                            └────┤
└─────────────────────────────────┘
```

### Estado Expandido:
```
┌─────────────────────────────────┐
│                      ┌──────────┤
│                      │ Header   │
│                      ├──────────┤
│                      │          │
│                      │ Messages │
│                      │          │
│                      ├──────────┤
│                      │ Input    │
│                      └──────────┤
└─────────────────────────────────┘
```

---

## 🎯 Componentes React

### 1. LyraButton (Floating Button)

```tsx
// components/chat/LyraButton.tsx
'use client';

import { MessageCircle, X } from 'lucide-react';
import { useState } from 'react';

interface LyraButtonProps {
  onClick: () => void;
  isOpen: boolean;
  unreadCount?: number;
}

export function LyraButton({ onClick, isOpen, unreadCount = 0 }: LyraButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-300"
      aria-label={isOpen ? 'Fechar chat' : 'Abrir chat com Lyra'}
    >
      {isOpen ? (
        <X className="h-6 w-6" />
      ) : (
        <>
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </>
      )}
    </button>
  );
}
```

### 2. LyraWidget (Main Container)

```tsx
// components/chat/LyraWidget.tsx
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { LyraButton } from './LyraButton';
import { LyraChat } from './LyraChat';
import { useState } from 'react';

export function LyraWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0); // Clear unread when opening
    }
  };

  return (
    <>
      <LyraButton onClick={handleToggle} isOpen={isOpen} unreadCount={unreadCount} />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-40 h-[600px] w-[400px] overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <LyraChat onClose={() => setIsOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

### 3. LyraChat (Chat Interface)

```tsx
// components/chat/LyraChat.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useLyraChat } from '@/hooks/useLyraChat';
import { LyraMessage } from './LyraMessage';
import { LyraSuggestions } from './LyraSuggestions';

interface LyraChatProps {
  onClose: () => void;
  eventId?: string;
}

export function LyraChat({ onClose, eventId }: LyraChatProps) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, isLoading, suggestions } = useLyraChat(eventId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    await sendMessage(message);
    setMessage('');
  };

  const handleSuggestionClick = async (suggestion: string) => {
    await sendMessage(suggestion);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Image
              src="/images/lyra-avatar.jpg"
              alt="Lyra"
              width={40}
              height={40}
              className="rounded-full ring-2 ring-white/50"
            />
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
          </div>
          <div>
            <h3 className="font-semibold">Lyra</h3>
            <p className="text-xs text-purple-100">Assistente Virtual</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-1 hover:bg-white/20 transition-colors"
          aria-label="Fechar chat"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Sparkles className="h-12 w-12 text-purple-500 mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Olá! Sou a Lyra 👋
            </h4>
            <p className="text-sm text-gray-600 max-w-[280px]">
              Estou aqui para ajudar a descobrir eventos fixes, comprar bilhetes e muito mais!
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <LyraMessage key={msg.id} message={msg} />
        ))}

        {isLoading && (
          <div className="flex gap-2 items-center text-gray-500">
            <div className="flex gap-1">
              <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm">Lyra está a escrever...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <LyraSuggestions
          suggestions={suggestions}
          onSuggestionClick={handleSuggestionClick}
          disabled={isLoading}
        />
      )}

      {/* Input */}
      <div className="border-t bg-white p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escreve a tua mensagem..."
            className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            aria-label="Enviar mensagem"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
```

### 4. LyraMessage (Message Bubble)

```tsx
// components/chat/LyraMessage.tsx
'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { LyraActionButtons } from './LyraActionButtons';
import type { ChatMessage } from '@eventscv/shared-types';

interface LyraMessageProps {
  message: ChatMessage & {
    actions?: Array<{
      label: string;
      action: string;
      data?: any;
    }>;
  };
}

export function LyraMessage({ message }: LyraMessageProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {!isUser && (
        <Image
          src="/images/lyra-avatar.jpg"
          alt="Lyra"
          width={32}
          height={32}
          className="h-8 w-8 rounded-full flex-shrink-0"
        />
      )}

      <div className={`flex flex-col gap-1 max-w-[75%]`}>
        <div
          className={`rounded-2xl px-4 py-2 ${
            isUser
              ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-br-sm'
              : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Action Buttons */}
        {!isUser && message.actions && message.actions.length > 0 && (
          <LyraActionButtons actions={message.actions} />
        )}

        {/* Timestamp */}
        <span className={`text-xs text-gray-500 px-2 ${isUser ? 'text-right' : 'text-left'}`}>
          {new Date(message.createdAt).toLocaleTimeString('pt-PT', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </motion.div>
  );
}
```

### 5. LyraActionButtons (Suggested Actions)

```tsx
// components/chat/LyraActionButtons.tsx
'use client';

import {
  ShoppingCart,
  Map,
  Share2,
  Calendar,
  Search,
  HelpCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const actionIcons = {
  buy_tickets: ShoppingCart,
  show_map: Map,
  share: Share2,
  add_to_calendar: Calendar,
  browse_events: Search,
  contact_support: HelpCircle,
};

interface LyraActionButtonsProps {
  actions: Array<{
    label: string;
    action: string;
    data?: any;
  }>;
}

export function LyraActionButtons({ actions }: LyraActionButtonsProps) {
  const router = useRouter();

  const handleAction = (action: string, data?: any) => {
    switch (action) {
      case 'buy_tickets':
        if (data?.eventId) {
          router.push(`/events/${data.eventId}#tickets`);
        }
        break;
      case 'show_map':
        if (data?.eventId) {
          router.push(`/events/${data.eventId}#map`);
        }
        break;
      case 'share':
        if (data?.eventId && navigator.share) {
          navigator.share({
            title: 'Evento no Events.cv',
            url: `${window.location.origin}/events/${data.eventId}`,
          });
        }
        break;
      case 'add_to_calendar':
        if (data?.eventId) {
          // Trigger calendar download
          window.open(`/api/events/${data.eventId}/calendar.ics`);
        }
        break;
      case 'browse_events':
        router.push('/events');
        break;
      case 'contact_support':
        router.push('/support');
        break;
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {actions.map((action, index) => {
        const Icon = actionIcons[action.action as keyof typeof actionIcons];
        return (
          <button
            key={index}
            onClick={() => handleAction(action.action, action.data)}
            className="flex items-center gap-2 rounded-full border border-purple-300 bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700 transition-colors hover:bg-purple-100 hover:border-purple-400"
          >
            {Icon && <Icon className="h-3 w-3" />}
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
```

### 6. LyraSuggestions (Quick Replies)

```tsx
// components/chat/LyraSuggestions.tsx
'use client';

interface LyraSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  disabled?: boolean;
}

export function LyraSuggestions({
  suggestions,
  onSuggestionClick,
  disabled = false,
}: LyraSuggestionsProps) {
  return (
    <div className="border-t bg-gray-50 p-3">
      <p className="text-xs text-gray-600 mb-2 font-medium">Sugestões:</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            disabled={disabled}
            className="rounded-full bg-white border border-gray-300 px-3 py-1.5 text-xs text-gray-700 transition-colors hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## 🔗 Custom Hook: useLyraChat

```tsx
// hooks/useLyraChat.ts
'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import type { ChatMessage, ChatResponse } from '@eventscv/shared-types';

export function useLyraChat(eventId?: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    'Que eventos há hoje?',
    'Eventos em Praia',
    'Música ao vivo',
  ]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!user) {
        console.error('User not authenticated');
        return;
      }

      // Add user message immediately
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        userId: user.uid,
        eventId,
        role: 'user',
        content,
        language: 'pt',
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        // Call Lyra Cloud Function
        const lyraChat = httpsCallable<
          {
            message: string;
            userId: string;
            eventId?: string;
            language?: string;
          },
          ChatResponse
        >(functions, 'lyraChat');

        const response = await lyraChat({
          message: content,
          userId: user.uid,
          eventId,
          language: 'pt',
        });

        // Add Lyra's response
        const lyraMessage: ChatMessage & { actions?: any[] } = {
          id: (Date.now() + 1).toString(),
          userId: user.uid,
          eventId,
          role: 'assistant',
          content: response.data.message,
          language: response.data.language,
          createdAt: new Date(),
          actions: response.data.actions,
        };

        setMessages((prev) => [...prev, lyraMessage]);

        // Update suggestions if provided
        if (response.data.actions && response.data.actions.length > 0) {
          // Could extract new suggestions from the response
        }
      } catch (error) {
        console.error('Error sending message to Lyra:', error);

        // Add error message
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          userId: user.uid,
          eventId,
          role: 'assistant',
          content:
            'Desculpa, tive um problema técnico. Podes tentar novamente? 🙏',
          language: 'pt',
          createdAt: new Date(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [user, eventId]
  );

  return {
    messages,
    sendMessage,
    isLoading,
    suggestions,
  };
}
```

---

## 🎨 Tailwind Configuration

Adicionar cores personalizadas em `tailwind.config.ts`:

```ts
export default {
  theme: {
    extend: {
      colors: {
        lyra: {
          purple: {
            50: '#faf5ff',
            100: '#f3e8ff',
            200: '#e9d5ff',
            300: '#d8b4fe',
            400: '#c084fc',
            500: '#a855f7',
            600: '#9333ea', // Primary
            700: '#7e22ce',
            800: '#6b21a8',
            900: '#581c87',
          },
          blue: {
            500: '#3b82f6',
            600: '#2563eb', // Secondary
            700: '#1d4ed8',
          },
        },
      },
      keyframes: {
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
      },
    },
  },
};
```

---

## 📱 Responsive Design

### Mobile (<640px):
```tsx
// Full screen modal instead of widget
<motion.div
  className="fixed inset-0 z-50 bg-white md:bottom-24 md:right-6 md:h-[600px] md:w-[400px] md:rounded-2xl"
>
  <LyraChat onClose={onClose} />
</motion.div>
```

---

## 🌍 Multi-Language Support

```tsx
// utils/lyraLanguage.ts
export const LYRA_MESSAGES = {
  pt: {
    greeting: 'Olá! Sou a Lyra 👋',
    placeholder: 'Escreve a tua mensagem...',
    typing: 'Lyra está a escrever...',
  },
  en: {
    greeting: 'Hello! I\'m Lyra 👋',
    placeholder: 'Type your message...',
    typing: 'Lyra is typing...',
  },
  cv: {
    greeting: 'Oi! N é Lyra 👋',
    placeholder: 'Skrebe bu mensaji...',
    typing: 'Lyra ta skrebe...',
  },
};
```

---

## 🚀 Usage

### In Layout (Global)

```tsx
// app/layout.tsx
import { LyraWidget } from '@/components/chat/LyraWidget';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <LyraWidget />
      </body>
    </html>
  );
}
```

### In Event Page (Context-Aware)

```tsx
// app/events/[id]/page.tsx
import { LyraWidget } from '@/components/chat/LyraWidget';

export default function EventPage({ params }) {
  return (
    <div>
      {/* Event content */}
      <LyraWidget eventId={params.id} />
    </div>
  );
}
```

---

## ✨ Animations & Effects

### Typing Indicator
```tsx
<div className="flex gap-1">
  {[0, 150, 300].map((delay, i) => (
    <motion.span
      key={i}
      className="h-2 w-2 rounded-full bg-gray-400"
      animate={{ y: [0, -8, 0] }}
      transition={{
        duration: 0.6,
        repeat: Infinity,
        delay: delay / 1000,
      }}
    />
  ))}
</div>
```

### Message Slide In
```tsx
<motion.div
  initial={{ opacity: 0, x: isUser ? 20 : -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.3 }}
>
  {/* Message content */}
</motion.div>
```

---

## 🎯 Performance Tips

1. **Lazy Load Widget:**
```tsx
const LyraWidget = dynamic(() => import('@/components/chat/LyraWidget'), {
  ssr: false,
});
```

2. **Virtualize Long Conversations:**
```tsx
import { useVirtualizer } from '@tanstack/react-virtual';
```

3. **Debounce Typing Indicator:**
```tsx
const [isTyping, setIsTyping] = useState(false);
const debouncedTyping = useDebouncedValue(isTyping, 300);
```

---

## 📊 Analytics Events

```tsx
// Track chat interactions
analytics.track('lyra_chat_opened');
analytics.track('lyra_message_sent', { eventId, message });
analytics.track('lyra_action_clicked', { action, eventId });
```

---

## 🎨 Design Assets

- **Avatar:** `/apps/web/public/images/lyra-avatar.jpg`
- **Colors:** Purple gradient (#9333ea to #2563eb)
- **Font:** Default Next.js font (Geist)
- **Icons:** Lucide React

---

**Status:** 🎨 UI Design Ready for Implementation
**Next:** Implementar componentes + Testar integração com Cloud Function
