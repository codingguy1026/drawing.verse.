"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useSearchParams } from "next/navigation";
import VerseLoadingScene from "@/components/Common/VerseLoadingScene";

const MIN_VISIBLE_MS = 950;
const NAVIGATION_TIMEOUT_MS = 12000;

function getInternalRoute(href: string): string | null {
  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return null;
    if (url.pathname === "/loading") return null;
    return url.pathname + url.search;
  } catch {
    return null;
  }
}

export default function GlobalRouteLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const route = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
  const [visible, setVisible] = useState(false);

  const committedRoute = useRef(route);
  const targetRoute = useRef<string | null>(null);
  const startedAt = useRef(0);
  const finishTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (finishTimer.current !== null) window.clearTimeout(finishTimer.current);
    if (safetyTimer.current !== null) window.clearTimeout(safetyTimer.current);
    finishTimer.current = null;
    safetyTimer.current = null;
  }, []);

  const beginLoading = useCallback(
    (nextRoute: string | null) => {
      if (!nextRoute || nextRoute === committedRoute.current) return;
      if (nextRoute === targetRoute.current) return;

      clearTimers();
      targetRoute.current = nextRoute;
      startedAt.current = Date.now();
      setVisible(true);

      // Failed or cancelled transitions must never leave a blocking overlay.
      safetyTimer.current = window.setTimeout(() => {
        targetRoute.current = null;
        setVisible(false);
        safetyTimer.current = null;
      }, NAVIGATION_TIMEOUT_MS);
    },
    [clearTimers]
  );

  // Observe real route commits. Keep the birth animation visible briefly even
  // for cached, nearly instantaneous navigations.
  useEffect(() => {
    const previous = committedRoute.current;
    if (previous === route) return;
    committedRoute.current = route;

    if (pathname === "/loading") {
      clearTimers();
      targetRoute.current = null;
      setVisible(false);
      return;
    }

    // Ignore query-only state synchronisation (e.g. a tab's replaceState),
    // unless a genuine navigation was already detected.
    if (!targetRoute.current && previous.split("?")[0] === pathname) return;

    if (!targetRoute.current) {
      startedAt.current = Date.now();
      setVisible(true);
    }

    clearTimers();
    const remaining = Math.max(0, MIN_VISIBLE_MS - (Date.now() - startedAt.current));
    finishTimer.current = window.setTimeout(() => {
      targetRoute.current = null;
      setVisible(false);
      finishTimer.current = null;
    }, remaining);
  }, [route, pathname, clearTimers]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const element = event.target;
      if (!(element instanceof Element)) return;
      const anchor = element.closest("a");
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download") || anchor.relList?.contains("external")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

      // Do not preventDefault: preserve Next.js Link, client-side routing,
      // modifiers, onClick handlers and normal browser navigation.
      beginLoading(getInternalRoute(anchor.href));
    }

    function handlePopState() {
      beginLoading(getInternalRoute(window.location.href));
    }

    // Programmatic next/navigation router.push/replace transitions eventually
    // update browser history. These hooks also cover navigation from buttons.
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    window.history.pushState = function (...args: Parameters<History["pushState"]>) {
      const before = window.location.pathname + window.location.search;
      const result = originalPushState.apply(this, args);
      const after = window.location.pathname + window.location.search;
      if (after !== before) beginLoading(getInternalRoute(window.location.href));
      return result;
    };
    window.history.replaceState = function (...args: Parameters<History["replaceState"]>) {
      const before = window.location.pathname;
      const result = originalReplaceState.apply(this, args);
      // Query-only replaceState is often a tab/filter preference, not a page move.
      if (window.location.pathname !== before) {
        beginLoading(getInternalRoute(window.location.href));
      }
      return result;
    };

    // The Navigation API can signal a route before its history entry changes.
    // Other browsers are covered by click/history/popstate listeners above.
    type NavigationEventLike = Event & { destination?: { url?: string } };
    type NavigationLike = {
      addEventListener(type: "navigate", listener: EventListener): void;
      removeEventListener(type: "navigate", listener: EventListener): void;
    };
    const nav = (window as Window & { navigation?: NavigationLike }).navigation;
    const handleNavigate: EventListener = (event) => {
      const href = (event as NavigationEventLike).destination?.url;
      if (href) beginLoading(getInternalRoute(href));
    };

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);
    nav?.addEventListener("navigate", handleNavigate);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
      nav?.removeEventListener("navigate", handleNavigate);
      if (window.history.pushState !== originalPushState) window.history.pushState = originalPushState;
      if (window.history.replaceState !== originalReplaceState) window.history.replaceState = originalReplaceState;
      clearTimers();
    };
  }, [beginLoading, clearTimers]);

  if (!visible || typeof document === "undefined") return null;

  return createPortal(
    <VerseLoadingScene
      eyebrow="Creating the next universe"
      title="새로운 우주가 태어나는 중"
      subtitle="빛이 모여 당신의 다음 세계가 펼쳐집니다."
    />,
    document.body
  );
}
