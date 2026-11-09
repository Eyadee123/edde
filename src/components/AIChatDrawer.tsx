import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Send,
  Bot,
  User,
  HardDrive,
  Search,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { AIChatMessage, User as UserType } from '../types/drive';

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType | null;
  authToken: string | null;
  onNavigateToTab?: (tab: string) => void;
  onSearchRequest?: (query: string) => void;
}

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  authToken,
  onNavigateToTab,
  onSearchRequest,
}) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello ${currentUser ? currentUser.name : 'there'}! 👋 I am **Drive Copilot**, your Gemini AI assistant.

I can help you:
• Search across your documents and files
• Check your storage usage and explain the **15GB, 250GB, 450GB, 1TB & Unlimited** plans
• Explain cross-device synchronization
• Summarize or organize your cloud assets

How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        'How does cross-device sync work?',
        'Compare 250GB Pro vs 1TB Ultimate Pro',
        'Find all my starred files',
        'Show admin storage features',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: AIChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-4).map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });

      const data = await res.json();
      const reply = data.reply || 'I am here to help you navigate and optimize your Drive files.';

      const assistantMsg: AIChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_err_${Date.now()}`,
          sender: 'assistant',
          text: 'I encountered an issue connecting to Gemini. However, your Eyad Drive storage, cross-device sync, and preview features remain fully active!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (suggestion: string) => {
    if (suggestion.includes('Find all my starred files') && onNavigateToTab) {
      onNavigateToTab('starred');
    }
    handleSend(suggestion);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-2xl border-l border-gray-200 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="h-16 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm tracking-tight">Drive Copilot</h3>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-white text-[9px] font-bold">
                Gemini 3.8
              </span>
            </div>
            <p className="text-[11px] text-blue-100">Intelligent Cloud Assistant</p>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Close AI chat"
          className="p-1.5 rounded-full hover:bg-white/20 text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 shadow-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-xs'
                  : 'bg-gray-100/90 text-gray-800 rounded-bl-xs border border-gray-200/50'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans">{m.text}</div>
              <span
                className={`block text-[9px] mt-1.5 ${
                  m.sender === 'user' ? 'text-blue-200 text-right' : 'text-gray-400'
                }`}
              >
                {m.timestamp}
              </span>
            </div>

            {/* Suggested action chips */}
            {m.suggestedActions && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {m.suggestedActions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleChipClick(s)}
                    className="px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-[11px] font-medium transition cursor-pointer text-left"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-gray-500 text-xs">
            <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            </div>
            <span>Drive Copilot is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="p-3 border-t border-gray-200 bg-gray-50/50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your files or storage..."
            className="flex-1 py-2 px-3.5 text-xs bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            aria-label="Send message"
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-full transition cursor-pointer shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
