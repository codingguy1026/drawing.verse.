"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Image as ImageIcon,
  Heart,
  MessageCircle,
  Search,
  Filter,
  ArrowRight,
  LayoutGrid,
  Zap,
  Upload,
  AlertCircle,
  SlidersHorizontal,
  Eye,
  Clock3,
  Star,
  Grid3X3,
  Rows3,
  X,
} from "lucide-react";
import { m } from "framer-motion";
import { supabase } from "@/lib/supabase/client";

type GalleryItem = {
  id: string;
  title: string | null;
  author: string | null;
  thumbnail_url: string | null;
  created_at: string;
  category?: string | null;
  view_count?: number | null;
  like_count?: number | null;
  comment_count?: number | null;
};

type SortMode = "latest" | "popular" | "likes";
type ViewMode = "grid" | "compact";

const categories = ["전체", "일러스트", "웹툰", "캐릭터", "스케치", "배경", "팬아트"];

const sortOptions: Array<{
  value: SortMode;
  label: string;
  icon: React.ElementType;
}> = [
    { value: "latest", label: "최신순", icon: Clock3 },
    { value: "popular", label: "조회순", icon: Eye },
    { value: "likes", label: "좋아요순", icon: Heart },
  ];

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function formatDate(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "날짜 없음";
  }

  return parsed.toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  });
}

function getInitial(name: string | null | undefined) {
  const trimmed = name?.trim();

  if (!trimmed) {
    return "익";
  }

  return trimmed[0]?.toUpperCase() ?? "익";
}

function getSafeNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function GalleryCard({
  item,
  viewMode,
}: {
  item: GalleryItem;
  viewMode: ViewMode;
}) {
  const title = item.title?.trim() || "Untitled Space";
  const author = item.author?.trim() || "익명";
  const likes = getSafeNumber(item.like_count);
  const comments = getSafeNumber(item.comment_count);
  const views = getSafeNumber(item.view_count);

  return (
    <article
      className={cn(
        "group relative flex overflow-hidden border bg-white shadow-sm transition-all duration-500",
        "hover:-translate-y-2 hover:shadow-[0_24px_70px_rgba(49,46,129,0.14)]",
        "dark:border-white/10 dark:bg-[#0b0e14]/70 dark:hover:shadow-[0_24px_70px_rgba(0,0,0,0.45)]",
        viewMode === "compact"
          ? "flex-row rounded-[28px]"
          : "flex-col rounded-[34px] border-white"
      )}
    >
      <Link
        href={`/gallery/${item.id}`}
        className={cn(
          "relative block shrink-0 overflow-hidden",
          viewMode === "compact" ? "h-36 w-32 sm:h-44 sm:w-44" : "aspect-[4/5] w-full"
        )}
        aria-label={`${title} 작품 상세 보기`}
      >
        {item.thumbnail_url ? (
          <Image
            src={item.thumbnail_url}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500/10 via-indigo-500/10 to-sky-500/10">
            <ImageIcon className="h-10 w-10 text-slate-300 dark:text-white/30" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1 text-[10px] font-black text-slate-700 shadow-sm backdrop-blur-md dark:bg-black/35 dark:text-white">
          {item.category || "아트워크"}
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex translate-y-3 items-center justify-between opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-[10px] font-bold text-white backdrop-blur-md">
              <Heart className="h-3 w-3" />
              {likes}
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-[10px] font-bold text-white backdrop-blur-md">
              <MessageCircle className="h-3 w-3" />
              {comments}
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-[10px] font-bold text-white backdrop-blur-md">
            <Eye className="h-3 w-3" />
            {views}
          </div>
        </div>
      </Link>

      <div className={cn("flex flex-1 flex-col", viewMode === "compact" ? "p-5" : "p-6")}>
        <Link href={`/gallery/${item.id}`} className="group/title">
          <h3 className="line-clamp-1 text-lg font-black tracking-tight text-slate-950 transition-colors group-hover/title:text-indigo-600 dark:text-white dark:group-hover/title:text-indigo-300">
            {title}
          </h3>
        </Link>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Drawing Verse의 작은 별조각 같은 작품이에요. 클릭해서 더 자세히 감상해 보세요.
        </p>

        <div className="mt-auto flex items-center justify-between pt-5">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-[11px] font-black text-white shadow-lg shadow-indigo-500/20">
              {getInitial(author)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-black text-slate-700 dark:text-slate-200">
                {author}
              </p>
              <p className="text-[10px] font-bold text-slate-400">
                {formatDate(item.created_at)}
              </p>
            </div>
          </div>

          <Link
            href={`/gallery/${item.id}`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all hover:bg-indigo-600 hover:text-white dark:bg-white/5 dark:text-slate-300 dark:hover:bg-indigo-500"
            aria-label={`${title} 상세 페이지로 이동`}
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function GalleryPage() {
  const [items, setItems] = React.useState<GalleryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState("전체");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortMode, setSortMode] = React.useState<SortMode>("latest");
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid");

  React.useEffect(() => {
    let ignore = false;

    async function loadGallery() {
      setLoading(true);
      setErrorMessage("");

      try {
        const { data, error } = await supabase
          .from("gallery")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        if (!ignore) {
          setItems((data ?? []) as GalleryItem[]);
        }
      } catch (err) {
        console.error("Gallery load error:", err);

        if (!ignore) {
          setErrorMessage("갤러리를 불러오지 못했어요. Supabase 테이블이나 RLS 설정을 확인해 주세요.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadGallery();

    return () => {
      ignore = true;
    };
  }, []);

  const filteredItems = React.useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return items
      .filter((item) => {
        const categoryMatched =
          activeCategory === "전체" || item.category === activeCategory;

        const searchableText = [
          item.title,
          item.author,
          item.category,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const searchMatched =
          normalizedSearch.length === 0 || searchableText.includes(normalizedSearch);

        return categoryMatched && searchMatched;
      })
      .sort((a, b) => {
        if (sortMode === "popular") {
          return getSafeNumber(b.view_count) - getSafeNumber(a.view_count);
        }

        if (sortMode === "likes") {
          return getSafeNumber(b.like_count) - getSafeNumber(a.like_count);
        }

        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [items, activeCategory, searchQuery, sortMode]);

  const hasActiveFilter =
    activeCategory !== "전체" || searchQuery.trim().length > 0 || sortMode !== "latest";

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-slate-950 transition-colors duration-700 dark:bg-[#03050a] dark:text-white">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-100 transition-opacity duration-1000">
        <div className="absolute left-[-10%] top-[8%] h-[460px] w-[460px] rounded-full bg-violet-300/20 blur-[130px] dark:bg-violet-600/15" />
        <div className="absolute right-[-8%] top-[34%] h-[520px] w-[520px] rounded-full bg-sky-300/20 blur-[140px] dark:bg-indigo-600/15" />
        <div className="absolute bottom-[-20%] left-[25%] h-[560px] w-[560px] rounded-full bg-indigo-200/25 blur-[150px] dark:bg-sky-600/10" />
      </div>

      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_1px_1px,rgba(99,102,241,0.12)_1px,transparent_0)] bg-[length:34px_34px] opacity-40 dark:opacity-20" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-14 flex flex-col items-center text-center">
          <div className="mb-6 flex items-center gap-2 rounded-full border border-violet-500/10 bg-violet-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-violet-600 shadow-sm dark:border-white/10 dark:text-violet-300">
            <Sparkles className="h-3 w-3 animate-pulse" />
            Celestial Art Hall
          </div>

          <h1 className="max-w-4xl text-5xl font-black leading-tight tracking-tighter sm:text-6xl lg:text-7xl">
            상상이 모여
            <br />
            <span className="bg-gradient-to-r from-violet-600 via-indigo-500 to-sky-400 bg-clip-text text-transparent dark:from-violet-300 dark:via-indigo-200 dark:to-sky-200">
              빛나는 갤러리
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-base leading-relaxed text-slate-500 dark:text-slate-400 sm:text-lg">
            Drawing Verse의 창작자들이 새겨놓은 우주의 파편들이에요.
            감성 가득한 아트워크 속에서 드가이만의 영감을 찾아보자구요.
          </p>

          <div className="mt-10 grid w-full max-w-3xl gap-3 sm:grid-cols-[1fr_auto]">
            <div className="flex items-center gap-3 rounded-[28px] border border-slate-200 bg-white/70 p-2 shadow-sm backdrop-blur-xl transition-all focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-500/10 dark:border-white/10 dark:bg-white/5">
              <Search className="ml-3 h-5 w-5 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                type="text"
                placeholder="작품명, 작가, 카테고리를 검색해 보세요"
                className="w-full bg-transparent p-2 text-sm font-bold text-slate-800 outline-none placeholder:text-slate-400 dark:text-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mr-1 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                  aria-label="검색어 지우기"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <Link
              href="/gallery/upload"
              className="flex items-center justify-center gap-2 rounded-[28px] bg-slate-950 px-6 py-4 text-sm font-black text-white shadow-xl shadow-slate-900/10 transition-all hover:-translate-y-0.5 hover:bg-indigo-600 dark:bg-white dark:text-slate-950 dark:hover:bg-indigo-200"
            >
              <Upload className="h-4 w-4" />
              작품 업로드
            </Link>
          </div>
        </header>

        <section className="mb-10 rounded-[36px] border border-slate-200/70 bg-white/65 p-4 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] sm:p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "rounded-full px-5 py-2.5 text-xs font-black tracking-wider transition-all active:scale-95",
                    activeCategory === cat
                      ? "bg-slate-950 text-white shadow-xl shadow-slate-900/10 dark:bg-white dark:text-slate-950"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-white/5">
                {sortOptions.map((option) => {
                  const Icon = option.icon;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSortMode(option.value)}
                      className={cn(
                        "flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black transition",
                        sortMode === option.value
                          ? "bg-indigo-600 text-white"
                          : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {option.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-white/5">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black transition",
                    viewMode === "grid"
                      ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                      : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
                  )}
                >
                  <Grid3X3 className="h-3.5 w-3.5" />
                  그리드
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("compact")}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black transition",
                    viewMode === "compact"
                      ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                      : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
                  )}
                >
                  <Rows3 className="h-3.5 w-3.5" />
                  목록
                </button>
              </div>
            </div>
          </div>

          {hasActiveFilter && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4 dark:border-white/10">
              <span className="flex items-center gap-2 text-xs font-black text-slate-400">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                적용된 필터
              </span>

              {activeCategory !== "전체" && (
                <button
                  type="button"
                  onClick={() => setActiveCategory("전체")}
                  className="rounded-full bg-violet-500/10 px-3 py-1.5 text-[11px] font-black text-violet-600 dark:text-violet-300"
                >
                  {activeCategory} ×
                </button>
              )}

              {searchQuery.trim() && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="rounded-full bg-sky-500/10 px-3 py-1.5 text-[11px] font-black text-sky-600 dark:text-sky-300"
                >
                  “{searchQuery}” ×
                </button>
              )}

              {sortMode !== "latest" && (
                <button
                  type="button"
                  onClick={() => setSortMode("latest")}
                  className="rounded-full bg-indigo-500/10 px-3 py-1.5 text-[11px] font-black text-indigo-600 dark:text-indigo-300"
                >
                  {sortMode === "popular" ? "조회순" : "좋아요순"} ×
                </button>
              )}
            </div>
          )}
        </section>

        <section className="mb-24">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-300">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                  Live Gallery
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-tight">
                  최근 등록된 작품
                </h2>
              </div>
            </div>

            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
              {filteredItems.length} / {items.length} works
            </p>
          </div>

          {errorMessage && (
            <div className="mb-8 flex items-start gap-3 rounded-[28px] border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-black">앗, 갤러리 연결이 삐끗했어요.</p>
                <p className="mt-1 text-sm leading-relaxed opacity-80">{errorMessage}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div
              className={cn(
                "grid gap-6",
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1 lg:grid-cols-2"
              )}
            >
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-80 animate-pulse rounded-[34px] bg-slate-100 dark:bg-white/5"
                />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[44px] border border-dashed border-slate-200 bg-white/60 px-6 py-24 text-center shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03]">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[26px] bg-slate-100 text-slate-300 dark:bg-white/5 dark:text-white/30">
                <ImageIcon className="h-8 w-8" />
              </div>

              <h3 className="text-2xl font-black text-slate-950 dark:text-white">
                조건에 맞는 작품이 없어요
              </h3>

              <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                검색어나 카테고리를 살짝 바꿔보면 숨어 있던 작품이 튀어나올지도 몰라요.
              </p>

              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("전체");
                    setSortMode("latest");
                  }}
                  className="rounded-full bg-slate-950 px-7 py-3 text-sm font-black text-white transition hover:bg-indigo-600 dark:bg-white dark:text-slate-950"
                >
                  필터 초기화
                </button>

                <Link
                  href="/gallery/upload"
                  className="rounded-full border border-slate-200 bg-white px-7 py-3 text-sm font-black text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                >
                  첫 작품 올리기
                </Link>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                "grid gap-8",
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1 lg:grid-cols-2"
              )}
            >
              {filteredItems.map((item) => (
                <GalleryCard key={item.id} item={item} viewMode={viewMode} />
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[48px] border border-white bg-slate-50/70 p-8 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] md:p-12 lg:p-16">
          <div className="mb-12 flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-lg shadow-indigo-500/20">
              <Star className="h-5 w-5" />
            </div>

            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              이달의 창작자
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              우주를 그리는 가장 뜨거운 시선들이에요. 지금은 샘플 영역이고,
              나중에 Supabase 프로필 테이블이랑 연결하면 진짜 맛있어져요.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: "NebulaArt", tags: ["스케치", "배경"], followers: "2.4k" },
              { name: "CosmicDraw", tags: ["일러스트", "캐릭터"], followers: "1.8k" },
              { name: "StarGazer", tags: ["웹툰", "시"], followers: "3.2k" },
            ].map((artist) => (
              <article
                key={artist.name}
                className="group relative flex flex-col items-center overflow-hidden rounded-[40px] border border-white bg-white p-8 text-center shadow-sm transition-all hover:-translate-y-2 hover:shadow-xl dark:border-white/10 dark:bg-[#0b0e14]/80"
              >
                <div className="absolute inset-x-0 top-0 h-1.5 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-sky-400 opacity-0 transition-opacity group-hover:opacity-100" />

                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-br from-violet-500 to-indigo-500 text-2xl font-black text-white shadow-lg shadow-indigo-500/25">
                  {artist.name[0]}
                </div>

                <h3 className="text-xl font-black dark:text-white">{artist.name}</h3>

                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {artist.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-500 dark:bg-white/5 dark:text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="mt-6 text-xs font-black text-slate-400">
                  팔로워 {artist.followers}
                </p>

                <Link
                  href={`/profile/${artist.name}`}
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 py-3 text-xs font-black text-white transition-all group-hover:bg-indigo-600 dark:bg-white dark:text-slate-950 dark:group-hover:bg-indigo-300"
                >
                  프로필 방문
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}