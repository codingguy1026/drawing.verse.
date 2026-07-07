"use client";

import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { UniverseCategory } from "./universe.types";

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
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sortOptions = [
    { value: "popular", label: "인기순" },
    { value: "latest", label: "최신순" },
    { value: "active", label: "활동순" },
  ];

  const activeSortLabel = sortOptions.find(o => o.value === sort)?.label || "정렬";

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between sticky top-[80px] z-30 py-4 bg-slate-50/90 dark:bg-[#0a0a1f]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 -mx-4 px-4 md:-mx-6 md:px-6 xl:-mx-8 xl:px-8 transition-all duration-300">
      {/* Categories Scrollable */}
      <div className="flex-1 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all ${
                activeCategory === cat
                  ? "bg-violet-600 dark:bg-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)] scale-105"
                  : "bg-slate-100/90 dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-950 dark:hover:text-white border border-slate-200 dark:border-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          <span className="text-violet-600 dark:text-violet-400 font-bold">{resultCount}</span>개의 유니버스
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          {viewMode && onViewModeChange && (
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100/90 dark:bg-white/5 border border-slate-200 dark:border-white/10 mr-1 shrink-0">
              <button
                onClick={() => onViewModeChange("map")}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${
                  viewMode === "map"
                    ? "bg-violet-600 dark:bg-violet-500 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
                title="인터랙티브 2D 항성계 지도"
              >
                🌌 항성계
              </button>
              <button
                onClick={() => onViewModeChange("grid")}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${
                  viewMode === "grid"
                    ? "bg-violet-600 dark:bg-violet-500 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
                title="그리드 리스트"
              >
                📋 리스트
              </button>
            </div>
          )}

          <div className="relative" ref={sortRef}>
            <button 
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100/90 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-800 dark:text-slate-200 transition-all"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              {activeSortLabel}
              <ChevronDown className={`w-4 h-4 text-slate-600 dark:text-slate-300 transition-transform ${isSortOpen ? "rotate-180" : ""}`} />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 top-full mt-2 w-32 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      onSortChange(opt.value);
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors ${
                      sort === opt.value 
                        ? "bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300" 
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
