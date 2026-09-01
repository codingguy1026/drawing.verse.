"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LOADING_PRESETS,
  LoadingScreen,
  getBrowserVisualMode,
  getPresetKey,
  normalizeProgress,
} from "./LoadingOverlay";

export default function GlobalRouteLoader() {
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [visualMode, setVisualMode] = useState<"dark" | "light">("dark");

  const copy = useMemo(() => {
    const presetKey = pendingHref ? getPresetKey(pendingHref, null) : "default";
    return LOADING_PRESETS[presetKey];
  }, [pendingHref]);

  useEffect(() => {
    function shouldLoad(anchor: HTMLAnchorElement): boolean {
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return false;
      }
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
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.shiftKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a") as HTMLAnchorElement | null;
      if (!anchor || !shouldLoad(anchor)) return;

      event.preventDefault();
      event.stopPropagation();

      if (pendingHref) return;

      const url = new URL(anchor.href, window.location.origin);
      const targetHref = url.pathname + url.search + url.hash;

      setVisualMode(getBrowserVisualMode(null));
      setProgress(0);
      setPendingHref(targetHref);
    }

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [pendingHref]);

  useEffect(() => {
    if (!pendingHref) return;

    const interval = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 100) return 100;

        const nextStep = current < 60 ? 8 : current < 88 ? 4 : 2;
        return normalizeProgress(current + nextStep);
      });
    }, 110);

    return () => window.clearInterval(interval);
  }, [pendingHref]);

  useEffect(() => {
    if (!pendingHref || progress < 100) return;

    const timeout = window.setTimeout(() => {
      window.location.assign(pendingHref);
    }, 380);

    return () => window.clearTimeout(timeout);
  }, [pendingHref, progress]);

  if (!pendingHref) return null;

  return <LoadingScreen copy={copy} progress={progress} mode={visualMode} />;
}
