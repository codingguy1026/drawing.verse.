"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { motion } from "framer-motion";
import NotificationPanel from "@/components/Notifications/NotificationPanel";

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed right-[76px] top-6 z-[1050] sm:right-[92px] lg:right-[calc((100vw-80rem)/2+22rem)]">
        <motion.button
          type="button"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setOpen((value) => !value)}
          aria-label="알림 열기"
          aria-expanded={open}
          className="relative grid h-11 w-11 place-items-center rounded-2xl border border-slate-200/80 bg-white/70 text-slate-600 shadow-sm backdrop-blur-xl transition hover:bg-white hover:text-slate-900 dark:border-white/10 dark:bg-[#111127]/80 dark:text-white/70 dark:hover:bg-[#171735] dark:hover:text-white"
        >
          <Bell size={18} />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-violet-500 ring-2 ring-white dark:ring-[#111127]" />
        </motion.button>
      </div>

      <NotificationPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
