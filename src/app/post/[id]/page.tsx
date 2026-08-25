"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  Loader2,
  MessageCircle,
  Send,
  Star,
  UserRound,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type Comment = {
  id: string;
  userId?: string | null;
  author: string;
  content: string;
  date: string;
};

type Post = {
  id: string;
  title: string;
  author: string;
  content: string;
  date: string;
  views: number;
  comments: Comment[];
  tag?: string | null;
  universeId?: string | null;
  likes: number;
  imageUrl?: string | null;
  userId?: string | null;
};

export default function PostDetailPage() {
  const params = useParams<{ id: string | string[] }>();
  const router = useRouter();
  const id = Array.isArray(params.id) ? (params.id[0] ?? "") : (params.id ?? "");

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [commentSaving, setCommentSaving] = useState(false);
  const [starred, setStarred] = useState(false);
  const [starLoading, setStarLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!id) {
        setError("게시글 주소가 올바르지 않아요.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [postResponse, authResult] = await Promise.all([
          fetch(`/api/posts/${encodeURIComponent(id)}`, { cache: "no-store" }),
          supabase.auth.getUser(),
        ]);
        const json = await postResponse.json();

        if (cancelled) return;
        if (!postResponse.ok || !json.ok) {
          setError(json.error || "게시글을 찾을 수 없어요.");
          return;
        }

        setPost(json.data as Post);
        const currentUser = authResult.data.user;
        setUserId(currentUser?.id ?? null);

        if (currentUser) {
          const postId = Number(id);
          if (Number.isSafeInteger(postId)) {
            const { data: star } = await supabase
              .from("post_stars")
              .select("id")
              .eq("post_id", postId)
              .eq("user_id", currentUser.id)
              .maybeSingle();
            if (!cancelled) setStarred(Boolean(star));
          }
        }
      } catch (err) {
        console.error("Post load error:", err);
        if (!cancelled) setError("게시글을 불러오지 못했어요.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function toggleStar() {
    if (!id || starLoading) return;
    if (!userId) {
      router.push("/auth/login");
      return;
    }

    setStarLoading(true);
    try {
      const response = await fetch(`/api/posts/${encodeURIComponent(id)}/star`, {
        method: "POST",
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "좋아요를 변경하지 못했어요.");

      setStarred(Boolean(json.isStarred));
      setPost((current) =>
        current ? { ...current, likes: Number(json.like_count ?? current.likes) } : current
      );
    } catch (error) {
      console.error("Star toggle error:", error);
    } finally {
      setStarLoading(false);
    }
  }

  async function addComment() {
    if (!post || !id || commentSaving) return;
    if (!userId) {
      router.push("/auth/login");
      return;
    }

    const content = comment.trim();
    if (!content) return;

    setCommentSaving(true);
    try {
      const response = await fetch(`/api/comments/${encodeURIComponent(id)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const json = await response.json();
      if (!response.ok || !json.ok) throw new Error(json.error || "댓글을 저장하지 못했어요.");

      setPost((current) =>
        current
          ? { ...current, comments: [...current.comments, json.data as Comment] }
          : current
      );
      setComment("");
    } catch (error) {
      console.error("Comment save error:", error);
      setError(error instanceof Error ? error.message : "댓글을 저장하지 못했어요.");
    } finally {
      setCommentSaving(false);
    }
  }

  if (loading) {
    return <main className="grid min-h-[70vh] place-items-center bg-slate-50 dark:bg-[#070711]"><Loader2 className="h-7 w-7 animate-spin text-violet-500" /></main>;
  }

  if (error && !post) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-slate-50 px-4 dark:bg-[#070711] dark:text-white">
        <div className="text-center"><p className="text-sm text-rose-500">{error}</p><Link href="/" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-black text-white dark:bg-white dark:text-slate-950"><ArrowLeft className="h-4 w-4" /> 홈으로</Link></div>
      </main>
    );
  }

  if (!post) return null;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#070711] dark:text-white">
      <div className="mx-auto max-w-4xl px-4 py-7 sm:px-6">
        <Link href={post.universeId ? `/universe/${post.universeId}` : "/"} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:text-white/45 dark:hover:bg-white/5"><ArrowLeft className="h-4 w-4" /> {post.universeId ? "유니버스로" : "홈으로"}</Link>

        <article className="mt-4 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0d0d19]">
          {post.imageUrl && <div className="bg-slate-100 dark:bg-white/5"><img src={post.imageUrl} alt={post.title} className="max-h-[560px] w-full object-contain" /></div>}

          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap gap-2 text-xs font-black text-violet-600 dark:text-violet-300">{post.tag && <span className="rounded-full bg-violet-50 px-3 py-1.5 dark:bg-violet-400/10">{post.tag}</span>}{post.universeId && <Link href={`/universe/${post.universeId}`} className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-500 dark:bg-white/5 dark:text-white/45">{post.universeId}</Link>}</div>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">{post.title}</h1>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-400"><span className="inline-flex items-center gap-1.5"><UserRound className="h-4 w-4" /> {post.author}</span><span>·</span><span>{post.date}</span></div>

            <div className="mt-7 whitespace-pre-wrap text-[15px] leading-8 text-slate-700 dark:text-white/70 sm:text-base">{post.content}</div>

            <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-5 dark:border-white/10">
              <button type="button" onClick={toggleStar} disabled={starLoading} className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-black ${starred ? "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200" : "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-white/50"}`}><Star className={`h-4 w-4 ${starred ? "fill-current" : ""}`} /> {post.likes}</button>
              <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-slate-100 px-4 text-sm font-bold text-slate-500 dark:bg-white/5 dark:text-white/45"><MessageCircle className="h-4 w-4" /> {post.comments.length}</span>
              <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-slate-100 px-4 text-sm font-bold text-slate-500 dark:bg-white/5 dark:text-white/45"><Eye className="h-4 w-4" /> {post.views}</span>
            </div>
          </div>
        </article>

        <section className="mt-5 rounded-[2rem] border border-slate-200 bg-white p-5 sm:p-6 dark:border-white/10 dark:bg-[#0d0d19]">
          <div className="flex items-center justify-between"><h2 className="text-xl font-black">댓글</h2><span className="text-sm font-bold text-slate-400">{post.comments.length}개</span></div>

          <div className="mt-4 space-y-3">
            {post.comments.length ? post.comments.map((item) => (
              <article key={item.id} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.04]"><p className="text-xs font-bold text-slate-400">{item.author} · {item.date}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{item.content}</p></article>
            )) : <p className="py-6 text-center text-sm text-slate-400">아직 댓글이 없어요.</p>}
          </div>

          {userId ? (
            <div className="mt-5 flex gap-2 border-t border-slate-100 pt-5 dark:border-white/10"><textarea value={comment} onChange={(event) => setComment(event.target.value)} maxLength={3000} rows={2} placeholder="댓글을 입력하세요" className="min-h-12 flex-1 resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base outline-none focus:border-violet-400 dark:border-white/10 dark:bg-white/5" /><button type="button" onClick={addComment} disabled={commentSaving || !comment.trim()} className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-violet-600 text-white disabled:opacity-35" aria-label="댓글 등록">{commentSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</button></div>
          ) : (
            <Link href="/auth/login" className="mt-5 flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm font-black text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60">로그인하고 댓글 쓰기</Link>
          )}

          {error && <p className="mt-3 text-sm font-semibold text-rose-500">{error}</p>}
        </section>
      </div>
    </main>
  );
}
