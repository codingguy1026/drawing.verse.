// src/components/Layout/DreamSection.tsx
import type { ReactNode } from "react";

export function DreamSection({ children }: { children: ReactNode }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_10px_40px_rgba(148,163,184,0.12)] backdrop-blur-2xl transition-colors duration-500 dark:border-white/10 dark:bg-slate-950/60 dark:shadow-[0_0_30px_rgba(15,23,42,0.7)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-violet-200/20 blur-3xl dark:bg-sky-500/15" />
        <div className="absolute -bottom-20 -right-10 h-40 w-40 rounded-full bg-pink-200/20 blur-3xl dark:bg-pink-500/15" />
      </div>
      <div className="relative">{children}</div>
    </section>
  );
}
