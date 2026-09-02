"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/lib/ThemeProvider";
import { useWeatherStore } from "@/store/useWeatherStore";

export default function CosmicBackground() {
  const { weather } = useWeatherStore();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  const background = (() => {
    switch (weather) {
      case "sunny":
        return isDark
          ? "bg-[linear-gradient(180deg,#21130d_0%,#32180d_30%,#20120d_72%,#08070a_100%)]"
          : "bg-[linear-gradient(180deg,#fffdf7_0%,#fff6e8_32%,#fff0da_66%,#f8f6ff_100%)]";
      case "rainy":
        return isDark
          ? "bg-[linear-gradient(180deg,#071019_0%,#0d1824_36%,#111d2a_70%,#05070d_100%)]"
          : "bg-[linear-gradient(180deg,#edf3f8_0%,#dfe8f0_38%,#d2dde7_72%,#f4f5fb_100%)]";
      case "cloudy":
        return isDark
          ? "bg-[linear-gradient(180deg,#10151e_0%,#182230_38%,#141b26_72%,#07090e_100%)]"
          : "bg-[linear-gradient(180deg,#f6f8fb_0%,#e9eef4_42%,#e1e7ee_72%,#faf9fd_100%)]";
      case "snowy":
        return isDark
          ? "bg-[linear-gradient(180deg,#09111f_0%,#101d31_38%,#17243a_70%,#060911_100%)]"
          : "bg-[linear-gradient(180deg,#fbfdff_0%,#eef6ff_38%,#e5eef8_72%,#ffffff_100%)]";
      case "night":
        return "bg-[linear-gradient(180deg,#02030a_0%,#070b19_38%,#090d20_68%,#020207_100%)]";
      case "deep_space":
      default:
        return isDark
          ? "bg-[linear-gradient(180deg,#0a061e_0%,#0f0a2a_28%,#130f30_60%,#000000_100%)]"
          : "bg-[linear-gradient(180deg,#f8f6ff_0%,#f6f2ff_28%,#f5f8ff_60%,#fdfcff_100%)]";
    }
  })();

  const atmosphere = (() => {
    switch (weather) {
      case "sunny":
        return (
          <>
            <div className="absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-amber-200/40 blur-[100px] dark:bg-orange-700/18" />
            <div className="absolute right-[-100px] top-[8%] h-[360px] w-[360px] rounded-full bg-yellow-200/32 blur-[110px] dark:bg-amber-700/12" />
            <div className="absolute left-[34%] top-[35%] h-[320px] w-[420px] rounded-full bg-orange-100/20 blur-[130px] dark:bg-orange-500/[0.06]" />
          </>
        );
      case "rainy":
        return (
          <>
            <div className="absolute -left-32 -top-20 h-[460px] w-[520px] rounded-full bg-slate-400/24 blur-[120px] dark:bg-slate-700/20" />
            <div className="absolute right-[-80px] top-[16%] h-[420px] w-[500px] rounded-full bg-sky-300/15 blur-[130px] dark:bg-sky-900/14" />
            <div
              className="absolute inset-0 opacity-25 dark:opacity-20"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(115deg, transparent 0px, transparent 17px, rgba(255,255,255,.55) 18px, transparent 19px, transparent 46px)",
                backgroundSize: "140px 140px",
                animation: "verse-rain 1.15s linear infinite",
              }}
            />
          </>
        );
      case "cloudy":
        return (
          <>
            <div className="absolute -left-32 top-[2%] h-[420px] w-[560px] rounded-full bg-slate-300/34 blur-[125px] dark:bg-slate-700/18" />
            <div className="absolute right-[-120px] top-[18%] h-[460px] w-[620px] rounded-full bg-gray-300/25 blur-[140px] dark:bg-gray-700/16" />
            <div className="absolute left-[18%] top-[58%] h-[360px] w-[650px] rounded-full bg-slate-300/14 blur-[150px] dark:bg-slate-600/[0.08]" />
          </>
        );
      case "snowy":
        return (
          <>
            <div className="absolute -left-24 -top-16 h-[420px] w-[440px] rounded-full bg-sky-100/45 blur-[110px] dark:bg-blue-900/18" />
            <div className="absolute right-[-80px] top-[12%] h-[380px] w-[420px] rounded-full bg-indigo-100/34 blur-[120px] dark:bg-indigo-900/14" />
            <div
              className="absolute inset-0 opacity-50 dark:opacity-35"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,.95) 0 1.2px, transparent 1.5px), radial-gradient(circle, rgba(255,255,255,.75) 0 1px, transparent 1.3px)",
                backgroundSize: "74px 74px, 108px 108px",
                backgroundPosition: "0 0, 34px 18px",
                animation: "verse-snow 8s linear infinite",
              }}
            />
          </>
        );
      case "night":
        return (
          <>
            <div className="absolute left-[8%] top-[6%] h-[320px] w-[320px] rounded-full bg-indigo-700/[0.08] blur-[110px]" />
            <div className="absolute right-[4%] top-[34%] h-[400px] w-[400px] rounded-full bg-violet-800/[0.08] blur-[130px]" />
          </>
        );
      case "deep_space":
      default:
        return (
          <>
            <div className="absolute -left-28 top-[-60px] h-[340px] w-[340px] rounded-full bg-pink-200/40 blur-3xl dark:bg-pink-700/20" />
            <div className="absolute right-[-60px] top-[-20px] h-[300px] w-[300px] rounded-full bg-sky-200/32 blur-3xl dark:bg-sky-700/20" />
            <div className="absolute left-[30%] top-[36%] h-[360px] w-[420px] rounded-full bg-violet-200/20 blur-[130px] dark:bg-violet-700/12" />
          </>
        );
    }
  })();

  const showStars = weather === "deep_space" || weather === "night";

  return (
    <>
      <div className={`fixed inset-0 -z-20 transition-colors duration-[1600ms] ${background}`} />

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden transition-opacity duration-1000">
        {atmosphere}

        {showStars && (
          <>
            <div
              className="absolute inset-0 opacity-[0.035] dark:opacity-[0.14]"
              style={{
                backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
                backgroundSize: "38px 38px",
              }}
            />
            <div
              className="absolute inset-0 opacity-[0.02] dark:opacity-[0.06]"
              style={{
                backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
                backgroundSize: "71px 71px",
                backgroundPosition: "21px 17px",
                maskImage: "linear-gradient(to bottom, black 10%, transparent 90%)",
                WebkitMaskImage: "linear-gradient(to bottom, black 10%, transparent 90%)",
              }}
            />
          </>
        )}
      </div>

      <style jsx global>{`
        @keyframes verse-rain {
          from { background-position: 0 -140px; }
          to { background-position: -56px 140px; }
        }

        @keyframes verse-snow {
          from { background-position: 0 -120px, 34px -180px; }
          to { background-position: 48px 520px, 4px 620px; }
        }

        @media (prefers-reduced-motion: reduce) {
          [style*="verse-rain"],
          [style*="verse-snow"] {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}
