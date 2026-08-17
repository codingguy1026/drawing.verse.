"use client";

import { Grid2X2, Map, SlidersHorizontal } from "lucide-react";

interface UniverseToolbarProps {
  categories: readonly string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  sort: string;
  onSortChange: (sort: string) => void;
  resultCount: number;
  viewMode?: "grid" | "map";
  onViewModeChange?: (mode: "grid" | "map") => void;
}

const sortOptions = [
  { value: "popular", label: "인기순" },
  { value: "latest", label: "최신순" },
  { value: "active", label: "활동순" },
];

export default function UniverseToolbar({
  categories,
  activeCategory,
  onCategoryChange,
  sort,
  onSortChange,
  resultCount,
  viewMode,
  onViewModeChange,
}: UniverseToolbarProps) {
  return (
    <section className="space-y-3 rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#0d0d19]">
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2 text-sm font-black text-slate-700 dark:text-white/65">
          <SlidersHorizontal className="h-4 w-4 text-violet-600 dark:text-violet-300" />
          필터
        </div>
        <span className="text-xs font-semibold text-slate-400 dark:text-white/30">
          {resultCount}개의 유니버스
        </span>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="overflow-x-auto pb-1 lg:pb-0">
          <div className="flex min-w-max gap-2">
            {categories.map((category) => {
              const active = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => onCategoryChange(category)}
                  className={`whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-bold transition ${
                    active
                      ? "bg-violet-600 text-white"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:bg-white/5 dark:text-white/45 dark:hover:bg-white/8 dark:hover:text-white"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value)}
            className="h-10 min-w-28 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-violet-300 dark:border-white/10 dark:bg-white/5 dark:text-white/65"
            aria-label="유니버스 정렬"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {viewMode && onViewModeChange && (
            <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-white/10 dark:bg-white/5">
              <button
                type="button"
                onClick={() => onViewModeChange("grid")}
                aria-label="리스트 보기"
                title="리스트 보기"
                className={`grid h-8 w-9 place-items-center rounded-lg transition ${
                  viewMode === "grid"
                    ? "bg-white text-violet-700 shadow-sm dark:bg-white/10 dark:text-violet-200"
                    : "text-slate-400 hover:text-slate-700 dark:text-white/30 dark:hover:text-white"
                }`}
              >
                <Grid2X2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange("map")}
                aria-label="항성계 보기"
                title="항성계 보기"
                className={`grid h-8 w-9 place-items-center rounded-lg transition ${
                  viewMode === "map"
                    ? "bg-white text-violet-700 shadow-sm dark:bg-white/10 dark:text-violet-200"
                    : "text-slate-400 hover:text-slate-700 dark:text-white/30 dark:hover:text-white"
                }`}
              >
                <Map className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
