import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, Heart, MessageCircle, UserRound } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function GalleryDetailPage({ params }: PageProps) {
  const { id } = await params;
  const galleryId = Number(id);
  if (!Number.isSafeInteger(galleryId) || galleryId <= 0) notFound();

  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("gallery")
    .select("id,title,author,thumbnail_url,category,view_count,like_count,comment_count,user_id,created_at")
    .eq("id", galleryId)
    .maybeSingle();

  if (error || !data) notFound();

  let viewCount = data.view_count ?? 0;
  const viewResult = await supabase.rpc("increment_gallery_view", {
    target_gallery_id: galleryId,
  });
  if (!viewResult.error && typeof viewResult.data === "number") {
    viewCount = viewResult.data;
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#070711] dark:text-white">
      <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 lg:px-8">
        <Link href="/gallery" className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:text-white/45 dark:hover:bg-white/5">
          <ArrowLeft className="h-4 w-4" /> 갤러리
        </Link>

        <article className="mt-4 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0d0d19]">
          <div className="bg-slate-100 dark:bg-white/[0.03]">
            {data.thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.thumbnail_url} alt={data.title} className="mx-auto max-h-[72vh] w-full object-contain" />
            ) : (
              <div className="grid aspect-video place-items-center text-sm font-semibold text-slate-400">이미지 없음</div>
            )}
          </div>

          <div className="p-5 sm:p-7">
            <p className="text-xs font-black uppercase tracking-[0.15em] text-violet-600 dark:text-violet-300">{data.category || "Gallery"}</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">{data.title}</h1>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-500 dark:text-white/45">
              {data.user_id ? (
                <Link href={`/users/${data.user_id}`} className="inline-flex items-center gap-1.5 hover:text-violet-600"><UserRound className="h-4 w-4" /> {data.author || "Anonymous"}</Link>
              ) : (
                <span className="inline-flex items-center gap-1.5"><UserRound className="h-4 w-4" /> {data.author || "Anonymous"}</span>
              )}
              <span>·</span>
              <span>{data.created_at ? new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(new Date(data.created_at)) : "날짜 없음"}</span>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-5 dark:border-white/10">
              <Stat icon={Eye} label="조회" value={viewCount} />
              <Stat icon={Heart} label="좋아요" value={data.like_count ?? 0} />
              <Stat icon={MessageCircle} label="댓글" value={data.comment_count ?? 0} />
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Eye; label: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 dark:bg-white/5 dark:text-white/50">
      <Icon className="h-3.5 w-3.5" /> {label} {value.toLocaleString("ko-KR")}
    </span>
  );
}
