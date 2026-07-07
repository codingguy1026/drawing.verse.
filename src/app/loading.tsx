"use client";

import { LoadingScreen, LOADING_PRESETS } from "@/components/Common/LoadingOverlay";

/**
 * Next.js standard loading page.
 * This will be shown automatically during route transitions
 * and initial page loads.
 */
export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#f4f2ff] dark:bg-[#050612]">
      <LoadingScreen copy={LOADING_PRESETS.default} progress={0} />
    </div>
  );
}
