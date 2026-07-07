// src/app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  try {
    // 🔥 여기도 await!
    const supabase = await createServerSupabase();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("supabase getUser error:", error);
    }

    if (!user) {
      return NextResponse.json({ ok: false, user: null }, { status: 200 });
    }

    return NextResponse.json(
      {
        ok: true,
        user: {
          id: user.id,
          email: user.email,
          user_metadata: user.user_metadata,
        },
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("api/auth/me fatal error:", e);
    return NextResponse.json(
      { ok: false, user: null, error: "internal" },
      { status: 500 }
    );
  }
}
