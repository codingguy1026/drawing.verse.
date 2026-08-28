"use client";

import { motion } from "framer-motion";
import DguyMascot from "@/components/DguyMascot";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f8fc] text-slate-950 dark:bg-[#03050a] dark:text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-400/15 blur-[130px] dark:bg-violet-500/15" />
        <div className="absolute left-[30%] top-[35%] h-52 w-52 rounded-full bg-sky-300/10 blur-[100px]" />
        <div className="absolute right-[28%] top-[45%] h-52 w-52 rounded-full bg-fuchsia-300/10 blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <motion.span
          className="absolute -left-10 top-10 text-xl text-violet-400"
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.25, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ✦
        </motion.span>

        <motion.span
          className="absolute -right-12 top-20 text-lg text-sky-400"
          animate={{ opacity: [0.2, 1, 0.2], rotate: [0, 180, 360] }}
          transition={{ duration: 3.5, repeat: Infinity }}
        >
          ✧
        </motion.span>

        <motion.span
          className="absolute right-0 top-0 text-[9px] text-fuchsia-400"
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        >
          ●
        </motion.span>

        <DguyMascot size={195} />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-5 text-center"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.32em] text-violet-500">
            Drawing Verse
          </p>

          <h2 className="mt-3 text-xl font-black tracking-tight">
            우주를 연결하는 중
            <LoadingDots />
          </h2>

          <p className="mt-2 text-xs font-medium text-slate-400">
            드가이가 Verse의 별들을 모으고 있어요.
          </p>
        </motion.div>

        <div className="mt-7 h-1 w-44 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
          <motion.div
            className="h-full w-16 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-400 to-sky-400"
            animate={{ x: [-70, 190] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  );
}

function LoadingDots() {
  return (
    <span className="ml-0.5 inline-flex w-6">
      <motion.span
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        .
      </motion.span>
      <motion.span
        animate={{ opacity: [0, 0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        .
      </motion.span>
      <motion.span
        animate={{ opacity: [0, 0, 0, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        .
      </motion.span>
    </span>
  );
}
