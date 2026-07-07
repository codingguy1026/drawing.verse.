import type { Metadata } from "next";
import UniverseClient from "./universe-client";

export const metadata: Metadata = {
  title: "Universe | Drawing Verse 유니버스 탐색",
  description: "다양한 오리지널 세계관과 팬아트 유니버스를 탐색하고 나만의 공간을 만들어보세요.",
};

export default function Page() {
  return <UniverseClient />;
}
