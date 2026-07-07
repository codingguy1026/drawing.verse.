"use client";

import type { UniverseItem } from "./universe.types";
import UniverseCard from "./UniverseCard";

interface UniverseGridProps {
  items: UniverseItem[];
}

export default function UniverseGrid({ items }: UniverseGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
        <div className="mb-4 h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center dark:bg-white/5">
          <span className="text-3xl">🫠</span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">검색 결과가 없습니다</h3>
        <p className="text-sm text-slate-500 dark:text-white/40">다른 검색어나 카테고리를 시도해보세요.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {items.map((item, index) => (
        <UniverseCard key={item.id} item={item} index={index} />
      ))}
    </div>
  );
}