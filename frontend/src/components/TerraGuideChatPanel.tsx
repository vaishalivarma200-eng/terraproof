import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  User,
  ShieldAlert,
  FileCheck2,
  Scale,
  Compass,
  RotateCcw,
} from 'lucide-react';
import { api } from '../services/api';

interface TerraGuideChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeClaimId?: string;
  activeClaimRef?: string;
  initialQuestion?: string;
}

export const TerraGuideChatPanel: React.FC<TerraGuideChatPanelProps> = ({
  isOpen,
  onClose,
  activeClaimId,
  activeClaimRef,
  initialQuestion,
}) => {
  const [messages, setMessages] = useState<
    Array<{ sender: 'user' | 'assistant'; text: string; evidence?: string[]; aiMode?: string }>
  >([
    {
      sender: 'assistant',
      text: 'Namaste! I am TerraGuide, your satellite evidence and decision-support assistant. I explain crop damage assessments, PMFBY guidelines, flood comparisons, and what-if simulations based strictly on verified data.',
      evidence: ['TerraProof Knowledge Base (PMFBY, Remote Sensing Indices, Crop Calendar)'],
      aiMode: 'offline demo',
    },
  ]);

  const [input, setInput] = useState('');
  const [role, setRole] = useState<'judge' | 'farmer' | 'adjuster' | 'official' | 'planner'>('judge');
  const [language, setLanguage] = useState<'en' | 'hi' | 'hinglish'>('en');
  const [loading, setLoading] = useState(false);
  const [suggestedChips, setSuggestedChips] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSuggestedQuestions();
  }, [activeClaimId, role]);

  useEffect(() => {
    if (initialQuestion) {
      handleSendMessage(initialQuestion);
    }
  }, [initialQuestion]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadSuggestedQuestions = async () => {
    try {
      const res = await api.getSuggestedQuestions(activeClaimId, role);
      setSuggestedChips(res.suggested_questions || []);
    } catch (e) {
      setSuggestedChips([
        'Why was this claim flagged?',
        'What does 58.7% divergence mean?',
        'Which districts were most affected in the Assam flood?',
        'What if the river level rises by 2.5 meters?',
        'What can TerraProof NOT do?',
      ]);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = { sender: 'user' as const, text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.askAssistant({
        message: query,
        claim_id: activeClaimId,
        role: role,
        language: language,
      });

      const assistantMsg = {
        sender: 'assistant' as const,
        text: res.reply,
        evidence: res.evidence_used,
        aiMode: res.ai_mode,
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // If speech synthesis enabled, speak response
      if (isSpeaking && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(res.reply.replace(/\*\*/g, ''));
        utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Sorry, I encountered a communication error. Falling back to local offline evidence mode.',
          aiMode: 'offline fallback',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Browser Speech-to-Text (Web Speech API)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your browser. Please type your question.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  const toggleTextToSpeech = () => {
    if (isSpeaking) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[450px] bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col animate-slide-left">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex flex-col space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-sm">TerraGuide AI</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  GROUNDED EVIDENCE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {activeClaimRef ? `Context: ${activeClaimRef}` : 'Regional & Policy Decision Support'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role & Language Selector Row */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <div className="flex items-center space-x-1">
            <span className="text-slate-500 text-[11px]">Role:</span>
            <select
              value={role}
              onChange={(e: any) => setRole(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-2 py-0.5 text-xs focus:outline-none"
            >
              <option value="judge">Judge (Explain Simply)</option>
              <option value="farmer">Farmer (Simple Words)</option>
              <option value="adjuster">Insurer / Adjuster</option>
              <option value="official">Patwari / Revenue Official</option>
              <option value="planner">District Planner</option>
            </select>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setLanguage('en')}
              className={`px-1.5 py-0.5 rounded text-[10px] ${
                language === 'en' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-1.5 py-0.5 rounded text-[10px] ${
                language === 'hi' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'
              }`}
            >
              हिंदी
            </button>
            <button
              onClick={() => setLanguage('hinglish')}
              className={`px-1.5 py-0.5 rounded text-[10px] ${
                language === 'hinglish' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'
              }`}
            >
              Hinglish
            </button>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] p-3.5 rounded-2xl leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-br-none shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
              }`}
            >
              <div className="whitespace-pre-line">{m.text}</div>

              {m.evidence && m.evidence.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                  <div className="font-semibold text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>Evidence Used:</span>
                  </div>
                  <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-slate-300">
                    {m.evidence.map((ev, eIdx) => (
                      <li key={eIdx}>{ev}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {m.aiMode && (
              <span className="text-[9px] text-slate-500 mt-1 px-1">
                AI Mode: {m.aiMode}
              </span>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            <span>Consulting multi-sensor evidence & knowledge base...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Contextual Chips Carousel */}
      {suggestedChips.length > 0 && (
        <div className="px-4 py-2 border-t border-slate-800/60 bg-slate-950/80 overflow-x-auto">
          <div className="flex items-center space-x-1.5 whitespace-nowrap">
            {suggestedChips.map((chip, cIdx) => (
              <button
                key={cIdx}
                onClick={() => handleSendMessage(chip)}
                className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-emerald-500 text-[11px] transition-all cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Bar */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center space-x-2">
        <button
          onClick={toggleSpeechRecognition}
          className={`p-2 rounded-lg border transition-all cursor-pointer ${
            isListening
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
          }`}
          title="Speech-to-Text Input"
        >
          {isListening ? <Mic className="w-4 h-4 text-rose-400" /> : <MicOff className="w-4 h-4" />}
        </button>

        <button
          onClick={toggleTextToSpeech}
          className={`p-2 rounded-lg border transition-all cursor-pointer ${
            isSpeaking
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
          }`}
          title="Toggle Text-to-Speech Voice Output"
        >
          {isSpeaking ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask TerraGuide in English, Hindi, or Hinglish..."
          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={!input.trim() || loading}
          className="p-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-700 text-white disabled:opacity-40 hover:from-emerald-500 hover:to-teal-600 transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
