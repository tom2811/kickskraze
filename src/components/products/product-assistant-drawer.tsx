'use client';

import { useState } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  routeType?: string;
  sources?: Array<{ source: string }>;
};

type ProductAssistantDrawerProps = {
  productId: string;
  productName: string;
  selectedSize?: string;
};

export function ProductAssistantDrawer({
  productId,
  productName,
  selectedSize,
}: ProductAssistantDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Ask me anything about ${productName} — sizing fit, stock availability, or Kickskraze authenticity & returns.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          productId,
          size: selectedSize,
        }),
      });

      if (!res.ok) {
        throw new Error('Assistant request failed');
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer,
          routeType: data.routeType,
          sources: data.sources,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Unable to connect to assistant right now. Please try again shortly.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full mt-3 py-3 px-4 border border-black/20 bg-neutral-50 hover:bg-black hover:text-white transition-colors flex items-center justify-between font-mono text-xs uppercase tracking-widest font-bold"
      >
        <span className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-emerald-500 animate-pulse" />
          Ask AI Assistant // Nexus
        </span>
        <span className="text-[10px] text-black/50 group-hover:text-white">[ OPEN → ]</span>
      </button>

      {/* Slide-over / Modal Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border-l border-black flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-4 border-b border-black flex items-center justify-between bg-neutral-50">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-black/40">
                  AI Grounded Seam // Nexus-bot
                </p>
                <h3 className="font-mono font-bold text-sm uppercase tracking-wider text-black">
                  Sneaker Concierge
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="font-mono text-xs font-bold px-2 py-1 border border-black hover:bg-black hover:text-white transition-colors"
              >
                [ CLOSE ✕ ]
              </button>
            </div>

            {/* Quick Prompts */}
            <div className="p-3 border-b border-black/10 bg-neutral-100 flex gap-2 overflow-x-auto text-[10px] font-mono">
              <button
                onClick={() => handleSend('Is this authentic?')}
                className="whitespace-nowrap px-2 py-1 border border-black/20 bg-white hover:border-black"
              >
                Authenticity check?
              </button>
              <button
                onClick={() => handleSend('What is the return policy?')}
                className="whitespace-nowrap px-2 py-1 border border-black/20 bg-white hover:border-black"
              >
                Return policy?
              </button>
              {selectedSize && (
                <button
                  onClick={() => handleSend(`Is size ${selectedSize} in stock?`)}
                  className="whitespace-nowrap px-2 py-1 border border-black/20 bg-white hover:border-black"
                >
                  Size {selectedSize} stock?
                </button>
              )}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 border ${
                    msg.role === 'user'
                      ? 'bg-black text-white border-black ml-8'
                      : 'bg-neutral-50 text-black border-black/20 mr-8'
                  }`}
                >
                  <p className="text-[10px] uppercase tracking-widest font-bold mb-1 opacity-60">
                    {msg.role === 'user' ? '// You' : '// Nexus Assistant'}
                    {msg.routeType && (
                      <span className="ml-2 px-1 border border-black/20 text-[9px]">
                        [{msg.routeType}]
                      </span>
                    )}
                  </p>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-black/10 text-[9px] text-black/50">
                      Sources: {msg.sources.map((s) => s.source).join(', ')}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="p-3 border border-black/20 bg-neutral-50 mr-8 font-mono text-xs animate-pulse">
                  <span className="text-[10px] uppercase tracking-widest text-black/40">
                    {'// Nexus is thinking...'}
                  </span>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 border-t border-black flex gap-2 bg-neutral-50"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about size, fit, authenticity..."
                className="flex-1 px-3 py-2 border border-black/30 font-mono text-xs focus:outline-none focus:border-black bg-white"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-4 py-2 bg-black text-white font-mono text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
