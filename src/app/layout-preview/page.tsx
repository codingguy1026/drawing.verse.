import Link from "next/link";

/**
 * Layout-first prototype. Keep the structure readable before adding visual effects.
 * This route is intentionally isolated from the main navigation.
 */
export default function LayoutPreviewPage() {
  return (
    <main id="dv-main-content" className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-slate-500">Drawing Verse / Layout preview</p>
          <h1 className="mt-2 text-3xl font-bold">페이지 레이아웃 실험실</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            시각 효과보다 콘텐츠의 순서, 폭, 간격을 먼저 확인하는 독립 페이지야.
          </p>
        </div>
        <Link href="/" className="rounded-lg border px-4 py-2 text-sm">홈으로</Link>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section aria-labelledby="preview-heading" className="min-w-0 space-y-4">
          <h2 id="preview-heading" className="text-xl font-semibold">주요 콘텐츠</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {["첫 번째 콘텐츠", "두 번째 콘텐츠", "세 번째 콘텐츠", "네 번째 콘텐츠"].map((title, index) => (
              <article key={title} className="min-w-0 rounded-xl border border-slate-200 p-5 dark:border-slate-700">
                <p className="text-xs text-slate-500">콘텐츠 {index + 1}</p>
                <h3 className="mt-2 font-semibold">{title}</h3>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                  실제 데이터를 연결하기 전에 카드 크기와 읽기 순서를 확인해.
                </p>
              </article>
            ))}
          </div>
        </section>
        <aside aria-labelledby="side-heading" className="min-w-0 rounded-xl border border-slate-200 p-5 dark:border-slate-700">
          <h2 id="side-heading" className="font-semibold">보조 영역</h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            모바일에서는 본문 아래로 이동하고, 넓은 화면에서는 오른쪽에 배치돼.
          </p>
        </aside>
      </div>
    </main>
  );
}
