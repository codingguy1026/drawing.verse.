import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import "./dverse-brand.css";

import DVNav from "@/components/Common/DVNav";
import { ThemeProvider } from "@/lib/ThemeProvider";
import GlobalRouteLoader from "@/components/Common/GlobalRouteLoader";
import PageAnimatePresence from "@/components/Common/PageAnimatePresence";
import { FramerMotionProvider } from "@/components/Providers/FramerMotionProvider";
import AchievementToast from "@/components/Achievements/AchievementToast";
import ProfileAchievementsMount from "@/components/Achievements/ProfileAchievementsMount";
import NotificationCenter from "@/components/Notifications/NotificationCenter";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const noto = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-noto",
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  title: "Drawing Verse",
  description: "Create your universe",
};

export const viewport: Viewport = {
  themeColor: "#f8f6ff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ko"
      className={`${inter.variable} ${noto.variable}`}
      suppressHydrationWarning
    >
      <head />

      <body
        suppressHydrationWarning
        className="min-h-screen overflow-x-hidden bg-transparent font-sans text-slate-900 selection:bg-violet-500/30 transition-colors duration-300 dark:bg-[#03050a] dark:text-white"
      >
        <FramerMotionProvider>
          <ThemeProvider>

            {/* ✅ New DV Nav */}
            <DVNav />

            {/* ✅ Notification center */}
            <NotificationCenter />

            {/* ✅ Achievement unlock notification */}
            <AchievementToast />

            {/* ✅ 전역 라우트 이동 감지 */}
            <Suspense fallback={null}>
              <GlobalRouteLoader />
            </Suspense>

            {/* ✅ main children rendering with soft transitions */}
            <PageAnimatePresence>
              <div className="pt-[96px] sm:pt-[104px]">
                {children}
              </div>
            </PageAnimatePresence>

            {/* ✅ /me 프로필의 도전과제 보드 */}
            <ProfileAchievementsMount />
          </ThemeProvider>
        </FramerMotionProvider>
      </body>
    </html>
  );
}
