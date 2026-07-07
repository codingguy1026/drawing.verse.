"use client";

import { LazyMotion, domMax } from "framer-motion";

/**
 * Optimized Framer Motion Provider
 * Uses LazyMotion to reduce initial bundle size by loading motion logic only when needed.
 */
export function FramerMotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domMax}>
      {children}
    </LazyMotion>
  );
}
