"use client";

import { motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";

interface UniverseHeroProps {
  search: string;
  onSearchChange: (value: string) => void;
  quickTags: string[];
  onTagClick: (tag: string) => void;
}

const particles = [
  { left: "8%", top: "22%", size: 2, delay: 0.1 },
  { left: "18%", top: "72%", size: 1, delay: 1.4 },
  { left: "31%", top: "16%", size: 1, delay: 0.7 },
  { left: "43%", top: "82%", size: 2, delay: 2.1 },
  { left: "58%", top: "18%", size: 1, delay: 1.1 },
  { left: "69%", top: "68%", size: 1, delay: 2.6 },
  { left: "81%", top: "23%", size: 2, delay: 1.8 },
  { left: "91%", top: "76%", size: 1, delay: 0.4 },
];

export default function UniverseHero({
  search,
  onSearchChange,
}: UniverseHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/60 px-5 py-7 shadow-[0_24px_70px_rgba(74,58,130,0.08)] backdrop-blur-3xl transition-colors duration-500 sm:px-7 sm:py-8 lg:px-10 lg:py-9 dark:border-white/10 dark:bg-[#070812]/64 dark:shadow-[0_24px_70px_rgba(0,0,0,0.42)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-28 h-72 w-72 rounded-full bg-violet-400/10 blur-[90px] dark:bg-violet-500/15" />
        <div className="absolute -bottom-28 right-[8%] h-72 w-72 rounded-full bg-sky-300/10 blur-[95px] dark:bg-sky-500/10" />
        <div className="absolute right-[18%] top-1/2 h-52 w-52 -translate-y-1/2 rounded-full border border-violet-300/15 dark:border-white/[0.05]" />
        <div className="absolute right-[18%] top-1/2 h-32 w-32 -translate-y-1/2 rounded-full border border-sky-300/15 dark:border-white/[0.04]" />

        {particles.map((particle, index) => (
          <motion.span
            key={index}
            className="absolute rounded-full bg-violet-400/45 dark:bg-white/55"
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
            }}
            animate={{ opacity: [0.18, 0.72, 0.18], scale: [1, 1.45, 1] }}
            transition={{
              duration: 3.6 + (index % 3) * 0.7,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 grid items-center gap-7 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)] lg:gap-12">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/10 bg-violet-500/[0.055] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.24em] text-violet-600 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-200"
          >
            <Sparkles className="h-3 w-3" />
            Gateway to Infinite Worlds
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="max-w-xl text-[2.35rem] font-black leading-[1.03] tracking-[-0.055em] text-slate-950 sm:text-5xl lg:text-[3.35rem] dark:text-white"
          >
            가장 눈부신
            <span className="ml-2 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-sky-500 bg-clip-text text-transparent dark:from-violet-300 dark:via-fuchsia-300 dark:to-sky-300">
              당신만의 세계관
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.12 }}
            className="mt-4 max-w-xl text-sm font-medium leading-6 text-slate-500 sm:text-[15px] dark:text-white/46"
          >
            수많은 유니버스 사이에서 새로운 세계를 발견하고, 바로 탐험을 시작하세요.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.14 }}
          className="relative w-full"
        >
          <div className="pointer-events-none absolute -inset-5 rounded-[2rem] bg-gradient-to-r from-violet-500/8 via-fuchsia-500/5 to-sky-500/8 blur-2xl opacity-70 dark:from-violet-500/12 dark:to-sky-500/10" />
          <label className="group relative flex h-14 items-center overflow-hidden rounded-2xl border border-slate-200/90 bg-white/82 shadow-[0_12px_32px_rgba(74,58,130,0.08)] transition focus-within:border-violet-400/45 focus-within:shadow-[0_16px_40px_rgba(124,58,237,0.12)] dark:border-white/10 dark:bg-white/[0.055] dark:shadow-[0_12px_32px_rgba(0,0,0,0.2)] dark:focus-within:border-violet-400/35">
            <span className="ml-2.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-500/[0.08] text-violet-600 transition group-focus-within:scale-105 group-focus-within:bg-violet-500/[0.12] dark:bg-white/[0.06] dark:text-violet-300">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="유니버스 검색"
              className="h-full min-w-0 flex-1 bg-transparent px-3 text-[14px] font-medium text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-white/25"
            />
            <span className="mr-3 hidden rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-400 sm:block dark:border-white/10 dark:bg-white/[0.04] dark:text-white/30">
              SEARCH
            </span>
          </label>

          <p className="mt-2.5 px-1 text-[11px] font-medium text-slate-400 dark:text-white/28">
            이름이나 관심 주제로 빠르게 찾아보세요.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
