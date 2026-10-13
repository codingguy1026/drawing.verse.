"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  ArrowRight, ArrowUpRight, Compass, FileText, Globe2, LayoutGrid,
  Orbit, Plus, Search, SlidersHorizontal, Sparkles, Users, X,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { UniverseCategory, UniverseItem } from "@/components/Universe/universe.types";

const CosmicGalaxyExplorer = dynamic(
  () => import("@/components/Universe/CosmicGalaxyExplorer"),
  { ssr: false, loading: () => <div className="dvux-map-loading">항성계를 불러오는 중…</div> }
);

type LiveUniverse = UniverseItem & { createdAt: string; icon?: string };
type UniverseRow = {
  id: string | number;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  subscriber_count: number | null;
  post_count: number | null;
  created_at: string | null;
  tags?: string[] | null;
  icon?: string | null;
};

type SortMode = "popular" | "newest" | "active";
type ViewMode = "grid" | "map";

const PALETTES = [
  ["#a78bfa", "#3b397f"], ["#efb1bd", "#844b7a"],
  ["#8acde0", "#285b86"], ["#f1c988", "#8c5779"],
  ["#8fdbb9", "#2a7573"], ["#b4b8fc", "#4c4f9c"],
] as const;

function stableHash(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return hash;
}

function categorySymbol(category: string) {
  if (/스포츠|야구|축구|게임/.test(category)) return "⚾";
  if (/팬아트|아트|그림|일러스트/.test(category)) return "🎨";
  if (/소설|스토리|문학/.test(category)) return "📖";
  if (/캐릭터/.test(category)) return "✨";
  return "✦";
}

function formatCount(value: number) {
  return new Intl.NumberFormat("ko-KR", { notation: value >= 10000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);
}

function StarCanvas() {
  const stars = useMemo(
    () => Array.from({ length: 70 }, (_, i) => ({
      x: (i * 41 + 19) % 100,
      y: (i * 67 + 11) % 100,
      size: i % 9 === 0 ? 2.5 : 1.2,
      opacity: 0.22 + ((i * 13) % 52) / 100,
    })),
    []
  );

  return <div className="dvux-stars" aria-hidden="true">
    {stars.map((star, i) => (
      <i key={i} style={{
        left: String(star.x) + "%", top: String(star.y) + "%",
        width: star.size, height: star.size, opacity: star.opacity
      }} />
    ))}
    <svg className="dvux-currents" viewBox="0 0 960 340" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="dvux-flow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8dbbd9" stopOpacity="0" />
          <stop offset="44%" stopColor="#a29bd5" stopOpacity=".55" />
          <stop offset="100%" stopColor="#f0bfc5" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M-40 210 C150 80 225 260 395 165 S715 85 990 208" fill="none" stroke="url(#dvux-flow)" strokeWidth="37" opacity=".28" />
      <path d="M-40 215 C150 75 240 260 395 167 S715 85 990 208" fill="none" stroke="#b8c5ef" strokeWidth="1.5" opacity=".5" />
      <path d="M-50 295 C200 160 300 305 490 240 S750 160 1030 260" fill="none" stroke="#b6aadf" strokeWidth="13" opacity=".15" />
    </svg>
  </div>;
}

function Planet({ universe }: { universe: LiveUniverse }) {
  const index = stableHash(universe.slug) % PALETTES.length;
  const [main, shade] = PALETTES[index];
  return (
    <div className="dvux-world-art" style={{ "--dvux-planet-main": main, "--dvux-planet-shade": shade } as CSSProperties}>
      <div className="dvux-art-orbit dvux-art-orbit-one" />
      <div className="dvux-art-orbit dvux-art-orbit-two" />
      <div className="dvux-art-planet">{universe.icon?.trim() || categorySymbol(universe.category)}</div>
      <span className="dvux-art-light dvux-art-light-one" />
      <span className="dvux-art-light dvux-art-light-two" />
    </div>
  );
}

function UniverseCard({ universe }: { universe: LiveUniverse }) {
  return (
    <article className="dvux-card">
      <Link href={"/universe/" + encodeURIComponent(universe.slug)} className="dvux-card-link">
        <Planet universe={universe} />
        <div className="dvux-card-content">
          <span className="dvux-chip">{universe.category || "미분류"}</span>
          <div className="dvux-card-title-line">
            <h3>{universe.name}</h3>
            <ArrowUpRight size={18} aria-hidden="true" />
          </div>
          <p className="dvux-card-desc">{universe.description || "아직 소개글이 없어요. 이 우주의 첫 번째 이야기를 만나보세요."}</p>
          <div className="dvux-card-meta">
            <span><Users size={13} aria-hidden="true" /> {formatCount(universe.subscribers)}</span>
            <span><FileText size={13} aria-hidden="true" /> {formatCount(universe.posts)}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default function UniversePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("전체");
  const [sort, setSort] = useState<SortMode>("popular");
  const [view, setView] = useState<ViewMode>("grid");
  const [universes, setUniverses] = useState<LiveUniverse[]>([]);
  const [subscriptions, setSubscriptions] = useState<Set<string>>(new Set());
  const [signedIn, setSignedIn] = useState(false);
  const [subscriptionsAvailable, setSubscriptionsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data, error } = await supabase
          .from("universes")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        const records = (data ?? []) as UniverseRow[];
        if (!cancelled) {
          setUniverses(records.filter(row => Boolean(row.slug)).map(row => ({
            id: String(row.id),
            slug: row.slug,
            name: row.name,
            description: row.description ?? "",
            category: (row.category ?? "미분류") as UniverseCategory,
            subscribers: Number(row.subscriber_count ?? 0),
            posts: Number(row.post_count ?? 0),
            createdAt: row.created_at ?? "",
            updatedAt: row.created_at ?? "",
            tags: Array.isArray(row.tags) ? row.tags : [],
            icon: row.icon ?? "",
          })));
        }
        const { data: auth, error: authError } = await supabase.auth.getUser();
        if (authError || !auth.user || cancelled) return;
        if (!cancelled) setSignedIn(true);
        const { data: subscriptionRows, error: subscriptionError } = await supabase
          .from("universe_subscriptions")
          .select("universe_slug")
          .eq("user_id", auth.user.id);
        if (cancelled) return;
        if (subscriptionError) {
          setSubscriptionsAvailable(false);
        } else {
          setSubscriptions(new Set((subscriptionRows ?? []).map(s => String(s.universe_slug))));
        }
      } catch (error) {
        console.error("Universe explorer could not load universes:", error);
        if (!cancelled) setLoadError("유니버스 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  const categories = useMemo(
    () => ["전체", ...Array.from(new Set(universes.map(u => u.category).filter(Boolean))).sort((a, b) => a.localeCompare(b, "ko")), "구독 중"],
    [universes]
  );

  const visible = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    const list = universes.filter(u => {
      if (category === "구독 중" && !subscriptions.has(u.slug)) return false;
      if (category !== "전체" && category !== "구독 중" && u.category !== category) return false;
      return !term || [u.name, u.description, u.slug, u.category, ...(u.tags ?? [])]
        .join(" ").toLocaleLowerCase().includes(term);
    });

    return list.sort((a, b) => {
      if (sort === "newest") return Date.parse(b.createdAt || "1970-01-01") - Date.parse(a.createdAt || "1970-01-01");
      if (sort === "active") return (b.posts + b.subscribers) - (a.posts + a.subscribers);
      return b.subscribers - a.subscribers;
    });
  }, [universes, category, subscriptions, search, sort]);

  const popular = useMemo(
    () => [...universes].sort((a, b) => b.subscribers - a.subscribers).slice(0, 4),
    [universes]
  );
  const memberCount = useMemo(() => universes.reduce((sum, u) => sum + u.subscribers, 0), [universes]);
  const postCount = useMemo(() => universes.reduce((sum, u) => sum + u.posts, 0), [universes]);

  return (
    <div className="dv-universe-redesign">
      <main className="dvux-content">
        <div className="dvux-topbar">
          <div className="dvux-topbar-heading">
            <span>DRAWING VERSE / COSMIC EXPLORER</span>
            <strong>유니버스 탐험</strong>
          </div>
          <div className="dvux-topbar-actions">
            <label className="dvux-search">
              <Search size={17} aria-hidden="true" />
              <span className="sr-only">유니버스 검색</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="우주 검색..." type="search" />
              {search && <button type="button" onClick={() => setSearch("")} aria-label="검색어 지우기"><X size={14} /></button>}
            </label>
            <Link className="dvux-button dvux-button-primary" href="/universe/create">
              <Plus size={16} aria-hidden="true" /><span>만들기</span>
            </Link>
          </div>
        </div>

        <section className="dvux-hero" aria-labelledby="dvux-heading">
          <StarCanvas />
          <div className="dvux-hero-copy">
            <span className="dvux-eyebrow"><Sparkles size={13} aria-hidden="true" /> COSMIC EXPLORER</span>
            <h1 id="dvux-heading">상상이 태어나면,<br /><em>하나의 우주가 된다.</em></h1>
            <p>창작하고, 발견하고, 연결하세요.<br />당신만의 이야기가 시작되는 곳.</p>
            <div className="dvux-hero-actions">
              <Link className="dvux-button dvux-button-primary" href="/universe/create"><Plus size={16} /> 나의 우주 만들기</Link>
              <button className="dvux-button dvux-button-secondary" type="button" onClick={() => { setView("map"); document.getElementById("dvux-results")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>
                항성계 둘러보기 <ArrowRight size={15} />
              </button>
            </div>
          </div>
          <div className="dvux-celestial" aria-hidden="true">
            <div className="dvux-celestial-orbit dvux-celestial-orbit-outer" />
            <div className="dvux-celestial-orbit dvux-celestial-orbit-inner" />
            <div className="dvux-celestial-core">✦</div>
            <span className="dvux-celestial-moon" />
            <span className="dvux-celestial-moon dvux-celestial-moon-small" />
          </div>
        </section>

        <section className="dvux-stats" aria-label="유니버스 현황">
          <div className="dvux-stat"><Globe2 size={17} /><strong>{loading ? "…" : formatCount(universes.length)}</strong><span>발견된 우주</span></div>
          <div className="dvux-stat"><FileText size={17} /><strong>{loading ? "…" : formatCount(postCount)}</strong><span>모인 이야기</span></div>
          <div className="dvux-stat"><Users size={17} /><strong>{loading ? "…" : formatCount(memberCount)}</strong><span>전체 구독 수</span></div>
        </section>

        <section id="dvux-results" className="dvux-discover" aria-labelledby="dvux-results-heading">
          <div className="dvux-section-head">
            <div>
              <span className="dvux-eyebrow">✦ FIND YOUR UNIVERSE</span>
              <h2 id="dvux-results-heading">우주 탐험하기</h2>
              <p>어떤 세계가 당신을 기다리고 있을까요?</p>
            </div>
            <Link href="/universe/create" className="dvux-text-link">새 유니버스 <Plus size={15} /></Link>
          </div>

          <div className="dvux-toolbar">
            <div className="dvux-filters" role="group" aria-label="유니버스 카테고리">
              {categories.map(name => (
                <button
                  key={name}
                  type="button"
                  className={"dvux-filter" + (name === category ? " is-active" : "")}
                  aria-pressed={name === category}
                  onClick={() => setCategory(name)}
                >{name}</button>
              ))}
            </div>
            <div className="dvux-toolbar-right">
              <span className="dvux-result-count">{loading ? "탐색 중" : visible.length + "개 발견"}</span>
              <div className="dvux-view-switch" role="group" aria-label="탐색 방식">
                <button type="button" aria-pressed={view === "grid"} className={view === "grid" ? "is-active" : ""} onClick={() => setView("grid")} title="카드 보기"><LayoutGrid size={16} /> 카드</button>
                <button type="button" aria-pressed={view === "map"} className={view === "map" ? "is-active" : ""} onClick={() => setView("map")} title="항성계 지도"><Orbit size={16} /> 항성계</button>
              </div>
              <label className="dvux-sort">
                <SlidersHorizontal size={15} aria-hidden="true" />
                <span className="sr-only">정렬 기준</span>
                <select value={sort} onChange={e => setSort(e.target.value as SortMode)}>
                  <option value="popular">인기순</option>
                  <option value="newest">최신순</option>
                  <option value="active">활동순</option>
                </select>
              </label>
            </div>
          </div>

          {loadError ? (
            <div className="dvux-empty" role="alert"><span>☄️</span><h3>신호가 끊어졌어요</h3><p>{loadError}</p><button className="dvux-button dvux-button-secondary" type="button" onClick={() => window.location.reload()}>다시 불러오기</button></div>
          ) : loading ? (
            <div className="dvux-skeleton-grid" aria-label="유니버스 불러오는 중">{[0, 1, 2, 3].map(i => <div key={i} className="dvux-skeleton" />)}</div>
          ) : category === "구독 중" && !signedIn ? (
            <div className="dvux-empty"><span>🔐</span><h3>로그인이 필요해요</h3><p>로그인하면 내가 구독한 우주만 모아볼 수 있어요.</p><Link href="/login" className="dvux-button dvux-button-primary">로그인하기</Link></div>
          ) : category === "구독 중" && !subscriptionsAvailable ? (
            <div className="dvux-empty"><span>☄️</span><h3>구독 정보를 확인할 수 없어요</h3><p>잠시 후 다시 시도하거나 다른 카테고리를 탐험해 보세요.</p></div>
          ) : visible.length === 0 ? (
            <div className="dvux-empty"><span>🪐</span><h3>아직 발견된 우주가 없어요</h3><p>검색어나 카테고리를 바꾸거나, 첫 번째 우주를 만들어 보세요.</p><button type="button" className="dvux-button dvux-button-secondary" onClick={() => { setSearch(""); setCategory("전체"); }}>필터 초기화</button></div>
          ) : view === "map" ? (
            <div className="dvux-galaxy-wrapper"><CosmicGalaxyExplorer items={visible} /></div>
          ) : (
            <div className="dvux-result-layout">
              <div className="dvux-grid">{visible.map(universe => <UniverseCard key={universe.id} universe={universe} />)}</div>
              <aside className="dvux-aside">
                <div className="dvux-aside-card">
                  <span className="dvux-eyebrow">✧ POPULAR VERSES</span>
                  <h3>많이 찾는 우주</h3>
                  {popular.map((universe, i) => (
                    <Link key={universe.id} href={"/universe/" + encodeURIComponent(universe.slug)} className="dvux-popular-row">
                      <span className="dvux-popular-index">{i + 1}</span>
                      <span className="dvux-popular-info"><strong>{universe.name}</strong><small>{formatCount(universe.subscribers)} 구독 · {universe.category}</small></span>
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </Link>
                  ))}
                </div>
                <div className="dvux-aside-card dvux-aside-card-accent">
                  <Compass size={23} aria-hidden="true" />
                  <h3>나만의 별을 발견해요.</h3>
                  <p>마음에 드는 이야기를 만나고, 새로운 세계관을 시작해 보세요.</p>
                  <Link href="/universe/create" className="dvux-text-link">우주 만들기 <ArrowRight size={15} /></Link>
                </div>
              </aside>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
