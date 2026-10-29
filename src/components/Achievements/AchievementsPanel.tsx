"use client";

import { useEffect, useMemo, useState } from "react";
import { LockKeyhole, Sparkles, Trophy } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type Achievement = {
  code: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  hidden: boolean;
};

type Earned = {
  achievement_code: string;
  earned_at: string;
};

const rarityStyle: Record<string, string> = {
  common: "border-slate-200/80 bg-white/70 dark:border-white/10 dark:bg-white/[0.04]",
  rare: "border-violet-300/60 bg-violet-50/70 dark:border-violet-400/25 dark:bg-violet-500/[0.08]",
  epic: "border-fuchsia-300/60 bg-fuchsia-50/70 dark:border-fuchsia-400/25 dark:bg-fuchsia-500/[0.08]",
  legendary: "border-amber-300/70 bg-amber-50/80 dark:border-amber-300/30 dark:bg-amber-400/[0.08] shadow-[0_0_30px_rgba(251,191,36,.08)]",
};

const rarityLabel: Record<string, string> = {
  common: "일반",
  rare: "희귀",
  epic: "에픽",
  legendary: "전설",
};

export default function AchievementsPanel() {
  const [loading, setLoading] = useState(true);
  const [all, setAll] = useState<Achievement[]>([]);
  const [earned, setEarned] = useState<Earned[]>([]);

  useEffect(() => {
    let ignore = false;

    async function load() {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) {
        if (!ignore) setLoading(false);
        return;
      }

      const [achievementResult, earnedResult] = await Promise.all([
        supabase
          .from("achievements")
          .select("code,name,description,icon,rarity,hidden")
          .order("created_at", { ascending: true }),
        supabase
          .from("user_achievements")
          .select("achievement_code,earned_at")
          .eq("user_id", user.id)
          .order("earned_at", { ascending: false }),
      ]);

      if (ignore) return;
      setAll((achievementResult.data as Achievement[] | null) ?? []);
      setEarned((earnedResult.data as Earned[] | null) ?? []);
      setLoading(false);
    }

    load();

    const channel = supabase
      .channel("my-achievements-panel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "user_achievements" },
        () => load()
      )
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const earnedMap = useMemo(
    () => new Map(earned.map((item) => [item.achievement_code, item.earned_at])),
    [earned]
  );

  const visible = useMemo(
    () => all.filter((item) => !item.hidden || earnedMap.has(item.code)),
    [all, earnedMap]
  );

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-violet-200/70 bg-white/80 p-5 shadow-[0_20px_65px_rgba(128,96,241,.10)] backdrop-blur-2xl dark:border-white/[0.12] dark:bg-[#060811]/80 dark:shadow-[0_24px_70px_rgba(0,0,0,.35)] sm:p-6">
      <div className="pointer-events-none absolute -left-16 -top-20 size-56 rounded-full bg-rose-300/15 blur-3xl dark:bg-rose-500/10" />
      <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-500/15" />
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-rose-400/60 to-violet-400/60" />
      <div className="relative flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-violet-600 dark:text-violet-300">
            <Trophy className="size-3.5" /> Achievements
          </p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950 dark:text-white">도전과제</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Drawing Verse를 탐험하며 남긴 기록이에요.</p>
        </div>
        <div className="rounded-full border border-violet-200/70 bg-violet-50/80 px-3 py-1.5 text-xs font-bold text-violet-700 dark:border-white/10 dark:bg-white/5 dark:text-violet-200">
          {earned.length} / {all.length || 0} 달성
        </div>
      </div>

      {loading ? (
        <div className="relative mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-2xl border border-violet-200/60 bg-violet-100/40 dark:border-white/10 dark:bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((achievement) => {
            const earnedAt = earnedMap.get(achievement.code);
            const unlocked = Boolean(earnedAt);
            return (
              <article
                key={achievement.code}
                className={`relative overflow-hidden rounded-[20px] border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(128,96,241,.10)] ${
                  rarityStyle[achievement.rarity] ?? rarityStyle.common
                } ${unlocked ? "opacity-100" : "opacity-65 grayscale"}`}
              >
                {achievement.rarity === "legendary" && unlocked ? (
                  <div className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-amber-300/15 blur-2xl" />
                ) : null}
                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl border border-violet-200/70 bg-white/70 text-xl dark:border-white/10 dark:bg-white/10">
                    {unlocked ? achievement.icon : <LockKeyhole className="size-4 text-slate-400 dark:text-white/45" />}
                  </div>
                  <span className="rounded-full border border-violet-200/60 bg-white/60 px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-violet-700 dark:border-white/10 dark:bg-black/10 dark:text-white/60">
                    {rarityLabel[achievement.rarity] ?? achievement.rarity}
                  </span>
                </div>
                <h3 className="relative mt-3 text-sm font-black text-slate-900 dark:text-white">
                  {achievement.name}
                </h3>
                <p className="relative mt-1 min-h-10 text-[11px] leading-5 text-slate-600 dark:text-slate-400">
                  {achievement.description}
                </p>
                <p className="relative mt-3 flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  <Sparkles className="size-3" />
                  {unlocked && earnedAt
                    ? new Date(earnedAt).toLocaleDateString("ko-KR") + " 달성"
                    : "아직 잠겨 있어요"}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
