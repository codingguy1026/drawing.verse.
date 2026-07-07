// src/components/Layout/PageFrame.tsx
import type { ReactNode } from "react";

export function PageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-12 pt-6 space-y-8">
      {children}
    </div>
  );
}
