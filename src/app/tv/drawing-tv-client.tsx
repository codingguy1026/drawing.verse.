"use client";

import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Check,
  ChevronRight,
  Clapperboard,
  Clock3,
  Eye,
  Flame,
  Heart,
  Maximize2,
  MessageCircle,
  Mic2,
  MoreHorizontal,
  Pause,
  Play,
  Radio,
  Search,
  Share2,
  Sparkles,
  Upload,
  Video,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";

type VideoItem = {
  id: number;
  title: string;
  creator: string;
  category: string;
  views: string;
  age: string;
  duration: string;
  description: string;
  gradient: string;
  accent: string;
  initials: string;
  badge?: string;
};

const videos: VideoItem[] = [
  {
    id: 1,
    title: "우리가 만든 첫 번째 유니버스",
    creator: "Drawing Verse",
    category: "드버스 오리지널",
    views: "1.8만",
    age: "2시간 전",
    duration: "08:26",
    description:
      "작은 낙서 하나가 거대한 세계가 되는 순간. Drawing Verse의 첫 기록을 공개합니다.",
    gradient: "linear-gradient(135deg, #160b33 0%, #6d28d9 43%, #ec4899 100%)",
    accent: "#c4b5fd",
    initials: "DV",
    badge: "PREMIERE",
  },
  {
    id: 2,
    title: "30초 만에 캐릭터 분위기 바꾸기",
    creator: "CosmicDraw",
    category: "그림",
    views: "8.4천",
    age: "5시간 전",
    duration: "00:34",
    description: "색과 빛만 바꿔도 캐릭터의 이야기는 완전히 달라집니다.",
    gradient: "linear-gradient(145deg, #082f49 0%, #0891b2 48%, #a5f3fc 100%)",
    accent: "#67e8f9",
    initials: "CD",
    badge: "SHORT",
  },
  {
    id: 3,
    title: "한화가 우승하는 세계선을 그려봤다",
    creator: "Orange Orbit",
    category: "스포츠",
    views: "3.1만",
    age: "어제",
    duration: "11:02",
    description: "독수리가 가장 높은 곳까지 날아오르는 또 하나의 우주.",
    gradient: "linear-gradient(140deg, #431407 0%, #ea580c 48%, #fbbf24 100%)",
    accent: "#fdba74",
    initials: "OO",
    badge: "HOT",
  },
  {
    id: 4,
    title: "새벽 도시를 그리는 조용한 작업실",
    creator: "NebulaArt",
    category: "작업실",
    views: "6.7천",
    age: "2일 전",
    duration: "24:18",
    description: "키보드 소리와 붓 끝만 남은 새벽의 작업 기록입니다.",
    gradient: "linear-gradient(135deg, #020617 0%, #1e3a8a 52%, #7c3aed 100%)",
    accent: "#93c5fd",
    initials: "NA",
  },
  {
    id: 5,
    title: "괴물 시설 A-000 콘셉트 제작기",
    creator: "Deep Archive",
    category: "세계관",
    views: "1.2만",
    age: "3일 전",
    duration: "15:40",
    description: "텍스트로 시작한 공포 세계관이 공간과 장면으로 완성되는 과정.",
    gradient: "linear-gradient(150deg, #071a12 0%, #166534 48%, #84cc16 100%)",
    accent: "#bef264",
    initials: "DA",
  },
  {
    id: 6,
    title: "리듬 하나로 장면을 기억시키는 법",
    creator: "Beat Planet",
    category: "음악",
    views: "9.9천",
    age: "4일 전",
    duration: "06:51",
    description: "게임 속 중요한 순간을 음악으로 각인시키는 작은 공식들.",
    gradient: "linear-gradient(145deg, #3b0764 0%, #c026d3 48%, #fb7185 100%)",
    accent: "#f5d0fe",
    initials: "BP",
  },
  {
    id: 7,
    title: "종이 한 장으로 시작하는 짧은 애니",
    creator: "Frame by Frame",
    category: "애니메이션",
    views: "4.3천",
    age: "5일 전",
    duration: "09:14",
    description: "어려운 장비 없이 첫 장면에 움직임을 불어넣어 봅니다.",
    gradient: "linear-gradient(135deg, #4c0519 0%, #e11d48 45%, #fda4af 100%)",
    accent: "#fecdd3",
    initials: "FF",
  },
  {
    id: 8,
    title: "커뮤니티가 하나의 우주가 되는 과정",
    creator: "Verse Lab",
    category: "드버스 오리지널",
    views: "7.5천",
    age: "1주 전",
    duration: "12:09",
    description:
      "관심사가 같은 사람들이 만나 세계를 만드는 커뮤니티 디자인 이야기.",
    gradient: "linear-gradient(145deg, #172554 0%, #4f46e5 48%, #22d3ee 100%)",
    accent: "#a5f3fc",
    initials: "VL",
  },
];

const categories = [
  "전체",
  "드버스 오리지널",
  "그림",
  "세계관",
  "애니메이션",
  "음악",
  "스포츠",
  "작업실",
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function CreatorAvatar({
  video,
  compact = false,
}: {
  video: VideoItem;
  compact?: boolean;
}) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-2xl border border-white/25 font-black text-white shadow-lg",
        compact ? "h-9 w-9 text-[10px]" : "h-11 w-11 text-xs",
      )}
      style={{ background: video.gradient }}
    >
      {video.initials}
    </span>
  );
}

function VideoArtwork({
  video,
  vertical = false,
}: {
  video: VideoItem;
  vertical?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden",
        vertical
          ? "aspect-[9/14] rounded-[28px]"
          : "aspect-video rounded-[26px]",
      )}
      style={{ background: video.gradient }}
    >
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.13)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.13)_1px,transparent_1px)] [background-size:36px_36px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="absolute -left-[15%] top-[5%] h-[55%] w-[70%] rounded-full bg-white/20 blur-3xl" />
      <div className="absolute -bottom-[25%] right-[-15%] h-[65%] w-[75%] rounded-full bg-black/30 blur-3xl" />
      <div className="absolute left-[18%] top-[20%] h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_18px_white]" />
      <div className="absolute right-[22%] top-[30%] h-1 w-1 rounded-full bg-white/90 shadow-[0_0_12px_white]" />
      <div className="absolute bottom-[25%] left-[44%] h-1 w-1 rounded-full bg-white/80 shadow-[0_0_14px_white]" />

      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={cn(
            "font-black tracking-[-0.08em] text-white/20",
            vertical ? "text-6xl" : "text-7xl sm:text-8xl",
          )}
        >
          {video.initials}
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/75 via-black/20 to-transparent p-4 pt-16 text-white">
        <span className="rounded-full border border-white/20 bg-black/25 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] backdrop-blur-md">
          {video.badge ?? video.category}
        </span>
        <span className="rounded-lg bg-black/70 px-2 py-1 text-[10px] font-black">
          {video.duration}
        </span>
      </div>
    </div>
  );
}

export default function DrawingTVClient() {
  const [activeCategory, setActiveCategory] = useState("전체");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(videos[0].id);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [liked, setLiked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);
  const [toast, setToast] = useState("");
  const playerRef = useRef<HTMLDivElement>(null);

  const selected = videos.find((video) => video.id === selectedId) ?? videos[0];

  const filteredVideos = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return videos.filter((video) => {
      const categoryMatches =
        activeCategory === "전체" || video.category === activeCategory;
      const searchMatches =
        !normalized ||
        [video.title, video.creator, video.category, video.description]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      return categoryMatches && searchMatches;
    });
  }, [activeCategory, query]);

  function pickVideo(id: number) {
    setSelectedId(id);
    setPlaying(true);
    setLiked(false);
    requestAnimationFrame(() =>
      playerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      }),
    );
  }

  async function shareVideo() {
    const shareData = {
      title: selected.title,
      text: `${selected.creator}의 영상`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setToast("드티비 링크를 복사했어요!");
      }
    } catch {
      // The user closing the native share sheet is not an error worth surfacing.
    }
  }

  function showSoon(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f7fb] text-slate-950 transition-colors dark:bg-[#050509] dark:text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-18rem] top-[-10rem] h-[42rem] w-[42rem] rounded-full bg-violet-400/15 blur-[120px] dark:bg-violet-700/20" />
        <div className="absolute right-[-15rem] top-[16rem] h-[38rem] w-[38rem] rounded-full bg-rose-400/10 blur-[130px] dark:bg-fuchsia-700/15" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1480px] px-4 pb-24 pt-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-2 rounded-full bg-rose-500 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-white shadow-lg shadow-rose-500/20">
                <Radio className="h-3.5 w-3.5 animate-pulse" />
                On Air
              </span>
              <span className="text-xs font-black uppercase tracking-[0.28em] text-slate-400">
                Stories in motion
              </span>
            </div>
            <h1 className="flex flex-wrap items-baseline gap-x-4 text-4xl font-black tracking-[-0.06em] sm:text-6xl">
              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent">
                Drawing TV
              </span>
              <span className="text-2xl tracking-[-0.04em] text-slate-400 sm:text-3xl">
                드티비
              </span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-500 dark:text-slate-400 sm:text-base">
              그림, 세계관, 음악과 이야기가 영상으로 움직이는 Drawing Verse의
              창작 채널.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-xl focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-500/10 dark:border-white/10 dark:bg-white/[0.06] sm:w-80">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="영상, 크리에이터 검색"
                className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-slate-400"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="검색어 지우기"
                >
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              )}
            </label>
            <button
              type="button"
              onClick={() => setStudioOpen(true)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-violet-600 dark:bg-white dark:text-slate-950 dark:hover:bg-violet-200"
            >
              <Upload className="h-4 w-4" />
              영상 올리기
            </button>
          </div>
        </header>

        <nav
          className="mb-7 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="드티비 카테고리"
        >
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2.5 text-xs font-black transition active:scale-95",
                activeCategory === category
                  ? "bg-slate-950 text-white shadow-lg dark:bg-white dark:text-slate-950"
                  : "border border-slate-200 bg-white/70 text-slate-500 hover:border-violet-300 hover:text-violet-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:text-white",
              )}
            >
              {category}
            </button>
          ))}
        </nav>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_370px]">
          <motion.article
            layout
            className="overflow-hidden rounded-[34px] border border-slate-200/80 bg-white shadow-[0_24px_80px_rgba(30,41,59,.10)] dark:border-white/10 dark:bg-[#0b0b12] dark:shadow-[0_24px_100px_rgba(0,0,0,.5)]"
          >
            <div
              ref={playerRef}
              className="group relative isolate aspect-video overflow-hidden"
              style={{ background: selected.gradient }}
            >
              <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,.11)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.11)_1px,transparent_1px)] [background-size:52px_52px]" />
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, scale: 1.07 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.55 }}
                className="absolute inset-0"
              >
                <div className="absolute -left-[10%] -top-[15%] h-[65%] w-[58%] rounded-full bg-white/25 blur-[80px]" />
                <div className="absolute bottom-[-25%] right-[-8%] h-[65%] w-[62%] rounded-full bg-black/35 blur-[90px]" />
                <div className="absolute inset-0 grid place-items-center">
                  <div className="text-center text-white">
                    <span className="block text-7xl font-black tracking-[-0.09em] text-white/20 sm:text-9xl">
                      {selected.initials}
                    </span>
                    <span className="mt-2 block text-[10px] font-black uppercase tracking-[0.38em] text-white/65 sm:text-xs">
                      Drawing Television
                    </span>
                  </div>
                </div>
              </motion.div>

              <button
                type="button"
                onClick={() => setPlaying((value) => !value)}
                aria-label={playing ? "일시정지" : "재생"}
                className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-black/30 text-white shadow-2xl backdrop-blur-xl transition hover:scale-110 hover:bg-white hover:text-slate-950 sm:h-20 sm:w-20"
              >
                {playing ? (
                  <Pause className="h-7 w-7 fill-current" />
                ) : (
                  <Play className="ml-1 h-7 w-7 fill-current" />
                )}
              </button>

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-4 pb-4 pt-20 text-white sm:px-6">
                <div className="mb-3 h-1 overflow-hidden rounded-full bg-white/25">
                  <motion.div
                    animate={{ width: playing ? "46%" : "18%" }}
                    transition={{ duration: 1.2 }}
                    className="h-full rounded-full bg-white"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setPlaying((value) => !value)}
                    aria-label={playing ? "일시정지" : "재생"}
                  >
                    {playing ? (
                      <Pause className="h-5 w-5 fill-current" />
                    ) : (
                      <Play className="h-5 w-5 fill-current" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMuted((value) => !value)}
                    aria-label={muted ? "소리 켜기" : "음소거"}
                  >
                    {muted ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </button>
                  <span className="text-[11px] font-bold text-white/75">
                    02:14 / {selected.duration}
                  </span>
                  <button
                    type="button"
                    onClick={() => playerRef.current?.requestFullscreen?.()}
                    className="ml-auto"
                    aria-label="전체 화면"
                  >
                    <Maximize2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em]">
                    <span className="rounded-full bg-violet-500/10 px-3 py-1.5 text-violet-600 dark:text-violet-300">
                      {selected.category}
                    </span>
                    <span className="text-slate-400">
                      조회수 {selected.views}회 · {selected.age}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black leading-tight tracking-[-0.04em] sm:text-3xl">
                    {selected.title}
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500 dark:text-slate-400">
                    {selected.description}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setLiked((value) => !value)}
                    className={cn(
                      "flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-black transition",
                      liked
                        ? "bg-rose-500 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-500 dark:bg-white/[0.07] dark:text-slate-300",
                    )}
                  >
                    <Heart className={cn("h-4 w-4", liked && "fill-current")} />
                    {liked ? "좋아요!" : "좋아요"}
                  </button>
                  <button
                    type="button"
                    onClick={shareVideo}
                    className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2.5 text-xs font-black text-slate-600 transition hover:text-violet-600 dark:bg-white/[0.07] dark:text-slate-300"
                  >
                    <Share2 className="h-4 w-4" /> 공유
                  </button>
                  <button
                    type="button"
                    onClick={() => showSoon("영상 메뉴는 곧 연결할게요!")}
                    className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-500 dark:bg-white/[0.07]"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4 border-t border-slate-200 pt-5 dark:border-white/10 sm:flex-row sm:items-center">
                <CreatorAvatar video={selected} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black">
                    {selected.creator}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-slate-400">
                    구독자 2.6천명
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSubscribed((value) => !value)}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-xs font-black transition",
                    subscribed
                      ? "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300"
                      : "bg-violet-600 text-white shadow-lg shadow-violet-500/20 hover:bg-violet-500",
                  )}
                >
                  {subscribed ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Bell className="h-4 w-4" />
                  )}
                  {subscribed ? "구독 중" : "구독"}
                </button>
              </div>
            </div>
          </motion.article>

          <aside className="rounded-[34px] border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.045] sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-rose-500">
                  <Flame className="h-3.5 w-3.5 fill-current" /> Now in Verse
                </p>
                <h2 className="mt-1 text-xl font-black tracking-tight">
                  지금 뜨는 영상
                </h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black text-slate-400 dark:bg-white/5">
                TOP 5
              </span>
            </div>

            <div className="grid gap-2">
              {videos.slice(0, 5).map((video, index) => (
                <button
                  key={video.id}
                  type="button"
                  onClick={() => pickVideo(video.id)}
                  className={cn(
                    "group grid grid-cols-[32px_72px_minmax(0,1fr)] items-center gap-3 rounded-2xl p-2 text-left transition",
                    selectedId === video.id
                      ? "bg-violet-50 dark:bg-violet-500/15"
                      : "hover:bg-slate-50 dark:hover:bg-white/5",
                  )}
                >
                  <span
                    className={cn(
                      "text-center text-lg font-black",
                      index < 3
                        ? "text-violet-500"
                        : "text-slate-300 dark:text-slate-600",
                    )}
                  >
                    {index + 1}
                  </span>
                  <span
                    className="relative aspect-video overflow-hidden rounded-xl"
                    style={{ background: video.gradient }}
                  >
                    <span className="absolute inset-0 grid place-items-center text-sm font-black text-white/45">
                      {video.initials}
                    </span>
                    <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 text-[7px] font-black text-white">
                      {video.duration}
                    </span>
                  </span>
                  <span className="min-w-0">
                    <span className="line-clamp-2 text-xs font-black leading-5 text-slate-800 group-hover:text-violet-600 dark:text-slate-100">
                      {video.title}
                    </span>
                    <span className="mt-1 block truncate text-[10px] font-semibold text-slate-400">
                      {video.creator} · {video.views}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => showSoon("실시간 인기 차트 전체보기는 곧 열려요!")}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 py-3 text-xs font-black text-slate-500 transition hover:border-violet-300 hover:text-violet-600 dark:border-white/10 dark:text-slate-400"
            >
              차트 전체보기 <ChevronRight className="h-4 w-4" />
            </button>
          </aside>
        </section>

        <section className="mt-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-fuchsia-500">
                <Zap className="h-3.5 w-3.5 fill-current" /> Verse Shorts
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] sm:text-3xl">
                세로로 빠르게 만나는 우주
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setActiveCategory("전체")}
              className="hidden items-center gap-1 text-xs font-black text-slate-400 hover:text-violet-600 sm:flex"
            >
              더보기 <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {videos.slice(1, 6).map((video) => (
              <button
                key={video.id}
                type="button"
                onClick={() => pickVideo(video.id)}
                className="group min-w-0 text-left"
              >
                <div className="transition duration-300 group-hover:-translate-y-1.5 group-hover:drop-shadow-2xl">
                  <VideoArtwork video={video} vertical />
                </div>
                <h3 className="mt-3 line-clamp-2 text-sm font-black leading-5 group-hover:text-violet-600">
                  {video.title}
                </h3>
                <p className="mt-1 text-[11px] font-semibold text-slate-400">
                  조회수 {video.views}회
                </p>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-violet-500">
                <Sparkles className="h-3.5 w-3.5" /> Pick for you
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] sm:text-3xl">
                드가이를 위한 추천 영상
              </h2>
            </div>
            <p className="text-xs font-black text-slate-400">
              {filteredVideos.length}개의 영상
            </p>
          </div>

          {filteredVideos.length ? (
            <motion.div
              layout
              className="grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              <AnimatePresence mode="popLayout">
                {filteredVideos.map((video) => (
                  <motion.button
                    layout
                    key={video.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    type="button"
                    onClick={() => pickVideo(video.id)}
                    className="group min-w-0 text-left"
                  >
                    <div className="relative transition duration-300 group-hover:-translate-y-1.5 group-hover:drop-shadow-2xl">
                      <VideoArtwork video={video} />
                      <span className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-black/25 text-white opacity-0 backdrop-blur-lg transition group-hover:scale-110 group-hover:opacity-100">
                        <Play className="ml-0.5 h-5 w-5 fill-current" />
                      </span>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <CreatorAvatar video={video} compact />
                      <span className="min-w-0">
                        <span className="line-clamp-2 text-sm font-black leading-5 text-slate-800 group-hover:text-violet-600 dark:text-slate-100">
                          {video.title}
                        </span>
                        <span className="mt-1.5 block truncate text-[11px] font-semibold text-slate-400">
                          {video.creator}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                          <Eye className="h-3 w-3" /> {video.views} ·{" "}
                          <Clock3 className="h-3 w-3" /> {video.age}
                        </span>
                      </span>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="rounded-[36px] border border-dashed border-slate-300 bg-white/60 px-6 py-20 text-center dark:border-white/15 dark:bg-white/[0.03]">
              <Clapperboard className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
              <h3 className="mt-5 text-xl font-black">
                이 조건의 영상은 아직 없어요
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                검색어를 바꾸거나 전체 카테고리로 돌아가 보자구요.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setActiveCategory("전체");
                }}
                className="mt-6 rounded-full bg-slate-950 px-6 py-3 text-xs font-black text-white dark:bg-white dark:text-slate-950"
              >
                필터 초기화
              </button>
            </div>
          )}
        </section>

        <section className="mt-20 overflow-hidden rounded-[42px] bg-[linear-gradient(120deg,#111827,#4c1d95_50%,#be185d)] p-7 text-white shadow-2xl sm:p-10 lg:flex lg:items-center lg:justify-between lg:p-12">
          <div className="relative z-10 max-w-2xl">
            <span className="flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.23em]">
              <Mic2 className="h-3.5 w-3.5" /> Creator call
            </span>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.05em] sm:text-4xl">
              네 이야기도 이제 움직일 차례.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/70 sm:text-base">
              짧은 영상부터 긴 제작기까지, Drawing Verse의 다음 장면을
              채워주세요.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setStudioOpen(true)}
            className="relative z-10 mt-7 flex items-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-black text-slate-950 shadow-xl transition hover:scale-105 lg:mt-0"
          >
            <Video className="h-5 w-5" /> 크리에이터 시작하기
          </button>
        </section>
      </div>

      <AnimatePresence>
        {studioOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1200] grid place-items-center bg-slate-950/70 p-4 backdrop-blur-md"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setStudioOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              className="w-full max-w-lg rounded-[34px] border border-white/10 bg-white p-6 text-slate-950 shadow-2xl dark:bg-[#111119] dark:text-white sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20">
                  <Clapperboard className="h-6 w-6" />
                </div>
                <button
                  type="button"
                  onClick={() => setStudioOpen(false)}
                  className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300"
                  aria-label="닫기"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <h2 className="mt-6 text-2xl font-black tracking-tight">
                드티비 스튜디오
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
                영상 피드 디자인은 준비됐어요. 실제 파일 업로드는 다음 단계에서
                Supabase Storage와 연결하면 됩니다.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { icon: Upload, label: "업로드" },
                  { icon: Clapperboard, label: "편집" },
                  { icon: MessageCircle, label: "댓글" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="rounded-2xl bg-slate-50 p-4 text-center dark:bg-white/5"
                  >
                    <Icon className="mx-auto h-5 w-5 text-violet-500" />
                    <span className="mt-2 block text-[11px] font-black">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setStudioOpen(false);
                  showSoon("다음 단계: 영상 업로드 DB 연결!");
                }}
                className="mt-7 w-full rounded-2xl bg-violet-600 py-4 text-sm font-black text-white shadow-lg shadow-violet-500/20 hover:bg-violet-500"
              >
                좋아, 다음에 연결하자
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-6 left-1/2 z-[1300] -translate-x-1/2 rounded-full bg-slate-950 px-5 py-3 text-xs font-black text-white shadow-2xl dark:bg-white dark:text-slate-950"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
