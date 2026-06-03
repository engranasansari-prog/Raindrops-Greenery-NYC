import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarDays } from 'lucide-react';
import SiteChrome from '@/components/SiteChrome';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getBlogPosts } from '@/lib/blog-posts';

export const metadata: Metadata = {
  title: 'NYC Cannabis Delivery Blog',
  description:
    'Guides to NYC weed delivery — how tax-free Shinnecock cannabis works, neighborhood delivery ETAs, and how to order Flower, Pre-Rolls, and Edibles.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Raindrops Greenery NY Journal',
    description: 'Delivery guides, product education, and Raindrops NY updates.',
    url: '/blog',
    images: [{ url: '/assets/heroPhoto.jpg', width: 1200, height: 800, alt: 'Raindrops Greenery journal' }]
  }
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <SiteChrome>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[color:var(--rd-ink)] text-[color:var(--rd-text)]">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              'radial-gradient(ellipse at top left, rgba(200,230,110,0.10), transparent 55%), radial-gradient(ellipse at bottom right, rgba(46,82,64,0.45), transparent 60%)'
          }}
        />
        <div className="luxury-shell relative max-w-4xl py-12 sm:py-16 lg:py-20">
          <Breadcrumbs items={[{ label: 'Journal' }]} tone="dark" />
          <p className="mt-5 rd-eyebrow text-[color:var(--rd-glow)]">Raindrops Journal</p>
          <h1 className="mt-4 text-[color:var(--rd-text)]">
            Guides for <span className="italic">better ordering.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--rd-text-dim)] sm:text-lg sm:leading-8">
            Product education, delivery notes, and simple ordering tips for adult customers in Manhattan, LIC, Williamsburg, and Greenpoint.
          </p>
        </div>
      </section>

      {/* Posts grid — on cream so the photo cards pop like a magazine spread
          (dark cards on a warm cream field), instead of dark-on-dark. */}
      <section className="rd-luxe-paper border-t border-[color:var(--rd-ink)]/8 py-14 sm:py-20">
        <div className="luxury-shell grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[color:var(--rd-paper)]/10 bg-[color:var(--rd-ink-soft)] shadow-[0_20px_60px_rgba(0,0,0,0.18)] transition-[transform,border-color,box-shadow] duration-500 [transition-timing-function:var(--ease-out)] hover:-translate-y-1 hover:border-[color:var(--rd-glow)]/40 hover:shadow-[0_30px_70px_rgba(200,230,110,0.12)]"
            >
              <div className="relative aspect-[5/3] overflow-hidden bg-[color:var(--rd-paper-soft)]">
                <Image
                  src={post.coverImage}
                  alt={post.coverAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition duration-500 [transition-timing-function:var(--ease-out)] group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="flex flex-wrap items-center gap-2 rd-eyebrow text-[color:var(--rd-text-mute)]">
                  <span className="text-[color:var(--rd-glow)]">{post.category}</span>
                  <span aria-hidden className="text-[color:var(--rd-paper)]/20">·</span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(post.publishedAt)}
                  </span>
                </div>
                <h2
                  className="rd-head-aside mt-3 text-[color:var(--rd-text)]"
                >
                  {post.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[color:var(--rd-text-dim)]">{post.excerpt}</p>
                <p className="mt-auto inline-flex items-center gap-2 pt-6 rd-eyebrow text-[color:var(--rd-glow)]">
                  Read article
                  <ArrowRight className="h-4 w-4 transition-transform [transition-timing-function:var(--ease-out)] group-hover:translate-x-1" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </SiteChrome>
  );
}
