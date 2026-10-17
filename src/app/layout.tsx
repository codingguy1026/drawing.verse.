import Script from "next/script";
import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_KR } from "next/font/google";
import "./tailwind.css";
import "./globals.css";
import "./dverse-brand.css";
import "./dverse-pages.css";
import "./dverse-studio.css";
import "./liquid-refraction.css";

import { ThemeProvider } from "@/lib/ThemeProvider";
import GlobalRouteLoader from "@/components/Common/GlobalRouteLoader";
import PageAnimatePresence from "@/components/Common/PageAnimatePresence";
import { FramerMotionProvider } from "@/components/Providers/FramerMotionProvider";
import AchievementToast from "@/components/Achievements/AchievementToast";
import ProfileAchievementsMount from "@/components/Achievements/ProfileAchievementsMount";
import NotificationCenter from "@/components/Notifications/NotificationCenter";
import WeatherAtmosphereSync from "@/components/themes/WeatherAtmosphereSync";

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
        className="min-h-screen overflow-x-hidden bg-slate-50 font-sans text-slate-900 selection:bg-violet-500/30 transition-colors duration-300 dark:bg-[#03050a] dark:text-white"
      >
        <a href="#dv-main-content" className="dv-skip-link">본문으로 바로가기</a>
        <FramerMotionProvider>
          <ThemeProvider>
            <WeatherAtmosphereSync />
            <NotificationCenter />
            <AchievementToast />

            <Suspense fallback={null}>
              <GlobalRouteLoader />
            </Suspense>

            <PageAnimatePresence>
              {children}
            </PageAnimatePresence>

            <ProfileAchievementsMount />
          </ThemeProvider>
        </FramerMotionProvider>
        <Script src="/liquid-refraction.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
