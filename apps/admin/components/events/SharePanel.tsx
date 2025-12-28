'use client';

import Modal from '../ui/Modal';
import { QRCodeDisplay } from './QRCodeDisplay';
import { Mail, MessageCircle, Facebook, Instagram, Share2 } from 'lucide-react';
import { type Event } from '../../lib/services/events';

interface SharePanelProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
}

export function SharePanel({ isOpen, onClose, event }: SharePanelProps) {
  const eventUrl = `https://eventscv.cv/events/${event.slug}?src=qr`;

  const shareViaWhatsApp = () => {
    const text = `🎉 Confira este evento: ${event.title}\n\n📅 ${new Date(event.startDate).toLocaleDateString('pt-CV')}\n📍 ${event.venue}, ${event.city}\n\n👉 Registre-se em: ${eventUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = `Convite: ${event.title}`;
    const body = `Olá!

Venha participar de ${event.title}!

📅 Data: ${new Date(event.startDate).toLocaleDateString('pt-CV', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
⏰ Hora: ${new Date(event.startDate).toLocaleTimeString('pt-CV', { hour: '2-digit', minute: '2-digit' })}
📍 Local: ${event.venue}, ${event.city}

${event.description}

👉 Registre-se em: ${eventUrl}

Nos vemos lá!`;

    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  const shareViaFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`, '_blank');
  };

  const shareViaNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Confira este evento: ${event.title}`,
          url: eventUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Partilhar Evento">
      <div className="space-y-6">
        {/* QR Code Section */}
        <div>
          <QRCodeDisplay eventUrl={eventUrl} qrCodeUrl={event.registration?.qrCodeUrl} />
        </div>

        {/* Sharing Options */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Partilhar via</h3>

          <div className="grid grid-cols-2 gap-3">
            {/* WhatsApp */}
            <button
              onClick={shareViaWhatsApp}
              className="flex items-center gap-3 px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors border border-green-200"
            >
              <MessageCircle size={22} />
              <span className="font-medium">WhatsApp</span>
            </button>

            {/* Email */}
            <button
              onClick={shareViaEmail}
              className="flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors border border-blue-200"
            >
              <Mail size={22} />
              <span className="font-medium">Email</span>
            </button>

            {/* Facebook */}
            <button
              onClick={shareViaFacebook}
              className="flex items-center gap-3 px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors border border-indigo-200"
            >
              <Facebook size={22} />
              <span className="font-medium">Facebook</span>
            </button>

            {/* Native Share (Mobile) */}
            {typeof navigator !== 'undefined' && navigator.share !== undefined && (
              <button
                onClick={shareViaNativeShare}
                className="flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors border border-gray-200"
              >
                <Share2 size={22} />
                <span className="font-medium">Mais opções</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Section (if available) */}
        {event.qrScans !== undefined && event.qrScans > 0 && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Total de scans do QR Code</span>
              <span className="text-2xl font-bold text-gray-900">{event.qrScans}</span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
