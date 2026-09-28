"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { pageTransitionVariants } from "@/lib/animations";
import DVSubpageFrame from "@/components/Common/DVSubpageFrame";

export default function PageAnimatePresence({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        data-route={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransitionVariants}
        className={`w-full min-h-screen${isHome ? "" : " dv-subpage-theme"}`}
      >
        {isHome ? (
          <div className="pt-[88px] sm:pt-[92px]">{children}</div>
        ) : (
          <DVSubpageFrame>{children}</DVSubpageFrame>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
