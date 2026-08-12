import type { Metadata } from "next";
import HomeClient from "./home-client";

export const metadata: Metadata = {
  title: "Drawing Verse | 관심사가 이어지는 우주",
  description: "관심사별 유니버스에서 글을 나누고, 같은 관심사를 가진 사람들과 자유롭게 소통하세요.",
  keywords: ["커뮤니티", "유니버스", "소통", "관심사", "게시판", "Drawing Verse"],
  openGraph: {
    title: "Drawing Verse | 관심사가 이어지는 우주",
    description: "관심사별 유니버스에서 사람들이 만나 이야기하는 커뮤니티 Drawing Verse",
    type: "website",
    siteName: "Drawing Verse",
  },
};

export default function Page() {
  return <HomeClient />;
}
