import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type DemoMessage = { id: string; from: 'customer' | 'agent'; text: string };

const SCRIPT: DemoMessage[] = [
  { id: '1', from: 'customer', text: 'Preciso de um orçamento para 50 unidades' },
  { id: '2', from: 'agent', text: 'Olá! Vou verificar disponibilidade e preparar o orçamento.' },
  { id: '3', from: 'customer', text: 'Quando consigo receber a proposta?' },
  { id: '4', from: 'agent', text: 'Envio a proposta em até 2h — 50 unidades confirmadas em estoque.' },
];

const SIDEBAR_CHATS = [
  { name: 'Carlos Mendes', preview: 'Orçamento 50 unidades', active: true },
  { name: 'Mariana Costa', preview: 'Obrigada pelo atendimento!', active: false },
  { name: 'Roberto Alves', preview: 'Status do pedido #4521', active: false },
  { name: 'Fernanda Lima', preview: 'Produto XT-200 em estoque?', active: false },
];

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      className="ml-12 flex items-center gap-1 rounded-2xl rounded-tr-sm bg-teal-600/25 px-3.5 py-2.5"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-teal-200"
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.12, ease: 'easeInOut' }}
        />
      ))}
    </motion.div>
  );
}

export function LandingChatDemo() {
  const [messages, setMessages] = useState<DemoMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const [copilotVisible, setCopilotVisible] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState(0);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = chatScrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    let cancelled = false;

    const runLoop = async () => {
      while (!cancelled) {
        setMessages([]);
        setTyping(false);
        setCopilotVisible(false);
        setActiveSidebar(0);
        await wait(900);
        if (cancelled) return;

        for (const msg of SCRIPT) {
          if (cancelled) return;

          if (msg.from === 'agent') {
            setTyping(true);
            await wait(1300);
            if (cancelled) return;
            setTyping(false);
          } else {
            await wait(400);
            if (cancelled) return;
          }

          setMessages((prev) => [...prev, msg]);

          if (msg.id === '2') {
            setCopilotVisible(true);
          }

          await wait(msg.from === 'customer' ? 2200 : 1800);
        }

        await wait(4500);
      }
    };

    runLoop();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="relative mx-auto mt-16 max-w-5xl"
    >
      <div className="rounded-2xl border border-white/10 bg-gray-900/80 p-2 shadow-2xl shadow-teal-900/20 backdrop-blur">
        <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <div className="h-3 w-3 rounded-full bg-green-500/80" />
          </div>
          <span className="flex-1 text-center text-xs text-gray-500">app.pulsedesk.io/atendimento</span>
        </div>

        <div className="grid grid-cols-12 gap-2 p-4">
          {/* Lista de conversas */}
          <div className="col-span-3 space-y-2 rounded-lg bg-gray-800/50 p-3">
            {SIDEBAR_CHATS.map((chat, i) => (
              <motion.div
                key={chat.name}
                animate={{
                  scale: activeSidebar === i ? 1.02 : 1,
                  borderColor: activeSidebar === i ? 'rgba(20, 184, 166, 0.4)' : 'rgba(255,255,255,0)',
                }}
                transition={{ duration: 0.3 }}
                className={`flex items-center gap-2 rounded-lg border p-2 ${
                  activeSidebar === i ? 'bg-teal-600/15' : 'bg-gray-700/50'
                }`}
              >
                <div className="relative">
                  <div className={`h-8 w-8 rounded-full ${activeSidebar === i ? 'bg-teal-600/50' : 'bg-teal-600/30'}`} />
                  {activeSidebar === i && (
                    <motion.span
                      className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-gray-800 bg-green-400"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className={`h-2 rounded ${activeSidebar === i ? 'w-20 bg-gray-500' : 'w-16 bg-gray-600'}`} />
                  <motion.div
                    className="h-1.5 rounded bg-gray-700"
                    animate={{ width: activeSidebar === i ? '96%' : '75%' }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Chat central */}
          <div className="col-span-6 flex flex-col rounded-lg bg-gray-800/50 p-4">
            <div className="mb-4 flex items-center gap-2">
              <div className="relative">
                <div className="h-8 w-8 rounded-full bg-teal-600/40" />
                <motion.span
                  className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-400"
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              </div>
              <div>
                <div className="h-2 w-24 rounded bg-gray-600" />
                <div className="mt-1 flex items-center gap-1">
                  <span className="h-1.5 w-10 rounded bg-green-600/50" />
                  <motion.span
                    className="text-[9px] text-green-400/80"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    online
                  </motion.span>
                </div>
              </div>
            </div>

            <div className="relative flex-1 overflow-hidden">
              <div className="absolute inset-x-0 top-0 z-10 h-6 bg-gradient-to-b from-gray-800/80 to-transparent pointer-events-none" />
              <div
                ref={chatScrollRef}
                className="max-h-[140px] space-y-3 overflow-y-auto scroll-smooth pr-1 sm:max-h-[160px]"
              >
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 24, scale: 0.92 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -12, scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                      className={
                        msg.from === 'customer'
                          ? 'mr-12 rounded-2xl rounded-tl-sm bg-gray-700/60 p-3 text-xs text-gray-300'
                          : 'ml-12 rounded-2xl rounded-tr-sm bg-teal-600/30 p-3 text-xs text-teal-100'
                      }
                    >
                      {msg.text}
                    </motion.div>
                  ))}
                  {typing && <TypingIndicator key="typing" />}
                </AnimatePresence>
              </div>
              <div className="absolute inset-x-0 bottom-0 z-10 h-4 bg-gradient-to-t from-gray-800/80 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Copiloto */}
          <div className="col-span-3 space-y-2 rounded-lg bg-gray-800/50 p-3">
            <AnimatePresence>
              {copilotVisible && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="rounded-lg border border-violet-500/30 bg-violet-600/20 p-2 text-[10px] text-violet-200 shadow-lg shadow-violet-900/20"
                >
                  <motion.div
                    animate={{ rotate: [0, 8, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                    className="inline-block"
                  >
                    <Sparkles className="mb-1 h-3 w-3 text-violet-300" />
                  </motion.div>
                  Copiloto: Sugerir proposta em 2h
                </motion.div>
              )}
            </AnimatePresence>
            {[1, 0.75, 0.5].map((w, i) => (
              <motion.div
                key={i}
                className="h-2 rounded bg-gray-700"
                initial={{ width: 0, opacity: 0 }}
                animate={{
                  width: copilotVisible ? `${w * 100}%` : `${w * 60}%`,
                  opacity: copilotVisible ? 1 : 0.5,
                }}
                transition={{ delay: copilotVisible ? i * 0.15 : 0, duration: 0.5 }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
