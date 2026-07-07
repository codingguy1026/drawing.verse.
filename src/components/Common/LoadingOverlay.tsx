"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

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

const verseNodes = [
  { label: "DV", className: "left-[2px] top-[54px]", delay: 0 },
  { label: "ART", className: "right-[0px] top-[24px]", delay: 0.35 },
  { label: "01", className: "left-[38px] bottom-[0px]", delay: 0.7 },
  { label: "◈", className: "right-[28px] bottom-[12px]", delay: 1.05 },
];

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

function MiniStar({
  delay = 0,
  className = "",
  mode,
}: {
  delay?: number;
  className?: string;
  mode: VisualMode;
}) {
  const isLight = mode === "light";

  return (
    <motion.span
      className={`absolute block h-1 w-1 rounded-full ${isLight
          ? "bg-violet-400/60 shadow-[0_0_14px_rgba(139,92,246,0.45)]"
          : "bg-white/70 shadow-[0_0_14px_rgba(255,255,255,0.8)]"
        } ${className}`}
      animate={{ opacity: [0.18, 0.95, 0.18], scale: [0.7, 1.25, 0.7] }}
      transition={{ duration: 2.8, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function RotatingDiamond({
  className = "",
  duration = 9,
  reverse = false,
}: {
  className?: string;
  duration?: number;
  reverse?: boolean;
}) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      animate={{ rotate: reverse ? -360 : 360 }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      <div
        className={`h-[86px] w-[86px] rotate-45 rounded-[18px] border border-white/20 shadow-[0_0_34px_rgba(139,92,246,0.24)] ${className}`}
      />
    </motion.div>
  );
}

function VerseNode({
  label,
  className,
  delay,
  mode,
}: {
  label: string;
  className: string;
  delay: number;
  mode: VisualMode;
}) {
  const isLight = mode === "light";

  return (
    <motion.span
      className={`absolute z-20 flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-[9px] font-black tracking-[-0.02em] backdrop-blur-md ${isLight
          ? "border border-violet-200/80 bg-white/75 text-violet-500/65 shadow-[0_0_24px_rgba(139,92,246,0.16)]"
          : "border border-white/12 bg-white/[0.07] text-white/56 shadow-[0_0_22px_rgba(125,211,252,0.18)]"
        } ${className}`}
      animate={{ opacity: [0.32, 0.88, 0.32], scale: [0.92, 1.08, 0.92] }}
      transition={{ duration: 2.4, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {label}
    </motion.span>
  );
}

function DguyMascotMark({ mode }: { mode: VisualMode }) {
  const isLight = mode === "light";

  return (
    <motion.div
      className="relative mb-7 h-[154px] w-[154px]"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      aria-hidden="true"
    >
      <div
        className={`absolute inset-0 rounded-full blur-3xl ${isLight ? "bg-violet-300/32" : "bg-violet-400/16"
          }`}
      />
      <div
        className={`absolute left-1/2 top-1/2 h-[142px] w-[142px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed ${isLight ? "border-violet-300/35" : "border-white/[0.075]"
          }`}
      />

      <motion.div
        className={`absolute left-1/2 top-1/2 h-[116px] w-[116px] -translate-x-1/2 -translate-y-1/2 rounded-full border ${isLight ? "border-violet-300/24" : "border-white/[0.055]"
          }`}
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      >
        <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-sky-300/80 shadow-[0_0_18px_rgba(56,189,248,0.75)]" />
        <span className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-fuchsia-300/80 shadow-[0_0_18px_rgba(236,72,153,0.65)]" />
      </motion.div>

      {verseNodes.map((node) => (
        <VerseNode key={node.label} mode={mode} {...node} />
      ))}

      <RotatingDiamond
        duration={10.5}
        className={
          isLight
            ? "bg-[linear-gradient(135deg,rgba(167,139,250,0.7),rgba(244,114,182,0.48))]"
            : "bg-[linear-gradient(135deg,rgba(139,92,246,0.82),rgba(236,72,153,0.72))]"
        }
      />
      <RotatingDiamond
        duration={13}
        reverse
        className={
          isLight
            ? "h-[78px] w-[78px] bg-[linear-gradient(135deg,rgba(125,211,252,0.55),rgba(129,140,248,0.46))] opacity-90"
            : "h-[78px] w-[78px] bg-[linear-gradient(135deg,rgba(14,165,233,0.76),rgba(99,102,241,0.68))] opacity-90"
        }
      />
      <RotatingDiamond
        duration={16}
        className={
          isLight
            ? "h-[68px] w-[68px] bg-[linear-gradient(135deg,rgba(216,180,254,0.46),rgba(186,230,253,0.44))] opacity-80"
            : "h-[68px] w-[68px] bg-[linear-gradient(135deg,rgba(216,180,254,0.7),rgba(125,211,252,0.58))] opacity-70"
        }
      />

      <motion.div
        className={`absolute left-1/2 top-1/2 z-10 h-[82px] w-[82px] -translate-x-1/2 -translate-y-1/2 rounded-[24px] border ${isLight
            ? "border-white/80 bg-[linear-gradient(145deg,#a78bfa_0%,#8b5cf6_48%,#6d5dfc_100%)] shadow-[0_18px_60px_rgba(124,58,237,0.25),inset_0_1px_0_rgba(255,255,255,0.46)]"
            : "border-white/18 bg-[linear-gradient(145deg,#8b5cf6_0%,#6d5dfc_46%,#5145d8_100%)] shadow-[0_18px_60px_rgba(79,70,229,0.48),inset_0_1px_0_rgba(255,255,255,0.22)]"
          }`}
        animate={{ rotate: [-1.6, 1.5, -1.6], scale: [1, 1.025, 1] }}
        transition={{ duration: 2.9, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.span
          className="absolute left-[24px] top-[36px] h-[4px] w-[4px] rounded-full bg-white/95 shadow-[0_0_10px_rgba(255,255,255,0.8)]"
          animate={{ scaleY: [1, 1, 0.12, 1], opacity: [1, 1, 0.62, 1] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.span
          className="absolute right-[24px] top-[31px] h-[4px] w-[4px] rounded-full bg-white/95 shadow-[0_0_10px_rgba(255,255,255,0.8)]"
          animate={{ scaleY: [1, 1, 0.12, 1], opacity: [1, 1, 0.62, 1] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        />

        <svg
          className="absolute left-1/2 top-[45px] h-5 w-10 -translate-x-1/2 text-white/95"
          viewBox="0 0 48 24"
          fill="none"
        >
          <path
            d="M6 9.5C13.5 17.5 31 18.5 42 6.5"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>

        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[24px] bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.2)_42%,transparent_58%)]"
          animate={{ x: ["-90%", "90%"] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="pointer-events-none absolute inset-0 rounded-[24px] bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.22),transparent_36%)]" />
      </motion.div>
    </motion.div>
  );
}

function VerseCoordinateChip({ mode }: { mode: VisualMode }) {
  const isLight = mode === "light";

  return (
    <motion.div
      className={`mb-3 flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] backdrop-blur-md ${isLight
          ? "border border-violet-200/80 bg-white/72 text-violet-500/58 shadow-[0_0_28px_rgba(139,92,246,0.13)]"
          : "border border-white/10 bg-white/[0.045] text-white/36 shadow-[0_0_28px_rgba(139,92,246,0.12)]"
        }`}
      animate={{ opacity: [0.48, 0.9, 0.48] }}
      transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-sky-300/80 shadow-[0_0_12px_rgba(56,189,248,0.75)]" />
      <span>VERSE COORD · 10-26 · DREAM NODE</span>
    </motion.div>
  );
}

function ProgressBar({
  progress,
  progressLabel,
  mode,
}: {
  progress: number;
  progressLabel: string;
  mode: VisualMode;
}) {
  const isLight = mode === "light";
  const displayPercent = normalizeProgress(progress);

  return (
    <div className="mt-9 w-full max-w-[320px]">
      <div
        className={`mb-3 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] ${isLight ? "text-violet-500/52" : "text-white/34"
          }`}
      >
        <span>{progressLabel}</span>
        <motion.span
          animate={{ opacity: [0.38, 0.9, 0.38] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          {displayPercent}%
        </motion.span>
      </div>

      <div
        className={`h-[5px] overflow-hidden rounded-full shadow-[inset_0_0_14px_rgba(255,255,255,0.04)] ${isLight ? "bg-violet-200/42" : "bg-white/[0.075]"
          }`}
        role="progressbar"
        aria-label={progressLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={displayPercent}
      >
        <motion.div
          className={`h-full rounded-full ${isLight
              ? "bg-[linear-gradient(90deg,rgba(139,92,246,0.42),rgba(236,72,153,0.62),rgba(56,189,248,0.72))] shadow-[0_0_22px_rgba(139,92,246,0.28)]"
              : "bg-[linear-gradient(90deg,rgba(167,139,250,0.35),rgba(216,180,254,0.95),rgba(125,211,252,0.88))] shadow-[0_0_22px_rgba(167,139,250,0.56)]"
            }`}
          initial={{ width: "0%" }}
          animate={{ width: `${displayPercent}%` }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export function LoadingScreen({
  copy,
  progress,
  mode = "dark",
}: {
  copy: LoadingCopy;
  progress: number;
  mode?: VisualMode;
}) {
  const isLight = mode === "light";

  return (
    <main
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden ${isLight ? "bg-[#fbf9ff] text-slate-950" : "bg-[#050612] text-white"
        }`}
      role="status"
      aria-live="polite"
      aria-label={`${copy.title} loading`}
    >
      {isLight ? (
        <>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(167,139,250,0.23),transparent_34%),radial-gradient(circle_at_22%_78%,rgba(125,211,252,0.24),transparent_36%),radial-gradient(circle_at_78%_72%,rgba(244,114,182,0.18),transparent_32%),linear-gradient(to_bottom,#ffffff_0%,#fbf7ff_48%,#eef7ff_100%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,transparent,rgba(139,92,246,0.06),transparent)] opacity-70" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.9),transparent_68%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.045)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.32]" />
        </>
      ) : (
        <>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(124,58,237,0.22),transparent_34%),radial-gradient(circle_at_50%_82%,rgba(14,165,233,0.12),transparent_38%),linear-gradient(to_bottom,#050612_0%,#07091d_48%,#03040c_100%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.04),transparent)] opacity-40" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_65%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.026)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.022)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.18]" />
        </>
      )}

      <MiniStar mode={mode} className="left-[17%] top-[24%]" delay={0.1} />
      <MiniStar mode={mode} className="left-[28%] top-[68%]" delay={0.5} />
      <MiniStar mode={mode} className="left-[74%] top-[25%]" delay={0.9} />
      <MiniStar mode={mode} className="left-[82%] top-[62%]" delay={1.2} />
      <MiniStar mode={mode} className="left-[48%] top-[18%]" delay={1.5} />
      <MiniStar mode={mode} className="left-[56%] top-[77%]" delay={1.8} />

      <motion.div
        className={`pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border ${isLight ? "border-violet-200/55" : "border-white/[0.055]"
          }`}
        animate={{ scale: [1, 1.04, 1], opacity: [0.45, 0.78, 0.45] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className={`pointer-events-none absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full border ${isLight ? "border-sky-200/42" : "border-white/[0.035]"
          }`}
        animate={{ scale: [1.02, 0.98, 1.02], opacity: [0.32, 0.62, 0.32] }}
        transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.section
        className="relative z-10 mx-6 flex w-full max-w-[460px] flex-col items-center text-center"
        initial={{ y: 14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <DguyMascotMark mode={mode} />
        <VerseCoordinateChip mode={mode} />

        <p
          className={`mb-2 text-[11px] font-bold uppercase tracking-[0.34em] ${isLight ? "text-violet-500/52" : "text-white/38"
            }`}
        >
          {copy.eyebrow}
        </p>

        <motion.h1
          className={`text-5xl font-black tracking-[-0.07em] sm:text-6xl ${isLight
              ? "text-slate-950 drop-shadow-[0_0_28px_rgba(139,92,246,0.16)]"
              : "text-white drop-shadow-[0_0_26px_rgba(255,255,255,0.22)]"
            }`}
          animate={{ opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        >
          {copy.title}
        </motion.h1>

        <p
          className={`mt-4 max-w-[330px] text-sm leading-6 ${isLight ? "text-slate-600/86" : "text-white/56"
            }`}
        >
          {copy.subtitle}
        </p>

        <ProgressBar progress={progress} progressLabel={copy.progressLabel} mode={mode} />

        <div
          className={`mt-6 h-6 overflow-hidden text-xs font-medium ${isLight ? "text-violet-500/50" : "text-white/36"
            }`}
        >
          <motion.div
            animate={{ y: [0, -24, -48, 0] }}
            transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
          >
            {copy.lines.map((line) => (
              <p key={line} className="h-6">
                {line}
              </p>
            ))}
          </motion.div>
        </div>
      </motion.section>
    </main>
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
