import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, User, Shield, CheckCheck, Wifi, WifiOff } from 'lucide-react';
import {
  getSocket,
  registerListener,
  joinConsultationRoom,
  sendConsultationMessage,
  sendTypingStatus,
  ChatMessage,
} from '../../services/socket';

interface LiveConsultationDrawerProps {
  currentUser: {
    userId: string;
    name: string;
    role: 'dieter' | 'nutritionist' | 'admin';
  };
  recipientName?: string;
  recipientRole?: string;
  roomId?: string;
}

export const LiveConsultationDrawer: React.FC<LiveConsultationDrawerProps> = ({
  currentUser,
  recipientName = currentUser.role === 'dieter' ? 'Maya Lin, Clinical RD' : 'Aarav Mehta (Client)',
  recipientRole = currentUser.role === 'dieter' ? 'Lead Clinical Nutritionist' : 'Dieter',
  roomId = 'consultation-aarav-maya',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-msg-1',
      roomId,
      sender: {
        userId: 'nutritionist-1',
        name: 'Maya Lin, Clinical RD',
        role: 'nutritionist',
      },
      message: 'Hello! I reviewed your breakfast bowl log. Outstanding protein balance and fiber density today. How are you feeling?',
      timestamp: '09:15 AM',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const socket = getSocket();

    if (socket.connected) {
      setIsConnected(true);
    }

    // Join consultation room
    joinConsultationRoom(roomId, currentUser);

    // Listen for incoming messages (dual-engine: Socket.IO + Browser Cross-Tab)
    const handleMessageReceived = (msg: ChatMessage) => {
      if (msg.roomId === roomId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    };

    // Listen for typing indicator
    const handleUserTyping = (data: { roomId?: string; sender: { userId: string; name: string }; isTyping: boolean }) => {
      if (data.sender.userId !== currentUser.userId && (!data.roomId || data.roomId === roomId)) {
        setIsPeerTyping(data.isTyping);
      }
    };

    // Listen for connection state changes
    const handleStatus = (status: { connected: boolean }) => {
      setIsConnected(status.connected);
    };

    const unregMsg = registerListener('consultation:message_received', handleMessageReceived);
    const unregTyping = registerListener('consultation:user_typing', handleUserTyping);
    const unregStatus = registerListener('connection:status', handleStatus);

    return () => {
      unregMsg();
      unregTyping();
      unregStatus();
    };
  }, [roomId, currentUser]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isPeerTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    // Emit typing event
    sendTypingStatus(roomId, { userId: currentUser.userId, name: currentUser.name }, true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(roomId, { userId: currentUser.userId, name: currentUser.name }, false);
    }, 1500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const text = inputText.trim();
    setInputText('');

    // Clear typing
    sendTypingStatus(roomId, { userId: currentUser.userId, name: currentUser.name }, false);

    // Send through unified real-time layer (Socket.IO + Cross-Tab)
    sendConsultationMessage(roomId, text, currentUser);
  };

  const handleSimulateReply = () => {
    const isDieter = currentUser.role === 'dieter';
    const simulatedSender: ChatMessage['sender'] = isDieter
      ? { userId: 'nutritionist-maya', name: 'Maya Lin, Clinical RD', role: 'nutritionist' }
      : { userId: 'dieter-aarav', name: 'Aarav Mehta', role: 'dieter' };

    const promptResponses = isDieter
      ? [
          'Excellent! Keep your hydration above 2.0L this afternoon before the workout session.',
          'Your macronutrient rhythm is looking right on track today. Great work!',
          'I recommend adding 15g of pumpkin seeds to your evening salad for zinc and magnesium.',
        ]
      : [
          'Thank you, Dr. Maya! Just drank my 5th glass of water and logged lunch.',
          'Can I substitute roasted chickpeas instead of salmon for dinner?',
          'Feeling very energetic today, energy dip at 3 PM is completely gone!',
        ];

    const randomResponse = promptResponses[Math.floor(Math.random() * promptResponses.length)];

    // Send through socket or fallback
    sendConsultationMessage(roomId, randomResponse, simulatedSender);

    const socket = getSocket();
    if (!socket.connected) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `sim-${Date.now()}`,
            roomId,
            sender: simulatedSender,
            message: randomResponse,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }, 300);
    }
  };

  return (
    <>
      {/* Floating Trigger Button in bottom-right corner */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-forest text-ivory shadow-lift border border-lime/30 hover:border-lime transition-all duration-300 group"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 text-lime transition-transform group-hover:rotate-6" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-lime rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-lime rounded-full" />
          </div>
          <div className="text-left font-sans">
            <span className="text-xs font-bold tracking-tight block">Live Consultation</span>
            <span className="text-[10px] text-ivory/60 flex items-center gap-1">
              {isConnected ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                  Socket.IO Active
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Local / Offline
                </>
              )}
            </span>
          </div>
        </motion.button>
      </div>

      {/* Slide-in Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-6 z-50 w-full max-w-sm sm:max-w-md h-[560px] bg-ivory rounded-3xl shadow-lift border border-forest/15 flex flex-col overflow-hidden text-forest selection:bg-lime selection:text-forest"
          >
            {/* Header */}
            <div className="bg-forest text-ivory p-4 px-5 flex items-center justify-between border-b border-forest-light/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-lime text-forest flex items-center justify-center font-bold font-serif text-sm">
                  {currentUser.role === 'dieter' ? 'ML' : 'AM'}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base tracking-tight flex items-center gap-1.5">
                    {recipientName}
                    <Shield className="w-3.5 h-3.5 text-lime" />
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-ivory/70">
                    <span className="w-2 h-2 rounded-full bg-lime inline-block" />
                    <span>{recipientRole}</span>
                    <span className="text-ivory/40">•</span>
                    <span className="font-mono text-[10px] text-lime">Room: {roomId.slice(0, 16)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  title={isConnected ? 'Socket.IO Server Connected' : 'Disconnected from WebSocket'}
                  className="p-1 rounded text-ivory/60 hover:text-ivory transition-colors"
                >
                  {isConnected ? <Wifi className="w-4 h-4 text-lime" /> : <WifiOff className="w-4 h-4 text-amber-400" />}
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-ivory/10 hover:bg-ivory/20 text-ivory flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Socket Status Banner */}
            <div className="bg-forest-light/10 border-b border-forest/5 px-4 py-1.5 flex items-center justify-between text-[11px]">
              <span className="text-forest/70 font-mono">
                Real-Time WebSocket • {isConnected ? '⚡ Live Sync' : '🔄 Standby'}
              </span>
              <button
                type="button"
                onClick={handleSimulateReply}
                className="text-[10px] uppercase font-bold tracking-wider text-forest/70 hover:text-forest bg-forest/5 hover:bg-forest/10 px-2 py-0.5 rounded transition-colors"
              >
                + Demo Peer Reply
              </button>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-ivory-light">
              <div className="text-center my-1">
                <span className="text-[10px] font-mono tracking-widest uppercase bg-forest/5 text-forest/60 px-3 py-1 rounded-full">
                  Clinical Consultation Session Active
                </span>
              </div>

              {messages.map((msg) => {
                const isMine = msg.sender.userId === currentUser.userId;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10px] font-bold text-forest/60">
                        {isMine ? 'You' : msg.sender.name}
                      </span>
                      <span className="text-[9px] text-forest/40">{msg.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                        isMine
                          ? 'bg-forest text-ivory rounded-br-none border border-forest/10'
                          : 'bg-white text-forest rounded-bl-none border border-forest/10'
                      }`}
                    >
                      {msg.message}
                    </div>

                    {isMine && (
                      <span className="text-[9px] text-forest/40 flex items-center gap-0.5 mt-0.5 px-1">
                        <CheckCheck className="w-3 h-3 text-lime" /> Delivered
                      </span>
                    )}
                  </div>
                );
              })}

              {isPeerTyping && (
                <div className="flex items-center gap-2 text-forest/60 text-xs px-2 py-1">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-forest/60 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-forest/60 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-forest/60 animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span className="text-[11px] italic font-sans">{recipientName} is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Pills */}
            <div className="px-3 py-1.5 bg-ivory border-t border-forest/5 flex gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
              <button
                type="button"
                onClick={() => setInputText('How are my daily macronutrient ratios looking?')}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-forest/5 hover:bg-forest/10 text-forest/70 transition-colors text-[11px]"
              >
                📊 Review my macros
              </button>
              <button
                type="button"
                onClick={() => setInputText('Logged my water intake for today!')}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-forest/5 hover:bg-forest/10 text-forest/70 transition-colors text-[11px]"
              >
                💧 Water update
              </button>
              <button
                type="button"
                onClick={() => setInputText('Can you suggest a nutrient-dense snack?')}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-forest/5 hover:bg-forest/10 text-forest/70 transition-colors text-[11px]"
              >
                🥑 Snack advice
              </button>
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-forest/10 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                placeholder="Type a clinical message..."
                className="flex-1 px-4 py-2.5 bg-ivory-light rounded-full text-xs sm:text-sm text-forest placeholder:text-forest/40 focus:outline-none focus:ring-2 focus:ring-forest/20 border border-forest/10"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-10 h-10 rounded-full bg-lime text-forest disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold shadow-subtle hover:scale-105 active:scale-95 transition-all"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LiveConsultationDrawer;

