"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useSearchParams } from "next/navigation";
import VerseLoadingScene, { type VerseLoadingPhase } from "@/components/Common/VerseLoadingScene";

// This is navigation stage progress, not an invented network-download percentage.
const MIN_VISIBLE_MS = 2300;
const READY_VISIBLE_MS = 420;
const SLOW_NAVIGATION_MS = 4500;
const STALE_NAVIGATION_MS = 20000;

export default function GlobalRouteLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname ?? ""}?${searchParams?.toString() ?? ""}`;
  const previousRoute = useRef(routeKey);
  const startedAt = useRef(0);
  const active = useRef(false);
  const committed = useRef(false);
  const navigationId = useRef(0);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const frames = useRef<number[]>([]);
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<VerseLoadingPhase>("connecting");

  const clearScheduled = useCallback(() => {
    timers.current.forEach(clearTimeout);
    frames.current.forEach(cancelAnimationFrame);
    timers.current = [];
    frames.current = [];
  }, []);

  const stop = useCallback(() => {
    clearScheduled();
    navigationId.current += 1;
    active.current = false;
    committed.current = false;
    startedAt.current = 0;
    setVisible(false);
  }, [clearScheduled]);

  const start = useCallback(() => {
    clearScheduled();
    navigationId.current += 1;
    const id = navigationId.current;
    active.current = true;
    committed.current = false;
    startedAt.current = Date.now();
    setPhase("connecting");
    setVisible(true);

    // A slow response changes the wording, not a fabricated percentage.
    timers.current.push(setTimeout(() => {
      if (active.current && !committed.current && id === navigationId.current) {
        setPhase("delayed");
      }
    }, SLOW_NAVIGATION_MS));

    // Failed or cancelled transitions must not block the site forever.
    timers.current.push(setTimeout(() => {
      if (active.current && id === navigationId.current) stop();
    }, STALE_NAVIGATION_MS));
  }, [clearScheduled, stop]);

  const completeRoute = useCallback(() => {
    if (!active.current) return;
    committed.current = true;
    const id = navigationId.current;
    setPhase("rendering");

    // Wait for the route to paint rather than declaring success on a timer.
    const frame1 = requestAnimationFrame(() => {
      const frame2 = requestAnimationFrame(() => {
        if (!active.current || id !== navigationId.current) return;
        setPhase("ready");
        const elapsed = Date.now() - startedAt.current;
        const remaining = Math.max(READY_VISIBLE_MS, MIN_VISIBLE_MS - elapsed);
        timers.current.push(setTimeout(() => {
          if (id === navigationId.current) stop();
        }, remaining));
      });
      frames.current.push(frame2);
    });
    frames.current.push(frame1);
  }, [stop]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.hasAttribute("download") || (anchor.target && anchor.target !== "_self")) return;
      if (anchor.relList.contains("external")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      try {
        const next = new URL(anchor.href, window.location.href);
        const current = new URL(window.location.href);
        if (next.origin !== current.origin || !["http:", "https:"].includes(next.protocol)) return;
        if (next.pathname === current.pathname && next.search === current.search) return;
        // The standalone loader route already shows its own scene.
        if (next.pathname === "/loading") return;
        start();
      } catch {
        // Malformed links follow normal browser behavior.
      }
    }

    function handlePopState() {
      if (window.location.pathname !== "/loading") start();
    }

    // Capture without preventing Next.js's client-side route navigation.
    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);
    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [start]);

  useEffect(() => {
    if (previousRoute.current === routeKey) return;
    previousRoute.current = routeKey;
    if (pathname === "/loading") {
      stop();
      return;
    }

    // Also handles programmatic router.push/replace navigation after it commits.
    if (!active.current) start();
    completeRoute();
  }, [routeKey, pathname, start, completeRoute, stop]);

  useEffect(() => {
    if (!visible) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = oldOverflow; };
  }, [visible]);

  useEffect(() => () => clearScheduled(), [clearScheduled]);

  if (!visible || typeof document === "undefined" || pathname === "/loading") return null;

  return createPortal(
    <VerseLoadingScene
      phase={phase}
      eyebrow="Connecting worlds"
      title="새로운 우주가 태어나는 중"
      subtitle="빛이 모여 당신의 다음 세계가 펼쳐집니다."
    />,
    document.body
  );
}
