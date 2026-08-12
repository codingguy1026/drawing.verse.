// src/components/Banner.tsx
"use client";

import Link from "next/link";

export default function Banner() {
  return (
    <section
      className="
        w-full
        rounded-3xl
        bg-gradient-to-r from-[#ffe9f0] via-[#fff5ff] to-[#e8f0ff]
        shadow-[0_20px_60px_rgba(0,0,0,0.06)]
        px-8 py-12 md:px-16 md:py-16
        flex flex-col gap-8
      "
    >
      {/* 위쪽: 타이틀 + 이모지 */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 text-3xl md:text-5xl font-extrabold">
          <span className="text-4xl md:text-5xl">✨</span>
          <h1 className="text-[#ff4b6b] leading-tight">
            Drawing Verse:{" "}
            <span className="whitespace-nowrap">당신의 관심사 유니버스를</span>{" "}
            여행하세요
          </h1>
          <span className="hidden md:inline text-4xl md:text-5xl">✨</span>
        </div>

        <p className="text-base md:text-lg text-[#9aa4b2] leading-relaxed mt-2">
          가볍게 둘러보는 사람부터 깊게 이야기하고 싶은 사람까지,
          <br />
          관심사가 모이고 대화가 이어지는 곳, Drawing Verse에 오신 것을 환영합니다!
        </p>
      </div>

      {/* 아래쪽: 버튼 + 작은 설명 */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
        <Link
          href="/universe"
          className="
            inline-flex items-center justify-center
            px-8 py-3 rounded-full
            bg-[#ff4b6b]
            text-white font-semibold text-base md:text-lg
            shadow-[0_12px_30px_rgba(255,75,107,0.45)]
            hover:translate-y-[1px]
            hover:shadow-[0_8px_20px_rgba(255,75,107,0.35)]
            transition
          "
        >
          모든 유니버스 둘러보기 →
        </Link>

        <p className="text-sm md:text-base text-[#b0bac6]">
          게임, 스포츠, 일상, 팬덤…
          <span className="hidden md:inline">
            지금, 마음 맞는 사람들과 이야기를 시작해보세요.
          </span>
        </p>
      </div>
    </section>
  );
}
