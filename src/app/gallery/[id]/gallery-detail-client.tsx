"use client";

import Link from "next/link";
import * as React from "react";
import { ArrowLeft, CalendarDays, Eye, Heart, Image as ImageIcon, MessageCircle, UserRound } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type GalleryItem = {
  id: string;
  title?: string | null;
  description?: string | null;
  author?: string | null;
  user_id?: string | null;
  thumbnail_url?: string | null;
  image_url?: string | null;
  category?: string | null;
  tag?: string | null;
  created_at?: string | null;
  view_count?: number | null;
  like_count?: number | null;
  comment_count?: number | null;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
  nickname: string | null;
  avatar_url: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return "날짜 없음";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "날짜 없음";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export default function GalleryDetailClient({ id }: { id: string }) {
  const [item, setItem] = React.useState<GalleryItem | null>(null);
  const [profile, setProfile] = React.useState<ProfileRow | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState("");

  React.useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (ignore) return;

      if (error || !data) {
        setItem(null);
        setProfile(null);
        setErrorMessage(error ? "작품을 불러오는 중 문제가 생겼어요." : "작품을 찾을 수 없어요.");
        setLoading(false);
        return;
      }

      const nextItem = data as GalleryItem;
      setItem(nextItem);

      if (nextItem.user_id) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id,display_name,nickname,avatar_url")
          .eq("id", nextItem.user_id)
          .maybeSingle<ProfileRow>();

        if (!ignore) setProfile(profileData ?? null);
      }

      if (!ignore) setLoading(false);
    }

    load();

    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-[#03050a] sm:px-6">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="h-5 w-28 rounded bg-slate-200 dark:bg-white/10" />
          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,.8fr)]">
            <div className="aspect-[4/3] rounded-2xl bg-slate-200 dark:bg-white/10" />
            <div className="h-72 rounded-2xl bg-slate-200 dark:bg-white/10" />
          </div>
        </div>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 dark:bg-[#03050a] dark:text-white sm:px-6">
        <div className="mx-auto max-w-3xl">
          <Link href="/gallery" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-white/70">
            <ArrowLeft className="size-4" />
            갤러리로 돌아가기
          </Link>

          <section className="mt-8 border-t border-slate-200 py-10 dark:border-white/10">
            <h1 className="text-2xl font-black">작품을 찾을 수 없어요</h1>
            <p className="mt-2 text-sm text-slate-500">{errorMessage}</p>
          </section>
        </div>
      </main>
    );
  }

  const imageUrl = item.image_url || item.thumbnail_url;
  const authorName =
    profile?.display_name?.trim() ||
    profile?.nickname?.trim() ||
    item.author?.trim() ||
    "알 수 없는 사용자";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 dark:bg-[#03050a] dark:text-white sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <Link href="/gallery" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-950 dark:text-white/70 dark:hover:text-white">
          <ArrowLeft className="size-4" />
          갤러리로 돌아가기
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,.8fr)] lg:items-start">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.03]">
            {imageUrl ? (
              <img src={imageUrl} alt={item.title || "작품"} className="max-h-[75vh] w-full object-contain" />
            ) : (
              <div className="grid aspect-[4/3] place-items-center bg-slate-100 dark:bg-white/[0.03]">
                <ImageIcon className="size-12 text-slate-300 dark:text-white/20" />
              </div>
            )}
          </section>

          <aside className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
              <span>{item.category || item.tag || "아트워크"}</span>
              <span>·</span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5" />
                {formatDate(item.created_at)}
              </span>
            </div>

            <h1 className="mt-4 break-words text-3xl font-black tracking-tight sm:text-4xl">
              {item.title?.trim() || "제목 없는 작품"}
            </h1>

            <div className="mt-6 flex items-center gap-3 border-y border-slate-200 py-5 dark:border-white/10">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="size-11 rounded-full object-cover" />
              ) : (
                <div className="grid size-11 place-items-center rounded-full bg-slate-100 font-black text-slate-600 dark:bg-white/10 dark:text-white/70">
                  {authorName.slice(0, 1).toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                {item.user_id ? (
                  <Link href={`/users/${item.user_id}`} className="flex items-center gap-1.5 truncate text-sm font-black hover:underline">
                    <UserRound className="size-4 text-slate-400" />
                    {authorName}
                  </Link>
                ) : (
                  <p className="text-sm font-black">{authorName}</p>
                )}
                <p className="mt-1 text-xs text-slate-500">Drawing Verse creator</p>
              </div>
            </div>

            <div className="py-6">
              <h2 className="text-sm font-black">작품 설명</h2>
              <p className="mt-2 whitespace-pre-line break-words text-sm leading-7 text-slate-600 dark:text-white/65">
                {item.description?.trim() || "아직 작품 설명이 없어요."}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 border-t border-slate-200 pt-5 text-sm font-bold text-slate-600 dark:border-white/10 dark:text-white/65">
              <span className="inline-flex items-center gap-1.5"><Heart className="size-4" />{item.like_count ?? 0}</span>
              <span className="inline-flex items-center gap-1.5"><MessageCircle className="size-4" />{item.comment_count ?? 0}</span>
              <span className="inline-flex items-center gap-1.5"><Eye className="size-4" />{item.view_count ?? 0}</span>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
