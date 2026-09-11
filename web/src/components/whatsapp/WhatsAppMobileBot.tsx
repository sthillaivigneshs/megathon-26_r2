import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Camera,
  Paperclip,
  Smile,
  Mic,
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  CheckCheck,
  MapPin,
  Package,
  QrCode,
  DollarSign,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Image as ImageIcon,
  Check,
  AlertCircle
} from 'lucide-react';
import { getStoredPickups, savePickup, getStoredBatches, getStoredPartners } from '../../services/mockData';
import { PickupRequest } from '../../types';

// Audio feedback synthesizers using Web Audio API
function playPopSound(isOutgoing = false) {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (isOutgoing) {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch (e) {
    // AudioContext might be restricted until first user gesture
  }
}

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text?: string;
  time: string;
  type?: 'text' | 'image' | 'voice' | 'card' | 'location' | 'booking_confirmation';
  imageUrl?: string;
  voiceDuration?: string;
  cardData?: {
    title: string;
    badge?: string;
    details: { label: string; value: string }[];
    actionLabel?: string;
    actionType?: string;
  };
}

interface WhatsAppMobileBotProps {
  onBack?: () => void;
  standalone?: boolean;
}

export const WhatsAppMobileBot: React.FC<WhatsAppMobileBotProps> = ({
  onBack,
  standalone = false,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      sender: 'bot',
      type: 'text',
      text: 'Namaste! 🙏 Welcome to *ReLoop Official E-Waste Assistant*.\n\nWe connect your discarded electronics directly to verified collectors and CPCB-authorized recyclers.\n\n*How can I help you today?*\n1️⃣ 📦 Book Doorstep Pickup\n2️⃣ 🔍 Track My E-Waste (PR-1024)\n3️⃣ 💰 Live E-Waste Scrap Rates\n4️⃣ 📍 Nearest E-Waste Drop Hub\n5️⃣ 📸 AI Photo Scrap Valuator\n6️⃣ 🎙️ Hindi Voice Guidance',
      time: '10:00 AM',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [bookingStep, setBookingStep] = useState<number>(0);
  const [pendingBooking, setPendingBooking] = useState<{
    items: string;
    address: string;
    phone: string;
    slot: string;
  }>({ items: '', address: '', phone: '', slot: '' });

  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isScanningPhoto, setIsScanningPhoto] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isScanningPhoto]);

  // Handle bot speech synthesis for audio messages
  const playVoiceNote = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN'; // Hindi/Indian English accent
      utterance.rate = 0.95;
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingAudio(true);
      setTimeout(() => setIsPlayingAudio(false), 3000);
    }
  };

  const addBotMessage = (msg: Omit<Message, 'id' | 'sender' | 'time'>) => {
    if (!isMuted) playPopSound(false);
    if ('vibrate' in navigator) navigator.vibrate?.([30]);

    setMessages((prev) => [
      ...prev,
      {
        id: `bot-${Date.now()}-${Math.random()}`,
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ...msg,
      },
    ]);
  };

  const handleUserSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    if (!isMuted) playPopSound(true);

    const userMsg: Message = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sender: 'user',
      type: 'text',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');

    const lower = text.toLowerCase().trim();

    // Contextual State Machine for Booking
    if (bookingStep === 1) {
      // User entered items
      setPendingBooking((p) => ({ ...p, items: text }));
      setBookingStep(2);
      setTimeout(() => {
        addBotMessage({
          type: 'text',
          text: `Got it: *${text}* 📱\n\nWhere should our verified collector pick them up? Please type your address or tap *📍 Share Current GPS Location* below:`,
        });
      }, 500);
      return;
    }

    if (bookingStep === 2) {
      // User entered address
      setPendingBooking((p) => ({ ...p, address: text }));
      setBookingStep(3);
      setTimeout(() => {
        addBotMessage({
          type: 'text',
          text: `Location saved: *${text}* 📍\n\nWhat is your contact phone number and preferred pickup time?\n\n(e.g., "+91 98765 43210, Today Evening 4-6 PM")`,
        });
      }, 500);
      return;
    }

    if (bookingStep === 3) {
      // Booking finalized!
      const newRequestId = `PR-${Math.floor(1027 + Math.random() * 890)}`;
      const newPickup: PickupRequest = {
        id: newRequestId,
        citizenId: 'usr_citizen_wa',
        citizenName: 'WhatsApp Citizen',
        citizenPhone: text.includes('+91') ? text : `+91 ${text.slice(0, 10)}`,
        address: pendingBooking.address || 'Koramangala, Bengaluru',
        city: 'Bengaluru',
        items: [
          {
            id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            category: pendingBooking.items.toLowerCase().includes('laptop') ? 'Laptop' : 'Mobile',
            count: 1,
            estimatedWeightKg: 1.5,
            notes: pendingBooking.items,
          },
        ],
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      savePickup(newPickup);
      setBookingStep(0);

      setTimeout(() => {
        addBotMessage({
          type: 'booking_confirmation',
          text: `🎉 *Doorstep Pickup Confirmed!*\n\n• *Request ID:* ${newRequestId}\n• *Items:* ${pendingBooking.items}\n• *Pickup Address:* ${pendingBooking.address}\n• *Assigned Collector:* Rajesh Kumar (Rating: 4.9 ★)\n• *Status:* Scheduled for verified doorstep weigh-in.\n\n🌿 *+50 ReLoop Green Points* credited to your phone number!`,
          cardData: {
            title: `Pickup ${newRequestId} Confirmed`,
            badge: 'Verified CPCB Flow',
            details: [
              { label: 'Collector', value: 'Rajesh Kumar (+91 98451 22334)' },
              { label: 'Verification', value: 'Digital Scale Weigh-in at Doorstep' },
              { label: 'Carbon Saved', value: '~4.2 kg CO₂ equivalent' },
            ],
            actionLabel: `Track ${newRequestId}`,
            actionType: 'track',
          },
        });
      }, 600);
      return;
    }

    // Default Command & Keyword Matching
    setTimeout(() => {
      if (lower === '1' || lower.includes('book') || lower.includes('pickup') || lower.includes('schedule')) {
        setBookingStep(1);
        addBotMessage({
          type: 'text',
          text: '📦 *Doorstep E-Waste Pickup Booking*\n\nWhat devices would you like to responsibly dispose?\n\n_You can type (e.g., "2 broken phones, 1 Dell laptop, old chargers") or tap one of the quick options below:_',
        });
      } else if (lower === '2' || lower.includes('track') || lower.includes('pr-') || lower.includes('cb-')) {
        const queryId = lower.match(/(pr-\d+|cb-\d+)/i)?.[0]?.toUpperCase() || 'PR-1024';
        const batches = getStoredBatches();
        const batch = batches.find((b) => b.pickupRequestId === queryId || b.id === queryId) || batches[0];

        addBotMessage({
          type: 'card',
          text: `🔍 *Live Journey for ${queryId}*\n\nHere is the tamper-proof multi-stage audit trail from collector to certified recycler:`,
          cardData: {
            title: `Chain-of-Custody: ${batch.id}`,
            badge: 'CPCB Certified',
            details: [
              { label: '1. Field Pickup', value: `${batch.declaredWeightKg} kg (GPS & Image Hashed)` },
              { label: '2. Aggregator Dock', value: `${batch.aggregatorWeightKg} kg (Verified)` },
              { label: '3. Recycler Intake', value: `${batch.recyclerWeightKg} kg (Processed)` },
              { label: 'Circularity', value: '82% Gold/Copper recovered • 0% Landfill' },
            ],
            actionLabel: 'Download Green EPR Certificate',
            actionType: 'cert',
          },
        });
      } else if (lower === '3' || lower.includes('rate') || lower.includes('price') || lower.includes('scrap') || lower.includes('payout')) {
        addBotMessage({
          type: 'text',
          text: '💰 *Today\'s Official Fair Scrap Payouts (Bengaluru)*\n\n• 📱 *Old Smartphones:* ₹350 – ₹950 / piece\n• 💻 *Laptops / MacBooks:* ₹400 – ₹1,800 / piece\n• 🔋 *Lithium-Ion Batteries:* ₹180 / kg\n• 🔌 *Copper Wires & Chargers:* ₹220 / kg\n• 🖥️ *Motherboards & PCBs:* ₹650 / kg\n• 📺 *Old CRT / LED Screens:* ₹120 / kg\n\n_100% transparent weighing with Bluetooth digital scale. No middlemen cuts!_',
        });
      } else if (lower === '4' || lower.includes('hub') || lower.includes('center') || lower.includes('drop') || lower.includes('near')) {
        addBotMessage({
          type: 'location',
          text: '📍 *Nearest Verified ReLoop Aggregation Hub*\n\n🏢 *Koramangala BDA E-Waste Collection Hub*\n• Address: 4th Block, Koramangala, Bengaluru 560034\n• Distance: ~1.4 km from your pin code\n• Hours: Monday – Saturday, 9:00 AM – 6:30 PM\n• Supervisor: Anand Rao (+91 98440 55667)\n\n_All drop-offs receive immediate digital receipt and green tax credits!_',
        });
      } else if (lower === '5' || lower.includes('photo') || lower.includes('scan') || lower.includes('ai') || lower.includes('camera')) {
        addBotMessage({
          type: 'text',
          text: '📸 *AI Device Scrap Valuator*\n\nPlease tap the 📷 camera icon below or attach a photo of your old device. Our AI will identify the model, estimate precious metal recovery, and quote an instant scrap payout!',
        });
      } else if (lower === '6' || lower.includes('hindi') || lower.includes('voice') || lower.includes('आवाज')) {
        const hindiScript = 'नमस्ते! री-लूप में आपका स्वागत है। आपके घर से पुराना इलेक्ट्रॉनिक कचरा उठाने के लिए हमारी टीम तैयार है। क्या आप आज पिकअप बुक करना चाहते हैं?';
        addBotMessage({
          type: 'voice',
          text: `🎙️ *Voice Note (Hindi)*\n\n"${hindiScript}"`,
          voiceDuration: '0:14',
        });
        playVoiceNote(hindiScript);
      } else if (lower.includes('hi') || lower.includes('hello') || lower.includes('help') || lower.includes('namaste')) {
        addBotMessage({
          type: 'text',
          text: 'Namaste! 👋 I am your ReLoop e-waste assistant. You can tap any option or ask me directly in Hindi or English:\n\n• Type *1* to Book a Pickup\n• Type *2* to Track your Device\n• Type *3* for Live Scrap Rates\n• Type *4* for Nearest Hub\n• Type *5* for AI Camera Scan',
        });
      } else {
        // Fallback AI response
        addBotMessage({
          type: 'text',
          text: `Thank you for your message! ♻️\n\nOur system has noted: "${text}".\n\nWould you like to:\n• *Book a Doorstep Pickup* (Reply 1)\n• *Check Scrap Rates* (Reply 3)\n• *Speak to a Human Agent* (Call 1800-RELOOP)`,
        });
      }
    }, 600);
  };

  // Handle GPS location share
  const handleShareLocation = () => {
    setShowAttachMenu(false);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(4);
          const lng = pos.coords.longitude.toFixed(4);
          const locText = `Location: Lat ${lat}, Lng ${lng} (Bengaluru)`;
          handleUserSend(locText);
        },
        () => {
          handleUserSend('Location: Koramangala 4th Block, Bengaluru (560034)');
        }
      );
    } else {
      handleUserSend('Location: Bengaluru 560034');
    }
  };

  // Handle photo upload & AI valuation
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setShowAttachMenu(false);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setSelectedPhoto(dataUrl);

      // Add user image message
      if (!isMuted) playPopSound(true);
      setMessages((prev) => [
        ...prev,
        {
          id: `user-img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          sender: 'user',
          type: 'image',
          imageUrl: dataUrl,
          text: 'Attached device photo for scrap valuation',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      setIsScanningPhoto(true);

      // AI Inspection simulation
      setTimeout(() => {
        setIsScanningPhoto(false);
        addBotMessage({
          type: 'card',
          text: '✨ *AI Device Valuation Complete!*',
          cardData: {
            title: 'Identified: Smartphone / Lithium Component',
            badge: 'Hazard Tier 1 (Li-ion)',
            details: [
              { label: 'Category', value: 'IT & Telecom (Small Devices)' },
              { label: 'Estimated Weight', value: '0.24 kg' },
              { label: 'Hazardous Elements', value: 'Cobalt, Lithium, Trace Lead' },
              { label: 'Estimated Scrap Value', value: '₹480 – ₹650' },
              { label: 'EPR Credit Yield', value: '0.24 kg credit token' },
            ],
            actionLabel: 'Book Instant Doorstep Pickup for this Device',
            actionType: 'book_scanned',
          },
        });
      }, 1400);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      id="reloop-whatsapp-bot-screen"
      className={`flex flex-col bg-[#efeae2] select-none ${
        standalone ? 'min-h-screen w-full' : 'h-[640px] md:h-[700px] w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl border border-slate-300'
      }`}
      style={{
        backgroundImage: `radial-gradient(#d1d7db 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
      }}
    >
      {/* Hidden File Input for Camera / Photo */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handlePhotoUpload}
      />

      {/* WhatsApp Header */}
      <div className="bg-[#075e54] text-white px-3 py-2.5 flex items-center justify-between shadow-md shrink-0 z-10">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1 hover:bg-emerald-800/60 rounded-full transition-colors cursor-pointer text-white"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {/* Avatar with Verified Badge */}
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-emerald-800 border border-emerald-400/40 flex items-center justify-center font-bold text-xs text-white shadow-inner">
              RL
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border border-[#075e54] flex items-center justify-center text-[9px] text-white font-bold">
              ✓
            </div>
          </div>

          <div className="leading-tight">
            <div className="font-bold text-sm flex items-center gap-1">
              <span>ReLoop India</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-600/80 rounded text-emerald-100 font-normal">
                Official
              </span>
            </div>
            <div className="text-[10px] text-emerald-200 flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
              online • verified business
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-3 text-emerald-100">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 hover:bg-emerald-800/60 rounded-full cursor-pointer transition-colors"
            title={isMuted ? 'Unmute WhatsApp audio' : 'Mute audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-emerald-300" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => handleUserSend('1')}
            className="hidden sm:flex items-center gap-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 px-2 py-1 rounded-md text-white transition-colors"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Book</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
        {/* End-to-end Encryption Banner */}
        <div className="mx-auto max-w-xs p-2 rounded-lg bg-[#ffeecd] border border-[#e8dcb8] text-[10px] text-amber-900 text-center leading-relaxed shadow-2xs">
          🔒 Messages and transactions are verified under CPCB EPR Digital Guidelines.
        </div>

        {/* Date Marker */}
        <div className="flex justify-center">
          <span className="px-2.5 py-0.5 rounded-full bg-white/90 text-slate-500 font-semibold text-[10px] shadow-2xs uppercase tracking-wider">
            Today
          </span>
        </div>

        {messages.map((m, idx) => (
          <div
            key={`${m.id}-${idx}`}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[88%] sm:max-w-[82%] rounded-xl p-3 shadow-xs relative ${
                m.sender === 'user'
                  ? 'bg-[#d9fdd3] text-slate-900 rounded-tr-none'
                  : 'bg-white text-slate-900 rounded-tl-none border border-slate-200/60'
              }`}
            >
              {/* Image Preview if applicable */}
              {m.type === 'image' && m.imageUrl && (
                <div className="mb-2 rounded-lg overflow-hidden border border-slate-200">
                  <img
                    src={m.imageUrl}
                    alt="Uploaded Device"
                    className="w-full h-40 object-cover"
                  />
                </div>
              )}

              {/* Voice Note Player */}
              {m.type === 'voice' && (
                <div className="flex items-center gap-3 p-2 bg-emerald-50/80 rounded-lg border border-emerald-100 mb-2">
                  <button
                    onClick={() => {
                      if (isPlayingAudio) {
                        window.speechSynthesis?.cancel();
                        setIsPlayingAudio(false);
                      } else {
                        playVoiceNote(
                          'नमस्ते! री-लूप में आपका स्वागत है। आपके घर से पुराना इलेक्ट्रॉनिक कचरा उठाने के लिए हमारी टीम तैयार है।'
                        );
                      }
                    }}
                    className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer"
                  >
                    {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                  </button>

                  <div className="flex-1">
                    <div className="h-1.5 bg-emerald-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-emerald-600 rounded-full ${
                          isPlayingAudio ? 'w-full transition-all duration-3000' : 'w-1/3'
                        }`}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-emerald-800 font-mono mt-1">
                      <span>Hindi Voice Note</span>
                      <span>{m.voiceDuration || '0:14'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Message Text with bold Markdown parsing */}
              {m.text && (
                <div className="whitespace-pre-line text-xs leading-relaxed text-slate-800">
                  {m.text.split('\n').map((line, i) => (
                    <p key={i} className="min-h-[1em]">
                      {line.startsWith('•') || line.startsWith('1️⃣') || line.startsWith('2️⃣') ? (
                        <span>{line}</span>
                      ) : (
                        line
                      )}
                    </p>
                  ))}
                </div>
              )}

              {/* Rich Card Attachment (Tracking / Confirmation / Valuation) */}
              {m.cardData && (
                <div className="mt-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 font-display">
                      {m.cardData.title}
                    </span>
                    {m.cardData.badge && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {m.cardData.badge}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 pt-1 border-t border-slate-200/80 text-[11px]">
                    {m.cardData.details.map((d, idx) => (
                      <div key={idx} className="flex justify-between text-slate-600">
                        <span className="text-slate-500">{d.label}:</span>
                        <span className="font-semibold text-slate-900">{d.value}</span>
                      </div>
                    ))}
                  </div>

                  {m.cardData.actionLabel && (
                    <button
                      onClick={() => {
                        if (m.cardData?.actionType === 'track') {
                          handleUserSend('Track PR-1024');
                        } else if (m.cardData?.actionType === 'book_scanned') {
                          handleUserSend('Book Doorstep Pickup for Smartphone');
                        } else {
                          handleUserSend('Download Certificate');
                        }
                      }}
                      className="w-full mt-2 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px] shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{m.cardData.actionLabel}</span>
                    </button>
                  )}
                </div>
              )}

              {/* Message Time and Status */}
              <div className="text-[9px] text-slate-400 text-right mt-1 flex items-center justify-end gap-1">
                <span>{m.time}</span>
                {m.sender === 'user' && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
              </div>
            </div>
          </div>
        ))}

        {/* Live Photo Scanning Indicator */}
        {isScanningPhoto && (
          <div className="flex items-center gap-2 p-3 bg-white rounded-xl shadow-xs border border-emerald-300 animate-pulse text-emerald-800 text-xs">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
            <span>AI scanning e-waste hardware, estimating scrap payout...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Suggestion Chips Bar */}
      <div className="px-3 py-1.5 bg-[#f0f2f5] border-t border-slate-200/60 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => handleUserSend('1')}
          className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-[11px] font-semibold border border-slate-200 shadow-2xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
        >
          <Package className="w-3 h-3 text-emerald-600" />
          <span>📦 Book Pickup</span>
        </button>

        <button
          onClick={() => handleUserSend('Track PR-1024')}
          className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-800 text-[11px] font-semibold border border-slate-200 shadow-2xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
        >
          <QrCode className="w-3 h-3 text-blue-600" />
          <span>🔍 Track PR-1024</span>
        </button>

        <button
          onClick={() => handleUserSend('3')}
          className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-800 text-[11px] font-semibold border border-slate-200 shadow-2xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
        >
          <DollarSign className="w-3 h-3 text-amber-600" />
          <span>💰 Scrap Rates</span>
        </button>

        <button
          onClick={handleShareLocation}
          className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-800 text-[11px] font-semibold border border-slate-200 shadow-2xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
        >
          <MapPin className="w-3 h-3 text-purple-600" />
          <span>📍 GPS Location</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="whitespace-nowrap px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold border border-emerald-300 shadow-2xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
        >
          <Camera className="w-3 h-3 text-emerald-600" />
          <span>📸 Scan Device</span>
        </button>

        <button
          onClick={() => handleUserSend('6')}
          className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200 shadow-2xs transition-colors shrink-0 cursor-pointer"
        >
          <span>🎙️ हिंदी वॉइस</span>
        </button>
      </div>

      {/* Attachment Popover */}
      {showAttachMenu && (
        <div className="p-3 bg-white border-t border-slate-200 grid grid-cols-3 gap-2 text-center text-xs animate-in slide-in-from-bottom-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 flex flex-col items-center gap-1 transition-colors cursor-pointer"
          >
            <Camera className="w-5 h-5" />
            <span className="text-[11px] font-bold">Camera</span>
          </button>
          <button
            onClick={handleShareLocation}
            className="p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 flex flex-col items-center gap-1 transition-colors cursor-pointer"
          >
            <MapPin className="w-5 h-5" />
            <span className="text-[11px] font-bold">GPS Location</span>
          </button>
          <button
            onClick={() => {
              setShowAttachMenu(false);
              handleUserSend('3');
            }}
            className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 flex flex-col items-center gap-1 transition-colors cursor-pointer"
          >
            <DollarSign className="w-5 h-5" />
            <span className="text-[11px] font-bold">Rate Card</span>
          </button>
        </div>
      )}

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleUserSend();
        }}
        className="p-2 bg-[#f0f2f5] flex items-center gap-1.5 shrink-0"
      >
        <button
          type="button"
          onClick={() => setShowAttachMenu(!showAttachMenu)}
          className="p-2 text-slate-500 hover:text-slate-700 rounded-full cursor-pointer hover:bg-slate-200/60 transition-colors"
          title="Attach"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Message or type 1, 2, 3..."
          className="flex-1 px-4 py-2 bg-white rounded-full text-xs text-slate-800 placeholder:text-slate-400 border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-slate-500 hover:text-slate-700 rounded-full cursor-pointer hover:bg-slate-200/60 transition-colors"
          title="Take Photo of Device"
        >
          <Camera className="w-5 h-5" />
        </button>

        {inputText.trim() ? (
          <button
            type="submit"
            className="w-9 h-9 rounded-full bg-[#00a884] hover:bg-[#075e54] text-white flex items-center justify-center cursor-pointer transition-colors shadow-xs"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleUserSend('6')}
            className="w-9 h-9 rounded-full bg-[#00a884] hover:bg-[#075e54] text-white flex items-center justify-center cursor-pointer transition-colors shadow-xs"
            title="Listen to Voice Note"
          >
            <Mic className="w-4 h-4" />
          </button>
        )}
      </form>
    </div>
  );
};
