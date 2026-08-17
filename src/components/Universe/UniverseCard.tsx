"use client";

import Link from "next/link";
import { ChevronRight, FileText, Globe2, Sparkles, Users } from "lucide-react";
import type { UniverseItem } from "./universe.types";

interface UniverseCardProps {
  item: UniverseItem;
  index: number;
  joined?: boolean;
}

export default function UniverseCard({ item, joined = false }: UniverseCardProps) {
  return (
    <Link
      href={`/universe/${item.slug}`}
      className="group flex h-full flex-col rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-lg dark:border-white/10 dark:bg-[#0d0d19] dark:hover:border-violet-400/25"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:bg-white/7 dark:text-white/50">
              <Globe2 className="h-3 w-3" />
              {item.category || "기타"}
            </span>
            {joined && (
              <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-black text-violet-700 dark:bg-violet-400/10 dark:text-violet-200">
                참여 중
              </span>
            )}
            {item.isNew && (
              <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-black text-sky-700 dark:bg-sky-400/10 dark:text-sky-200">
                NEW
              </span>
            )}
          </div>

          <h3 className="text-xl font-black tracking-tight text-slate-950 transition group-hover:text-violet-700 dark:text-white dark:group-hover:text-violet-200">
            {item.name}
          </h3>
        </div>

        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400 transition group-hover:border-violet-200 group-hover:bg-violet-50 group-hover:text-violet-700 dark:border-white/10 dark:bg-white/5 dark:text-white/35 dark:group-hover:border-violet-400/20 dark:group-hover:bg-violet-400/10 dark:group-hover:text-violet-200">
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-white/50">
        {item.description || "아직 소개가 없는 유니버스예요."}
      </p>

      {item.tags && item.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {item.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-500 dark:border-white/8 dark:text-white/35"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto pt-5">
        <div className="flex items-center gap-4 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500 dark:border-white/7 dark:text-white/40">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {item.subscribers.toLocaleString()}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            {item.posts.toLocaleString()}
          </span>
          {item.isTrending && (
            <span className="ml-auto inline-flex items-center gap-1 text-amber-600 dark:text-amber-300">
              <Sparkles className="h-3.5 w-3.5" />
              활발함
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
