import type { Metadata } from 'next';
import StrainQuiz from '@/components/StrainQuiz';

export const metadata: Metadata = {
  title: 'Strain finder',
  description:
    'Answer four quick questions and Raindrops Greenery will recommend Flower, Pre-Rolls, or Edibles that match how you want to feel.',
  alternates: { canonical: '/quiz' },
  openGraph: {
    title: 'Strain finder — Raindrops Greenery',
    description: 'Tell us how you want to feel; we’ll match you with the right drop.',
    url: '/quiz'
  }
};

export default function QuizPage() {
  return <StrainQuiz />;
}
