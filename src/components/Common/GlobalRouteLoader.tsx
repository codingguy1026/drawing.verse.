"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useSearchParams } from "next/navigation";
import VerseLoadingScene, { type VerseLoadingPhase } from "@/components/Common/VerseLoadingScene";

// Avoid flashing a loader for already-prefetched, near-instant navigation.
// The progress indicator is indeterminate; it never guesses network percentages.
const SHOW_AFTER_MS = 180;
const READY_HOLD_MS = 180;
const SLOW_NAVIGATION_MS = 4500;
const STALE_NAVIGATION_MS = 20000;

export default function GlobalRouteLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname ?? ""}?${searchParams?.toString() ?? ""}`;
  const previousRoute = useRef(routeKey);
  const active = useRef(false);
  const committed = useRef(false);
  const navigationId = useRef(0);
  const shownAt = useRef(0);
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
    shownAt.current = 0;
    setVisible(false);
  }, [clearScheduled]);

  const start = useCallback(() => {
    clearScheduled();
    navigationId.current += 1;
    const id = navigationId.current;
    active.current = true;
    committed.current = false;
    shownAt.current = 0;
    setPhase("connecting");
    setVisible(false);

    timers.current.push(setTimeout(() => {
      if (!active.current || committed.current || id !== navigationId.current) return;
      shownAt.current = Date.now();
      setVisible(true);
    }, SHOW_AFTER_MS));

    timers.current.push(setTimeout(() => {
      if (active.current && !committed.current && id === navigationId.current) {
        setPhase("delayed");
      }
    }, SLOW_NAVIGATION_MS));

    // Cancelled/failed navigation must never cover the page forever.
    timers.current.push(setTimeout(() => {
      if (active.current && id === navigationId.current) stop();
    }, STALE_NAVIGATION_MS));
  }, [clearScheduled, stop]);

  const completeRoute = useCallback(() => {
    if (!active.current) return;
    committed.current = true;
    const id = navigationId.current;
    setPhase("rendering");

    // Wait for the new route to paint; don't delay a completed navigation
    // just to make the loading animation play for a fixed minimum duration.
    const frame1 = requestAnimationFrame(() => {
      const frame2 = requestAnimationFrame(() => {
        if (!active.current || id !== navigationId.current) return;
        if (!shownAt.current) {
          stop();
          return;
        }
        setPhase("ready");
        const hold = Math.max(0, READY_HOLD_MS - (Date.now() - shownAt.current));
        timers.current.push(setTimeout(() => {
          if (id === navigationId.current) stop();
        }, hold));
      });
      frames.current.push(frame2);
    });
    frames.current.push(frame1);
  }, [stop]);

  useEffect(() => {
    function isInternalNavigation(href: string) {
      try {
        const next = new URL(href, window.location.href);
        const current = new URL(window.location.href);
        return next.origin === current.origin &&
          ["http:", "https:"].includes(next.protocol) &&
          (next.pathname !== current.pathname || next.search !== current.search) &&
          next.pathname !== "/loading";
      } catch {
        return false;
      }
    }

    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.hasAttribute("download") || (anchor.target && anchor.target !== "_self")) return;
      if (anchor.relList.contains("external")) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (isInternalNavigation(anchor.href)) start();
    }

    function handleSubmit(event: SubmitEvent) {
      if (event.defaultPrevented || !(event.target instanceof HTMLFormElement)) return;
      const form = event.target;
      if (form.target && form.target !== "_self") return;
      if (form.method.toLowerCase() !== "get") return;
      // Search and filter forms can navigate without an anchor click.
      if (new URL(form.action, location.href).origin === location.origin) start();
    }

    function handlePopState() {
      if (window.location.pathname !== "/loading") start();
    }

    document.addEventListener("click", handleClick, true);
    document.addEventListener("submit", handleSubmit, true);
    window.addEventListener("popstate", handlePopState);
    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("submit", handleSubmit, true);
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
    // Programmatic navigation that only becomes known after commit does
    // not trigger a misleading loading animation on an already-ready page.
    // Next.js loading.tsx handles the route's suspense fallback instead.
    if (active.current) completeRoute();
  }, [routeKey, pathname, completeRoute, stop]);

  useEffect(() => () => clearScheduled(), [clearScheduled]);

  // The app frame stays mounted between routes. Portal into the *page panel*
  // instead of document.body, so the sidebar/navigation remain visible.
  const pagePanel = typeof document !== "undefined"
    ? document.getElementById("dv-main-content")
    : null;
  if (!visible || !pagePanel || pathname === "/loading") return null;

  return createPortal(
    <VerseLoadingScene
      variant="overlay"
      phase={phase}
      eyebrow="VERSE NAVIGATOR"
      title="다음 세계로 이동하는 중"
      subtitle="새로운 페이지를 그려내고 있어요."
    />,
    pagePanel,
  );
}
