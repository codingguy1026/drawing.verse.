"use client";

import type { UniverseItem } from "./universe.types";
import UniverseCard from "./UniverseCard";

interface UniverseGridProps {
  items: UniverseItem[];
  joinedSlugs?: Set<string>;
}

export default function UniverseGrid({ items, joinedSlugs }: UniverseGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center dark:border-white/10 dark:bg-white/[0.03]">
        <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-2xl dark:bg-white/5">
          🌌
        </div>
        <h3 className="text-lg font-black text-slate-950 dark:text-white">조건에 맞는 유니버스가 없어요</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-white/40">
          검색어나 카테고리를 바꾸거나 다른 탐색 탭을 열어보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item, index) => (
        <UniverseCard
          key={item.id}
          item={item}
          index={index}
          joined={joinedSlugs?.has(item.slug) ?? false}
        />
      ))}
    </div>
  );
}
