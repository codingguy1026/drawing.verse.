"use client";

import { useEffect, useState } from "react";
import {
  LOADING_PRESETS,
  LoadingScreen,
  normalizeProgress,
} from "@/components/Common/LoadingOverlay";

export default function Loading() {
  const [progress, setProgress] = useState(18);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 94) return 94;

        const nextStep = current < 60 ? 8 : current < 82 ? 4 : 2;
        return normalizeProgress(current + nextStep);
      });
    }, 140);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <LoadingScreen
      copy={LOADING_PRESETS.default}
      progress={progress}
    />
  );
}
