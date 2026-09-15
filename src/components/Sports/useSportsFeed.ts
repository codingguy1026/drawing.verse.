"use client";
import { useEffect, useState } from "react";
import type { Feed } from "@/lib/sports/types";
import { parseMatches } from "@/lib/sports/validate";

export function useSportsFeed(demo: boolean) {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [error, setError] = useState(false);
  const [now, setNow] = useState(0);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let disposed = false, busy = false;
    let controller: AbortController | undefined;
    let timer: ReturnType<typeof setTimeout>;
    setFeed(null); setError(false); setNow(Date.now());
    async function update() {
      if (disposed || busy) return;
      clearTimeout(timer);
      if (document.hidden) return;
      busy = true;
      controller = new AbortController();
      const timeout = setTimeout(() => controller?.abort(), 10000);
      try {
        const result = await fetch(`/api/sports${demo ? "?demo=1" : ""}`, { signal: controller.signal, cache: "no-store" });
        if (!result.ok) throw new Error("Feed unavailable");
        const data = await result.json();
        const matches = parseMatches(data);
        if (!["live", "demo", "unconfigured"].includes(data.mode) || (demo !== (data.mode === "demo"))) throw new Error("Invalid mode");
        if (!disposed) {
          setFeed(previous => ({ mode: data.mode, matches: matches.map(m => {
            const old = previous?.matches.find(p => p.id === m.id);
            return old && Date.parse(old.updatedAt) > Date.parse(m.updatedAt) ? old : m;
          }) }));
          setError(false);
        }
      } catch { if (!disposed) setError(true); }
      finally {
        clearTimeout(timeout); busy = false;
        if (!disposed) timer = setTimeout(update, demo ? 30000 : 10000);
      }
    }
    const tick = setInterval(() => setNow(Date.now()), 1000);
    const resume = () => { if (!document.hidden) void update(); };
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("online", resume);
    void update();
    return () => { disposed = true; clearInterval(tick); clearTimeout(timer); controller?.abort(); document.removeEventListener("visibilitychange", resume); window.removeEventListener("online", resume); };
  }, [demo, retry]);
  return { feed, error, now, retry: () => setRetry(v => v + 1) };
}
