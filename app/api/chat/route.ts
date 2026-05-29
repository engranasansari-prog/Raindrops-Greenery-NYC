import { NextResponse } from 'next/server';
import { business, checkout, faqs, social } from '@/lib/site-data';
import { ALL_ZIPS } from '@/lib/coverage';

/**
 * AI concierge endpoint — turns the Raindrops chat widget into a real
 * Claude-powered assistant that can answer ANY natural-language question
 * about the business, grounded in the site's own data with hard guardrails.
 *
 * Cost/secret model: requires ANTHROPIC_API_KEY (set in Vercel env ONLY —
 * never in code). When the key is absent OR the upstream call fails for any
 * reason, this returns { ok: false } so the client gracefully falls back to
 * the built-in scripted concierge. So the bot always works; adding the key
 * simply upgrades it to full AI. Optional CHAT_MODEL env overrides the model.
 */

export const runtime = 'nodejs';

const MODEL = process.env.CHAT_MODEL || 'claude-3-5-haiku-latest';

const KNOWLEDGE = `BUSINESS: ${business.tradeName} (${business.legalName}) — ${business.tagline}. Phone/text: ${business.phone}. Email: ${business.email}. Instagram: ${social[0]?.handle ?? '@raindropsgreenery'}.
HOURS: every day, ${business.hours[0].open}–${business.hours[0].close}.
LICENSING / WHY TAX-FREE: operates under a sovereign cannabis license from the ${business.licensingAuthority} (${business.jurisdiction}). Orders are exempt from the NY State cannabis excise + sales taxes charged at state-licensed dispensaries — that is the tax-free pricing.
DELIVERY AREA: same-day across Manhattan PLUS Williamsburg, Greenpoint, and Long Island City ONLY. Never claim all of Brooklyn or all of Queens. Free delivery on orders over $25. Average drop-off under an hour. Covered ZIP codes: ${ALL_ZIPS.join(', ')}.
FREE GIFT: every order includes a complimentary pre-roll, auto-added at checkout (21+, while supplies last). No code needed.
ORDERING: browse the menu, pick products, tap any "Order" button to reach secure checkout for payment, ID verification, and delivery. Menu: /menu. Featured picks (curated by price, lowest first): /deals. 2-minute strain quiz: /quiz. Delivery areas + ZIP checker: /delivery. About: /about. FAQ: /faq. Contact: /contact. Checkout link: ${checkout.dutchieUrl}.
PRODUCTS: three categories — Flower Strains, Pre-Rolls, and Edibles — filterable by price, potency (THC), size, brand, and effect. Premium items carry a ✦ STICKY badge ($40+).
PAYMENT: cash always accepted at the door; debit and other options may be available at checkout depending on processor support.
21+ ONLY: a valid government photo ID is verified at the door before handoff.
RETURNS: for safety + compliance, cannabis can't be returned once delivered; contact support within 24 hours if there's an issue.

FAQ (approved answers):
${faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`).join('\n')}`;

const SYSTEM = `You are the Raindrops Greenery concierge — a warm, concise, premium chat assistant for a 21+ tax-free cannabis DELIVERY service in New York City. Answer using ONLY the knowledge provided.

RULES:
- Be concise: 1–4 short sentences, friendly and on-brand. Plain text (a short inline list is fine). No markdown headings.
- NEVER give medical, health, or dosing advice, and never claim health benefits or effects. If asked, say you can't give medical advice and suggest consulting a healthcare professional — then offer to help browse the menu by category instead.
- Coverage is ONLY Manhattan + Williamsburg, Greenpoint, and Long Island City. Never imply all of Brooklyn or all of Queens. If a ZIP is not in the covered list, say we're expanding fast and offer the contact form.
- Assume the visitor is 21+. Don't lecture about age unless they ask.
- Stay on topic: Raindrops, our products, delivery, ordering, and NYC cannabis delivery. Politely decline unrelated or off-brand requests and steer back.
- NEVER invent prices, products, promos, ETAs, or policies. If you don't know, point them to ${business.phone} / ${business.email} / the /contact page.
- Encourage shopping the menu or checking coverage where natural, but never pressure.

KNOWLEDGE:
${KNOWLEDGE}`;

type IncomingMessage = { role?: unknown; content?: unknown };

export async function POST(request: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    // No key configured → tell the client to use its built-in scripted brain.
    if (!apiKey) return NextResponse.json({ ok: false, reason: 'no-key' });

    const body = (await request.json()) as { messages?: IncomingMessage[] };
    const incoming = Array.isArray(body?.messages) ? body.messages : [];

    const messages = incoming
      .filter(
        (m): m is { role: 'user' | 'assistant'; content: string } =>
          (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim().length > 0
      )
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 600) }));

    if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
      return NextResponse.json({ ok: false, reason: 'bad-input' }, { status: 400 });
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 350,
        temperature: 0.3,
        // cache_control keeps the (large, static) system prompt cached so
        // repeat messages cost a fraction of the input tokens.
        system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
        messages
      })
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('[chat] Anthropic API error', res.status, detail.slice(0, 300));
      return NextResponse.json({ ok: false, reason: 'api-error' });
    }

    const data = (await res.json()) as { content?: Array<{ type?: string; text?: string }> };
    const reply = Array.isArray(data.content)
      ? data.content
          .filter((b) => b.type === 'text' && typeof b.text === 'string')
          .map((b) => b.text)
          .join('')
          .trim()
      : '';

    if (!reply) return NextResponse.json({ ok: false, reason: 'empty' });
    return NextResponse.json({ ok: true, reply });
  } catch (err) {
    console.error('[chat] Unhandled error:', err);
    return NextResponse.json({ ok: false, reason: 'exception' });
  }
}
