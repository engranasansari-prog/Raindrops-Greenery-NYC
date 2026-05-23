'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    CMS?: {
      init: (options: { config: unknown }) => void;
    };
    CMS_MANUAL_INIT?: boolean;
  }
}

const config = {
  backend: {
    name: 'git-gateway',
    branch: 'main'
  },
  local_backend: true,
  media_folder: 'public/uploads',
  public_folder: '/uploads',
  site_url: 'https://raindropsgreenery.com',
  display_url: 'https://raindropsgreenery.com',
  logo_url: '/assets/logo.jpg',
  collections: [
    {
      name: 'blog',
      label: 'Blog',
      folder: 'content/blog',
      create: true,
      slug: '{{slug}}',
      extension: 'md',
      format: 'frontmatter',
      fields: [
        { label: 'Title', name: 'title', widget: 'string' },
        { label: 'Excerpt', name: 'excerpt', widget: 'text' },
        { label: 'Category', name: 'category', widget: 'select', options: ['Delivery', 'Education', 'Ordering', 'Product Guide'] },
        { label: 'Publish Date', name: 'publishedAt', widget: 'datetime', date_format: 'YYYY-MM-DD', time_format: false },
        { label: 'Read Time', name: 'readTime', widget: 'string', default: '3 min read' },
        { label: 'Author', name: 'author', widget: 'string', default: 'Raindrops Greenery' },
        { label: 'Cover Image', name: 'coverImage', widget: 'image' },
        { label: 'Cover Alt Text', name: 'coverAlt', widget: 'string' },
        { label: 'Body', name: 'body', widget: 'markdown' }
      ]
    }
  ]
};

export default function AdminCms() {
  useEffect(() => {
    window.CMS_MANUAL_INIT = true;

    if (window.CMS) {
      window.CMS.init({ config });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/decap-cms@3.8.3/dist/decap-cms.js';
    script.async = true;
    script.onload = () => window.CMS?.init({ config });
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#06130f] p-6 text-center text-white">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--champagne)]">Raindrops Greenery</p>
        <h1 className="mt-3 font-[var(--font-display)] text-5xl font-bold">Loading blog editor</h1>
        <p className="mt-4 max-w-md text-sm leading-7 text-white/62">
          Use this private editor to add blog text, upload cover images, and publish Markdown posts to the repository.
        </p>
      </div>
    </div>
  );
}
