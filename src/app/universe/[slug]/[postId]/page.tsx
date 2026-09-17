"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Eye, Heart, MessageCircle, Share2, UserRound } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type PostRow = {
    id: number;
    title: string;
    content: string | null;
    author: string | null;
    universe_slug: string | null;
    category: string | null;
    created_at: string | null;
    like_count: number | null;
    comment_count: number | null;
    view_count?: number | null;
    image_url?: string | null;
};

type CommentRow = {
    id: number;
    post_id: number;
    author: string | null;
    content: string;
    created_at: string | null;
};

type PostDetailProps = {
    params: Promise<{ slug: string; postId: string }>;
};

function formatDate(value?: string | null) {
    if (!value) return "날짜 없음";
    return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

function getInitial(name?: string | null) {
    return name?.trim()?.slice(0, 1) || "익";
}

function sortComments(comments: CommentRow[]) {
    return [...comments].sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return aTime - bTime;
    });
}

export default function PostDetail({ params }: PostDetailProps) {
    const { slug, postId } = React.use(params);
    const [post, setPost] = React.useState<PostRow | null>(null);
    const [relatedPosts, setRelatedPosts] = React.useState<PostRow[]>([]);
    const [comments, setComments] = React.useState<CommentRow[]>([]);
    const [commentAuthor, setCommentAuthor] = React.useState("드가이");
    const [commentContent, setCommentContent] = React.useState("");
    const [commentSaving, setCommentSaving] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [isStarred, setIsStarred] = React.useState(false);
    const [starLoading, setStarLoading] = React.useState(false);

    React.useEffect(() => {
        let ignore = false;

        async function loadPost() {
            setLoading(true);
            setErrorMessage(null);
            const numericPostId = Number(postId);

            if (!Number.isFinite(numericPostId)) {
                setErrorMessage("잘못된 글 주소입니다.");
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("posts")
                .select("*")
                .eq("id", numericPostId)
                .eq("universe_slug", slug)
                .maybeSingle();

            if (ignore) return;

            if (error || !data) {
                if (error) console.error("Post load error:", error);
                setPost(null);
                setRelatedPosts([]);
                setComments([]);
                setErrorMessage(error ? "글을 불러오는 중 문제가 생겼어요." : "글을 찾을 수 없어요.");
                setLoading(false);
                return;
            }

            const [{ data: related }, { data: loadedComments }, { data: authData }] = await Promise.all([
                supabase.from("posts").select("*").eq("universe_slug", slug).neq("id", numericPostId).order("created_at", { ascending: false }).limit(4),
                supabase.from("comments").select("*").eq("post_id", numericPostId).order("created_at", { ascending: true }),
                supabase.auth.getUser(),
            ]);

            if (ignore) return;
            setPost(data as PostRow);
            setRelatedPosts((related || []) as PostRow[]);
            setComments((loadedComments || []) as CommentRow[]);

            if (authData.user) {
                const { data: starData } = await supabase
                    .from("post_stars")
                    .select("id")
                    .eq("post_id", numericPostId)
                    .eq("user_id", authData.user.id)
                    .maybeSingle();
                if (!ignore) setIsStarred(!!starData);
            }

            setLoading(false);
        }

        loadPost();

        const channel = supabase
            .channel(`post-detail-${slug}-${postId}`)
            .on("postgres_changes", { event: "*", schema: "public", table: "posts", filter: `id=eq.${postId}` }, loadPost)
            .on("postgres_changes", { event: "*", schema: "public", table: "comments", filter: `post_id=eq.${postId}` }, (payload) => {
                if (ignore) return;
                if (payload.eventType === "INSERT") {
                    const next = payload.new as CommentRow;
                    setComments((prev) => prev.some((item) => item.id === next.id) ? prev : sortComments([...prev, next]));
                } else if (payload.eventType === "UPDATE") {
                    const next = payload.new as CommentRow;
                    setComments((prev) => sortComments(prev.map((item) => item.id === next.id ? next : item)));
                } else if (payload.eventType === "DELETE") {
                    const deleted = payload.old as Pick<CommentRow, "id">;
                    setComments((prev) => prev.filter((item) => item.id !== deleted.id));
                }
            })
            .subscribe();

        return () => {
            ignore = true;
            supabase.removeChannel(channel);
        };
    }, [slug, postId]);

    async function submitComment(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const numericPostId = Number(postId);
        const content = commentContent.trim();
        if (!Number.isFinite(numericPostId) || !content) return;

        setCommentSaving(true);
        const { data, error } = await supabase.from("comments").insert({
            post_id: numericPostId,
            author: commentAuthor.trim() || "익명",
            content,
        }).select("*").single();

        if (error) {
            console.error("Comment insert error:", error);
            alert("댓글 저장 중 문제가 생겼어요.");
        } else {
            const saved = data as CommentRow;
            setComments((prev) => prev.some((item) => item.id === saved.id) ? prev : sortComments([...prev, saved]));
            setCommentContent("");
        }
        setCommentSaving(false);
    }

    async function toggleStar() {
        if (!post) return;
        setStarLoading(true);
        try {
            const { data: authData } = await supabase.auth.getUser();
            if (!authData.user) {
                alert("로그인이 필요해!");
                return;
            }
            const response = await fetch(`/api/posts/${postId}/star`, { method: "POST" });
            if (response.ok) {
                const data = await response.json();
                setIsStarred(data.isStarred);
                setPost((prev) => prev ? { ...prev, like_count: data.like_count } : null);
            }
        } finally {
            setStarLoading(false);
        }
    }

    async function sharePost() {
        if (typeof window === "undefined") return;
        try {
            if (navigator.share) await navigator.share({ title: post?.title, url: window.location.href });
            else {
                await navigator.clipboard.writeText(window.location.href);
                alert("링크를 복사했어!");
            }
        } catch {
            // Sharing can be cancelled by the user.
        }
    }

    if (loading) {
        return <main className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-[#050711]"><div className="mx-auto max-w-3xl animate-pulse space-y-5"><div className="h-10 w-40 rounded-xl bg-slate-200 dark:bg-white/10"/><div className="h-64 rounded-3xl bg-slate-200 dark:bg-white/10"/></div></main>;
    }

    if (!post) {
        return (
            <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 dark:bg-[#050711] dark:text-white">
                <div className="mx-auto max-w-3xl">
                    <Link href={`/universe/${slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"><ArrowLeft className="h-4 w-4"/>Universe로 돌아가기</Link>
                    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 dark:border-white/10 dark:bg-white/5"><h1 className="text-2xl font-bold">글을 찾을 수 없어요</h1><p className="mt-2 text-sm text-slate-500">{errorMessage}</p></section>
                </div>
            </main>
        );
    }

    const authorName = post.author || "익명";

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 dark:bg-[#050711] dark:text-white sm:px-6">
            <div className="mx-auto max-w-3xl">
                <Link href={`/universe/${slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">
                    <ArrowLeft className="h-4 w-4"/>Universe로 돌아가기
                </Link>

                <article className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04] sm:p-8">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <span className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold dark:border-white/10">{post.category || "전체"}</span>
                        <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4"/>{formatDate(post.created_at)}</span>
                    </div>

                    <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{post.title}</h1>

                    <div className="mt-5 flex items-center gap-3 border-b border-slate-200 pb-6 dark:border-white/10">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-bold dark:bg-white/10">{getInitial(authorName)}</div>
                        <div><p className="flex items-center gap-1.5 text-sm font-semibold"><UserRound className="h-4 w-4 text-slate-400"/>{authorName}</p><p className="mt-0.5 text-xs text-slate-400">{slug} Universe</p></div>
                    </div>

                    <div className="whitespace-pre-line break-words py-8 text-[16px] leading-8 text-slate-700 dark:text-slate-200">{post.content || "본문이 비어 있어요."}</div>

                    {post.image_url && <img src={post.image_url} alt="게시글 첨부 이미지" className="mb-8 max-h-[560px] w-full rounded-2xl object-cover"/>}

                    <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-5 dark:border-white/10">
                        <button onClick={toggleStar} disabled={starLoading} className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold ${isStarred ? "border-rose-300 bg-rose-50 text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300" : "border-slate-200 dark:border-white/10"}`}><Heart className={`h-4 w-4 ${isStarred ? "fill-current" : ""}`}/>좋아요 {post.like_count ?? 0}</button>
                        <a href="#comments" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-white/10"><MessageCircle className="h-4 w-4"/>댓글 {comments.length}</a>
                        <button onClick={sharePost} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-white/10"><Share2 className="h-4 w-4"/>공유</button>
                        <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-slate-400"><Eye className="h-4 w-4"/>{post.view_count ?? 0}</span>
                    </div>
                </article>

                <section id="comments" className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04] sm:p-8">
                    <div className="flex items-center justify-between gap-4"><h2 className="text-xl font-bold">댓글</h2><span className="text-sm text-slate-400">{comments.length}개</span></div>
                    <form onSubmit={submitComment} className="mt-5 grid gap-3 sm:grid-cols-[140px_minmax(0,1fr)_80px]">
                        <input value={commentAuthor} onChange={(e) => setCommentAuthor(e.target.value)} placeholder="닉네임" className="rounded-xl border border-slate-200 bg-transparent px-3 py-2.5 text-sm outline-none dark:border-white/10"/>
                        <input value={commentContent} onChange={(e) => setCommentContent(e.target.value)} placeholder="댓글을 입력해줘" className="rounded-xl border border-slate-200 bg-transparent px-3 py-2.5 text-sm outline-none dark:border-white/10"/>
                        <button type="submit" disabled={commentSaving || !commentContent.trim()} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40 dark:bg-white dark:text-slate-950">{commentSaving ? "저장 중" : "등록"}</button>
                    </form>

                    <div className="mt-6 divide-y divide-slate-100 dark:divide-white/5">
                        {comments.length === 0 ? <p className="py-8 text-center text-sm text-slate-400">아직 댓글이 없어. 첫 댓글을 남겨봐!</p> : comments.map((comment) => (
                            <article key={comment.id} className="py-4 first:pt-0"><div className="flex items-center justify-between gap-3"><span className="font-semibold">{comment.author || "익명"}</span><time className="text-xs text-slate-400">{formatDate(comment.created_at)}</time></div><p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-slate-600 dark:text-slate-300">{comment.content}</p></article>
                        ))}
                    </div>
                </section>

                {relatedPosts.length > 0 && (
                    <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04] sm:p-8">
                        <div className="flex items-center justify-between"><h2 className="text-lg font-bold">같은 Universe의 다른 글</h2><Link href={`/universe/${slug}`} className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white">전체 보기</Link></div>
                        <div className="mt-4 divide-y divide-slate-100 dark:divide-white/5">{relatedPosts.map((item) => <Link key={item.id} href={`/universe/${slug}/${item.id}`} className="block py-3 first:pt-0"><p className="font-semibold">{item.title}</p><p className="mt-1 text-xs text-slate-400">{item.category || "전체"} · {formatDate(item.created_at)}</p></Link>)}</div>
                    </section>
                )}
            </div>
        </main>
    );
}
