'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Download, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface QRCodeDisplayProps {
  eventUrl: string;
  qrCodeUrl?: string;
}

export function QRCodeDisplay({ eventUrl, qrCodeUrl }: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(eventUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    // Get the SVG element and convert to canvas
    const svg = document.querySelector('#qr-code-svg');
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Download
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'event-qrcode.png';
      a.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="space-y-4">
      {/* QR Code Display */}
      <div className="flex justify-center p-8 bg-white rounded-lg border-2 border-gray-100">
        <QRCodeSVG
          id="qr-code-svg"
          value={eventUrl}
          size={256}
          level="H"
          includeMargin={true}
        />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <Download size={18} />
          <span className="font-medium">Download PNG</span>
        </button>

        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          {copied ? (
            <>
              <Check size={18} className="text-green-600" />
              <span className="font-medium text-green-600">Copiado!</span>
            </>
          ) : (
            <>
              <Copy size={18} />
              <span className="font-medium">Copiar Link</span>
            </>
          )}
        </button>
      </div>

      {/* URL Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Link do Evento
        </label>
        <input
          type="text"
          value={eventUrl}
          readOnly
          className="w-full px-4 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={(e) => e.currentTarget.select()}
        />
      </div>

      {/* Instructions */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h4 className="font-medium text-blue-900 mb-2">Como usar:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Faça download do QR Code para imprimir ou partilhar</li>
          <li>• Copie o link para partilhar em redes sociais ou email</li>
          <li>• Visitantes podem escanear o QR Code para se registarem</li>
        </ul>
      </div>
    </div>
  );
}
