'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2, Sparkles } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, functions } from '../../lib/firebase';
import { httpsCallable } from 'firebase/functions';
import type { ChatResponse, AIAction } from '@eventscv/shared-types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actions?: AIAction[];
  timestamp: Date;
}

interface LyraWidgetProps {
  eventId?: string;
  language?: 'pt' | 'en' | 'cv';
}

export function LyraWidget({ eventId, language = 'pt' }: LyraWidgetProps) {
  const [user, loadingAuth] = useAuthState(auth);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Load welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessages = {
        pt: user
          ? 'Olá! 👋 Sou a Lyra, a tua assistente virtual. Como posso ajudar-te hoje?'
          : 'Olá! 👋 Sou a Lyra, a assistente virtual do Events.cv. Posso ajudar-te a descobrir eventos, responder perguntas sobre a plataforma e muito mais. Como posso ajudar?',
        en: user
          ? 'Hello! 👋 I\'m Lyra, your virtual assistant. How can I help you today?'
          : 'Hello! 👋 I\'m Lyra, Events.cv\'s virtual assistant. I can help you discover events, answer questions about the platform, and more. How can I help?',
        cv: user
          ? 'Olá! 👋 N e Lyra, bu assistente virtual. Mod ki N pode djudá-bu oji?'
          : 'Olá! 👋 N e Lyra, assistente virtual di Events.cv. N pode djudá-bu diskobri eventos, spondê pergunta sobri plataforma, i más. Mod ki N pode djudá?',
      };

      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: welcomeMessages[language],
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, user, language, messages.length]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatFn = httpsCallable<
        { message: string; userId: string; eventId?: string; language: string },
        ChatResponse
      >(functions, 'lyraChat');

      const result = await chatFn({
        message: userMessage.content,
        userId: user?.uid || 'anonymous',
        eventId,
        language,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.data.message,
        actions: result.data.actions,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessages = {
        pt: 'Desculpa, tive um problema. Podes tentar novamente?',
        en: 'Sorry, I had an issue. Can you try again?',
        cv: 'Diskulpa, N ten un problema. Bu pode tenta más?',
      };

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorMessages[language],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (action: AIAction) => {
    switch (action.action) {
      case 'buy_tickets':
        if (action.data?.eventId) {
          window.location.href = `/checkout?event=${action.data.eventId}`;
        }
        break;
      case 'show_map':
        if (action.data?.eventId) {
          // Scroll to map section
          const mapSection = document.getElementById('event-map');
          if (mapSection) {
            mapSection.scrollIntoView({ behavior: 'smooth' });
            setIsOpen(false);
          }
        }
        break;
      case 'share':
        if (action.data?.eventId) {
          // Trigger share button
          const shareButton = document.querySelector('[data-share-button]');
          if (shareButton instanceof HTMLElement) {
            shareButton.click();
            setIsOpen(false);
          }
        }
        break;
      case 'add_to_calendar':
        if (action.data?.eventId) {
          // Trigger add to calendar button
          const calendarButton = document.querySelector('[data-calendar-button]');
          if (calendarButton instanceof HTMLElement) {
            calendarButton.click();
            setIsOpen(false);
          }
        }
        break;
      case 'view_tickets':
        window.location.href = '/tickets';
        break;
      case 'contact_support':
        window.location.href = 'mailto:support@events.cv';
        break;
      case 'browse_events':
        window.location.href = '/events';
        break;
      case 'view_event':
        if (action.data?.eventId) {
          window.location.href = `/events/${action.data.eventId}`;
        }
        break;
      case 'create_account':
        window.location.href = '/auth/register';
        break;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 group p-1"
          aria-label="Chat with Lyra"
        >
          <img
            src="/images/lyra-avatar.jpg"
            alt="Lyra"
            className="w-full h-full rounded-full object-cover ring-2 ring-white/30"
          />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-brand-accent"></span>
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-md h-[600px] max-h-[80vh] flex flex-col bg-zinc-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-brand-primary to-brand-secondary">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src="/images/lyra-avatar.jpg"
                  alt="Lyra"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-white/30"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
              </div>
              <div>
                <h3 className="font-semibold text-white">Lyra</h3>
                <p className="text-xs text-white/80">Assistente Virtual</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-brand-primary text-white'
                      : 'bg-zinc-800 text-zinc-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                  {/* Action Buttons */}
                  {message.actions && message.actions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.actions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => handleAction(action)}
                          className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-xs rounded-lg transition-colors"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <p className="text-xs opacity-60 mt-2">
                    {message.timestamp.toLocaleTimeString('pt-PT', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 rounded-2xl px-4 py-3">
                  <Loader2 className="w-5 h-5 text-brand-primary animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  language === 'pt'
                    ? 'Escreve a tua mensagem...'
                    : language === 'en'
                    ? 'Type your message...'
                    : 'Skreve bu mensagen...'
                }
                className="flex-1 bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-brand-primary transition-colors"
                maxLength={500}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-3 bg-brand-primary hover:bg-brand-primary/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
                aria-label="Send message"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
            <p className="text-xs text-zinc-500 mt-2 text-center">
              {language === 'pt'
                ? 'Powered by OpenAI GPT-4'
                : language === 'en'
                ? 'Powered by OpenAI GPT-4'
                : 'Powered by OpenAI GPT-4'}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
