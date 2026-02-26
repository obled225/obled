import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey);

// Server-side client with service role key (for server components and API routes)
// Only create if the service role key is available
const supabaseAPIKey = process.env.SUPABASE_API_KEY;
export const supabaseAdmin: ReturnType<typeof createClient<Database>> | null =
  supabaseAPIKey
    ? createClient<Database>(supabaseUrl, supabaseAPIKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;
