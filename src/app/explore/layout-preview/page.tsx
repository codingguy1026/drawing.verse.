import type { Metadata } from "next";
import Link from "next/link";
import RecentUniverseCards from "./recent-universe-cards";

export const metadata: Metadata = {
  title: "콘텐츠 탐색 레이아웃 | Drawing Verse",
  description: "Drawing Verse 콘텐츠 탐색 페이지의 레이아웃 초안",
};

const sections = [
  { title: "최근 올라온 세계관", description: "최근 생성된 세계관 3개를 표시" },
  { title: "인기 세계관", description: "주목받는 세계관을 소개할 영역" },
  { title: "추천 창작자", description: "새로운 창작자를 발견할 영역" },
];

export default function ExploreLayoutPreviewPage() {
  return (
    <main id="dv-main-content" className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Drawing Verse / Layout preview</p>
          <h1 className="mt-2 text-2xl font-bold">콘텐츠 탐색</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            디자인보다 먼저 콘텐츠의 위치와 읽는 순서를 확인하는 초안입니다.
          </p>
        </div>
        <Link href="/" className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-600">
          홈으로
        </Link>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="min-w-0 space-y-8">
          <section aria-label="탐색 도구" className="rounded-xl border border-dashed border-slate-300 p-4 dark:border-slate-700">
            <div className="flex flex-wrap gap-3">
              <Link href="/search" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-slate-600 dark:hover:bg-slate-800">
                전체 콘텐츠 검색하기
              </Link>
              <Link href="/universe" className="rounded-lg border border-slate-300 px-4 py-3 text-sm hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-slate-600 dark:hover:bg-slate-800">
                세계관 목록 보기
              </Link>
            </div>
          </section>
          {sections.map((section) => (
            <section key={section.title} aria-label={section.title}>
              <div className="mb-4">
                <h2 className="text-lg font-semibold">{section.title}</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{section.description}</p>
              </div>
              {section.title === "최근 올라온 세계관" ? <RecentUniverseCards /> : <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                    <div aria-hidden="true" className="aspect-[4/3] rounded-lg bg-slate-100 dark:bg-slate-800" />
                    <div className="mt-3 h-4 w-2/3 rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="mt-2 h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800" />
                  </div>
                ))}
              </div>}
            </section>
          ))}
        </div>
        <aside aria-label="보조 탐색" className="self-start rounded-xl border border-dashed border-slate-300 p-4 dark:border-slate-700">
          <h2 className="font-semibold">보조 영역</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            자주 사용하는 탐색 경로를 모았어요. 작은 화면에서는 본문 아래로 이동합니다.
          </p>
          <nav aria-label="빠른 탐색 링크" className="mt-4 flex flex-col gap-2">
            <Link href="/universe" className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-slate-700 dark:hover:bg-slate-800">
              유니버스 둘러보기
            </Link>
            <Link href="/" className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-slate-700 dark:hover:bg-slate-800">
              홈으로 돌아가기
            </Link>
          </nav>
        </aside>
      </div>
    </main>
  );
}
