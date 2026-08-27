"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trophy, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type Achievement = {
  code: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
};

type ToastItem = Achievement & { earnedAt: string };

const rarityLabel: Record<string, string> = {
  common: "COMMON",
  rare: "RARE",
  epic: "EPIC",
  legendary: "LEGENDARY",
};

async function fetchAchievement(code: string): Promise<Achievement | null> {
  const { data, error } = await supabase
    .from("achievements")
    .select("code,name,description,icon,rarity")
    .eq("code", code)
    .maybeSingle();

  if (error || !data) return null;
  return data as Achievement;
}

export default function AchievementToast() {
  const [queue, setQueue] = useState<ToastItem[]>([]);
  const [current, setCurrent] = useState<ToastItem | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (current || queue.length === 0) return;
    const [next, ...rest] = queue;
    setQueue(rest);
    setCurrent(next);
  }, [queue, current]);

  useEffect(() => {
    if (!current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCurrent(null), 6500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current]);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    async function setup() {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user || cancelled) return;

      const storageKey = `dv_seen_achievements:${user.id}`;
      let seen = new Set<string>();
      try {
        seen = new Set(JSON.parse(localStorage.getItem(storageKey) ?? "[]"));
      } catch {
        seen = new Set();
      }

      const markSeen = (id: string) => {
        seen.add(id);
        try {
          localStorage.setItem(storageKey, JSON.stringify(Array.from(seen).slice(-100)));
        } catch {}
      };

      const enqueue = async (id: string, code: string, earnedAt: string) => {
        if (seen.has(id)) return;
        const achievement = await fetchAchievement(code);
        if (!achievement || cancelled) return;
        markSeen(id);
        setQueue((prev) => [...prev, { ...achievement, earnedAt }]);
      };

      // 가입 직후 이메일 인증/로그인으로 페이지가 바뀌어도 최근 도전과제를 놓치지 않게 복구.
      const recentSince = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      const { data: recent } = await supabase
        .from("user_achievements")
        .select("id,achievement_code,earned_at")
        .eq("user_id", user.id)
        .gte("earned_at", recentSince)
        .order("earned_at", { ascending: true });

      for (const row of recent ?? []) {
        await enqueue(String(row.id), row.achievement_code, row.earned_at);
      }

      channel = supabase
        .channel(`achievement-toast-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "user_achievements",
            filter: `user_id=eq.${user.id}`,
          },
          async (payload) => {
            const row = payload.new as {
              id: number | string;
              achievement_code: string;
              earned_at: string;
            };
            await enqueue(String(row.id), row.achievement_code, row.earned_at);
          }
        )
        .subscribe();
    }

    setup();

    const { data: authSub } = supabase.auth.onAuthStateChange(() => {
      if (channel) supabase.removeChannel(channel);
      setup();
    });

    return () => {
      cancelled = true;
      authSub.subscription.unsubscribe();
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-24 z-[120] flex justify-center px-4 sm:justify-end sm:px-6">
      <AnimatePresence mode="wait">
        {current ? (
          <motion.div
            key={`${current.code}-${current.earnedAt}`}
            initial={{ opacity: 0, y: -18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 360, damping: 26 }}
            className="pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-[1.6rem] border border-violet-300/30 bg-slate-950/95 p-4 text-white shadow-[0_24px_80px_rgba(76,29,149,.35)] backdrop-blur-2xl"
          >
            <div className="pointer-events-none absolute -right-8 -top-10 size-32 rounded-full bg-violet-500/25 blur-3xl" />
            <div className="relative flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl shadow-inner">
                {current.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Trophy className="size-3.5 text-amber-300" />
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-violet-200">
                    도전과제 달성 · {rarityLabel[current.rarity] ?? current.rarity.toUpperCase()}
                  </p>
                </div>
                <h3 className="mt-1 text-base font-black tracking-tight">{current.name}</h3>
                <p className="mt-1 text-xs leading-5 text-white/60">{current.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setCurrent(null)}
                className="rounded-full p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white"
                aria-label="도전과제 알림 닫기"
              >
                <X className="size-4" />
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
