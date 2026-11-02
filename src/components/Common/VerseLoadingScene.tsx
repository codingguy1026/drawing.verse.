"use client";

import { motion, useReducedMotion } from "framer-motion";

export type VerseLoadingPhase = "connecting" | "rendering" | "ready" | "delayed";
type LoadingVariant = "fullscreen" | "inline" | "overlay";

type VerseLoadingSceneProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  mode?: "auto" | "light" | "dark";
  phase?: VerseLoadingPhase;
  variant?: LoadingVariant;
};

const stageCopy: Record<VerseLoadingPhase, string> = {
  connecting: "다음 페이지에 연결하는 중",
  delayed: "응답을 기다리고 있어요",
  rendering: "페이지를 화면에 표시하는 중",
  ready: "준비 완료",
};

const stars = [
  { top: "16%", left: "18%", delay: 0 },
  { top: "28%", left: "82%", delay: 0.6 },
  { top: "72%", left: "11%", delay: 1.2 },
  { top: "81%", left: "75%", delay: 0.3 },
  { top: "49%", left: "91%", delay: 1.7 },
];

export default function VerseLoadingScene({
  eyebrow = "VERSE NAVIGATOR",
  title = "새로운 페이지를 여는 중",
  subtitle = "잠시만요, 다음 세계를 준비하고 있어요.",
  mode = "auto",
  phase = "connecting",
  variant = "fullscreen",
}: VerseLoadingSceneProps) {
  const reduceMotion = useReducedMotion();
  const isDone = phase === "ready";
  const themeClasses = mode === "dark"
    ? "bg-[#0b0a1c] text-[#f5f1ff]"
    : mode === "light"
      ? "bg-[#fbf9ff] text-[#302440]"
      : "bg-[#fbf9ff] text-[#302440] dark:bg-[#0b0a1c] dark:text-[#f5f1ff]";
  const subtleClasses = mode === "dark"
    ? "text-[#bbb0da]"
    : mode === "light"
      ? "text-[#776d8b]"
      : "text-[#776d8b] dark:text-[#bbb0da]";
  const surfaceClasses = mode === "dark"
    ? "border-white/10 bg-white/[0.04]"
    : mode === "light"
      ? "border-violet-200/70 bg-white/75"
      : "border-violet-200/70 bg-white/75 dark:border-white/10 dark:bg-white/[0.04]";
  const layoutClass =
    variant === "fullscreen"
      ? "fixed inset-0 z-[2147483647] h-[100dvh] w-screen"
      : variant === "overlay"
        ? "absolute inset-0 z-[70] min-h-full"
        : "relative w-full min-h-[calc(100dvh-9rem)]";
  const innerClass =
    variant === "overlay"
      ? "sticky top-0 flex min-h-[min(680px,calc(100dvh-7rem))] w-full items-center justify-center px-5 py-12"
      : variant === "inline"
        ? "flex min-h-[calc(100dvh-9rem)] w-full items-center justify-center px-5 py-12"
        : "flex min-h-full w-full items-center justify-center px-5 py-12";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Drawing Verse 페이지 로딩 중"
      className={`${layoutClass} ${themeClasses} isolate ${variant === "fullscreen" ? "overflow-hidden" : "overflow-clip"}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_32%,rgba(167,139,250,0.17),transparent_50%),radial-gradient(circle_at_88%_87%,rgba(249,112,148,0.08),transparent_38%)]"
      />
      <div className={innerClass}>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          {stars.map((star, index) => (
            <motion.span
              key={index}
              className="absolute h-1 w-1 rounded-full bg-violet-400/75 shadow-[0_0_12px_rgba(139,92,246,0.5)]"
              style={{ top: star.top, left: star.left }}
              animate={reduceMotion ? undefined : { opacity: [0.3, 0.95, 0.3], scale: [1, 1.4, 1] }}
              transition={{ duration: 2.8, delay: star.delay, ease: "easeInOut", repeat: Infinity }}
            />
          ))}
        </div>

        <section className={`relative z-10 flex w-full max-w-[360px] flex-col items-center rounded-[30px] border px-6 py-9 text-center shadow-[0_22px_72px_rgba(96,65,154,0.09)] backdrop-blur-xl sm:px-9 ${surfaceClasses}`}>
          <div className="relative mb-7 flex h-36 w-36 items-center justify-center" aria-hidden="true">
            <div className="absolute inset-5 rounded-full bg-violet-400/20 blur-2xl" />
            <motion.div
              className="absolute inset-1 rounded-full border border-dashed border-violet-400/50"
              animate={reduceMotion ? undefined : { rotate: 360 }}
              transition={{ duration: 15, ease: "linear", repeat: Infinity }}
            >
              <span className="absolute -top-1 left-1/2 h-2 w-2 rounded-full bg-[#fb728e] shadow-[0_0_14px_rgba(251,114,142,0.65)]" />
            </motion.div>
            <motion.div
              className="absolute inset-5 rounded-full border border-violet-300/45"
              animate={reduceMotion ? undefined : { rotate: -360 }}
              transition={{ duration: 10, ease: "linear", repeat: Infinity }}
            >
              <span className="absolute bottom-1 left-0 h-2 w-2 rounded-full bg-[#8e74f8] shadow-[0_0_14px_rgba(142,116,248,0.75)]" />
            </motion.div>
            <motion.div
              className="relative flex h-[76px] w-[76px] items-center justify-center rounded-[23px] border border-white/60 bg-gradient-to-br from-[#ff758d] via-[#ad8cff] to-[#7658ea] text-2xl font-black tracking-[-0.14em] text-white shadow-[0_14px_34px_rgba(120,83,220,0.25)]"
              animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
              transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
            >
              DV<span className="absolute -right-1 -top-2 text-sm tracking-normal">✦</span>
            </motion.div>
          </div>

          <p className="text-[10px] font-extrabold uppercase tracking-[0.27em] text-[#8560e8] dark:text-[#c4a8ff]">
            DRAWING VERSE
          </p>
          <h2 className="mt-3 text-[21px] font-extrabold tracking-[-0.05em] sm:text-[23px]">{title}</h2>
          <p className={`mt-2 text-[13px] leading-6 ${subtleClasses}`}>{subtitle}</p>

          <div className="mt-7 w-full" role="progressbar" aria-label={stageCopy[phase]} aria-valuetext={stageCopy[phase]}>
            <div className="relative h-[3px] overflow-hidden rounded-full bg-violet-200/70 dark:bg-white/15">
              {isDone ? (
                <div className="h-full w-full rounded-full bg-gradient-to-r from-[#fb728e] to-[#8767ef]" />
              ) : (
                <motion.div
                  className="absolute inset-y-0 w-[38%] rounded-full bg-gradient-to-r from-[#ff7995] via-[#a68aff] to-[#8062ec]"
                  initial={{ x: "-110%" }}
                  animate={reduceMotion ? undefined : { x: ["-110%", "290%"] }}
                  transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity }}
                />
              )}
            </div>
            <div className={`mt-3 flex items-center justify-between gap-3 text-[11px] font-semibold ${subtleClasses}`}>
              <span aria-live="polite">{stageCopy[phase]}</span>
              <span className="shrink-0 text-[#9a75ed]">{isDone ? "✓" : "✦ ✦ ✦"}</span>
            </div>
          </div>
          <p className={`mt-7 text-[10px] font-bold uppercase tracking-[0.19em] ${subtleClasses}`}>{eyebrow}</p>
        </section>
      </div>
    </div>
  );
}
