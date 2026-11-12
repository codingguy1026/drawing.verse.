import type { Metadata } from "next";
import GalleryClient from "./gallery-client";

export const metadata: Metadata = {
  title: "Gallery | Drawing Verse 작품 전시관",
  description: "Drawing Verse 창작자들의 일러스트, 스케치, 웹툰, 팬아트를 감상하고 새로운 작품을 발견하는 갤러리입니다.",
};

export default function Page() {
  return <GalleryClient />;
}
