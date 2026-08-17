"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  FileText,
  GalleryHorizontalEnd,
  Globe2,
  Info,
  MessageCircle,
  MoreHorizontal,
  PenLine,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type TabKey = "posts" | "popular" | "gallery" | "about";

type UniverseRow = {
  id: string | number;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  subscriber_count: number | null;
  post_count: number | null;
  tags: string[] | null;
};

type PostRow = {
  id: string | number;
  title: string | null;
  content: string | null;
  author: string | null;
  created_at: string | null;
  likes_count: number | null;
  comments_count: number | null;
  views_count: number | null;
};

type RelatedUniverse = Pick<
  UniverseRow,
  "id" | "slug" | "name" | "description" | "category" | "subscriber_count"
>;

const tabs: Array<{ key: TabKey; label: string; icon: typeof FileText }> = [
  { key: "posts", label: "게시글", icon: FileText },
  { key: "popular", label: "인기", icon: Star },
  { key: "gallery", label: "갤러리", icon: GalleryHorizontalEnd },
  { key: "about", label: "정보", icon: Info },
];

function timeAgo(value: string | null) {
  if (!value) return "최근";
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "최근";

  const diff = Math.max(0, Date.now() - timestamp);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "방금 전";
  if (diff < hour) return `${Math.floor(diff / minute)}분 전`;
  if (diff < day) return `${Math.floor(diff / hour)}시간 전`;
  if (diff < day * 7) return `${Math.floor(diff / day)}일 전`;
  return new Intl.DateTimeFormat("ko-KR", { month: "short", day: "numeric" }).format(
    new Date(value)
  );
}

function compactNumber(value: number | null | undefined) {
  return new Intl.NumberFormat("ko-KR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value ?? 0);
}

export default function UniverseDetailClient({ slug }: { slug: string }) {
  const [universe, setUniverse] = useState<UniverseRow | null>(null);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [related, setRelated] = useState<RelatedUniverse[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("posts");
  const [joined, setJoined] = useState(false);
  const [hasSubscriptionTable, setHasSubscriptionTable] = useState(true);
  const [joining, setJoining] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const { data: universeData, error: universeError } = await supabase
        .from("universes")
        .select(
          "id,slug,name,description,category,subscriber_count,post_count,tags"
        )
        .eq("slug", slug)
        .maybeSingle();

      if (cancelled) return;

      if (universeError || !universeData) {
        console.error("Universe load error:", universeError);
        setError("이 유니버스를 찾을 수 없어요.");
        setLoading(false);
        return;
      }

      const nextUniverse = universeData as UniverseRow;
      setUniverse(nextUniverse);

      const [postsResult, relatedResult, authResult] = await Promise.all([
        supabase
          .from("posts")
          .select(
            "id,title,content,author,created_at,likes_count,comments_count,views_count"
          )
          .eq("universe_slug", slug)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("universes")
          .select("id,slug,name,description,category,subscriber_count")
          .neq("slug", slug)
          .order("subscriber_count", { ascending: false })
          .limit(4),
        supabase.auth.getUser(),
      ]);

      if (cancelled) return;

      if (postsResult.error) {
        console.warn("Universe posts load error:", postsResult.error);
      } else {
        setPosts((postsResult.data ?? []) as PostRow[]);
      }

      if (!relatedResult.error) {
        setRelated((relatedResult.data ?? []) as RelatedUniverse[]);
      }

      const user = authResult.data.user;
      if (user) {
        const { data: subscription, error: subscriptionError } = await supabase
          .from("universe_subscriptions")
          .select("universe_slug")
          .eq("user_id", user.id)
          .eq("universe_slug", slug)
          .maybeSingle();

        if (cancelled) return;

        if (subscriptionError) {
          setHasSubscriptionTable(false);
        } else {
          setJoined(Boolean(subscription));
        }
      }

      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const popularPosts = useMemo(
    () =>
      [...posts].sort(
        (a, b) =>
          (b.likes_count ?? 0) + (b.comments_count ?? 0) * 2 -
          ((a.likes_count ?? 0) + (a.comments_count ?? 0) * 2)
      ),
    [posts]
  );

  async function toggleJoin() {
    if (!universe || joining || !hasSubscriptionTable) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/auth/login";
      return;
    }

    setJoining(true);

    if (joined) {
      const { error: leaveError } = await supabase
        .from("universe_subscriptions")
        .delete()
        .eq("user_id", user.id)
        .eq("universe_slug", slug);

      if (!leaveError) {
        setJoined(false);
        setUniverse((current) =>
          current
            ? {
                ...current,
                subscriber_count: Math.max(0, (current.subscriber_count ?? 0) - 1),
              }
            : current
        );
      }
    } else {
      const { error: joinError } = await supabase
        .from("universe_subscriptions")
        .insert({ user_id: user.id, universe_slug: slug });

      if (!joinError) {
        setJoined(true);
        setUniverse((current) =>
          current
            ? {
                ...current,
                subscriber_count: (current.subscriber_count ?? 0) + 1,
              }
            : current
        );
      }
    }

    setJoining(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-[#070711] sm:px-6">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="h-10 w-40 animate-pulse rounded-xl bg-slate-200 dark:bg-white/8" />
          <div className="h-64 animate-pulse rounded-[2rem] bg-white dark:bg-white/5" />
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="h-96 animate-pulse rounded-[2rem] bg-white dark:bg-white/5" />
            <div className="h-72 animate-pulse rounded-[2rem] bg-white dark:bg-white/5" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !universe) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-slate-50 px-4 dark:bg-[#070711]">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-violet-100 text-2xl dark:bg-violet-400/10">
            🌌
          </div>
          <h1 className="text-2xl font-black text-slate-950 dark:text-white">
            유니버스를 찾을 수 없어요
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-white/40">{error}</p>
          <Link
            href="/universe"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white dark:bg-white dark:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" />
            유니버스로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  const visiblePosts = activeTab === "popular" ? popularPosts : posts;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#070711] dark:text-white">
      <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-7 sm:px-6 lg:px-8">
        <Link
          href="/universe"
          className="inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-white/45 dark:hover:bg-white/5 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          모든 유니버스
        </Link>

        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-white/10 dark:bg-[#0d0d19]">
          <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-violet-400/10 blur-3xl dark:bg-violet-500/15" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-700 dark:bg-violet-400/10 dark:text-violet-200">
                  <Globe2 className="h-3.5 w-3.5" />
                  {universe.category || "기타"}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  활동 중
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                {universe.name}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base dark:text-white/55">
                {universe.description || "이 유니버스의 소개가 아직 작성되지 않았어요."}
              </p>

              <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold text-slate-500 dark:text-white/45">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  멤버 {compactNumber(universe.subscriber_count)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  게시글 {compactNumber(Math.max(universe.post_count ?? 0, posts.length))}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end">
              <button
                type="button"
                onClick={toggleJoin}
                disabled={!hasSubscriptionTable || joining}
                className={`min-w-28 rounded-xl px-4 py-2.5 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-45 ${
                  joined
                    ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white/70"
                    : "bg-slate-950 text-white hover:bg-violet-700 dark:bg-white dark:text-slate-950 dark:hover:bg-violet-100"
                }`}
              >
                {joining ? "처리 중..." : joined ? "구독 중" : "구독하기"}
              </button>

              <Link
                href={`/universe/${slug}/write`}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-violet-700"
              >
                <PenLine className="h-4 w-4" />
                글쓰기
              </Link>

              <button
                type="button"
                aria-label="더보기"
                className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-white/45"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        <div className="overflow-x-auto">
          <nav className="flex min-w-max gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-white/10 dark:bg-[#0d0d19]">
            {tabs.map(({ key, label, icon: Icon }) => {
              const active = activeTab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    active
                      ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                      : "text-slate-600 hover:bg-slate-100 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
          <section className="min-w-0">
            {(activeTab === "posts" || activeTab === "popular") && (
              <div className="space-y-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-600 dark:text-violet-300">
                      {activeTab === "popular" ? "Popular" : "Community feed"}
                    </p>
                    <h2 className="mt-1 text-xl font-black">
                      {activeTab === "popular" ? "인기 게시글" : "최근 게시글"}
                    </h2>
                  </div>
                  <span className="text-sm font-semibold text-slate-400 dark:text-white/30">
                    {visiblePosts.length}개
                  </span>
                </div>

                {visiblePosts.length === 0 ? (
                  <EmptyState
                    icon={MessageCircle}
                    title="아직 게시글이 없어요"
                    description="이 유니버스의 첫 이야기를 남겨보세요."
                    actionHref={`/universe/${slug}/write`}
                    actionLabel="첫 글 쓰기"
                  />
                ) : (
                  <div className="space-y-3">
                    {visiblePosts.map((post) => (
                      <PostCard key={String(post.id)} post={post} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "gallery" && (
              <EmptyState
                icon={GalleryHorizontalEnd}
                title="유니버스 갤러리"
                description="이미지 게시물을 한곳에 모아보는 영역이에요. 현재 데이터 구조와 연결되기 전까지는 이 공간을 비워둘게요."
              />
            )}

            {activeTab === "about" && (
              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0d0d19]">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-violet-600 dark:text-violet-300" />
                  <h2 className="text-lg font-black">이 유니버스에 대하여</h2>
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-white/55">
                  {universe.description || "아직 자세한 소개가 없어요."}
                </p>

                {Array.isArray(universe.tags) && universe.tags.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {universe.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-500 dark:border-white/10 dark:text-white/40"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <InfoCard title="유니버스 정보" icon={Sparkles}>
              <div className="space-y-3 text-sm">
                <StatLine label="카테고리" value={universe.category || "기타"} />
                <StatLine label="멤버" value={compactNumber(universe.subscriber_count)} />
                <StatLine label="게시글" value={compactNumber(Math.max(universe.post_count ?? 0, posts.length))} />
              </div>
            </InfoCard>

            <InfoCard title="기본 규칙" icon={ShieldCheck}>
              <ul className="space-y-2 text-sm leading-6 text-slate-600 dark:text-white/50">
                <li>• 주제에 맞는 글을 올려주세요.</li>
                <li>• 다른 창작자를 존중해주세요.</li>
                <li>• 출처와 저작권을 지켜주세요.</li>
              </ul>
            </InfoCard>

            {related.length > 0 && (
              <InfoCard title="관련 유니버스" icon={Globe2}>
                <div className="space-y-2">
                  {related.map((item) => (
                    <Link
                      key={String(item.id)}
                      href={`/universe/${item.slug}`}
                      className="block rounded-xl border border-slate-100 p-3 transition hover:border-violet-200 hover:bg-violet-50/50 dark:border-white/7 dark:hover:border-violet-400/20 dark:hover:bg-violet-400/5"
                    >
                      <p className="text-sm font-black">{item.name}</p>
                      <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-white/35">
                        {item.description || item.category || "유니버스"}
                      </p>
                      <p className="mt-2 text-[11px] font-semibold text-slate-400 dark:text-white/25">
                        멤버 {compactNumber(item.subscriber_count)}
                      </p>
                    </Link>
                  ))}
                </div>
              </InfoCard>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

function PostCard({ post }: { post: PostRow }) {
  return (
    <Link
      href={`/post/${post.id}`}
      className="block rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:border-violet-300 hover:shadow-md dark:border-white/10 dark:bg-[#0d0d19] dark:hover:border-violet-400/20"
    >
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400 dark:text-white/30">
        <span className="text-slate-600 dark:text-white/55">{post.author || "익명"}</span>
        <span>·</span>
        <span>{timeAgo(post.created_at)}</span>
      </div>

      <h3 className="mt-3 text-lg font-black tracking-tight text-slate-950 dark:text-white">
        {post.title || "제목 없는 게시글"}
      </h3>
      <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-white/50">
        {post.content || ""}
      </p>

      <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-400 dark:border-white/7 dark:text-white/30">
        <span className="inline-flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5" />
          {post.likes_count ?? 0}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MessageCircle className="h-3.5 w-3.5" />
          {post.comments_count ?? 0}
        </span>
        <span className="ml-auto">조회 {post.views_count ?? 0}</span>
      </div>
    </Link>
  );
}

function InfoCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Info;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0d0d19]">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-violet-600 dark:text-violet-300" />
        <h3 className="text-sm font-black">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function StatLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500 dark:text-white/40">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  icon: typeof Info;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center dark:border-white/10 dark:bg-white/[0.03]">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-200">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-black">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-white/40">
        {description}
      </p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-5 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white dark:bg-white dark:text-slate-950"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
