"use client";

import { useEffect, useMemo, useState } from "react";
import VerseLoadingScene from "@/components/Common/VerseLoadingScene";
import {
  getBrowserVisualMode,
  getLoadingRouteState,
  LOADING_PRESETS,
  shouldAutoRedirect,
} from "@/components/Common/LoadingOverlay";

const STANDALONE_MIN_VISIBLE_MS = 2300;

export default function Page() {
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
    if (!shouldAutoRedirect(window.location.search, window.location.hostname)) return;

    // The dedicated /loading route cannot know the destination's network bytes.
    // Keep its progress indeterminate until the destination navigation actually begins.
    const timer = window.setTimeout(() => {
      window.location.replace(routeState.targetHref);
    }, STANDALONE_MIN_VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [routeState.targetHref]);

  return (
    <VerseLoadingScene
      mode={mode}
      eyebrow={copy.progressLabel}
      title={copy.title}
      subtitle={copy.subtitle}
    />
  );
}
