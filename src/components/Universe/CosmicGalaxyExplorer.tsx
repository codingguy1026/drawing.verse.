"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  PointerEvent as ReactPointerEvent,
  WheelEvent as ReactWheelEvent,
} from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Compass,
  FileText,
  LocateFixed,
  Minus,
  Move,
  Orbit,
  Plus,
  RotateCcw,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import type { UniverseItem } from "./universe.types";

const CANVAS_SIZE = 1800;
const MIN_ZOOM = 0.58;
const MAX_ZOOM = 1.55;
const DEFAULT_ZOOM = 0.88;
const ZOOM_STEP = 0.16;

const PLANET_COLORS = [
  "from-violet-500 to-indigo-600",
  "from-sky-400 to-blue-600",
  "from-fuchsia-500 to-pink-600",
  "from-emerald-400 to-teal-600",
  "from-amber-400 to-orange-600",
  "from-rose-400 to-red-600",
];

type ViewState = {
  x: number;
  y: number;
  scale: number;
};

type Point = {
  x: number;
  y: number;
};

type GestureState =
  | {
      mode: "pan";
      pointerId: number;
      startX: number;
      startY: number;
      originX: number;
      originY: number;
    }
  | {
      mode: "pinch";
      startDistance: number;
      startScale: number;
      startMidX: number;
      startMidY: number;
      originX: number;
      originY: number;
    }
  | null;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getPosition(id: string) {
  let hash = 0;

  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }

  return {
    x: Math.abs(hash % 1200) - 600,
    y: Math.abs((hash >> 8) % 980) - 490,
  };
}

function getDistance(a: Point, b: Point) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function getMidpoint(a: Point, b: Point) {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  };
}

function compactNumber(value: number) {
  return new Intl.NumberFormat("ko-KR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function Planet({
  item,
  index,
  zoom,
  selected,
  onSelect,
}: {
  item: UniverseItem;
  index: number;
  zoom: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const { x, y } = useMemo(() => getPosition(item.id), [item.id]);
  const colorClass = PLANET_COLORS[Math.abs(x + y) % PLANET_COLORS.length];
  const size = Math.min(Math.max(item.subscribers / 150 + 62, 70), 126);
  const showName = zoom >= 0.74;
  const showStats = zoom >= 1.08;

  return (
    <motion.button
      type="button"
      data-map-interactive="true"
      aria-label={`${item.name} 유니버스 선택`}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      initial={{ opacity: 0, scale: 0.72 }}
      animate={{ opacity: 1, scale: selected ? 1.06 : 1 }}
      transition={{
        type: "spring",
        stiffness: 220,
        damping: 20,
        delay: Math.min(index * 0.035, 0.35),
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
      className="group z-10 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-4 dark:focus-visible:ring-offset-[#0b0d16]"
    >
      <div className="relative h-full w-full">
        {item.isTrending && (
          <div className="pointer-events-none absolute -inset-3 rounded-full border border-amber-300/50 opacity-70 dark:border-amber-300/25" />
        )}

        {selected && (
          <motion.div
            layoutId="selected-planet-ring"
            className="pointer-events-none absolute -inset-4 rounded-full border-2 border-violet-400/70 shadow-[0_0_30px_rgba(139,92,246,0.3)] dark:border-violet-300/55"
          />
        )}

        <motion.div
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          animate={{ y: [0, -5, 0] }}
          transition={{
            y: {
              duration: 4 + (index % 3),
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
          className={`relative h-full w-full overflow-hidden rounded-full bg-gradient-to-br ${colorClass} shadow-[0_16px_40px_rgba(79,70,229,0.22)] ring-4 ring-white/65 dark:shadow-[0_0_36px_rgba(99,102,241,0.22)] dark:ring-white/15`}
        >
          <div className="absolute left-[20%] top-[17%] h-[24%] w-[24%] rounded-full bg-white/30 blur-[1px]" />
          <div className="absolute bottom-[20%] right-[18%] h-[17%] w-[17%] rounded-full bg-black/10" />
          <div className="absolute -left-[18%] top-[48%] h-[16%] w-[140%] -rotate-12 rounded-full border border-white/20" />
        </motion.div>

        {showName && (
          <div className="pointer-events-none absolute left-1/2 top-[calc(100%+11px)] -translate-x-1/2 whitespace-nowrap text-center">
            <div
              className={`rounded-full border px-3 py-1.5 text-xs font-black shadow-sm backdrop-blur-md transition ${
                selected
                  ? "border-violet-300 bg-violet-50 text-violet-800 dark:border-violet-300/30 dark:bg-violet-400/15 dark:text-violet-100"
                  : "border-slate-200/80 bg-white/90 text-slate-800 dark:border-white/10 dark:bg-[#111322]/90 dark:text-white/80"
              }`}
            >
              {item.name}
            </div>

            {showStats && (
              <div className="mt-1 flex justify-center gap-2 text-[10px] font-bold text-slate-500 dark:text-white/45">
                <span>{compactNumber(item.subscribers)}명</span>
                <span>·</span>
                <span>글 {compactNumber(item.posts)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.button>
  );
}

function SelectedUniverseCard({
  item,
  onClose,
  onFocus,
}: {
  item: UniverseItem;
  onClose: () => void;
  onFocus: () => void;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#111322]/95">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-600 dark:text-violet-300">
            Selected universe
          </p>
          <h3 className="mt-1 truncate text-lg font-black text-slate-950 dark:text-white">
            {item.name}
          </h3>
        </div>
        <button
          type="button"
          data-map-interactive="true"
          onClick={onClose}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-white"
          aria-label="선택 닫기"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500 dark:text-white/45">
        {item.description || "아직 소개가 없는 유니버스예요."}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-white/[0.04]">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-white/30">
            <Users className="h-3 w-3" />
            멤버
          </div>
          <p className="mt-1 text-sm font-black text-slate-800 dark:text-white/80">
            {compactNumber(item.subscribers)}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-white/[0.04]">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-white/30">
            <FileText className="h-3 w-3" />
            게시글
          </div>
          <p className="mt-1 text-sm font-black text-slate-800 dark:text-white/80">
            {compactNumber(item.posts)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          data-map-interactive="true"
          onClick={onFocus}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-black text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-white/55 dark:hover:bg-white/5"
        >
          <LocateFixed className="h-4 w-4" />
          행성 보기
        </button>
        <Link
          data-map-interactive="true"
          href={`/universe/${item.slug}`}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 text-xs font-black text-white transition hover:bg-violet-700 dark:bg-white dark:text-slate-950 dark:hover:bg-violet-100"
        >
          들어가기
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export default function CosmicGalaxyExplorer({
  items = [],
}: {
  items?: UniverseItem[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointersRef = useRef<Map<number, Point>>(new Map());
  const gestureRef = useRef<GestureState>(null);
  const [view, setView] = useState<ViewState>({
    x: 0,
    y: 0,
    scale: DEFAULT_ZOOM,
  });
  const viewRef = useRef(view);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  useEffect(() => {
    if (selectedSlug && !items.some((item) => item.slug === selectedSlug)) {
      setSelectedSlug(null);
    }
  }, [items, selectedSlug]);

  const selectedItem = useMemo(
    () => items.find((item) => item.slug === selectedSlug) ?? null,
    [items, selectedSlug]
  );

  const stars = useMemo(
    () =>
      Array.from({ length: 96 }, (_, index) => ({
        id: index,
        x: ((index * 197 + 83) % 1680) - 840,
        y: ((index * 311 + 47) % 1680) - 840,
        size: 1 + (index % 3),
        opacity: 0.18 + (index % 5) * 0.09,
      })),
    []
  );

  const clampView = useCallback((next: ViewState): ViewState => {
    const viewport = containerRef.current;
    const width = viewport?.clientWidth ?? 800;
    const height = viewport?.clientHeight ?? 560;
    const scale = clamp(next.scale, MIN_ZOOM, MAX_ZOOM);
    const maxX = Math.max(180, (CANVAS_SIZE * scale - width) / 2 + 180);
    const maxY = Math.max(160, (CANVAS_SIZE * scale - height) / 2 + 180);

    return {
      x: clamp(next.x, -maxX, maxX),
      y: clamp(next.y, -maxY, maxY),
      scale,
    };
  }, []);

  const commitView = useCallback(
    (next: ViewState) => {
      const clamped = clampView(next);
      viewRef.current = clamped;
      setView(clamped);
    },
    [clampView]
  );

  const zoomAround = useCallback(
    (targetScale: number, focalX = 0, focalY = 0) => {
      const current = viewRef.current;
      const nextScale = clamp(targetScale, MIN_ZOOM, MAX_ZOOM);
      const ratio = nextScale / current.scale;

      commitView({
        scale: nextScale,
        x: focalX - (focalX - current.x) * ratio,
        y: focalY - (focalY - current.y) * ratio,
      });
    },
    [commitView]
  );

  const resetView = useCallback(() => {
    pointersRef.current.clear();
    gestureRef.current = null;
    commitView({ x: 0, y: 0, scale: DEFAULT_ZOOM });
  }, [commitView]);

  const focusUniverse = useCallback(
    (item: UniverseItem) => {
      const position = getPosition(item.id);
      const targetScale = Math.max(viewRef.current.scale, 1.18);
      commitView({
        scale: targetScale,
        x: -position.x * targetScale,
        y: -position.y * targetScale,
      });
    },
    [commitView]
  );

  function handleWheel(event: ReactWheelEvent<HTMLDivElement>) {
    if (items.length === 0) return;
    event.preventDefault();

    const viewport = containerRef.current;
    if (!viewport) return;

    const rect = viewport.getBoundingClientRect();
    const focalX = event.clientX - (rect.left + rect.width / 2);
    const focalY = event.clientY - (rect.top + rect.height / 2);
    const factor = Math.exp(-event.deltaY * 0.0014);

    zoomAround(viewRef.current.scale * factor, focalX, focalY);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (items.length === 0) return;

    const target = event.target as HTMLElement;
    if (target.closest('[data-map-interactive="true"]')) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    const points = Array.from(pointersRef.current.values());
    const current = viewRef.current;

    if (points.length === 1) {
      gestureRef.current = {
        mode: "pan",
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: current.x,
        originY: current.y,
      };
      return;
    }

    if (points.length >= 2) {
      const viewport = containerRef.current;
      if (!viewport) return;

      const rect = viewport.getBoundingClientRect();
      const midpoint = getMidpoint(points[0], points[1]);

      gestureRef.current = {
        mode: "pinch",
        startDistance: Math.max(1, getDistance(points[0], points[1])),
        startScale: current.scale,
        startMidX: midpoint.x - (rect.left + rect.width / 2),
        startMidY: midpoint.y - (rect.top + rect.height / 2),
        originX: current.x,
        originY: current.y,
      };
    }
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!pointersRef.current.has(event.pointerId)) return;

    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    const points = Array.from(pointersRef.current.values());
    const gesture = gestureRef.current;

    if (points.length >= 2) {
      const viewport = containerRef.current;
      if (!viewport) return;

      const rect = viewport.getBoundingClientRect();
      const midpoint = getMidpoint(points[0], points[1]);

      if (!gesture || gesture.mode !== "pinch") {
        const current = viewRef.current;
        gestureRef.current = {
          mode: "pinch",
          startDistance: Math.max(1, getDistance(points[0], points[1])),
          startScale: current.scale,
          startMidX: midpoint.x - (rect.left + rect.width / 2),
          startMidY: midpoint.y - (rect.top + rect.height / 2),
          originX: current.x,
          originY: current.y,
        };
        return;
      }

      const nextDistance = Math.max(1, getDistance(points[0], points[1]));
      const nextScale = clamp(
        gesture.startScale * (nextDistance / gesture.startDistance),
        MIN_ZOOM,
        MAX_ZOOM
      );
      const ratio = nextScale / gesture.startScale;
      const midX = midpoint.x - (rect.left + rect.width / 2);
      const midY = midpoint.y - (rect.top + rect.height / 2);

      commitView({
        scale: nextScale,
        x: midX - (gesture.startMidX - gesture.originX) * ratio,
        y: midY - (gesture.startMidY - gesture.originY) * ratio,
      });
      return;
    }

    if (
      points.length === 1 &&
      gesture?.mode === "pan" &&
      gesture.pointerId === event.pointerId
    ) {
      commitView({
        ...viewRef.current,
        x: gesture.originX + event.clientX - gesture.startX,
        y: gesture.originY + event.clientY - gesture.startY,
      });
    }
  }

  function handlePointerEnd(event: ReactPointerEvent<HTMLDivElement>) {
    pointersRef.current.delete(event.pointerId);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const remaining = Array.from(pointersRef.current.entries());

    if (remaining.length === 1) {
      const [pointerId, point] = remaining[0];
      const current = viewRef.current;
      gestureRef.current = {
        mode: "pan",
        pointerId,
        startX: point.x,
        startY: point.y,
        originX: current.x,
        originY: current.y,
      };
    } else if (remaining.length === 0) {
      gestureRef.current = null;
    }
  }

  const zoomStage =
    view.scale < 0.74
      ? "은하 지도"
      : view.scale < 1.08
        ? "유니버스 탐색"
        : "근접 탐색";

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0d0d19]">
      <header className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-400/10 dark:text-violet-200">
            <Orbit className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-600 dark:text-violet-300">
              Galaxy explorer
            </p>
            <h2 className="mt-0.5 text-lg font-black text-slate-950 dark:text-white">
              유니버스 우주 탐험
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-white/40">
              드래그로 이동하고, 휠이나 두 손가락으로 확대해 보세요. 행성을 누르면 정보가 열려요.
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
            {items.length}개 · {zoomStage}
          </span>
        </div>
      </header>

      <div
        ref={containerRef}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        className="relative h-[500px] w-full overflow-hidden bg-gradient-to-br from-violet-50 via-white to-sky-50 sm:h-[580px] lg:h-[640px] dark:from-[#111426] dark:via-[#0b0d17] dark:to-[#121827]"
        style={{ touchAction: "none" }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-55">
          <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-violet-300/30 blur-[100px] dark:bg-violet-600/15" />
          <div className="absolute -bottom-28 right-0 h-96 w-96 rounded-full bg-sky-300/25 blur-[110px] dark:bg-sky-500/10" />
          <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-200/20 blur-[100px] dark:bg-fuchsia-500/8" />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(99,102,241,0.16)_1px,transparent_0)] [background-size:32px_32px] opacity-30 dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.13)_1px,transparent_0)] dark:opacity-20" />

        <div
          data-map-interactive="true"
          className="absolute left-3 top-3 z-40 flex items-center gap-1 rounded-2xl border border-slate-200 bg-white/90 p-1.5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-[#111322]/90"
        >
          <button
            type="button"
            onClick={() => zoomAround(viewRef.current.scale - ZOOM_STEP)}
            disabled={view.scale <= MIN_ZOOM + 0.01}
            className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 disabled:opacity-30 dark:text-white/60 dark:hover:bg-white/5"
            aria-label="축소"
          >
            <Minus className="h-4 w-4" />
          </button>
          <div className="min-w-12 text-center text-xs font-black text-slate-500 dark:text-white/45">
            {Math.round(view.scale * 100)}%
          </div>
          <button
            type="button"
            onClick={() => zoomAround(viewRef.current.scale + ZOOM_STEP)}
            disabled={view.scale >= MAX_ZOOM - 0.01}
            className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 disabled:opacity-30 dark:text-white/60 dark:hover:bg-white/5"
            aria-label="확대"
          >
            <Plus className="h-4 w-4" />
          </button>
          <div className="mx-1 h-6 w-px bg-slate-200 dark:bg-white/10" />
          <button
            type="button"
            onClick={resetView}
            className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 dark:text-white/60 dark:hover:bg-white/5"
            aria-label="지도 중앙으로 돌아가기"
            title="중앙으로 돌아가기"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
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
          <div
            className="absolute left-1/2 top-1/2 h-[1800px] w-[1800px] select-none"
            style={{
              transform: `translate(-50%, -50%) translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
              transformOrigin: "center",
            }}
          >
            <div className="pointer-events-none absolute inset-0">
              {stars.map((star) => (
                <span
                  key={star.id}
                  className="absolute rounded-full bg-indigo-400 dark:bg-white"
                  style={{
                    left: CANVAS_SIZE / 2 + star.x,
                    top: CANVAS_SIZE / 2 + star.y,
                    width: star.size,
                    height: star.size,
                    opacity: star.opacity,
                  }}
                />
              ))}

              <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-300/15 dark:border-violet-300/8" />
              <div className="absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-300/12 dark:border-sky-300/7" />
              <div className="absolute left-1/2 top-1/2 h-[1320px] w-[1320px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-fuchsia-300/10 dark:border-fuchsia-300/6" />
            </div>

            <div className="pointer-events-none absolute left-1/2 top-1/2 z-[5] -translate-x-1/2 -translate-y-1/2">
              <div className="relative grid h-20 w-20 place-items-center rounded-full border border-violet-300/60 bg-white/80 shadow-[0_0_50px_rgba(139,92,246,0.2)] backdrop-blur-xl dark:border-violet-400/20 dark:bg-violet-400/10">
                <div className="absolute h-32 w-32 rounded-full border border-violet-300/25 dark:border-violet-400/10" />
                <div className="absolute h-48 w-48 rounded-full border border-violet-300/15 dark:border-violet-400/8" />
                <Sparkles className="h-7 w-7 text-violet-600 dark:text-violet-200" />
              </div>
              {view.scale >= 0.74 && (
                <div className="mt-3 whitespace-nowrap rounded-full border border-violet-200 bg-white/90 px-3 py-1.5 text-center text-[10px] font-black uppercase tracking-[0.14em] text-violet-700 shadow-sm dark:border-violet-300/15 dark:bg-[#111322]/90 dark:text-violet-200">
                  Verse Core
                </div>
              )}
            </div>

            {items.map((item, index) => (
              <Planet
                key={item.id}
                item={item}
                index={index}
                zoom={view.scale}
                selected={item.slug === selectedSlug}
                onSelect={() => setSelectedSlug(item.slug)}
              />
            ))}
          </div>
        )}

        {selectedItem && (
          <div
            data-map-interactive="true"
            className="absolute bottom-4 right-4 z-50 hidden w-[300px] sm:block"
          >
            <SelectedUniverseCard
              item={selectedItem}
              onClose={() => setSelectedSlug(null)}
              onFocus={() => focusUniverse(selectedItem)}
            />
          </div>
        )}

        <div className="pointer-events-none absolute bottom-3 left-3 z-30 hidden rounded-full border border-slate-200/80 bg-white/75 px-3 py-1.5 text-[10px] font-bold text-slate-500 backdrop-blur-md sm:block dark:border-white/10 dark:bg-[#111322]/70 dark:text-white/35">
          {view.scale < 0.74
            ? "멀리서 전체 은하를 보는 중"
            : view.scale < 1.08
              ? "행성 이름이 보이는 탐색 거리"
              : "멤버와 게시글까지 보이는 근접 거리"}
        </div>
      </div>

      {selectedItem && (
        <div className="border-t border-slate-200 p-3 sm:hidden dark:border-white/10">
          <SelectedUniverseCard
            item={selectedItem}
            onClose={() => setSelectedSlug(null)}
            onFocus={() => focusUniverse(selectedItem)}
          />
        </div>
      )}
    </section>
  );
}
