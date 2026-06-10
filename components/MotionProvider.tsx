'use client';

import { LazyMotion } from 'framer-motion';
import type { ReactNode } from 'react';

// Perf: LazyMotion + async features keeps the framer-motion animation engine
// (~165–200KB of first-load JS per route) OFF the critical path. Components
// render immediately with the tiny <m /> shell; the full feature set (domMax —
// layout / popLayout / drag / gestures, in lib/motion-features.ts) streams in
// after first paint, so behavior is identical but LCP/TBT no longer pay for it.
// `strict` throws if any full-bundle `motion.*` component sneaks back in, so
// the bundle saving can't silently regress.
const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  );
}
