import { headers } from 'next/headers';

export function getBaseUrl(): string {
  // Determine base URL from incoming request headers (works in server components)
  const h = headers();
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const host = h.get('x-forwarded-host') ?? h.get('host');
  if (host) return `${proto}://${host}`;
  // Fallbacks for non-request contexts (rare in our pages) or local dev
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
}
