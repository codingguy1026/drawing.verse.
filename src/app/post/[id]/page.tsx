import Link from "next/link";
import { redirect } from "next/navigation";
import { createRequestSupabase } from "@/lib/supabase/request";

export default async function LegacyPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createRequestSupabase();
  const numeric = /^\d+$/.test(id);
  const query = supabase.from("posts").select("id,public_id,universe_slug");
  const { data, error } = await (numeric ? query.eq("id", id) : query.eq("public_id", id)).maybeSingle();
  if (!error && data?.universe_slug) redirect(`/universe/${encodeURIComponent(data.universe_slug)}/${encodeURIComponent(data.public_id || data.id)}`);
  return <main className="mx-auto max-w-2xl space-y-4 p-8"><h1 className="text-2xl font-bold">게시글을 찾을 수 없어요</h1><p>이전 데모 게시글 주소이거나 현재 접근할 수 없는 글이에요. 실제 게시글은 유니버스에서 찾아볼 수 있어요.</p><Link className="underline" href="/search">통합 검색</Link><span> · </span><Link className="underline" href="/universe">유니버스</Link></main>;
}
