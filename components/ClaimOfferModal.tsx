'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, Mail, MapPin, Phone, ShieldCheck, Sparkles, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { checkZip, UNSUPPORTED_MESSAGE } from '@/lib/zip-utils';
import { serviceAreas } from '@/lib/site-data';

type Props = {
  open: boolean;
  onClose: () => void;
};

type FormState = {
  name: string;
  email: string;
  phone: string;
  borough: string;
  zip: string;
  age21: boolean;
  marketing: boolean;
};

const INITIAL: FormState = {
  name: '',
  email: '',
  phone: '',
  borough: serviceAreas[0],
  zip: '',
  age21: false,
  marketing: true
};

export default function ClaimOfferModal({ open, onClose }: Props) {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  // Reset state when the modal opens fresh
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(INITIAL);
      setErrors({});
      setSubmitted(false);
    }
  }, [open]);

  // Lock body scroll while open
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (open) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previous;
      };
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, open]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = 'Please enter a valid email address.';
    if (form.phone.replace(/\D/g, '').length < 10) next.phone = 'Please enter a valid phone number.';
    if (!form.age21) next.age21 = 'You must confirm you are 21 or older to claim this offer.';

    const zipCheck = checkZip(form.zip);
    if (zipCheck.status === 'incomplete' || zipCheck.status === 'idle') next.zip = 'Please enter a 5-digit ZIP code.';
    if (zipCheck.status === 'unsupported') next.zip = UNSUPPORTED_MESSAGE;

    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    // Capture the claim into the same Mailchimp audience the footer + age-gate
    // newsletter use. Tagged "claim-modal" + the customer's ZIP so the client
    // can segment leads by intent (free-gift claim) and by neighborhood.
    // Fire-and-forget: even if Mailchimp errors, the customer sees the
    // "Drops incoming" confirmation. Errors are still logged server-side.
    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          phone: form.phone.trim(),
          source: `claim-modal:${form.zip.trim()}`
        })
      });
    } catch {
      // Network drop shouldn't block the celebration screen — the client can
      // re-engage via the footer form. Silent here is intentional.
    }
    setSubmitted(true);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-stretch justify-center bg-[#03100b]/82 backdrop-blur-xl sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="claim-title"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="rd-luxe-dark relative max-h-[100dvh] w-full max-w-2xl overflow-y-auto border border-[color:var(--rd-text)]/8 shadow-[0_40px_120px_rgba(0,0,0,0.55)] sm:max-h-[92vh] sm:rounded-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={onClose}
              aria-label="Close claim form"
              className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--rd-text)]/14 bg-[color:var(--rd-text)]/8 text-[color:var(--rd-text-dim)] transition hover:border-[var(--rd-amber)] hover:text-[color:var(--rd-text)]"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative p-6 sm:p-8 md:p-10">
              <p className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--rd-amber)] sm:text-xs">
                <Sparkles className="h-3.5 w-3.5" />
                Free gift · NYC only
              </p>
              <h2 id="claim-title" className="mt-3 font-[var(--font-display)] text-3xl font-extrabold leading-tight text-[color:var(--rd-text)] sm:text-4xl md:text-5xl">
                Claim your offer.
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-7 text-[color:var(--rd-text-dim)] sm:text-base">
                Adults 21+ in Manhattan plus Williamsburg, Greenpoint, and Long Island City — fill in your details and we’ll confirm eligibility. If approved, same-day delivery.
              </p>

              {submitted ? (
                <div className="mt-8 rounded-xl border border-emerald-300/30 bg-emerald-400/8 p-6 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-200">
                    <Check className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 font-[var(--font-display)] text-2xl font-bold text-[color:var(--rd-text)] sm:text-3xl">
                    Your request has been received.
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--rd-text-dim)] sm:text-base">
                    If eligible, your package will be delivered same-day. Keep an eye on your phone — a Raindrops Greenery dispatcher may text to confirm the drop window.
                  </p>
                  <p className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[color:var(--rd-text-mute)] sm:text-xs">
                    21+ only · NYC only · While supplies last
                  </p>
                  <button
                    onClick={onClose}
                    className="btn-luxe btn-luxe-gold mt-6"
                  >
                    Got it
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} className="mt-7 grid gap-4" noValidate>
                  <Field label="Name" icon={<User className="h-4 w-4" />} error={errors.name}>
                    <input
                      autoComplete="name"
                      required
                      value={form.name}
                      onChange={(event) => set('name', event.target.value)}
                      placeholder="Your name"
                      className="w-full bg-transparent text-base font-bold text-[color:var(--rd-text)] outline-none placeholder:text-[color:var(--rd-text)]/40"
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Email" icon={<Mail className="h-4 w-4" />} error={errors.email}>
                      <input
                        type="email"
                        autoComplete="email"
                        required
                        value={form.email}
                        onChange={(event) => set('email', event.target.value)}
                        placeholder="you@email.com"
                        className="w-full bg-transparent text-base font-bold text-[color:var(--rd-text)] outline-none placeholder:text-[color:var(--rd-text)]/40"
                      />
                    </Field>

                    <Field label="Phone" icon={<Phone className="h-4 w-4" />} error={errors.phone}>
                      <input
                        type="tel"
                        autoComplete="tel"
                        required
                        inputMode="tel"
                        value={form.phone}
                        onChange={(event) => set('phone', event.target.value)}
                        placeholder="(555) 555-5555"
                        className="w-full bg-transparent text-base font-bold text-[color:var(--rd-text)] outline-none placeholder:text-[color:var(--rd-text)]/40"
                      />
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Area" icon={<MapPin className="h-4 w-4" />}>
                      <select
                        value={form.borough}
                        onChange={(event) => set('borough', event.target.value)}
                        className="w-full bg-transparent text-base font-bold text-[color:var(--rd-text)] outline-none"
                      >
                        {serviceAreas.map((area) => (
                          <option key={area} value={area} className="bg-[#06130f]">{area}</option>
                        ))}
                      </select>
                    </Field>

                    <Field label="ZIP code" icon={<MapPin className="h-4 w-4" />} error={errors.zip}>
                      <input
                        inputMode="numeric"
                        autoComplete="postal-code"
                        required
                        value={form.zip}
                        maxLength={5}
                        onChange={(event) => set('zip', event.target.value)}
                        placeholder="10001"
                        className="w-full bg-transparent text-base font-bold text-[color:var(--rd-text)] outline-none placeholder:text-[color:var(--rd-text)]/40"
                      />
                    </Field>
                  </div>

                  <Checkbox
                    label="I confirm I am 21 years of age or older."
                    checked={form.age21}
                    onChange={(value) => set('age21', value)}
                    error={errors.age21}
                  />
                  <Checkbox
                    label="I agree to receive Raindrops Greenery offers and updates."
                    checked={form.marketing}
                    onChange={(value) => set('marketing', value)}
                  />

                  <button type="submit" className="btn-luxe btn-luxe-gold mt-2 w-full">
                    <ShieldCheck className="h-4 w-4" />
                    Claim this offer
                  </button>

                  <p className="text-center text-[10px] font-extrabold uppercase tracking-[0.18em] text-[color:var(--rd-text)]/48 sm:text-xs">
                    21+ only · NYC only · While supplies last
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  icon,
  children,
  error
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--rd-amber)] sm:text-xs">{label}</span>
      <span className={`mt-2 flex items-center gap-2 rounded-xl border bg-[color:var(--rd-text)]/4 px-3 py-3 transition focus-within:bg-[color:var(--rd-text)]/8 ${error ? 'border-rose-400/60' : 'border-[color:var(--rd-text)]/14 focus-within:border-[var(--rd-amber)]'}`}>
        <span className="text-[color:var(--rd-text-mute)]">{icon}</span>
        {children}
      </span>
      {error && (
        <span role="alert" className="mt-2 block text-xs font-bold text-rose-200">
          {error}
        </span>
      )}
    </label>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
  error
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[color:var(--rd-text)]/12 bg-[color:var(--rd-text)]/4 p-4 transition hover:border-[color:var(--rd-text)]/22">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 rounded border-[color:var(--rd-text)]/30 bg-transparent text-[var(--rd-amber)] accent-[var(--rd-amber)]"
        />
        <span className="text-sm leading-6 text-[color:var(--rd-text-dim)]">{label}</span>
      </label>
      {error && <p className="mt-2 text-xs font-bold text-rose-200">{error}</p>}
    </div>
  );
}
