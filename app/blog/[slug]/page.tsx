import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import SiteChrome, { OrderButton } from '@/components/SiteChrome';
import { getBlogPost, getBlogPosts, type InlineSegment } from '@/lib/blog-posts';
import { business } from '@/lib/site-data';

type PageProps = {
  params: Promise<{ slug: string }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function Inline({ segments }: { segments: InlineSegment[] }) {
  return (
    <>
      {segments.map((segment, index) => {
        if (segment.type === 'strong') return <strong key={index}>{segment.text}</strong>;
        if (segment.type === 'em') return <em key={index}>{segment.text}</em>;
        if (segment.type === 'link') {
          const external = /^https?:/i.test(segment.href);
          return (
            <Link key={index} href={segment.href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>
              {segment.text}
            </Link>
          );
        }
        return <span key={index}>{segment.text}</span>;
      })}
    </>
  );
}

export function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {
      title: 'Article Not Found | Raindrops Greenery NY'
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: [{ url: post.coverImage, width: 1200, height: 800, alt: post.coverAlt }]
    }
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) notFound();

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { '@type': 'Organization', name: post.author },
    publisher: { '@type': 'Organization', name: business.tradeName, logo: { '@type': 'ImageObject', url: `${business.baseUrl}/assets/logo.jpg` } },
    image: post.coverImage.startsWith('http') ? post.coverImage : `${business.baseUrl}${post.coverImage}`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${business.baseUrl}/blog/${post.slug}` }
  };

  return (
    <SiteChrome>
      <Script id={`ld-article-${post.slug}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <article>
        {/* Hero — dark ink to match the rest of the site */}
        <section className="relative overflow-hidden bg-[color:var(--rd-ink)] text-[color:var(--rd-text)]">
          <div className="absolute inset-0">
            <Image src={post.coverImage} alt="" fill priority sizes="100vw" className="object-cover opacity-[0.30]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,20,16,0.55),rgba(10,20,16,0.85))]" />
          </div>
          <div className="luxury-shell relative py-16 sm:py-20">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--rd-paper)]/14 bg-[color:var(--rd-ink-soft)]/55 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--rd-text-dim)] transition hover:border-[color:var(--rd-glow)]/40 hover:text-[color:var(--rd-text)] [font-family:var(--font-mono)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to journal
            </Link>
            <div className="mt-8 max-w-4xl">
              <p className="rd-eyebrow text-[color:var(--rd-glow)]">{post.category}</p>
              <h1 className="mt-4 text-[color:var(--rd-text)]">{post.title}</h1>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--rd-text-dim)] [font-family:var(--font-mono)]">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5 text-[color:var(--rd-glow)]" />
                  {formatDate(post.publishedAt)}
                </span>
                <span aria-hidden className="text-[color:var(--rd-paper)]/20">·</span>
                <span>{post.readTime}</span>
                <span aria-hidden className="text-[color:var(--rd-paper)]/20">·</span>
                <span>{post.author}</span>
              </div>
              <p className="mt-6 max-w-3xl text-base leading-7 text-[color:var(--rd-text-dim)] sm:text-lg sm:leading-8">{post.excerpt}</p>
            </div>
          </div>
        </section>

        {/* Article body + sidebar on light surface */}
        <section className="bg-[color:var(--rd-paper)] py-16 sm:py-20">
          <div className="luxury-shell grid gap-8 lg:grid-cols-[minmax(0,0.75fr)_280px]">
            <div className="rounded-3xl border border-[color:var(--rd-ink)]/8 bg-[color:var(--rd-paper-soft)]/80 p-6 shadow-[0_18px_54px_rgba(45,74,58,0.08)] sm:p-10">
              <div className="blog-prose">
                {post.blocks.map((block, index) => {
                  if (block.type === 'heading') {
                    return <h2 key={`h-${index}`}>{block.text}</h2>;
                  }
                  if (block.type === 'list') {
                    return block.ordered ? (
                      <ol key={`ol-${index}`}>
                        {block.items.map((item, itemIndex) => (
                          <li key={itemIndex}><Inline segments={item} /></li>
                        ))}
                      </ol>
                    ) : (
                      <ul key={`ul-${index}`}>
                        {block.items.map((item, itemIndex) => (
                          <li key={itemIndex}><Inline segments={item} /></li>
                        ))}
                      </ul>
                    );
                  }
                  if (block.type === 'image') {
                    return (
                      <span key={`img-${index}`} className="relative my-6 block aspect-[5/3] overflow-hidden rounded-2xl bg-[color:var(--rd-paper)]">
                        <Image src={block.src} alt={block.alt} fill sizes="(max-width: 768px) 100vw, 720px" className="object-cover" />
                      </span>
                    );
                  }
                  if (block.type === 'quote') {
                    return <blockquote key={`q-${index}`}><Inline segments={block.segments} /></blockquote>;
                  }
                  return <p key={`p-${index}`}><Inline segments={block.segments} /></p>;
                })}
              </div>
            </div>

            <aside className="h-fit rounded-3xl border border-[color:var(--rd-glow)]/25 bg-[color:var(--rd-ink-soft)] p-6 text-[color:var(--rd-text)] shadow-[0_24px_72px_rgba(0,0,0,0.28)]">
              <p className="rd-eyebrow text-[color:var(--rd-glow)]">Ready to shop?</p>
              <h2
                className="mt-3 text-[color:var(--rd-text)]"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(1.35rem, 1.8vw, 1.65rem)', letterSpacing: '-0.015em' }}
              >
                Browse products, <span className="italic">checkout securely.</span>
              </h2>
              <div className="mt-5 grid gap-3">
                <Link href="/menu" className="btn-luxe btn-luxe-paper w-full">
                  View menu
                  <ArrowLeft className="hidden" />
                </Link>
                <OrderButton className="w-full" />
              </div>
            </aside>
          </div>
        </section>
      </article>
    </SiteChrome>
  );
}
