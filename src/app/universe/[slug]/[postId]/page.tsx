"use client";

import * as React from "react";
import Link from "next/link";
import {
    ArrowLeft,
    CalendarDays,
    Eye,
    Heart,
    MessageCircle,
    Share2,
    Sparkles,
    UserRound,
} from "lucide-react";
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
};

type CommentRow = {
    id: number;
    post_id: number;
    author: string | null;
    content: string;
    created_at: string | null;
};

type PostDetailProps = {
    params: Promise<{
        slug: string;
        postId: string;
    }>;
};

function cn(...values: Array<string | false | null | undefined>) {
    return values.filter(Boolean).join(" ");
}

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
    const trimmed = name?.trim();
    if (!trimmed) return "익";
    return trimmed.slice(0, 1);
}

function sortComments(comments: CommentRow[]) {
    return [...comments].sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return aTime - bTime;
    });
}

function DetailStat(props: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
}) {
    return (
        <div className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            <span className="text-slate-400 dark:text-slate-500">{props.icon}</span>
            <span>{props.label}</span>
            <span className="text-slate-900 dark:text-white">{props.value}</span>
        </div>
    );
}

function DetailSkeleton() {
    return (
        <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 dark:bg-[#050711] dark:text-white sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl animate-pulse">
                <div className="mb-6 h-10 w-28 rounded-full bg-slate-200 dark:bg-white/10" />
                <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 md:p-10">
                    <div className="h-8 w-28 rounded-full bg-slate-200 dark:bg-white/10" />
                    <div className="mt-8 h-12 w-3/4 rounded-2xl bg-slate-200 dark:bg-white/10" />
                    <div className="mt-5 h-10 w-48 rounded-full bg-slate-200 dark:bg-white/10" />
                    <div className="mt-10 space-y-3">
                        <div className="h-5 rounded-full bg-slate-200 dark:bg-white/10" />
                        <div className="h-5 rounded-full bg-slate-200 dark:bg-white/10" />
                        <div className="h-5 w-2/3 rounded-full bg-slate-200 dark:bg-white/10" />
                    </div>
                </section>
            </div>
        </main>
    );
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
                setPost(null);
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

            let nextRelatedPosts: PostRow[] = [];
            let nextComments: CommentRow[] = [];

            if (!error) {
                const { data: related, error: relatedError } = await supabase
                    .from("posts")
                    .select("*")
                    .eq("universe_slug", slug)
                    .neq("id", numericPostId)
                    .order("created_at", { ascending: false })
                    .limit(6);

                if (relatedError) {
                    console.error("Related posts load error:", relatedError);
                } else {
                    nextRelatedPosts = (related || []) as PostRow[];
                }

                const { data: loadedComments, error: commentsError } = await supabase
                    .from("comments")
                    .select("*")
                    .eq("post_id", numericPostId)
                    .order("created_at", { ascending: true });

                if (commentsError) {
                    console.error("Comments load error:", commentsError);
                } else {
                    nextComments = (loadedComments || []) as CommentRow[];
                }

                // Check if starred
                const { data: authData } = await supabase.auth.getUser();
                if (authData.user) {
                    const { data: starData } = await supabase
                        .from("post_stars")
                        .select("id")
                        .eq("post_id", numericPostId)
                        .eq("user_id", authData.user.id)
                        .maybeSingle();
                    setIsStarred(!!starData);
                }
            }

            if (ignore) return;

            if (error) {
                console.error("Post load error:", error);
                setPost(null);
                setRelatedPosts([]);
                setComments([]);
                setErrorMessage("글을 불러오는 중 문제가 생겼어요.");
            } else {
                setPost(data as PostRow | null);
                setRelatedPosts(nextRelatedPosts);
                setComments(nextComments);
            }

            setLoading(false);
        }

        loadPost();

        const channel = supabase
            .channel(`post-detail-${slug}-${postId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "posts",
                    filter: `id=eq.${postId}`,
                },
                () => {
                    loadPost();
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "comments",
                    filter: `post_id=eq.${postId}`,
                },
                (payload) => {
                    if (ignore) return;

                    if (payload.eventType === "INSERT") {
                        const nextComment = payload.new as CommentRow;
                        setComments((prev) => {
                            if (prev.some((comment) => comment.id === nextComment.id)) {
                                return prev;
                            }
                            return sortComments([...prev, nextComment]);
                        });
                        return;
                    }

                    if (payload.eventType === "UPDATE") {
                        const nextComment = payload.new as CommentRow;
                        setComments((prev) =>
                            sortComments(
                                prev.map((comment) =>
                                    comment.id === nextComment.id ? nextComment : comment
                                )
                            )
                        );
                        return;
                    }

                    if (payload.eventType === "DELETE") {
                        const deletedComment = payload.old as Pick<CommentRow, "id">;
                        setComments((prev) =>
                            prev.filter((comment) => comment.id !== deletedComment.id)
                        );
                    }
                }
            )
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
        const author = commentAuthor.trim() || "익명";

        if (!Number.isFinite(numericPostId) || !content) return;

        setCommentSaving(true);

        const { data, error } = await supabase
            .from("comments")
            .insert({
                post_id: numericPostId,
                author,
                content,
            })
            .select("*")
            .single();

        if (error) {
            console.error("Comment insert error:", error);
            alert("댓글 저장 중 문제가 생겼어요. comments 테이블과 RLS 정책을 확인해 주세요.");
        } else {
            const savedComment = data as CommentRow;
            setComments((prev) => {
                if (prev.some((comment) => comment.id === savedComment.id)) {
                    return prev;
                }
                return sortComments([...prev, savedComment]);
            });
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

            const res = await fetch(`/api/posts/${postId}/star`, { method: "POST" });
            if (res.ok) {
                const data = await res.json();
                setIsStarred(data.isStarred);
                setPost(prev => prev ? { ...prev, like_count: data.like_count } : null);
            }
        } catch (err) {
            console.error("Star error:", err);
        } finally {
            setStarLoading(false);
        }
    }

    if (loading) return <DetailSkeleton />;

    if (!post) {
        return (
            <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 dark:bg-[#050711] dark:text-white sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        홈으로 돌아가기
                    </Link>

                    <section className="mt-8 rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500 dark:bg-indigo-500/15 dark:text-indigo-300">
                            <Sparkles className="h-6 w-6" />
                        </div>
                        <h1 className="mt-5 text-2xl font-black text-slate-950 dark:text-white">
                            글을 찾을 수 없어요
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                            {errorMessage || "삭제되었거나, 주소가 잘못되었거나, 다른 유니버스의 글일 수 있어요."}
                        </p>
                    </section>
                </div>
            </main>
        );
    }

    const authorName = post.author || "익명";
    const category = post.category || "전체";
    const content = post.content || "본문이 비어 있어요.";

    return (
        <main className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-8 text-slate-900 dark:bg-[#050711] dark:text-white sm:px-6 lg:px-8">
            <div className="pointer-events-none absolute left-[-120px] top-20 h-72 w-72 rounded-full bg-fuchsia-300/25 blur-3xl dark:bg-fuchsia-500/15" />
            <div className="pointer-events-none absolute right-[-120px] top-56 h-80 w-80 rounded-full bg-sky-300/25 blur-3xl dark:bg-sky-500/15" />
            <div className="pointer-events-none absolute bottom-[-140px] left-1/3 h-80 w-80 rounded-full bg-violet-300/20 blur-3xl dark:bg-violet-500/15" />

            <div className="relative mx-auto max-w-5xl">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        피드로 돌아가기
                    </Link>

                    <Link
                        href={`/universe/${slug}`}
                        className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
                    >
                        <Sparkles className="h-4 w-4" />
                        {slug} 유니버스
                    </Link>
                </div>

                <section className="overflow-hidden rounded-[36px] border border-white/80 bg-white/82 shadow-[0_24px_70px_rgba(148,163,184,0.20)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
                    <div className="border-b border-slate-200/80 bg-white/70 px-6 py-5 backdrop-blur dark:border-white/10 dark:bg-white/[0.035] md:px-10">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
                            <span className="rounded-full bg-indigo-500 px-3 py-1.5 text-white shadow-sm shadow-indigo-500/25">
                                {category}
                            </span>
                            <span className="text-slate-300 dark:text-white/20">•</span>
                            <span className="text-slate-500 dark:text-slate-400">{slug}</span>
                            <span className="text-slate-300 dark:text-white/20">•</span>
                            <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                <CalendarDays className="h-3.5 w-3.5" />
                                {formatDate(post.created_at)}
                            </span>
                        </div>
                    </div>

                    <article className="px-6 py-8 md:px-10 md:py-12">
                        <h1 className="max-w-4xl text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-5xl">
                            {post.title}
                        </h1>

                        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 text-base font-black text-white shadow-sm shadow-indigo-500/25">
                                    {getInitial(authorName)}
                                </div>
                                <div>
                                    <p className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
                                        <UserRound className="h-4 w-4 text-slate-400" />
                                        {authorName}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                        Drawing Verse writer
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <DetailStat
                                    icon={<Heart className="h-4 w-4" />}
                                    label="좋아요"
                                    value={post.like_count ?? 0}
                                />
                                <DetailStat
                                    icon={<MessageCircle className="h-4 w-4" />}
                                    label="댓글"
                                    value={post.comment_count ?? 0}
                                />
                                <DetailStat
                                    icon={<Eye className="h-4 w-4" />}
                                    label="조회"
                                    value={post.view_count ?? 0}
                                />
                            </div>
                        </div>

                        <div className="my-10 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-white/10" />

                        <div className="prose prose-slate max-w-none whitespace-pre-line text-[17px] leading-9 text-slate-700 dark:prose-invert dark:text-slate-200">
                            {content}
                        </div>
                    </article>

                    <div className="border-t border-slate-200/80 bg-slate-50/70 px-6 py-5 backdrop-blur dark:border-white/10 dark:bg-white/[0.025] md:px-10">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap gap-2">
                                <button 
                                    onClick={toggleStar}
                                    disabled={starLoading}
                                    className={cn(
                                        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5",
                                        isStarred 
                                            ? "bg-rose-500 text-white shadow-rose-500/20" 
                                            : "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
                                    )}
                                >
                                    <Heart className={cn("h-4 w-4", isStarred && "fill-current")} />
                                    {isStarred ? "좋아요 취소" : "좋아요"}
                                </button>
                                <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white">
                                    <Share2 className="h-4 w-4" />
                                    공유
                                </button>
                            </div>

                            <p className="text-xs text-slate-400 dark:text-slate-500">
                                실시간 변경 감지 연결됨
                            </p>
                        </div>
                    </div>
                </section>

                <section className="mt-6 overflow-hidden rounded-[32px] border border-white/80 bg-white/80 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.045]">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 px-6 py-5 dark:border-white/10 md:px-8">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                More from universe
                            </p>
                            <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                                같은 유니버스의 다른 글
                            </h2>
                        </div>
                        <Link
                            href={`/universe/${slug}`}
                            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white"
                        >
                            전체 보기
                        </Link>
                    </div>

                    {relatedPosts.length === 0 ? (
                        <div className="px-6 py-10 text-center md:px-8">
                            <Sparkles className="mx-auto h-7 w-7 text-slate-300 dark:text-slate-600" />
                            <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                                아직 같은 유니버스의 다른 글이 없어요.
                            </p>
                            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                글이 더 쌓이면 여기서 표처럼 바로 훑을 수 있어요.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <div className="min-w-[760px]">
                                <div className="grid grid-cols-[120px_minmax(260px,1fr)_140px_150px] border-b border-slate-200/80 bg-slate-50/80 px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400 dark:border-white/10 dark:bg-white/[0.035] md:px-8">
                                    <span>말머리</span>
                                    <span>제목</span>
                                    <span>반응</span>
                                    <span>날짜</span>
                                </div>

                                {relatedPosts.map((item, index) => (
                                    <Link
                                        key={item.id}
                                        href={`/universe/${slug}/${item.id}`}
                                        className={cn(
                                            "grid grid-cols-[120px_minmax(260px,1fr)_140px_150px] items-center gap-4 px-6 py-4 text-sm transition hover:bg-slate-50 dark:hover:bg-white/[0.035] md:px-8",
                                            index !== relatedPosts.length - 1 &&
                                            "border-b border-slate-100 dark:border-white/5"
                                        )}
                                    >
                                        <span className="w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-300">
                                            {item.category || "전체"}
                                        </span>
                                        <span className="truncate font-semibold text-slate-800 dark:text-slate-200">
                                            {item.title}
                                        </span>
                                        <span className="truncate text-xs font-semibold text-slate-500 dark:text-slate-400">
                                            좋아요 {item.like_count ?? 0} · 댓글 {item.comment_count ?? 0}
                                        </span>
                                        <span className="truncate text-xs text-slate-400 dark:text-slate-500">
                                            {formatDate(item.created_at)}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                <section className="mt-6 overflow-hidden rounded-[32px] border border-white/80 bg-white/80 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.045]">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 px-6 py-5 dark:border-white/10 md:px-8">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                Comment table
                            </p>
                            <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                                댓글
                            </h2>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 dark:bg-white/10 dark:text-slate-300">
                            {comments.length}개
                        </span>
                    </div>

                    <form onSubmit={submitComment} className="border-b border-slate-200/80 p-6 dark:border-white/10 md:p-8">
                        <div className="grid gap-3 md:grid-cols-[180px_minmax(0,1fr)_96px]">
                            <input
                                value={commentAuthor}
                                onChange={(event) => setCommentAuthor(event.target.value)}
                                placeholder="닉네임"
                                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-indigo-400/50 dark:focus:ring-indigo-400/10"
                            />
                            <input
                                value={commentContent}
                                onChange={(event) => setCommentContent(event.target.value)}
                                placeholder="댓글을 입력해 주세요"
                                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-indigo-400/50 dark:focus:ring-indigo-400/10"
                            />
                            <button
                                type="submit"
                                disabled={commentSaving || commentContent.trim().length === 0}
                                className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 dark:bg-white dark:text-slate-950"
                            >
                                {commentSaving ? "저장 중" : "등록"}
                            </button>
                        </div>
                    </form>

                    {comments.length === 0 ? (
                        <div className="px-6 py-10 text-center md:px-8">
                            <MessageCircle className="mx-auto h-7 w-7 text-slate-300 dark:text-slate-600" />
                            <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                                아직 댓글이 없어요.
                            </p>
                            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                첫 댓글을 남기면 여기 댓글 테이블에 바로 표시돼요.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <div className="min-w-[720px]">
                                <div className="grid grid-cols-[160px_minmax(280px,1fr)_170px] border-b border-slate-200/80 bg-slate-50/80 px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400 dark:border-white/10 dark:bg-white/[0.035] md:px-8">
                                    <span>작성자</span>
                                    <span>내용</span>
                                    <span>작성일</span>
                                </div>

                                {comments.map((comment, index) => (
                                    <article
                                        key={comment.id}
                                        className={cn(
                                            "grid grid-cols-[160px_minmax(280px,1fr)_170px] items-center gap-4 px-6 py-4 text-sm md:px-8",
                                            index !== comments.length - 1 &&
                                            "border-b border-slate-100 dark:border-white/5"
                                        )}
                                    >
                                        <div className="flex min-w-0 items-center gap-2">
                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-xs font-black text-white">
                                                {getInitial(comment.author)}
                                            </span>
                                            <span className="truncate font-bold text-slate-700 dark:text-slate-200">
                                                {comment.author || "익명"}
                                            </span>
                                        </div>
                                        <p className="whitespace-pre-line break-words leading-6 text-slate-600 dark:text-slate-300">
                                            {comment.content}
                                        </p>
                                        <span className="truncate text-xs text-slate-400 dark:text-slate-500">
                                            {formatDate(comment.created_at)}
                                        </span>
                                    </article>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
