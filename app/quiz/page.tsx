import type { Metadata } from 'next';
import StrainQuiz from '@/components/StrainQuiz';
import { business } from '@/lib/site-data';

export const metadata: Metadata = {
  title: 'Strain finder',
  description:
    'Answer four quick questions and Raindrops Greenery will recommend Flower, Pre-Rolls, or Edibles that match how you want to feel.',
  alternates: { canonical: '/quiz' },
  openGraph: {
    title: 'Strain finder — Raindrops Greenery',
    description: 'Tell us how you want to feel; we’ll match you with the right drop.',
    url: '/quiz',
    images: [{ url: `${business.baseUrl}/assets/DISPENSARYIMAGE.jpg`, width: 1200, height: 800, alt: 'Raindrops Greenery NYC' }]
  }
};

export default function QuizPage() {
  return <StrainQuiz />;
}
