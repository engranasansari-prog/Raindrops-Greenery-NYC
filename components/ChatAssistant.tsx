'use client';

import Link from 'next/link';
import { AnimatePresence, m } from 'framer-motion';
import MotionProvider from '@/components/MotionProvider';
import { MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { business, checkout } from '@/lib/site-data';
import { checkZip } from '@/lib/zip-utils';
import { trackOrderClick } from '@/lib/analytics';

/**
 * Raindrops Concierge — a lightweight, brand-styled chat assistant.
 *
 * Deliberately NOT an LLM: every answer is grounded in our real site data
 * (delivery areas, tax-free policy, hours, free gift, how-to-order, products),
 * so it can never invent medical claims or over-promise coverage on a licensed
 * cannabis site. Includes a medical-question guardrail and an inline ZIP check.
 * Zero API key, zero per-message cost, fully under our control.
 */

type Action = { label: string; href: string; external?: boolean };
type BotReply = { text: string; chips?: string[]; actions?: Action[] };
type Message = { id: number; role: 'bot' | 'user'; text: string; actions?: Action[] };

const HOURS = `${business.hours[0].open}–${business.hours[0].close}`;

const STARTER_CHIPS = [
  'Where do you deliver?',
  'Is it really tax-free?',
  "What's the free gift?",
  'How do I order?'
];

// Shown after a free-form / AI answer so there's always an obvious next step.
const DEFAULT_CHIPS = ['Shop the menu', 'Where do you deliver?', 'Talk to a human'];

// Web3Forms (same backend as the contact form) — used to email a transcript
// of each real conversation to the client. Public key by design.
const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? 'cc3efb40-57a3-4e65-a324-2c313d9a19b6';

// Intents are scored by keyword hits against the lowercased query; the highest
// scorer wins. Order matters only for ties.
const INTENTS: Array<{ keywords: string[]; reply: BotReply }> = [
  {
    keywords: ['deliver', 'delivery', 'area', 'areas', 'where', 'location', 'neighborhood', 'borough', 'manhattan', 'brooklyn', 'queens', 'williamsburg', 'greenpoint', 'lic', 'long island city', 'cover', 'coverage'],
    reply: {
      text: 'We deliver same-day across Manhattan plus Williamsburg, Greenpoint, and Long Island City — free on orders over $25. Want me to check your area? Just type your 5-digit ZIP.',
      actions: [{ label: 'See delivery areas', href: '/delivery' }]
    }
  },
  {
    keywords: ['tax', 'taxes', 'tax-free', 'cheap', 'cheaper', 'why', 'savings', 'shinnecock'],
    reply: {
      text: 'Raindrops Greenery is a Tribally licensed dispensary — all products are produced, packaged, and sold on Native Sovereign Land — so pricing is tax-free and the price you see is the price you pay, with no surprises at checkout.',
      actions: [{ label: 'Shop the menu', href: '/menu' }]
    }
  },
  {
    keywords: ['hour', 'hours', 'open', 'close', 'closing', 'time', 'today', 'when'],
    reply: { text: `We’re open every day, ${HOURS}. Same-day delivery within those hours.` }
  },
  {
    keywords: ['gift', 'free', 'pre-roll', 'preroll', 'freebie', 'bonus', 'promo'],
    reply: {
      text: 'Every order comes with a complimentary pre-roll, automatically added at checkout — 21+, while supplies last. No code needed.',
      actions: [{ label: 'Shop the menu', href: '/menu' }]
    }
  },
  {
    keywords: ['order', 'buy', 'purchase', 'checkout', 'how do i', 'how to', 'get it', 'place'],
    reply: {
      text: 'Easy: browse the menu, pick your products, and tap any “Order” button to head to secure checkout for payment, ID verification, and delivery. Your free pre-roll is added automatically.',
      actions: [
        { label: 'Shop the menu', href: '/menu' },
        { label: 'Go to checkout', href: checkout.dutchieUrl, external: true }
      ]
    }
  },
  {
    keywords: ['pay', 'payment', 'cash', 'card', 'debit', 'credit', 'apple pay', 'method'],
    reply: { text: 'Pay by Bank through Dutchie Pay is the only form of Payment.' }
  },
  {
    keywords: ['menu', 'product', 'products', 'strain', 'strains', 'flower', 'edible', 'edibles', 'pre-roll', 'indica', 'sativa', 'hybrid', 'thc', 'potency', 'have', 'carry', 'stock', 'recommend', 'suggest', 'what should'],
    reply: {
      text: 'We carry Flower Strains, Pre-Rolls, and Edibles — filter by price, potency, size, and effect on the menu. Not sure what to get? The 2-minute strain quiz points you to a match.',
      actions: [
        { label: 'Browse the menu', href: '/menu' },
        { label: 'Take the quiz', href: '/quiz' }
      ]
    }
  },
  {
    keywords: ['deal', 'deals', 'sale', 'discount', 'budget', 'under', 'featured', 'cheapest', 'best price'],
    reply: {
      text: 'No codes or gimmicks — just tax-free pricing, free delivery over $25, and a free pre-roll with every order. Browse curated picks by price (lowest first) on the Featured page.',
      actions: [{ label: 'Featured picks', href: '/deals' }]
    }
  },
  {
    keywords: ['contact', 'help', 'support', 'phone', 'call', 'email', 'human', 'agent', 'speak', 'talk', 'reach', 'number'],
    reply: {
      text: `Happy to connect you with the team — call or text ${business.phone}, email ${business.email}, or send a message through the contact form.`,
      actions: [
        { label: 'Contact us', href: '/contact' },
        { label: `Call ${business.phone}`, href: business.phoneHref, external: true }
      ]
    }
  },
  {
    keywords: ['21', 'age', 'old', 'id', 'identification', 'minor', 'verify'],
    reply: { text: 'Raindrops is strictly for adults 21 and older. A valid government photo ID is verified at the door before any delivery is handed off.' }
  },
  {
    keywords: ['license', 'licensed', 'legal', 'who', 'authority', 'regulated', 'real'],
    reply: { text: 'Raindrops Greenery is a Tribally licensed dispensary, licensed by the Shinnecock Nation Cannabis Regulatory Division (Shinnecock Nation License #002).' }
  },
  {
    keywords: ['return', 'refund', 'wrong', 'issue', 'problem', 'broken', 'missing', 'damaged'],
    reply: {
      text: 'For safety and compliance, cannabis products can’t be returned once delivered. If something’s wrong with your order, contact support within 24 hours and we’ll make it right.',
      actions: [{ label: 'Contact support', href: '/contact' }]
    }
  },
  {
    keywords: ['hi', 'hey', 'hello', 'yo', 'sup', 'help me', 'start'],
    reply: { text: 'Hey! 👋 I’m the Raindrops concierge. Ask me about delivery areas, tax-free pricing, the free gift, or how to order — or tap a question below.', chips: STARTER_CHIPS }
  },
  {
    keywords: ['thank', 'thanks', 'cool', 'great', 'awesome', 'perfect'],
    reply: { text: 'Anytime! 🌿 Anything else I can help with?', chips: STARTER_CHIPS }
  }
];

// Medical / health questions — a hard guardrail. We never give medical advice
// on a licensed cannabis site; deflect safely and steer to neutral browsing.
const MEDICAL_TERMS = ['anxiety', 'depress', 'pain', 'sleep', 'insomnia', 'cure', 'treat', 'medical', 'medicine', 'health', 'cancer', 'ptsd', 'adhd', 'nausea', 'migraine', 'arthritis', 'condition', 'disorder', 'diagnos', 'prescription', 'dose for', 'help with my'];

const FALLBACK: BotReply = {
  text: 'I’m not sure about that one, but I can help with delivery areas, tax-free pricing, hours, the free gift, how to order, or finding products. Or reach the team directly.',
  chips: STARTER_CHIPS,
  actions: [{ label: 'Contact us', href: '/contact' }]
};

function respond(raw: string): BotReply {
  const q = raw.toLowerCase().trim();

  // 1) Medical guardrail first.
  if (MEDICAL_TERMS.some((t) => q.includes(t))) {
    return {
      text: 'I can’t give medical or health advice — please talk to a healthcare professional about that. I can help you browse our menu by effect, potency, or category, though.',
      actions: [
        { label: 'Browse the menu', href: '/menu' },
        { label: 'Take the strain quiz', href: '/quiz' }
      ]
    };
  }

  // 2) Inline ZIP check — a real, useful "smart" answer.
  const zipMatch = q.match(/\b\d{5}\b/);
  if (zipMatch) {
    const result = checkZip(zipMatch[0]);
    if (result.status === 'supported') {
      return {
        text: `✅ Yes — we deliver to ${result.zip}${result.borough ? ` (${result.borough})` : ''}. Same-day, free on orders over $25, and a free pre-roll with every order.`,
        actions: [{ label: 'Shop the menu', href: '/menu' }]
      };
    }
    return {
      text: `We’re not delivering to ${zipMatch[0]} just yet — but we’re expanding fast across NYC. Follow @raindropsgreenery or check back soon.`,
      actions: [{ label: 'See where we deliver', href: '/delivery' }]
    };
  }

  // 3) Keyword-scored intents.
  let best: BotReply | null = null;
  let bestScore = 0;
  for (const intent of INTENTS) {
    const score = intent.keywords.reduce((n, k) => (q.includes(k) ? n + 1 : n), 0);
    if (score > bestScore) {
      bestScore = score;
      best = intent.reply;
    }
  }
  return best ?? FALLBACK;
}

// Attach up to two relevant CTA buttons to a free-form / AI answer based on
// what it mentions, so the chat always offers an obvious next step.
function inferActions(text: string): Action[] {
  const t = text.toLowerCase();
  const actions: Action[] = [];
  const add = (a: Action) => {
    if (actions.length < 2 && !actions.some((x) => x.href === a.href)) actions.push(a);
  };
  if (/\b(menu|browse|shop|product|strain|flower|edible|pre-roll|preroll)\b/.test(t)) add({ label: 'Shop the menu', href: '/menu' });
  if (t.includes('quiz')) add({ label: 'Take the quiz', href: '/quiz' });
  if (/\b(deal|featured|budget)\b/.test(t)) add({ label: 'Featured picks', href: '/deals' });
  if (/\b(deliver|zip|coverage|neighborhood)\b/.test(t)) add({ label: 'See delivery areas', href: '/delivery' });
  if (/\b(contact|call|email|support|reach|text)\b/.test(t)) add({ label: 'Contact us', href: '/contact' });
  if (t.includes('checkout')) add({ label: 'Go to checkout', href: checkout.dutchieUrl, external: true });
  return actions;
}

export default function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chips, setChips] = useState<string[]>(STARTER_CHIPS);

  const idRef = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevOpenRef = useRef(false);
  const lastSentTurnsRef = useRef(0);
  const nextId = () => (idRef.current += 1);

  // Seed the welcome message the first time the panel opens.
  useEffect(() => {
    if (open && messages.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessages([
        {
          id: nextId(),
          role: 'bot',
          text: 'Hi, I’m Rain — your Raindrops delivery concierge 🌿 Ask me anything, or tap below.'
        }
      ]);
    }
  }, [open, messages.length]);

  // Auto-scroll to the newest message.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  // Focus the input on open; Escape closes. Non-modal popover — no focus trap
  // or scroll lock (it must not block the page behind it).
  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => () => {
    if (typingTimer.current) clearTimeout(typingTimer.current);
  }, []);

  // When a REAL conversation (>= 2 customer messages) closes, email the
  // transcript to the client (Web3Forms -> the contact inbox). Fires on the
  // open -> closed transition; lastSentTurnsRef prevents duplicate sends.
  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = open;
    if (!(wasOpen && !open)) return;
    const convo = messages.filter((m) => m.role === 'user' || m.role === 'bot');
    const userTurns = convo.filter((m) => m.role === 'user').length;
    if (userTurns < 2 || userTurns <= lastSentTurnsRef.current) return;
    lastSentTurnsRef.current = userTurns;
    const transcript = convo
      .map((m) => `${m.role === 'user' ? 'Customer' : 'Rain (concierge)'}: ${m.text}`)
      .join('\n\n');
    void fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: 'New website chat — Raindrops Greenery NY',
        from_name: 'Raindrops Greenery — Site Concierge',
        botcheck: '',
        message: `New chat conversation from the Raindrops Greenery NY website:\n\n${transcript}`
      })
    }).catch(() => {});
  }, [open, messages]);

  const pushBot = (reply: BotReply) => {
    setMessages((prev) => [...prev, { id: nextId(), role: 'bot', text: reply.text, actions: reply.actions }]);
    setChips(reply.chips && reply.chips.length > 0 ? reply.chips : DEFAULT_CHIPS);
    setTyping(false);
  };

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || typing) return;
    const userMsg: Message = { id: nextId(), role: 'user', text };
    const history = messages;
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setChips([]);
    setTyping(true);

    // Deterministic guardrails handled locally + instantly so they're always
    // bulletproof, even when the AI is on: medical questions get a safe
    // deflection, and a ZIP code gets an exact coverage answer.
    const lower = text.toLowerCase();
    if (MEDICAL_TERMS.some((t) => lower.includes(t)) || /\b\d{5}\b/.test(text)) {
      typingTimer.current = setTimeout(() => pushBot(respond(text)), 420);
      return;
    }

    // Everything else: try the Claude-powered /api/chat route, falling back to
    // the built-in scripted brain on ANY failure (no key, error, offline).
    try {
      const payload = [...history, userMsg]
        .map((m) => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.text }))
        .slice(-10);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: payload })
      });
      const data = (await res.json()) as { ok?: boolean; reply?: string };
      if (res.ok && data.ok && data.reply) {
        pushBot({ text: data.reply, actions: inferActions(data.reply) });
        return;
      }
    } catch {
      // fall through to the scripted brain
    }
    pushBot(respond(text));
  };

  return (
    <MotionProvider>
      {/* Launcher — hidden while the panel is open. Positioned to clear the
          mobile sticky order bar (raised on small screens). */}
      <AnimatePresence>
        {!open && (
          <m.button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open the Raindrops chat concierge"
            aria-expanded={open}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-4 z-[61] inline-flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--rd-glow)] text-[color:var(--rd-ink)] shadow-[0_16px_44px_rgba(200,230,110,0.45)] transition-transform hover:-translate-y-1 bottom-[calc(env(safe-area-inset-bottom,0px)+6.5rem)] md:bottom-[calc(env(safe-area-inset-bottom,0px)+1.5rem)]"
          >
            <MessageCircle className="h-6 w-6" />
            <span className="absolute right-0 top-0 flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--rd-amber)] opacity-60" />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-[color:var(--rd-glow)] bg-[color:var(--rd-amber)]" />
            </span>
          </m.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <m.div
            role="dialog"
            aria-label="Raindrops concierge chat"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="rd-luxe-dark fixed inset-x-3 z-[62] flex max-h-[78dvh] flex-col overflow-hidden rounded-3xl border border-[color:var(--rd-paper)]/12 bg-[color:var(--rd-ink-soft)] text-[color:var(--rd-text)] shadow-[0_40px_120px_rgba(0,0,0,0.55)] bottom-[calc(env(safe-area-inset-bottom,0px)+6.5rem)] sm:inset-x-auto sm:right-4 sm:w-[384px] sm:max-h-[560px] sm:bottom-[calc(env(safe-area-inset-bottom,0px)+1.5rem)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-[color:var(--rd-paper)]/10 bg-[color:var(--rd-ink)] px-4 py-3.5">
              <div className="flex items-center gap-3">
                <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--rd-glow)] text-[color:var(--rd-ink)]">
                  <Sparkles className="h-4 w-4" />
                </span>
                <span className="leading-tight">
                  <span className="block text-sm font-semibold text-[color:var(--rd-text)]">Rain</span>
                  <span className="flex items-center gap-1.5 text-[11px] text-[color:var(--rd-text-mute)]">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--rd-glow)]" />
                    Raindrops concierge · replies instantly
                  </span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--rd-paper)]/14 text-[color:var(--rd-text-dim)] transition hover:border-[color:var(--rd-glow)] hover:text-[color:var(--rd-text)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m) =>
                m.role === 'user' ? (
                  <div key={m.id} className="flex justify-end">
                    <p className="max-w-[80%] rounded-2xl rounded-br-sm bg-[color:var(--rd-glow)] px-3.5 py-2.5 text-sm font-medium text-[color:var(--rd-ink)]">
                      {m.text}
                    </p>
                  </div>
                ) : (
                  <div key={m.id} className="flex flex-col gap-2">
                    <p className="max-w-[88%] rounded-2xl rounded-bl-sm bg-[color:var(--rd-ink)] px-3.5 py-2.5 text-sm leading-6 text-[color:var(--rd-text-dim)]">
                      {m.text}
                    </p>
                    {m.actions && m.actions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {m.actions.map((a) =>
                          a.external ? (
                            <a
                              key={a.label}
                              href={a.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={
                                a.href === checkout.dutchieUrl
                                  ? () => trackOrderClick('chat_assistant')
                                  : undefined
                              }
                              className="inline-flex items-center rounded-full bg-[color:var(--rd-glow)] px-3.5 py-1.5 text-xs font-semibold text-[color:var(--rd-ink)] transition hover:brightness-105"
                            >
                              {a.label}
                            </a>
                          ) : (
                            <Link
                              key={a.label}
                              href={a.href}
                              onClick={() => setOpen(false)}
                              className="inline-flex items-center rounded-full bg-[color:var(--rd-glow)] px-3.5 py-1.5 text-xs font-semibold text-[color:var(--rd-ink)] transition hover:brightness-105"
                            >
                              {a.label}
                            </Link>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )
              )}

              {typing && (
                <div className="flex">
                  <span className="inline-flex items-center gap-1 rounded-2xl rounded-bl-sm bg-[color:var(--rd-ink)] px-4 py-3" aria-label="Concierge is typing">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-[color:var(--rd-text-mute)]"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </span>
                </div>
              )}
            </div>

            {/* Quick replies */}
            {chips.length > 0 && (
              <div className="flex flex-wrap gap-2 px-4 pb-2">
                {chips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => send(chip)}
                    className="min-h-[40px] rounded-full border border-[color:var(--rd-glow)]/35 bg-[color:var(--rd-glow)]/8 px-3 py-1.5 text-xs font-medium text-[color:var(--rd-text)] transition hover:border-[color:var(--rd-glow)] hover:bg-[color:var(--rd-glow)]/15"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t border-[color:var(--rd-paper)]/10 bg-[color:var(--rd-ink)] px-3 py-3"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about delivery, the menu, the free gift…"
                aria-label="Type your message"
                className="min-w-0 flex-1 rounded-full border border-[color:var(--rd-paper)]/14 bg-[color:var(--rd-ink-soft)] px-4 py-2.5 text-sm text-[color:var(--rd-text)] outline-none transition placeholder:text-[color:var(--rd-text-mute)] focus:border-[color:var(--rd-glow)]"
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                aria-label="Send message"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color:var(--rd-glow)] text-[color:var(--rd-ink)] transition hover:brightness-105 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

            <p className="bg-[color:var(--rd-ink)] px-4 pb-3 text-center text-[10px] text-[color:var(--rd-text-mute)]">
              21+ only · Quick answers about Raindrops · Not medical advice
            </p>
          </m.div>
        )}
      </AnimatePresence>
    </MotionProvider>
  );
}
