"use client";

import Link from "next/link";
import { Users, FileText, Zap, ChevronRight, Globe } from "lucide-react";
import { motion } from "framer-motion";
import type { UniverseItem } from "./universe.types";

interface UniverseCardProps {
  item: UniverseItem;
  index: number;
}

export default function UniverseCard({ item, index }: UniverseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative"
    >
      <Link
        href={`/universe/${item.slug}`}
        className="block relative h-full overflow-hidden rounded-[2rem] border border-slate-200/60 bg-white/70 p-6 backdrop-blur-2xl transition-all duration-500 hover:-translate-y-2 hover:border-violet-500/30 hover:bg-white/90 hover:shadow-[0_30px_60px_rgba(0,0,0,0.05)] dark:border-white/10 dark:bg-[#0c0c1e]/40 dark:hover:bg-[#0c0c1e]/60 dark:hover:shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
      >
        {/* Animated Background Pulse */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-violet-600/5 via-transparent to-fuchsia-600/5 opacity-60 transition-opacity duration-500 group-hover:opacity-100 dark:opacity-0 dark:group-hover:opacity-100" />
        
        {/* Decorative corner accents */}
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-500/5 blur-2xl transition-all duration-500 group-hover:bg-violet-500/10 group-hover:scale-150 dark:bg-violet-500/10 dark:group-hover:bg-violet-500/20" />
        <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-fuchsia-500/5 blur-2xl transition-all duration-500 group-hover:bg-fuchsia-500/10 group-hover:scale-150 dark:bg-fuchsia-500/5 dark:group-hover:bg-fuchsia-500/15" />

        <div className="relative flex flex-col h-full gap-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.15em] bg-slate-100 border border-slate-200 text-slate-500 dark:bg-white/5 dark:border-white/10 dark:text-white/40">
                  <Globe className="h-2.5 w-2.5" />
                  {item.category}
                </span>
                {item.isTrending && (
                  <span className="flex items-center gap-1 rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.15em] text-amber-600 animate-pulse dark:text-amber-400">
                    <Zap className="h-2.5 w-2.5 fill-current" />
                    Trending
                  </span>
                )}
              </div>
              <h3 className="text-xl font-black tracking-tight transition-colors leading-tight text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-300">
                {item.name}
              </h3>
            </div>
            
            {/* Visual Indicator */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-500 border border-slate-200 bg-slate-50 group-hover:bg-violet-600 group-hover:border-violet-400 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] dark:border-white/10 dark:bg-white/5">
              <ChevronRight className="h-5 w-5 transition-colors text-slate-300 group-hover:text-white dark:text-white/30" />
            </div>
          </div>

          {/* Description */}
          <p className="line-clamp-2 text-sm leading-relaxed font-medium transition-colors text-slate-500 dark:text-white/40 group-hover:text-slate-700 dark:group-hover:text-white/60">
            {item.description}
          </p>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors text-slate-400 border border-slate-100 bg-slate-50 group-hover:text-violet-600 group-hover:border-violet-200 dark:text-white/20 dark:border-white/5 dark:bg-white/5 dark:group-hover:text-violet-400/60 dark:group-hover:border-violet-400/10">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer: Stats Grid */}
          <div className="mt-auto pt-5 border-t border-slate-100 dark:border-white/5">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 p-3 rounded-2xl transition-colors bg-slate-50 border border-slate-100 group-hover:bg-slate-100 dark:bg-white/[0.03] dark:border-white/5 dark:group-hover:bg-white/[0.06] dark:group-hover:border-white/10">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
                    <Users className="h-3 w-3" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-white/30">Subscribers</span>
                </div>
                <p className="text-sm font-black text-slate-900 dark:text-white/90">{item.subscribers.toLocaleString()}</p>
              </div>
              
              <div className="flex flex-col gap-1.5 p-3 rounded-2xl transition-colors bg-slate-50 border border-slate-100 group-hover:bg-slate-100 dark:bg-white/[0.03] dark:border-white/5 dark:group-hover:bg-white/[0.06] dark:group-hover:border-white/10">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-fuchsia-500/10 text-fuchsia-500 dark:text-fuchsia-400">
                    <FileText className="h-3 w-3" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-white/30">Records</span>
                </div>
                <p className="text-sm font-black text-slate-900 dark:text-white/90">{item.posts.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}