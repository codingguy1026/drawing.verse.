"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeftRight,
  ArrowRight,
  Copy,
  Flame,
  Link2,
  LoaderCircle,
  MessageCircle,
  Orbit,
  Radio,
  RefreshCw,
  Sparkles,
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
  tags?: string[] | null;
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

type Signal = { label: string; score: number };

const STOP_WORDS = new Set([
  "그리고",
  "그런데",
  "하지만",
  "오늘",
  "이번",
  "진짜",
  "관련",
  "이야기",
  "게시글",
  "the",
  "and",
  "for",
  "with",
  "this",
  "that",
  "from",
]);

const compactNumber = (value: number) =>
  new Intl.NumberFormat("ko-KR", {
    notation: value >= 10000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);

function relativeDate(value?: string | null) {
  if (!value) return "최근";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "최근";
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return "방금";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return date.toLocaleDateString("ko-KR");
}

function extractTokens(post: PostRow) {
  const source = `${post.title} ${post.category ?? ""}`.toLowerCase();
  return (
    source.match(/[0-9a-zA-Z가-힣]{2,}/g)?.filter((token) => !STOP_WORDS.has(token)) ?? []
  );
}

function getSharedSignals(leftPosts: PostRow[], rightPosts: PostRow[]): Signal[] {
  const count = (posts: PostRow[]) => {
    const map = new Map<string, number>();
    posts.forEach((post) => {
      const unique = new Set(extractTokens(post));
      unique.forEach((token) => map.set(token, (map.get(token) ?? 0) + 1));
    });
    return map;
  };

  const left = count(leftPosts);
  const right = count(rightPosts);

  return [...left.entries()]
    .filter(([token]) => right.has(token))
    .map(([label, leftScore]) => ({ label, score: leftScore + (right.get(label) ?? 0) }))
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label, "ko"))
    .slice(0, 6);
}

function UniverseBadge({ universe }: { universe: UniverseRow }) {
  return (
    <div className="rounded-[1.6rem] border border-slate-200/80 bg-white/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.07)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.045] dark:shadow-none">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-violet-500">
            {universe.category ?? "Universe"}
          </p>
          <h2 className="mt-2 truncate text-2xl font-black tracking-tight">{universe.name}</h2>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-white/50">
            {universe.description ?? "아직 소개가 없는 유니버스예요."}
          </p>
        </div>
        <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-200">
          <Orbit className="size-5" />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-xs font-bold text-slate-500 dark:text-white/45">
        <span className="inline-flex items-center gap-1.5">
          <Users className="size-3.5" /> 멤버 {compactNumber(universe.subscriber_count ?? 0)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MessageCircle className="size-3.5" /> 게시글 {compactNumber(universe.post_count ?? 0)}
        </span>
      </div>
      <Link
        href={`/universe/${encodeURIComponent(universe.slug)}`}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-black text-violet-600 transition hover:text-violet-500 dark:text-violet-300"
      >
        유니버스로 이동 <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

function PostCard({ post }: { post: PostRow }) {
  const slug = post.universe_slug ?? "";
  return (
    <Link
      href={`/universe/${encodeURIComponent(slug)}/${post.id}`}
      className="group block rounded-[1.35rem] border border-slate-200/80 bg-white/75 p-4 transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_14px_35px_rgba(124,58,237,0.08)] dark:border-white/10 dark:bg-white/[0.035] dark:hover:border-violet-400/25"
    >
      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
        <span className="text-violet-500">{post.category ?? "이야기"}</span>
        <span>·</span>
        <span>{relativeDate(post.created_at)}</span>
      </div>
      <h3 className="mt-2 line-clamp-2 text-base font-black leading-6 transition group-hover:text-violet-600 dark:group-hover:text-violet-300">
        {post.title}
      </h3>
      <div className="mt-3 flex items-center justify-between gap-3 text-[11px] font-bold text-slate-400">
        <span className="truncate">{post.author ?? "익명"}</span>
        <span className="flex shrink-0 gap-3">
          <span className="inline-flex items-center gap-1"><Flame className="size-3.5" />{post.like_count ?? 0}</span>
          <span className="inline-flex items-center gap-1"><MessageCircle className="size-3.5" />{post.comment_count ?? 0}</span>
        </span>
      </div>
    </Link>
  );
}

function FeedColumn({
  title,
  posts,
  loading,
}: {
  title: string;
  posts: PostRow[];
  loading: boolean;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-black text-slate-700 dark:text-white/70">{title}</h3>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Live Feed</span>
      </div>
      {loading ? (
        <div className="grid min-h-40 place-items-center rounded-[1.4rem] border border-dashed border-slate-200 dark:border-white/10">
          <LoaderCircle className="size-5 animate-spin text-violet-500" />
        </div>
      ) : posts.length ? (
        <div className="space-y-3">{posts.slice(0, 8).map((post) => <PostCard key={post.id} post={post} />)}</div>
      ) : (
        <div className="rounded-[1.4rem] border border-dashed border-slate-300 px-5 py-8 text-center dark:border-white/15">
          <MessageCircle className="mx-auto size-5 text-slate-400" />
          <p className="mt-3 text-sm font-black">아직 잡히는 신호가 없어요.</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">게시글이 생기면 이쪽 전파가 자동으로 들어옵니다.</p>
        </div>
      )}
    </section>
  );
}

export default function WormholeClient() {
  const [universes, setUniverses] = useState<UniverseRow[]>([]);
  const [leftSlug, setLeftSlug] = useState("");
  const [rightSlug, setRightSlug] = useState("");
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loadingUniverses, setLoadingUniverses] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryReady, setQueryReady] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadUniverses() {
      setLoadingUniverses(true);
      const { data, error: queryError } = await supabase
        .from("universes")
        .select("id,slug,name,description,category,subscriber_count,post_count,tags")
        .order("subscriber_count", { ascending: false })
        .limit(60);

      if (ignore) return;
      if (queryError) {
        setError("유니버스 신호를 불러오지 못했어요.");
        setLoadingUniverses(false);
        return;
      }

      const rows = (data as UniverseRow[] | null) ?? [];
      setUniverses(rows);

      const params = new URLSearchParams(window.location.search);
      const requestedLeft = params.get("from");
      const requestedRight = params.get("to");
      const hasLeft = requestedLeft && rows.some((item) => item.slug === requestedLeft);
      const hasRight = requestedRight && rows.some((item) => item.slug === requestedRight);

      const nextLeft = hasLeft ? requestedLeft! : rows[0]?.slug ?? "";
      let nextRight = hasRight ? requestedRight! : rows.find((item) => item.slug !== nextLeft)?.slug ?? "";
      if (nextRight === nextLeft) nextRight = rows.find((item) => item.slug !== nextLeft)?.slug ?? "";

      setLeftSlug(nextLeft);
      setRightSlug(nextRight);
      setQueryReady(true);
      setLoadingUniverses(false);
    }

    loadUniverses();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!queryReady) return;
    const params = new URLSearchParams(window.location.search);
    if (leftSlug) params.set("from", leftSlug); else params.delete("from");
    if (rightSlug) params.set("to", rightSlug); else params.delete("to");
    const search = params.toString();
    window.history.replaceState(null, "", search ? `/wormhole?${search}` : "/wormhole");
  }, [leftSlug, rightSlug, queryReady]);

  useEffect(() => {
    let ignore = false;

    async function loadPosts() {
      if (!leftSlug || !rightSlug || leftSlug === rightSlug) {
        setPosts([]);
        return;
      }
      setLoadingPosts(true);
      const { data, error: queryError } = await supabase
        .from("posts")
        .select("id,title,author,created_at,category,like_count,comment_count,universe_slug")
        .in("universe_slug", [leftSlug, rightSlug])
        .order("created_at", { ascending: false })
        .limit(60);

      if (ignore) return;
      if (queryError) {
        setError("게시글 신호를 불러오지 못했어요.");
        setPosts([]);
      } else {
        setPosts((data as PostRow[] | null) ?? []);
      }
      setLoadingPosts(false);
    }

    loadPosts();
    return () => {
      ignore = true;
    };
  }, [leftSlug, rightSlug]);

  const leftUniverse = universes.find((item) => item.slug === leftSlug) ?? null;
  const rightUniverse = universes.find((item) => item.slug === rightSlug) ?? null;
  const leftPosts = useMemo(() => posts.filter((post) => post.universe_slug === leftSlug), [posts, leftSlug]);
  const rightPosts = useMemo(() => posts.filter((post) => post.universe_slug === rightSlug), [posts, rightSlug]);
  const signals = useMemo(() => getSharedSignals(leftPosts, rightPosts), [leftPosts, rightPosts]);

  function swapUniverses() {
    if (!leftSlug || !rightSlug) return;
    setLeftSlug(rightSlug);
    setRightSlug(leftSlug);
  }

  function randomize() {
    if (universes.length < 2) return;
    const firstIndex = Math.floor(Math.random() * universes.length);
    let secondIndex = Math.floor(Math.random() * (universes.length - 1));
    if (secondIndex >= firstIndex) secondIndex += 1;
    setLeftSlug(universes[firstIndex].slug);
    setRightSlug(universes[secondIndex].slug);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  const canOpen = Boolean(leftUniverse && rightUniverse && leftUniverse.slug !== rightUniverse.slug);

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 px-4 pb-24 pt-28 text-slate-950 dark:bg-[#03050a] dark:text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[680px] overflow-hidden">
        <div className="absolute left-[5%] top-24 size-[360px] rounded-full bg-violet-500/10 blur-[110px]" />
        <div className="absolute right-[4%] top-40 size-[420px] rounded-full bg-sky-400/10 blur-[130px]" />
        <div className="absolute left-1/2 top-52 size-[260px] -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-[90px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[2.2rem] border border-slate-200/80 bg-white/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.045] dark:shadow-none sm:p-9 lg:p-11">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-200">
                <Radio className="size-3.5" /> WORMHOLE BETA
              </span>
              <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-[-0.045em] sm:text-5xl lg:text-6xl">
                서로 다른 우주의 이야기를
                <span className="block bg-gradient-to-r from-violet-600 via-fuchsia-500 to-sky-500 bg-clip-text text-transparent">한 통로로 연결해요.</span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-white/55 sm:text-base">
                두 유니버스를 고르면 양쪽의 최신 이야기를 동시에 보고, 제목과 카테고리에서 겹치는 공통 신호도 찾아줍니다.
              </p>
            </div>

            <div className="relative mx-auto grid size-44 shrink-0 place-items-center sm:size-52">
              <motion.div
                className="absolute inset-0 rounded-full border border-violet-400/40"
                animate={{ rotate: 360 }}
                transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
              >
                <span className="absolute left-1/2 top-[-5px] size-2.5 -translate-x-1/2 rounded-full bg-violet-500 shadow-[0_0_20px_rgba(139,92,246,.9)]" />
              </motion.div>
              <motion.div
                className="absolute inset-5 rounded-full border border-dashed border-sky-400/45"
                animate={{ rotate: -360 }}
                transition={{ duration: 11, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-10 rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,.9),rgba(167,139,250,.35)_18%,rgba(124,58,237,.25)_45%,rgba(2,6,23,.95)_72%)] shadow-[0_0_55px_rgba(124,58,237,.28)] dark:bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,.65),rgba(167,139,250,.28)_18%,rgba(124,58,237,.22)_45%,rgba(0,0,0,.95)_72%)]" />
              <Link2 className="relative z-10 size-7 text-white drop-shadow" />
            </div>
          </div>
        </section>

        <section className="relative z-10 -mt-4 mx-3 rounded-[1.8rem] border border-slate-200 bg-white/95 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#0a0a12]/95 sm:mx-8 sm:p-5">
          {loadingUniverses ? (
            <div className="flex min-h-24 items-center justify-center gap-2 text-sm font-bold text-slate-500">
              <LoaderCircle className="size-4 animate-spin" /> 유니버스 좌표 계산 중...
            </div>
          ) : universes.length < 2 ? (
            <div className="rounded-[1.3rem] border border-dashed border-violet-200 bg-violet-50/60 px-5 py-6 text-center dark:border-violet-400/20 dark:bg-violet-500/[0.07]">
              <Sparkles className="mx-auto size-5 text-violet-500" />
              <p className="mt-2 text-sm font-black">웜홀을 열려면 서로 다른 유니버스가 2개 이상 필요해요.</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">지금은 첫 번째 좌표만 잡혀 있어요. 유니버스가 하나 더 생기면 바로 연결할 수 있습니다.</p>
              <Link href="/universe" className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white dark:bg-white dark:text-slate-950">
                유니버스 둘러보기 <ArrowRight className="size-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid items-end gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto]">
              <label className="block">
                <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Departure</span>
                <select
                  value={leftSlug}
                  onChange={(event) => setLeftSlug(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black outline-none transition focus:border-violet-400 dark:border-white/10 dark:bg-white/5"
                >
                  {universes.map((universe) => (
                    <option key={universe.slug} value={universe.slug} disabled={universe.slug === rightSlug} className="text-slate-950">
                      {universe.name}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={swapUniverses}
                className="grid size-12 place-items-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:rotate-180 hover:border-violet-300 hover:text-violet-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60"
                aria-label="유니버스 위치 바꾸기"
              >
                <ArrowLeftRight className="size-4" />
              </button>

              <label className="block">
                <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Destination</span>
                <select
                  value={rightSlug}
                  onChange={(event) => setRightSlug(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black outline-none transition focus:border-sky-400 dark:border-white/10 dark:bg-white/5"
                >
                  {universes.map((universe) => (
                    <option key={universe.slug} value={universe.slug} disabled={universe.slug === leftSlug} className="text-slate-950">
                      {universe.name}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={randomize}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-black text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
              >
                <RefreshCw className="size-4" /> 랜덤
              </button>
            </div>
          )}
        </section>

        {error && (
          <div className="mx-auto mt-5 max-w-2xl rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm font-bold text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        )}

        {canOpen && leftUniverse && rightUniverse && (
          <>
            <section className="mt-8 grid items-stretch gap-5 lg:grid-cols-[1fr_180px_1fr]">
              <UniverseBadge universe={leftUniverse} />

              <div className="relative flex min-h-32 items-center justify-center overflow-hidden rounded-[1.6rem] border border-violet-200/80 bg-[radial-gradient(circle,rgba(139,92,246,.14),transparent_66%)] dark:border-violet-400/15">
                <motion.div
                  className="absolute size-24 rounded-full border-2 border-violet-400/40 border-t-violet-500"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute size-16 rounded-full border border-dashed border-sky-400/60"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 3.6, repeat: Infinity, ease: "linear" }}
                />
                <div className="relative z-10 text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-violet-500">Link Open</p>
                  <p className="mt-1 text-xs font-black">신호 연결 중</p>
                </div>
              </div>

              <UniverseBadge universe={rightUniverse} />
            </section>

            <section className="mt-7 rounded-[1.8rem] border border-slate-200/80 bg-white/70 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.035] sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-fuchsia-500">Shared Signals</p>
                  <h2 className="mt-1.5 text-xl font-black">두 우주에서 동시에 잡힌 신호</h2>
                </div>
                <button
                  type="button"
                  onClick={copyLink}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-600 transition hover:border-violet-300 hover:text-violet-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60"
                >
                  <Copy className="size-3.5" /> {copied ? "복사됨!" : "웜홀 링크 복사"}
                </button>
              </div>

              {signals.length ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {signals.map((signal, index) => (
                    <motion.span
                      key={signal.label}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-200"
                    >
                      #{signal.label}
                    </motion.span>
                  ))}
                </div>
              ) : (
                <div className="mt-5 flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 px-4 py-4 text-sm text-slate-500 dark:border-white/10">
                  <Radio className="size-4 shrink-0" /> 아직 공통 키워드는 잡히지 않았어요. 양쪽에 이야기가 쌓이면 자동으로 나타납니다.
                </div>
              )}
            </section>

            <section className="mt-7 grid gap-7 lg:grid-cols-2">
              <FeedColumn title={`${leftUniverse.name}에서 오는 신호`} posts={leftPosts} loading={loadingPosts} />
              <FeedColumn title={`${rightUniverse.name}에서 오는 신호`} posts={rightPosts} loading={loadingPosts} />
            </section>
          </>
        )}
      </div>
    </main>
  );
}
