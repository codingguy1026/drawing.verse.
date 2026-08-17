"use client";

import { Orbit, Plus, Search, Sparkles } from "lucide-react";

interface UniverseHeroProps {
  search: string;
  onSearchChange: (value: string) => void;
  quickTags: string[];
  onTagClick: (tag: string) => void;
  universeCount: number;
  onCreate: () => void;
}

export default function UniverseHero({
  search,
  onSearchChange,
  quickTags,
  onTagClick,
  universeCount,
  onCreate,
}: UniverseHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-white/10 dark:bg-[#0d0d19]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-violet-400/10 blur-3xl dark:bg-violet-500/15" />
      <div className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-sky-400/10 blur-3xl dark:bg-sky-500/10" />

      <div className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-black tracking-[0.14em] text-violet-700 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-200">
            <Sparkles className="h-3.5 w-3.5" />
            UNIVERSE
          </div>

          <h1 className="max-w-3xl text-3xl font-black tracking-tight text-slate-950 sm:text-4xl dark:text-white">
            관심사가 모이면 하나의 우주가 된다.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base dark:text-white/55">
            세계관, 팬아트, 캐릭터, 소설까지. 유니버스에 들어가 사람들과 글을 쓰고 이야기를 쌓아보세요.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {quickTags.slice(0, 6).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onTagClick(tag)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-violet-300 hover:text-violet-700 dark:border-white/10 dark:bg-white/5 dark:text-white/55 dark:hover:border-violet-400/30 dark:hover:text-violet-200"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-white/60">
              <Orbit className="h-4 w-4 text-violet-500" />
              탐색 가능한 유니버스
            </div>
            <strong className="text-lg text-slate-950 dark:text-white">{universeCount}</strong>
          </div>

          <button
            type="button"
            onClick={onCreate}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-violet-700 dark:bg-white dark:text-slate-950 dark:hover:bg-violet-100"
          >
            <Plus className="h-4 w-4" />
            새 유니버스 만들기
          </button>
        </div>
      </div>

      <div className="relative mt-6">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="유니버스 이름, 설명, 태그 검색"
          className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10 dark:border-white/10 dark:bg-black/20 dark:text-white dark:placeholder:text-white/25 dark:focus:border-violet-400/40 dark:focus:bg-white/[0.04]"
        />
      </div>
    </section>
  );
}
