"use client";

import { motion } from "framer-motion";
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

  // Keep the shared navigation mounted while the page content changes.
  // Keying the entire shell remounted the sidebar on every route transition.
  return (
    <motion.div
      data-route={pathname}
      initial="initial"
      animate="animate"
      variants={pageTransitionVariants}
      className={`dv-site-shell min-h-screen w-full${isHome ? "" : " dv-subpage-theme"}`}
    >
      <DVSubpageFrame>{children}</DVSubpageFrame>
    </motion.div>
  );
}
