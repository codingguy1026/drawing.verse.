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
  user_id?: string | null;
  thumbnail_url: string | null;
  created_at: string;
  category?: string | null;
  view_count?: number | null;
  like_count?: number | null;
  comment_count?: number | null;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
  nickname: string | null;
  avatar_url: string | null;
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
    return "?";
  }

  return trimmed[0]?.toUpperCase() ?? "?";
}

function getSafeNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function GalleryCard({
  item,
  profile,
  viewMode,
}: {
  item: GalleryItem;
  profile?: ProfileRow;
  viewMode: ViewMode;
}) {
  const title = item.title?.trim() || "Untitled Space";
  const author =
    profile?.display_name?.trim() ||
    profile?.nickname?.trim() ||
    item.author?.trim() ||
    "알 수 없는 사용자";
  const likes = getSafeNumber(item.like_count);
  const comments = getSafeNumber(item.comment_count);
  const views = getSafeNumber(item.view_count);

  return (
    <article
      className={cn(
        "dv-gallery-card group relative flex overflow-hidden border bg-white shadow-sm transition-all duration-500",
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
          "dv-gallery-card-image relative block shrink-0 overflow-hidden",
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

      <div className={cn("dv-gallery-card-info flex flex-1 flex-col", viewMode === "compact" ? "p-5" : "p-6")}>
        <Link href={`/gallery/${item.id}`} className="group/title">
          <h3 className="line-clamp-1 text-lg font-black tracking-tight text-slate-950 transition-colors group-hover/title:text-indigo-600 dark:text-white dark:group-hover/title:text-indigo-300">
            {title}
          </h3>
        </Link>

        <p className="mt-2 text-xs font-medium text-slate-400 dark:text-slate-500">
          {item.category || "아트워크"} · 조회 {views}
        </p>

        <div className="mt-auto flex items-center justify-between pt-5">
          <div className="flex min-w-0 items-center gap-2">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="size-8 shrink-0 rounded-full object-cover" />
            ) : (
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-black text-slate-600 dark:bg-white/10 dark:text-white/70">
                {getInitial(author)}
              </div>
            )}
            <div className="min-w-0">
              {item.user_id ? (
                <Link href={`/users/${item.user_id}`} className="block truncate text-xs font-black text-slate-700 hover:underline dark:text-slate-200">
                  {author}
                </Link>
              ) : (
                <p className="truncate text-xs font-black text-slate-700 dark:text-slate-200">{author}</p>
              )}
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
  const [profiles, setProfiles] = React.useState<Record<string, ProfileRow>>({});
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
          const nextItems = (data ?? []) as GalleryItem[];
          setItems(nextItems);

          const userIds = [...new Set(nextItems.map((item) => item.user_id).filter((id): id is string => Boolean(id)))];

          if (userIds.length > 0) {
            const { data: profileRows } = await supabase
              .from("profiles")
              .select("id,display_name,nickname,avatar_url")
              .in("id", userIds);

            if (!ignore) {
              setProfiles(Object.fromEntries(
                ((profileRows as ProfileRow[] | null) ?? []).map((profile) => [profile.id, profile])
              ));
            }
          } else {
            setProfiles({});
          }
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

  const creators = React.useMemo(() => {
    const map = new Map<string, { profile: ProfileRow; artworkCount: number; latestAt: number }>();

    items.forEach((item) => {
      if (!item.user_id) return;
      const profile = profiles[item.user_id];
      if (!profile) return;

      const createdAt = new Date(item.created_at).getTime();
      const current = map.get(item.user_id);

      if (current) {
        current.artworkCount += 1;
        current.latestAt = Math.max(current.latestAt, Number.isFinite(createdAt) ? createdAt : 0);
      } else {
        map.set(item.user_id, {
          profile,
          artworkCount: 1,
          latestAt: Number.isFinite(createdAt) ? createdAt : 0,
        });
      }
    });

    return [...map.values()]
      .sort((a, b) => b.latestAt - a.latestAt)
      .slice(0, 3);
  }, [items, profiles]);

  const latestExhibit = items.find((item) => Boolean(item.thumbnail_url));
  const creatorCount = new Set(items.map((item) => item.user_id).filter(Boolean)).size;

  return (
    <main className="dv-gallery-page relative min-h-screen overflow-hidden bg-slate-50 text-slate-950 transition-colors duration-700 dark:bg-[#03050a] dark:text-white">
      <div className="dv-gallery-container relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="dv-gallery-hero">
          <div className="dv-gallery-intro">
            <div className="dv-gallery-eyebrow">
              <span className="dv-gallery-accent-line" aria-hidden="true" />
              DRAWING VERSE / GALLERY
              <span className="dv-gallery-edition">EXHIBITION 01</span>
            </div>
            <h1>
              서로의 상상이 모이는
              <span>작은 전시관.</span>
            </h1>
            <p className="dv-gallery-description">
              그림 한 장에도 이야기가 있죠. 일러스트부터 스케치와 팬아트까지,
              드버스의 창작자들이 남긴 작품을 발견하고 감상해 보세요.
            </p>
            <div className="dv-gallery-hero-footer">
              <div className="dv-gallery-metrics" aria-label="갤러리 현황">
                <div><strong>{items.length}</strong><span>전시 작품</span></div>
                <div><strong>{creatorCount}</strong><span>참여 창작자</span></div>
              </div>
              <Link href="/gallery/upload" className="dv-gallery-upload-button">
                <Upload className="h-4 w-4" aria-hidden="true" />
                내 작품 전시하기
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
            <div className="dv-gallery-search" role="search">
              <Search className="h-4 w-4" aria-hidden="true" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                type="search"
                aria-label="갤러리 작품 검색"
                placeholder="작품 제목, 창작자, 카테고리 검색"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="검색어 지우기"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="dv-gallery-featured" aria-label="최근 등록된 작품 미리보기">
            {latestExhibit ? (
              <Link href={`/gallery/${latestExhibit.id}`} className="dv-gallery-featured-link">
                <div className="dv-gallery-featured-image">
                  <Image
                    src={latestExhibit.thumbnail_url!}
                    alt={latestExhibit.title?.trim() || "최근 등록된 작품"}
                    fill
                    sizes="(max-width: 900px) 100vw, 480px"
                    className="object-cover"
                  />
                </div>
                <div className="dv-gallery-featured-caption">
                  <span>JUST ARRIVED / 최근 등록</span>
                  <strong>{latestExhibit.title?.trim() || "제목 없는 작품"}</strong>
                  <small>{latestExhibit.category || "아트워크"} · {formatDate(latestExhibit.created_at)}</small>
                </div>
              </Link>
            ) : (
              <div className="dv-gallery-featured-empty">
                <span>DRAWING VERSE / OPEN EXHIBITION</span>
                <div className="dv-gallery-featured-mark" aria-hidden="true">
                  <ImageIcon className="h-10 w-10" />
                  <span className="dv-gallery-featured-orbit" />
                </div>
                <strong>첫 작품이 전시될 공간</strong>
                <p>하나의 작품으로 이 전시관이 시작돼요.</p>
              </div>
            )}
          </div>
        </header>

        <section className="dv-gallery-filterbar mb-10 rounded-[36px] border border-slate-200/70 bg-white/65 p-4 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] sm:p-5" aria-label="갤러리 작품 필터">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  aria-pressed={activeCategory === cat}
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
                      aria-pressed={sortMode === option.value}
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
                  aria-pressed={viewMode === "grid"}
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
                  aria-pressed={viewMode === "compact"}
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

        <section className="dv-gallery-collection mb-24">
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
                  작품 둘러보기
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
                "dv-gallery-work-grid grid gap-8",
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1 lg:grid-cols-2"
              )}
            >
              {filteredItems.map((item) => (
                <GalleryCard key={item.id} item={item} profile={item.user_id ? profiles[item.user_id] : undefined} viewMode={viewMode} />
              ))}
            </div>
          )}
        </section>

        <section className="dv-gallery-creators border-t border-slate-200 py-12 dark:border-white/10">
          <div className="mb-7">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Creators</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight">최근 작품을 올린 창작자</h2>
            <p className="mt-2 text-sm text-slate-500">실제 작품을 올린 창작자들의 공간을 만나보세요.</p>
          </div>

          {creators.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-8 text-center text-sm text-slate-500 dark:border-white/15">
              아직 작품을 등록한 창작자가 없어요. 첫 작품이 올라오면 여기에 실제 프로필이 나타납니다.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {creators.map(({ profile, artworkCount }) => {
                const creatorName = profile.display_name?.trim() || profile.nickname?.trim() || "사용자";
                return (
                  <Link
                    key={profile.id}
                    href={`/users/${profile.id}`}
                    className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.03]"
                  >
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="size-12 rounded-full object-cover" />
                    ) : (
                      <div className="grid size-12 place-items-center rounded-full bg-slate-100 font-black text-slate-600 dark:bg-white/10 dark:text-white/70">
                        {getInitial(creatorName)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black">{creatorName}</p>
                      <p className="mt-1 text-xs text-slate-500">갤러리 작품 {artworkCount}개</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
