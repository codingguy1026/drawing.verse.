"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BellOff,
  Clock3,
  Compass,
  Flame,
  MessageCircle,
  Orbit,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";

type UniverseRow = {
  id: number | string;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  subscriber_count: number | null;
  post_count: number | null;
};

type PostRow = {
  id: number | string;
  title: string;
  author?: string | null;
  created_at?: string | null;
  category?: string | null;
  like_count?: number | null;
  comment_count?: number | null;
  universe_slug?: string | null;
};

type FeedMode = "latest" | "popular";

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function compactNumber(value: number) {
  return new Intl.NumberFormat("ko-KR", {
    notation: value >= 10000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

function relativeDate(value?: string | null) {
  if (!value) return "방금";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "최근";

  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "방금";
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  return date.toLocaleDateString("ko-KR");
}

export default function UniverseDetailClient({ slug }: { slug: string }) {
  const [universe, setUniverse] = useState<UniverseRow | null>(null);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [feedMode, setFeedMode] = useState<FeedMode>("latest");
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionReady, setSubscriptionReady] = useState(true);
  const [subscriptionBusy, setSubscriptionBusy] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);

      const [universeResult, postsResult, authResult] = await Promise.all([
        supabase
          .from("universes")
          .select(
            "id,slug,name,description,category,subscriber_count,post_count"
          )
          .eq("slug", slug)
          .maybeSingle(),
        supabase
          .from("posts")
          .select("*")
          .eq("universe_slug", slug)
          .order("created_at", { ascending: false })
          .limit(30),
        supabase.auth.getUser(),
      ]);

      if (ignore) return;

      if (universeResult.error || !universeResult.data) {
        setUniverse(null);
        setPosts([]);
        setNotFound(true);
        setLoading(false);
        return;
      }

      setUniverse(universeResult.data as UniverseRow);
      setPosts((postsResult.data as PostRow[] | null) ?? []);
      setNotFound(false);

      const user = authResult.data.user;
      if (user) {
        const { data, error } = await supabase
          .from("universe_subscriptions")
          .select("universe_slug")
          .eq("user_id", user.id)
          .eq("universe_slug", slug)
          .maybeSingle();

        if (!ignore) {
          if (error) {
            setSubscriptionReady(false);
          } else {
            setSubscribed(Boolean(data));
          }
        }
      }

      if (!ignore) setLoading(false);
    }

    load();

    const channel = supabase
      .channel(`universe-detail-${slug}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
          filter: `universe_slug=eq.${slug}`,
        },
        () => load()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "universes",
          filter: `slug=eq.${slug}`,
        },
        () => load()
      )
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, [slug]);

  const sortedPosts = useMemo(() => {
    if (feedMode === "latest") return posts;

    return [...posts].sort((a, b) => {
      const aScore = (a.like_count ?? 0) * 2 + (a.comment_count ?? 0);
      const bScore = (b.like_count ?? 0) * 2 + (b.comment_count ?? 0);
      return bScore - aScore;
    });
  }, [feedMode, posts]);

  const featuredPost = sortedPosts[0] ?? null;
  const feedPosts = featuredPost ? sortedPosts.slice(1) : sortedPosts;

  async function toggleSubscription() {
    if (!universe || subscriptionBusy || !subscriptionReady) return;

    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user) {
      window.location.href = "/auth/login";
      return;
    }

    setSubscriptionBusy(true);

    if (subscribed) {
      const { error } = await supabase
        .from("universe_subscriptions")
        .delete()
        .eq("user_id", user.id)
        .eq("universe_slug", universe.slug);

      if (!error) {
        setSubscribed(false);
        setUniverse((prev) =>
          prev
            ? {
                ...prev,
                subscriber_count: Math.max((prev.subscriber_count ?? 1) - 1, 0),
              }
            : prev
        );
      }
    } else {
      const { error } = await supabase
        .from("universe_subscriptions")
        .insert({ user_id: user.id, universe_slug: universe.slug });

      if (!error) {
        setSubscribed(true);
        setUniverse((prev) =>
          prev
            ? {
                ...prev,
                subscriber_count: (prev.subscriber_count ?? 0) + 1,
              }
            : prev
        );
      }
    }

    setSubscriptionBusy(false);
  }

  if (loading) return <UniverseSkeleton />;

  if (notFound || !universe) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-28 text-slate-950 dark:bg-[#03050a] dark:text-white">
        <section className="mx-auto max-w-3xl text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
            <Orbit className="size-7 text-violet-500" />
          </div>
          <p className="mt-7 text-xs font-black uppercase tracking-[0.28em] text-violet-500">
            Lost in the Verse
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            이 유니버스는 아직 없어요.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500 dark:text-white/50">
            주소가 바뀌었거나 아직 만들어지지 않은 세계일 수 있어요. 다른 유니버스를 탐색해볼까요?
          </p>
          <Link
            href="/universe"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
          >
            <Compass className="size-4" />
            유니버스 탐색하기
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-950 transition-colors dark:bg-[#03050a] dark:text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[620px] overflow-hidden">
        <div className="absolute left-[8%] top-20 size-[360px] rounded-full bg-violet-400/10 blur-[110px] dark:bg-violet-500/15" />
        <div className="absolute right-[8%] top-10 size-[420px] rounded-full bg-sky-300/12 blur-[120px] dark:bg-sky-500/10" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        <nav className="mb-5 flex items-center justify-between gap-4">
          <Link
            href="/universe"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950 dark:text-white/45 dark:hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Universe
          </Link>

          <button
            onClick={toggleSubscription}
            disabled={!subscriptionReady || subscriptionBusy}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50",
              subscribed
                ? "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-200"
                : "border-slate-200 bg-white/80 text-slate-700 hover:border-violet-200 hover:text-violet-600 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:border-violet-400/30 dark:hover:text-violet-200"
            )}
          >
            {subscribed ? <BellOff className="size-4" /> : <Bell className="size-4" />}
            {subscriptionBusy ? "처리 중..." : subscribed ? "구독 중" : "구독하기"}
          </button>
        </nav>

        <Hero universe={universe} featuredPost={featuredPost} />

        <section className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 space-y-12">
            <section>
              <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.26em] text-violet-500">
                    Community Feed
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                    이 우주의 이야기
                  </h2>
                </div>

                <div className="inline-flex rounded-full border border-slate-200 bg-white/80 p-1 shadow-sm dark:border-white/10 dark:bg-white/5">
                  <button
                    onClick={() => setFeedMode("latest")}
                    className={cn(
                      "rounded-full px-4 py-2 text-xs font-bold transition",
                      feedMode === "latest"
                        ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                        : "text-slate-500 dark:text-white/45"
                    )}
                  >
                    최신
                  </button>
                  <button
                    onClick={() => setFeedMode("popular")}
                    className={cn(
                      "rounded-full px-4 py-2 text-xs font-bold transition",
                      feedMode === "popular"
                        ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                        : "text-slate-500 dark:text-white/45"
                    )}
                  >
                    인기
                  </button>
                </div>
              </div>

              {feedPosts.length === 0 ? (
                <EmptyFeed slug={universe.slug} hasFeatured={Boolean(featuredPost)} />
              ) : (
                <div className="border-y border-slate-200 dark:border-white/10">
                  {feedPosts.map((post, index) => (
                    <PostRowItem
                      key={post.id}
                      post={post}
                      slug={universe.slug}
                      last={index === feedPosts.length - 1}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(120deg,#6d28d9_0%,#4f46e5_48%,#0284c7_100%)] px-6 py-8 text-white shadow-[0_24px_70px_rgba(79,70,229,0.25)] sm:px-8 sm:py-10">
              <div className="absolute -right-16 -top-20 size-56 rounded-full border border-white/10" />
              <div className="absolute -right-4 -top-8 size-32 rounded-full border border-white/10" />
              <div className="relative max-w-2xl">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-white/60">
                  Add your signal
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-tight">
                  이 유니버스에 새로운 이야기를 남겨봐
                </h2>
                <p className="mt-3 text-sm leading-7 text-white/70">
                  한 줄의 생각도, 긴 설정도, 그림 한 장도 이 우주의 새로운 궤도가 될 수 있어요.
                </p>
                <Link
                  href="/community"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5"
                >
                  <Plus className="size-4" />
                  이야기 시작하기
                </Link>
              </div>
            </section>
          </div>

          <aside className="space-y-8 lg:sticky lg:top-24 lg:h-fit">
            <InfoPanel universe={universe} posts={posts} />
            <SignalPanel posts={posts} />
          </aside>
        </section>
      </div>
    </main>
  );
}

function Hero({
  universe,
  featuredPost,
}: {
  universe: UniverseRow;
  featuredPost: PostRow | null;
}) {
  return (
    <section className="relative overflow-hidden rounded-[2.2rem] border border-white/80 bg-white/72 px-6 py-8 shadow-[0_28px_70px_rgba(148,163,184,0.18)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[0_28px_70px_rgba(0,0,0,0.35)] sm:px-8 sm:py-10 lg:px-10">
      <div className="pointer-events-none absolute -left-20 -top-24 size-64 rounded-full bg-violet-300/20 blur-[80px] dark:bg-violet-500/12" />
      <div className="pointer-events-none absolute -right-16 top-0 size-72 rounded-full bg-sky-200/25 blur-[90px] dark:bg-sky-500/10" />

      <div className="relative grid items-stretch gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
        <div className="flex min-h-[330px] flex-col justify-between py-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-200/70 bg-violet-50/80 px-3 py-1.5 text-xs font-black text-violet-600 dark:border-violet-400/15 dark:bg-violet-500/10 dark:text-violet-200">
                <Orbit className="size-3.5" />
                UNIVERSE
              </span>
              {universe.category && (
                <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-bold text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-white/45">
                  {universe.category}
                </span>
              )}
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.05] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
              {universe.name}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-500 dark:text-white/50 sm:text-lg">
              {universe.description || "아직 소개가 작성되지 않은 유니버스예요. 첫 이야기가 이 세계의 분위기를 만들어갈 거예요."}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold text-slate-500 dark:text-white/45">
            <span className="inline-flex items-center gap-2">
              <Users className="size-4 text-violet-500" />
              {compactNumber(universe.subscriber_count ?? 0)}명 구독
            </span>
            <span className="inline-flex items-center gap-2">
              <MessageCircle className="size-4 text-sky-500" />
              {compactNumber(universe.post_count ?? 0)}개 이야기
            </span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative min-h-[300px] overflow-hidden rounded-[1.8rem] border border-white/70 bg-slate-950 p-6 text-white shadow-2xl dark:border-white/10"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.28),transparent_34%),radial-gradient(circle_at_18%_80%,rgba(14,165,233,0.18),transparent_34%)]" />
          <div className="absolute right-7 top-7 size-24 rounded-full border border-white/10" />
          <div className="absolute right-11 top-11 size-16 rounded-full bg-gradient-to-br from-violet-300 via-indigo-300 to-sky-300 shadow-[0_0_50px_rgba(139,92,246,0.35)]" />

          <div className="relative flex h-full min-h-[250px] flex-col justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
              Verse Signal
            </p>

            {featuredPost ? (
              <Link href={`/universe/${universe.slug}/${featuredPost.id}`} className="group block">
                <div className="max-w-sm">
                  <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white/65">
                    {featuredPost.category || "이야기"}
                  </span>
                  <h2 className="mt-4 text-2xl font-black leading-tight tracking-tight sm:text-3xl">
                    {featuredPost.title}
                  </h2>
                  <p className="mt-3 text-sm text-white/45">
                    {featuredPost.author || "익명"} · {relativeDate(featuredPost.created_at)}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white/70 transition group-hover:text-white">
                    이 이야기 보기
                    <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ) : (
              <div>
                <Sparkles className="size-6 text-violet-300" />
                <h2 className="mt-4 text-2xl font-black">첫 신호를 기다리는 중</h2>
                <p className="mt-2 max-w-xs text-sm leading-6 text-white/45">
                  아직 올라온 이야기가 없어요. 이곳의 첫 번째 장면을 만들어보세요.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function PostRowItem({ post, slug, last }: { post: PostRow; slug: string; last: boolean }) {
  return (
    <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}>
      <Link
        href={`/universe/${slug}/${post.id}`}
        className={cn(
          "grid gap-3 py-5 sm:grid-cols-[110px_minmax(0,1fr)_auto] sm:items-center",
          !last && "border-b border-slate-200 dark:border-white/10"
        )}
      >
        <span className="w-fit rounded-full bg-violet-50 px-3 py-1 text-[11px] font-black text-violet-600 dark:bg-violet-500/10 dark:text-violet-200">
          {post.category || "전체"}
        </span>

        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white/90 sm:text-base">
            {post.title}
          </h3>
          <p className="mt-1 text-xs text-slate-400 dark:text-white/35">
            {post.author || "익명"} · {relativeDate(post.created_at)}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 dark:text-white/35">
          <span className="inline-flex items-center gap-1.5">
            <Flame className="size-3.5" />
            {post.like_count ?? 0}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MessageCircle className="size-3.5" />
            {post.comment_count ?? 0}
          </span>
          <ArrowRight className="hidden size-4 sm:block" />
        </div>
      </Link>
    </motion.div>
  );
}

function EmptyFeed({ slug, hasFeatured }: { slug: string; hasFeatured: boolean }) {
  return (
    <div className="rounded-[1.8rem] border border-dashed border-slate-300 px-6 py-12 text-center dark:border-white/15">
      <MessageCircle className="mx-auto size-6 text-violet-400" />
      <p className="mt-4 text-sm font-bold text-slate-700 dark:text-white/70">
        {hasFeatured ? "아직 더 보여줄 이야기가 없어요." : "아직 이 유니버스에 이야기가 없어요."}
      </p>
      <p className="mt-2 text-xs leading-6 text-slate-400 dark:text-white/35">
        새로운 이야기가 올라오면 이곳에서 바로 볼 수 있어요.
      </p>
      <Link
        href="/community"
        className="mt-5 inline-flex items-center gap-2 text-sm font-black text-violet-600 hover:text-violet-500 dark:text-violet-300"
      >
        첫 이야기 남기기
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

function InfoPanel({ universe, posts }: { universe: UniverseRow; posts: PostRow[] }) {
  const totalLikes = posts.reduce((sum, post) => sum + (post.like_count ?? 0), 0);
  const totalComments = posts.reduce((sum, post) => sum + (post.comment_count ?? 0), 0);

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Orbit className="size-4 text-violet-500" />
        <h2 className="text-sm font-black">Universe 정보</h2>
      </div>

      <div className="divide-y divide-slate-200 border-y border-slate-200 dark:divide-white/10 dark:border-white/10">
        <InfoLine label="카테고리" value={universe.category || "미분류"} />
        <InfoLine label="구독자" value={`${compactNumber(universe.subscriber_count ?? 0)}명`} />
        <InfoLine label="게시물" value={`${posts.length || universe.post_count || 0}개`} />
        <InfoLine label="좋아요" value={compactNumber(totalLikes)} />
        <InfoLine label="댓글" value={compactNumber(totalComments)} />
      </div>
    </section>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 text-sm">
      <span className="text-slate-400 dark:text-white/35">{label}</span>
      <span className="font-bold text-slate-700 dark:text-white/75">{value}</span>
    </div>
  );
}

function SignalPanel({ posts }: { posts: PostRow[] }) {
  const hottest = useMemo(
    () =>
      [...posts]
        .sort(
          (a, b) =>
            (b.like_count ?? 0) * 2 +
            (b.comment_count ?? 0) -
            ((a.like_count ?? 0) * 2 + (a.comment_count ?? 0))
        )
        .slice(0, 3),
    [posts]
  );

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Flame className="size-4 text-orange-500" />
        <h2 className="text-sm font-black">지금 뜨는 신호</h2>
      </div>

      {hottest.length === 0 ? (
        <div className="border-y border-slate-200 py-8 text-center text-xs text-slate-400 dark:border-white/10 dark:text-white/35">
          아직 신호가 잡히지 않아요.
        </div>
      ) : (
        <div className="border-y border-slate-200 dark:border-white/10">
          {hottest.map((post, index) => (
            <div
              key={post.id}
              className={cn(
                "flex gap-3 py-4",
                index !== hottest.length - 1 && "border-b border-slate-200 dark:border-white/10"
              )}
            >
              <span className="mt-0.5 text-xs font-black text-violet-500">0{index + 1}</span>
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-bold leading-5 text-slate-700 dark:text-white/75">
                  {post.title}
                </p>
                <p className="mt-1.5 text-[11px] text-slate-400 dark:text-white/30">
                  좋아요 {post.like_count ?? 0} · 댓글 {post.comment_count ?? 0}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function UniverseSkeleton() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-24 pt-24 dark:bg-[#03050a]">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="mb-5 h-9 w-32 rounded-full bg-slate-200 dark:bg-white/10" />
        <div className="h-[430px] rounded-[2.2rem] bg-white dark:bg-white/5" />
        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-4">
            <div className="h-8 w-52 rounded bg-slate-200 dark:bg-white/10" />
            <div className="h-20 rounded-2xl bg-white dark:bg-white/5" />
            <div className="h-20 rounded-2xl bg-white dark:bg-white/5" />
          </div>
          <div className="h-72 rounded-2xl bg-white dark:bg-white/5" />
        </div>
      </div>
    </main>
  );
}
