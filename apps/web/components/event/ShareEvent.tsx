'use client';

import { useState } from 'react';
import { Share2, Copy, Check, Facebook, Twitter, Linkedin, Mail, MessageCircle } from 'lucide-react';
import type { Event } from '@eventscv/shared-types';

interface ShareEventProps {
  event: Event;
  className?: string;
}

export function ShareEvent({ event, className = '' }: ShareEventProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const eventUrl = `https://events.cv/events/${event.slug}`;
  const shareTitle = event.title;
  const shareText = `${event.title} - ${event.description?.substring(0, 100)}...`;

  const copyToClipboard = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareOnFacebook = (): void => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const shareOnTwitter = (): void => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(eventUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const shareOnLinkedIn = (): void => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`;
    window.open(url, '_blank', 'width=600,height=600');
    setIsOpen(false);
  };

  const shareViaEmail = (): void => {
    const subject = `Vem ao evento: ${shareTitle}`;
    const body = `Olá!%0D%0A%0D%0AConvido-te para este evento:%0D%0A%0D%0A${shareTitle}%0D%0A${eventUrl}%0D%0A%0D%0AVemo-nos lá!`;
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setIsOpen(false);
  };

  const shareViaWhatsApp = (): void => {
    const text = `${shareText}\n\n${eventUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  const shareViaNativeAPI = async (): Promise<void> => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: eventUrl,
        });
        setIsOpen(false);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => {
          // If native share is available, use it directly
          if (typeof navigator !== 'undefined' && navigator.share !== undefined) {
            shareViaNativeAPI();
          } else {
            setIsOpen(!isOpen);
          }
        }}
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
      >
        <Share2 className="h-4 w-4" />
        Partilhar
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 z-20 mt-2 w-64 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="p-3">
              {/* Copy Link */}
              <button
                onClick={copyToClipboard}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="text-green-600">Link copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5" />
                    <span>Copiar link</span>
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="my-2 border-t border-gray-100" />

              {/* Social Media Options */}
              <div className="space-y-1">
                <button
                  onClick={shareViaWhatsApp}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <MessageCircle className="h-5 w-5 text-green-500" />
                  WhatsApp
                </button>

                <button
                  onClick={shareOnFacebook}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Facebook className="h-5 w-5 text-blue-600" />
                  Facebook
                </button>

                <button
                  onClick={shareOnTwitter}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Twitter className="h-5 w-5 text-sky-500" />
                  Twitter / X
                </button>

                <button
                  onClick={shareOnLinkedIn}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Linkedin className="h-5 w-5 text-blue-700" />
                  LinkedIn
                </button>

                <button
                  onClick={shareViaEmail}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Mail className="h-5 w-5 text-gray-500" />
                  Email
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
