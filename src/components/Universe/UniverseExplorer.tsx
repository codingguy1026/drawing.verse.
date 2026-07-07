"use client";

import React, { useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { UniverseItem } from "./universe.types";
import Link from "next/link";
import { Users, BookOpen, Sparkles } from "lucide-react";

interface UniverseExplorerProps {
  items: UniverseItem[];
}

const PLANET_COLORS = [
  "from-violet-500 to-indigo-600",
  "from-sky-400 to-blue-600",
  "from-fuchsia-500 to-pink-600",
  "from-emerald-400 to-teal-600",
  "from-amber-400 to-orange-600",
  "from-rose-400 to-red-600",
];

// Helper to get a stable random position based on string ID
function getPosition(id: string, index: number) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Spread them out in a 1000x1000 area (tighter spread for better initial visibility)
  const x = (Math.abs(hash % 1000) - 500);
  const y = (Math.abs((hash >> 8) % 1000) - 500);
  
  return { x, y };
}

function Planet({ item, index }: { item: UniverseItem; index: number }) {
  const { x, y } = useMemo(() => getPosition(item.id, index), [item.id, index]);
  const colorClass = PLANET_COLORS[Math.abs(x + y) % PLANET_COLORS.length];
  
  // Size based on subscribers
  const size = Math.min(Math.max(item.subscribers / 100 + 60, 80), 160);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: index * 0.05 
      }}
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: size,
        height: size,
        marginLeft: -size / 2 + x,
        marginTop: -size / 2 + y,
      }}
      className="group z-10"
    >
      <Link href={`/universe/${item.slug}`}>
        <div className="relative h-full w-full">
          {/* Planet Body */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              y: {
                duration: 4 + (index % 3),
                repeat: Infinity,
                ease: "easeInOut",
              }
            }}
            className={`h-full w-full rounded-full bg-gradient-to-br ${colorClass} shadow-[0_0_40px_rgba(0,0,0,0.3)] ring-2 ring-white/20 transition-all duration-500 group-hover:shadow-[0_0_60px_rgba(255,255,255,0.2)]`}
          >
            {/* Atmospheric Glow */}
            <div className={`absolute inset-[-20%] rounded-full bg-gradient-to-br ${colorClass} opacity-20 blur-2xl transition-opacity group-hover:opacity-40`} />
            
            {/* Surface Detail/Texture */}
            <div className="absolute inset-0 rounded-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
          </motion.div>

          {/* Label */}
          <div className="absolute top-[110%] left-1/2 -translate-x-1/2 whitespace-nowrap text-center pointer-events-none">
            <h3 className="text-sm font-black transition-colors text-slate-900 drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)] dark:text-white dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] group-hover:text-violet-600 dark:group-hover:text-violet-300">
              {item.name}
            </h3>
            <div className="mt-1 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
               <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-white/60">
                 <Users className="h-3 w-3" /> {item.subscribers.toLocaleString()}
               </span>
               <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-white/60">
                 <BookOpen className="h-3 w-3" /> {item.posts.toLocaleString()}
               </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function UniverseExplorer({ items }: UniverseExplorerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative h-[660px] w-full overflow-hidden rounded-[3rem] border shadow-2xl transition-colors duration-500 border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-[#020208]">
      {/* Background Grid/Starfield */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute inset-[-100%] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 dark:opacity-100" />
        <div className="absolute top-1/4 left-1/3 h-[400px] w-[400px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[140px]" />
      </div>

      {/* Controller Instructions */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-8 left-8 z-20 flex items-center gap-3 rounded-2xl px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-xl border bg-white/40 text-slate-400 border-slate-200 dark:bg-black/40 dark:text-white/50 dark:border-white/10 shadow-none"
      >
        <Sparkles className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />
        Drag to Explore the Cosmos
      </motion.div>

      {/* Interactive Map Area */}
      <div className="relative h-full w-full overflow-hidden" ref={containerRef}>
        <motion.div
          drag
          dragConstraints={containerRef}
          dragElastic={0.2}
          className="relative h-[2000px] w-[2000px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
        >
          {items.map((item, index) => (
            <Planet key={item.id} item={item} index={index} />
          ))}
        </motion.div>
      </div>
      
      {/* HUD Info (Bottom Right) */}
      <div className="absolute bottom-8 right-8 z-20 text-right">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400">Sector Scan Complete</p>
        <p className="font-mono text-xs tracking-tighter text-slate-400 dark:text-white/40">{items.length} Worlds Identified</p>
      </div>
    </div>
  );
}
