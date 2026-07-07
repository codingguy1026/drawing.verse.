"use client";

import { useWeatherStore } from "@/store/useWeatherStore";
import { useTheme } from "@/lib/ThemeProvider";
import { useEffect, useState } from "react";

export default function CosmicBackground() {
  const { weather } = useWeatherStore();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const getBackgroundGradient = () => {
    switch (weather) {
      case 'sunny':
        return theme === 'dark' 
          ? "bg-[linear-gradient(180deg,#2a1810_0%,#3d1e10_24%,#4a2612_56%,#241208_100%)]" 
          : "bg-[linear-gradient(180deg,#fffaf0_0%,#fff5e6_24%,#ffedd6_56%,#ffe4c4_100%)]";
      case 'rainy':
        return theme === 'dark'
          ? "bg-[linear-gradient(180deg,#0a1118_0%,#121c26_24%,#1a2a38_56%,#0d151c_100%)]"
          : "bg-[linear-gradient(180deg,#e2e8f0_0%,#cbd5e1_24%,#94a3b8_56%,#64748b_100%)]";
      case 'cloudy':
        return theme === 'dark'
          ? "bg-[linear-gradient(180deg,#1e293b_0%,#334155_24%,#475569_56%,#0f172a_100%)]"
          : "bg-[linear-gradient(180deg,#f1f5f9_0%,#e2e8f0_24%,#cbd5e1_56%,#f8fafc_100%)]";
      case 'snowy':
        return theme === 'dark'
          ? "bg-[linear-gradient(180deg,#0f172a_0%,#1e293b_24%,#334155_56%,#020617_100%)]"
          : "bg-[linear-gradient(180deg,#f8fafc_0%,#f1f5f9_24%,#e2e8f0_56%,#ffffff_100%)]";
      case 'night':
        return "bg-[linear-gradient(180deg,#000000_0%,#05050a_24%,#0a0a14_56%,#000000_100%)]";
      case 'deep_space':
      default:
        return theme === 'dark'
          ? "bg-[linear-gradient(180deg,#0a061e_0%,#0f0a2a_24%,#130f30_56%,#000000_100%)]"
          : "bg-[linear-gradient(180deg,#f8f6ff_0%,#f6f2ff_24%,#f5f8ff_56%,#fdfcff_100%)]";
    }
  };

  const getBlobs = () => {
    switch (weather) {
      case 'sunny':
        return (
          <>
            <div className="absolute -left-28 top-[-60px] h-[340px] w-[340px] rounded-full bg-orange-200/50 dark:bg-orange-700/30 blur-3xl transition-colors duration-1000" />
            <div className="absolute right-[-60px] top-[-20px] h-[300px] w-[300px] rounded-full bg-yellow-200/40 dark:bg-yellow-700/20 blur-3xl transition-colors duration-1000" />
            <div className="absolute left-[34%] top-[40px] h-[220px] w-[220px] rounded-full bg-amber-200/30 dark:bg-amber-700/20 blur-3xl transition-colors duration-1000" />
          </>
        );
      case 'rainy':
      case 'cloudy':
        return (
          <>
            <div className="absolute -left-28 top-[-60px] h-[400px] w-[400px] rounded-full bg-slate-300/40 dark:bg-slate-800/30 blur-3xl transition-colors duration-1000" />
            <div className="absolute right-[-60px] top-[-20px] h-[350px] w-[350px] rounded-full bg-gray-300/40 dark:bg-gray-800/30 blur-3xl transition-colors duration-1000" />
            <div className="absolute left-[20%] top-[300px] h-[400px] w-[500px] rounded-full bg-slate-400/20 dark:bg-slate-700/20 blur-[100px] transition-colors duration-1000" />
          </>
        );
      case 'snowy':
        return (
          <>
            <div className="absolute -left-28 top-[-60px] h-[340px] w-[340px] rounded-full bg-blue-100/50 dark:bg-blue-900/30 blur-3xl transition-colors duration-1000" />
            <div className="absolute right-[-60px] top-[-20px] h-[300px] w-[300px] rounded-full bg-indigo-100/40 dark:bg-indigo-900/20 blur-3xl transition-colors duration-1000" />
          </>
        );
      case 'night':
        return (
          <>
            <div className="absolute -left-28 top-[-60px] h-[340px] w-[340px] rounded-full bg-purple-900/10 blur-3xl transition-colors duration-1000" />
            <div className="absolute right-[-60px] top-[-20px] h-[300px] w-[300px] rounded-full bg-blue-900/10 blur-3xl transition-colors duration-1000" />
          </>
        );
      case 'deep_space':
      default:
        return (
          <>
            <div className="absolute -left-28 top-[-60px] h-[340px] w-[340px] rounded-full bg-pink-200/40 dark:bg-pink-700/20 blur-3xl transition-colors duration-1000" />
            <div className="absolute right-[-60px] top-[-20px] h-[300px] w-[300px] rounded-full bg-sky-200/32 dark:bg-sky-700/20 blur-3xl transition-colors duration-1000" />
            <div className="absolute left-[34%] top-[40px] h-[220px] w-[220px] rounded-full bg-violet-200/22 dark:bg-violet-700/15 blur-3xl transition-colors duration-1000" />
            <div className="absolute left-[20%] top-[520px] h-[320px] w-[320px] rounded-full bg-violet-200/30 dark:bg-violet-700/20 blur-3xl transition-colors duration-1000" />
            <div className="absolute right-[10%] top-[540px] h-[340px] w-[340px] rounded-full bg-fuchsia-200/24 dark:bg-fuchsia-700/15 blur-3xl transition-colors duration-1000" />
            <div className="absolute right-[10%] top-[900px] h-[360px] w-[360px] rounded-full bg-fuchsia-200/24 dark:bg-fuchsia-700/15 blur-3xl transition-colors duration-1000" />
            <div className="absolute left-[-120px] bottom-[-180px] h-[420px] w-[420px] rounded-full bg-sky-100/40 dark:bg-sky-800/20 blur-3xl transition-colors duration-1000" />
          </>
        );
    }
  };

  return (
    <>
      <div className={`fixed inset-0 -z-20 transition-colors duration-1000 ${getBackgroundGradient()}`} />

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {getBlobs()}

        {/* Rain Effect */}
        {weather === 'rainy' && (
          <div className="absolute inset-0 opacity-40 dark:opacity-30 mix-blend-overlay" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cline x1='10' y1='-10' x2='-10' y2='10' stroke='%23ffffff' stroke-width='1' opacity='0.5' /%3E%3Cline x1='50' y1='30' x2='30' y2='50' stroke='%23ffffff' stroke-width='1' opacity='0.3' /%3E%3Cline x1='90' y1='70' x2='70' y2='90' stroke='%23ffffff' stroke-width='1' opacity='0.4' /%3E%3C/svg%3E")`,
            backgroundSize: '100px 100px',
            animation: 'rain-fall 0.5s linear infinite',
          }} />
        )}

        {/* Snow Effect */}
        {weather === 'snowy' && (
          <div className="absolute inset-0 opacity-50 dark:opacity-40" style={{
            backgroundImage: `radial-gradient(circle at center, #ffffff 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            backgroundPosition: '0 0, 25px 25px',
            animation: 'snow-fall 3s linear infinite',
          }} />
        )}

        {/* Dynamic Starfield/Grid Overlays (only in deep_space or night) */}
        {(weather === 'deep_space' || weather === 'night') && (
          <>
            {/* Light Mode Grid */}
            <div
              className="absolute inset-0 opacity-[0.03] dark:opacity-0 transition-opacity duration-1000"
              style={{ backgroundImage: "radial-gradient(#475569 1px, transparent 1px)", backgroundSize: "32px 32px" }}
            />
            <div
              className="absolute inset-0 opacity-[0.02] dark:opacity-0 transition-opacity duration-1000"
              style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, #1e293b 1px, transparent 0)",
                backgroundSize: "40px 40px",
                maskImage: "linear-gradient(to bottom, black 40%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, black 40%, transparent 100%)",
              }}
            />

            {/* Dark Mode Grid/Stars */}
            <div
              className="absolute inset-0 opacity-0 dark:opacity-[0.15] transition-opacity duration-1000"
              style={{ backgroundImage: "radial-gradient(white 1px, transparent 1px)", backgroundSize: "32px 32px" }}
            />
            <div
              className="absolute inset-0 opacity-0 dark:opacity-[0.06] transition-opacity duration-1000"
              style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "40px 40px",
                maskImage: "linear-gradient(to bottom, black 40%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, black 40%, transparent 100%)",
              }}
            />
          </>
        )}
      </div>

      <style jsx global>{`
        @keyframes rain-fall {
          0% { background-position: 0 0; }
          100% { background-position: -100px 100px; }
        }
        @keyframes snow-fall {
          0% { background-position: 0px 0px, 25px 25px; }
          100% { background-position: 50px 500px, 75px 525px; }
        }
      `}</style>
    </>
  );
}
