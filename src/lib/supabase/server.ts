// src/lib/supabase/server.ts
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!url || !serviceKey) {
  console.warn(
    "supabaseAdmin not initialized: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing."
  );
}

// export null if not configured, caller must handle
export const supabaseAdmin =
  url && serviceKey ? createClient(url, serviceKey) : null as unknown as ReturnType<typeof createClient>;

export function createServerSupabase() {
  return supabaseAdmin;
}
