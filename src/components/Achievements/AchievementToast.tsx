"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

const rarityStyle: Record<string, { glow: string; border: string; icon: string; text: string; bar: string }> = {
  common: { glow: "bg-slate-300/10", border: "border-slate-400/25", icon: "from-slate-400/25 to-slate-600/10", text: "text-slate-200", bar: "bg-slate-300" },
  rare: { glow: "bg-violet-500/20", border: "border-violet-400/40", icon: "from-violet-400/35 to-indigo-500/10", text: "text-violet-200", bar: "bg-violet-400" },
  epic: { glow: "bg-fuchsia-500/20", border: "border-fuchsia-400/40", icon: "from-fuchsia-400/35 to-purple-500/10", text: "text-fuchsia-200", bar: "bg-fuchsia-400" },
  legendary: { glow: "bg-amber-400/20", border: "border-amber-300/50", icon: "from-amber-300/35 to-orange-500/10", text: "text-amber-200", bar: "bg-amber-300" },
};

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
  const [mounted, setMounted] = useState(false);
  const [queue, setQueue] = useState<ToastItem[]>([]);

  useEffect(() => setMounted(true), []);
  const [current, setCurrent] = useState<ToastItem | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setupRunRef = useRef(0);

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
      const run = ++setupRunRef.current;
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user || cancelled || run !== setupRunRef.current) return;

      const storageKey = `dv_seen_achievements:${user.id}`;
      let seen = new Set<string>();
      try {
        const parsed = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
        if (Array.isArray(parsed)) seen = new Set(parsed.map(String));
      } catch {
        seen = new Set();
      }

      const markSeen = (id: string) => {
        seen.add(id);
        try {
          localStorage.setItem(storageKey, JSON.stringify(Array.from(seen).slice(-500)));
        } catch {}
      };

      const enqueue = async (id: string, code: string, earnedAt: string) => {
        if (seen.has(id)) return;
        const achievement = await fetchAchievement(code);
        if (!achievement || cancelled || run !== setupRunRef.current) return;
        markSeen(id);
        setQueue((prev) => [...prev, { ...achievement, earnedAt }]);
      };

      const { data: earned, error } = await supabase
        .from("user_achievements")
        .select("id,achievement_code,earned_at")
        .eq("user_id", user.id)
        .order("earned_at", { ascending: true });

      if (!error) {
        for (const row of earned ?? []) {
          await enqueue(String(row.id), row.achievement_code, row.earned_at);
        }
      }

      if (cancelled || run !== setupRunRef.current) return;

      if (channel) await supabase.removeChannel(channel);
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
      if (channel) {
        supabase.removeChannel(channel);
        channel = null;
      }
      setup();
    });

    return () => {
      cancelled = true;
      setupRunRef.current += 1;
      authSub.subscription.unsubscribe();
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  if (!mounted) return null;

  const appearance = rarityStyle[current?.rarity ?? "common"] ?? rarityStyle.common;

  return createPortal(
    <>
    {process.env.NODE_ENV === "development" && (
      <button
        type="button"
        onClick={() => setQueue((prev) => [...prev, {
          code: "dev-test", name: "테스트 도전과제",
          description: "오른쪽 아래 알림 위치를 확인하세요.",
          icon: "🏆", rarity: "rare", earnedAt: new Date().toISOString(),
        }])}
        style={{ position: "fixed", bottom: 16, right: 16, left: "auto", zIndex: 10001, backgroundColor: "#6d28d9", color: "#fff" }}
        className="rounded-full border border-violet-400 bg-violet-700 px-3 py-2 text-xs font-bold text-white shadow-lg hover:bg-violet-600"
      >
        🏆 알림 테스트
      </button>
    )}
    <div style={{ position: "fixed", bottom: 76, right: 16, left: "auto", width: "min(352px, calc(100vw - 32px))", maxWidth: "calc(100vw - 32px)", zIndex: 10000, pointerEvents: "none" }}
      className="pointer-events-none">
      <AnimatePresence mode="wait">
        {current ? (
          <motion.div
            key={`${current.code}-${current.earnedAt}`}
            initial={{ opacity: 0, x: 32, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 18, y: 20, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            style={{ width: "100%", boxSizing: "border-box", maxWidth: "100%" }}
            className={`pointer-events-auto relative box-border w-full min-w-0 overflow-hidden rounded-[22px] border bg-[#0b1022]/95 p-3.5 text-white shadow-[0_18px_55px_rgba(10,8,35,.45)] backdrop-blur-2xl sm:p-4 ${appearance.border}`}
          >
            <div className={`pointer-events-none absolute -right-8 -top-10 size-36 rounded-full blur-3xl ${appearance.glow}`} />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-transparent" />
            <div className="relative flex min-w-0 items-start gap-3">
              <div className={`flex size-11 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br text-2xl shadow-[0_0_22px_rgba(139,92,246,.16)] ${appearance.icon}`}>
                {current.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Trophy className={`size-3.5 ${appearance.text}`} />
                  <p className={`text-[10px] font-black uppercase tracking-[0.18em] ${appearance.text}`}>
                    도전과제 달성 · {rarityLabel[current.rarity] ?? current.rarity.toUpperCase()}
                  </p>
                </div>
                <h3 className="mt-1 text-[17px] font-black tracking-tight">{current.name}</h3>
                <p className="mt-1 text-xs leading-5 text-white/60">{current.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setCurrent(null)}
                className="shrink-0 rounded-full p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white"
                aria-label="도전과제 알림 닫기"
              >
                <X className="size-4" />
              </button>
            </div>
            <motion.div
              key={`progress-${current.code}-${current.earnedAt}`}
              className={`absolute bottom-0 left-0 h-[3px] w-full origin-left ${appearance.bar}`}
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 6.5, ease: "linear" }}
              aria-hidden="true"
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
    </>,
    document.body
  );
}
