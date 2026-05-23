import fs from 'node:fs';
import path from 'node:path';

export type InlineSegment =
  | { type: 'text'; text: string }
  | { type: 'strong'; text: string }
  | { type: 'em'; text: string }
  | { type: 'link'; text: string; href: string };

export type BlogBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; segments: InlineSegment[] }
  | { type: 'list'; ordered: boolean; items: InlineSegment[][] }
  | { type: 'image'; src: string; alt: string }
  | { type: 'quote'; segments: InlineSegment[] };

export type BlogPostMeta = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  readTime: string;
  author: string;
  coverImage: string;
  coverAlt: string;
};

export type BlogPost = BlogPostMeta & {
  blocks: BlogBlock[];
};

const blogDirectory = path.join(process.cwd(), 'content', 'blog');

function parseFrontmatter(file: string) {
  const match = file.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {} as Record<string, string>, body: file };

  const data = Object.fromEntries(
    match[1]
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => {
        const separator = line.indexOf(':');
        const key = line.slice(0, separator).trim();
        const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
        return [key, value];
      })
  );

  return { data, body: match[2].trim() };
}

function parseInline(input: string): InlineSegment[] {
  const segments: InlineSegment[] = [];
  let remaining = input;

  while (remaining.length > 0) {
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      segments.push({ type: 'link', text: linkMatch[1], href: linkMatch[2] });
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    const strongMatch = remaining.match(/^\*\*([^*]+)\*\*/);
    if (strongMatch) {
      segments.push({ type: 'strong', text: strongMatch[1] });
      remaining = remaining.slice(strongMatch[0].length);
      continue;
    }

    const emMatch = remaining.match(/^\*([^*]+)\*/);
    if (emMatch) {
      segments.push({ type: 'em', text: emMatch[1] });
      remaining = remaining.slice(emMatch[0].length);
      continue;
    }

    // Plain text until the next special marker.
    const nextSpecial = remaining.search(/(\[[^\]]+\]\([^)]+\))|(\*\*[^*]+\*\*)|(\*[^*]+\*)/);
    if (nextSpecial === -1) {
      segments.push({ type: 'text', text: remaining });
      remaining = '';
    } else if (nextSpecial === 0) {
      // Shouldn't reach here because we tried each pattern above.
      segments.push({ type: 'text', text: remaining[0] });
      remaining = remaining.slice(1);
    } else {
      segments.push({ type: 'text', text: remaining.slice(0, nextSpecial) });
      remaining = remaining.slice(nextSpecial);
    }
  }

  return segments;
}

function parseMarkdown(body: string): BlogBlock[] {
  const lines = body.split(/\r?\n/);
  const blocks: BlogBlock[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let listOrdered = false;

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ type: 'paragraph', segments: parseInline(paragraph.join(' ')) });
      paragraph = [];
    }
  };

  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push({
        type: 'list',
        ordered: listOrdered,
        items: listItems.map((item) => parseInline(item))
      });
      listItems = [];
      listOrdered = false;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    if (trimmed.startsWith('## ')) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'heading', text: trimmed.replace(/^##\s+/, '') });
      continue;
    }

    if (trimmed.startsWith('> ')) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'quote', segments: parseInline(trimmed.slice(2)) });
      continue;
    }

    const imageMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'image', alt: imageMatch[1], src: imageMatch[2] });
      continue;
    }

    if (trimmed.startsWith('- ')) {
      flushParagraph();
      if (listOrdered) flushList();
      listItems.push(trimmed.replace(/^-\s+/, ''));
      continue;
    }

    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (orderedMatch) {
      flushParagraph();
      if (!listOrdered) flushList();
      listOrdered = true;
      listItems.push(orderedMatch[2]);
      continue;
    }

    flushList();
    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();
  return blocks;
}

function postFromFile(fileName: string): BlogPost {
  const slug = fileName.replace(/\.md$/, '');
  const file = fs.readFileSync(path.join(blogDirectory, fileName), 'utf8');
  const { data, body } = parseFrontmatter(file);

  return {
    slug,
    title: data.title ?? slug.replace(/-/g, ' '),
    excerpt: data.excerpt ?? '',
    category: data.category ?? 'Guide',
    publishedAt: data.publishedAt ?? new Date().toISOString(),
    readTime: data.readTime ?? '3 min read',
    author: data.author ?? 'Raindrops Greenery',
    coverImage: data.coverImage ?? '/assets/heroPhoto.jpg',
    coverAlt: data.coverAlt ?? data.title ?? 'Raindrops Greenery article',
    blocks: parseMarkdown(body)
  };
}

export function getBlogPosts(): BlogPostMeta[] {
  if (!fs.existsSync(blogDirectory)) return [];

  return fs
    .readdirSync(blogDirectory)
    .filter((fileName) => fileName.endsWith('.md'))
    .map(postFromFile)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .map(({ blocks: _blocks, ...meta }) => meta);
}

export function getBlogPost(slug: string) {
  const fileName = `${slug}.md`;
  const filePath = path.join(blogDirectory, fileName);
  if (!fs.existsSync(filePath)) return null;

  return postFromFile(fileName);
}
