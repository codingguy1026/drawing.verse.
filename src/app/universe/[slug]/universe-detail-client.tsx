"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Bell, BellOff, BookOpen, Compass, Flame, Image as ImageIcon, Info, MessageCircle, Orbit, PenLine, ShieldCheck, Sparkles, Star, Users } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type UniverseRow = { id: number | string; slug: string; name: string; description: string | null; category: string | null; subscriber_count: number | null; post_count: number | null };
type PostRow = { id: number | string; title: string; author?: string | null; created_at?: string | null; category?: string | null; like_count?: number | null; comment_count?: number | null; universe_slug?: string | null };
type FeedMode = "latest" | "popular";

const cn = (...v: Array<string | false | null | undefined>) => v.filter(Boolean).join(" ");
const compactNumber = (v: number) => new Intl.NumberFormat("ko-KR", { notation: v >= 10000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(v);
function relativeDate(value?: string | null) {
  if (!value) return "방금";
  const date = new Date(value); if (Number.isNaN(date.getTime())) return "최근";
  const m = Math.floor((Date.now() - date.getTime()) / 60000), h = Math.floor(m / 60), d = Math.floor(h / 24);
  if (m < 1) return "방금"; if (m < 60) return `${m}분 전`; if (h < 24) return `${h}시간 전`; if (d < 7) return `${d}일 전`;
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
      const [u, p, a] = await Promise.all([
        supabase.from("universes").select("id,slug,name,description,category,subscriber_count,post_count").eq("slug", slug).maybeSingle(),
        supabase.from("posts").select("*").eq("universe_slug", slug).order("created_at", { ascending: false }).limit(30),
        supabase.auth.getUser(),
      ]);
      if (ignore) return;
      if (u.error || !u.data) { setNotFound(true); setLoading(false); return; }
      setUniverse(u.data as UniverseRow); setPosts((p.data as PostRow[] | null) ?? []); setNotFound(false);
      if (a.data.user) {
        const s = await supabase.from("universe_subscriptions").select("universe_slug").eq("user_id", a.data.user.id).eq("universe_slug", slug).maybeSingle();
        if (!ignore) { if (s.error) setSubscriptionReady(false); else setSubscribed(Boolean(s.data)); }
      }
      if (!ignore) setLoading(false);
    }
    setLoading(true); load();
    const channel = supabase.channel(`universe-detail-${slug}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "posts", filter: `universe_slug=eq.${slug}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "universes", filter: `slug=eq.${slug}` }, load).subscribe();
    return () => { ignore = true; supabase.removeChannel(channel); };
  }, [slug]);

  const sortedPosts = useMemo(() => feedMode === "latest" ? posts : [...posts].sort((a,b) => ((b.like_count ?? 0)*2 + (b.comment_count ?? 0)) - ((a.like_count ?? 0)*2 + (a.comment_count ?? 0))), [feedMode, posts]);

  async function toggleSubscription() {
    if (!universe || subscriptionBusy || !subscriptionReady) return;
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) { window.location.href = "/auth/login"; return; }
    setSubscriptionBusy(true);
    if (subscribed) {
      const { error } = await supabase.from("universe_subscriptions").delete().eq("user_id", user.id).eq("universe_slug", universe.slug);
      if (!error) { setSubscribed(false); setUniverse(p => p ? { ...p, subscriber_count: Math.max((p.subscriber_count ?? 1)-1,0) } : p); }
    } else {
      const { error } = await supabase.from("universe_subscriptions").insert({ user_id: user.id, universe_slug: universe.slug });
      if (!error) { setSubscribed(true); setUniverse(p => p ? { ...p, subscriber_count: (p.subscriber_count ?? 0)+1 } : p); }
    }
    setSubscriptionBusy(false);
  }

  if (loading) return <UniverseSkeleton />;
  if (notFound || !universe) return <main className="min-h-screen bg-slate-50 px-4 py-28 text-slate-950 dark:bg-[#03050a] dark:text-white"><section className="mx-auto max-w-2xl text-center"><Orbit className="mx-auto size-10 text-violet-500"/><h1 className="mt-5 text-4xl font-black">이 유니버스는 아직 없어요.</h1><p className="mt-3 text-slate-500">주소가 바뀌었거나 아직 만들어지지 않은 세계일 수 있어요.</p><Link href="/universe" className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white dark:bg-white dark:text-slate-950"><Compass className="size-4"/> 유니버스 탐색하기</Link></section></main>;

  return <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-950 dark:bg-[#03050a] dark:text-white">
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] overflow-hidden"><div className="absolute left-[10%] top-10 size-[280px] rounded-full bg-violet-400/10 blur-[100px]"/><div className="absolute right-[8%] top-8 size-[340px] rounded-full bg-sky-300/10 blur-[110px]"/></div>
    <div className="relative mx-auto w-full max-w-7xl px-4 pb-24 pt-8 sm:px-6 sm:pt-10 lg:px-8 lg:pt-12">
      <nav className="mb-4 flex items-center justify-between gap-4"><Link href="/universe" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-violet-600 dark:text-white/55"><ArrowLeft className="size-4"/> 모든 유니버스</Link><button onClick={toggleSubscription} disabled={!subscriptionReady || subscriptionBusy} className={cn("inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition disabled:opacity-50", subscribed ? "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-200" : "border-slate-200 bg-white/80 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white/70")}>{subscribed ? <BellOff className="size-4"/> : <Bell className="size-4"/>}{subscriptionBusy ? "처리 중..." : subscribed ? "구독 중" : "구독하기"}</button></nav>
      <Hero universe={universe}/>
      <div className="relative z-10 -mt-5 px-3 sm:px-7"><div className="inline-flex max-w-full items-center gap-1 rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-[0_12px_35px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0a0a12]/95"><button onClick={() => setFeedMode("popular")} className={cn("inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold", feedMode === "popular" ? "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-200" : "text-slate-500 dark:text-white/50")}><Star className="size-4"/> 인기</button><Link href="/gallery" className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500"><ImageIcon className="size-4"/> 갤러리</Link><a href="#universe-info" className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500"><Info className="size-4"/> 정보</a></div></div>
      <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-10"><section><div className="mb-4 flex flex-wrap items-end justify-between gap-4"><div><p className="text-[11px] font-black uppercase tracking-[0.26em] text-violet-500">Community Feed</p><h2 className="mt-1.5 text-2xl font-black tracking-tight sm:text-3xl">{feedMode === "popular" ? "인기 게시글" : "최신 게시글"}</h2></div><div className="inline-flex rounded-full border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-white/5"><button onClick={() => setFeedMode("latest")} className={cn("rounded-full px-4 py-2 text-xs font-bold", feedMode === "latest" ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "text-slate-500")}>최신</button><button onClick={() => setFeedMode("popular")} className={cn("rounded-full px-4 py-2 text-xs font-bold", feedMode === "popular" ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "text-slate-500")}>인기</button></div></div>{sortedPosts.length === 0 ? <EmptyFeed slug={universe.slug}/> : <div className="border-y border-slate-200 dark:border-white/10">{sortedPosts.map((post,i) => <PostRowItem key={post.id} post={post} last={i===sortedPosts.length-1}/>)}</div>}</section></div>
        <aside id="universe-info" className="space-y-5 lg:sticky lg:top-24 lg:h-fit"><InfoPanel universe={universe} posts={posts}/><RulesPanel/></aside>
      </section>
    </div>
  </main>;
}

function Hero({ universe }: { universe: UniverseRow }) { return <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/85 shadow-[0_20px_55px_rgba(148,163,184,0.14)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.045]"><div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[38%] sm:block"><div className="absolute right-[-70px] top-[-100px] size-80 rounded-full border border-violet-300/35"/><div className="absolute right-16 top-12 size-44 rounded-full border border-sky-300/35"/><div className="absolute right-[28%] top-[38%] size-3 rounded-full bg-violet-500 shadow-[0_0_28px_rgba(139,92,246,.7)]"/><div className="absolute right-[12%] top-[48%] h-px w-56 -rotate-12 bg-gradient-to-r from-transparent via-violet-400/70 to-transparent"/></div><div className="relative px-6 py-7 sm:px-9 sm:py-9 lg:px-10"><div className="max-w-3xl"><span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-700 ring-1 ring-violet-100 dark:bg-violet-500/10 dark:text-violet-200"><Orbit className="size-3.5"/>{universe.category ?? "Universe"}</span><h1 className="mt-4 text-4xl font-black tracking-[-0.04em] sm:text-5xl">{universe.name}</h1><p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-white/55">{universe.description ?? "이 유니버스의 이야기가 곧 시작됩니다."}</p><div className="mt-5 flex flex-wrap items-center gap-5 text-sm font-bold text-slate-500"><span className="inline-flex items-center gap-2"><Users className="size-4"/> 멤버 {compactNumber(universe.subscriber_count ?? 0)}</span><span className="inline-flex items-center gap-2"><BookOpen className="size-4"/> 게시글 {compactNumber(universe.post_count ?? 0)}</span></div></div><Link href={`/community?universe=${encodeURIComponent(universe.slug)}`} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-black text-white shadow-[0_12px_28px_rgba(124,58,237,.22)] sm:absolute sm:bottom-8 sm:right-9 sm:mt-0"><PenLine className="size-4"/> 글쓰기</Link></div></section>; }

function EmptyFeed({ slug }: { slug: string }) { return <div className="rounded-[1.6rem] border border-dashed border-slate-300 px-6 py-8 text-center dark:border-white/15"><div className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-500 dark:bg-violet-500/10"><MessageCircle className="size-5"/></div><p className="mt-3 text-base font-black">아직 게시글이 없어요</p><p className="mt-1.5 text-sm text-slate-500">이 유니버스의 첫 이야기를 남겨보세요.</p><Link href={`/community?universe=${encodeURIComponent(slug)}`} className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-black text-white dark:bg-white dark:text-slate-950"><PenLine className="size-4"/> 첫 글 작성하기</Link></div>; }
function PostRowItem({ post, last }: { post: PostRow; last: boolean }) { return <article className={cn("group py-5", !last && "border-b border-slate-200 dark:border-white/10")}><div className="flex items-start justify-between gap-5"><div className="min-w-0"><div className="flex gap-2 text-xs font-bold text-violet-500"><span>{post.category ?? "이야기"}</span><span>·</span><span className="text-slate-400">{relativeDate(post.created_at)}</span></div><h3 className="mt-2 truncate text-lg font-black group-hover:text-violet-600">{post.title}</h3><p className="mt-2 text-xs text-slate-400">{post.author ?? "익명"}</p></div><div className="flex gap-3 text-xs font-bold text-slate-400"><span className="inline-flex items-center gap-1"><Flame className="size-3.5"/>{post.like_count ?? 0}</span><span className="inline-flex items-center gap-1"><MessageCircle className="size-3.5"/>{post.comment_count ?? 0}</span></div></div></article>; }
function InfoPanel({ universe, posts }: { universe: UniverseRow; posts: PostRow[] }) { return <section className="rounded-[1.7rem] border border-slate-200 bg-white/75 p-5 dark:border-white/10 dark:bg-white/[0.04]"><h3 className="flex items-center gap-2 text-sm font-black"><Sparkles className="size-4 text-violet-500"/> 유니버스 정보</h3><dl className="mt-5 space-y-3 text-sm"><div className="flex justify-between"><dt className="text-slate-500">카테고리</dt><dd className="font-black">{universe.category ?? "기타"}</dd></div><div className="flex justify-between"><dt className="text-slate-500">멤버</dt><dd className="font-black">{compactNumber(universe.subscriber_count ?? 0)}</dd></div><div className="flex justify-between"><dt className="text-slate-500">게시글</dt><dd className="font-black">{compactNumber(Math.max(universe.post_count ?? 0, posts.length))}</dd></div></dl></section>; }
function RulesPanel() { return <section className="rounded-[1.7rem] border border-slate-200 bg-white/75 p-5 dark:border-white/10 dark:bg-white/[0.04]"><h3 className="flex items-center gap-2 text-sm font-black"><ShieldCheck className="size-4 text-violet-500"/> 기본 규칙</h3><ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600 dark:text-white/50"><li>• 주제에 맞는 글을 올려주세요.</li><li>• 다른 창작자를 존중해주세요.</li><li>• 출처와 저작권을 지켜주세요.</li></ul></section>; }
function UniverseSkeleton() { return <main className="min-h-screen bg-slate-50 px-4 pb-24 pt-12 dark:bg-[#03050a]"><div className="mx-auto max-w-7xl animate-pulse"><div className="h-5 w-28 rounded-full bg-slate-200"/><div className="mt-5 h-56 rounded-[2rem] bg-white dark:bg-white/5"/><div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]"><div className="h-72 rounded-[2rem] bg-white"/><div className="h-52 rounded-[2rem] bg-white"/></div></div></main>; }
