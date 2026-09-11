import React, { useState, useEffect } from 'react';
import { Sparkles, Volume2, VolumeX, Send, X, Bot, HelpCircle, MessageSquare } from 'lucide-react';

interface InteractiveFaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InteractiveFaceModal: React.FC<InteractiveFaceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mood, setMood] = useState<'neutral' | 'happy' | 'thinking' | 'speaking'>('neutral');
  const [query, setQuery] = useState('');
  const [dialogue, setDialogue] = useState<string>(
    "Hello! I am Eco, your ReLoop Interactive Assistant. Ask me anything about our offline-first collection protocol, trust scores, or CPCB EPR compliance!"
  );

  const cannedAnswers: Record<string, string> = {
    'what is reloop':
      "ReLoop is an offline-first digital platform that brings informal e-waste collectors into the formal recycling and EPR ecosystem. It connects Citizen → Informal Collector → Aggregator → Recycler → Brand.",
    'offline':
      "Informal collectors often work with limited internet. ReLoop saves collections to an offline local SQLite queue with GPS coordinates, photos, and digital scale weights. Once internet returns, data auto-syncs without duplicate records.",
    'smart route':
      "Smart Route is our key innovation! After collecting material, the collector is guided with real-time comparisons of verified downstream recyclers based on indicative price, distance, trust score, and live capacity to maximize earnings.",
    'trust score':
      "The Collector Trust Score (up to 100) measures weight accuracy between field collection and downstream dock weighing, verified handovers, and absence of anomalies. Rajesh currently has a 94/100 score.",
    'epr':
      "EPR (Extended Producer Responsibility) requires brands to recycle electronics. ReLoop creates an immutable audit trail from collection to final circularity pathways (Refurbish, Recovery, Recycle) for CPCB compliance.",
  };

  const speakText = (text: string) => {
    if (!speechEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    utterance.onstart = () => {
      setIsSpeaking(true);
      setMood('speaking');
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setMood('happy');
      setTimeout(() => setMood('neutral'), 1500);
    };
    window.speechSynthesis.speak(utterance);
  };

  const handleAsk = (userQuery: string) => {
    setQuery('');
    setMood('thinking');
    const lower = userQuery.toLowerCase();

    setTimeout(() => {
      let reply =
        "ReLoop bridges informal collectors with formal EPR compliance by recording photos, weights, and GPS coordinates across every handover stage.";

      if (lower.includes('reloop') || lower.includes('what')) {
        reply = cannedAnswers['what is reloop'];
      } else if (lower.includes('offline') || lower.includes('internet') || lower.includes('sqlite')) {
        reply = cannedAnswers['offline'];
      } else if (lower.includes('route') || lower.includes('smart') || lower.includes('buyer')) {
        reply = cannedAnswers['smart route'];
      } else if (lower.includes('trust') || lower.includes('score') || lower.includes('wallet')) {
        reply = cannedAnswers['trust score'];
      } else if (lower.includes('epr') || lower.includes('cpcb') || lower.includes('compliance')) {
        reply = cannedAnswers['epr'];
      }

      setDialogue(reply);
      setMood('speaking');
      speakText(reply);
      setTimeout(() => {
        if (!speechEnabled) setMood('happy');
      }, 1000);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-300 animate-pulse" />
            <span className="font-bold text-sm font-display">Eco • Interactive ReLoop Face</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (speechEnabled && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
                setSpeechEnabled(!speechEnabled);
              }}
              title={speechEnabled ? 'Voice is On' : 'Voice is Off'}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                speechEnabled ? 'bg-emerald-500/30 text-emerald-300' : 'bg-white/10 text-slate-300'
              }`}
            >
              {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button onClick={onClose} className="p-1 rounded-lg text-indigo-200 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Interactive Face Visualizer */}
        <div className="p-6 bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Ambient Glow */}
          <div
            className={`absolute inset-0 bg-indigo-500/10 blur-3xl transition-opacity duration-700 ${
              isSpeaking ? 'opacity-80' : 'opacity-30'
            }`}
          />

          {/* Animated SVG Face */}
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
              {/* Outer Head Contour */}
              <rect
                x="25"
                y="25"
                width="150"
                height="150"
                rx="40"
                fill="#0f172a"
                stroke={isSpeaking ? '#818cf8' : '#38bdf8'}
                strokeWidth="3"
                className="transition-all duration-300"
              />

              {/* Forehead Hologram Node */}
              <circle
                cx="100"
                cy="45"
                r="5"
                fill={mood === 'thinking' ? '#f59e0b' : '#10b981'}
                className={mood === 'thinking' ? 'animate-ping' : ''}
              />

              {/* Eyes */}
              {/* Left Eye */}
              <g className="transition-all duration-200">
                <rect
                  x="55"
                  y="75"
                  width="30"
                  height={mood === 'thinking' ? '6' : '22'}
                  rx="6"
                  fill="#38bdf8"
                  className={isSpeaking ? 'animate-pulse' : ''}
                />
                <circle cx="70" cy="86" r="3" fill="#ffffff" />
              </g>

              {/* Right Eye */}
              <g className="transition-all duration-200">
                <rect
                  x="115"
                  y="75"
                  width="30"
                  height={mood === 'thinking' ? '6' : '22'}
                  rx="6"
                  fill="#38bdf8"
                  className={isSpeaking ? 'animate-pulse' : ''}
                />
                <circle cx="130" cy="86" r="3" fill="#ffffff" />
              </g>

              {/* Cheeks */}
              <circle cx="50" cy="115" r="7" fill="#f43f5e" opacity="0.3" />
              <circle cx="150" cy="115" r="7" fill="#f43f5e" opacity="0.3" />

              {/* Mouth with reactive shape */}
              {mood === 'speaking' || isSpeaking ? (
                <rect
                  x="75"
                  y="125"
                  width="50"
                  height="16"
                  rx="8"
                  fill="#38bdf8"
                  className="animate-pulse"
                />
              ) : mood === 'happy' ? (
                <path
                  d="M 75 130 Q 100 150 125 130"
                  stroke="#38bdf8"
                  strokeWidth="5"
                  fill="transparent"
                  strokeLinecap="round"
                />
              ) : mood === 'thinking' ? (
                <rect x="80" y="132" width="40" height="4" rx="2" fill="#f59e0b" />
              ) : (
                <path
                  d="M 80 132 Q 100 140 120 132"
                  stroke="#38bdf8"
                  strokeWidth="4"
                  fill="transparent"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </div>

          <div className="mt-2 text-center">
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">
              State: {isSpeaking ? 'Speaking audio' : mood}
            </span>
          </div>
        </div>

        {/* Speech Bubble */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex-1 space-y-3">
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs text-xs text-slate-800 leading-relaxed font-medium">
            "{dialogue}"
          </div>

          {/* Quick Prompts */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Quick Questions:
            </span>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <button
                onClick={() => handleAsk('What is ReLoop?')}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg hover:border-indigo-400 text-slate-700 cursor-pointer"
              >
                What is ReLoop?
              </button>
              <button
                onClick={() => handleAsk('How does offline collection work?')}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg hover:border-indigo-400 text-slate-700 cursor-pointer"
              >
                Offline Collection?
              </button>
              <button
                onClick={() => handleAsk('What is the Smart Route innovation?')}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg hover:border-indigo-400 text-slate-700 cursor-pointer"
              >
                Smart Route?
              </button>
              <button
                onClick={() => handleAsk('How does EPR verification work?')}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg hover:border-indigo-400 text-slate-700 cursor-pointer"
              >
                EPR Verification?
              </button>
            </div>
          </div>

          {/* User Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (query.trim()) handleAsk(query);
            }}
            className="flex gap-2 pt-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask Eco a question..."
              className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
