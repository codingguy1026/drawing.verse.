import { NextResponse } from "next/server";

// Retired demo endpoint. Real comments use authenticated Supabase storage.
export async function POST() {
  return NextResponse.json({ ok: false, error: "이전 댓글 API는 종료되었어요. 유니버스 게시글에서 댓글을 작성해 주세요." }, { status: 410 });
}
