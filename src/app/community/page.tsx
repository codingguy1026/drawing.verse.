import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Wave 이전 안내 | Drawing Verse" };

function waveUrl() {
  const value = process.env.DRAWING_CHAT_URL;
  if (!value) return null;
  try { const url = new URL(value); if (url.protocol !== "https:" || url.username || url.password) return null; url.searchParams.set("tab", "wave"); return url.toString(); } catch { return null; }
}
export default function CommunityPage() {
  const destination = waveUrl();
  return <main className="mx-auto max-w-2xl space-y-4 p-8"><p className="text-xs font-bold text-violet-500">DRAWING CHAT / WAVE</p><h1 className="text-3xl font-black">Verse Talk는 Wave로 이동했어요.</h1><p>실시간 대화는 인증, 메시지 권한, 차단·신고 기능의 검증이 끝날 때까지 제공되지 않습니다. 기존 채팅 데이터는 이번 변경으로 삭제하거나 복사하지 않았어요.</p>{destination && <a className="font-semibold underline" href={destination}>Drawing Chat의 Wave 안내 보기</a>}<Link className="block font-semibold underline" href="/">드버스 홈으로</Link></main>;
}
