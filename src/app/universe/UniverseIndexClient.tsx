"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Sparkles,
  Star,
  Orbit,
  ArrowUpDown,
  Check,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type UniverseRow = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  subscriber_count: number | null;
  post_count: number | null;
};

type SortKey = "popular" | "posts" | "name";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export default function UniverseIndexClient() {
  const [loading, setLoading] = useState(true);
  const [universes, setUniverses] = useState<UniverseRow[]>([]);
  const [subs, setSubs] = useState<Set<string>>(new Set());
  const [hasSubTable, setHasSubTable] = useState(true);

  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("popular");
  const [cat, setCat] = useState<string>("전체");
  const [onlySubs, setOnlySubs] = useState(false);

  // UI tokens (우주 톤)
  const bgMain = "bg-transparent";
  const card = "bg-slate-900/70";
  const card2 = "bg-slate-950/40";
  const border = "border-white/10";
  const text = "text-white";
  const subText = "text-white/50";
  const inputBg = "bg-[#050214]";

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);

      // 1) universes
      const { data: u, error: uErr } = await supabase
        .from("universes")
        .select("id,slug,name,description,category,subscriber_count,post_count")
        .order("subscriber_count", { ascending: false });

      if (!ignore) {
        setUniverses((uErr || !u ? [] : (u as UniverseRow[])) ?? []);
      }

      // 2) subscriptions (있으면)
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;

      if (user) {
        const { data: s, error: sErr } = await supabase
          .from("universe_subscriptions")
          .select("universe_slug")
          .eq("user_id", user.id);

        // 테이블이 없거나 RLS로 막히면: 구독 기능만 비활성(조용히)
        if (sErr) {
          if (!ignore) setHasSubTable(false);
        } else {
          const set = new Set<string>((s ?? []).map((x: any) => x.universe_slug));
          if (!ignore) setSubs(set);
        }
      }

      if (!ignore) setLoading(false);
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    universes.forEach((u) => {
      if (u.category) set.add(u.category);
    });
    return ["전체", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [universes]);

  const subscribedList = useMemo(() => {
    if (subs.size === 0) return [];
    return universes.filter((u) => subs.has(u.slug));
  }, [universes, subs]);

  const list = useMemo(() => {
    let arr = [...universes];

    // filter: category
    if (cat !== "전체") arr = arr.filter((u) => (u.category ?? "기타") === cat);

    // filter: only subs
    if (onlySubs) arr = arr.filter((u) => subs.has(u.slug));

    // search
    const keyword = q.trim().toLowerCase();
    if (keyword) {
      arr = arr.filter((u) => {
        const n = (u.name ?? "").toLowerCase();
        const d = (u.description ?? "").toLowerCase();
        const s = (u.slug ?? "").toLowerCase();
        return n.includes(keyword) || d.includes(keyword) || s.includes(keyword);
      });
    }

    // sort
    arr.sort((a, b) => {
      if (sort === "popular")
        return (b.subscriber_count ?? 0) - (a.subscriber_count ?? 0);
      if (sort === "posts") return (b.post_count ?? 0) - (a.post_count ?? 0);
      // name
      return (a.name ?? "").localeCompare(b.name ?? "");
    });

    return arr;
  }, [universes, cat, onlySubs, q, sort, subs]);

  async function toggleSubscribe(slug: string) {
    if (!hasSubTable) return;
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) {
      window.location.href = "/auth/login";
      return;
    }

    const isSub = subs.has(slug);

    if (isSub) {
      const { error } = await supabase
        .from("universe_subscriptions")
        .delete()
        .eq("user_id", user.id)
        .eq("universe_slug", slug);

      if (!error) {
        setSubs((prev) => {
          const next = new Set(prev);
          next.delete(slug);
          return next;
        });
      }
    } else {
      const { error } = await supabase
        .from("universe_subscriptions")
        .insert({ user_id: user.id, universe_slug: slug });

      if (!error) {
        setSubs((prev) => new Set(prev).add(slug));
      }
    }
  }

  return (
    <div className={cn("w-full", bgMain, text)}>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 pt-28 pb-16 space-y-8">
        {/* HERO */}
        <section
          className={cn(
            "relative overflow-hidden rounded-3xl border",
            border,
            card,
            "px-6 py-7 backdrop-blur-2xl shadow-[0_0_40px_rgba(15,23,42,0.8)]"
          )}
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -left-10 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />
            <div className="absolute -bottom-24 -right-16 h-56 w-56 rounded-full bg-pink-500/15 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/10 blur-3xl" />
          </div>

          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/40">
                U N I V E R S E · I N D E X
              </p>
              <h1 className="mt-2 text-3xl md:text-4xl font-black tracking-tight">
                유니버스 탐색 🚀
              </h1>
              <p className="mt-2 text-sm text-white/60">
                원하는 세계를 골라서 들어가자. 구독하면 더 빨리 찾아올 수 있어 😎
              </p>
            </div>

            <div className="flex items-center gap-2 md:justify-end">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-2 text-xs text-white/70">
                <Orbit className="h-4 w-4 text-violet-300" />
                {loading ? (
                  <span>불러오는 중…</span>
                ) : (
                  <span>
                    현재{" "}
                    <span className="text-violet-200 font-semibold">
                      {universes.length}
                    </span>{" "}
                    개 탐색 가능
                  </span>
                )}
              </div>

              <button
                onClick={() => setOnlySubs((v) => !v)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-semibold transition",
                  onlySubs
                    ? "border-violet-400/30 bg-violet-500/15 text-violet-100"
                    : "border-white/10 bg-slate-950/20 text-white/70 hover:bg-white/5"
                )}
                title="내 구독만 보기"
              >
                <Star className={cn("h-4 w-4", onlySubs ? "text-violet-200" : "text-white/50")} />
                내 구독
                {onlySubs && <Check className="h-4 w-4 text-violet-200" />}
              </button>
            </div>
          </div>
        </section>

        {/* TOOLBAR */}
        <section
          className={cn(
            "rounded-3xl border backdrop-blur-2xl p-4",
            border,
            card2
          )}
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="유니버스 검색 (이름/설명/slug)…"
                className={cn(
                  "w-full h-10 rounded-2xl border outline-none px-10 text-sm",
                  border,
                  inputBg,
                  "text-white placeholder:text-white/30 focus:border-white/25"
                )}
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {/* Category */}
              <select
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                className={cn(
                  "h-10 rounded-2xl border px-3 text-sm",
                  border,
                  "bg-slate-950/30 text-white/80"
                )}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Sort */}
              <button
                onClick={() =>
                  setSort((s) =>
                    s === "popular" ? "posts" : s === "posts" ? "name" : "popular"
                  )
                }
                className={cn(
                  "h-10 rounded-2xl border px-3 text-sm inline-flex items-center gap-2 transition",
                  border,
                  "bg-slate-950/30 text-white/80 hover:bg-white/5"
                )}
                title="정렬 변경"
              >
                <ArrowUpDown className="h-4 w-4 text-white/50" />
                {sort === "popular" ? "인기순" : sort === "posts" ? "게시글순" : "이름순"}
              </button>
            </div>
          </div>

          {!hasSubTable && (
            <div className="mt-3 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-200/80">
              ⚠️ <b>구독 테이블(universe_subscriptions)</b>이 없거나 권한이 없어서 구독 버튼이 비활성일 수 있어요.
              (UI는 유지됨)
            </div>
          )}
        </section>

        {/* MY SUBS SECTION */}
        {subs.size > 0 && !onlySubs && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white/80">
                ⭐ 내가 구독한 유니버스
              </h2>
              <span className="text-xs text-white/40">
                {subscribedList.length}개
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {subscribedList.slice(0, 6).map((u) => (
                <UniverseCard
                  key={u.id}
                  u={u}
                  subscribed={subs.has(u.slug)}
                  onToggle={() => toggleSubscribe(u.slug)}
                  hasSubTable={hasSubTable}
                />
              ))}
            </div>
          </section>
        )}

        {/* GRID */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white/80">
              ✨ 유니버스 목록
            </h2>
            <span className="text-xs text-white/40">
              {loading ? "불러오는 중…" : `${list.length}개`}
            </span>
          </div>

          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-[140px] rounded-3xl border",
                    border,
                    "bg-white/[0.03] animate-pulse"
                  )}
                />
              ))}
            </div>
          ) : list.length === 0 ? (
            <div className={cn("rounded-3xl border p-10 text-center", border, card2)}>
              <p className="text-sm text-white/60">결과가 없어요 🫠</p>
              <p className="mt-2 text-xs text-white/40">
                검색어/카테고리/내 구독 토글을 바꿔봐!
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((u) => (
                <UniverseCard
                  key={u.id}
                  u={u}
                  subscribed={subs.has(u.slug)}
                  onToggle={() => toggleSubscribe(u.slug)}
                  hasSubTable={hasSubTable}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function UniverseCard({
  u,
  subscribed,
  onToggle,
  hasSubTable,
}: {
  u: UniverseRow;
  subscribed: boolean;
  onToggle: () => void;
  hasSubTable: boolean;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-2xl shadow-[0_0_30px_rgba(15,23,42,0.6)]">
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition">
        <div className="absolute -top-24 -left-14 h-40 w-40 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="absolute -bottom-24 -right-14 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/80 font-black">
              {(u.name?.[0] ?? "U").toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-black text-white truncate">
                {u.name}
              </p>
              <p className="text-[11px] text-white/40 truncate">
                /{u.slug}
              </p>
            </div>
          </div>

          <p className="mt-3 text-xs text-white/55 line-clamp-2">
            {u.description ?? "설명이 아직 없어요."}
          </p>

          <div className="mt-4 flex items-center gap-2 text-[11px] text-white/45">
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
              {u.category ?? "기타"}
            </span>
            <span className="opacity-40">•</span>
            <span>구독 {u.subscriber_count ?? 0}</span>
            <span className="opacity-40">•</span>
            <span>게시글 {u.post_count ?? 0}</span>
          </div>
        </div>

        <button
          onClick={onToggle}
          disabled={!hasSubTable}
          className={cn(
            "shrink-0 h-10 px-3 rounded-2xl border text-xs font-bold transition inline-flex items-center gap-2",
            hasSubTable ? "cursor-pointer" : "cursor-not-allowed opacity-50",
            subscribed
              ? "border-violet-400/30 bg-violet-500/15 text-violet-100 hover:bg-violet-500/20"
              : "border-white/10 bg-slate-950/20 text-white/70 hover:bg-white/5"
          )}
          title={subscribed ? "구독 취소" : "구독하기"}
        >
          <Star className={cn("h-4 w-4", subscribed ? "text-violet-200 fill-current" : "text-white/40")} />
          {subscribed ? "구독중" : "구독"}
        </button>
      </div>

      <Link
        href={`/universe/${encodeURIComponent(u.slug)}`}
        className="absolute inset-0"
        aria-label={`${u.name} 들어가기`}
      />
    </div>
  );
}
