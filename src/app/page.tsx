import type { Metadata } from "next";
import HomeClient from "./home-client";

export const metadata: Metadata = {
  title: "Drawing Verse | 너만의 우주를 그리다",
  description: "팬아트, 오리지널 세계관, 창작 커뮤니티 Drawing Verse에서 당신의 상상을 현실로 만드세요.",
  keywords: ["그림", "세계관", "커뮤니티", "창작", "팬아트", "유니버스"],
  openGraph: {
    title: "Drawing Verse | 너만의 우주를 그리다",
    description: "팬아트, 오리지널 세계관, 창작 커뮤니티 Drawing Verse",
    type: "website",
    siteName: "Drawing Verse",
  },
};

export default function Page() {
  return <HomeClient />;
}
