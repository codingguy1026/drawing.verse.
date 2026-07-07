import type { Metadata } from "next";
import GalleryClient from "./gallery-client";

export const metadata: Metadata = {
  title: "Gallery | Drawing Verse 아트워크 갤러리",
  description: "창작자들의 눈부신 아트워크와 일러스트를 감상하세요. 상상이 현실이 되는 공간입니다.",
};

export default function Page() {
  return <GalleryClient />;
}
