"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

type UseSupabaseUserResult = {
  user: User | null;
  loading: boolean;
};

export function useSupabaseUser(): UseSupabaseUserResult {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      setLoading(true);

      const { data, error } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (error) {
        // Logged-out visitors are a normal state, not a console-worthy warning.
        if (error.name !== "AuthSessionMissingError") {
          console.warn("Failed to get user:", error);
        }
        setUser(null);
      } else {
        setUser(data.user ?? null);
      }

      setLoading(false);
    }

    loadUser();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const subscription = data?.subscription;

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  return { user, loading };
}
