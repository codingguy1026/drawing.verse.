import Link from "next/link";
import React, { useRef, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronRight,
  Clock3,
  Disc3,
  Headphones,
  MessageCircle,
  Music2,
  Orbit,
  Plus,
  Radio,
  Sparkles,
  Star,
  Users,
  BookOpen,
} from "lucide-react";
import { UniverseItem } from "./universe.types";

type UniverseTheme = "dreamcore" | "space" | "neon";

type Universe = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  theme: UniverseTheme;
  tags: string[];
  stats: {
    series: number;
    tracks: number;
    members: string;
  };
};

type SeriesItem = {
  id: string;
  title: string;
  description: string;
  tracks: number;
  posts: number;
  mood: string;
  updatedAt: string;
};

type TrackItem = {
  id: string;
  title: string;
  series: string;
  mood: string;
  duration: string;
};

type SatelliteItem = {
  id: string;
  name: string;
  description: string;
};

type ActivityItem = {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
};

const PLANET_COLORS = [
  "from-violet-500 to-indigo-600",
  "from-sky-400 to-blue-600",
  "from-fuchsia-500 to-pink-600",
  "from-emerald-400 to-teal-600",
  "from-amber-400 to-orange-600",
  "from-rose-400 to-red-600",
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getPosition(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const x = (Math.abs(hash % 1000) - 500);
  const y = (Math.abs((hash >> 8) % 1000) - 500);
  return { x, y };
}

function Planet({ item, index }: { item: UniverseItem; index: number }) {
  const { x, y } = useMemo(() => getPosition(item.id), [item.id]);
  const colorClass = PLANET_COLORS[Math.abs(x + y) % PLANET_COLORS.length];
  const size = Math.min(Math.max(item.subscribers / 100 + 60, 80), 160);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: index * 0.05 }}
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
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            animate={{ y: [0, -10, 0] }}
            transition={{ y: { duration: 4 + (index % 3), repeat: Infinity, ease: "easeInOut" } }}
            className={`h-full w-full rounded-full bg-gradient-to-br ${colorClass} shadow-[0_0_40px_rgba(0,0,0,0.3)] ring-2 ring-white/20`}
          />
          <div className="absolute top-[110%] left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
            <h3 className="text-sm font-black text-white drop-shadow-md">
              {item.name}
            </h3>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function CosmicGalaxyExplorer({ items = [] }: { items?: UniverseItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative h-[660px] w-full overflow-hidden rounded-[3rem] border border-white/10 bg-[#020208] shadow-2xl">
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-1/3 h-[400px] w-[400px] rounded-full bg-violet-600/10 blur-[120px]" />
      </div>

      <div className="relative h-full w-full" ref={containerRef}>
        <motion.div
          drag
          dragConstraints={containerRef}
          className="relative h-[2000px] w-[2000px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-grab"
        >
          {items.map((item, index) => (
            <Planet key={item.id} item={item} index={index} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
