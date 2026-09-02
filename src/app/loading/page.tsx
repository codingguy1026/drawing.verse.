"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Home,
  Images,
  MessageCircle,
  Orbit,
  Play,
} from "lucide-react";
import {
  getBrowserVisualMode,
  getLoadingRouteState,
  LOADING_PRESETS,
  normalizeProgress,
  shouldAutoRedirect,
} from "@/components/Common/LoadingOverlay";

const versePoints = [
  { label: "HOME", Icon: Home, position: "left-[5%] top-[57%]", delay: 0 },
  { label: "UNIVERSE", Icon: Orbit, position: "left-[22%] top-[25%]", delay: 0.14 },
  { label: "TALK", Icon: MessageCircle, position: "left-1/2 top-[16%] -translate-x-1/2", delay: 0.28 },
  { label: "GALLERY", Icon: Images, position: "right-[22%] top-[25%]", delay: 0.42 },
  { label: "TV", Icon: Play, position: "right-[5%] top-[57%]", delay: 0.56 },
];

const stars = [
  ["left-[8%] top-[18%]", 0.2, "h-1 w-1"],
  ["left-[16%] top-[76%]", 0.9, "h-1.5 w-1.5"],
  ["left-[31%] top-[11%]", 1.4, "h-1 w-1"],
  ["left-[40%] top-[79%]", 0.5, "h-1 w-1"],
  ["left-[59%] top-[12%]", 1.1, "h-1.5 w-1.5"],
  ["left-[69%] top-[82%]", 1.7, "h-1 w-1"],
  ["left-[84%] top-[15%]", 0.7, "h-1 w-1"],
  ["left-[91%] top-[73%]", 1.9, "h-1.5 w-1.5"],
] as const;

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

  const isLight = mode === "light";

  return (
    <main
      className={`fixed inset-0 z-[9999] overflow-hidden ${
        isLight ? "bg-[#fafbff] text-slate-950" : "bg-[#03050b] text-white"
      }`}
      role="status"
      aria-live="polite"
      aria-label={`${copy.title} loading`}
    >
      <div
        className={`pointer-events-none absolute inset-0 ${
          isLight
            ? "bg-[radial-gradient(circle_at_50%_46%,rgba(139,92,246,0.09),transparent_30%),radial-gradient(circle_at_14%_18%,rgba(56,189,248,0.08),transparent_24%),radial-gradient(circle_at_86%_78%,rgba(244,114,182,0.07),transparent_24%)]"
            : "bg-[radial-gradient(circle_at_50%_46%,rgba(124,58,237,0.13),transparent_31%),radial-gradient(circle_at_14%_18%,rgba(56,189,248,0.075),transparent_24%),radial-gradient(circle_at_86%_78%,rgba(236,72,153,0.065),transparent_24%)]"
        }`}
      />

      <div
        className={`pointer-events-none absolute inset-0 opacity-[0.22] ${
          isLight
            ? "bg-[linear-gradient(rgba(99,102,241,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.035)_1px,transparent_1px)]"
            : "bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]"
        } bg-[size:96px_96px] [mask-image:radial-gradient(circle_at_center,black,transparent_72%)]`}
      />

      {stars.map(([position, delay, size]) => (
        <motion.span
          key={`${position}-${delay}`}
          className={`pointer-events-none absolute rounded-full ${size} ${
            isLight
              ? "bg-violet-400/55 shadow-[0_0_18px_rgba(139,92,246,0.28)]"
              : "bg-white/60 shadow-[0_0_18px_rgba(255,255,255,0.42)]"
          } ${position}`}
          animate={{ opacity: [0.12, 0.75, 0.12], scale: [0.7, 1.15, 0.7] }}
          transition={{ duration: 3.2, delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <section className="relative mx-auto flex h-full w-full max-w-[1180px] items-center justify-center px-6">
        <div className="absolute left-1/2 top-[18%] h-[38%] w-[86%] -translate-x-1/2 sm:top-[17%] sm:h-[42%] sm:w-[82%]">
          <svg
            viewBox="0 0 1000 360"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            aria-hidden="true"
          >
            <motion.path
              d="M65 270 C175 110 280 80 500 55 C720 80 825 110 935 270"
              fill="none"
              stroke={isLight ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.085)"}
              strokeWidth="1.3"
              strokeDasharray="5 11"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.45, ease: "easeInOut" }}
            />
            <motion.path
              d="M65 270 C250 315 750 315 935 270"
              fill="none"
              stroke={isLight ? "rgba(14,165,233,0.11)" : "rgba(125,211,252,0.07)"}
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.7, delay: 0.15, ease: "easeInOut" }}
            />
          </svg>

          {versePoints.map(({ label, Icon, position, delay }, index) => (
            <motion.div
              key={label}
              className={`absolute flex flex-col items-center gap-2 ${position}`}
              initial={{ opacity: 0, y: 8, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.55, delay: 0.18 + delay, ease: "easeOut" }}
            >
              <motion.div
                className={`relative flex h-11 w-11 items-center justify-center rounded-2xl border backdrop-blur-md sm:h-12 sm:w-12 ${
                  isLight
                    ? "border-white/90 bg-white/72 text-violet-500 shadow-[0_10px_35px_rgba(76,29,149,0.08)]"
                    : "border-white/10 bg-white/[0.035] text-white/62 shadow-[0_12px_40px_rgba(0,0,0,0.2)]"
                }`}
                animate={{
                  opacity: [0.72, 1, 0.72],
                  boxShadow: isLight
                    ? [
                        "0 10px 35px rgba(76,29,149,0.06)",
                        "0 10px 42px rgba(139,92,246,0.14)",
                        "0 10px 35px rgba(76,29,149,0.06)",
                      ]
                    : [
                        "0 12px 40px rgba(0,0,0,0.18)",
                        "0 12px 48px rgba(124,58,237,0.14)",
                        "0 12px 40px rgba(0,0,0,0.18)",
                      ],
                }}
                transition={{ duration: 2.8, delay: index * 0.22, repeat: Infinity, ease: "easeInOut" }}
              >
                <Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={1.6} />
                <motion.span
                  className="absolute inset-0 rounded-2xl border border-violet-400/0"
                  animate={{ scale: [1, 1.45], opacity: [0.28, 0] }}
                  transition={{ duration: 2.6, delay: index * 0.25, repeat: Infinity, ease: "easeOut" }}
                />
              </motion.div>

              <span
                className={`hidden text-[8px] font-bold tracking-[0.22em] sm:block ${
                  isLight ? "text-slate-400" : "text-white/24"
                }`}
              >
                {label}
              </span>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="relative z-10 mt-[14vh] flex w-full max-w-[520px] flex-col items-center text-center sm:mt-[16vh]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.22, ease: "easeOut" }}
        >
          <div className="mb-5 flex items-center gap-3">
            <span
              className={`h-px w-8 ${isLight ? "bg-violet-300/70" : "bg-white/14"}`}
            />
            <p
              className={`text-[9px] font-black uppercase tracking-[0.42em] ${
                isLight ? "text-violet-500/75" : "text-violet-300/56"
              }`}
            >
              Drawing Verse
            </p>
            <span
              className={`h-px w-8 ${isLight ? "bg-violet-300/70" : "bg-white/14"}`}
            />
          </div>

          <h1 className="text-[28px] font-black tracking-[-0.045em] sm:text-[34px]">
            {copy.title}
          </h1>

          <p
            className={`mt-3 max-w-[360px] text-[13px] leading-6 ${
              isLight ? "text-slate-500" : "text-white/43"
            }`}
          >
            {copy.subtitle}
          </p>

          <div className="mt-9 w-full max-w-[300px]">
            <div
              className={`mb-3 flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.18em] ${
                isLight ? "text-slate-400" : "text-white/26"
              }`}
            >
              <span>{copy.progressLabel}</span>
              <span>{normalizeProgress(progress).toString().padStart(2, "0")}%</span>
            </div>

            <div
              className={`relative h-px overflow-visible ${
                isLight ? "bg-slate-200" : "bg-white/[0.08]"
              }`}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={normalizeProgress(progress)}
            >
              <motion.div
                className={`absolute inset-y-0 left-0 ${
                  isLight
                    ? "bg-gradient-to-r from-violet-500 via-fuchsia-400 to-sky-400"
                    : "bg-gradient-to-r from-violet-400 via-fuchsia-300 to-sky-300"
                }`}
                initial={{ width: "0%" }}
                animate={{ width: `${normalizeProgress(progress)}%` }}
                transition={{ duration: 0.32, ease: "easeOut" }}
              >
                <span className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-white shadow-[0_0_16px_rgba(139,92,246,0.8)]" />
              </motion.div>
            </div>
          </div>

          <div
            className={`mt-5 h-5 overflow-hidden text-[10px] font-medium ${
              isLight ? "text-slate-400" : "text-white/28"
            }`}
          >
            <motion.div
              animate={{ y: [0, -20, -40, 0] }}
              transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut" }}
            >
              {copy.lines.map((line) => (
                <p key={line} className="h-5">
                  {line}
                </p>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      <div
        className={`pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-semibold uppercase tracking-[0.34em] ${
          isLight ? "text-slate-300" : "text-white/12"
        }`}
      >
        connecting creative worlds
      </div>
    </main>
  );
}
