import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const missingEnvironmentMessage =
  "Supabase public environment is missing. Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.";

function createMissingEnvironmentClient(): SupabaseClient {
  return new Proxy({} as SupabaseClient, {
    get(_target, property) {
      if (property === "then") return undefined;
      throw new Error(missingEnvironmentMessage);
    },
  });
}

// Compatibility client for older modules. Do not throw during module import,
// because Next.js prerenders unrelated routes during `next build`.
export const supabase: SupabaseClient =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createMissingEnvironmentClient();
