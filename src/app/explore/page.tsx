import type { Metadata } from "next";
import Link from "next/link";
import RecentUniverseCards from "./recent-universe-cards";

export const metadata: Metadata = {
  title: "탐색 | Drawing Verse",
  description: "Drawing Verse의 새 유니버스, 인기 커뮤니티, 창작 작품을 둘러보세요.",
};

const discoveryLinks = [
  { title: "추천 콘텐츠", description: "갤러리에서 창작자들의 작품을 둘러보세요.", href: "/gallery" },
  { title: "최근 업데이트", description: "최근 만들어진 공개 유니버스를 만나보세요.", href: "#recent-universes" },
  { title: "인기 콘텐츠", description: "구독자가 많은 유니버스를 둘러보세요.", href: "#popular-universes" },
  { title: "카테고리", description: "관심 있는 분야로 바로 이동하세요.", href: "#explore-categories" },
];

const categories = [
  { label: "유니버스", href: "/universe" },
  { label: "갤러리", href: "/gallery" },
  { label: "커뮤니티", href: "/community" },
  { label: "스포츠", href: "/sports" },
];

export default function ExplorePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">탐색</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            새로운 유니버스와 창작 작품을 발견해 보세요.
          </p>
        </div>
        <Link
          href="/search"
          className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          전체 검색
        </Link>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="min-w-0 space-y-8">
          <nav aria-label="콘텐츠 둘러보기">
            <ul className="grid gap-4 sm:grid-cols-2">
              {discoveryLinks.map(({ title, description, href }) => (
                <li key={title} className="min-w-0">
                  <Link
                    href={href}
                    className="block h-full rounded-xl border border-slate-200 p-5 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <span className="block font-semibold">{title}</span>
                    <span className="mt-2 block text-sm text-slate-600 dark:text-slate-300">
                      {description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <section id="recent-universes" aria-labelledby="recent-universes-heading" className="scroll-mt-24">
            <h2 id="recent-universes-heading" className="mb-4 text-xl font-semibold">
              최근 만들어진 유니버스
            </h2>
            <RecentUniverseCards />
            <div className="mt-4 flex justify-start sm:justify-end">
              <Link
                href="/universe"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                전체 유니버스 보기 →
              </Link>
            </div>
          </section>

          <section id="popular-universes" aria-labelledby="popular-universes-heading" className="scroll-mt-24">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 id="popular-universes-heading" className="text-xl font-semibold">인기 유니버스</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">많은 사람이 관심을 갖는 세계를 찾아보세요.</p>
              </div>
              <Link href="/universe" className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-slate-700 dark:hover:bg-slate-800">유니버스 둘러보기 →</Link>
            </div>
            <ol aria-label="인기 유니버스 목록 준비 중" className="mt-4 grid gap-3 sm:grid-cols-3">
              {[1, 2, 3].map((position) => (
                <li key={position} className="flex min-h-32 flex-col rounded-xl border border-dashed border-slate-300 p-4 dark:border-slate-700">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">자리 {position}</span>
                  <p className="mt-3 text-sm font-medium">유니버스 준비 중</p>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">구독자 수 집계 연결 후 표시됩니다.</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside aria-labelledby="explore-spotlight-heading" className="min-w-0 self-start space-y-5 rounded-xl border border-slate-200 p-5 dark:border-slate-700">
          <section>
            <h2 id="explore-spotlight-heading" className="font-semibold">주목할 콘텐츠</h2>
            <Link
              href="/wormhole"
              className="mt-3 block rounded-lg border border-slate-200 p-3 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <span className="block text-sm font-semibold">웜홀 둘러보기</span>
              <span className="mt-1 block text-sm text-slate-600 dark:text-slate-300">
                두 유니버스의 이야기를 한 화면에서 살펴보세요.
              </span>
            </Link>
          </section>

          <nav id="explore-categories" aria-labelledby="explore-categories-heading" className="scroll-mt-24">
            <h2 id="explore-categories-heading" className="font-semibold">카테고리</h2>
            <ul className="mt-2 space-y-1">
              {categories.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 dark:hover:bg-slate-800"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>
    </main>
  );
}
