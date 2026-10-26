"use client";

import { useEffect, useMemo, useState } from "react";
import VerseLoadingScene from "@/components/Common/VerseLoadingScene";

type LoadingPresetKey =
  | "home"
  | "universe"
  | "community"
  | "gallery"
  | "verse-talk"
  | "login"
  | "default";

type VisualMode = "dark" | "light";
type ThemeOverride = VisualMode | null;

type LoadingCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  progressLabel: string;
  lines: string[];
};

type LoadingRouteState = {
  targetHref: string;
  presetKey: LoadingPresetKey;
  themeOverride: ThemeOverride;
  title: string | null;
  subtitle: string | null;
  label: string | null;
};

type ThemeResolveInput = {
  htmlClassName?: string;
  storedTheme?: string | null;
  prefersDark?: boolean;
};

export const LOADING_PRESETS: Record<LoadingPresetKey, LoadingCopy> = {
  home: {
    eyebrow: "Returning Home",
    title: "Drawing Verse",
    subtitle: "홈으로 돌아가는 길을 다시 그리고 있어요",
    progressLabel: "Opening home",
    lines: [
      "메인 별자리를 정렬하는 중...",
      "오늘의 창작 신호를 불러오는 중...",
      "Drawing Verse의 첫 화면을 여는 중...",
    ],
  },
  universe: {
    eyebrow: "Entering Universe",
    title: "Universe",
    subtitle: "당신이 들어갈 그림 유니버스를 준비하고 있어요",
    progressLabel: "Loading universe",
    lines: [
      "유니버스 좌표를 찾는 중...",
      "창작 세계의 문을 여는 중...",
      "마름모 포털을 안정화하는 중...",
    ],
  },
  community: {
    eyebrow: "Opening Community",
    title: "Community",
    subtitle: "다른 창작자들이 모인 광장으로 이동하고 있어요",
    progressLabel: "Loading community",
    lines: [
      "커뮤니티 광장을 불러오는 중...",
      "새 글과 반응을 정리하는 중...",
      "오늘의 대화 흐름을 연결하는 중...",
    ],
  },
  gallery: {
    eyebrow: "Opening Gallery",
    title: "Gallery",
    subtitle: "반짝이는 작품들을 전시할 공간을 펼치고 있어요",
    progressLabel: "Loading gallery",
    lines: [
      "작품 조각을 정렬하는 중...",
      "갤러리 조명을 켜는 중...",
      "그림 유니버스의 전시장을 여는 중...",
    ],
  },
  "verse-talk": {
    eyebrow: "Connecting Verse Talk",
    title: "Verse Talk",
    subtitle: "비슷한 파장의 창작자를 찾으러 가고 있어요",
    progressLabel: "Matching signal",
    lines: [
      "대화 파장을 스캔하는 중...",
      "말 걸어도 괜찮은 유저를 찾는 중...",
      "랜덤 매칭 좌표를 조율하는 중...",
    ],
  },
  login: {
    eyebrow: "Opening Account Gate",
    title: "Login",
    subtitle: "Drawing Verse 계정 게이트를 여는 중이에요",
    progressLabel: "Checking session",
    lines: [
      "로그인 포털을 준비하는 중...",
      "세션 신호를 확인하는 중...",
      "계정 게이트를 안전하게 여는 중...",
    ],
  },
  default: {
    eyebrow: "Entering Verse",
    title: "Drawing Verse",
    subtitle: "당신의 그림 유니버스로 이동하고 있어요",
    progressLabel: "Loading your universe",
    lines: [
      "Drawing Verse를 여는 중...",
      "당신의 그림 유니버스를 불러오는 중...",
      "창작의 별자리를 연결하는 중...",
    ],
  },
};

export const loadingPageHrefTestCases = [
  { input: "/", expected: "/" },
  { input: "/universe", expected: "/universe" },
  { input: "/community?tab=talk", expected: "/community?tab=talk" },
  { input: "https://bad.example", expected: "/" },
  { input: "//bad.example", expected: "/" },
  { input: "/loading?to=/community", expected: "/" },
  { input: "", expected: "/" },
  { input: null, expected: "/" },
  { input: "gallery", expected: "/" },
  { input: "   ", expected: "/" },
  { input: "/loading", expected: "/" },
  { input: "/loading/custom", expected: "/" },
];

export const loadingPagePresetTestCases = [
  { to: "/", kind: null, expected: "home" },
  { to: "/universe", kind: null, expected: "universe" },
  { to: "/community", kind: null, expected: "community" },
  { to: "/gallery", kind: null, expected: "gallery" },
  { to: "/community?mode=verse-talk", kind: "verse-talk", expected: "verse-talk" },
  { to: "/login", kind: null, expected: "login" },
  { to: "/auth/login", kind: null, expected: "login" },
  { to: "/unknown", kind: null, expected: "default" },
  { to: "/universe", kind: "gallery", expected: "gallery" },
  { to: "/universe", kind: "not-real", expected: "universe" },
];

export const loadingPageProgressTestCases = [
  { input: -10, expected: 0 },
  { input: 0, expected: 0 },
  { input: 35.4, expected: 35 },
  { input: 35.6, expected: 36 },
  { input: 100, expected: 100 },
  { input: 150, expected: 100 },
  { input: Number.NaN, expected: 0 },
];

export const loadingPageRedirectTestCases = [
  { search: "?to=/universe", hostname: "localhost", expected: true },
  { search: "?to=/gallery&kind=gallery", hostname: "web-sandbox.oaiusercontent.com", expected: true },
  { search: "", hostname: "localhost", expected: true },
  { search: "", hostname: "web-sandbox.oaiusercontent.com", expected: false },
  { search: "?preview=1", hostname: "localhost", expected: false },
  { search: "?preview=1&to=/universe", hostname: "localhost", expected: false },
];

export const loadingPageThemeOverrideTestCases = [
  { input: null, expected: null },
  { input: "", expected: null },
  { input: "auto", expected: null },
  { input: "system", expected: null },
  { input: "dark", expected: "dark" },
  { input: "DARK", expected: "dark" },
  { input: "light", expected: "light" },
  { input: "white", expected: "light" },
  { input: "unknown", expected: null },
];

export const loadingPageVisualModeTestCases = [
  {
    override: "light" as ThemeOverride,
    input: { htmlClassName: "dark", storedTheme: "dark", prefersDark: true },
    expected: "light",
  },
  {
    override: "dark" as ThemeOverride,
    input: { htmlClassName: "", storedTheme: "light", prefersDark: false },
    expected: "dark",
  },
  {
    override: null,
    input: { htmlClassName: "dark", storedTheme: null, prefersDark: false },
    expected: "dark",
  },
  {
    override: null,
    input: { htmlClassName: "light", storedTheme: null, prefersDark: true },
    expected: "light",
  },
  {
    override: null,
    input: { htmlClassName: "", storedTheme: "light", prefersDark: true },
    expected: "light",
  },
  {
    override: null,
    input: { htmlClassName: "", storedTheme: "dark", prefersDark: false },
    expected: "dark",
  },
  {
    override: null,
    input: { htmlClassName: "", storedTheme: "system", prefersDark: true },
    expected: "dark",
  },
  {
    override: null,
    input: { htmlClassName: "", storedTheme: null, prefersDark: false },
    expected: "light",
  },
];

export const loadingRouteStateTestCases = [
  {
    input: "?to=/universe&kind=universe",
    expected: {
      targetHref: "/universe",
      presetKey: "universe",
      themeOverride: null,
      title: null,
      subtitle: null,
      label: null,
    },
  },
  {
    input: "?to=https://bad.example&kind=gallery&title=Gallery",
    expected: {
      targetHref: "/",
      presetKey: "gallery",
      themeOverride: null,
      title: "Gallery",
      subtitle: null,
      label: null,
    },
  },
  {
    input: "?to=/community%3Fmode%3Dverse-talk&kind=verse-talk&subtitle=hello&label=Matching",
    expected: {
      targetHref: "/community?mode=verse-talk",
      presetKey: "verse-talk",
      themeOverride: null,
      title: null,
      subtitle: "hello",
      label: "Matching",
    },
  },
  {
    input: "?to=/gallery&kind=gallery&theme=white",
    expected: {
      targetHref: "/gallery",
      presetKey: "gallery",
      themeOverride: "light",
      title: null,
      subtitle: null,
      label: null,
    },
  },
  {
    input: "?to=/gallery&kind=gallery&theme=dark",
    expected: {
      targetHref: "/gallery",
      presetKey: "gallery",
      themeOverride: "dark",
      title: null,
      subtitle: null,
      label: null,
    },
  },
];

export function sanitizeInternalHref(href: string | null) {
  if (!href) return "/";

  const trimmedHref = href.trim();
  if (!trimmedHref) return "/";
  if (!trimmedHref.startsWith("/")) return "/";
  if (trimmedHref.startsWith("//")) return "/";
  if (trimmedHref.startsWith("/loading")) return "/";

  return trimmedHref;
}

export function getPresetKey(to: string, kind: string | null): LoadingPresetKey {
  if (kind && kind in LOADING_PRESETS) return kind as LoadingPresetKey;
  if (to === "/") return "home";
  if (to.startsWith("/universe")) return "universe";
  if (to.startsWith("/community")) return "community";
  if (to.startsWith("/gallery")) return "gallery";
  if (to.startsWith("/login") || to.startsWith("/auth")) return "login";
  return "default";
}

export function getThemeOverride(theme: string | null): ThemeOverride {
  const normalizedTheme = theme?.toLowerCase().trim();
  if (normalizedTheme === "light" || normalizedTheme === "white") return "light";
  if (normalizedTheme === "dark") return "dark";
  return null;
}

export function resolveVisualMode(override: ThemeOverride, input: ThemeResolveInput = {}): VisualMode {
  if (override) return override;

  const htmlClassName = input.htmlClassName ?? "";
  const storedTheme = input.storedTheme?.toLowerCase().trim() ?? null;
  const prefersDark = Boolean(input.prefersDark);

  if (/\bdark\b/.test(htmlClassName)) return "dark";
  if (/\blight\b/.test(htmlClassName)) return "light";
  if (storedTheme === "dark") return "dark";
  if (storedTheme === "light" || storedTheme === "white") return "light";

  return prefersDark ? "dark" : "light";
}

export function getStoredTheme() {
  if (typeof window === "undefined") return null;

  return (
    window.localStorage.getItem("theme") ||
    window.localStorage.getItem("dv-theme") ||
    window.localStorage.getItem("next-theme")
  );
}

export function getBrowserVisualMode(override: ThemeOverride): VisualMode {
  if (typeof window === "undefined") return override ?? "light";

  return resolveVisualMode(override, {
    htmlClassName: document.documentElement.className,
    storedTheme: getStoredTheme(),
    prefersDark: window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false,
  });
}

export function normalizeProgress(progress: number) {
  if (Number.isNaN(progress)) return 0;
  return Math.min(100, Math.max(0, Math.round(progress)));
}

export function shouldAutoRedirect(search = "", hostname = "") {
  const params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);
  if (params.get("preview") === "1") return false;

  const isCanvasPreview = hostname.includes("oaiusercontent.com");
  const hasTarget = params.has("to");

  if (isCanvasPreview && !hasTarget) return false;
  return true;
}

export function getLoadingRouteState(search = ""): LoadingRouteState {
  const params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);
  const targetHref = sanitizeInternalHref(params.get("to"));
  const presetKey = getPresetKey(targetHref, params.get("kind"));
  const themeOverride = getThemeOverride(params.get("theme"));

  return {
    targetHref,
    presetKey,
    themeOverride,
    title: params.get("title"),
    subtitle: params.get("subtitle"),
    label: params.get("label"),
  };
}

export function makeLoadingHref({
  to,
  kind,
  title,
  subtitle,
  theme,
}: {
  to: string;
  kind?: LoadingPresetKey;
  title?: string;
  subtitle?: string;
  theme?: VisualMode | "auto" | "system";
}) {
  const params = new URLSearchParams();
  params.set("to", sanitizeInternalHref(to));
  if (kind) params.set("kind", kind);
  if (title) params.set("title", title);
  if (subtitle) params.set("subtitle", subtitle);
  if (theme && theme !== "auto" && theme !== "system") params.set("theme", theme);
  return `/loading?${params.toString()}`;
}

function replaceLocation(href: string) {
  if (typeof window === "undefined") return;
  window.location.replace(href);
}

export function LoadingScreen({
  copy,
  mode = "dark",
}: {
  copy: LoadingCopy;
  progress: number;
  mode?: VisualMode;
}) {
  return (
    <VerseLoadingScene
      mode={mode}
      eyebrow={copy.progressLabel}
      title={copy.title}
      subtitle={copy.subtitle}
    />
  );
}

function LoadingBridge() {
  const [progress, setProgress] = useState(0);
  const [routeState, setRouteState] = useState<LoadingRouteState>(() =>
    getLoadingRouteState(typeof window === "undefined" ? "" : window.location.search)
  );
  const [visualMode, setVisualMode] = useState<VisualMode>(() =>
    getBrowserVisualMode(routeState.themeOverride)
  );
  const [canAutoRedirect, setCanAutoRedirect] = useState(() =>
    typeof window === "undefined"
      ? false
      : shouldAutoRedirect(window.location.search, window.location.hostname)
  );

  useEffect(() => {
    const nextRouteState = getLoadingRouteState(window.location.search);
    setRouteState(nextRouteState);
    setVisualMode(getBrowserVisualMode(nextRouteState.themeOverride));
    setCanAutoRedirect(shouldAutoRedirect(window.location.search, window.location.hostname));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateVisualMode = () => {
      setVisualMode(getBrowserVisualMode(routeState.themeOverride));
    };

    updateVisualMode();

    const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
    mediaQuery?.addEventListener?.("change", updateVisualMode);
    window.addEventListener("storage", updateVisualMode);

    const observer = new MutationObserver(updateVisualMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => {
      mediaQuery?.removeEventListener?.("change", updateVisualMode);
      window.removeEventListener("storage", updateVisualMode);
      observer.disconnect();
    };
  }, [routeState.themeOverride]);

  const copy = useMemo(() => {
    const preset = LOADING_PRESETS[routeState.presetKey] ?? LOADING_PRESETS.default;
    return {
      ...preset,
      title: routeState.title || preset.title,
      subtitle: routeState.subtitle || preset.subtitle,
      progressLabel: routeState.label || preset.progressLabel,
    };
  }, [routeState]);

  useEffect(() => {
    setProgress(0);

    const interval = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 100) return 100;
        const nextStep = current < 60 ? 9 : current < 88 ? 5 : 2;
        return normalizeProgress(current + nextStep);
      });
    }, 120);

    return () => window.clearInterval(interval);
  }, [routeState.targetHref]);

  useEffect(() => {
    if (!canAutoRedirect) return;
    if (progress < 100) return;

    const timeout = window.setTimeout(() => {
      replaceLocation(routeState.targetHref);
    }, 420);

    return () => window.clearTimeout(timeout);
  }, [canAutoRedirect, progress, routeState.targetHref]);

  return <LoadingScreen copy={copy} progress={progress} mode={visualMode} />;
}

export default function LoadingPage() {
  return <LoadingBridge />;
}
