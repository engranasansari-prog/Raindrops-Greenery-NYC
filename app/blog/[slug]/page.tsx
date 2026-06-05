import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, CalendarDays } from 'lucide-react';
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

  // Clamp the SERP/OG description to ~155 chars at a word boundary so it
  // isn't truncated mid-word by Google. The full excerpt can stay long for
  // the on-page intro; this only trims the meta tag.
  const metaDescription = clampDescription(post.excerpt, 155);

  return {
    title: post.seoTitle ?? post.title,
    description: metaDescription,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: metaDescription,
      url: `/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: [{ url: post.coverImage, width: 1200, height: 800, alt: post.coverAlt }]
    }
  };
}

function clampDescription(text: string, max: number): string {
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  const lastSpace = slice.lastIndexOf(' ');
  return `${slice.slice(0, lastSpace > 0 ? lastSpace : max).trimEnd()}…`;
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) notFound();

  // Approximate word count from rendered blocks — feeds Article schema's
  // wordCount field, which Google + AI engines use to gauge article
  // depth. Skipping image blocks; counting words in headings + paragraph
  // + list segments.
  const wordCount = post.blocks.reduce((total, block) => {
    if (block.type === 'heading') return total + block.text.split(/\s+/).filter(Boolean).length;
    if (block.type === 'paragraph' || block.type === 'quote') {
      return total + block.segments.reduce((sum, seg) => sum + ('text' in seg ? seg.text : '').split(/\s+/).filter(Boolean).length, 0);
    }
    if (block.type === 'list') {
      return total + block.items.reduce((sum, item) => sum + item.reduce((s, seg) => s + ('text' in seg ? seg.text : '').split(/\s+/).filter(Boolean).length, 0), 0);
    }
    return total;
  }, 0);

  // Related articles — pick up to 3 from the same category first, falling
  // back to most-recent posts. Powers the in-page "Continue reading" rail
  // (real internal links Google follows). The old `relatedLink` schema field
  // was removed — it isn't a valid schema.org property for Article/BlogPosting.
  const allPosts = getBlogPosts();
  const related = [
    ...allPosts.filter((p) => p.slug !== post.slug && p.category === post.category),
    ...allPosts.filter((p) => p.slug !== post.slug && p.category !== post.category)
  ].slice(0, 3);

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${business.baseUrl}/blog/${post.slug}#article`,
    headline: post.title,
    name: post.title,
    description: post.excerpt,
    articleSection: post.category,
    inLanguage: 'en-US',
    wordCount,
    keywords: [post.category, 'cannabis', 'NYC delivery', 'Raindrops Greenery', 'Shinnecock cannabis'],
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { '@type': 'Organization', name: post.author, url: business.baseUrl },
    publisher: {
      '@type': 'Organization',
      '@id': `${business.baseUrl}#org`,
      name: business.tradeName,
      logo: { '@type': 'ImageObject', url: `${business.baseUrl}/assets/logo.jpg` }
    },
    image: post.coverImage.startsWith('http') ? post.coverImage : `${business.baseUrl}${post.coverImage}`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${business.baseUrl}/blog/${post.slug}` },
    isPartOf: { '@type': 'Blog', '@id': `${business.baseUrl}/blog#blog`, name: 'Raindrops Greenery Journal' }
  };

  // BreadcrumbList — gives Google a clean Home > Journal > Post trail to
  // render under the title in search results.
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: business.baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Journal', item: `${business.baseUrl}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: `${business.baseUrl}/blog/${post.slug}` }
    ]
  };

  return (
    <SiteChrome>
      {/* Plain <script> tags so JSON-LD ships in the initial SSR HTML.
          BlogPosting → Google article rich result; BreadcrumbList → the
          trail under the title in SERPs. */}
      <script
        type="application/ld+json"
         
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
         
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <article>
        {/* Hero — light bone wash over the cover image to match the rest of the site */}
        <section className="relative overflow-hidden bg-[color:var(--rd-paper)] text-[color:var(--rd-ink)]">
          <div className="absolute inset-0">
            <Image src={post.coverImage} alt="" fill priority sizes="100vw" className="object-cover opacity-[0.18]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(244,239,227,0.85),rgba(244,239,227,0.95))]" />
          </div>
          <div className="luxury-shell relative py-12 sm:py-16 lg:py-20">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--rd-ink)]/12 bg-[color:var(--rd-paper-bright)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--rd-on-paper-dim)] transition hover:border-[color:var(--rd-amber-dark)]/45 hover:text-[color:var(--rd-ink)] [font-family:var(--font-mono)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to journal
            </Link>
            <div className="mt-8 max-w-4xl">
              <p className="rd-eyebrow text-[color:var(--rd-moss)]">{post.category}</p>
              <h1 className="mt-4 text-[color:var(--rd-ink)]">{post.title}</h1>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--rd-on-paper-dim)] [font-family:var(--font-mono)]">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5 text-[color:var(--rd-moss)]" />
                  {formatDate(post.publishedAt)}
                </span>
                <span aria-hidden className="text-[color:var(--rd-ink)]/20">·</span>
                <span>{post.readTime}</span>
                <span aria-hidden className="text-[color:var(--rd-ink)]/20">·</span>
                <span>{post.author}</span>
              </div>
              <p className="mt-6 max-w-3xl text-base leading-7 text-[color:var(--rd-on-paper-dim)] sm:text-lg sm:leading-8">{post.excerpt}</p>
            </div>
          </div>
        </section>

        {/* Article body + sidebar on light surface */}
        <section className="bg-[color:var(--rd-paper)] py-12 sm:py-16 lg:py-20">
          <div className="luxury-shell grid gap-8 lg:grid-cols-[minmax(0,0.75fr)_280px]">
            <div className="rounded-3xl border border-[color:var(--rd-ink)]/8 bg-[color:var(--rd-paper-soft)]/80 p-6 shadow-[0_18px_54px_rgba(46,82,64,0.08)] sm:p-10">
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

            <aside className="h-fit rounded-3xl border border-[color:var(--rd-ink)]/12 bg-[color:var(--rd-paper-bright)] p-6 text-[color:var(--rd-ink)] rd-shadow-luxe">
              <p className="rd-eyebrow text-[color:var(--rd-moss)]">Ready to shop?</p>
              <h2
                className="mt-3 text-[color:var(--rd-ink)]"
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

        {/*
          Related Articles — three more posts so the reader has a clear
          path to keep reading. Same-category posts come first, then
          fall back to most-recent. This rail is the strongest in-domain
          internal-linking signal we ship: it gives Google a real-world
          related-content graph and reduces bounce.
        */}
        {related.length > 0 && (
          <section className="border-t border-[color:var(--rd-ink)]/8 bg-[color:var(--rd-paper-soft)] py-14 sm:py-20">
            <div className="luxury-shell">
              <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="rd-eyebrow text-[color:var(--rd-moss)]">Continue reading</p>
                  <h2 className="mt-2 text-[color:var(--rd-ink)]">
                    More from <span className="italic">the journal.</span>
                  </h2>
                </div>
                <Link
                  href="/blog"
                  className="group inline-flex items-center gap-2 text-sm text-[color:var(--rd-on-paper-dim)] transition hover:text-[color:var(--rd-moss)]"
                >
                  <span className="border-b border-[color:var(--rd-moss)] pb-0.5">All articles</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/blog/${r.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[color:var(--rd-ink)]/8 bg-[color:var(--rd-paper)] transition-[transform,border-color,box-shadow] duration-500 [transition-timing-function:var(--ease-out)] hover:-translate-y-1 hover:border-[color:var(--rd-moss)]/35 hover:shadow-[0_24px_60px_rgba(46,82,64,0.10)]"
                  >
                    <div className="relative aspect-[5/3] overflow-hidden bg-[color:var(--rd-paper-soft)]">
                      <Image
                        src={r.coverImage}
                        alt={r.coverAlt}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 [transition-timing-function:var(--ease-out)] group-hover:scale-[1.04]"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <p className="rd-eyebrow text-[color:var(--rd-moss)]">{r.category}</p>
                      <h3
                        className="mt-2 text-[color:var(--rd-ink)]"
                        style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(1.05rem, 1.4vw, 1.2rem)', lineHeight: 1.25, letterSpacing: '-0.01em' }}
                      >
                        {r.title}
                      </h3>
                      <p className="mt-3 flex-1 text-sm leading-6 text-[color:var(--rd-on-paper-dim)]">{r.excerpt}</p>
                      <span className="mt-4 inline-flex items-center gap-1.5 rd-eyebrow text-[color:var(--rd-moss)]">
                        Read article
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </SiteChrome>
  );
}
