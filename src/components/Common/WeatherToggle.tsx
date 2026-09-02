"use client";

import {
  useWeatherStore,
  type WeatherState,
} from "@/store/useWeatherStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  CloudRain,
  Sun,
  Cloud,
  Snowflake,
  Moon,
  Sparkles,
  LocateFixed,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { squishyVariants } from "@/lib/animations";

const weatherOptions: { value: WeatherState; label: string; icon: React.ElementType }[] = [
  { value: "deep_space", label: "Deep Space", icon: Sparkles },
  { value: "sunny", label: "Sunny", icon: Sun },
  { value: "cloudy", label: "Cloudy", icon: Cloud },
  { value: "rainy", label: "Rainy", icon: CloudRain },
  { value: "snowy", label: "Snowy", icon: Snowflake },
  { value: "night", label: "Night", icon: Moon },
];

const statusCopy = {
  idle: "위치 확인 대기",
  locating: "현재 지역 확인 중",
  syncing: "기상청 연결 중",
  ready: "기상청 동기화됨",
  denied: "위치 권한이 필요해요",
  unavailable: "현재 위치를 확인할 수 없어요",
  error: "날씨를 불러오지 못했어요",
} as const;

export default function WeatherToggle() {
  const { weather, mode, status, meta, setWeather, setMode } = useWeatherStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const CurrentIcon = weatherOptions.find((option) => option.value === weather)?.icon || Sparkles;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const temperature =
    mode === "auto" && typeof meta.temperature === "number"
      ? `${Math.round(meta.temperature)}°`
      : null;

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        variants={squishyVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={() => setIsOpen(!isOpen)}
        className="relative grid h-11 w-11 place-items-center rounded-2xl border border-slate-200/80 bg-white/50 text-slate-600 transition hover:bg-white hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/70 dark:hover:bg-white/12 dark:hover:text-white"
        aria-label="Verse Atmosphere"
        title={mode === "auto" ? `기상청 자동 · ${statusCopy[status]}` : "Verse Atmosphere 수동"}
      >
        <CurrentIcon size={18} />
        {mode === "auto" && (
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)] dark:border-[#11131b]" />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-[calc(100%+8px)] z-[9999] min-w-[220px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.25)] dark:border-white/20 dark:bg-[#0f111a] dark:shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
            style={{ isolation: "isolate", transform: "translateZ(1000px)" }}
          >
            <div className="px-2.5 pb-2 pt-2">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-500 dark:text-violet-300">
                Verse Atmosphere
              </div>
              <p className="mt-1 text-[11px] leading-4 text-slate-400 dark:text-white/35">
                바깥의 하늘을 Drawing Verse에 연결해요.
              </p>
            </div>

            <button
              onClick={() => {
                setMode("auto");
                setIsOpen(false);
              }}
              className={`mb-1 flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition-colors ${
                mode === "auto"
                  ? "bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-100"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
              }`}
            >
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/70 shadow-sm dark:bg-white/[0.07]">
                <LocateFixed size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold">기상청 자동</span>
                  {temperature && <span className="text-xs font-black">{temperature}</span>}
                </div>
                <div className="mt-0.5 truncate text-[10px] opacity-65">
                  {statusCopy[status]}
                </div>
              </div>
            </button>

            <div className="my-1 h-px bg-slate-100 dark:bg-white/[0.07]" />
            <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-white/25">
              Manual preview
            </div>

            {weatherOptions.map((option) => {
              const Icon = option.icon;
              const isActive = mode === "manual" && weather === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => {
                    setWeather(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-violet-100 text-violet-700 dark:bg-white/20 dark:text-white"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                  }`}
                >
                  <Icon size={16} />
                  {option.label}
                </button>
              );
            })}

            <div className="mt-1 border-t border-slate-100 px-2.5 py-2 text-[9px] leading-4 text-slate-400 dark:border-white/[0.07] dark:text-white/25">
              날씨 데이터: 기상청 단기예보 조회서비스
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
