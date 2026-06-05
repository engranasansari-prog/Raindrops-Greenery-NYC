'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useModalA11y } from '@/hooks/useModalA11y';
import { trackSignup } from '@/lib/analytics';

/**
 * 21+ age gate + optional welcome-subscribe splash.
 *
 * PERF: This component is the only reason framer-motion would otherwise enter
 * the shared client bundle for SiteChrome. It is loaded via `next/dynamic` with
 * `{ ssr: false }` from SiteChrome, so framer-motion ships in its own async
 * chunk that downloads/hydrates only on the client — interior routes like
 * /about, /faq, /blog, /legal no longer pay framer's ~45KB in the static
 * shared bundle. Behaviour is identical to the previous inline implementation:
 * the gate still appears on first visit and is remembered for 30 days.
 *
 * `{ ssr: false }` is safe here: every branch below is guarded for the browser
 * (localStorage / document access live inside effects), and the gate's initial
 * state is 'hidden', so there is no server/client markup to mismatch.
 */

// 21+ confirmation persists this long before we re-ask (30 days). Was
// per-session, which re-walled returning buyers on every single visit.
const AGE_CONFIRM_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export default function AgeGate() {
  // Three-phase modal: 'age' (21+ challenge) → 'subscribe' (optional welcome
  // signup) → closed. Skipping the subscribe step still dismisses the modal.
  const [phase, setPhase] = useState<'hidden' | 'age' | 'subscribe'>('hidden');
  const [declined, setDeclined] = useState(false);

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [subscribeMessage, setSubscribeMessage] = useState('');

  // Remember the 21+ confirmation for 30 days (localStorage) instead of
  // re-walling every new session — re-prompting a returning buyer nightly is
  // friction with no compliance upside (the duty is to ASK, not to ask each
  // visit). The optional welcome/subscribe step still runs on a fresh confirm.
  // Storage errors (private mode) fall back to showing the gate.
  useEffect(() => {
    let confirmed = false;
    try {
      const at = Number(localStorage.getItem('rd_age_confirmed_at'));
      confirmed = at > 0 && Date.now() - at < AGE_CONFIRM_TTL_MS;
    } catch {
      confirmed = false;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhase(confirmed ? 'hidden' : 'age');
  }, []);

  const showing = phase !== 'hidden';

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (showing) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [showing]);

  const confirmAge = () => {
    try {
      localStorage.setItem('rd_age_confirmed_at', String(Date.now()));
    } catch {
      /* private mode — the gate simply re-shows next visit */
    }
    setPhase('subscribe');
  };

  const declineAge = () => setDeclined(true);

  const close = () => setPhase('hidden');

  // Modal a11y: focus into the gate, trap Tab, restore focus on close. Escape
  // only applies on the optional subscribe step (= "skip"); the 21+ challenge
  // itself must not be Escape-dismissable. Scroll lock is handled by the
  // existing effect above, so lockScroll is off here to avoid double-locking.
  const dialogRef = useRef<HTMLDivElement>(null);
  useModalA11y(showing, dialogRef, {
    onEscape: phase === 'subscribe' ? close : undefined,
    lockScroll: false
  });

  const subscribe = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (subscribeStatus === 'loading' || subscribeStatus === 'success') return;
    setSubscribeStatus('loading');
    setSubscribeMessage('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone: phone || undefined, source: 'age-gate-welcome' })
      });
      const data = (await res.json()) as { ok: boolean; message?: string; error?: string };
      if (data.ok) {
        setSubscribeStatus('success');
        setSubscribeMessage(data.message ?? "You’re in. Drops incoming.");
        trackSignup('age_gate');
        // Auto-close after a beat so the customer can see the success state.
        window.setTimeout(close, 1600);
      } else {
        setSubscribeStatus('error');
        setSubscribeMessage(data.error ?? 'Something went wrong.');
      }
    } catch {
      setSubscribeStatus('error');
      setSubscribeMessage('Network error — try again.');
    }
  };

  return (
    <AnimatePresence>
      {showing && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[color:var(--rd-ink)] p-5 text-[color:var(--rd-text)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          aria-modal="true"
          role="dialog"
          aria-labelledby="agegate-title"
        >
          {/* Full-bleed cinematic background */}
          <div className="absolute inset-0">
            <Image
              src="/assets/heroPhoto.jpg"
              alt=""
              fill
              sizes="100vw"
              quality={50}
              className="object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(27,51,40,0.62),rgba(27,51,40,0.95))]" />
          </div>

          <motion.div
            ref={dialogRef}
            tabIndex={-1}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-h-[92dvh] w-full max-w-lg overflow-y-auto text-center outline-none"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-[color:var(--rd-amber)]/40 shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
              <Image src="/assets/logo.jpg" width={80} height={80} alt="Raindrops Greenery logo" className="h-full w-full object-cover" />
            </div>

            {phase === 'age' ? (
              <>
                <p className="rd-eyebrow inline-flex items-center gap-2 text-[color:var(--rd-glow)]">
                  <span className="rd-pulse" aria-hidden />
                  21+ only · NYC delivery
                </p>

                <h2
                  id="agegate-title"
                  className="mt-3 text-[1.7rem] leading-[1.1] text-[color:var(--rd-text)] sm:text-[2.1rem]"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 300, letterSpacing: '-0.03em' }}
                >
                  Welcome to <span className="italic" style={{ fontWeight: 500 }}>Raindrops NY.</span>
                </h2>

                {declined ? (
                  <>
                    <p className="mx-auto mt-4 max-w-md text-[15px] leading-6 text-[color:var(--rd-text-dim)] sm:text-base">
                      This website and delivery service are restricted to adults 21 and older. Please come back when you are of legal age.
                    </p>
                    <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                      {/* A real exit for under-21 / mistaken visitors — the gate
                          must not be a one-button loop back to the challenge. */}
                      <a href="https://www.google.com" className="btn-luxe btn-luxe-gold">
                        Leave site
                      </a>
                      <button
                        onClick={() => setDeclined(false)}
                        className="btn-luxe btn-luxe-ghost"
                      >
                        I am 21+ — go back
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mx-auto mt-4 max-w-md text-[15px] leading-6 text-[color:var(--rd-text-dim)] sm:text-base">
                      This site is intended for adults 21 and older. By entering you confirm that you are 21+ and accept our{' '}
                      <Link href="/legal/terms" className="underline decoration-[color:var(--rd-glow)] underline-offset-4 hover:text-[color:var(--rd-glow)]">Terms</Link> and{' '}
                      <Link href="/legal/privacy" className="underline decoration-[color:var(--rd-glow)] underline-offset-4 hover:text-[color:var(--rd-glow)]">Privacy Policy</Link>.
                    </p>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <button onClick={confirmAge} className="btn-luxe btn-luxe-gold">
                        I am 21 or older
                      </button>
                      <button onClick={declineAge} className="btn-luxe btn-luxe-ghost">
                        I am under 21
                      </button>
                    </div>
                  </>
                )}
                <p className="mt-6 rd-eyebrow text-[color:var(--rd-text-mute)]">
                  Keep cannabis out of reach of children and pets.
                </p>
              </>
            ) : (
              // Phase 2 — optional welcome subscribe
              <>
                <p className="rd-eyebrow inline-flex items-center gap-2 text-[color:var(--rd-glow)]">
                  <span className="rd-pulse" aria-hidden />
                  Welcome aboard
                </p>

                <h2
                  id="agegate-title"
                  className="mt-3 text-[1.7rem] leading-[1.1] text-[color:var(--rd-text)] sm:text-[2.1rem]"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 300, letterSpacing: '-0.03em' }}
                >
                  Be first to know <span className="italic" style={{ fontWeight: 500 }}>about new drops.</span>
                </h2>
                <p className="mx-auto mt-4 max-w-md text-[15px] leading-6 text-[color:var(--rd-text-dim)] sm:text-base">
                  Exclusive deals, sticky strain drops, and members-only previews. Phone optional — we’ll text major restocks only.
                </p>

                <form
                  onSubmit={subscribe}
                  className="mx-auto mt-5 grid w-full max-w-md gap-2.5 text-left"
                  aria-label="Welcome newsletter signup"
                >
                  <label className="grid gap-1.5">
                    <span className="rd-eyebrow text-[color:var(--rd-text-mute)]">Email</span>
                    <input
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      required
                      disabled={subscribeStatus === 'loading' || subscribeStatus === 'success'}
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="your@email.com"
                      className="h-12 rounded-full border border-[color:var(--rd-paper)]/14 bg-[color:var(--rd-ink-soft)]/55 px-4 text-sm text-[color:var(--rd-text)] outline-none transition placeholder:text-[color:var(--rd-text-mute)] focus:border-[color:var(--rd-glow)] focus:shadow-[0_0_0_4px_rgba(200,230,110,0.18)] disabled:opacity-60"
                    />
                  </label>
                  <label className="grid gap-1.5">
                    <span className="rd-eyebrow flex items-center justify-between text-[color:var(--rd-text-mute)]">
                      Phone <span className="text-[10px] tracking-[0.16em] text-[color:var(--rd-text-mute)]">Optional</span>
                    </span>
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      disabled={subscribeStatus === 'loading' || subscribeStatus === 'success'}
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="(555) 123-4567"
                      className="h-12 rounded-full border border-[color:var(--rd-paper)]/14 bg-[color:var(--rd-ink-soft)]/55 px-4 text-sm text-[color:var(--rd-text)] outline-none transition placeholder:text-[color:var(--rd-text-mute)] focus:border-[color:var(--rd-glow)] focus:shadow-[0_0_0_4px_rgba(200,230,110,0.18)] disabled:opacity-60"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={subscribeStatus === 'loading' || subscribeStatus === 'success'}
                    className="btn-luxe btn-luxe-gold mt-2 w-full justify-center disabled:opacity-70"
                  >
                    {subscribeStatus === 'loading'
                      ? 'Sending…'
                      : subscribeStatus === 'success'
                        ? '✓ Subscribed'
                        : 'Subscribe & enter site'}
                  </button>

                  {subscribeMessage && (
                    <p
                      role={subscribeStatus === 'error' ? 'alert' : 'status'}
                      className={`text-sm ${
                        subscribeStatus === 'success'
                          ? 'text-[color:var(--rd-glow)]'
                          : 'text-[color:var(--rd-amber)]'
                      }`}
                    >
                      {subscribeMessage}
                    </p>
                  )}
                </form>

                <button
                  onClick={close}
                  className="mt-4 rd-eyebrow text-[color:var(--rd-text-mute)] underline-offset-4 transition hover:text-[color:var(--rd-text-dim)] hover:underline"
                >
                  Skip for now
                </button>

                <p className="mt-4 rd-eyebrow text-[color:var(--rd-text-mute)]">
                  Unsubscribe anytime · 21+ only
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
