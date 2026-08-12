import type { Metadata } from "next";
import UniverseClient from "./universe-client";

export const metadata: Metadata = {
  title: "Universe | Drawing Verse 유니버스 탐색",
  description: "관심사별 유니버스를 탐색하고, 같은 관심사를 가진 사람들과 글과 대화를 나눠보세요.",
};

export default function Page() {
  return <UniverseClient />;
}
