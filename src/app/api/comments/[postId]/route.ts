export const runtime = "nodejs";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = {
  params: Promise<{
    postId: string;
  }>;
};

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
            // 쿠키 갱신이 불가능한 컨텍스트에서는 무시.
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

function formatDate(value: unknown) {
  if (typeof value !== "string" || !value) return "방금 전";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { postId } = await params;
  const supabase = await getServerSupabase();

  const { data, error } = await supabase
    .from("comments")
    .select("id,post_id,author_id,author,content,created_at")
    .eq("post_id", String(postId))
    .order("created_at", { ascending: true });

  if (error) {
    console.error("GET /api/comments/[postId] error:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    data: (data ?? []).map((comment) => ({
      id: String(comment.id),
      author: comment.author ?? "익명",
      content: comment.content ?? "",
      date: formatDate(comment.created_at),
    })),
  });
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { postId } = await params;
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
  const content = typeof body?.content === "string" ? body.content.trim() : "";

  if (!content) {
    return NextResponse.json(
      { ok: false, error: "댓글 내용을 입력해 주세요." },
      { status: 400 }
    );
  }

  if (content.length > 3000) {
    return NextResponse.json(
      { ok: false, error: "댓글은 3000자 이하로 작성해 주세요." },
      { status: 400 }
    );
  }

  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("id")
    .eq("id", postId)
    .maybeSingle();

  if (postError) {
    console.error("POST /api/comments/[postId] post lookup error:", postError);
    return NextResponse.json(
      { ok: false, error: postError.message },
      { status: 500 }
    );
  }

  if (!post) {
    return NextResponse.json(
      { ok: false, error: "해당 글을 찾을 수 없어요." },
      { status: 404 }
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

  const { data: newComment, error } = await supabase
    .from("comments")
    .insert({
      post_id: String(postId),
      author_id: user.id,
      author,
      content,
    })
    .select("id,author,content,created_at")
    .single();

  if (error) {
    console.error("POST /api/comments/[postId] insert error:", error);
    return NextResponse.json(
      {
        ok: false,
        error:
          "댓글 저장에 실패했어요. comments 테이블과 RLS 정책이 적용됐는지 확인해 주세요.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      data: {
        id: String(newComment.id),
        author: newComment.author ?? author,
        content: newComment.content ?? content,
        date: formatDate(newComment.created_at),
      },
    },
    { status: 201 }
  );
}
