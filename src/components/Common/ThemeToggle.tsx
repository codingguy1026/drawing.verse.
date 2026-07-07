"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/ThemeProvider";
import { squishyVariants } from "@/lib/animations";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  // If theme is not yet loaded (SSR or hydration), return a placeholder or null
  if (theme === null) return <div className="h-11 w-11" />;

  return (
    <motion.button
      variants={squishyVariants}
      whileHover="hover"
      whileTap="tap"
      onClick={toggleTheme}
      className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-2xl border border-slate-200/80 bg-white/50 text-slate-600 transition hover:bg-white hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/70 dark:hover:bg-white/12 dark:hover:text-white"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "dark" ? (
          <motion.div
            key="moon"
            initial={{ y: 20, opacity: 0, rotate: 45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -20, opacity: 0, rotate: -45 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Moon size={18} />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ y: 20, opacity: 0, rotate: 45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -20, opacity: 0, rotate: -45 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Sun size={18} />
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/5 to-transparent opacity-0 transition-opacity hover:opacity-100 dark:from-violet-400/10" />
    </motion.button>
  );
}
