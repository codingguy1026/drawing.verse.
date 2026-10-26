"use client";

import { useEffect, useMemo, useState } from "react";
import VerseLoadingScene from "@/components/Common/VerseLoadingScene";
import {
  getBrowserVisualMode,
  getLoadingRouteState,
  LOADING_PRESETS,
  normalizeProgress,
  shouldAutoRedirect,
} from "@/components/Common/LoadingOverlay";

export default function Page() {
  const [progress, setProgress] = useState(0);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<"light" | "dark">("light");

  const routeState = useMemo(() => getLoadingRouteState(search), [search]);
  const preset = LOADING_PRESETS[routeState.presetKey] ?? LOADING_PRESETS.default;
  const copy = {
    ...preset,
    title: routeState.title || preset.title,
    subtitle: routeState.subtitle || preset.subtitle,
    progressLabel: routeState.label || preset.progressLabel,
  };

  useEffect(() => {
    const nextSearch = window.location.search;
    const nextRoute = getLoadingRouteState(nextSearch);
    setSearch(nextSearch);
    setMode(getBrowserVisualMode(nextRoute.themeOverride));

    const updateTheme = () => setMode(getBrowserVisualMode(nextRoute.themeOverride));
    const observer = new MutationObserver(updateTheme);
    const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    mediaQuery?.addEventListener?.("change", updateTheme);
    window.addEventListener("storage", updateTheme);

    return () => {
      observer.disconnect();
      mediaQuery?.removeEventListener?.("change", updateTheme);
      window.removeEventListener("storage", updateTheme);
    };
  }, []);

  useEffect(() => {
    setProgress(0);
    const interval = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 100) return 100;
        const step = current < 58 ? 8 : current < 86 ? 5 : 2;
        return normalizeProgress(current + step);
      });
    }, 115);

    return () => window.clearInterval(interval);
  }, [routeState.targetHref]);

  useEffect(() => {
    if (progress < 100) return;
    if (!shouldAutoRedirect(window.location.search, window.location.hostname)) return;

    const timeout = window.setTimeout(() => {
      window.location.replace(routeState.targetHref);
    }, 360);

    return () => window.clearTimeout(timeout);
  }, [progress, routeState.targetHref]);

  return (
    <VerseLoadingScene
      mode={mode}
      eyebrow={copy.progressLabel}
      title={copy.title}
      subtitle={copy.subtitle}
    />
  );
}
