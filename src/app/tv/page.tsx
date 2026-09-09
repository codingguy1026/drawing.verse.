import type { Metadata } from "next";
import DrawingTVClient from "./drawing-tv-client";

export const metadata: Metadata = {
  title: "드티비 | Drawing Verse",
  description:
    "Drawing Verse의 영상과 이야기가 흐르는 창작 영상 우주, 드티비입니다.",
};

export default function DrawingTVPage() {
  return <DrawingTVClient />;
}
