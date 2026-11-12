import "./cosmic-explorer.css";
import type { Metadata } from "next";
import UniverseClient from "./universe-client";

export const metadata: Metadata = {
  title: "Universe | Drawing Verse 유니버스 탐색",
  description: "야구, 역사, 게임, 창작 등 다양한 주제의 Universe를 탐색하고 새로운 커뮤니티를 만들어보세요.",
};

export default function Page() {
  return <UniverseClient />;
}
