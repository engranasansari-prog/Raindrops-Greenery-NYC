// Shared NYC ZIP validation used by the hero claim modal, the coverage map,
// and any other ZIP-checking surface so behavior stays consistent everywhere.
//
// V4: coverage data lives in /lib/coverage.ts. This file remains the
// validation/UX-message facade so existing callers don't break.

import { findCluster, type CoverageCluster } from './coverage';

export type ZipStatus = 'idle' | 'incomplete' | 'supported' | 'unsupported';

export type ZipResult = {
  status: ZipStatus;
  zip: string;
  /** Cluster short name (e.g. "Midtown") — the old `borough` key kept for backward compat */
  borough: string | null;
  cluster: CoverageCluster | null;
};

export function normalizeZip(input: string): string {
  return input.replace(/\D/g, '').slice(0, 5);
}

export function checkZip(input: string): ZipResult {
  const zip = normalizeZip(input);
  if (!zip) return { status: 'idle', zip: '', borough: null, cluster: null };
  if (zip.length < 5) return { status: 'incomplete', zip, borough: null, cluster: null };

  const cluster = findCluster(zip);
  if (cluster) return { status: 'supported', zip, borough: cluster.shortName, cluster };
  return { status: 'unsupported', zip, borough: null, cluster: null };
}

export const UNSUPPORTED_MESSAGE = 'Not yet in your area — we’re expanding fast.';
export const SUPPORTED_MESSAGE = 'You’re in. Same-day delivery available.';
