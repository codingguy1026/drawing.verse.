import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

async function getServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
            // Server Component/Route 환경에서 쿠키 쓰기가 불가능한 경우 무시.
          }
        },
      },
    }
  );
}

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
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("GET /api/posts error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const supabase = await getServerSupabase();
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
      universe_slug: universeSlug || null,
      author_id: user.id,
      author,
      likes_count: 0,
      comments_count: 0,
      views_count: 0,
    })
    .select("*")
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
