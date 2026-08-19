"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, ArrowUpRight, Flame, Radio, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type PulsePost = {
  id: string | number;
  title: string | null;
  universe_slug: string | null;
  created_at: string | null;
  like_count: number | null;
  comment_count: number | null;
};

type PulseUniverse = {
  slug: string | null;
  name: string | null;
  subscriber_count: number | null;
};

type PulseLevel = "QUIET" | "STABLE" | "ACTIVE" | "HOT" | "OVERLOAD";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getPulseLevel(score: number): PulseLevel {
  if (score >= 91) return "OVERLOAD";
  if (score >= 76) return "HOT";
  if (score >= 51) return "ACTIVE";
  if (score >= 21) return "STABLE";
  return "QUIET";
}

function getRelativeTime(date: string | null, now: number) {
  if (!date) return "방금 전";

  const seconds = Math.max(0, Math.floor((now - new Date(date).getTime()) / 1000));
  if (seconds < 60) return "방금 전";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}분 전`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;

  return `${Math.floor(hours / 24)}일 전`;
}

export default function VersePulse() {
  const [posts, setPosts] = useState<PulsePost[]>([]);
  const [universes, setUniverses] = useState<PulseUniverse[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  const loadPulse = useCallback(async () => {
    try {
      const [postsResult, universesResult] = await Promise.all([
        supabase
          .from("posts")
          .select("id,title,universe_slug,created_at,like_count,comment_count")
          .order("created_at", { ascending: false })
          .limit(60),
        supabase
          .from("universes")
          .select("slug,name,subscriber_count")
          .limit(40),
      ]);

      if (postsResult.data) setPosts(postsResult.data as PulsePost[]);
      if (universesResult.data) setUniverses(universesResult.data as PulseUniverse[]);
    } catch (error) {
      console.error("Failed to load Verse Pulse", error);
    } finally {
      setLoading(false);
      setNow(Date.now());
    }
  }, []);

  useEffect(() => {
    loadPulse();

    const postsChannel = supabase
      .channel("verse-pulse-posts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        () => loadPulse()
      )
      .subscribe();

    const universesChannel = supabase
      .channel("verse-pulse-universes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "universes" },
        () => loadPulse()
      )
      .subscribe();

    const clock = window.setInterval(() => setNow(Date.now()), 30_000);

    return () => {
      window.clearInterval(clock);
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(universesChannel);
    };
  }, [loadPulse]);

  const pulse = useMemo(() => {
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    const hourAgo = now - 60 * 60 * 1000;

    const recentFive = posts.filter(
      (post) => post.created_at && new Date(post.created_at).getTime() >= fiveMinutesAgo
    );
    const recentHour = posts.filter(
      (post) => post.created_at && new Date(post.created_at).getTime() >= hourAgo
    );

    const engagement = recentHour.reduce(
      (total, post) =>
        total + (post.like_count ?? 0) * 0.35 + (post.comment_count ?? 0) * 0.8,
      0
    );

    const score = clamp(
      Math.round(recentFive.length * 14 + recentHour.length * 4 + engagement),
      0,
      100
    );

    return {
      score,
      level: getPulseLevel(score),
      fiveMinuteEvents: recentFive.length,
      hourEvents: recentHour.length,
    };
  }, [now, posts]);

  const universeSignals = useMemo(() => {
    const names = new Map(
      universes.map((universe) => [universe.slug, universe.name || universe.slug || "Universe"])
    );
    const totals = new Map<string, number>();

    posts.forEach((post) => {
      if (!post.universe_slug || !post.created_at) return;

      const ageHours = Math.max(
        0,
        (now - new Date(post.created_at).getTime()) / (60 * 60 * 1000)
      );
      const recency = Math.max(0, 24 - ageHours) / 24;
      const value =
        8 * recency + (post.like_count ?? 0) * 0.4 + (post.comment_count ?? 0) * 0.9;

      totals.set(post.universe_slug, (totals.get(post.universe_slug) ?? 0) + value);
    });

    const ranked = [...totals.entries()]
      .map(([slug, score]) => ({
        slug,
        name: names.get(slug) || slug,
        score,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const max = Math.max(1, ...ranked.map((item) => item.score));

    return ranked.map((item) => ({
      ...item,
      heat: clamp(Math.round((item.score / max) * 100), 8, 100),
    }));
  }, [now, posts, universes]);

  const wave = useMemo(() => {
    const intensity = Math.max(0.18, pulse.score / 100);
    return [0.28, 0.46, 0.88, 0.36, 0.58, 1, 0.42, 0.72, 0.32, 0.9, 0.48, 0.66].map(
      (point) => Math.max(8, Math.round(point * intensity * 54))
    );
  }, [pulse.score]);

  return (
    <div className="bg-slate-50 px-4 pt-5 transition-colors duration-700 dark:bg-[#03050a] md:px-6 lg:px-8">
      <motion.section
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-[32px] border border-violet-200/70 bg-[linear-gradient(120deg,rgba(255,255,255,0.96),rgba(245,243,255,0.88),rgba(239,246,255,0.9))] shadow-[0_22px_55px_rgba(99,102,241,0.12)] backdrop-blur-2xl dark:border-violet-400/15 dark:bg-[linear-gradient(120deg,rgba(10,12,22,0.96),rgba(22,18,44,0.92),rgba(8,19,36,0.94))] dark:shadow-[0_24px_70px_rgba(76,29,149,0.2)]"
      >
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-fuchsia-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-sky-400/20 blur-3xl" />

        <div className="relative grid gap-5 p-5 md:p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-7">
          <div className="flex min-w-0 flex-col justify-between gap-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-violet-600 dark:text-violet-300">
                  <Radio size={14} className="animate-pulse" />
                  Live network
                </div>
                <div className="mt-2 flex items-end gap-3">
                  <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white md:text-3xl">
                    Verse Pulse
                  </h2>
                  <span className="mb-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[10px] font-black tracking-wider text-violet-600 dark:border-violet-300/20 dark:bg-violet-300/10 dark:text-violet-200">
                    {loading ? "CONNECTING" : pulse.level}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  지금 Drawing Verse 전체에서 뛰고 있는 활동 신호예요.
                </p>

                <div className="mt-5 grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/80 bg-white/55 px-3.5 py-3 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.045]">
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
                      Network
                    </div>
                    <p className="mt-1.5 text-sm font-black text-slate-800 dark:text-slate-100">
                      {loading ? "연결 중" : "ONLINE"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/80 bg-white/55 px-3.5 py-3 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.045]">
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                      <Sparkles size={11} className="text-violet-500" />
                      Records
                    </div>
                    <p className="mt-1.5 text-sm font-black tabular-nums text-slate-800 dark:text-slate-100">
                      {posts.length + universes.length}
                      <span className="ml-1 text-[10px] font-bold text-slate-400">signals</span>
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/80 bg-white/55 px-3.5 py-3 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.045]">
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                      <Radio size={11} className="text-sky-500" />
                      Realtime
                    </div>
                    <p className="mt-1.5 text-sm font-black text-slate-800 dark:text-slate-100">
                      {loading ? "WAIT" : "LISTENING"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Pulse index
                </p>
                <div className="mt-1 flex items-baseline justify-end gap-1">
                  <span className="text-5xl font-black tabular-nums tracking-tighter text-slate-950 dark:text-white">
                    {loading ? "--" : pulse.score}
                  </span>
                  <Activity size={18} className="text-fuchsia-500" />
                </div>
              </div>
            </div>

            <div className="flex h-16 items-center gap-1 rounded-2xl border border-white/80 bg-white/65 px-4 shadow-inner dark:border-white/10 dark:bg-white/5">
              {wave.map((height, index) => (
                <motion.span
                  key={index}
                  animate={{
                    height: [Math.max(6, height * 0.55), height, Math.max(6, height * 0.7)],
                    opacity: [0.45, 1, 0.55],
                  }}
                  transition={{
                    duration: 1.15 + (index % 4) * 0.14,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.035,
                  }}
                  className="block min-w-1 flex-1 rounded-full bg-gradient-to-t from-indigo-500 via-violet-500 to-fuchsia-400"
                  style={{ maxWidth: 14 }}
                />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200/70 bg-white/60 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">5 min</p>
                <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                  {pulse.fiveMinuteEvents}
                  <span className="ml-1 text-xs font-medium text-slate-400">events</span>
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-white/60 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">1 hour</p>
                <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                  {pulse.hourEvents}
                  <span className="ml-1 text-xs font-medium text-slate-400">posts</span>
                </p>
              </div>
              <div className="col-span-2 rounded-2xl border border-slate-200/70 bg-white/60 px-4 py-3 dark:border-white/10 dark:bg-white/5 sm:col-span-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Universes</p>
                <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                  {universes.length}
                  <span className="ml-1 text-xs font-medium text-slate-400">signals</span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-3xl border border-white/80 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={15} className="text-violet-500" />
                  <p className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Latest signals
                  </p>
                </div>
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.8)]" />
              </div>

              <div className="space-y-2">
                {loading ? (
                  <p className="py-5 text-center text-xs text-slate-400">신호 수신 중...</p>
                ) : posts.length === 0 ? (
                  <p className="py-5 text-center text-xs text-slate-400">아직 잡힌 신호가 없어요.</p>
                ) : (
                  posts.slice(0, 3).map((post) => {
                    const content = (
                      <div className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white/70 px-3.5 py-3 transition hover:border-violet-200 hover:bg-violet-50/60 dark:border-white/5 dark:bg-white/[0.035] dark:hover:border-violet-300/15 dark:hover:bg-violet-300/[0.06]">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                            {post.title || "새 게시글"}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {post.universe_slug || "Drawing Verse"} · {getRelativeTime(post.created_at, now)}
                          </p>
                        </div>
                        <ArrowUpRight size={15} className="shrink-0 text-slate-300 transition group-hover:text-violet-500" />
                      </div>
                    );

                    return post.universe_slug ? (
                      <Link
                        key={post.id}
                        href={`/universe/${post.universe_slug}/${post.id}`}
                      >
                        {content}
                      </Link>
                    ) : (
                      <div key={post.id}>{content}</div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/80 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="mb-3 flex items-center gap-2">
                <Flame size={15} className="text-orange-500" />
                <p className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Universe signal
                </p>
              </div>

              <div className="space-y-3">
                {universeSignals.length === 0 ? (
                  <p className="py-4 text-center text-xs text-slate-400">
                    활동 데이터가 쌓이면 여기서 뜨는 유니버스를 보여줄게요.
                  </p>
                ) : (
                  universeSignals.map((universe) => (
                    <Link
                      key={universe.slug}
                      href={`/universe/${universe.slug}`}
                      className="block"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-20 truncate text-xs font-bold text-slate-600 dark:text-slate-300">
                          {universe.name}
                        </span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${universe.heat}%` }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500"
                          />
                        </div>
                        <span className="w-7 text-right text-[10px] font-black tabular-nums text-slate-400">
                          {universe.heat}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
