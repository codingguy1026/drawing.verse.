"use client";

import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  ChevronRight,
  Globe,
  MousePointer2,
  Orbit,
  Rocket,
  Star,
  Users,
} from "lucide-react";

interface Satellite {
  name: string;
  short: string;
  angle: number;
  speed: number;
  variant: string;
  tone: string;
  moons: string[];
  slug?: string;
  description?: string;
}

interface System {
  id: string;
  title: string;
  subtitle: string;
  x: number;
  y: number;
  orbit: number;
  starSize: number;
  glow: string;
  aura: string;
  count: number;
  category: string;
  satellites: Satellite[];
}

interface SelectedNode {
  type: string;
  name: string;
  path: string[];
  desc: string;
  slug?: string;
}

const galaxySystems: System[] = [
  {
    id: "sports",
    title: "Sports",
    subtitle: "응원과 승부가 모이는 대표 유니버스",
    x: 50,
    y: 50,
    orbit: 176,
    starSize: 106,
    glow: "from-orange-300 via-rose-400 to-fuchsia-500",
    aura: "rgba(244,114,182,0.42)",
    count: 12800,
    category: "인기",
    satellites: [
      { name: "야구 유니버스", short: "야", slug: "baseball", angle: 0, speed: 0.010, variant: "ring", tone: "from-orange-200 to-rose-300", moons: ["KBO", "MLB", "응원석"] },
      { name: "축구 유니버스", short: "축", slug: "soccer", angle: 90, speed: 0.008, variant: "leaf", tone: "from-emerald-200 to-lime-300", moons: ["K리그", "해외축구", "전술"] },
      { name: "농구 유니버스", short: "농", slug: "basketball", angle: 180, speed: 0.007, variant: "stripe", tone: "from-amber-200 to-orange-300", moons: ["KBL", "NBA", "하이라이트"] },
      { name: "e스포츠 유니버스", short: "E", slug: "esports", angle: 270, speed: 0.006, variant: "core", tone: "from-cyan-200 to-blue-300", moons: ["LoL", "발로란트", "대회"] },
    ],
  },
  {
    id: "illustration",
    title: "Illustration",
    subtitle: "색과 선으로 만든 그림 유니버스",
    x: 22,
    y: 28,
    orbit: 126,
    starSize: 86,
    glow: "from-cyan-200 via-sky-300 to-blue-500",
    aura: "rgba(103,232,249,0.34)",
    count: 34100,
    category: "팬아트",
    satellites: [
      { name: "낙서 유니버스", short: "낙", slug: "doodle", angle: 20, speed: 0.009, variant: "crater", tone: "from-sky-200 to-cyan-300", moons: ["연습장", "손그림"] },
      { name: "채색 유니버스", short: "채", slug: "coloring", angle: 150, speed: 0.007, variant: "ring", tone: "from-pink-200 to-violet-300", moons: ["빛", "팔레트"] },
      { name: "OC 유니버스", short: "OC", slug: "original-character", angle: 270, speed: 0.006, variant: "double", tone: "from-violet-200 to-fuchsia-300", moons: ["자캐", "프로필"] },
    ],
  },
  {
    id: "webtoon",
    title: "Webtoon",
    subtitle: "컷과 감정이 도는 이야기 유니버스",
    x: 78,
    y: 28,
    orbit: 126,
    starSize: 86,
    glow: "from-violet-200 via-purple-400 to-indigo-600",
    aura: "rgba(168,85,247,0.36)",
    count: 19500,
    category: "소설",
    satellites: [
      { name: "스토리 유니버스", short: "스", slug: "story", angle: 10, speed: 0.008, variant: "diamond", tone: "from-purple-200 to-indigo-300", moons: ["플롯", "떡밥"] },
      { name: "연출 유니버스", short: "연", slug: "directing", angle: 140, speed: 0.006, variant: "stripe", tone: "from-blue-200 to-violet-300", moons: ["컷", "구도"] },
      { name: "캐릭터 유니버스", short: "캐", slug: "character", angle: 260, speed: 0.005, variant: "halo", tone: "from-rose-200 to-purple-300", moons: ["주인공", "빌런"] },
    ],
  },
  {
    id: "music",
    title: "Music",
    subtitle: "소리가 빛나는 음악 유니버스",
    x: 24,
    y: 76,
    orbit: 114,
    starSize: 78,
    glow: "from-emerald-200 via-teal-300 to-cyan-500",
    aura: "rgba(45,212,191,0.32)",
    count: 8200,
    category: "최신",
    satellites: [
      { name: "작곡 유니버스", short: "곡", slug: "compose", angle: 60, speed: 0.008, variant: "wave", tone: "from-emerald-200 to-cyan-300", moons: ["멜로디", "코드"] },
      { name: "리믹스 유니버스", short: "믹", slug: "remix", angle: 230, speed: 0.006, variant: "core", tone: "from-teal-200 to-blue-300", moons: ["샘플", "루프"] },
    ],
  },
  {
    id: "character",
    title: "Character",
    subtitle: "캐릭터들이 살아가는 설정 유니버스",
    x: 76,
    y: 76,
    orbit: 114,
    starSize: 78,
    glow: "from-pink-200 via-rose-300 to-red-500",
    aura: "rgba(251,113,133,0.34)",
    count: 27400,
    category: "캐릭터",
    satellites: [
      { name: "설정 유니버스", short: "설", slug: "settings", angle: 40, speed: 0.008, variant: "crater", tone: "from-pink-200 to-rose-300", moons: ["종족", "능력"] },
      { name: "관계 유니버스", short: "관", slug: "relations", angle: 180, speed: 0.006, variant: "double", tone: "from-red-200 to-fuchsia-300", moons: ["라이벌", "가족"] },
      { name: "세계관 유니버스", short: "세", slug: "worldview", angle: 300, speed: 0.005, variant: "ring", tone: "from-amber-100 to-pink-300", moons: ["국가", "역사"] },
    ],
  },
];

const categoryTabs = ["전체", "인기", "최신", "팬아트", "창작 세계관", "소설", "캐릭터", "구독 중"];

function cn(...items: any[]) {
  return items.filter(Boolean).join(" ");
}

function formatCount(value: number) {
  if (value >= 10000) return `${(value / 1000).toFixed(1)}k`;
  return new Intl.NumberFormat().format(value);
}

function StarField() {
  const stars = useMemo(() => {
    return Array.from({ length: 88 }, (_, i) => ({
      id: i,
      left: `${(i * 37) % 101}%`,
      top: `${(i * 61) % 100}%`,
      size: i % 8 === 0 ? 2 : 1,
      opacity: 0.18 + ((i * 13) % 45) / 100,
      delay: `${(i * 0.19) % 3}s`,
      duration: `${3.2 + (i % 5) * 0.7}s`,
    }));
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((star) => (
        <span
          key={star.id}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        />
      ))}
    </div>
  );
}

function PlanetSkin({ satellite }: { satellite: Satellite }) {
  const variant = satellite.variant || "plain";

  return (
    <>
      {variant === "ring" && <span className="pointer-events-none absolute left-1/2 top-1/2 h-6 w-20 -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded-full border-[3px] border-white/45 shadow-[0_0_18px_rgba(255,255,255,0.35)]" />}
      {variant === "stripe" && (
        <>
          <span className="pointer-events-none absolute left-1/2 top-[36%] h-1.5 w-10 -translate-x-1/2 rounded-full bg-white/40" />
          <span className="pointer-events-none absolute left-1/2 top-[55%] h-1 w-8 -translate-x-1/2 rounded-full bg-slate-950/25" />
        </>
      )}
      {variant === "crater" && (
        <>
          <span className="pointer-events-none absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-slate-950/25 ring-1 ring-white/25" />
          <span className="pointer-events-none absolute bottom-2 left-2 h-2 w-2 rounded-full bg-white/30" />
          <span className="pointer-events-none absolute left-4 top-3 h-1.5 w-1.5 rounded-full bg-slate-950/20" />
        </>
      )}
      {variant === "double" && <span className="pointer-events-none absolute -right-2 -top-2 h-5 w-5 rounded-full border border-white/40 bg-white/45 shadow-[0_0_14px_rgba(255,255,255,0.45)]" />}
      {variant === "diamond" && <span className="pointer-events-none absolute inset-1 rotate-45 rounded-md border border-white/45 bg-white/10 shadow-[0_0_16px_rgba(255,255,255,0.22)]" />}
      {variant === "halo" && <span className="pointer-events-none absolute -inset-2 rounded-full border border-fuchsia-100/35 bg-fuchsia-100/[0.04] shadow-[0_0_24px_rgba(244,114,182,0.28)]" />}
      {variant === "core" && (
        <>
          <span className="pointer-events-none absolute inset-2 rounded-full border border-white/40" />
          <span className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.8)]" />
        </>
      )}
      {variant === "leaf" && (
        <>
          <span className="pointer-events-none absolute -right-1 top-1 h-5 w-3 rotate-45 rounded-full bg-lime-100/65 shadow-[0_0_12px_rgba(217,249,157,0.45)]" />
          <span className="pointer-events-none absolute bottom-2 left-2 h-1 w-8 -rotate-12 rounded-full bg-white/30" />
        </>
      )}
      {variant === "wave" && (
        <>
          <span className="pointer-events-none absolute left-1/2 top-3 h-1 w-8 -translate-x-1/2 rotate-12 rounded-full bg-white/45" />
          <span className="pointer-events-none absolute left-1/2 bottom-3 h-1 w-7 -translate-x-1/2 -rotate-12 rounded-full bg-cyan-950/25" />
        </>
      )}
    </>
  );
}

function MoonCluster({ moons, systemTitle, satelliteName, onSelect }: { moons: string[]; systemTitle: string; satelliteName: string; onSelect: (selected: SelectedNode) => void }) {
  return (
    <div className="moon-cluster pointer-events-none absolute left-1/2 top-1/2 z-50 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/20 bg-cyan-100/[0.035] opacity-0 shadow-[0_0_28px_rgba(165,243,252,0.18)] backdrop-blur-[1px] transition duration-300">
      {moons.map((moon, index) => {
        const angle = (360 / moons.length) * index - 90;
        const radius = 56;
        const x = Math.cos((angle * Math.PI) / 180) * radius;
        const y = Math.sin((angle * Math.PI) / 180) * radius;

        return (
          <button
            key={moon}
            onClick={(event) => {
              event.stopPropagation();
              onSelect({
                type: "위성 유니버스",
                name: moon,
                path: [systemTitle, satelliteName, moon],
                desc: `${satelliteName} 안에 있는 더 작은 산하 세계예요. 행성에 가까이 가면 위성 궤도가 열려요.`,
              });
            }}
            className="pointer-events-auto absolute left-1/2 top-1/2 grid h-7 w-7 place-items-center rounded-full border border-white/45 bg-cyan-100 text-[8px] font-black text-slate-950 shadow-[0_0_18px_rgba(165,243,252,0.85)] transition hover:scale-125 hover:bg-white"
            style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
            title={moon}
          >
            {moon.slice(0, 1)}
          </button>
        );
      })}
    </div>
  );
}

function SystemStar({ system, hovered, onSelect, onHover }: { system: System; hovered: boolean; onSelect: (selected: SelectedNode) => void; onHover: (sys: System) => void }) {
  return (
    <button
      onMouseEnter={() => onHover(system)}
      onFocus={() => onHover(system)}
      onClick={() =>
        onSelect({
          type: "항성계",
          name: system.title,
          path: [system.title],
          desc: system.subtitle,
        })
      }
      className={cn(
        "absolute z-40 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gradient-to-br text-white shadow-[0_0_54px_rgba(217,70,239,0.32)] transition duration-300 hover:scale-105",
        system.glow
      )}
      style={{
        left: `${system.x}%`,
        top: `${system.y}%`,
        width: system.starSize,
        height: system.starSize,
        boxShadow: hovered ? `0 0 70px ${system.aura}` : `0 0 42px ${system.aura}`,
      }}
    >
      <span className="absolute inset-0 rounded-full bg-white/20 blur-xl" />
      <span className="relative flex flex-col items-center text-center drop-shadow-lg">
        <Star className="mb-1 h-5 w-5 fill-white/75" />
        <span className="max-w-[82px] truncate text-sm font-black">{system.title}</span>
        <span className="mt-0.5 text-[9px] font-bold text-white/75">{formatCount(system.count)}</span>
      </span>
    </button>
  );
}

function OrbitRings({ system, hovered }: { system: System; hovered: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div
        className="absolute rounded-full border transition duration-300"
        style={{
          left: `calc(${system.x}% - ${system.orbit}px)`,
          top: `calc(${system.y}% - ${system.orbit}px)`,
          width: system.orbit * 2,
          height: system.orbit * 2,
          borderColor: hovered ? "rgba(165,243,252,0.42)" : "rgba(255,255,255,0.075)",
          boxShadow: hovered ? "0 0 36px rgba(103,232,249,0.13)" : "none",
          transform: hovered ? "scale(1.05)" : "scale(1)",
        }}
      />
      <div
        className="absolute rounded-full border transition duration-300"
        style={{
          left: `calc(${system.x}% - ${(system.orbit * 0.68).toFixed(1)}px)`,
          top: `calc(${system.y}% - ${(system.orbit * 0.68).toFixed(1)}px)`,
          width: system.orbit * 1.36,
          height: system.orbit * 1.36,
          borderColor: hovered ? "rgba(244,114,182,0.25)" : "rgba(255,255,255,0.045)",
          transform: hovered ? "scale(0.88) rotate(12deg)" : "scale(1)",
        }}
      />
      {hovered && (
        <span
          className="absolute z-50 -translate-x-1/2 rounded-full border border-white/12 bg-slate-950/75 px-3 py-1 text-[10px] font-bold text-white/60 shadow-xl backdrop-blur-xl"
          style={{ left: `${system.x}%`, top: `calc(${system.y}% + ${system.starSize / 2 + 12}px)` }}
        >
          {system.title} System
        </span>
      )}
    </div>
  );
}

function PlanetUniverse({ system, satellite, point, hovered, onHover, onSelect }: { system: System; satellite: Satellite; point: any; hovered: boolean; onHover: (target: { system: System; satellite: Satellite }) => void; onSelect: (selected: SelectedNode) => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.15, duration: 0.45 }}
      onMouseEnter={() => onHover({ system, satellite })}
      onFocus={() => onHover({ system, satellite })}
      onClick={() =>
        onSelect({
          type: "행성 유니버스",
          name: satellite.name,
          slug: satellite.slug,
          path: [system.title, satellite.name],
          desc: satellite.description || `${system.title} 항성계 안에서 공전하는 산하 유니버스예요. 마우스를 올리면 그 아래 위성 유니버스가 보여요. 행성마다 고리, 줄무늬, 크레이터 같은 생김새도 달라요.`,
        })
      }
      className={cn(
        "planet-button group/satellite absolute z-50 grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-gradient-to-br text-[12px] font-black text-slate-950 shadow-[0_0_24px_rgba(255,255,255,0.18)] transition duration-300 hover:scale-110 hover:border-white/60 hover:shadow-[0_0_32px_rgba(255,255,255,0.28)]",
        satellite.tone,
        hovered && "scale-110"
      )}
      style={{ left: point.x, top: point.y, transform: "translate(-50%, -50%)" }}
    >
      <MoonCluster moons={satellite.moons} systemTitle={system.title} satelliteName={satellite.name} onSelect={onSelect} />
      <PlanetSkin satellite={satellite} />
      <span className="relative z-10 drop-shadow-sm">{satellite.short}</span>
      <span className="pointer-events-none absolute left-1/2 top-[3.35rem] w-max -translate-x-1/2 rounded-full border border-white/12 bg-slate-950/80 px-2.5 py-1 text-[10px] font-bold text-white opacity-0 shadow-xl backdrop-blur-xl transition group-hover/satellite:opacity-100">
        {satellite.name}
      </span>
    </motion.button>
  );
}

function SelectionPanel({ selected }: { selected: SelectedNode }) {
  return (
    <motion.div
      key={`${selected.type}-${selected.name}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="absolute bottom-5 left-1/2 z-[70] w-[min(620px,calc(100%-40px))] -translate-x-1/2 rounded-[1.8rem] border border-white/12 bg-slate-950/64 p-4 text-white shadow-2xl backdrop-blur-2xl"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-100/55">{selected.type}</p>
          <h3 className="mt-1 text-xl font-black tracking-[-0.03em]">{selected.name}</h3>
          <p className="mt-1 text-sm leading-6 text-white/52">{selected.desc}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-white/50 md:justify-end">
          {selected.path.map((item, index) => (
            <React.Fragment key={`${item}-${index}`}>
              <span className="rounded-full bg-white/[0.07] px-2.5 py-1">{item}</span>
              {index < selected.path.length - 1 && <ChevronRight className="h-3 w-3 text-white/25" />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function HoverHud({ hoveredSystem, hoveredPlanet }: { hoveredSystem: System | null; hoveredPlanet: { system: System; satellite: Satellite } | null }) {
  const target = hoveredPlanet?.satellite || hoveredSystem;

  return (
    <AnimatePresence mode="wait">
      {target ? (
        <motion.div
          key={hoveredPlanet ? hoveredPlanet.satellite.name : (hoveredSystem ? hoveredSystem.id : "none")}
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -18 }}
          transition={{ duration: 0.2 }}
          className="absolute right-5 top-5 z-[70] hidden w-72 rounded-[1.8rem] border border-white/12 bg-slate-950/62 p-4 text-white shadow-2xl backdrop-blur-2xl lg:block"
        >
          <div className="mb-3 flex items-start justify-between gap-2">
            <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-slate-950">
              {hoveredPlanet ? "PLANET" : "SYSTEM"}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-violet-200">
              <Globe size={12} />
              {hoveredSystem?.orbit || "DV"} AU
            </span>
          </div>
          <h3 className="flex items-center gap-1.5 text-xl font-black tracking-[-0.03em]">
            {'name' in target ? target.name : target.title}
            <ArrowUpRight size={15} className="text-white/35" />
          </h3>
          <p className="mt-2 text-xs leading-6 text-white/52">
            {hoveredPlanet
              ? `${hoveredSystem?.title} 안에서 공전하는 산하 유니버스. 위성: ${hoveredPlanet.satellite.moons.join(" · ")}`
              : hoveredSystem?.subtitle}
          </p>
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs font-bold text-white/52">
            <span className="flex items-center gap-1.5">
              <Users size={13} />
              {hoveredSystem ? formatCount(hoveredSystem.count) : 0}명
            </span>
            <span className="rounded-full bg-white/[0.08] px-3 py-1 text-cyan-100/75">탐색 중</span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function GalaxyFilterBar({ activeTab, onTabChange, totalCount }: { activeTab: string; onTabChange: (tab: string) => void; totalCount: number }) {
  return (
    <div className="mb-5 flex flex-col gap-3 rounded-[1.8rem] border border-white/10 bg-white/[0.055] p-2.5 shadow-2xl shadow-black/10 backdrop-blur-2xl md:flex-row md:items-center md:justify-between">
      <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0">
        {categoryTabs.map((tab) => {
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-black transition duration-300",
                active
                  ? "bg-gradient-to-r from-violet-200 via-white to-cyan-100 text-violet-700 shadow-[0_0_24px_rgba(196,181,253,0.38)]"
                  : "text-white/48 hover:bg-white/[0.075] hover:text-white/78"
              )}
            >
              {tab}
            </button>
          );
        })}
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 px-2 text-sm font-bold text-white/48 md:justify-end">
        <span>
          <b className="text-violet-200">{totalCount}</b>개의 유니버스
        </span>
        <button className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-2 text-white/62 transition hover:bg-white/[0.09] hover:text-white">
          높은 인기순 ↓
        </button>
      </div>
    </div>
  );
}

function MainGalaxy({ selected, onSelect, activeTab, systems }: { selected: SelectedNode; onSelect: (node: SelectedNode) => void; activeTab: string; systems: System[] }) {
  const router = useRouter();
  const [time, setTime] = useState(0);
  const [hoveredSystem, setHoveredSystem] = useState<System | null>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<{ system: System; satellite: Satellite } | null>(null);
  const [warpTarget, setWarpTarget] = useState<any>(null);
  const frameRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);

  const visibleSystems = useMemo(() => {
    if (activeTab === "전체" || activeTab === "구독 중" || activeTab === "창작 세계관") return systems;
    return systems.filter((system) => system.category === activeTab || system.title === "Sports");
  }, [activeTab, systems]);

  const planetPoints = useMemo(() => {
    const points = [];
    for (const system of visibleSystems) {
      for (const satellite of system.satellites) {
        const baseAngle = (satellite.angle * Math.PI) / 180;
        const currentAngle = baseAngle + time * satellite.speed;
        const x = `calc(${system.x}% + ${Math.cos(currentAngle) * system.orbit}px)`;
        const y = `calc(${system.y}% + ${Math.sin(currentAngle) * system.orbit}px)`;
        points.push({ system, satellite, x, y });
      }
    }
    return points;
  }, [time, visibleSystems]);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (previousTimeRef.current !== null) {
        const speedMultiplier = hoveredPlanet || hoveredSystem ? 0.22 : 1;
        setTime((prev) => prev + 0.32 * speedMultiplier);
      }
      previousTimeRef.current = timestamp;
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [hoveredPlanet, hoveredSystem]);

  function handleWarp(target: any) {
    setWarpTarget(target);
    window.setTimeout(() => {
      setWarpTarget(null);
      if (target.slug) {
        router.push(`/universe/${target.slug}`);
      }
    }, 1400);
  }

  return (
    <div
      className="relative mx-auto h-[720px] w-full overflow-hidden rounded-[3rem] border border-white/12 bg-black/20 shadow-2xl shadow-black/30 backdrop-blur-xl md:h-[780px]"
      onMouseLeave={() => {
        setHoveredSystem(null);
        setHoveredPlanet(null);
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(168,85,247,0.18),transparent_38%),radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.1),transparent_48%)] pointer-events-none" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:46px_46px] opacity-20" />
      <StarField />

      <div className="absolute left-5 top-5 z-[70] rounded-3xl border border-white/12 bg-white/[0.07] p-4 text-white backdrop-blur-2xl">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-white/42">interactive galaxy</p>
        <p className="mt-1 text-lg font-black">Mouse Orbit View</p>
        <div className="mt-3 flex items-center gap-2 text-xs font-bold text-cyan-100/70">
          <MousePointer2 className="h-3.5 w-3.5" />
          가까이 가면 공전이 느려져요
        </div>
      </div>

      {visibleSystems.map((system) => {
        const isHovered = hoveredSystem?.id === system.id || hoveredPlanet?.system.id === system.id;
        return <OrbitRings key={`ring-${system.id}`} system={system} hovered={isHovered} />;
      })}

      {visibleSystems.map((system) => {
        const isHovered = hoveredSystem?.id === system.id || hoveredPlanet?.system.id === system.id;
        return (
          <SystemStar
            key={system.id}
            system={system}
            hovered={isHovered}
            onHover={(target) => {
              setHoveredSystem(target);
              setHoveredPlanet(null);
            }}
            onSelect={onSelect}
          />
        );
      })}

      {planetPoints.map((point) => {
        const isHovered = hoveredPlanet?.satellite.name === point.satellite.name && hoveredPlanet?.system.id === point.system.id;
        return (
          <PlanetUniverse
            key={`${point.system.id}-${point.satellite.name}`}
            system={point.system}
            satellite={point.satellite}
            point={point}
            hovered={isHovered}
            onHover={(target) => {
              setHoveredPlanet(target);
              setHoveredSystem(target.system);
            }}
            onSelect={onSelect}
          />
        );
      })}

      <HoverHud hoveredSystem={hoveredSystem} hoveredPlanet={hoveredPlanet} />
      <SelectionPanel selected={selected} />

      <button
        onClick={() => handleWarp(hoveredPlanet?.satellite || hoveredSystem || visibleSystems[0])}
        className="absolute bottom-24 right-5 z-[70] hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-slate-950 shadow-[0_0_24px_rgba(255,255,255,0.22)] transition hover:scale-105 md:flex"
      >
        <Rocket size={14} />
        차원이동 워프
      </button>

      <AnimatePresence>
        {warpTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[999] flex flex-col items-center justify-center bg-black/86 backdrop-blur-2xl"
          >
            <div className="absolute inset-0 overflow-hidden opacity-60">
              {Array.from({ length: 28 }).map((_, i) => (
                <span
                  key={i}
                  className="absolute left-1/2 top-1/2 h-[2px] w-[220px] origin-left rounded-full bg-gradient-to-r from-transparent via-white to-transparent animate-warp-line"
                  style={{ transform: `rotate(${i * 12.85}deg) translateX(70px)`, animationDelay: `${(i % 7) * 0.05}s` }}
                />
              ))}
            </div>
            <motion.div
              animate={{ scale: [1, 2.4, 13], rotate: [0, 180, 540], opacity: [1, 0.9, 0] }}
              transition={{ duration: 1.35, ease: "easeInOut" }}
              className="h-24 w-24 rounded-full bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-200 blur-xl"
            />
            <div className="z-10 mt-7 text-center">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-violet-300">Warping Dimensions</p>
              <h3 className="mt-2 text-2xl font-black text-white tracking-tight">{warpTarget.name || warpTarget.title} 차원으로 진입 중...</h3>
              <p className="mt-1 text-xs text-white/50">DV 웜홀을 통과하고 있어요.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CosmicGalaxyExplorer({ items }: { items?: any[] }) {
  const [selected, setSelected] = useState<SelectedNode>({
    type: "지도 구조",
    name: "항성계 → 행성 → 위성",
    path: ["항성계", "산하 유니버스", "세부 유니버스"],
    desc: "여러 항성계를 비슷한 크기로 보여주고, 각 항성계 안에서 행성 유니버스와 위성 유니버스가 계층적으로 움직여요.",
  });
  const [activeTab, setActiveTab] = useState("전체");

  const systems = useMemo(() => {
    const baseSystems = JSON.parse(JSON.stringify(galaxySystems)) as System[];
    const sourceData = items && items.length > 0 ? items : [];

    if (sourceData.length > 0) {
      baseSystems.forEach(s => { s.satellites = []; s.count = 0; });
      const planetVariants = ["ring", "stripe", "crater", "double", "diamond", "halo", "core", "leaf", "wave"];
      const planetTones = [
        "from-orange-200 to-rose-300",
        "from-cyan-200 to-blue-300",
        "from-pink-200 to-violet-300",
        "from-violet-200 to-fuchsia-300",
        "from-emerald-200 to-teal-300",
        "from-amber-200 to-orange-300",
        "from-rose-200 to-purple-300",
        "from-lime-200 to-emerald-300",
      ];

      sourceData.forEach((item: any, idx: number) => {
        let system = baseSystems.find(s => s.category === item.category);
        if (!system) {
          system = baseSystems[idx % baseSystems.length];
        }

        system.count += item.subscribers || 0;
        const moons = item.tags && item.tags.length > 0 ? item.tags.slice(0, 3) : ["게시판", "정보", "활동"];
        const hash = item.name.length + idx;
        const variant = planetVariants[hash % planetVariants.length];
        const tone = planetTones[hash % planetTones.length];
        const angle = (idx * 110 + 40) % 360;
        const speed = 0.005 + (0.004 / (system.satellites.length + 1));

        system.satellites.push({
          name: item.name,
          short: item.name.slice(0, 2),
          slug: item.slug,
          description: item.description,
          angle,
          speed,
          variant,
          tone,
          moons,
        });
      });

      baseSystems.forEach(s => {
        if (s.count === 0) s.count = 3500;
      });
    }

    return baseSystems;
  }, [items]);

  const totalCount = useMemo(() => {
    let count = 0;
    systems.forEach(s => {
      count += s.satellites.length;
    });
    return count > 0 ? count : 15;
  }, [systems]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#050515] via-[#090a2a] to-[#16071f] px-4 py-16 text-white">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes twinkle {
          0%, 100% { transform: scale(1); opacity: .25; }
          50% { transform: scale(1.6); opacity: .7; }
        }
        @keyframes warpLine {
          0% { transform: rotate(var(--angle, 0deg)) translateX(40px) scaleX(0.1); opacity: 0; }
          45% { opacity: 1; }
          100% { transform: rotate(var(--angle, 0deg)) translateX(390px) scaleX(3.8); opacity: 0; }
        }
        .animate-twinkle { animation-name: twinkle; animation-iteration-count: infinite; animation-timing-function: ease-in-out; }
        .planet-button:hover .moon-cluster { opacity: 1; pointer-events: auto; }
        .animate-warp-line { animation: warpLine 1.1s cubic-bezier(0.1, 0.8, 0.1, 1) infinite; }
      `}} />

      <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-violet-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-1/3 h-[28rem] w-[28rem] rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.12),transparent_28%),linear-gradient(to_bottom,transparent,rgba(0,0,0,0.34))]" />

      <section className="relative z-10 mx-auto w-[min(1180px,calc(100vw-28px))]">
        <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-4 py-2 text-xs font-bold text-cyan-100/80 backdrop-blur-xl">
              <Orbit className="h-4 w-4" />
              Universe Galaxy Map · Interactive Orbit
            </div>
            <h1 className="text-4xl font-black tracking-[-0.05em] text-white md:text-6xl">
              정렬된 목록 말고,
              <br />
              살아있는 성계로 탐험해요.
            </h1>
          </div>
          <p className="max-w-md text-sm leading-7 text-white/55">
            마우스가 항성계에 가까워지면 공전이 느려지고, HUD가 열리며, 행성의 위성까지 확인할 수 있어요. 이제 진짜 탐험하는 은하지도에 가까워졌어요.
          </p>
        </div>

        <GalaxyFilterBar activeTab={activeTab} onTabChange={setActiveTab} totalCount={totalCount} />
        <MainGalaxy selected={selected} onSelect={setSelected} activeTab={activeTab} systems={systems} />

        <div className="mx-auto mt-5 flex w-full flex-wrap items-center justify-center gap-2 text-xs font-bold text-white/42">
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 backdrop-blur-xl">항성계: 대표 유니버스 묶음</span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 backdrop-blur-xl">행성: 산하 유니버스</span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 backdrop-blur-xl">위성: 세부 유니버스</span>
        </div>
      </section>
    </main>
  );
}
