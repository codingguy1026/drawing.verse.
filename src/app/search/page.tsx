import Link from "next/link";
import { Search } from "lucide-react";
import { createRequestSupabase } from "@/lib/supabase/request";

interface Universe {
  id: number;
  slug: string;
  name: string;
  description: string | null;
}

interface Post {
  id: number;
  universe_slug: string;
  title: string;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const supabase = await createRequestSupabase();
  const { query } = await searchParams;
  const trimmedQuery = query?.trim() ?? "";

  let universes: Universe[] = [];
  let posts: Post[] = [];

  if (trimmedQuery && supabase) {
    const result = await Promise.all([
      supabase
        .from("universes")
        .select("id,slug,name,description")
        .ilike("name", `%${trimmedQuery}%`)
        .or(`description.ilike.%${trimmedQuery}%`)
        .limit(50),
      supabase
        .from("posts")
        .select("id,universe_slug,title")
        .ilike("title", `%${trimmedQuery}%`)
        .limit(50),
    ]);
    universes = result[0].data || [];
    posts = result[1].data || [];
  }

  const hasResults = universes.length > 0 || posts.length > 0;

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-10">
      <header className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">검색</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            유니버스와 게시글을 한곳에서 찾아보세요.
          </p>
        </div>
        <form action="/search" method="get" role="search" className="flex flex-col gap-2 sm:flex-row">
          <label htmlFor="verse-search-query" className="sr-only">검색어</label>
          <input
            id="verse-search-query"
            type="search"
            name="query"
            defaultValue={trimmedQuery}
            placeholder="유니버스 또는 게시글 검색"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-white/15 dark:bg-white/10 dark:text-white"
          />
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
          >
            <Search size={17} aria-hidden="true" />
            검색
          </button>
        </form>
      </header>

      {!trimmedQuery ? (
        <section className="rounded-2xl border border-slate-200/80 bg-white/70 px-5 py-10 text-center dark:border-white/10 dark:bg-white/5">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">무엇을 찾고 있나요?</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            검색어를 입력하거나 유니버스 목록에서 둘러보세요.
          </p>
          <Link href="/universe" className="mt-4 inline-block text-sm font-semibold text-violet-700 underline-offset-4 hover:underline dark:text-violet-300">
            유니버스 둘러보기
          </Link>
        </section>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="min-w-0 break-words text-lg font-semibold text-slate-900 dark:text-white">
              &ldquo;{trimmedQuery}&rdquo; 검색 결과
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300" aria-live="polite">
              유니버스 {universes.length}개 · 게시글 {posts.length}개
            </p>
          </div>

          {!supabase ? (
            <section className="rounded-2xl border border-slate-200/80 bg-white/70 p-6 text-center dark:border-white/10 dark:bg-white/5">
              <p className="font-semibold text-slate-900 dark:text-white">검색 서비스에 연결할 수 없어요.</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">잠시 후 다시 시도해 주세요.</p>
            </section>
          ) : !hasResults ? (
            <section className="rounded-2xl border border-slate-200/80 bg-white/70 p-6 text-center dark:border-white/10 dark:bg-white/5">
              <p className="font-semibold text-slate-900 dark:text-white">일치하는 결과가 없어요.</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">검색어를 짧게 바꾸거나 다른 단어를 입력해 보세요.</p>
            </section>
          ) : (
            <div className="grid items-start gap-5 lg:grid-cols-2">
              <section aria-labelledby="universe-results-title" className="min-w-0 rounded-2xl border border-slate-200/80 bg-white/70 p-4 sm:p-5 dark:border-white/10 dark:bg-white/5">
                <h3 id="universe-results-title" className="text-base font-semibold text-slate-900 dark:text-white">
                  유니버스 <span className="text-sm font-normal text-slate-500 dark:text-slate-400">({universes.length})</span>
                </h3>
                {universes.length ? (
                  <ul className="mt-3 divide-y divide-slate-200/80 dark:divide-white/10">
                    {universes.map((universe) => (
                      <li key={universe.id} className="min-w-0 py-3 first:pt-0 last:pb-0">
                        <Link href={`/universe/${encodeURIComponent(universe.slug)}`} className="block break-words font-medium text-violet-700 hover:underline dark:text-violet-300">
                          {universe.name}
                        </Link>
                        {universe.description && (
                          <p className="mt-1 line-clamp-2 break-words text-sm text-slate-600 dark:text-slate-300">{universe.description}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">일치하는 유니버스가 없어요.</p>
                )}
              </section>

              <section aria-labelledby="post-results-title" className="min-w-0 rounded-2xl border border-slate-200/80 bg-white/70 p-4 sm:p-5 dark:border-white/10 dark:bg-white/5">
                <h3 id="post-results-title" className="text-base font-semibold text-slate-900 dark:text-white">
                  게시글 <span className="text-sm font-normal text-slate-500 dark:text-slate-400">({posts.length})</span>
                </h3>
                {posts.length ? (
                  <ul className="mt-3 divide-y divide-slate-200/80 dark:divide-white/10">
                    {posts.map((post) => (
                      <li key={post.id} className="min-w-0 py-3 first:pt-0 last:pb-0">
                        <Link href={`/universe/${encodeURIComponent(post.universe_slug)}/${post.id}`} className="block break-words font-medium text-violet-700 hover:underline dark:text-violet-300">
                          {post.title}
                        </Link>
                        <p className="mt-1 break-words text-sm text-slate-600 dark:text-slate-300">유니버스: {post.universe_slug}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">일치하는 게시글이 없어요.</p>
                )}
              </section>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
