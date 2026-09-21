"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, LockKeyhole, Orbit, PenLine, Sparkles } from "lucide-react";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { supabase } from "@/lib/supabase/client";

type WritableUniverse = {
  id: string | number;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  allow_member_posts: boolean | null;
  owner_id: string | null;
};

export default function UniverseWritePickerPage() {
  const { user, loading: authLoading } = useSupabaseUser();
  const [universes, setUniverses] = useState<WritableUniverse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadUniverses() {
      if (authLoading) return;

      if (!user) {
        setUniverses([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadError(false);

      const { data, error } = await supabase
        .from("universes")
        .select("id,slug,name,description,icon,allow_member_posts,owner_id")
        .order("created_at", { ascending: false });

      if (ignore) return;

      if (error) {
        console.error("Failed to load writable universes:", error);
        setLoadError(true);
        setLoading(false);
        return;
      }

      const writable = ((data ?? []) as WritableUniverse[]).filter(
        (universe) =>
          universe.owner_id === user.id || universe.allow_member_posts === true
      );

      setUniverses(writable);
      setLoading(false);
    }

    loadUniverses();

    return () => {
      ignore = true;
    };
  }, [authLoading, user]);

  return (
    <main className="relative min-h-screen bg-slate-50 px-4 pb-24 pt-10 text-slate-950 dark:bg-[#03050a] dark:text-white sm:px-6 sm:pt-14">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] overflow-hidden">
        <div className="absolute left-[8%] top-6 size-72 rounded-full bg-violet-400/10 blur-[110px]" />
        <div className="absolute right-[10%] top-12 size-80 rounded-full bg-sky-300/10 blur-[120px]" />
      </div>

      <section className="relative mx-auto w-full max-w-5xl">
        <div className="mb-8">
          <Link
            href="/universe"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-violet-600 dark:text-white/55"
          >
            <Orbit className="size-4" />
            유니버스 탐색
          </Link>

          <div className="mt-6 flex items-start gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-violet-600 text-white shadow-[0_12px_35px_rgba(124,58,237,.25)]">
              <PenLine className="size-5" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-violet-500">
                Start a new verse
              </p>
              <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                어디에 이야기를 남길까?
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-white/50">
                글을 작성할 유니버스를 골라줘. 선택하면 해당 유니버스의 에디터로 바로 이동해.
              </p>
            </div>
          </div>
        </div>

        {authLoading || loading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-[1.7rem] border border-slate-200 bg-white/70 dark:border-white/10 dark:bg-white/5"
              />
            ))}
          </div>
        ) : !user ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white/85 p-8 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.045]">
            <LockKeyhole className="mx-auto size-9 text-violet-500" />
            <h2 className="mt-4 text-xl font-black">로그인이 먼저 필요해</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-white/50">
              로그인하면 글을 쓸 수 있는 유니버스를 보여줄게.
            </p>
            <Link
              href="/auth/login"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white dark:bg-white dark:text-slate-950"
            >
              로그인하기
              <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : loadError ? (
          <div className="rounded-[2rem] border border-rose-200 bg-rose-50/80 p-7 text-center text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200">
            유니버스 목록을 불러오지 못했어. 잠시 뒤 다시 시도해줘.
          </div>
        ) : universes.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/60 p-9 text-center dark:border-white/15 dark:bg-white/[0.03]">
            <Sparkles className="mx-auto size-9 text-violet-500" />
            <h2 className="mt-4 text-xl font-black">지금 글을 쓸 수 있는 유니버스가 없어</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500 dark:text-white/50">
              새 유니버스를 만들거나, 멤버 글쓰기가 허용된 유니버스를 찾아봐.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
              <Link
                href="/universe/create"
                className="rounded-full bg-violet-600 px-5 py-3 text-sm font-black text-white"
              >
                유니버스 만들기
              </Link>
              <Link
                href="/universe"
                className="rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 dark:border-white/10 dark:text-white/60"
              >
                유니버스 둘러보기
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {universes.map((universe) => (
              <Link
                key={universe.id}
                href={`/universe/${encodeURIComponent(universe.slug)}/write`}
                className="group rounded-[1.7rem] border border-slate-200 bg-white/80 p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-[0_16px_45px_rgba(124,58,237,.10)] dark:border-white/10 dark:bg-white/[0.045] dark:hover:border-violet-400/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{universe.icon || "✦"}</span>
                      <h2 className="truncate text-lg font-black">{universe.name}</h2>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-white/45">
                      {universe.description || "이 유니버스에 새로운 이야기를 남겨봐."}
                    </p>
                  </div>
                  <ArrowRight className="mt-1 size-5 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-violet-500" />
                </div>

                <div className="mt-5 text-xs font-bold text-violet-500">
                  {universe.owner_id === user.id ? "내 유니버스" : "멤버 글쓰기 허용"}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
