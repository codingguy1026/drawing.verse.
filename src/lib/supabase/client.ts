import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const missingEnvironmentMessage =
  "Supabase public environment is missing. Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.";

function createMissingEnvironmentClient(): SupabaseClient {
  // Do not throw while modules are imported. Next.js prerenders client-component
  // trees (including /_not-found) during `next build`, and an import-time throw
  // would make unrelated static pages fail to build. If application code actually
  // tries to use Supabase without configuration, fail at that point instead.
  return new Proxy({} as SupabaseClient, {
    get(_target, property) {
      // Prevent Promise/thenable detection from treating this proxy as a Promise.
      if (property === "then") return undefined;
      throw new Error(missingEnvironmentMessage);
    },
  });
}

export const createClient = (): SupabaseClient => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return createMissingEnvironmentClient();
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

export const supabase = createClient();
