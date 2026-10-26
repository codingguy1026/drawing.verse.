"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useSearchParams } from "next/navigation";
import VerseLoadingScene from "@/components/Common/VerseLoadingScene";

// The animation is an activity indicator, not a simulated download percentage.
const MIN_SCENE_MS = 850;
const STALE_NAVIGATION_MS = 12000;

export default function GlobalRouteLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname ?? ""}?${searchParams?.toString() ?? ""}`;
  const previousRoute = useRef<string | null>(null);
  const startedAt = useRef(0);
  const active = useRef(false);
  const finishTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const staleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [visible, setVisible] = useState(false);

  const clearTimers = useCallback(() => {
    if (finishTimer.current) clearTimeout(finishTimer.current);
    if (staleTimer.current) clearTimeout(staleTimer.current);
    finishTimer.current = null;
    staleTimer.current = null;
  }, []);

  const stop = useCallback(() => {
    clearTimers();
    active.current = false;
    startedAt.current = 0;
    setVisible(false);
  }, [clearTimers]);

  const finish = useCallback(() => {
    if (!active.current) return;
    if (finishTimer.current) clearTimeout(finishTimer.current);
    if (staleTimer.current) clearTimeout(staleTimer.current);
    staleTimer.current = null;

    const elapsed = Date.now() - startedAt.current;
    finishTimer.current = setTimeout(() => {
      active.current = false;
      startedAt.current = 0;
      finishTimer.current = null;
      setVisible(false);
    }, Math.max(0, MIN_SCENE_MS - elapsed));
  }, []);

  const start = useCallback(() => {
    clearTimers();
    active.current = true;
    startedAt.current = Date.now();
    setVisible(true);

    // If a navigation is cancelled or fails, never trap visitors behind the overlay.
    staleTimer.current = setTimeout(() => {
      active.current = false;
      startedAt.current = 0;
      finishTimer.current = null;
      staleTimer.current = null;
      setVisible(false);
    }, STALE_NAVIGATION_MS);
  }, [clearTimers]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.hasAttribute("download") || (anchor.target && anchor.target !== "_self")) return;

      const rawHref = anchor.getAttribute("href");
      if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) return;

      try {
        const next = new URL(anchor.href, window.location.href);
        const current = new URL(window.location.href);
        if (!["http:", "https:"].includes(next.protocol) || next.origin !== current.origin) return;
        // Pure hash jumps, disabled links, and clicking the current route do not load a new page.
        if (next.pathname === current.pathname && next.search === current.search) return;
        // The dedicated loading route already renders the shared scene itself.
        if (next.pathname === "/loading") return;
        start();
      } catch {
        // Malformed or non-navigational links should behave normally.
      }
    };

    const handlePopState = () => {
      if (window.location.pathname !== "/loading") start();
    };

    // Capture before Next Link handles navigation; don't prevent its SPA routing.
    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);
    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [start]);

  useEffect(() => {
    if (previousRoute.current === null) {
      previousRoute.current = routeKey;
      return;
    }
    if (previousRoute.current === routeKey) return;
    previousRoute.current = routeKey;

    if (pathname === "/loading") {
      stop();
      return;
    }

    // Covers router.push/replace, browser history, and other in-app route changes.
    if (!active.current) start();
    finish();
  }, [routeKey, pathname, start, finish, stop]);

  useEffect(() => {
    if (!visible) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = oldOverflow; };
  }, [visible]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  if (!visible || typeof document === "undefined" || pathname === "/loading") return null;

  return createPortal(
    <VerseLoadingScene
      eyebrow="Connecting worlds"
      title="우주를 연결하는 중"
      subtitle="새로운 세계가 펼쳐지고 있어요."
    />,
    document.body
  );
}
