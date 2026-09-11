import React, { useState } from 'react';
import {
  Smartphone,
  QrCode,
  ExternalLink,
  X,
  Sparkles,
  Phone,
  CheckCircle2,
  Info,
  Maximize2
} from 'lucide-react';
import { QRCodeSVG } from '../common/QRCodeSVG';
import { WhatsAppMobileBot } from '../whatsapp/WhatsAppMobileBot';

interface WhatsAppRedirectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppRedirectorModal: React.FC<WhatsAppRedirectorModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [qrMode, setQrMode] = useState<'web_bot' | 'real_whatsapp'>('web_bot');
  const [customPhone, setCustomPhone] = useState('917904041960');
  const [copied, setCopied] = useState(false);

  // Live scannable URL for mobile phones
  const webBotUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/whatsapp`
    : 'https://reloop.eco/whatsapp';

  const prefilledMessage = encodeURIComponent('Hi ReLoop! I want to schedule an e-waste pickup for my old devices.');
  const waDirectUrl = `https://wa.me/${customPhone.replace(/\D/g, '')}?text=${prefilledMessage}`;

  const currentQrValue = qrMode === 'web_bot' ? webBotUrl : waDirectUrl;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(webBotUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="whatsapp-redirector-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in"
    >
      <div
        id="whatsapp-redirector-modal-container"
        className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row max-h-[92vh]"
      >
        {/* Left Side: Real Scannable QR Code & Instructions */}
        <div className="md:w-5/12 p-5 sm:p-6 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Live WhatsApp Bot</span>
              </div>
              <button
                onClick={onClose}
                className="md:hidden text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 font-display">
              Scan & Chat on Phone
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Point your smartphone camera (iPhone or Android) at this QR code. It opens our working WhatsApp assistant right in your mobile browser!
            </p>

            {/* QR Mode Switcher Tabs */}
            <div className="mt-4 p-1 bg-slate-200/70 rounded-xl flex gap-1 text-xs">
              <button
                onClick={() => setQrMode('web_bot')}
                className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all cursor-pointer text-center ${
                  qrMode === 'web_bot'
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📱 Live Web Bot (Instant)
              </button>
              <button
                onClick={() => setQrMode('real_whatsapp')}
                className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all cursor-pointer text-center ${
                  qrMode === 'real_whatsapp'
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🟢 wa.me Link
              </button>
            </div>

            {/* QR Code Container */}
            <div className="mt-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs text-center">
              <div className="flex justify-center">
                <QRCodeSVG
                  value={currentQrValue}
                  size={155}
                  showValueLabel={false}
                />
              </div>

              <div className="mt-2.5 flex items-center justify-center gap-1.5 text-emerald-700 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Standard Scannable ISO QR Code</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {qrMode === 'web_bot'
                  ? 'Works on any smartphone camera with zero app installation.'
                  : 'Directs to the real WhatsApp application.'}
              </p>
            </div>

            {/* Custom Phone Number input if wa.me mode is selected */}
            {qrMode === 'real_whatsapp' && (
              <div className="mt-3 p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs space-y-1.5">
                <label className="block text-[11px] font-bold text-emerald-900">
                  Target WhatsApp Business Number:
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={customPhone}
                    onChange={(e) => setCustomPhone(e.target.value)}
                    placeholder="e.g. 919876543210"
                    className="flex-1 px-2.5 py-1.5 bg-white rounded-lg border border-emerald-300 text-xs text-slate-800 font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-500">
                  If you have a registered WhatsApp Business or Twilio Sandbox number, enter it above.
                </p>
              </div>
            )}
          </div>

          {/* Action Links & Buttons */}
          <div className="mt-4 pt-3 border-t border-slate-200 space-y-2">
            <a
              href={currentQrValue}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Open Fullscreen Bot in New Tab</span>
            </a>

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <button
                onClick={handleCopyLink}
                className="text-emerald-700 hover:underline font-semibold cursor-pointer"
              >
                {copied ? '✓ Link Copied!' : 'Copy Mobile Bot URL'}
              </button>
              <span>Bengaluru Official • CPCB</span>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Live WhatsApp Bot Simulator */}
        <div className="md:w-7/12 flex flex-col bg-[#efeae2] relative overflow-hidden">
          <WhatsAppMobileBot onBack={onClose} standalone={false} />
        </div>
      </div>
    </div>
  );
};
