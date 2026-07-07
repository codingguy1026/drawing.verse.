"use client";

import { useWeatherStore, WeatherState } from "@/store/useWeatherStore";
import { motion, AnimatePresence } from "framer-motion";
import { CloudRain, Sun, Cloud, Snowflake, Moon, Sparkles } from "lucide-react";
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

export default function WeatherToggle() {
  const { weather, setWeather } = useWeatherStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const CurrentIcon = weatherOptions.find(o => o.value === weather)?.icon || Sparkles;

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        variants={squishyVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={() => setIsOpen(!isOpen)}
        className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200/80 bg-white/50 text-slate-600 transition hover:bg-white hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/70 dark:hover:bg-white/12 dark:hover:text-white"
        aria-label="Toggle Weather"
      >
        <CurrentIcon size={18} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-[calc(100%+8px)] z-[9999] min-w-[140px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.25)] dark:border-white/20 dark:bg-[#0f111a] dark:shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
            style={{ isolation: "isolate", transform: "translateZ(1000px)" }}
          >
            <div className="mb-1 px-2 py-1.5 text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
              Weather UI
            </div>
            {weatherOptions.map((option) => {
              const Icon = option.icon;
              const isActive = weather === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    setWeather(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-semibold transition-colors ${isActive
                      ? "bg-violet-100 text-violet-700 dark:bg-white/20 dark:text-white"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                    }`}
                >
                  <Icon size={16} />
                  {option.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
