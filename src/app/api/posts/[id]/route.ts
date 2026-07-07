// src/app/api/posts/[id]/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getPosts } from "@/lib/postsStore";

export async function GET(req: NextRequest) {
  // 1) URL 에서 직접 id 추출 (/api/posts/1 같은 경로)
  const url = new URL(req.url);
  const segments = url.pathname.split("/"); // ["", "api", "posts", "1"]
  const idStr = segments[segments.length - 1]; // "1"

  const idNumber = Number(idStr);

  if (!Number.isFinite(idNumber) || idNumber <= 0) {
    return NextResponse.json(
      { ok: false, error: "해당 글을 찾을 수 없어요." },
      { status: 404 }
    );
  }

  // 2) 전체 목록에서 찾아보기
  const all = getPosts();
  const post = all.find((p) => p.id === idNumber);

  if (!post) {
    return NextResponse.json(
      { ok: false, error: "해당 글을 찾을 수 없어요." },
      { status: 404 }
    );
  }

  // 3) 정상 응답
  return NextResponse.json({ ok: true, data: post });
}
