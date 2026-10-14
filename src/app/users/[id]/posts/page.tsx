"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import * as React from "react";
import { ArrowLeft, Heart, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type ProfileRow = {
  display_name: string | null;
  nickname: string | null;
};

type PostRow = {
  id: string | number;
  public_id?: string | null;
  title: string | null;
  content: string | null;
  universe_slug: string | null;
  created_at: string | null;
  like_count?: number | null;
  comment_count?: number | null;
};

export default function UserPostsPage() {
  const params = useParams();
  const rawId = params.id;
  const userId = Array.isArray(rawId) ? rawId[0] ?? "" : rawId ?? "";

  const [profile, setProfile] = React.useState<ProfileRow | null>(null);
  const [posts, setPosts] = React.useState<PostRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let ignore = false;

    async function load() {
      const [{ data: profileData }, { data: postData }] = await Promise.all([
        supabase.from("profiles").select("display_name,nickname").eq("id", userId).maybeSingle<ProfileRow>(),
        supabase
          .from("posts")
          .select("id,public_id,title,content,universe_slug,created_at,like_count,comment_count")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
      ]);

      if (ignore) return;
      setProfile(profileData ?? null);
      setPosts((postData as PostRow[] | null) ?? []);
      setLoading(false);
    }

    load();
    return () => {
      ignore = true;
    };
  }, [userId]);

  const name = profile?.display_name?.trim() || profile?.nickname?.trim() || "사용자";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 dark:bg-[#03050a] dark:text-white sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link href={`/users/${userId}`} className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-white/70">
          <ArrowLeft className="size-4" />
          프로필로 돌아가기
        </Link>

        <header className="mt-8 border-b border-slate-200 pb-6 dark:border-white/10">
          <p className="text-sm text-slate-500">{name}</p>
          <h1 className="mt-1 text-3xl font-black">게시글</h1>
        </header>

        {loading ? (
          <div className="mt-6 h-52 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10" />
        ) : posts.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500">아직 작성한 게시글이 없어요.</p>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-white/10">
            {posts.map((post) => {
              const href = post.universe_slug
                ? `/universe/${post.universe_slug}/${post.public_id || post.id}`
                : `/post/${post.id}`;

              return (
                <Link key={post.id} href={href} className="block py-5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <span>{post.universe_slug || "Community"}</span>
                    <span>·</span>
                    <span>{post.created_at ? new Date(post.created_at).toLocaleDateString("ko-KR") : "날짜 없음"}</span>
                  </div>
                  <h2 className="mt-2 text-lg font-black">{post.title || "제목 없는 게시글"}</h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{post.content || "내용이 없어요."}</p>
                  <div className="mt-3 flex gap-4 text-xs font-bold text-slate-400">
                    <span className="inline-flex items-center gap-1"><Heart className="size-3.5" />{post.like_count ?? 0}</span>
                    <span className="inline-flex items-center gap-1"><MessageCircle className="size-3.5" />{post.comment_count ?? 0}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
