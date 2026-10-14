"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import * as React from "react";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type ProfileRow = {
  display_name: string | null;
  nickname: string | null;
};

type GalleryRow = {
  id: string | number;
  title: string | null;
  thumbnail_url: string | null;
  category: string | null;
  created_at: string | null;
};

export default function UserGalleryPage() {
  const params = useParams();
  const rawId = params.id;
  const userId = Array.isArray(rawId) ? rawId[0] ?? "" : rawId ?? "";

  const [profile, setProfile] = React.useState<ProfileRow | null>(null);
  const [items, setItems] = React.useState<GalleryRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let ignore = false;

    async function load() {
      const [{ data: profileData }, { data: galleryData }] = await Promise.all([
        supabase.from("profiles").select("display_name,nickname").eq("id", userId).maybeSingle<ProfileRow>(),
        supabase
          .from("gallery")
          .select("id,title,thumbnail_url,category,created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
      ]);

      if (ignore) return;
      setProfile(profileData ?? null);
      setItems((galleryData as GalleryRow[] | null) ?? []);
      setLoading(false);
    }

    load();
    return () => {
      ignore = true;
    };
  }, [userId]);

  const name = profile?.display_name?.trim() || profile?.nickname?.trim() || "사용자";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 dark:bg-[#03050a] dark:text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Link href={`/users/${userId}`} className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-white/70">
          <ArrowLeft className="size-4" />
          프로필로 돌아가기
        </Link>

        <header className="mt-8 border-b border-slate-200 pb-6 dark:border-white/10">
          <p className="text-sm text-slate-500">{name}</p>
          <h1 className="mt-1 text-3xl font-black">갤러리</h1>
        </header>

        {loading ? (
          <div className="mt-6 h-64 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10" />
        ) : items.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500">아직 공개한 작품이 없어요.</p>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Link key={item.id} href={`/gallery/${item.id}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.03]">
                <div className="aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-white/[0.04]">
                  {item.thumbnail_url ? (
                    <img src={item.thumbnail_url} alt={item.title || "작품"} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center">
                      <ImageIcon className="size-9 text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs font-bold text-slate-500">{item.category || "아트워크"}</p>
                  <h2 className="mt-1 truncate text-base font-black">{item.title || "제목 없는 작품"}</h2>
                  <p className="mt-2 text-xs text-slate-400">{item.created_at ? new Date(item.created_at).toLocaleDateString("ko-KR") : "날짜 없음"}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
