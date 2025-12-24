import { createBrowserClient } from '@supabase/ssr'

// Note: Database types can be generated from Supabase once the database is created
// Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
