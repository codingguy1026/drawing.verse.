"use client";

import Link from "next/link";
import * as React from "react";
import { ArrowLeft, Image as ImageIcon, UploadCloud } from "lucide-react";

const categories = ["일러스트", "웹툰", "캐릭터", "스케치", "배경", "팬아트"];

export default function GalleryUploadPage() {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 dark:bg-[#03050a] dark:text-white sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-3xl">
        <Link href="/gallery" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-950 dark:text-white/70 dark:hover:text-white">
          <ArrowLeft className="size-4" />
          갤러리로 돌아가기
        </Link>

        <header className="mt-8 border-b border-slate-200 pb-6 dark:border-white/10">
          <p className="text-sm font-semibold text-slate-500">Gallery Upload</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">작품 업로드</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-white/50">
            작품 이미지와 기본 정보를 입력하는 페이지입니다. 지금은 저장 기능보다 입력 순서와 레이아웃을 먼저 잡습니다.
          </p>
        </header>

        <form className="py-8">
          <section>
            <h2 className="text-sm font-black">작품 이미지</h2>

            <label className="mt-3 flex min-h-72 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white dark:border-white/15 dark:bg-white/[0.03]">
              {previewUrl ? (
                <img src={previewUrl} alt="작품 미리보기" className="max-h-[32rem] w-full object-contain" />
              ) : (
                <div className="px-6 py-12 text-center">
                  <div className="mx-auto grid size-12 place-items-center rounded-full bg-slate-100 dark:bg-white/10">
                    <UploadCloud className="size-5 text-slate-500" />
                  </div>
                  <p className="mt-4 text-sm font-black">이미지 선택</p>
                  <p className="mt-1 text-xs text-slate-500">JPG, PNG 등 이미지 파일</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </section>

          <section className="mt-8 space-y-5 border-t border-slate-200 pt-8 dark:border-white/10">
            <label className="block">
              <span className="text-sm font-black">작품 제목</span>
              <input
                type="text"
                placeholder="작품 제목"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400 dark:border-white/10 dark:bg-white/[0.03] dark:focus:border-white/30"
              />
            </label>

            <label className="block">
              <span className="text-sm font-black">설명</span>
              <textarea
                rows={5}
                placeholder="작품에 대한 설명을 적어 주세요."
                className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-slate-400 dark:border-white/10 dark:bg-white/[0.03] dark:focus:border-white/30"
              />
            </label>

            <label className="block">
              <span className="text-sm font-black">카테고리</span>
              <select
                defaultValue=""
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#080a10]"
              >
                <option value="" disabled>카테고리 선택</option>
                {categories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </label>
          </section>

          <div className="mt-8 flex flex-col-reverse gap-2 border-t border-slate-200 pt-6 dark:border-white/10 sm:flex-row sm:justify-end">
            <Link href="/gallery" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-bold dark:border-white/10">
              취소
            </Link>
            <button
              type="button"
              disabled
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
            >
              <ImageIcon className="size-4" />
              작품 등록
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
