"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type PulsePost = {
  created_at: string | null;
  like_count: number | null;
  comment_count: number | null;
};

const minute = 60_000;
const sampleLimit = 40;
let subscriptionId = 0;

export default function VersePulse() {
  const [posts, setPosts] = useState<PulsePost[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let active = true;
    let request = 0;

    async function loadPulse() {
      const version = ++request;
      try {
        const { data, error } = await supabase.from("posts")
          .select("created_at,like_count,comment_count")
          .order("created_at", { ascending: false })
          .limit(sampleLimit);

        if (!active || version !== request) return;
        if (error) throw error;

        setPosts(data ?? []);
        setNow(Date.now());
        setStatus("ready");
      } catch {
        if (active && version === request) setStatus("error");
      }
    }

    void loadPulse();
    const channel = supabase.channel(`verse-pulse:${++subscriptionId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => void loadPulse())
      .subscribe();
    const clock = window.setInterval(() => setNow(Date.now()), 30_000);

    return () => {
      active = false;
      window.clearInterval(clock);
      void supabase.removeChannel(channel);
    };
  }, []);

  const recent = posts
    .map((post) => ({ ...post, age: now - Date.parse(post.created_at ?? "") }))
    .filter(({ age }) => age >= 0 && age < 60 * minute);
  const signal = recent.reduce((sum, post) => sum + (post.age < 5 * minute ? 18 : 4)
    + (post.like_count ?? 0) * .35 + (post.comment_count ?? 0) * .8, 0);
  const score = Math.max(0, Math.min(100, Math.round(signal)));

  return (
    <section aria-labelledby="verse-pulse-heading" className="min-w-0 rounded-xl border border-[var(--gc-line)] bg-[var(--gc-panel-muted)] p-3.5 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="verse-pulse-heading" className="flex items-center gap-2 text-sm font-bold">
          <Activity size={16} className="text-[var(--gc-accent)]" aria-hidden="true" /> Verse Pulse
        </h3>
        {status === "ready" && <p className="text-xs text-[var(--gc-muted)]">최근 1시간 · 글 {recent.length}개{recent.length === sampleLimit ? " 이상" : ""}</p>}
      </div>
      {status === "ready" ? (
        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <progress
            aria-label="Verse Pulse 활동 점수"
            value={score}
            max={100}
            className="block h-2 w-full appearance-none overflow-hidden rounded-full bg-[var(--gc-accent-soft)] [&::-moz-progress-bar]:bg-[var(--gc-accent)] [&::-webkit-progress-bar]:bg-[var(--gc-accent-soft)] [&::-webkit-progress-value]:bg-[var(--gc-accent)]"
          />
          <span className="text-xs font-bold tabular-nums text-[var(--gc-muted)]" aria-hidden="true">{score}/100</span>
        </div>
      ) : (
        <p role="status" className="mt-2 text-xs text-[var(--gc-muted)]">
          {status === "loading" ? "활동을 불러오는 중…" : "활동 데이터를 불러오지 못했어요."}
        </p>
      )}
    </section>
  );
}
