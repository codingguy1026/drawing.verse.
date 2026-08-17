"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Compass, Flame, Sparkles, Star } from "lucide-react";
import UniverseGrid from "@/components/Universe/UniverseGrid";
import UniverseToolbar from "@/components/Universe/UniverseToolbar";
import CreateUniverseModal from "@/components/Common/CreateUniverseModal";
import UniverseHero from "@/components/Universe/UniverseHero";
import UniverseCard from "@/components/Universe/UniverseCard";
import { supabase } from "@/lib/supabase/client";
import type {
  UniverseCategory,
  UniverseItem,
} from "@/components/Universe/universe.types";
import { quickTags } from "@/components/Universe/universe.mock";

const CosmicGalaxyExplorer = dynamic(
  () => import("@/components/Universe/CosmicGalaxyExplorer"),
  { ssr: false }
);

type DiscoveryTab = "recommended" | "popular" | "new" | "following";

type UniverseDbRow = {
  id: string | number;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  subscriber_count: number | null;
  post_count: number | null;
  tags: string[] | null;
  created_at: string | null;
};

const discoveryTabs: Array<{
  key: DiscoveryTab;
  label: string;
  icon: typeof Compass;
}> = [
  { key: "recommended", label: "추천", icon: Compass },
  { key: "popular", label: "인기", icon: Flame },
  { key: "new", label: "새로 생긴", icon: Sparkles },
  { key: "following", label: "구독 중", icon: Star },
];

function timeAgo(value: string | null) {
  if (!value) return "최근";
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "최근";

  const diff = Math.max(0, Date.now() - timestamp);
  const hour = 60 * 60 * 1000;
  const day = 24 * hour;

  if (diff < hour) return `${Math.max(1, Math.floor(diff / 60000))}분 전`;
  if (diff < day) return `${Math.floor(diff / hour)}시간 전`;
  if (diff < day * 7) return `${Math.floor(diff / day)}일 전`;
  return new Intl.DateTimeFormat("ko-KR", { month: "short", day: "numeric" }).format(
    new Date(value)
  );
}

function isRecent(value: string | null) {
  if (!value) return false;
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return false;
  return Date.now() - timestamp < 14 * 24 * 60 * 60 * 1000;
}

function scoreUniverse(item: UniverseItem) {
  return item.subscribers * 2 + item.posts * 3;
}

export default function UniversePage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("전체");
  const [activeDiscovery, setActiveDiscovery] =
    useState<DiscoveryTab>("recommended");
  const [sort, setSort] = useState("popular");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [universes, setUniverses] = useState<UniverseItem[]>([]);
  const [subscriptions, setSubscriptions] = useState<Set<string>>(new Set());
  const [hasSubscriptionTable, setHasSubscriptionTable] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  async function fetchUniverses() {
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("universes")
        .select(
          "id,slug,name,description,category,subscriber_count,post_count,tags,created_at"
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mapped: UniverseItem[] = ((data ?? []) as UniverseDbRow[]).map((item) => ({
        id: String(item.id),
        slug: item.slug,
        name: item.name,
        description: item.description ?? "아직 소개가 없는 유니버스예요.",
        category: (item.category || "창작 세계관") as UniverseCategory,
        subscribers: item.subscriber_count ?? 0,
        posts: item.post_count ?? 0,
        updatedAt: timeAgo(item.created_at),
        isNew: isRecent(item.created_at),
        tags: Array.isArray(item.tags) ? item.tags : [],
      }));

      const trending = new Set(
        [...mapped]
          .sort((a, b) => scoreUniverse(b) - scoreUniverse(a))
          .slice(0, 4)
          .map((item) => item.slug)
      );

      setUniverses(
        mapped.map((item) => ({ ...item, isTrending: trending.has(item.slug) }))
      );
    } catch (error) {
      console.error("Error fetching universes:", error);
      setUniverses([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadSubscriptions() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSubscriptions(new Set());
      return;
    }

    const { data, error } = await supabase
      .from("universe_subscriptions")
      .select("universe_slug")
      .eq("user_id", user.id);

    if (error) {
      setHasSubscriptionTable(false);
      setSubscriptions(new Set());
      return;
    }

    setSubscriptions(
      new Set((data ?? []).map((row: { universe_slug: string }) => row.universe_slug))
    );
  }

  useEffect(() => {
    fetchUniverses();
    loadSubscriptions();
  }, []);

  const categories = useMemo(() => {
    const values = new Set<string>();
    universes.forEach((item) => {
      if (item.category) values.add(item.category);
    });
    return ["전체", ...Array.from(values).sort((a, b) => a.localeCompare(b, "ko"))];
  }, [universes]);

  const trendingUniverses = useMemo(
    () => [...universes].sort((a, b) => scoreUniverse(b) - scoreUniverse(a)).slice(0, 3),
    [universes]
  );

  const filteredUniverses = useMemo(() => {
    let result = [...universes];

    if (activeCategory !== "전체") {
      result = result.filter((item) => item.category === activeCategory);
    }

    const keyword = search.trim().toLowerCase();
    if (keyword) {
      result = result.filter((item) =>
        [item.name, item.description, item.category, ...(item.tags ?? [])]
          .join(" ")
          .toLowerCase()
          .includes(keyword)
      );
    }

    if (activeDiscovery === "following") {
      result = result.filter((item) => subscriptions.has(item.slug));
    } else if (activeDiscovery === "new") {
      result = result.filter((item) => item.isNew);
    }

    if (activeDiscovery === "popular") {
      result.sort((a, b) => b.subscribers - a.subscribers);
      return result;
    }

    if (activeDiscovery === "new") {
      result.sort((a, b) => b.posts - a.posts);
      return result;
    }

    switch (sort) {
      case "latest":
        result.sort((a, b) => Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)) || b.posts - a.posts);
        break;
      case "active":
        result.sort((a, b) => scoreUniverse(b) - scoreUniverse(a));
        break;
      default:
        result.sort((a, b) => b.subscribers - a.subscribers);
        break;
    }

    return result;
  }, [activeCategory, activeDiscovery, search, sort, subscriptions, universes]);

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-950 dark:bg-[#070711] dark:text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-24 h-80 w-80 rounded-full bg-violet-400/8 blur-[120px] dark:bg-violet-600/10" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-sky-400/8 blur-[120px] dark:bg-sky-600/10" />
      </div>

      <main className="relative mx-auto w-full max-w-7xl space-y-7 px-4 py-8 sm:px-6 lg:px-8">
        <UniverseHero
          search={search}
          onSearchChange={setSearch}
          quickTags={quickTags}
          onTagClick={setSearch}
          universeCount={universes.length}
          onCreate={() => setIsCreateOpen(true)}
        />

        <nav className="overflow-x-auto">
          <div className="flex min-w-max gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-white/10 dark:bg-[#0d0d19]">
            {discoveryTabs.map(({ key, label, icon: Icon }) => {
              const active = activeDiscovery === key;
              const disabled = key === "following" && !hasSubscriptionTable;

              return (
                <button
                  key={key}
                  type="button"
                  disabled={disabled}
                  onClick={() => setActiveDiscovery(key)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-35 ${
                    active
                      ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                      : "text-slate-600 hover:bg-slate-100 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {key === "following" && subscriptions.size > 0 && (
                    <span className="rounded-full bg-violet-500/15 px-1.5 py-0.5 text-[10px] text-violet-600 dark:text-violet-200">
                      {subscriptions.size}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        <UniverseToolbar
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          sort={sort}
          onSortChange={setSort}
          resultCount={filteredUniverses.length}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-64 animate-pulse rounded-[1.75rem] border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.04]"
              />
            ))}
          </div>
        ) : viewMode === "map" ? (
          <CosmicGalaxyExplorer items={filteredUniverses} />
        ) : (
          <div className="space-y-8">
            {activeDiscovery === "recommended" &&
              activeCategory === "전체" &&
              !search.trim() &&
              trendingUniverses.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-600 dark:text-amber-300">
                        지금 활발한 곳
                      </p>
                      <h2 className="mt-1 text-xl font-black">뜨고 있는 유니버스</h2>
                    </div>
                    <span className="text-xs text-slate-400 dark:text-white/30">멤버와 게시글 활동 기준</span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {trendingUniverses.map((item, index) => (
                      <UniverseCard
                        key={item.id}
                        item={item}
                        index={index}
                        joined={subscriptions.has(item.slug)}
                      />
                    ))}
                  </div>
                </section>
              )}

            <section className="space-y-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300">
                    Discover
                  </p>
                  <h2 className="mt-1 text-xl font-black">
                    {activeDiscovery === "recommended"
                      ? "유니버스 둘러보기"
                      : activeDiscovery === "popular"
                        ? "인기 유니버스"
                        : activeDiscovery === "new"
                          ? "새로 생긴 유니버스"
                          : "내가 구독한 유니버스"}
                  </h2>
                </div>
                <span className="text-sm font-semibold text-slate-500 dark:text-white/40">
                  {filteredUniverses.length}개
                </span>
              </div>

              <UniverseGrid items={filteredUniverses} joinedSlugs={subscriptions} />
            </section>
          </div>
        )}
      </main>

      <CreateUniverseModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchUniverses}
      />
    </div>
  );
}
