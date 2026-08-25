import Link from "next/link";
import { Search } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase/server";

type Universe = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
};

type Post = {
  id: number;
  universe_slug: string | null;
  title: string;
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { query } = await searchParams;
  const trimmedQuery = query?.trim() ?? "";

  if (!trimmedQuery) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-950 dark:bg-[#070711] dark:text-white">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-slate-200 bg-white p-7 dark:border-white/10 dark:bg-[#0d0d19]">
          <Search className="h-7 w-7 text-violet-500" />
          <h1 className="mt-4 text-2xl font-black">검색</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-white/45">검색어를 입력해 주세요.</p>
        </div>
      </main>
    );
  }

  const supabase = await createServerSupabase();
  const [{ data: universeData, error: universeError }, { data: postData, error: postError }] =
    await Promise.all([
      supabase
        .from("universes")
        .select("id,slug,name,description")
        .or(`name.ilike.%${trimmedQuery}%,description.ilike.%${trimmedQuery}%`)
        .limit(50),
      supabase
        .from("posts")
        .select("id,universe_slug,title")
        .ilike("title", `%${trimmedQuery}%`)
        .limit(50),
    ]);

  const universes = universeError ? [] : ((universeData ?? []) as Universe[]);
  const posts = postError ? [] : ((postData ?? []) as Post[]);
  const failed = Boolean(universeError || postError);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-950 dark:bg-[#070711] dark:text-white">
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-600 dark:text-violet-300">Search</p>
          <h1 className="mt-2 text-2xl font-black">
            <span className="text-violet-600 dark:text-violet-300">“{trimmedQuery}”</span> 검색 결과
          </h1>
        </header>

        {failed && (
          <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 dark:bg-amber-400/10 dark:text-amber-100">
            일부 검색 결과를 불러오지 못했어요.
          </p>
        )}

        {!universes.length && !posts.length ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center text-sm font-semibold text-slate-400 dark:border-white/10 dark:bg-white/[0.03]">
            결과가 없습니다.
          </div>
        ) : (
          <>
            {!!universes.length && (
              <section className="rounded-[2rem] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0d0d19]">
                <h2 className="text-lg font-black">유니버스</h2>
                <div className="mt-4 space-y-2">
                  {universes.map((universe) => (
                    <Link key={universe.id} href={`/universe/${universe.slug}`} className="block rounded-2xl bg-slate-50 p-4 transition hover:bg-violet-50 dark:bg-white/[0.04] dark:hover:bg-violet-400/10">
                      <p className="font-black">{universe.name}</p>
                      {universe.description && <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-white/40">{universe.description}</p>}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {!!posts.length && (
              <section className="rounded-[2rem] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0d0d19]">
                <h2 className="text-lg font-black">게시글</h2>
                <div className="mt-4 space-y-2">
                  {posts.map((post) => (
                    <Link key={post.id} href={`/post/${post.id}`} className="block rounded-2xl bg-slate-50 p-4 transition hover:bg-violet-50 dark:bg-white/[0.04] dark:hover:bg-violet-400/10">
                      <p className="font-black">{post.title}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-400">{post.universe_slug || "전체"}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
