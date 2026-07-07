"use client";

import { Search, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface UniverseHeroProps {
  search: string;
  onSearchChange: (value: string) => void;
  quickTags: string[];
  onTagClick: (tag: string) => void;
}

export default function UniverseHero({
  search,
  onSearchChange,
  quickTags,
  onTagClick,
}: UniverseHeroProps) {
  return (
    <section className="relative min-h-[460px] flex items-center overflow-hidden rounded-[3.rem] border border-slate-200 bg-white/70 p-8 md:p-16 lg:p-20 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.05)] transition-colors duration-500 dark:border-white/10 dark:bg-[#080816]/70 dark:shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
      {/* Immersive Background Particles */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 -top-20 h-[500px] w-[500px] rounded-full bg-violet-400/5 blur-[100px] animate-pulse dark:bg-violet-600/10 dark:blur-[130px]" />
        <div className="absolute -right-20 -bottom-20 h-[500px] w-[500px] rounded-full bg-fuchsia-400/5 blur-[100px] dark:bg-fuchsia-600/10 dark:blur-[130px]" />
        
        {/* Animated Stars / Particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0.1, 0.4, 0.1], 
              scale: [1, 1.2, 1],
              x: [0, Math.random() * 20 - 10, 0],
              y: [0, Math.random() * 20 - 10, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            className="absolute h-1 w-1 bg-violet-400/20 rounded-full dark:bg-white"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              boxShadow: "0 0 10px rgba(139, 92, 246, 0.2)",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center gap-2 rounded-full border border-violet-500/10 bg-violet-500/5 px-5 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.05)] dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300 dark:shadow-[0_0_15px_rgba(139,92,246,0.2)]"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Gateway to Infinite Worlds
        </motion.div>

        {/* Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 text-5xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[1.05] dark:text-white"
        >
          가장 눈부신 <br />
          <span className="relative inline-block">
            <span className="relative z-10 bg-gradient-to-r from-violet-600 via-slate-800 to-sky-600 bg-clip-text text-transparent dark:from-violet-400 dark:via-white dark:to-sky-400">
              당신만의 세계관
            </span>
            <div className="absolute -bottom-2 inset-x-0 h-4 bg-violet-500/10 blur-xl dark:bg-violet-500/20" />
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12 text-lg md:text-xl text-slate-500 font-medium leading-relaxed dark:text-white/50"
        >
          수천 개의 유니버스가 당신의 영감을 기다리고 있습니다. <br className="hidden md:block" />
          상상이 현실이 되는 드로잉 버스의 중심에서 새로운 우주를 탐험하세요.
        </motion.p>

        {/* Search Box */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative w-full max-w-2xl group"
        >
          <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-violet-600/10 via-fuchsia-600/10 to-sky-600/10 opacity-0 blur-2xl transition duration-700 group-focus-within:opacity-100 dark:from-violet-600/20 dark:via-fuchsia-600/20 dark:to-sky-600/20" />
          <div className="relative flex items-center">
            <div className="absolute left-7 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 border border-slate-200 shadow-sm transition-transform group-focus-within:scale-110 dark:bg-white/5 dark:border-white/10">
              <Search className="h-4 w-4 text-violet-500" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="탐험하고 싶은 세계관의 이름을 입력하세요"
              className="h-18 w-full rounded-[2.5rem] border border-slate-200 bg-slate-50 pl-20 pr-10 text-lg text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-violet-500/40 focus:bg-white focus:shadow-[0_0_40px_rgba(139,92,246,0.1)] dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-white/20 dark:focus:border-violet-500/40 dark:focus:bg-white/[0.05] dark:focus:shadow-[0_0_40px_rgba(139,92,246,0.15)]"
            />
          </div>
        </motion.div>


      </div>
    </section>
  );
}