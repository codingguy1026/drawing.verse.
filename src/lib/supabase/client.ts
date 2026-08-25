import { createBrowserClient } from "@supabase/ssr";

function getPublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase public environment is missing. Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return { url, anonKey };
}

export const createClient = () => {
  const { url, anonKey } = getPublicEnv();
  return createBrowserClient(url, anonKey);
};

export const supabase = createClient();
