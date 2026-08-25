import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function GET() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("universes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("GET /api/universes error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name.trim().slice(0, 80) : "";
    const description =
      typeof body?.description === "string" ? body.description.trim().slice(0, 1000) : "";
    const category =
      typeof body?.category === "string" && body.category.trim()
        ? body.category.trim().slice(0, 40)
        : "general";
    const slug = normalizeSlug(typeof body?.slug === "string" ? body.slug : "");
    const tags = Array.isArray(body?.tags)
      ? body.tags
          .filter((tag: unknown): tag is string => typeof tag === "string")
          .map((tag: string) => tag.trim().slice(0, 30))
          .filter(Boolean)
          .slice(0, 10)
      : [];

    if (!name || !slug) {
      return NextResponse.json({ error: "name과 slug는 필수입니다" }, { status: 400 });
    }

    const payload = {
      name,
      description,
      category,
      slug,
      tags,
      subscriber_count: 0,
      post_count: 0,
      owner_id: user.id,
    };

    let insertResult = await supabase
      .from("universes")
      .insert(payload)
      .select("*")
      .single();

    // Before 20260825_supabase_alignment.sql is applied, owner_id does not
    // exist yet. Keep development usable with the current live schema.
    if (
      insertResult.error &&
      (insertResult.error.code === "PGRST204" ||
        insertResult.error.message.toLowerCase().includes("owner_id"))
    ) {
      const { owner_id: _ownerId, ...legacyPayload } = payload;
      insertResult = await supabase
        .from("universes")
        .insert(legacyPayload)
        .select("*")
        .single();
    }

    if (insertResult.error) {
      console.error("POST /api/universes error:", insertResult.error);
      const status = insertResult.error.code === "23505" ? 409 : 500;
      return NextResponse.json({ error: insertResult.error.message }, { status });
    }

    return NextResponse.json({ ok: true, data: insertResult.data }, { status: 201 });
  } catch (err) {
    console.error("POST /api/universes exception:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
