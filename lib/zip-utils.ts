// Shared NYC ZIP validation used by the hero claim modal, the coverage map,
// and any other ZIP-checking surface so behavior stays consistent everywhere.

import { serviceAreaDetails } from './site-data';

export type ZipStatus = 'idle' | 'incomplete' | 'supported' | 'unsupported';

export type ZipResult = {
  status: ZipStatus;
  zip: string;
  borough: string | null;
};

export function normalizeZip(input: string): string {
  return input.replace(/\D/g, '').slice(0, 5);
}

export function checkZip(input: string): ZipResult {
  const zip = normalizeZip(input);
  if (!zip) return { status: 'idle', zip: '', borough: null };
  if (zip.length < 5) return { status: 'incomplete', zip, borough: null };

  const area = serviceAreaDetails.find((entry) => entry.zips.includes(zip));
  if (area) return { status: 'supported', zip, borough: area.name };
  return { status: 'unsupported', zip, borough: null };
}

export const UNSUPPORTED_MESSAGE = 'Sorry, this offer is currently available for NYC customers only.';
export const SUPPORTED_MESSAGE = 'Great news — this offer is available in your area.';
