import type { Metadata } from "next";
import WormholeClient from "./WormholeClient";

export const metadata: Metadata = {
  title: "Wormhole | Drawing Verse",
  description: "서로 다른 유니버스를 연결해 두 세계의 이야기를 한 화면에서 탐색합니다.",
};

export default function WormholePage() {
  return <WormholeClient />;
}
