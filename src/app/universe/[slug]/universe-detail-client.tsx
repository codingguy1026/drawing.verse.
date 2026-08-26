"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bell,
  BellOff,
  BookOpen,
  Clock3,
  Compass,
  Flame,
  Image as ImageIcon,
  Info,
  MessageCircle,
  Orbit,
  PenLine,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
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
      const [universeResult, postsResult, authResult] = await Promise.all([
        supabase
          .from("universes")
          .select("id,slug,name,description,category,subscriber_count,post_count")
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
          if (error) setSubscriptionReady(false);
          else setSubscribed(Boolean(data));
        }
      }
      if (!ignore) setLoading(false);
    }

    setLoading(true);
    load();

    const channel = supabase
      .channel(`universe-detail-${slug}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "posts", filter: `universe_slug=eq.${slug}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "universes", filter: `slug=eq.${slug}` }, load)
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
        setUniverse((prev) => prev ? { ...prev, subscriber_count: Math.max((prev.subscriber_count ?? 1) - 1, 0) } : prev);
      }
    } else {
      const { error } = await supabase
        .from("universe_subscriptions")
        .insert({ user_id: user.id, universe_slug: universe.slug });
      if (!error) {
        setSubscribed(true);
        setUniverse((prev) => prev ? { ...prev, subscriber_count: (prev.subscriber_count ?? 0) + 1 } : prev);
      }
    }
    setSubscriptionBusy(false);
  }

  if (loading) return <UniverseSkeleton />;

  if (notFound || !universe) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-32 text-slate-950 dark:bg-[#03050a] dark:text-white">
        <section className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5">
            <Orbit className="size-7 text-violet-500" />
          </div>
          <p className="mt-7 text-xs font-black uppercase tracking-[0.28em] text-violet-500">Lost in the Verse</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">이 유니버스는 아직 없어요.</h1>
          <p className="mt-4 text-sm leading-7 text-slate-500 dark:text-white/50">주소가 바뀌었거나 아직 만들어지지 않은 세계일 수 있어요.</p>
          <Link href="/universe" className="mt-7 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white dark:bg-white dark:text-slate-950">
            <Compass className="size-4" /> 유니버스 탐색하기
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-950 dark:bg-[#03050a] dark:text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] overflow-hidden">
        <div className="absolute left-[10%] top-20 size-[320px] rounded-full bg-violet-400/10 blur-[110px] dark:bg-violet-500/15" />
        <div className="absolute right-[8%] top-12 size-[380px] rounded-full bg-sky-300/10 blur-[120px] dark:bg-sky-500/10" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        <nav className="mb-5 flex items-center justify-between gap-4">
          <Link href="/universe" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-violet-600 dark:text-white/55 dark:hover:text-white">
            <ArrowLeft className="size-4" /> 모든 유니버스
          </Link>
          <button onClick={toggleSubscription} disabled={!subscriptionReady || subscriptionBusy} className={cn("inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition disabled:opacity-50", subscribed ? "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-200" : "border-slate-200 bg-white/80 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white/70")}>
            {subscribed ? <BellOff className="size-4" /> : <Bell className="size-4" />}
            {subscriptionBusy ? "처리 중..." : subscribed ? "구독 중" : "구독하기"}
          </button>
        </nav>

        <Hero universe={universe} />

        <div className="relative z-10 -mt-5 px-4 sm:px-8">
          <div className="inline-flex max-w-full items-center gap-1 rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-[0_12px_35px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0a0a12]/95">
            <button onClick={() => setFeedMode("popular")} className={cn("inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition", feedMode === "popular" ? "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-200" : "text-slate-500 dark:text-white/50")}><Star className="size-4" /> 인기</button>
            <Link href="/gallery" className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 transition hover:text-violet-600 dark:text-white/50"><ImageIcon className="size-4" /> 갤러리</Link>
            <a href="#universe-info" className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 transition hover:text-violet-600 dark:text-white/50"><Info className="size-4" /> 정보</a>
          </div>
        </div>

        <section className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 space-y-10">
            <section>
              <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.26em] text-violet-500">Community Feed</p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{feedMode === "popular" ? "인기 게시글" : "최신 게시글"}</h2>
                </div>
                <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-white/5">
                  <button onClick={() => setFeedMode("latest")} className={cn("rounded-full px-4 py-2 text-xs font-bold", feedMode === "latest" ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "text-slate-500 dark:text-white/45")}>최신</button>
                  <button onClick={() => setFeedMode("popular")} className={cn("rounded-full px-4 py-2 text-xs font-bold", feedMode === "popular" ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "text-slate-500 dark:text-white/45")}>인기</button>
                </div>
              </div>

              {sortedPosts.length === 0 ? (
                <EmptyFeed slug={universe.slug} />
              ) : (
                <div className="border-y border-slate-200 dark:border-white/10">
                  {sortedPosts.map((post, index) => <PostRowItem key={post.id} post={post} last={index === sortedPosts.length - 1} />)}
                </div>
              )}
            </section>

            <section className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(120deg,#6d28d9_0%,#4f46e5_48%,#0284c7_100%)] px-6 py-8 text-white shadow-[0_24px_70px_rgba(79,70,229,0.22)] sm:px-8 sm:py-10">
              <div className="absolute -right-12 -top-16 size-52 rounded-full border border-white/10" />
              <div className="relative max-w-2xl">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-white/60">Add your signal</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight">이 유니버스에 새로운 이야기를 남겨봐</h2>
                <p className="mt-3 text-sm leading-7 text-white/70">한 줄의 생각도, 긴 설정도, 그림 한 장도 이 우주의 새로운 궤도가 될 수 있어요.</p>
                <Link href="/community" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950"><Plus className="size-4" /> 이야기 시작하기</Link>
              </div>
            </section>
          </div>

          <aside id="universe-info" className="space-y-5 lg:sticky lg:top-24 lg:h-fit">
            <InfoPanel universe={universe} posts={posts} />
            <RulesPanel />
          </aside>
        </section>
      </div>
    </main>
  );
}

function Hero({ universe }: { universe: UniverseRow }) {
  return (
    <section className="relative overflow-hidden rounded-[2.2rem] border border-slate-200/80 bg-white/80 shadow-[0_24px_65px_rgba(148,163,184,0.16)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.045]">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -right-12 -top-20 size-72 rounded-full border border-violet-300/25 dark:border-violet-400/10" />
        <div className="absolute right-20 top-16 size-40 rounded-full border border-sky-300/20 dark:border-sky-400/10" />
        <div className="absolute right-[8%] top-[35%] h-px w-48 rotate-[-18deg] bg-gradient-to-r from-transparent via-violet-300/50 to-transparent" />
        <div className="absolute right-[18%] top-[28%] size-3 rounded-full bg-violet-400/45 shadow-[0_0_24px_rgba(139,92,246,.55)]" />
      </div>
      <div className="relative px-6 py-8 sm:px-9 sm:py-10 lg:px-10">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-700 ring-1 ring-violet-100 dark:bg-violet-500/10 dark:text-violet-200 dark:ring-violet-400/15"><Orbit className="size-3.5" /> {universe.category ?? "Universe"}</span>
          <h1 className="mt-5 text-4xl font-black tracking-[-0.04em] sm:text-5xl">{universe.name}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-white/55">{universe.description ?? "이 유니버스의 이야기가 곧 시작됩니다."}</p>
          <div className="mt-6 flex flex-wrap items-center gap-5 text-sm font-bold text-slate-500 dark:text-white/45">
            <span className="inline-flex items-center gap-2"><Users className="size-4" /> 멤버 {compactNumber(universe.subscriber_count ?? 0)}</span>
            <span className="inline-flex items-center gap-2"><BookOpen className="size-4" /> 게시글 {compactNumber(universe.post_count ?? 0)}</span>
          </div>
        </div>
        <Link href="/community" className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-black text-white shadow-[0_12px_28px_rgba(124,58,237,.22)] transition hover:-translate-y-0.5 sm:absolute sm:bottom-9 sm:right-9 sm:mt-0"><PenLine className="size-4" /> 글쓰기</Link>
      </div>
    </section>
  );
}

function EmptyFeed({ slug }: { slug: string }) {
  return (
    <div className="rounded-[1.8rem] border border-dashed border-slate-300 px-6 py-10 text-center dark:border-white/15">
      <div className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-500 dark:bg-violet-500/10"><MessageCircle className="size-5" /></div>
      <p className="mt-4 text-base font-black">아직 게시글이 없어요</p>
      <p className="mt-2 text-sm text-slate-500 dark:text-white/45">이 유니버스의 첫 이야기를 남겨보세요.</p>
      <Link href={`/community?universe=${encodeURIComponent(slug)}`} className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-black text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"><PenLine className="size-4" /> 첫 글 작성하기</Link>
    </div>
  );
}

function PostRowItem({ post, last }: { post: PostRow; last: boolean }) {
  return (
    <article className={cn("group py-5", !last && "border-b border-slate-200 dark:border-white/10")}>
      <div className="flex items-start justify-between gap-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-violet-500"><span>{post.category ?? "이야기"}</span><span className="text-slate-300 dark:text-white/20">·</span><span className="text-slate-400 dark:text-white/35">{relativeDate(post.created_at)}</span></div>
          <h3 className="mt-2 truncate text-lg font-black tracking-tight transition group-hover:text-violet-600">{post.title}</h3>
          <p className="mt-2 text-xs text-slate-400 dark:text-white/35">{post.author ?? "익명"}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3 pt-1 text-xs font-bold text-slate-400 dark:text-white/35"><span className="inline-flex items-center gap-1"><Flame className="size-3.5" />{post.like_count ?? 0}</span><span className="inline-flex items-center gap-1"><MessageCircle className="size-3.5" />{post.comment_count ?? 0}</span></div>
      </div>
    </article>
  );
}

function InfoPanel({ universe, posts }: { universe: UniverseRow; posts: PostRow[] }) {
  return (
    <section className="rounded-[1.7rem] border border-slate-200 bg-white/75 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
      <h3 className="flex items-center gap-2 text-sm font-black"><Sparkles className="size-4 text-violet-500" /> 유니버스 정보</h3>
      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between gap-4"><dt className="text-slate-500 dark:text-white/45">카테고리</dt><dd className="font-black">{universe.category ?? "기타"}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-slate-500 dark:text-white/45">멤버</dt><dd className="font-black">{compactNumber(universe.subscriber_count ?? 0)}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-slate-500 dark:text-white/45">게시글</dt><dd className="font-black">{compactNumber(Math.max(universe.post_count ?? 0, posts.length))}</dd></div>
      </dl>
    </section>
  );
}

function RulesPanel() {
  return (
    <section className="rounded-[1.7rem] border border-slate-200 bg-white/75 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
      <h3 className="flex items-center gap-2 text-sm font-black"><ShieldCheck className="size-4 text-violet-500" /> 기본 규칙</h3>
      <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600 dark:text-white/50"><li>• 주제에 맞는 글을 올려주세요.</li><li>• 다른 창작자를 존중해주세요.</li><li>• 출처와 저작권을 지켜주세요.</li></ul>
    </section>
  );
}

function UniverseSkeleton() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-24 pt-28 dark:bg-[#03050a]">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="h-5 w-28 rounded-full bg-slate-200 dark:bg-white/10" />
        <div className="mt-8 h-64 rounded-[2rem] bg-white dark:bg-white/5" />
        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]"><div className="h-80 rounded-[2rem] bg-white dark:bg-white/5" /><div className="h-56 rounded-[2rem] bg-white dark:bg-white/5" /></div>
      </div>
    </main>
  );
}
