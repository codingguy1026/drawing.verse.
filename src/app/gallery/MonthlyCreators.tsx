"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type MonthlyCreator = {
  id: string;
  nickname: string | null;
  display_name: string | null;
  avatar_url: string | null;
  followers_count: number | null;
  tags: string[] | null;
  artworks_count: number | null;
  monthly_score: number | string | null;
};

function getDisplayName(creator: MonthlyCreator) {
  return creator.display_name?.trim() || creator.nickname?.trim() || "이름 없는 창작자";
}

function getInitial(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || "D";
}

function compactNumber(value: number | null | undefined) {
  return new Intl.NumberFormat("ko-KR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value ?? 0);
}

export default function MonthlyCreators() {
  const [creators, setCreators] = React.useState<MonthlyCreator[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let ignore = false;

    async function loadCreators() {
      setLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase.rpc("get_monthly_creators", {
        limit_count: 3,
      });

      if (ignore) return;

      if (rpcError) {
        console.error("Monthly creators load error:", rpcError);
        setError("이달의 창작자를 불러오지 못했어요.");
        setCreators([]);
      } else {
        setCreators((data ?? []) as MonthlyCreator[]);
      }

      setLoading(false);
    }

    loadCreators();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="bg-white px-4 pb-12 text-slate-950 transition-colors duration-700 dark:bg-[#03050a] dark:text-white sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl rounded-[48px] border border-white bg-slate-50/70 p-8 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] md:p-12 lg:p-16">
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-lg shadow-indigo-500/20">
            <Star className="h-5 w-5" />
          </div>

          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">이달의 창작자</h2>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            이번 달 갤러리 활동과 작품 반응을 바탕으로 자동 선정돼요. 작품 수, 좋아요, 댓글,
            조회수와 팔로워 신호를 함께 반영해 가장 뜨거운 창작자를 보여줘요.
          </p>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-[360px] animate-pulse rounded-[40px] bg-white shadow-sm dark:bg-white/5"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-[36px] border border-rose-200 bg-rose-50 px-6 py-12 text-center dark:border-rose-500/20 dark:bg-rose-500/10">
            <p className="font-black text-rose-600 dark:text-rose-300">{error}</p>
            <p className="mt-2 text-sm text-rose-500/80 dark:text-rose-200/70">
              잠시 후 다시 열어보면 신호가 돌아올 수도 있어요.
            </p>
          </div>
        ) : creators.length === 0 ? (
          <div className="flex flex-col items-center rounded-[40px] border border-dashed border-slate-200 bg-white/70 px-6 py-16 text-center dark:border-white/10 dark:bg-white/[0.035]">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-500 dark:text-violet-300">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-black">아직 이달의 창작자가 없어요</h3>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              이번 달 첫 작품이 올라오면 실제 활동 데이터를 바탕으로 자동 선정이 시작돼요.
            </p>
            <Link
              href="/gallery/upload"
              className="mt-6 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white transition hover:bg-indigo-600 dark:bg-white dark:text-slate-950 dark:hover:bg-indigo-200"
            >
              첫 작품 올리기
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {creators.map((creator, index) => {
              const name = getDisplayName(creator);
              const tags = (creator.tags ?? []).filter(Boolean).slice(0, 3);
              const score = Number(creator.monthly_score ?? 0);

              return (
                <article
                  key={creator.id}
                  className="group relative flex flex-col items-center overflow-hidden rounded-[40px] border border-white bg-white p-8 text-center shadow-sm transition-all hover:-translate-y-2 hover:shadow-xl dark:border-white/10 dark:bg-[#0b0e14]/80"
                >
                  <div className="absolute inset-x-0 top-0 h-1.5 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-sky-400 opacity-70 transition-opacity group-hover:opacity-100" />

                  <span className="absolute right-5 top-5 rounded-full bg-violet-500/10 px-3 py-1 text-[10px] font-black tracking-wider text-violet-600 dark:text-violet-300">
                    MONTHLY #{index + 1}
                  </span>

                  <div className="relative mb-5 h-20 w-20 overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-500 to-indigo-500 text-2xl font-black text-white shadow-lg shadow-indigo-500/25">
                    {creator.avatar_url ? (
                      <Image
                        src={creator.avatar_url}
                        alt={`${name} 프로필 이미지`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">{getInitial(name)}</div>
                    )}
                  </div>

                  <h3 className="text-xl font-black dark:text-white">{name}</h3>

                  {creator.nickname && (
                    <p className="mt-1 text-xs font-bold text-slate-400">@{creator.nickname}</p>
                  )}

                  <div className="mt-3 flex min-h-7 flex-wrap justify-center gap-2">
                    {tags.length > 0 ? (
                      tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-500 dark:bg-white/5 dark:text-slate-400"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-400 dark:bg-white/5">
                        창작 활동 중
                      </span>
                    )}
                  </div>

                  <div className="mt-6 grid w-full grid-cols-3 gap-2">
                    <div className="rounded-2xl bg-slate-50 px-2 py-3 dark:bg-white/5">
                      <p className="text-sm font-black">{compactNumber(creator.followers_count)}</p>
                      <p className="mt-1 text-[9px] font-bold text-slate-400">팔로워</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-2 py-3 dark:bg-white/5">
                      <p className="text-sm font-black">{compactNumber(creator.artworks_count)}</p>
                      <p className="mt-1 text-[9px] font-bold text-slate-400">이번 달 작품</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-2 py-3 dark:bg-white/5">
                      <p className="text-sm font-black">{Number.isFinite(score) ? score.toFixed(1) : "0.0"}</p>
                      <p className="mt-1 text-[9px] font-bold text-slate-400">활동 점수</p>
                    </div>
                  </div>

                  <Link
                    href={`/users/${creator.id}`}
                    className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 py-3 text-xs font-black text-white transition-all group-hover:bg-indigo-600 dark:bg-white dark:text-slate-950 dark:group-hover:bg-indigo-300"
                  >
                    프로필 방문
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
