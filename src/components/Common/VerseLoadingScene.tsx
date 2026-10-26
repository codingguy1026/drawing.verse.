"use client";

import { motion, useReducedMotion } from "framer-motion";

type VerseLoadingSceneProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  mode?: "auto" | "light" | "dark";
};

const stars = [
  { left: "12%", top: "21%", delay: 0.1 },
  { left: "27%", top: "72%", delay: 0.9 },
  { left: "72%", top: "16%", delay: 1.5 },
  { left: "86%", top: "64%", delay: 0.4 },
  { left: "59%", top: "85%", delay: 1.1 },
  { left: "18%", top: "48%", delay: 1.8 },
  { left: "80%", top: "39%", delay: 0.7 },
];

const newbornStars = [
  { x: -100, y: -58, delay: 0.2, color: "bg-sky-400" },
  { x: 96, y: -72, delay: 0.31, color: "bg-fuchsia-400" },
  { x: -112, y: 46, delay: 0.42, color: "bg-violet-400" },
  { x: 98, y: 75, delay: 0.53, color: "bg-sky-300" },
  { x: 14, y: -115, delay: 0.27, color: "bg-white" },
  { x: -21, y: 114, delay: 0.48, color: "bg-fuchsia-300" },
];

export default function VerseLoadingScene({
  eyebrow = "Connecting worlds",
  title = "새로운 우주를 여는 중",
  subtitle = "당신의 다음 세계를 준비하고 있어요.",
  mode = "auto",
}: VerseLoadingSceneProps) {
  const reduceMotion = useReducedMotion();
  const dark = mode === "dark";
  const light = mode === "light";
  const background = dark
    ? "bg-[#050714] text-white"
    : light
      ? "bg-[#fafbff] text-[#18213b]"
      : "bg-[#fafbff] text-[#18213b] dark:bg-[#050714] dark:text-white";
  const subtleText = dark
    ? "text-white/50"
    : light
      ? "text-slate-500"
      : "text-slate-500 dark:text-white/50";
  const orbitBorder = dark
    ? "border-white/15"
    : light
      ? "border-violet-300/45"
      : "border-violet-300/45 dark:border-white/15";

  return (
    <main
      className={`fixed inset-0 z-[2147483647] flex h-[100dvh] w-screen items-center justify-center overflow-hidden ${background}`}
      role="status"
      aria-live="polite"
      aria-label="Drawing Verse 페이지를 불러오는 중"
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,rgba(149,115,255,0.18),transparent_48%),radial-gradient(ellipse_at_12%_80%,rgba(66,196,236,0.11),transparent_38%),linear-gradient(180deg,#ffffff,#f4f5ff)] ${dark ? "hidden" : light ? "" : "dark:hidden"}`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(115,67,249,0.28),transparent_45%),radial-gradient(ellipse_at_78%_70%,rgba(36,147,203,0.13),transparent_40%),linear-gradient(180deg,#080a1c,#03040c)] ${light ? "hidden" : dark ? "" : "hidden dark:block"}`}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(142,130,199,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(142,130,199,0.08)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]"
      />

      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {stars.map((star, index) => (
          <motion.span
            key={index}
            className={`absolute block h-1 w-1 rounded-full bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.85)] ${dark ? "bg-white/75" : light ? "" : "dark:bg-white/75"}`}
            style={{ left: star.left, top: star.top }}
            animate={reduceMotion ? undefined : { opacity: [0.25, 0.9, 0.25], scale: [0.8, 1.35, 0.8] }}
            transition={{ duration: 2.9, delay: star.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      <section className="relative z-10 flex w-full max-w-md flex-col items-center px-5 text-center">
        <div className="relative mb-6 flex h-60 w-60 items-center justify-center sm:h-64 sm:w-64" aria-hidden="true">
          <motion.div
            className="absolute inset-[14%] rounded-full bg-violet-500/25 blur-[45px]"
            animate={reduceMotion ? undefined : { scale: [0.55, 1.2, 1], opacity: [0.25, 0.9, 0.6] }}
            transition={{ duration: 1.45, ease: "easeOut" }}
          />

          {/* A tiny point of light becomes an expanding new universe. */}
          {[0, 1].map((wave) => (
            <motion.div
              key={wave}
              className="absolute inset-[25%] rounded-full border border-violet-400/45 shadow-[0_0_28px_rgba(167,139,250,0.23)]"
              initial={reduceMotion ? false : { scale: 0.24, opacity: 0 }}
              animate={reduceMotion ? undefined : { scale: [0.24, 1.8, 2.35], opacity: [0, 0.55, 0] }}
              transition={{ duration: 2.8, delay: 0.35 + wave * 1.4, ease: "easeOut", repeat: Infinity }}
            />
          ))}

          <motion.div
            className={`absolute inset-2 rounded-full border border-dashed ${orbitBorder}`}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.4 }}
            animate={reduceMotion ? undefined : { opacity: 1, scale: 1, rotate: 360 }}
            transition={reduceMotion ? undefined : { opacity: { duration: 0.75 }, scale: { duration: 1 }, rotate: { duration: 28, ease: "linear", repeat: Infinity } }}
          >
            <span className="absolute left-1/2 -top-[5px] h-[10px] w-[10px] -translate-x-1/2 rounded-full bg-sky-400 shadow-[0_0_18px_rgba(56,189,248,0.9)]" />
          </motion.div>

          <motion.div
            className={`absolute inset-8 rounded-full border ${orbitBorder}`}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.5 }}
            animate={reduceMotion ? undefined : { opacity: 1, scale: 1, rotate: -360 }}
            transition={reduceMotion ? undefined : { opacity: { duration: 0.85 }, scale: { duration: 0.95 }, rotate: { duration: 19, ease: "linear", repeat: Infinity } }}
          >
            <span className="absolute -right-[5px] top-1/2 h-[10px] w-[10px] -translate-y-1/2 rounded-full bg-fuchsia-400 shadow-[0_0_18px_rgba(232,121,249,0.8)]" />
          </motion.div>

          {newbornStars.map((star, index) => (
            <motion.span
              key={index}
              className={`absolute left-1/2 top-1/2 z-10 h-[5px] w-[5px] rounded-full shadow-[0_0_12px_currentColor] ${star.color}`}
              initial={reduceMotion ? { x: star.x, y: star.y, opacity: 0.75 } : { x: 0, y: 0, opacity: 0, scale: 0.1 }}
              animate={reduceMotion ? undefined : {
                x: [0, star.x * 1.12, star.x],
                y: [0, star.y * 1.12, star.y],
                scale: [0.1, 1.35, 0.9],
                opacity: [0, 1, 0.65],
              }}
              transition={{ duration: 1.2, delay: star.delay, ease: "easeOut" }}
            />
          ))}

          <motion.div
            className="relative flex h-[94px] w-[94px] items-center justify-center rounded-full border border-white/30 bg-[radial-gradient(circle_at_29%_22%,#d3c1ff_0%,#a28afa_20%,#7257ed_55%,#3423a3_100%)] shadow-[0_20px_65px_rgba(106,77,229,0.48),inset_0_2px_3px_rgba(255,255,255,0.4)]"
            initial={reduceMotion ? false : { scale: 0.06, opacity: 0, filter: "blur(9px)" }}
            animate={reduceMotion ? undefined : { scale: [0.06, 1.2, 1], opacity: [0, 1, 1], filter: "blur(0px)" }}
            transition={{ duration: 1, times: [0, 0.75, 1], ease: "easeOut" }}
          >
            <span className="text-[30px] font-black tracking-[-0.14em] text-white [text-shadow:0_2px_10px_rgba(32,16,90,0.35)]">
              D<span className="pr-1 text-[#9deeff]">V</span>
            </span>
            <span className="absolute right-2 top-3 text-xs text-white/85">✦</span>
            <motion.span
              className="pointer-events-none absolute inset-1 rounded-full border border-white/35"
              animate={reduceMotion ? undefined : { opacity: [0.15, 0.55, 0.15] }}
              transition={{ duration: 2.8, ease: "easeInOut", repeat: Infinity }}
            />
          </motion.div>
        </div>

        <p className="text-[10px] font-extrabold uppercase tracking-[0.36em] text-violet-500 dark:text-violet-300">
          Drawing Verse
        </p>
        <h1 className="mt-3 text-[25px] font-black tracking-[-0.05em] sm:text-[29px]">
          {title}
        </h1>
        <p className={`mt-2 text-sm leading-6 ${subtleText}`}>{subtitle}</p>

        <div className="mt-9 w-56" aria-hidden="true">
          <div className={`h-[3px] overflow-hidden rounded-full ${dark ? "bg-white/10" : light ? "bg-violet-200/65" : "bg-violet-200/65 dark:bg-white/10"}`}>
            <motion.div
              className="h-full w-[76px] rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-400 to-sky-400 shadow-[0_0_18px_rgba(139,92,246,0.65)]"
              animate={reduceMotion ? undefined : { x: [-76, 224] }}
              transition={{ duration: 1.75, ease: "easeInOut", repeat: Infinity }}
            />
          </div>
        </div>
        <p className={`mt-4 text-[10px] font-semibold uppercase tracking-[0.26em] ${subtleText}`}>
          {eyebrow}
        </p>
        <p className={`mt-9 text-[10px] tracking-[0.22em] ${subtleText}`}>
          EVERY IDEA HAS A UNIVERSE
        </p>
      </section>
    </main>
  );
}
