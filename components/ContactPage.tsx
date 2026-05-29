'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Check, Clock, Copy, Mail, MessageSquare, Phone, ShieldCheck } from 'lucide-react';
import SiteChrome, { OrderButton } from '@/components/SiteChrome';
import Breadcrumbs from '@/components/Breadcrumbs';
import { business, social } from '@/lib/site-data';

const topics = ['Order help', 'Delivery question', 'Wholesale / brand partnership', 'Press', 'Other'];

function ContactStat({ icon: Icon, label, value, href }: { icon: typeof Phone; label: string; value: string; href?: string }) {
  const className = "group block rounded-2xl border border-[color:var(--rd-paper)]/10 bg-[color:var(--rd-ink-soft)] p-5 transition-[transform,border-color,box-shadow] duration-500 [transition-timing-function:var(--ease-out)] hover:-translate-y-0.5 hover:border-[color:var(--rd-glow)]/40 hover:shadow-[0_22px_60px_rgba(200,230,110,0.10)]";
  const content = (
    <>
      <Icon className="h-6 w-6 text-[color:var(--rd-glow)]" />
      <p className="mt-4 rd-eyebrow text-[color:var(--rd-text-mute)]">{label}</p>
      <p className="mt-2 text-sm font-medium leading-6 text-[color:var(--rd-text)]">{value}</p>
    </>
  );
  if (href) {
    return (
      <a href={href} className={className}>
        {content}
      </a>
    );
  }
  return <div className={className}>{content}</div>;
}

// Web3Forms access key — delivers each contact submission straight to the
// company inbox (nycraindrops@gmail.com) with NO mail-client popup. The key is
// public by design (it can only send to the address it was registered with).
// Set it via NEXT_PUBLIC_WEB3FORMS_KEY in Vercel, or hardcode the default below
// once issued. While it's unset, the form gracefully falls back to a mailto:
// draft so it's never dead.
const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? '';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState(topics[0]);
  const [message, setMessage] = useState('');

  const send = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    setError(false);

    // No delivery key configured yet → fall back to the visitor's mail client
    // so the form still does something. (Auto-upgrades to real inbox delivery
    // the moment NEXT_PUBLIC_WEB3FORMS_KEY is set.)
    if (!WEB3FORMS_KEY) {
      const subject = encodeURIComponent(`[${topic}] Raindrops NY — ${name}`);
      const body = encodeURIComponent(
        `${message}\n\n— — —\nFrom: ${name} <${email}>\nTopic: ${topic}\nSent via ${business.domain} contact form`
      );
      if (typeof window !== 'undefined') {
        window.location.href = `${business.emailHref}?subject=${subject}&body=${body}`;
      }
      setSent(true);
      return;
    }

    // Real delivery — POST to Web3Forms, which emails it to the company inbox.
    setSending(true);
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `[${topic}] Raindrops NY — ${name}`,
          from_name: 'Raindrops Greenery — website contact',
          name,
          email,
          topic,
          message,
          botcheck: '' // honeypot; genuine submissions leave this empty
        })
      });
      const data = (await res.json()) as { success?: boolean };
      if (data.success) {
        setSent(true);
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(business.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard unavailable — silent fallback (the address is still
      // displayed inline so the customer can long-press to copy).
    }
  };

  const inputClass =
    'h-12 rounded-full border border-[color:var(--rd-paper)]/14 bg-[color:var(--rd-ink)]/55 px-4 text-sm font-medium text-[color:var(--rd-text)] outline-none transition placeholder:text-[color:var(--rd-text-mute)] hover:border-[color:var(--rd-glow)]/30 focus:border-[color:var(--rd-glow)]/60';

  return (
    <SiteChrome>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[color:var(--rd-ink)] text-[color:var(--rd-text)]">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              'radial-gradient(ellipse at top left, rgba(200,230,110,0.10), transparent 55%), radial-gradient(ellipse at bottom right, rgba(45,74,58,0.45), transparent 60%)'
          }}
        />
        <div className="luxury-shell relative grid gap-10 py-12 sm:py-16 lg:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <Breadcrumbs items={[{ label: 'Contact' }]} tone="dark" />
            <p className="mt-5 rd-eyebrow text-[color:var(--rd-glow)]">Get in touch</p>
            <h1 className="mt-4 text-[color:var(--rd-text)]">
              Real humans <span className="italic">answer here.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--rd-text-dim)] sm:text-lg sm:leading-8">
              Questions about a delivery, a product, or a partnership? Use the form, give us a call, or message us on social. We answer most messages within one business day.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <ContactStat icon={Phone} label="Phone" value={business.phone} href={business.phoneHref} />
            <ContactStat icon={Mail} label="Support" value={business.email} href={business.emailHref} />
            <ContactStat icon={MessageSquare} label="Press" value={business.pressEmail} href={business.pressEmailHref} />
            <ContactStat icon={ShieldCheck} label="Licensing" value={business.licensingAuthority} />
          </div>
        </div>
      </section>

      {/* Form + sidebar */}
      <section className="border-t border-[color:var(--rd-paper)]/8 bg-[color:var(--rd-ink)] py-14 text-[color:var(--rd-text)] sm:py-20">
        <div className="luxury-shell grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <form
            onSubmit={send}
            className="rounded-3xl border border-[color:var(--rd-paper)]/10 bg-[color:var(--rd-ink-soft)] p-6 shadow-[0_24px_72px_rgba(0,0,0,0.28)] sm:p-9"
          >
            <p className="rd-eyebrow text-[color:var(--rd-glow)]">Send a message</p>
            <h2
              className="mt-3 text-[color:var(--rd-text)]"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(1.6rem, 2.4vw, 2.2rem)', letterSpacing: '-0.02em' }}
            >
              Tell us what <span className="italic">you need.</span>
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="rd-eyebrow text-[color:var(--rd-text-mute)]">Your name</span>
                <input required value={name} onChange={(event) => setName(event.target.value)} className={inputClass} />
              </label>
              <label className="grid gap-2">
                <span className="rd-eyebrow text-[color:var(--rd-text-mute)]">Email</span>
                <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} />
              </label>
              <label className="grid gap-2 md:col-span-2">
                <span className="rd-eyebrow text-[color:var(--rd-text-mute)]">Topic</span>
                <select value={topic} onChange={(event) => setTopic(event.target.value)} className={inputClass}>
                  {topics.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 md:col-span-2">
                <span className="rd-eyebrow text-[color:var(--rd-text-mute)]">Message</span>
                <textarea
                  required
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={5}
                  className="rounded-2xl border border-[color:var(--rd-paper)]/14 bg-[color:var(--rd-ink)]/55 p-4 text-sm leading-7 text-[color:var(--rd-text)] outline-none transition placeholder:text-[color:var(--rd-text-mute)] hover:border-[color:var(--rd-glow)]/30 focus:border-[color:var(--rd-glow)]/60"
                />
              </label>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={sending}
                className="group inline-flex items-center gap-2 rounded-full bg-[color:var(--rd-glow)] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--rd-ink)] shadow-[0_12px_36px_rgba(200,230,110,0.32)] transition-[transform,box-shadow] duration-300 [transition-timing-function:var(--ease-out)] hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(200,230,110,0.42)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 [font-family:var(--font-mono)]"
              >
                {sending ? 'Sending…' : 'Send message'}
                <ArrowRight className="h-3.5 w-3.5 transition-transform [transition-timing-function:var(--ease-out)] group-hover:translate-x-0.5" />
              </button>
              <button
                type="button"
                onClick={copyEmail}
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--rd-paper)]/14 bg-[color:var(--rd-ink)]/55 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--rd-text-dim)] transition hover:border-[color:var(--rd-glow)]/40 hover:text-[color:var(--rd-text)] [font-family:var(--font-mono)]"
                aria-label={`Copy ${business.email} to clipboard`}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-[color:var(--rd-glow)]" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy email
                  </>
                )}
              </button>
            </div>

            {sent && (
              <div role="status" aria-live="polite" className="mt-5 rounded-2xl border border-[color:var(--rd-glow)]/30 bg-[color:var(--rd-glow)]/8 p-4 text-sm leading-6 text-[color:var(--rd-text)]">
                <p className="inline-flex items-center gap-2 rd-eyebrow text-[color:var(--rd-glow)]">
                  <Check className="h-4 w-4" />
                  {WEB3FORMS_KEY ? 'Message sent' : 'Your email app should open'}
                </p>
                <p className="mt-2 text-[color:var(--rd-text-dim)]">
                  {WEB3FORMS_KEY ? (
                    <>
                      Thanks — your message is on its way to our team. We reply within one business
                      day. You can also reach us directly at{' '}
                      <a href={business.emailHref} className="font-medium text-[color:var(--rd-glow)] underline underline-offset-4">
                        {business.email}
                      </a>
                      .
                    </>
                  ) : (
                    <>
                      If nothing opened, email us directly at{' '}
                      <a href={business.emailHref} className="font-medium text-[color:var(--rd-glow)] underline underline-offset-4">
                        {business.email}
                      </a>{' '}
                      or tap <span className="font-medium text-[color:var(--rd-text)]">Copy email</span> above.
                    </>
                  )}
                </p>
              </div>
            )}

            {error && (
              <div role="alert" className="mt-5 rounded-2xl border border-[color:var(--rd-amber)]/40 bg-[color:var(--rd-amber)]/10 p-4 text-sm leading-6 text-[color:var(--rd-text)]">
                Something went wrong sending your message. Please email us directly at{' '}
                <a href={business.emailHref} className="font-medium text-[color:var(--rd-glow)] underline underline-offset-4">
                  {business.email}
                </a>
                .
              </div>
            )}

            <p className="mt-5 text-xs leading-6 text-[color:var(--rd-text-mute)]">
              Please do not include payment information. For order issues, call{' '}
              <a href={business.phoneHref} className="underline underline-offset-4 hover:text-[color:var(--rd-text-dim)]">
                {business.phone}
              </a>{' '}
              or email{' '}
              <a href={business.emailHref} className="underline underline-offset-4 hover:text-[color:var(--rd-text-dim)]">
                {business.email}
              </a>
              .
            </p>
          </form>

          <aside className="grid gap-4 self-start">
            <div className="rounded-3xl border border-[color:var(--rd-paper)]/10 bg-[color:var(--rd-ink-soft)] p-6 shadow-[0_24px_72px_rgba(0,0,0,0.28)]">
              <Clock className="h-6 w-6 text-[color:var(--rd-glow)]" />
              <p className="mt-3 rd-eyebrow text-[color:var(--rd-text-mute)]">Hours</p>
              <ul className="mt-3 grid gap-2 text-sm text-[color:var(--rd-text)] [font-family:var(--font-mono)]">
                {business.hours.map((slot) => (
                  <li key={slot.day} className="flex items-center justify-between gap-3 border-b border-[color:var(--rd-paper)]/8 pb-2 last:border-0 last:pb-0">
                    <span className="text-[color:var(--rd-text-dim)]">{slot.day}</span>
                    <span>{slot.open} – {slot.close}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-[color:var(--rd-glow)]/25 bg-[color:var(--rd-glow)]/8 p-6 shadow-[0_24px_72px_rgba(0,0,0,0.20)]">
              <p className="rd-eyebrow text-[color:var(--rd-glow)]">Find us social</p>
              <ul className="mt-4 grid gap-2 text-sm">
                {social.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 font-medium text-[color:var(--rd-text)] transition hover:text-[color:var(--rd-glow)]"
                    >
                      {item.label}
                      <span className="text-[color:var(--rd-text-mute)]">— {item.handle}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-[color:var(--rd-paper)]/10 bg-[color:var(--rd-ink-soft)] p-6 shadow-[0_24px_72px_rgba(0,0,0,0.28)]">
              <p className="rd-eyebrow text-[color:var(--rd-text-mute)]">Need an order, not a chat?</p>
              <h3
                className="mt-3 text-[color:var(--rd-text)]"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(1.35rem, 1.8vw, 1.65rem)', letterSpacing: '-0.015em' }}
              >
                Skip ahead <span className="italic">to checkout.</span>
              </h3>
              <div className="mt-5 grid gap-3">
                <Link href="/menu" className="btn-luxe btn-luxe-paper w-full">
                  Browse menu
                  <ArrowRight />
                </Link>
                <OrderButton className="w-full" />
              </div>
            </div>
          </aside>
        </div>
      </section>
    </SiteChrome>
  );
}
