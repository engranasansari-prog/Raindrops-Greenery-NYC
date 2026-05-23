import HomePage from '@/components/HomePage';
import { getBlogPosts } from '@/lib/blog-posts';

export default function Page() {
  return <HomePage posts={getBlogPosts()} />;
}
