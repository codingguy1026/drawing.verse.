export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getPostById, getPosts } from "@/lib/postsStore";

type RouteParams = {
  params: Promise<{
    postId: string;
  }>;
};

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { postId: postIdStr } = await params;
  const postId = Number(postIdStr);

  if (!Number.isFinite(postId)) {
    return NextResponse.json(
      { ok: false, error: "유효한 게시글 ID가 아니야!" },
      { status: 400 }
    );
  }

  const post = getPostById(postId);

  if (!post) {
    return NextResponse.json(
      { ok: false, error: "해당 글을 찾을 수 없어!" },
      { status: 404 }
    );
  }

  const body = await req.json();
  const { author, content } = body;

  if (!author || !content) {
    return NextResponse.json(
      { ok: false, error: "작성자와 내용은 필수야!" },
      { status: 400 }
    );
  }

  const newComment = {
    id: post.comments.length + 1,
    author,
    content,
    date: "방금 전",
  };

  post.comments.push(newComment);

  return NextResponse.json({ ok: true, data: newComment });
}
