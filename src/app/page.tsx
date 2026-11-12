import type { Metadata } from "next";
import HomeClient from "./home-client";

export const metadata: Metadata = {
  title: "Drawing Verse | 관심사가 연결되는 커뮤니티",
  description: "관심사별 Universe를 만들고 구독하며, 게시글과 댓글로 소통하는 커뮤니티 Drawing Verse.",
  keywords: ["커뮤니티", "유니버스", "Universe", "게시글", "관심사", "Drawing Verse"],
  openGraph: {
    title: "Drawing Verse | 너만의 우주를 그리다",
    description: "관심사별 Universe에서 함께 이야기하는 Drawing Verse 커뮤니티",
    type: "website",
    siteName: "Drawing Verse",
  },
};

export default function Page() {
  return <HomeClient />;
}
