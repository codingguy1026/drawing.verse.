import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import MissionControlLab from "./MissionControlLab";
import "./mission-control.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--mc-font-display",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--mc-font-mono",
});

export const metadata: Metadata = {
  title: "Mission Control Lab | Drawing Verse",
  description: "Drawing Verse 관제센터 디자인 시스템 실험실",
};

export default function MissionControlPage() {
  return (
    <div className={[display.variable, mono.variable].join(" ")}>
      <MissionControlLab />
    </div>
  );
}
