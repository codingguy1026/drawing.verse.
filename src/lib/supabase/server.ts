import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getPublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.local or configure Codespaces secrets."
    );
  }

  return { url, anonKey };
}

/**
 * Cookie-aware Supabase client for Server Components and Route Handlers.
 * It intentionally uses the public key so all normal app access stays behind RLS.
 */
export async function createServerSupabase() {
  const cookieStore = await cookies();
  const { url, anonKey } = getPublicEnv();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Some Server Component contexts are read-only. Auth refresh can be
          // handled by middleware/another request in those cases.
        }
      },
    },
  });
}

/**
 * Service-role access is deliberately not initialized here. Add a separate,
 * server-only helper only when an actual admin job needs to bypass RLS.
 */
