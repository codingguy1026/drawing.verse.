"use client";

import Link from "next/link";
import { useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Compass, Move, Orbit, Sparkles } from "lucide-react";
import type { UniverseItem } from "./universe.types";

const PLANET_COLORS = [
  "from-violet-500 to-indigo-600",
  "from-sky-400 to-blue-600",
  "from-fuchsia-500 to-pink-600",
  "from-emerald-400 to-teal-600",
  "from-amber-400 to-orange-600",
  "from-rose-400 to-red-600",
];

function getPosition(id: string) {
  let hash = 0;

  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }

  return {
    x: Math.abs(hash % 900) - 450,
    y: Math.abs((hash >> 8) % 760) - 380,
  };
}

function Planet({ item, index }: { item: UniverseItem; index: number }) {
  const { x, y } = useMemo(() => getPosition(item.id), [item.id]);
  const colorClass = PLANET_COLORS[Math.abs(x + y) % PLANET_COLORS.length];
  const size = Math.min(Math.max(item.subscribers / 140 + 64, 72), 132);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 220,
        damping: 20,
        delay: Math.min(index * 0.04, 0.4),
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
      <Link
        href={`/universe/${item.slug}`}
        className="block h-full w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-4 dark:focus-visible:ring-offset-[#0b0d16]"
      >
        <div className="relative h-full w-full">
          <motion.div
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.96 }}
            animate={{ y: [0, -6, 0] }}
            transition={{
              y: {
                duration: 4 + (index % 3),
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            className={`h-full w-full rounded-full bg-gradient-to-br ${colorClass} shadow-[0_16px_40px_rgba(79,70,229,0.22)] ring-4 ring-white/65 dark:shadow-[0_0_36px_rgba(99,102,241,0.22)] dark:ring-white/15`}
          >
            <div className="absolute left-[22%] top-[18%] h-[22%] w-[22%] rounded-full bg-white/28 blur-[1px]" />
            <div className="absolute bottom-[20%] right-[18%] h-[16%] w-[16%] rounded-full bg-black/8" />
          </motion.div>

          <div className="absolute left-1/2 top-[calc(100%+12px)] -translate-x-1/2 whitespace-nowrap text-center">
            <h3 className="rounded-full border border-slate-200/80 bg-white/90 px-3 py-1.5 text-xs font-black text-slate-800 shadow-sm backdrop-blur-md transition group-hover:border-violet-200 group-hover:text-violet-700 dark:border-white/10 dark:bg-[#111322]/90 dark:text-white/80 dark:group-hover:border-violet-400/25 dark:group-hover:text-violet-200">
              {item.name}
            </h3>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function CosmicGalaxyExplorer({
  items = [],
}: {
  items?: UniverseItem[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0d0d19]">
      <header className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-400/10 dark:text-violet-200">
            <Orbit className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-600 dark:text-violet-300">
              Galaxy map
            </p>
            <h2 className="mt-0.5 text-lg font-black text-slate-950 dark:text-white">
              유니버스를 항성계로 둘러보기
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-white/40">
              지도를 드래그해서 움직이고, 행성을 눌러 유니버스에 들어가세요.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-500 dark:text-white/40">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-white/5">
            <Move className="h-3.5 w-3.5" />
            드래그 이동
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-white/5">
            <Compass className="h-3.5 w-3.5" />
            {items.length}개 표시
          </span>
        </div>
      </header>

      <div
        ref={containerRef}
        className="relative h-[480px] w-full overflow-hidden bg-gradient-to-br from-violet-50 via-white to-sky-50 sm:h-[560px] lg:h-[620px] dark:from-[#111426] dark:via-[#0b0d17] dark:to-[#121827]"
      >
        <div className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-55">
          <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-violet-300/30 blur-[100px] dark:bg-violet-600/15" />
          <div className="absolute -bottom-28 right-0 h-96 w-96 rounded-full bg-sky-300/25 blur-[110px] dark:bg-sky-500/10" />
          <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-200/20 blur-[100px] dark:bg-fuchsia-500/8" />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(99,102,241,0.16)_1px,transparent_0)] [background-size:32px_32px] opacity-40 dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.13)_1px,transparent_0)] dark:opacity-25" />

        <div className="pointer-events-none absolute left-1/2 top-1/2 z-[5] -translate-x-1/2 -translate-y-1/2">
          <div className="relative grid h-20 w-20 place-items-center rounded-full border border-violet-300/60 bg-white/75 shadow-[0_0_50px_rgba(139,92,246,0.2)] backdrop-blur-xl dark:border-violet-400/20 dark:bg-violet-400/10">
            <div className="absolute h-32 w-32 rounded-full border border-violet-300/25 dark:border-violet-400/10" />
            <div className="absolute h-48 w-48 rounded-full border border-violet-300/15 dark:border-violet-400/8" />
            <Sparkles className="h-7 w-7 text-violet-600 dark:text-violet-200" />
          </div>
        </div>

        {items.length === 0 ? (
          <div className="relative z-20 flex h-full items-center justify-center px-6 text-center">
            <div className="max-w-sm rounded-[1.5rem] border border-slate-200 bg-white/85 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-[#111322]/85">
              <div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-400/10 dark:text-violet-200">
                <Orbit className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-black text-slate-950 dark:text-white">
                표시할 유니버스가 없어요
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-white/40">
                검색이나 필터를 바꾸면 이 지도에 유니버스가 다시 나타나요.
              </p>
            </div>
          </div>
        ) : (
          <motion.div
            drag
            dragConstraints={containerRef}
            dragElastic={0.08}
            dragMomentum={false}
            className="relative left-1/2 top-1/2 h-[1800px] w-[1800px] -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none active:cursor-grabbing"
          >
            {items.map((item, index) => (
              <Planet key={item.id} item={item} index={index} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
