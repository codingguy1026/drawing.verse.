"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  Sparkles,
  BadgeCheck,
  MessageCircle,
  Heart,
  PencilLine,
  Orbit,
  Settings,
} from "lucide-react";

type Profile = {
  nickname: string | null;
  bio?: string | null;
};

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

export default function MePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as "posts" | "comments" | "subs") ?? "posts";

  const [tab, setTab] = useState<"posts" | "comments" | "subs">(initialTab);

  const [loading, setLoading] = useState(true);
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);

  const [profile, setProfile] = useState<Profile>({ nickname: null, bio: null });
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

    async function safeCountPosts(userId: string, nick: string | null) {
      // 1) author_id 있으면 그걸로
      const try1 = await supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("author_id", userId);

      if (!try1.error) return try1.count ?? 0;

      // 2) 없으면 author(문자열)로
      if (nick) {
        const try2 = await supabase
          .from("posts")
          .select("id", { count: "exact", head: true })
          .eq("author", nick);

        if (!try2.error) return try2.count ?? 0;
      }

      return 0;
    }

    async function safeSumLikes(userId: string, nick: string | null) {
      // posts.like_count 합계(컬럼 없으면 0)
      const try1 = await supabase
        .from("posts")
        .select("like_count, author_id, author");

      if (try1.error || !try1.data) return 0;

      const rows = try1.data as any[];
      const filtered = rows.filter((r) => {
        if (r.author_id && r.author_id === userId) return true;
        if (!r.author_id && nick && r.author === nick) return true;
        return false;
      });

      return filtered.reduce((acc, r) => acc + (Number(r.like_count ?? 0) || 0), 0);
    }

    async function safeFetchPosts(userId: string, nick: string | null) {
      // 최신 10개
      // 1) author_id 필터
      const q1 = await supabase
        .from("posts")
        .select("id,title,universe_slug,created_at,like_count,comment_count")
        .eq("author_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (!q1.error && q1.data) return q1.data as PostRow[];

      // 2) author 문자열 필터
      if (nick) {
        const q2 = await supabase
          .from("posts")
          .select("id,title,universe_slug,created_at,like_count,comment_count")
          .eq("author", nick)
          .order("created_at", { ascending: false })
          .limit(10);

        if (!q2.error && q2.data) return q2.data as PostRow[];
      }

      // 3) 필터 불가면 그냥 최신 10개라도(빈화면 방지)
      const q3 = await supabase
        .from("posts")
        .select("id,title,universe_slug,created_at,like_count,comment_count")
        .order("created_at", { ascending: false })
        .limit(10);

      if (!q3.error && q3.data) {
        setNote("⚠️ posts 테이블에 author_id/author 기준이 없어서, 전체 최신글을 임시로 보여줘요.");
        return q3.data as PostRow[];
      }

      return [];
    }

    async function safeFetchSubs(userId: string) {
      // subscriptions 테이블이 있을 수도/없을 수도 → 방어
      // 후보 이름 2개 시도
      const candidates = ["subscriptions", "universe_subscriptions"];
      let slugs: string[] = [];

      for (const table of candidates) {
        const res = await (supabase as any)
          .from(table)
          .select("universe_slug")
          .eq("user_id", userId);

        if (!res.error && res.data) {
          slugs = (res.data as any[]).map((r) => r.universe_slug).filter(Boolean);
          break;
        }
      }

      if (slugs.length === 0) return [];

      const uniRes = await supabase
        .from("universes")
        .select("id,slug,name,description,category,subscriber_count,post_count")
        .in("slug", slugs);

      if (uniRes.error || !uniRes.data) return [];

      return (uniRes.data as any[]).map((u) => ({
        id: u.id,
        slug: u.slug,
        name: u.name,
        description: u.description,
        category: u.category,
        subscriberCount: u.subscriber_count ?? 0,
        postCount: u.post_count ?? 0,
      })) as Universe[];
    }

    async function load() {
      setLoading(true);
      setNote(null);

      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user) {
        router.replace("/auth/login");
        return;
      }

      const userId = user.id;
      const email = user.email ?? null;

      if (!ignore) {
        setUid(userId);
        setAuthEmail(email);
      }

      // profile
      const profRes = await supabase
        .from("profiles")
        .select("nickname,bio")
        .eq("id", userId)
        .maybeSingle();

      const nick = profRes.data?.nickname ?? null;

      // stats
      const postCount = await safeCountPosts(userId, nick);

      // comments 테이블 없을 수 있음 → 안전하게 0 처리
      let commentCount = 0;
      {
        const c1 = await (supabase as any)
          .from("comments")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId);

        if (!c1.error) commentCount = c1.count ?? 0;
      }

      const likeReceived = await safeSumLikes(userId, nick);

      // subs
      const subsList = await safeFetchSubs(userId);

      // posts list
      const myPosts = await safeFetchPosts(userId, nick);

      if (!ignore) {
        setProfile({
          nickname: nick,
          bio: (profRes.data as any)?.bio ?? null,
        });

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

    const { data: sub } = supabase.auth.onAuthStateChange(() => load());

    return () => {
      ignore = true;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  const nickname = profile.nickname ?? "Traveler";
  const avatar = useMemo(() => (nickname[0] ?? authEmail?.[0] ?? "D").toUpperCase(), [nickname, authEmail]);

  const score = stats.postCount * 10 + stats.commentCount * 3 + stats.likeReceived * 1;
  const lvl = levelMeta(score);
  const next = nextThreshold(score);
  const progress = next === score ? 100 : Math.max(0, Math.min(100, (score / next) * 100));
  const left = next === score ? 0 : Math.max(0, next - score);

  return (
    <div className="space-y-6">
      {/* Header / Profile Card */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-[0_0_30px_rgba(15,23,42,0.6)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0">
          <div className={`absolute -top-24 -left-16 h-72 w-72 rounded-full bg-gradient-to-tr ${lvl.gradient} blur-3xl`} />
          <div className="absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
        </div>

        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
              <span className="text-lg font-black text-white">{avatar}</span>
              <span className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-violet-500/20 blur-xl" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-white tracking-tight">{nickname}</h1>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-slate-200">
                  <BadgeCheck className="h-3.5 w-3.5 text-violet-300" />
                  {lvl.name}
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-400">
                {authEmail ? authEmail : "이메일 정보 없음"}{" "}
                <span className="mx-2 text-slate-600">·</span>
                활동점수 <span className="text-sky-300 font-semibold">{score}</span>
              </p>

              {profile.bio ? (
                <p className="mt-2 text-sm text-slate-300 max-w-xl line-clamp-2">{profile.bio}</p>
              ) : (
                <p className="mt-2 text-sm text-slate-400">
                  소개글이 비어있어요. <span className="text-violet-300">설정</span>에서 한 줄 추가해봐 😼✨
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <Link
              href="/settings"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition"
            >
              <Settings className="h-4 w-4 text-slate-300" />
              프로필/설정
            </Link>

            <div className="w-full max-w-sm">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>EXP</span>
                <span>
                  다음 등급까지{" "}
                  <span className="text-sky-300 font-semibold">{left}</span>
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                {next === score ? "최고등급 달성 🪐" : `${score} / ${next}`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={PencilLine} label="작성글" value={stats.postCount} />
        <StatCard icon={MessageCircle} label="댓글" value={stats.commentCount} />
        <StatCard icon={Heart} label="받은 좋아요" value={stats.likeReceived} />
        <StatCard icon={Orbit} label="구독 유니버스" value={stats.subCount} />
      </section>

      {/* Tabs */}
      <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-2xl shadow-[0_0_20px_rgba(15,23,42,0.45)]">
        <div className="flex items-center gap-2">
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
            My Space
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
                      <p className="text-sm font-semibold text-white line-clamp-1">{p.title}</p>
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
      onClick={onClick}
      className={`rounded-2xl px-3 py-2 text-sm font-bold transition ${
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
    <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-2xl shadow-[0_0_18px_rgba(15,23,42,0.35)]">
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
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-slate-300">
      {text}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="h-4 w-2/3 rounded bg-white/10" />
      <div className="mt-2 h-3 w-1/3 rounded bg-white/10" />
    </div>
  );
}
