import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? '') as string
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '') as string

function mask(s: string) {
  if (!s) return '';
  if (s.length <= 8) return '••••••';
  return s.slice(0, 4) + '…' + s.slice(-4);
}

if (!supabaseUrl || !supabaseAnonKey) {
  // This will be caught by the inline error overlay in index.html
  console.error('⚠️ Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel.');
  // throw to make the runtime error obvious in the page overlay
  throw new Error('Missing Supabase env vars: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
} else {
  // Log masked values so we can verify they were injected at build time without revealing secrets
  console.info('Supabase config present — URL:', mask(supabaseUrl), 'ANON_KEY:', mask(supabaseAnonKey));
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)