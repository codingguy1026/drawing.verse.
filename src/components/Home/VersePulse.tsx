"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Activity, Radio, Sparkles } from "lucide-react";
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

function findHeroPulseTarget() {
  const labels = Array.from(document.querySelectorAll("p"));
  const weeklyTrendLabel = labels.find(
    (node) => node.textContent?.trim().toLowerCase() === "weekly trend"
  );

  return weeklyTrendLabel?.closest("section")?.parentElement ?? null;
}

export default function VersePulse() {
  const [posts, setPosts] = useState<PulsePost[]>([]);
  const [universes, setUniverses] = useState<PulseUniverse[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const target = findHeroPulseTarget();
    if (target) {
      setPortalTarget(target);
      return;
    }

    const observer = new MutationObserver(() => {
      const nextTarget = findHeroPulseTarget();
      if (nextTarget) {
        setPortalTarget(nextTarget);
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

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

      if (postsResult.error) throw postsResult.error;
      if (universesResult.error) throw universesResult.error;

      setPosts((postsResult.data ?? []) as PulsePost[]);
      setUniverses((universesResult.data ?? []) as PulseUniverse[]);
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

  const wave = useMemo(() => {
    const intensity = Math.max(0.18, pulse.score / 100);
    return [0.28, 0.46, 0.88, 0.36, 0.58, 1, 0.42, 0.72, 0.32, 0.9, 0.48, 0.66].map(
      (point) => Math.max(7, Math.round(point * intensity * 38))
    );
  }, [pulse.score]);

  if (!portalTarget) return null;

  const latestPost = posts[0] ?? null;

  return createPortal(
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden rounded-[32px] border border-violet-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(245,243,255,0.94),rgba(239,246,255,0.9))] p-5 shadow-[0_16px_38px_rgba(99,102,241,0.13)] backdrop-blur-2xl dark:border-violet-400/15 dark:bg-[linear-gradient(135deg,rgba(17,19,31,0.96),rgba(28,22,51,0.94),rgba(14,24,40,0.94))] dark:shadow-[0_18px_44px_rgba(76,29,149,0.18)]"
    >
      <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-sky-300/25 blur-3xl dark:bg-sky-500/10" />
      <div className="pointer-events-none absolute -bottom-20 -left-12 h-40 w-40 rounded-full bg-fuchsia-300/20 blur-3xl dark:bg-fuchsia-500/10" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-violet-600 dark:text-violet-300">
              <Radio size={13} className="animate-pulse" />
              Live network
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <h3 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                Verse Pulse
              </h3>
              <span className="rounded-full border border-violet-200 bg-white/60 px-2.5 py-1 text-[9px] font-black tracking-wider text-violet-600 dark:border-violet-300/15 dark:bg-white/5 dark:text-violet-200">
                {loading ? "CONNECTING" : pulse.level}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Drawing Verse의 실시간 활동 신호
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
              Pulse index
            </p>
            <div className="mt-0.5 flex items-baseline justify-end gap-1">
              <span className="text-4xl font-black tabular-nums tracking-tighter text-slate-950 dark:text-white">
                {loading ? "--" : pulse.score}
              </span>
              <Activity size={15} className="text-fuchsia-500" />
            </div>
          </div>
        </div>

        <div className="mt-4 flex h-12 items-center gap-1 rounded-2xl border border-white/80 bg-white/55 px-3 shadow-inner dark:border-white/10 dark:bg-white/5">
          {wave.map((height, index) => (
            <motion.span
              key={index}
              animate={{
                height: [Math.max(5, height * 0.55), height, Math.max(5, height * 0.72)],
                opacity: [0.45, 1, 0.6],
              }}
              transition={{
                duration: 1.05 + (index % 4) * 0.12,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.03,
              }}
              className="block min-w-1 flex-1 rounded-full bg-gradient-to-t from-indigo-500 via-violet-500 to-fuchsia-400"
              style={{ maxWidth: 12 }}
            />
          ))}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-white/75 bg-white/55 px-3 py-2.5 dark:border-white/10 dark:bg-white/5">
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">5 min</p>
            <p className="mt-0.5 text-lg font-black tabular-nums text-slate-900 dark:text-white">
              {pulse.fiveMinuteEvents}
            </p>
          </div>
          <div className="rounded-2xl border border-white/75 bg-white/55 px-3 py-2.5 dark:border-white/10 dark:bg-white/5">
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">1 hour</p>
            <p className="mt-0.5 text-lg font-black tabular-nums text-slate-900 dark:text-white">
              {pulse.hourEvents}
            </p>
          </div>
          <div className="rounded-2xl border border-white/75 bg-white/55 px-3 py-2.5 dark:border-white/10 dark:bg-white/5">
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Universes</p>
            <p className="mt-0.5 text-lg font-black tabular-nums text-slate-900 dark:text-white">
              {universes.length}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-white/70 bg-white/45 px-3 py-2.5 text-xs dark:border-white/10 dark:bg-white/[0.035]">
          <Sparkles size={13} className="shrink-0 text-violet-500" />
          {loading ? (
            <span className="text-slate-400">신호 수신 중...</span>
          ) : latestPost ? (
            <>
              <span className="min-w-0 flex-1 truncate font-bold text-slate-700 dark:text-slate-200">
                {latestPost.title || "새 게시글"}
              </span>
              <span className="shrink-0 text-[10px] text-slate-400">
                {getRelativeTime(latestPost.created_at, now)}
              </span>
            </>
          ) : (
            <span className="text-slate-400">아직 잡힌 신호가 없어요.</span>
          )}
        </div>
      </div>
    </motion.section>,
    portalTarget
  );
}
