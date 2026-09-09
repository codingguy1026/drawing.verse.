"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import DguyMascot from "@/components/DguyMascot";
import { normalizeProgress } from "./LoadingOverlay";

export default function GlobalRouteLoader() {
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function shouldLoad(anchor: HTMLAnchorElement): boolean {
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return false;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return false;
      if (href.startsWith("http") && !href.startsWith(window.location.origin)) return false;

      try {
        const next = new URL(anchor.href, window.location.origin);
        const curr = new URL(window.location.href);
        if (next.pathname.startsWith("/loading")) return false;
        if (next.pathname === curr.pathname && next.search === curr.search) return false;
      } catch {
        return false;
      }

      return true;
    }

    function handleClick(event: MouseEvent) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a") as HTMLAnchorElement | null;
      if (!anchor || !shouldLoad(anchor)) return;

      event.preventDefault();
      event.stopPropagation();
      if (pendingHref) return;

      const url = new URL(anchor.href, window.location.origin);
      setProgress(0);
      setPendingHref(url.pathname + url.search + url.hash);
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [pendingHref]);

  useEffect(() => {
    if (!pendingHref) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const interval = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 100) return 100;
        const nextStep = current < 60 ? 8 : current < 88 ? 4 : 2;
        return normalizeProgress(current + nextStep);
      });
    }, 110);

    return () => {
      window.clearInterval(interval);
      document.body.style.overflow = previousOverflow;
    };
  }, [pendingHref]);

  useEffect(() => {
    if (!pendingHref || progress < 100) return;

    const timeout = window.setTimeout(() => {
      window.location.assign(pendingHref);
    }, 260);

    return () => window.clearTimeout(timeout);
  }, [pendingHref, progress]);

  if (!pendingHref || typeof document === "undefined") return null;

  return createPortal(<DguyRouteLoading progress={progress} />, document.body);
}

function DguyRouteLoading({ progress }: { progress: number }) {
  return (
    <div
      className="fixed inset-0 flex h-[100dvh] w-screen items-center justify-center overflow-hidden bg-[#f7f8fc] text-slate-950 dark:bg-[#03050a] dark:text-white"
      style={{ zIndex: 2147483647 }}
      role="status"
      aria-live="polite"
      aria-label="Drawing Verse 로딩 중"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-400/15 blur-[140px] dark:bg-violet-500/15" />
        <div className="absolute left-[28%] top-[30%] h-56 w-56 rounded-full bg-sky-300/10 blur-[110px]" />
        <div className="absolute right-[26%] top-[48%] h-56 w-56 rounded-full bg-fuchsia-300/10 blur-[110px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <motion.span className="absolute -left-8 top-10 text-xl text-violet-400" animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.25, 0.8] }} transition={{ duration: 2, repeat: Infinity }}>✦</motion.span>
        <motion.span className="absolute -right-10 top-20 text-lg text-sky-400" animate={{ opacity: [0.2, 1, 0.2], rotate: [0, 180, 360] }} transition={{ duration: 3.5, repeat: Infinity }}>✧</motion.span>
        <motion.span className="absolute right-0 top-0 text-[9px] text-fuchsia-400" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.6, repeat: Infinity }}>●</motion.span>

        <DguyMascot size={195} />

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-5">
          <p className="text-[10px] font-black uppercase tracking-[0.32em] text-violet-500">Drawing Verse</p>
          <h2 className="mt-3 text-xl font-black tracking-tight">우주를 연결하는 중<LoadingDots /></h2>
          <p className="mt-2 text-xs font-medium text-slate-400">드가이가 Verse의 별들을 모으고 있어요.</p>
        </motion.div>

        <div className="mt-7 h-1 w-44 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-400 to-sky-400"
            animate={{ width: `${Math.max(10, progress)}%` }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          />
        </div>
        <p className="mt-2 text-[10px] font-bold tabular-nums text-slate-400 dark:text-white/30">{progress}%</p>
      </div>
    </div>
  );
}

function LoadingDots() {
  return (
    <span className="ml-0.5 inline-flex w-6">
      <motion.span animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>.</motion.span>
      <motion.span animate={{ opacity: [0, 0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>.</motion.span>
      <motion.span animate={{ opacity: [0, 0, 0, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>.</motion.span>
    </span>
  );
}
