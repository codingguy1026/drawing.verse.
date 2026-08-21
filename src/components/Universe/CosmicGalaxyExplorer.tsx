"use client";

import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { UniverseItem } from "./universe.types";

interface Satellite {
  name: string;
  short: string;
  angle: number;
  speed: number;
  variant: PlanetVariant;
  palette: [string, string, string];
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
  colors: [string, string, string];
  aura: string;
  count: number;
  category: string;
  satellites: Satellite[];
}

type PlanetVariant =
  | "ring"
  | "stripe"
  | "crater"
  | "double"
  | "halo"
  | "core"
  | "storm"
  | "ice";

type CSSVars = React.CSSProperties & Record<`--${string}`, string | number>;

const PLANET_PALETTES: Array<[string, string, string]> = [
  ["#ffd7a8", "#ff7b72", "#b83280"],
  ["#b9f5ff", "#5fd6ff", "#5b7cfa"],
  ["#f8c4ff", "#b58cff", "#6d4aff"],
  ["#c9ffe5", "#4fe0b6", "#198c7a"],
  ["#fff1ad", "#ffb45f", "#e46b36"],
  ["#ffd1df", "#ff759f", "#a83c73"],
  ["#d9e7ff", "#8bb5ff", "#4856c8"],
  ["#e9ffd0", "#9de86f", "#4d9d4a"],
];

const PLANET_VARIANTS: PlanetVariant[] = [
  "ring",
  "stripe",
  "crater",
  "double",
  "halo",
  "core",
  "storm",
  "ice",
];

const galaxySystems: System[] = [
  {
    id: "sports",
    title: "Sports",
    subtitle: "응원과 승부가 모이는 대표 유니버스",
    x: 50,
    y: 50,
    orbit: 188,
    starSize: 112,
    colors: ["#fff4c7", "#ff9d57", "#ff4d85"],
    aura: "rgba(255, 104, 130, .42)",
    count: 12800,
    category: "인기",
    satellites: [
      { name: "야구 유니버스", short: "야", slug: "baseball", angle: 4, speed: 0.009, variant: "ring", palette: PLANET_PALETTES[0], moons: ["KBO", "MLB", "응원석"] },
      { name: "축구 유니버스", short: "축", slug: "soccer", angle: 92, speed: 0.0078, variant: "storm", palette: PLANET_PALETTES[3], moons: ["K리그", "해외축구", "전술"] },
      { name: "농구 유니버스", short: "농", slug: "basketball", angle: 184, speed: 0.0068, variant: "stripe", palette: PLANET_PALETTES[4], moons: ["KBL", "NBA", "하이라이트"] },
      { name: "e스포츠 유니버스", short: "E", slug: "esports", angle: 272, speed: 0.006, variant: "core", palette: PLANET_PALETTES[1], moons: ["LoL", "발로란트", "대회"] },
    ],
  },
  {
    id: "illustration",
    title: "Illustration",
    subtitle: "색과 선으로 만든 그림 유니버스",
    x: 22,
    y: 28,
    orbit: 132,
    starSize: 88,
    colors: ["#f1fdff", "#65ddff", "#4777ff"],
    aura: "rgba(85, 204, 255, .35)",
    count: 34100,
    category: "팬아트",
    satellites: [
      { name: "낙서 유니버스", short: "낙", slug: "doodle", angle: 24, speed: 0.0084, variant: "crater", palette: PLANET_PALETTES[1], moons: ["연습장", "손그림"] },
      { name: "채색 유니버스", short: "채", slug: "coloring", angle: 154, speed: 0.0068, variant: "ring", palette: PLANET_PALETTES[2], moons: ["빛", "팔레트"] },
      { name: "OC 유니버스", short: "OC", slug: "original-character", angle: 274, speed: 0.0057, variant: "double", palette: PLANET_PALETTES[6], moons: ["자캐", "프로필"] },
    ],
  },
  {
    id: "webtoon",
    title: "Webtoon",
    subtitle: "컷과 감정이 도는 이야기 유니버스",
    x: 78,
    y: 28,
    orbit: 132,
    starSize: 88,
    colors: ["#fff0ff", "#ba7cff", "#6e43d8"],
    aura: "rgba(181, 124, 255, .35)",
    count: 19500,
    category: "소설",
    satellites: [
      { name: "스토리 유니버스", short: "스", slug: "story", angle: 14, speed: 0.0076, variant: "ice", palette: PLANET_PALETTES[2], moons: ["플롯", "떡밥"] },
      { name: "연출 유니버스", short: "연", slug: "directing", angle: 144, speed: 0.006, variant: "stripe", palette: PLANET_PALETTES[6], moons: ["컷", "구도"] },
      { name: "캐릭터 유니버스", short: "캐", slug: "character", angle: 264, speed: 0.0052, variant: "halo", palette: PLANET_PALETTES[5], moons: ["주인공", "빌런"] },
    ],
  },
  {
    id: "music",
    title: "Music",
    subtitle: "소리가 빛나는 음악 유니버스",
    x: 24,
    y: 76,
    orbit: 120,
    starSize: 80,
    colors: ["#eafff7", "#55e7c4", "#17a99f"],
    aura: "rgba(77, 224, 188, .31)",
    count: 8200,
    category: "최신",
    satellites: [
      { name: "작곡 유니버스", short: "곡", slug: "compose", angle: 64, speed: 0.0077, variant: "storm", palette: PLANET_PALETTES[3], moons: ["멜로디", "코드"] },
      { name: "리믹스 유니버스", short: "믹", slug: "remix", angle: 234, speed: 0.0057, variant: "core", palette: PLANET_PALETTES[1], moons: ["샘플", "루프"] },
    ],
  },
  {
    id: "character",
    title: "Character",
    subtitle: "캐릭터들이 살아가는 설정 유니버스",
    x: 76,
    y: 76,
    orbit: 120,
    starSize: 80,
    colors: ["#fff1f5", "#ff8da7", "#e04d76"],
    aura: "rgba(255, 112, 146, .31)",
    count: 27400,
    category: "캐릭터",
    satellites: [
      { name: "설정 유니버스", short: "설", slug: "settings", angle: 44, speed: 0.0074, variant: "crater", palette: PLANET_PALETTES[5], moons: ["종족", "능력"] },
      { name: "관계 유니버스", short: "관", slug: "relations", angle: 184, speed: 0.0058, variant: "double", palette: PLANET_PALETTES[0], moons: ["라이벌", "가족"] },
      { name: "세계관 유니버스", short: "세", slug: "worldview", angle: 304, speed: 0.0049, variant: "ring", palette: PLANET_PALETTES[4], moons: ["국가", "역사"] },
    ],
  },
];

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function formatCount(value: number) {
  if (value >= 10000) return `${(value / 1000).toFixed(1)}k`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return new Intl.NumberFormat().format(value);
}

function StarField() {
  const stars = useMemo(
    () =>
      Array.from({ length: 170 }, (_, index) => {
        const seed = (index * 9301 + 49297) % 233280;
        const size = index % 29 === 0 ? 2.8 : index % 9 === 0 ? 1.8 : 1;
        return {
          id: index,
          left: `${((seed * 37) % 10000) / 100}%`,
          top: `${((seed * 61 + 17) % 10000) / 100}%`,
          size,
          opacity: 0.18 + ((seed % 57) / 100),
          delay: `${(seed % 400) / 100}s`,
          duration: `${3.2 + (seed % 44) / 10}s`,
        };
      }),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((star) => (
        <span
          key={star.id}
          className="galaxy-star absolute rounded-full bg-white"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            animationDelay: star.delay,
            animationDuration: star.duration,
            boxShadow:
              star.size > 2
                ? "0 0 8px rgba(255,255,255,.8), 0 0 18px rgba(173,216,255,.35)"
                : undefined,
          }}
        />
      ))}
    </div>
  );
}

function GalaxyBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(66,54,150,.14),transparent_34%),radial-gradient(circle_at_20%_22%,rgba(34,211,238,.10),transparent_28%),radial-gradient(circle_at_82%_26%,rgba(168,85,247,.11),transparent_30%),radial-gradient(circle_at_74%_82%,rgba(236,72,153,.08),transparent_28%),linear-gradient(180deg,#03040a_0%,#060918_45%,#020309_100%)]" />
      <div className="galaxy-nebula absolute -left-[12%] top-[8%] h-[58%] w-[56%] rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(50,196,255,.15),rgba(93,79,255,.08)_42%,transparent_72%)] blur-[60px]" />
      <div className="galaxy-nebula absolute -right-[12%] top-[15%] h-[60%] w-[58%] rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(189,102,255,.14),rgba(239,68,125,.06)_46%,transparent_74%)] blur-[70px] [animation-delay:-7s]" />
      <div className="absolute inset-0 opacity-[.16] [background-image:radial-gradient(circle_at_center,rgba(255,255,255,.55)_0_.5px,transparent_.7px)] [background-size:11px_11px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(0,0,0,.42)_78%,rgba(0,0,0,.88)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[22%] bg-gradient-to-t from-black/35 to-transparent" />
    </div>
  );
}

function SystemStar({ system, scale }: { system: System; scale: number }) {
  const size = Math.max(54, system.starSize * Math.max(scale, 0.62));
  const [core, mid, edge] = system.colors;

  return (
    <div
      className="group/system absolute z-30 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${system.x}%`, top: `${system.y}%` }}
    >
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl transition duration-500 group-hover/system:scale-125"
        style={{
          width: size * 1.75,
          height: size * 1.75,
          background: `radial-gradient(circle, ${system.aura} 0%, transparent 68%)`,
        }}
      />
      <div
        className="galaxy-system-star relative rounded-full transition duration-500 group-hover/system:scale-[1.04]"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at 36% 30%, white 0%, ${core} 14%, ${mid} 48%, ${edge} 78%, rgba(15,8,28,.98) 100%)`,
          boxShadow: `0 0 ${size * 0.28}px rgba(255,255,255,.55), 0 0 ${size * 0.62}px ${system.aura}, inset -${size * 0.1}px -${size * 0.08}px ${size * 0.22}px rgba(0,0,0,.4)`,
        }}
      >
        <span className="absolute left-[25%] top-[20%] h-[18%] w-[18%] rounded-full bg-white/55 blur-[2px]" />
        <span className="absolute inset-[8%] rounded-full border border-white/15" />
      </div>
      <div className="pointer-events-none absolute left-1/2 top-[calc(100%+10px)] -translate-x-1/2 whitespace-nowrap text-center opacity-75 transition duration-300 group-hover/system:opacity-100">
        <div className="text-[10px] font-black tracking-[.18em] text-white/88 sm:text-[11px]">
          {system.title.toUpperCase()}
        </div>
        <div className="mt-0.5 text-[9px] font-semibold tracking-wide text-white/35">
          {formatCount(system.count)}
        </div>
      </div>
    </div>
  );
}

function OrbitRings({ system, scale }: { system: System; scale: number }) {
  const orbit = system.orbit * scale;
  const height = orbit * 1.06;

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <div
        className="absolute rounded-[50%] border border-white/[.075]"
        style={{
          left: `calc(${system.x}% - ${orbit}px)`,
          top: `calc(${system.y}% - ${height / 2}px)`,
          width: orbit * 2,
          height,
          boxShadow: "0 0 24px rgba(255,255,255,.015), inset 0 0 18px rgba(255,255,255,.018)",
        }}
      />
      <div
        className="absolute rounded-[50%] border border-dashed border-white/[.035]"
        style={{
          left: `calc(${system.x}% - ${orbit * 0.67}px)`,
          top: `calc(${system.y}% - ${height * 0.335}px)`,
          width: orbit * 1.34,
          height: height * 0.67,
          transform: "rotate(-8deg)",
        }}
      />
    </div>
  );
}

function PlanetSkin({ variant }: { variant: PlanetVariant }) {
  if (variant === "ring") {
    return (
      <>
        <span className="pointer-events-none absolute left-1/2 top-1/2 h-[35%] w-[165%] -translate-x-1/2 -translate-y-1/2 -rotate-[14deg] rounded-full border-[2px] border-white/55 shadow-[0_0_12px_rgba(255,255,255,.28)]" />
        <span className="pointer-events-none absolute left-1/2 top-1/2 h-[18%] w-[145%] -translate-x-1/2 -translate-y-1/2 -rotate-[14deg] rounded-full border border-black/20" />
      </>
    );
  }

  if (variant === "stripe") {
    return (
      <>
        <span className="absolute left-[8%] right-[8%] top-[32%] h-[8%] rounded-full bg-white/28 blur-[.2px]" />
        <span className="absolute left-[4%] right-[4%] top-[51%] h-[9%] rounded-full bg-black/16" />
        <span className="absolute left-[14%] right-[12%] top-[65%] h-[5%] rounded-full bg-white/18" />
      </>
    );
  }

  if (variant === "crater") {
    return (
      <>
        <span className="absolute right-[16%] top-[18%] h-[18%] w-[18%] rounded-full bg-black/18 ring-1 ring-white/16" />
        <span className="absolute bottom-[18%] left-[17%] h-[13%] w-[13%] rounded-full bg-black/14 ring-1 ring-white/12" />
        <span className="absolute left-[34%] top-[48%] h-[9%] w-[9%] rounded-full bg-white/14" />
      </>
    );
  }

  if (variant === "double") {
    return <span className="absolute -right-[18%] -top-[14%] h-[38%] w-[38%] rounded-full border border-white/35 bg-white/55 shadow-[0_0_10px_rgba(255,255,255,.38)]" />;
  }

  if (variant === "halo") {
    return <span className="absolute -inset-[18%] rounded-full border border-white/22 shadow-[0_0_18px_rgba(255,255,255,.2),inset_0_0_12px_rgba(255,255,255,.08)]" />;
  }

  if (variant === "core") {
    return (
      <>
        <span className="absolute inset-[22%] rounded-full border border-white/32" />
        <span className="absolute left-1/2 top-1/2 h-[14%] w-[14%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_12px_white]" />
      </>
    );
  }

  if (variant === "storm") {
    return (
      <>
        <span className="absolute left-[12%] top-[25%] h-[12%] w-[58%] -rotate-12 rounded-full bg-white/22 blur-[.4px]" />
        <span className="absolute bottom-[24%] right-[12%] h-[20%] w-[32%] rotate-[18deg] rounded-[50%] bg-black/15" />
      </>
    );
  }

  return (
    <>
      <span className="absolute inset-[10%] rounded-full border border-white/18" />
      <span className="absolute left-[16%] top-[14%] h-[26%] w-[12%] -rotate-[25deg] rounded-full bg-white/20 blur-[1px]" />
    </>
  );
}

function MoonCluster({ moons }: { moons: string[] }) {
  return (
    <div className="moon-cluster pointer-events-none absolute left-1/2 top-1/2 z-40 h-[118px] w-[118px] -translate-x-1/2 -translate-y-1/2 opacity-0 transition duration-300 group-hover/planet:opacity-100">
      <span className="absolute inset-0 rounded-full border border-white/[.09]" />
      {moons.slice(0, 3).map((moon, index) => {
        const angle = (Math.PI * 2 * index) / Math.max(moons.length, 3) - Math.PI / 2;
        const radius = 58;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * 0.62;
        return (
          <span
            key={`${moon}-${index}`}
            className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full border border-white/35 bg-white/75 shadow-[0_0_10px_rgba(255,255,255,.55)]"
            style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
            title={moon}
          />
        );
      })}
    </div>
  );
}

function PlanetNode({
  system,
  satellite,
  x,
  y,
  onWarp,
}: {
  system: System;
  satellite: Satellite;
  x: string;
  y: string;
  onWarp: (satellite: Satellite) => void;
}) {
  const [light, mid, dark] = satellite.palette;

  return (
    <motion.div
      className="group/planet absolute z-40 h-11 w-11 -translate-x-1/2 -translate-y-1/2 sm:h-12 sm:w-12"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0.65 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      onMouseEnter={() => undefined}
    >
      <MoonCluster moons={satellite.moons} />
      <button
        type="button"
        aria-label={`${satellite.name} 입장`}
        onClick={() => onWarp(satellite)}
        className="relative z-50 grid h-full w-full place-items-center rounded-full border border-white/22 text-[10px] font-black text-white shadow-[0_10px_24px_rgba(0,0,0,.28)] transition duration-300 hover:scale-110 hover:border-white/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:text-[11px]"
        style={{
          background: `radial-gradient(circle at 30% 24%, rgba(255,255,255,.95) 0%, ${light} 14%, ${mid} 47%, ${dark} 82%, #151225 100%)`,
          boxShadow: `0 0 18px color-mix(in srgb, ${mid} 45%, transparent), inset -8px -7px 13px rgba(0,0,0,.28), inset 5px 4px 8px rgba(255,255,255,.12)`,
        }}
      >
        <PlanetSkin variant={satellite.variant} />
        <span className="relative z-10 drop-shadow-[0_1px_3px_rgba(0,0,0,.55)]">{satellite.short}</span>
      </button>

      <div className="pointer-events-none absolute left-1/2 top-[calc(100%+10px)] z-[60] -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-[#070913]/85 px-2.5 py-1 text-[9px] font-bold tracking-wide text-white/82 opacity-0 shadow-xl backdrop-blur-xl transition duration-200 group-hover/planet:opacity-100">
        {satellite.name}
      </div>
    </motion.div>
  );
}

function buildSystems(items?: UniverseItem[]) {
  const systems = JSON.parse(JSON.stringify(galaxySystems)) as System[];
  if (!items || items.length === 0) return systems;

  systems.forEach((system) => {
    system.satellites = [];
    system.count = 0;
  });

  items.forEach((item, index) => {
    const hash = hashString(`${item.id}-${item.slug}-${item.name}`);
    let system = systems.find((candidate) => candidate.category === item.category);
    if (!system) system = systems[index % systems.length];

    const satelliteIndex = system.satellites.length;
    system.count += item.subscribers || 0;
    system.satellites.push({
      name: item.name,
      short: item.name.slice(0, 2),
      slug: item.slug,
      description: item.description,
      angle: (hash % 360 + satelliteIndex * 79) % 360,
      speed: 0.0048 + ((hash % 33) / 10000),
      variant: PLANET_VARIANTS[hash % PLANET_VARIANTS.length],
      palette: PLANET_PALETTES[hash % PLANET_PALETTES.length],
      moons: item.tags?.slice(0, 3) || [],
    });
  });

  return systems.filter((system) => system.satellites.length > 0);
}

export default function CosmicGalaxyExplorer({ items }: { items?: UniverseItem[] }) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastFrameRef = useRef(0);
  const warpTimerRef = useRef<number | null>(null);
  const [time, setTime] = useState(0);
  const [mapWidth, setMapWidth] = useState(1100);
  const [isVisible, setIsVisible] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [warpTarget, setWarpTarget] = useState<Satellite | null>(null);

  const systems = useMemo(() => buildSystems(items), [items]);
  const orbitScale = Math.min(1, Math.max(0.36, mapWidth / 1080));

  const planets = useMemo(() => {
    return systems.flatMap((system) =>
      system.satellites.map((satellite) => {
        const angle = (satellite.angle * Math.PI) / 180 + time * satellite.speed;
        const orbit = system.orbit * orbitScale;
        const x = `calc(${system.x}% + ${Math.cos(angle) * orbit}px)`;
        const y = `calc(${system.y}% + ${Math.sin(angle) * orbit * 0.53}px)`;
        return { system, satellite, x, y };
      })
    );
  }, [orbitScale, systems, time]);

  useEffect(() => {
    const node = mapRef.current;
    if (!node) return;

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (entry) setMapWidth(entry.contentRect.width);
    });
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry) setIsVisible(entry.isIntersecting);
      },
      { rootMargin: "160px" }
    );

    resizeObserver.observe(node);
    intersectionObserver.observe(node);
    return () => {
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || !isVisible) return;

    const animate = (timestamp: number) => {
      if (lastFrameRef.current === 0) lastFrameRef.current = timestamp;
      const elapsed = timestamp - lastFrameRef.current;
      if (elapsed >= 45) {
        setTime((value) => value + Math.min(elapsed, 100) * 0.0058 * (hovered ? 0.28 : 1));
        lastFrameRef.current = timestamp;
      }
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      lastFrameRef.current = 0;
    };
  }, [hovered, isVisible, prefersReducedMotion]);

  useEffect(() => {
    return () => {
      if (warpTimerRef.current !== null) window.clearTimeout(warpTimerRef.current);
    };
  }, []);

  function handleWarp(satellite: Satellite) {
    if (!satellite.slug) return;
    setWarpTarget(satellite);
    warpTimerRef.current = window.setTimeout(() => {
      router.push(`/universe/${satellite.slug}`);
    }, 900);
  }

  return (
    <div
      ref={mapRef}
      className="relative mx-auto h-[620px] w-full overflow-hidden rounded-[2rem] border border-white/[.08] bg-[#03040a] shadow-[0_28px_90px_rgba(0,0,0,.38),inset_0_1px_0_rgba(255,255,255,.04)] sm:h-[700px] sm:rounded-[2.5rem] lg:h-[760px] lg:rounded-[3rem]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes galaxyTwinkle {
          0%, 100% { opacity: .22; transform: scale(.9); }
          50% { opacity: .88; transform: scale(1.35); }
        }
        @keyframes galaxyNebula {
          0%, 100% { transform: translate3d(0,0,0) scale(1); opacity: .72; }
          50% { transform: translate3d(2.2%, -1.2%, 0) scale(1.06); opacity: .92; }
        }
        @keyframes galaxyStarPulse {
          0%, 100% { filter: brightness(1) saturate(1); }
          50% { filter: brightness(1.12) saturate(1.08); }
        }
        @keyframes warpRay {
          0% { transform: rotate(var(--ray-angle)) translateX(18px) scaleX(.05); opacity: 0; }
          35% { opacity: .9; }
          100% { transform: rotate(var(--ray-angle)) translateX(460px) scaleX(4.8); opacity: 0; }
        }
        .galaxy-star { animation: galaxyTwinkle var(--twinkle-duration, 5s) ease-in-out infinite; }
        .galaxy-nebula { animation: galaxyNebula 18s ease-in-out infinite; }
        .galaxy-system-star { animation: galaxyStarPulse 5.8s ease-in-out infinite; }
        .warp-ray { animation: warpRay .9s cubic-bezier(.15,.75,.2,1) infinite; }
      `}} />

      <GalaxyBackdrop />
      <StarField />

      {systems.map((system) => (
        <OrbitRings key={`orbit-${system.id}`} system={system} scale={orbitScale} />
      ))}

      {systems.map((system) => (
        <SystemStar key={system.id} system={system} scale={orbitScale} />
      ))}

      {planets.map(({ system, satellite, x, y }) => (
        <PlanetNode
          key={`${system.id}-${satellite.slug || satellite.name}`}
          system={system}
          satellite={satellite}
          x={x}
          y={y}
          onWarp={handleWarp}
        />
      ))}

      <AnimatePresence>
        {warpTarget && (
          <motion.div
            className="absolute inset-0 z-[200] overflow-hidden bg-[#02030a]/92 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_26px_12px_rgba(255,255,255,.75),0_0_80px_32px_rgba(130,100,255,.45)]" />
            {Array.from({ length: 36 }, (_, index) => (
              <span
                key={index}
                className="warp-ray absolute left-1/2 top-1/2 h-[1px] w-[180px] origin-left bg-gradient-to-r from-transparent via-white to-transparent"
                style={{
                  "--ray-angle": `${index * 10}deg`,
                  animationDelay: `${(index % 9) * -0.05}s`,
                } as CSSVars}
              />
            ))}
            <motion.div
              className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/50"
              animate={{ scale: [0.4, 2.4, 8], opacity: [0, 1, 0] }}
              transition={{ duration: 0.85, ease: "easeOut" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
