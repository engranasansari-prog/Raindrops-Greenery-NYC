import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarDays } from 'lucide-react';
import SiteChrome from '@/components/SiteChrome';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getBlogPosts } from '@/lib/blog-posts';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Raindrops Greenery NY delivery articles, product education, and ordering guides for Manhattan, Brooklyn, and Queens.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Raindrops Greenery NY Blog',
    description: 'Delivery guides, product education, and Raindrops NY updates.',
    url: '/blog',
    images: [{ url: '/assets/heroPhoto.jpg', width: 1200, height: 800, alt: 'Raindrops Greenery blog' }]
  }
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <SiteChrome>
      <section className="relative overflow-hidden bg-[#0b3025] text-white">
        <div className="absolute inset-0 mesh-bg opacity-15" />
        <div className="luxury-shell relative max-w-4xl py-14 md:py-20">
          <Breadcrumbs items={[{ label: 'Journal' }]} tone="dark" />
          <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--champagne)]">Raindrops Journal</p>
          <h1 className="mt-3 font-[var(--font-display)] text-5xl font-extrabold leading-tight md:text-7xl">Guides for better ordering.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">
            Product education, delivery notes, and simple ordering tips for adult customers in Manhattan, Brooklyn, and Queens.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="luxury-shell grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group overflow-hidden rounded-lg border border-white/70 bg-white/82 shadow-[0_18px_54px_rgba(25,35,20,0.09)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_86px_rgba(25,35,20,0.14)]">
              <div className="relative aspect-[5/3] overflow-hidden bg-[#f8f1e4]">
                <Image src={post.coverImage} alt={post.coverAlt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--champagne-dark)]">
                  <span>{post.category}</span>
                  <span className="text-[var(--line)]">|</span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(post.publishedAt)}
                  </span>
                </div>
                <h2 className="mt-3 font-[var(--font-display)] text-3xl font-bold leading-tight text-[var(--emerald-deep)]">{post.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{post.excerpt}</p>
                <p className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--emerald-deep)]">
                  Read article
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </SiteChrome>
  );
}
