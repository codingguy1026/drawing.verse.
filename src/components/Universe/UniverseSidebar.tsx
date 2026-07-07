"use client";

import Link from "next/link";
import { TrendingUp, Users, ChevronRight, Star } from "lucide-react";
import type { UniverseItem } from "./universe.types";

export default function UniverseSidebar({ items }: { items: UniverseItem[] }) {
  const trending = items.filter((i) => i.isTrending).slice(0, 5);
  
  return (
    <aside className="hidden flex-col gap-6 xl:flex w-[320px] shrink-0">
      {/* Trending Box */}
      <div className="rounded-[2rem] border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0a0a1f]/60 p-6 backdrop-blur-2xl shadow-xl dark:shadow-[0_0_40px_rgba(15,23,42,0.6)] relative overflow-hidden transition-all duration-300">
        <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-20 pointer-events-none">
          <TrendingUp className="w-24 h-24 text-violet-600 dark:text-violet-500" />
        </div>
        
        <div className="relative">
          <h3 className="flex items-center gap-2 text-lg font-black text-slate-800 dark:text-white mb-6">
            <TrendingUp className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            인기 급상승 유니버스
          </h3>
          
          <div className="flex flex-col gap-4">
            {trending.map((item, i) => (
              <Link 
                href={`/universe/${item.slug}`} 
                key={item.id}
                className="group flex items-start gap-4 p-3 -mx-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-xl font-black text-sm bg-violet-500/10 text-violet-600 dark:text-violet-300 border border-violet-500/20 group-hover:bg-violet-500/20 group-hover:scale-110 transition-all shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1 group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors">
                    {item.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-white/50">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {item.subscribers.toLocaleString()}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/20" />
                    <span>{item.category}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <Link href="/universe?sort=popular" className="flex items-center justify-center gap-1 w-full mt-6 py-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-bold text-slate-700 dark:text-white/70 transition-colors group">
            전체 순위 보기
            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Top Creators / Recommended Box */}
      <div className="rounded-[2rem] border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0a0a1f]/60 p-6 backdrop-blur-2xl shadow-xl dark:shadow-[0_0_40px_rgba(15,23,42,0.6)] relative overflow-hidden transition-all duration-300">
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative">
          <h3 className="flex items-center gap-2 text-lg font-black text-slate-800 dark:text-white mb-4">
            <Star className="h-5 w-5 text-fuchsia-500 dark:text-fuchsia-400" />
            이주의 추천
          </h3>
          <p className="text-sm text-slate-600 dark:text-white/60 mb-6 leading-relaxed">
            새로 생성된 흥미로운 유니버스를 탐험하고 첫 번째 구독자가 되어보세요!
          </p>
          
          <div className="flex flex-col gap-3">
            {items.filter(i => i.isNew).map(item => (
              <Link 
                href={`/universe/${item.slug}`} 
                key={item.id}
                className="group p-4 rounded-2xl bg-slate-100/50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-slate-300/80 dark:hover:border-white/10 transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm line-clamp-1 group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors">{item.name}</h4>
                  <span className="px-2 py-0.5 rounded-full bg-fuchsia-500/10 dark:bg-fuchsia-500/20 text-fuchsia-600 dark:text-fuchsia-300 text-[10px] font-bold">NEW</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-white/50 line-clamp-2 leading-relaxed">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
