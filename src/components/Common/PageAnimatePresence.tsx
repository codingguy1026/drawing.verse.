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
        className={`dv-site-shell min-h-screen w-full${isHome ? "" : " dv-subpage-theme"}`}
      >
        <DVSubpageFrame>{children}</DVSubpageFrame>
      </motion.div>
    </AnimatePresence>
  );
}
