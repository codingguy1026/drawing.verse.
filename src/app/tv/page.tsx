import type { Metadata } from "next";
import TVClient from "./tv-client";

export const metadata: Metadata = {
  title: "Drawing TV | Drawing Verse",
  description: "Drawing Verse의 영상 공간, Drawing TV에서 창작 영상과 다양한 이야기를 만나보세요.",
};

export default function TVPage() {
  return <TVClient />;
}
