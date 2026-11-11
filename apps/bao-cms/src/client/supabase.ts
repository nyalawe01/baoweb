import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://jkpopfcqkrpmtxcamqdx.supabase.co';
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprcG9wZmNxa3JwbXR4Y2FtcWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxMjY3NTUsImV4cCI6MjEwOTcwMjc1NX0.eNAASSE3NKBUdYcJdZ1bYczzY_v3JxuPAomSB4B0Sjs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function cmsApiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || `Request failed with status ${res.status}`);
  }
  return json as T;
}

