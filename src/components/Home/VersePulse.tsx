"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, ArrowUpRight, Radio } from "lucide-react";
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
          .limit(40),
        supabase.from("universes").select("slug").limit(40),
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
      hourEvents: recentHour.length,
    };
  }, [now, posts]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mt-6 border-t border-slate-200/70 pt-5 dark:border-white/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Radio size={13} className="text-violet-500" />
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-slate-500 dark:text-slate-300">
              Verse Pulse
            </p>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.75)]" />
          </div>
          <p className="mt-1 text-[10px] text-slate-400">
            {pulse.hourEvents} posts / 1h · {universes.length} universes
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-violet-200/70 bg-white/60 px-2.5 py-1 shadow-sm backdrop-blur dark:border-violet-300/15 dark:bg-white/5">
            <span className="text-[8px] font-black tracking-wider text-violet-500">
              {loading ? "CONNECTING" : pulse.level}
            </span>
            <span className="text-xs font-black tabular-nums text-slate-900 dark:text-white">
              {loading ? "--" : pulse.score}
            </span>
            <Activity size={11} className="text-fuchsia-500" />
          </div>
          <Link href="/community" className="text-[10px] font-black text-violet-500 transition hover:text-violet-600">
            더 보기 →
          </Link>
        </div>
      </div>

      <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${loading ? 8 : Math.max(4, pulse.score)}%` }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-400"
        />
      </div>

      <div className="mt-2 divide-y divide-slate-200/60 dark:divide-white/10">
        {loading ? (
          <div className="px-3 py-5 text-center text-xs text-slate-400">신호 수신 중...</div>
        ) : posts.length === 0 ? (
          <div className="px-3 py-5 text-center text-xs text-slate-400">아직 잡힌 Pulse가 없어요.</div>
        ) : (
          posts.slice(0, 3).map((post) => {
            const row = (
              <div className="group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white/60 dark:hover:bg-white/5">
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-slate-700 dark:text-slate-200">
                    {post.title || "새 게시글"}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] text-slate-400">
                    {post.universe_slug || "Drawing Verse"} · {getRelativeTime(post.created_at, now)}
                  </p>
                </div>
                <ArrowUpRight size={13} className="shrink-0 text-slate-300 transition group-hover:text-violet-500" />
              </div>
            );

            return post.universe_slug ? (
              <Link key={post.id} href={`/universe/${post.universe_slug}/${post.id}`}>
                {row}
              </Link>
            ) : (
              <div key={post.id}>{row}</div>
            );
          })
        )}
      </div>
    </motion.section>
  );
}
