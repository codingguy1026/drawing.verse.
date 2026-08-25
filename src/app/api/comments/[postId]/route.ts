export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

type RouteParams = {
  params: Promise<{ postId: string }>;
};

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

function parsePostId(value: string) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { postId } = await params;
  const numericPostId = parsePostId(postId);

  if (!numericPostId) {
    return NextResponse.json({ ok: false, error: "잘못된 글 번호예요." }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("comments")
    .select("id,post_id,user_id,author,content,created_at")
    .eq("post_id", numericPostId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("GET /api/comments/[postId] error:", error);
    return NextResponse.json(
      {
        ok: false,
        error:
          error.code === "42P01"
            ? "댓글 테이블이 아직 준비되지 않았어요. 20260825_supabase_alignment.sql migration을 적용해 주세요."
            : error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    data: (data ?? []).map((comment) => ({
      id: String(comment.id),
      postId: String(comment.post_id),
      userId: comment.user_id,
      author: comment.author ?? "익명",
      content: comment.content ?? "",
      date: formatDate(comment.created_at),
      createdAt: comment.created_at,
    })),
  });
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { postId } = await params;
  const numericPostId = parsePostId(postId);

  if (!numericPostId) {
    return NextResponse.json({ ok: false, error: "잘못된 글 번호예요." }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ ok: false, error: "로그인이 필요해요." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const content = typeof body?.content === "string" ? body.content.trim() : "";

  if (!content) {
    return NextResponse.json({ ok: false, error: "댓글 내용을 입력해 주세요." }, { status: 400 });
  }

  if (content.length > 3000) {
    return NextResponse.json({ ok: false, error: "댓글은 3000자 이하로 작성해 주세요." }, { status: 400 });
  }

  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("id")
    .eq("id", numericPostId)
    .maybeSingle();

  if (postError) {
    return NextResponse.json({ ok: false, error: postError.message }, { status: 500 });
  }

  if (!post) {
    return NextResponse.json({ ok: false, error: "해당 글을 찾을 수 없어요." }, { status: 404 });
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
      post_id: numericPostId,
      user_id: user.id,
      author,
      content,
    })
    .select("id,post_id,user_id,author,content,created_at")
    .single();

  if (error) {
    console.error("POST /api/comments/[postId] insert error:", error);
    return NextResponse.json(
      {
        ok: false,
        error:
          error.code === "42P01"
            ? "댓글 테이블이 아직 준비되지 않았어요. Supabase alignment migration을 적용해 주세요."
            : error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      data: {
        id: String(newComment.id),
        postId: String(newComment.post_id),
        userId: newComment.user_id,
        author: newComment.author ?? author,
        content: newComment.content ?? content,
        date: formatDate(newComment.created_at),
        createdAt: newComment.created_at,
      },
    },
    { status: 201 }
  );
}
