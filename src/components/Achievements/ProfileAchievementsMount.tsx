"use client";

import { usePathname } from "next/navigation";
import AchievementsPanel from "./AchievementsPanel";

export default function ProfileAchievementsMount() {
  const pathname = usePathname();
  if (pathname !== "/me") return null;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
      <AchievementsPanel />
    </div>
  );
}
