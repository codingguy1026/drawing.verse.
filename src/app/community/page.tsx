import type { Metadata } from "next";
import CommunityClient from "./community-client";

export const metadata: Metadata = {
  title: "Verse Talk | Drawing Verse 실시간 랜덤 채팅",
  description: "Drawing Verse의 다른 창작자들과 실시간으로 연결되어 대화해보세요. 익명으로 즐기는 차원 이동 채팅입니다.",
};

export default function Page() {
  return <CommunityClient />;
}
