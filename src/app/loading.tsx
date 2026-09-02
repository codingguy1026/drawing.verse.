"use client";

import { motion } from "framer-motion";
import {
  Home,
  MessageCircle,
  Users,
  Play,
  Sparkles,
} from "lucide-react";

const icons = [
  Home,
  MessageCircle,
  Users,
  Play,
  Sparkles,
];

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#f8f9fc] dark:bg-[#03050a]">
      {/* 아주 약한 중앙 광원 */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-400/[0.06] blur-[150px] dark:bg-violet-500/[0.05]" />

      <div className="relative flex flex-col items-center">
        {/* Icons */}
        <div className="flex items-center gap-8 sm:gap-11">
          {icons.map((Icon, index) => (
            <motion.div
              key={index}
              initial={{
                opacity: 0,
                y: 8,
                scale: 0.96,
              }}
              animate={{
                opacity: [0, 1, 1, 0.45, 1],
                y: [8, 0, 0, 0, 0],
                scale: [0.96, 1, 1, 1, 1],
              }}
              transition={{
                duration: 2.8,
                delay: index * 0.16,
                repeat: Infinity,
                repeatDelay: 0.5,
                ease: "easeOut",
              }}
              className="relative"
            >
              <motion.div
                animate={{
                  opacity: [0, 0.18, 0],
                  scale: [0.8, 1.4, 1.6],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.16,
                }}
                className="absolute inset-0 rounded-full bg-violet-400 blur-xl"
              />

              <Icon
                strokeWidth={1.7}
                className="relative h-6 w-6 text-slate-400 dark:text-white/45"
              />
            </motion.div>
          ))}
        </div>

        {/* Brand */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mt-12 text-center"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.42em] text-violet-500">
            Drawing Verse
          </p>

          <h2 className="mt-4 text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            새로운 우주를 여는 중
            <LoadingDots />
          </h2>

          <p className="mt-2 text-[11px] font-medium text-slate-400 dark:text-white/25">
            잠시만 기다려 주세요
          </p>
        </motion.div>

        {/* 미니 progress */}
        <div className="relative mt-8 h-[2px] w-36 overflow-hidden bg-slate-200 dark:bg-white/[0.08]">
          <motion.div
            className="absolute h-full w-10 bg-violet-500"
            animate={{
              x: [-45, 150],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </div>
    </div>
  );
}

function LoadingDots() {
  return (
    <span className="ml-1 inline-flex">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        >
          .
        </motion.span>
      ))}
    </span>
  );
}