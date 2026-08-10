export const runtime = "nodejs";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type RouteParams = {
  params: Promise<{ id: string }>;
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
            // 읽기 전용 요청에서는 쿠키 갱신 실패를 무시해도 됨.
          }
        },
      },
    }
  );
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

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  if (!id?.trim()) {
    return NextResponse.json(
      { ok: false, error: "해당 글을 찾을 수 없어요." },
      { status: 404 }
    );
  }

  const supabase = await getServerSupabase();
  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (postError) {
    console.error("GET /api/posts/[id] post error:", postError);
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

  const { data: comments, error: commentsError } = await supabase
    .from("comments")
    .select("id,post_id,author_id,author,content,created_at")
    .eq("post_id", String(id))
    .order("created_at", { ascending: true });

  if (commentsError) {
    console.error("GET /api/posts/[id] comments error:", commentsError);
    return NextResponse.json(
      {
        ok: false,
        error:
          "댓글 데이터를 불러오지 못했어요. supabase/migrations/20260810_community_comments.sql을 먼저 적용해 주세요.",
      },
      { status: 500 }
    );
  }

  const data = {
    id: String(post.id),
    title: post.title ?? "제목 없음",
    author: post.author ?? "익명",
    content: post.content ?? "",
    date: formatDate(post.created_at),
    views: post.views_count ?? post.view_count ?? post.views ?? 0,
    comments: (comments ?? []).map((comment) => ({
      id: String(comment.id),
      author: comment.author ?? "익명",
      content: comment.content ?? "",
      date: formatDate(comment.created_at),
    })),
    tag: post.category ?? post.tag ?? null,
    universeId: post.universe_slug ?? post.universe_id ?? null,
    likes: post.likes_count ?? post.like_count ?? post.likes ?? 0,
  };

  return NextResponse.json({ ok: true, data });
}
