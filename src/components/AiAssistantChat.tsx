import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Bot,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  Send,
  Sparkles,
  User,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Budget, ChatMessage, Goal, Subscription, Transaction } from '../types';
import { generateAiResponse, getSuggestedQuestions } from '../utils/aiAssistant';

interface AiAssistantChatProps {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  subscriptions: Subscription[];
  currencySymbol?: string;
}

export const AiAssistantChat: React.FC<AiAssistantChatProps> = ({
  transactions,
  budgets,
  goals,
  subscriptions,
  currencySymbol = '₹',
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: `Hello! I'm **SpendSense AI**, your personal financial intelligence advisor. I have direct context on your ${transactions.length} logged transactions, active budgets, and savings milestones. Ask me anything about your finances or test one of the questions below!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggested = getSuggestedQuestions();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate smart thinking delay
    setTimeout(() => {
      const response = generateAiResponse(
        query,
        transactions,
        budgets,
        goals,
        subscriptions,
        currencySymbol
      );

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: response.suggestedActions,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20">
            <Sparkles className="h-5 w-5" />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                SpendSense AI
              </h3>
              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-extrabold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                Live Data Grounded
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous financial analysis & affordability calculations
            </p>
          </div>
        </div>

        <div className="hidden text-right text-xs text-slate-400 sm:block">
          Synced with {transactions.length} records
        </div>
      </div>

      {/* Suggested Query Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-100 px-4 py-2 text-xs dark:border-slate-800">
        <span className="shrink-0 font-bold text-slate-400 text-[11px]">Suggestions:</span>
        {suggested.map((s, idx) => (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            key={idx}
            type="button"
            onClick={() => handleSend(s)}
            className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 transition hover:border-purple-300 hover:bg-purple-50 hover:text-purple-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-purple-950/40"
          >
            {s}
          </motion.button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                    isUser
                      ? 'bg-slate-800 text-white dark:bg-slate-700'
                      : 'bg-purple-600 text-white'
                  }`}
                >
                  {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed md:max-w-[75%] ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-tr-xs dark:bg-purple-600'
                      : 'border border-slate-200/80 bg-slate-50 text-slate-800 rounded-tl-xs dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200'
                  }`}
                >
                  <div className="whitespace-pre-line font-normal">{msg.text}</div>
                  <div
                    className={`mt-1.5 text-[10px] ${
                      isUser ? 'text-slate-400 dark:text-purple-200 text-right' : 'text-slate-400 text-left'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-600 text-white">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-xs border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/60">
              <span className="h-2 w-2 animate-bounce rounded-full bg-purple-500" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-purple-500 [animation-delay:0.2s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-purple-500 [animation-delay:0.4s]" />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t border-slate-100 p-3 dark:border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask anything (e.g. 'Can I afford dinner for ₹800?', 'Tips to save money')..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isTyping}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 dark:focus:border-purple-400"
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white transition hover:bg-purple-700 disabled:opacity-40"
            title="Send Message"
          >
            <Send className="h-4 w-4" />
          </motion.button>
        </form>
      </div>
    </div>
  );
};
