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
        <section className="relative overflow-hidden bg-[#0b3025] text-white">
          <div className="absolute inset-0">
            <Image src={post.coverImage} alt="" fill priority sizes="100vw" className="object-cover opacity-30" />
            <div className="absolute inset-0 bg-[#06130f]/72" />
          </div>
          <div className="luxury-shell relative py-14 md:py-20">
            <Link href="/blog" className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-white transition hover:bg-white/16">
              <ArrowLeft className="h-4 w-4" />
              Back to blog
            </Link>
            <div className="mt-8 max-w-4xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--champagne)]">{post.category}</p>
              <h1 className="mt-3 font-[var(--font-display)] text-5xl font-extrabold leading-tight md:text-7xl">{post.title}</h1>
              <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold text-white/68">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-[var(--champagne)]" />
                  {formatDate(post.publishedAt)}
                </span>
                <span>{post.readTime}</span>
                <span>{post.author}</span>
              </div>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-white/74">{post.excerpt}</p>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="luxury-shell grid gap-8 lg:grid-cols-[minmax(0,0.75fr)_280px]">
            <div className="rounded-lg border border-white/70 bg-white/84 p-6 shadow-[0_18px_54px_rgba(25,35,20,0.08)] md:p-9">
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
                      <span key={`img-${index}`} className="relative my-6 block aspect-[5/3] overflow-hidden rounded-lg bg-[#fbf7ee]">
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

            <aside className="h-fit rounded-lg border border-[rgba(217,183,111,0.45)] bg-[rgba(217,183,111,0.12)] p-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--champagne-dark)]">Ready to shop?</p>
              <h2 className="mt-3 font-[var(--font-display)] text-3xl font-bold text-[var(--emerald-deep)]">Browse products, then checkout securely.</h2>
              <div className="mt-5 grid gap-3">
                <Link href="/menu" className="inline-flex items-center justify-center rounded-full border border-[var(--line)] bg-white px-5 py-3 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--emerald-deep)] transition hover:border-[var(--champagne)]">
                  View menu
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
