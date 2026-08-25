import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

function getDisplayName(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}) {
  const metadata = user.user_metadata ?? {};
  const candidates = [
    metadata.display_name,
    metadata.full_name,
    metadata.name,
    metadata.nickname,
  ];

  const fromMetadata = candidates.find(
    (value): value is string => typeof value === "string" && value.trim().length > 0
  );

  if (fromMetadata) return fromMetadata.trim().slice(0, 40);
  return user.email?.split("@")[0]?.slice(0, 40) || "익명";
}

export async function GET() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("posts")
    .select("id,title,content,category,universe_slug,author,image_url,user_id,like_count,comment_count,created_at,updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("GET /api/posts error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { ok: false, error: "로그인이 필요해요." },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  const universeSlug =
    typeof body?.universeSlug === "string" ? body.universeSlug.trim() : "";
  const category =
    typeof body?.category === "string" && body.category.trim()
      ? body.category.trim().slice(0, 40)
      : "기타";

  if (!title || !content) {
    return NextResponse.json(
      { ok: false, error: "제목과 내용을 입력해 주세요." },
      { status: 400 }
    );
  }

  if (title.length > 160 || content.length > 20000) {
    return NextResponse.json(
      { ok: false, error: "제목 또는 내용이 너무 길어요." },
      { status: 400 }
    );
  }

  let author = getDisplayName(user);

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name,nickname")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.display_name?.trim()) {
    author = profile.display_name.trim().slice(0, 40);
  } else if (profile?.nickname?.trim()) {
    author = profile.nickname.trim().slice(0, 40);
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      title,
      content,
      category,
      universe_slug: universeSlug || null,
      user_id: user.id,
      author,
      like_count: 0,
      comment_count: 0,
    })
    .select("id,title,content,category,universe_slug,author,image_url,user_id,like_count,comment_count,created_at,updated_at")
    .single();

  if (error) {
    console.error("POST /api/posts error:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, data }, { status: 201 });
}
