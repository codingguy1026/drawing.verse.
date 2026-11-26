"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  Sparkles,
  BadgeCheck,
  MessageCircle,
  Heart,
  PencilLine,
  Orbit,
} from "lucide-react";

type Universe = {
  id: number;
  slug: string;
  name: string;
  description: string;
  category: string;
  subscriberCount: number;
  postCount: number;
};

type PostRow = {
  id: number;
  title: string;
  universe_slug: string | null;
  created_at: string;
  like_count?: number | null;
  comment_count?: number | null;
};

type Stats = {
  postCount: number;
  commentCount: number;
  likeReceived: number;
  subCount: number;
};

function levelMeta(score: number) {
  if (score >= 1000)
    return { name: "초월자", gradient: "from-pink-400/40 to-violet-500/40" };
  if (score >= 500)
    return { name: "고인물", gradient: "from-indigo-400/35 to-sky-500/35" };
  if (score >= 200)
    return { name: "중급자", gradient: "from-emerald-400/30 to-teal-500/30" };
  return { name: "뉴비", gradient: "from-slate-300/30 to-slate-400/30" };
}

function nextThreshold(score: number) {
  if (score < 200) return 200;
  if (score < 500) return 500;
  if (score < 1000) return 1000;
  return score; // 최고등급이면 그대로
}

export default function ActivityClient({ ownerId, initialTab }: { ownerId: string; initialTab: "posts" | "comments" | "subs" }) {
  const router = useRouter();

  const [tab, setTab] = useState<"posts" | "comments" | "subs">(initialTab);

  const [loading, setLoading] = useState(true);
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    postCount: 0,
    commentCount: 0,
    likeReceived: 0,
    subCount: 0,
  });

  const [subs, setSubs] = useState<Universe[]>([]);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [note, setNote] = useState<string | null>(null);

  // 탭 URL 동기화(새로고침/공유-friendly)
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url.toString());
  }, [tab]);

  useEffect(() => {
    let ignore = false;
    let generation = 0;

    async function safeCountPosts(userId: string) {
      const result = await supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);

      return result.error ? 0 : result.count ?? 0;
    }

    async function safeSumLikes(userId: string) {
      const result = await supabase
        .from("posts")
        .select("like_count")
        .eq("user_id", userId);

      if (result.error || !result.data) return 0;

      return result.data.reduce(
        (total, row) => total + (Number(row.like_count ?? 0) || 0),
        0
      );
    }

    async function safeFetchPosts(userId: string) {
      const result = await supabase
        .from("posts")
        .select("id,title,universe_slug,created_at,like_count,comment_count")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (result.error || !result.data) {
        setNote("내 게시글을 불러오지 못했어요.");
        return [];
      }

      return result.data as PostRow[];
    }

    async function safeFetchSubs(userId: string) {
      const subscriptionResult = await supabase
        .from("universe_subscriptions")
        .select("universe_slug")
        .eq("user_id", userId);

      if (subscriptionResult.error || !subscriptionResult.data) return [];

      const slugs = subscriptionResult.data
        .map((row) => row.universe_slug)
        .filter(Boolean);

      if (slugs.length === 0) return [];

      const uniRes = await supabase
        .from("universes")
        .select("id,slug,name,description,category,subscriber_count,post_count")
        .in("slug", slugs);

      if (uniRes.error || !uniRes.data) return [];

      return uniRes.data.map((universe) => ({
        id: universe.id,
        slug: universe.slug,
        name: universe.name,
        description: universe.description ?? "",
        category: universe.category ?? "기타",
        subscriberCount: universe.subscriber_count ?? 0,
        postCount: universe.post_count ?? 0,
      })) as Universe[];
    }

    async function load() {
      if (ignore) return;
      const request = ++generation;
      setLoading(true);
      setNote(null);

      const { data } = await supabase.auth.getUser();
      if (ignore || request !== generation) return;
      const user = data.user;

      if (!user || user.id !== ownerId) {
        setAuthEmail(null);
        setPosts([]);
        setSubs([]);
        setStats({ postCount: 0, commentCount: 0, likeReceived: 0, subCount: 0 });
        router.replace("/login");
        return;
      }

      const userId = user.id;
      const email = user.email ?? null;

      if (!ignore && request === generation) {
        setAuthEmail(email);
      }

      // stats
      const postCount = await safeCountPosts(userId);

      // comments 테이블 없을 수 있음 → 안전하게 0 처리
      let commentCount = 0;
      {
        const c1 = await (supabase as any)
          .from("comments")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId);

        if (!c1.error) commentCount = c1.count ?? 0;
      }

      const likeReceived = await safeSumLikes(userId);

      // subs
      const subsList = await safeFetchSubs(userId);

      // posts list
      const myPosts = await safeFetchPosts(userId);

      if (!ignore && request === generation) {
        setSubs(subsList);
        setPosts(myPosts);

        setStats({
          postCount,
          commentCount,
          likeReceived,
          subCount: subsList.length,
        });

        setLoading(false);
      }
    }

    load();

    const { data: sub } = supabase.auth.onAuthStateChange(() => { void Promise.resolve().then(load); });

    return () => {
      ignore = true;
      sub.subscription.unsubscribe();
    };
  }, [router, ownerId]);

  const score = stats.postCount * 10 + stats.commentCount * 3 + stats.likeReceived * 1;
  const lvl = levelMeta(score);
  const next = nextThreshold(score);
  const progress = next === score ? 100 : Math.max(0, Math.min(100, (score / next) * 100));
  const left = next === score ? 0 : Math.max(0, next - score);

  return (
    <div className="dv-me-page space-y-6">
      <section className="dv-me-hero rounded-2xl border p-5 sm:p-7">
        <h1 className="text-2xl font-extrabold">내 활동</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">나만 볼 수 있는 활동 통계와 구독 목록</p>
        <p className="mt-2 text-xs text-slate-500">{authEmail || "이메일 정보 없음"}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <BadgeCheck className="h-5 w-5 text-violet-400" />
          <strong>{lvl.name}</strong><span>활동점수 {score}</span>
        </div>
        <div className="mt-3 max-w-md">
          <div className="flex justify-between text-xs text-slate-500"><span>EXP</span><span>다음 등급까지 {left}</span></div>
          <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden"><div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500" style={{ width: `${progress}%` }} /></div>
          <p className="mt-1 text-xs text-slate-500">{score} / {next}</p>
        </div>
      </section>

      {/* Stats */}
      <section className="dv-me-stats grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={PencilLine} label="작성글" value={stats.postCount} />
        <StatCard icon={MessageCircle} label="댓글" value={stats.commentCount} />
        <StatCard icon={Heart} label="받은 좋아요" value={stats.likeReceived} />
        <StatCard icon={Orbit} label="구독 유니버스" value={stats.subCount} />
      </section>

      {/* Tabs */}
      <section className="dv-me-activity rounded-2xl border p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <TabButton active={tab === "posts"} onClick={() => setTab("posts")}>
            게시글
          </TabButton>
          <TabButton active={tab === "comments"} onClick={() => setTab("comments")}>
            댓글
          </TabButton>
          <TabButton active={tab === "subs"} onClick={() => setTab("subs")}>
            구독한 유니버스
          </TabButton>

          <div className="ml-auto text-[11px] text-slate-500 inline-flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5" />
            내 활동
          </div>
        </div>

        {note ? (
          <div className="mt-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
            {note}
          </div>
        ) : null}

        <div className="mt-4">
          {loading ? (
            <div className="space-y-3">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : tab === "posts" ? (
            <div className="space-y-2">
              {posts.length === 0 ? (
                <EmptyCard text="아직 작성한 글이 없어요. 첫 작품 올리러 가자 😼✨" />
              ) : (
                posts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition"
                  >
                    <div className="min-w-0">
                      {p.universe_slug ? <Link className="text-sm font-semibold text-white line-clamp-1 hover:underline" href={`/universe/${encodeURIComponent(p.universe_slug)}/${p.id}`}>{p.title}</Link> : <p className="text-sm font-semibold text-white line-clamp-1">{p.title}</p>}
                      <p className="mt-1 text-[11px] text-slate-400">
                        {p.universe_slug ?? "universe"} ·{" "}
                        {new Date(p.created_at).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                    <div className="shrink-0 text-[11px] text-slate-300 flex items-center gap-3">
                      <span className="inline-flex items-center gap-1">
                        <MessageCircle className="h-3.5 w-3.5 text-slate-400" />
                        {Number(p.comment_count ?? 0)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5 text-slate-400" />
                        {Number(p.like_count ?? 0)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : tab === "comments" ? (
            <EmptyCard text="댓글 리스트는 comments 테이블 붙이면 바로 보여줄 수 있어요 🙂 (지금은 카운트만)" />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {subs.length === 0 ? (
                <div className="sm:col-span-2">
                  <EmptyCard text="구독한 유니버스가 아직 없어요. 마음에 드는 우주부터 구독 ㄱㄱ 🪐" />
                </div>
              ) : (
                subs.map((u) => (
                  <Link
                    key={u.id}
                    href={`/universe/${u.slug}`}
                    className="group rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-white line-clamp-1">
                          {u.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                          {u.description}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full border border-white/10 bg-slate-950/40 px-2 py-1 text-[10px] text-slate-300">
                        {u.category}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                      <span>구독 {u.subscriberCount}</span>
                      <span>게시글 {u.postCount}</span>
                    </div>

                    <div className="mt-3 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition" />
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`dv-me-tab rounded-xl px-3 py-2 text-sm font-bold transition ${
        active
          ? "bg-white/10 text-white border border-white/10"
          : "bg-transparent text-slate-400 hover:text-white hover:bg-white/5"
      }`}
    >
      {children}
    </button>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: number;
}) {
  return (
    <div className="dv-me-stat rounded-2xl border p-4 sm:p-5">
      <div className="flex items-center gap-2 text-slate-300">
        <span className="h-9 w-9 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
          <Icon className="h-4 w-4 text-violet-300" />
        </span>
        <p className="text-sm font-semibold">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-[11px] text-slate-500">누적 기준</p>
    </div>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <div className="dv-me-empty rounded-xl border px-4 py-8 text-center text-sm">
      {text}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="dv-me-skeleton rounded-xl border px-4 py-3">
      <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-white/10" />
      <div className="mt-2 h-3 w-1/3 rounded bg-slate-200 dark:bg-white/10" />
    </div>
  );
}
