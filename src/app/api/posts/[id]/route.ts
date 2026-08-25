export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

type RouteParams = {
  params: Promise<{ id: string }>;
};

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
  const postId = Number(id);

  if (!Number.isSafeInteger(postId) || postId <= 0) {
    return NextResponse.json(
      { ok: false, error: "해당 글을 찾을 수 없어요." },
      { status: 404 }
    );
  }

  const supabase = await createServerSupabase();
  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
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

  let comments: Array<{
    id: number;
    post_id: number;
    user_id: string;
    author: string;
    content: string;
    created_at: string;
  }> = [];

  const commentsResult = await supabase
    .from("comments")
    .select("id,post_id,user_id,author,content,created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (commentsResult.error) {
    // The migration may not have been applied yet. The post should still open.
    console.warn("GET /api/posts/[id] comments unavailable:", commentsResult.error.message);
  } else {
    comments = (commentsResult.data ?? []) as typeof comments;
  }

  let viewCount = Number((post as { view_count?: number | null }).view_count ?? 0);
  const incrementResult = await supabase.rpc("increment_post_view", {
    target_post_id: postId,
  });

  if (!incrementResult.error && typeof incrementResult.data === "number") {
    viewCount = incrementResult.data;
  }

  const data = {
    id: String(post.id),
    title: post.title ?? "제목 없음",
    author: post.author ?? "익명",
    content: post.content ?? "",
    date: formatDate(post.created_at),
    createdAt: post.created_at,
    views: viewCount,
    comments: comments.map((comment) => ({
      id: String(comment.id),
      userId: comment.user_id,
      author: comment.author ?? "익명",
      content: comment.content ?? "",
      date: formatDate(comment.created_at),
      createdAt: comment.created_at,
    })),
    tag: post.category ?? null,
    universeId: post.universe_slug ?? null,
    likes: post.like_count ?? 0,
    imageUrl: post.image_url ?? null,
    userId: post.user_id ?? null,
  };

  return NextResponse.json({ ok: true, data });
}
