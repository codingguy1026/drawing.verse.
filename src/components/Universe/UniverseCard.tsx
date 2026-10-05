"use client";

import Link from "next/link";
import { ChevronRight, FileText, Globe, Users, Zap } from "lucide-react";
import type { UniverseItem } from "./universe.types";

interface UniverseCardProps {
  item: UniverseItem;
  index: number;
}

export default function UniverseCard({ item }: UniverseCardProps) {
  return (
    <article className="group h-full">
      <Link
        href={`/universe/${item.slug}`}
        className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300 dark:border-white/10 dark:bg-[#111016] dark:hover:border-white/20"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-400 dark:text-white/35">
              <span className="inline-flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                {item.category}
              </span>
              {item.isTrending && (
                <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <Zap className="h-3.5 w-3.5" />
                  인기
                </span>
              )}
            </div>

            <h3 className="truncate text-lg font-black tracking-tight text-slate-900 dark:text-white">
              {item.name}
            </h3>
          </div>

          <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 dark:text-white/25" />
        </div>

        <p className="line-clamp-2 text-sm leading-6 text-slate-500 dark:text-white/45">
          {item.description}
        </p>

        {item.tags && item.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1">
            {item.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[11px] font-semibold text-slate-400 dark:text-white/30">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center gap-5 border-t border-slate-100 pt-4 text-xs font-bold text-slate-400 dark:border-white/5 dark:text-white/30">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {item.subscribers.toLocaleString()}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            {item.posts.toLocaleString()}
          </span>
        </div>
      </Link>
    </article>
  );
}
