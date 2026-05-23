import type { Metadata } from 'next';
import AdminCms from '@/components/AdminCms';

export const metadata: Metadata = {
  title: 'Blog Admin',
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminPage() {
  return <AdminCms />;
}
