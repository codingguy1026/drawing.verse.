import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/server";

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
  const { query } = await searchParams;
  const trimmedQuery = query?.trim();

  if (!trimmedQuery) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        <h1 className="text-xl font-bold">검색</h1>
        <p className="mt-4">검색어를 입력해주세요.</p>
      </div>
    );
  }

  let universes: any[] = [];
  let posts: any[] = [];

  if (supabaseAdmin) {
    const result = await Promise.all([
      supabaseAdmin
        .from("universes")
        .select("id,slug,name,description")
        .ilike("name", `%${query}%`)
        .or(`description.ilike.%${query}%`)
        .limit(50),
      supabaseAdmin
        .from("posts")
        .select("id,universe_slug,title")
        .ilike("title", `%${query}%`)
        .limit(50),
    ]);
    universes = result[0].data || [];
    posts = result[1].data || [];
  }

  return (
    <div className="mx-auto max-w-4xl p-8 space-y-8">
      <h1 className="text-xl font-bold">
        검색 결과: <span className="text-violet-600">"{query}"</span>
      </h1>

      {(!universes || universes.length === 0) &&
      (!posts || posts.length === 0) ? (
        <p className="text-center text-slate-500">결과가 없습니다.</p>
      ) : null}

      {universes && universes.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold">유니버스</h2>
          <ul className="mt-2 space-y-2">
            {universes.map((u) => (
              <li key={u.id}>
                <Link
                  href={`/universe/${u.slug}`}
                  className="text-violet-600 hover:underline"
                >
                  {u.name}
                </Link>
                {u.description && (
                  <p className="text-xs text-slate-500">
                    {u.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {posts && posts.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold">게시글</h2>
          <ul className="mt-2 space-y-2">
            {posts.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/post/${p.id}`}
                  className="text-violet-600 hover:underline"
                >
                  {p.title}
                </Link>
                <p className="text-xs text-slate-500">
                  유니버스: {p.universe_slug}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
