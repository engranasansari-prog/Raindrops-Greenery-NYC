'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Check, Clock, Mail, MapPin, MessageSquare, Phone } from 'lucide-react';
import SiteChrome, { OrderButton } from '@/components/SiteChrome';
import { business, social } from '@/lib/site-data';

const topics = ['Order help', 'Delivery question', 'Wholesale / brand partnership', 'Press', 'Other'];

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState(topics[0]);
  const [message, setMessage] = useState('');

  const send = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const subject = encodeURIComponent(`[${topic}] Raindrops NY — ${name}`);
    const body = encodeURIComponent(`${message}\n\nFrom: ${name} (${email})`);
    if (typeof window !== 'undefined') {
      window.location.href = `${business.emailHref}?subject=${subject}&body=${body}`;
    }
    setSent(true);
  };

  return (
    <SiteChrome>
      <section className="relative overflow-hidden bg-[#0b3025] text-white">
        <div className="absolute inset-0 mesh-bg opacity-15" />
        <div className="luxury-shell relative grid gap-8 py-14 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--champagne)]">Get in touch</p>
            <h1 className="mt-3 font-[var(--font-display)] text-5xl font-extrabold leading-tight md:text-7xl">Real humans answer here.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/74">
              Questions about a delivery, a product, or a partnership? Use the form, give us a call, or message us on social. We answer most messages within one business day.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <a href={business.phoneHref} className="rounded-lg border border-white/12 bg-white/8 p-5 transition hover:bg-white/12">
              <Phone className="h-6 w-6 text-[var(--champagne)]" />
              <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--champagne)]">Phone</p>
              <p className="mt-2 font-bold">{business.phone}</p>
            </a>
            <a href={business.emailHref} className="rounded-lg border border-white/12 bg-white/8 p-5 transition hover:bg-white/12">
              <Mail className="h-6 w-6 text-[var(--champagne)]" />
              <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--champagne)]">Support</p>
              <p className="mt-2 font-bold">{business.email}</p>
            </a>
            <a href={business.pressEmailHref} className="rounded-lg border border-white/12 bg-white/8 p-5 transition hover:bg-white/12">
              <MessageSquare className="h-6 w-6 text-[var(--champagne)]" />
              <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--champagne)]">Press</p>
              <p className="mt-2 font-bold">{business.pressEmail}</p>
            </a>
            <div className="rounded-lg border border-white/12 bg-white/8 p-5">
              <MapPin className="h-6 w-6 text-[var(--champagne)]" />
              <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--champagne)]">Office</p>
              <p className="mt-2 font-bold leading-6">
                {business.address.line1}<br />
                {business.address.city}, {business.address.region} {business.address.postalCode}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="luxury-shell grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <form onSubmit={send} className="rounded-lg border border-white/70 bg-white/82 p-6 shadow-[0_18px_54px_rgba(25,35,20,0.08)] md:p-9">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[var(--champagne-dark)]">Send a message</p>
            <h2 className="mt-3 font-[var(--font-display)] text-3xl font-bold text-[var(--emerald-deep)] md:text-4xl">Tell us what you need.</h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--champagne-dark)]">Your name</span>
                <input required value={name} onChange={(event) => setName(event.target.value)} className="h-12 rounded-lg border border-[var(--line)] bg-white px-3 text-sm font-bold text-[var(--emerald-deep)] outline-none transition focus:border-[var(--champagne)]" />
              </label>
              <label className="grid gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--champagne-dark)]">Email</span>
                <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 rounded-lg border border-[var(--line)] bg-white px-3 text-sm font-bold text-[var(--emerald-deep)] outline-none transition focus:border-[var(--champagne)]" />
              </label>
              <label className="grid gap-2 md:col-span-2">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--champagne-dark)]">Topic</span>
                <select value={topic} onChange={(event) => setTopic(event.target.value)} className="h-12 rounded-lg border border-[var(--line)] bg-white px-3 text-sm font-bold text-[var(--emerald-deep)] outline-none transition focus:border-[var(--champagne)]">
                  {topics.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 md:col-span-2">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--champagne-dark)]">Message</span>
                <textarea required value={message} onChange={(event) => setMessage(event.target.value)} rows={5} className="rounded-lg border border-[var(--line)] bg-white p-3 text-sm leading-7 text-[var(--emerald-deep)] outline-none transition focus:border-[var(--champagne)]" />
              </label>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-[var(--emerald-deep)] px-5 py-3 text-xs font-extrabold uppercase tracking-[0.14em] text-white transition hover:bg-[var(--emerald)]">
                Send message
                <ArrowRight className="h-4 w-4" />
              </button>
              {sent && (
                <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--emerald)]">
                  <Check className="h-4 w-4" />
                  Your email app opened.
                </span>
              )}
            </div>

            <p className="mt-4 text-xs leading-6 text-[var(--muted)]">
              Submitting will open your email app pre-filled to {business.email}. Please do not include payment information by email.
            </p>
          </form>

          <aside className="grid gap-4 self-start">
            <div className="rounded-lg border border-white/70 bg-white/82 p-6 shadow-[0_18px_54px_rgba(25,35,20,0.08)]">
              <Clock className="h-6 w-6 text-[var(--emerald)]" />
              <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--champagne-dark)]">Hours</p>
              <ul className="mt-3 grid gap-2 text-sm font-bold text-[var(--emerald-deep)]">
                {business.hours.map((slot) => (
                  <li key={slot.day} className="flex items-center justify-between gap-3">
                    <span>{slot.day}</span>
                    <span>{slot.open} – {slot.close}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-[rgba(217,183,111,0.45)] bg-[rgba(217,183,111,0.12)] p-6">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--champagne-dark)]">Find us social</p>
              <ul className="mt-4 grid gap-2 text-sm">
                {social.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-extrabold text-[var(--emerald-deep)] transition hover:text-[var(--champagne-dark)]">
                      {item.label} <span className="text-[var(--muted)]">— {item.handle}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-white/70 bg-white/82 p-6 shadow-[0_18px_54px_rgba(25,35,20,0.08)]">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--champagne-dark)]">Need an order, not a chat?</p>
              <h3 className="mt-3 font-[var(--font-display)] text-3xl font-bold text-[var(--emerald-deep)]">Skip ahead to checkout.</h3>
              <div className="mt-5 grid gap-3">
                <Link href="/menu" className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-5 py-3 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--emerald-deep)] transition hover:border-[var(--champagne)]">
                  Browse menu
                  <ArrowRight className="h-4 w-4" />
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
