"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  FileText,
  GalleryHorizontalEnd,
  Globe2,
  Image as ImageIcon,
  Info,
  MessageCircle,
  PenLine,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  WifiOff,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type TabKey = "posts" | "popular" | "gallery" | "about";

type UniverseRow = {
  id: number | string;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  subscriber_count: number | null;
  post_count: number | null;
  tags: string[] | null;
};

type PostRow = {
  id: number | string;
  title: string | null;
  content: string | null;
  author: string | null;
  created_at: string | null;
  like_count: number | null;
  comment_count: number | null;
  view_count?: number | null;
  image_url?: string | null;
  preview?: boolean;
};

type RelatedUniverse = Pick<
  UniverseRow,
  "id" | "slug" | "name" | "description" | "subscriber_count"
>;

const tabs: Array<{ key: TabKey; label: string; icon: typeof FileText }> = [
  { key: "posts", label: "게시글", icon: FileText },
  { key: "popular", label: "인기", icon: Star },
  { key: "gallery", label: "갤러리", icon: GalleryHorizontalEnd },
  { key: "about", label: "정보", icon: Info },
];

const previewPosts: PostRow[] = [
  {
    id: "preview-1",
    title: "유니버스 게시글 레이아웃 샘플",
    content: "Supabase가 잠시 연결되지 않아도 페이지 구조를 확인할 수 있도록 보여주는 샘플이에요.",
    author: "Layout Preview",
    created_at: null,
    like_count: 12,
    comment_count: 4,
    view_count: 128,
    preview: true,
  },
  {
    id: "preview-2",
    title: "창작 공유 카드 예시",
    content: "실제 연결이 복구되면 같은 자리에서 해당 유니버스의 실제 게시글이 표시됩니다.",
    author: "Layout Preview",
    created_at: null,
    like_count: 8,
    comment_count: 2,
    view_count: 76,
    preview: true,
  },
  {
    id: "preview-3",
    title: "토론 게시글 카드 예시",
    content: "제목, 본문 미리보기, 좋아요와 댓글 수의 배치를 확인하는 용도입니다.",
    author: "Layout Preview",
    created_at: null,
    like_count: 5,
    comment_count: 7,
    view_count: 54,
    preview: true,
  },
];

function humanizeSlug(slug: string) {
  return decodeURIComponent(slug)
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function makePreviewUniverse(slug: string): UniverseRow {
  return {
    id: `preview-${slug}`,
    slug,
    name: humanizeSlug(slug) || "Universe Preview",
    description:
      "현재 Supabase에 연결할 수 없어 레이아웃 미리보기로 표시하고 있어요. 연결이 복구되면 실제 데이터로 자동 전환됩니다.",
    category: "레이아웃 미리보기",
    subscriber_count: 0,
    post_count: 0,
    tags: [],
  };
}

function compact(value: number | null | undefined) {
  return new Intl.NumberFormat("ko-KR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value ?? 0);
}

function timeAgo(value: string | null, preview?: boolean) {
  if (preview) return "미리보기";
  if (!value) return "최근";
  const target = new Date(value).getTime();
  if (Number.isNaN(target)) return "최근";
  const diff = Math.max(0, Date.now() - target);
  const minute = 60_000;
  const hour = minute * 60;
  const day = hour * 24;
  if (diff < minute) return "방금 전";
  if (diff < hour) return `${Math.floor(diff / minute)}분 전`;
  if (diff < day) return `${Math.floor(diff / hour)}시간 전`;
  if (diff < day * 7) return `${Math.floor(diff / day)}일 전`;
  return new Intl.DateTimeFormat("ko-KR", { month: "short", day: "numeric" }).format(
    new Date(value)
  );
}

export default function UniverseDetailClient({ slug }: { slug: string }) {
  const [universe, setUniverse] = useState<UniverseRow | null>(null);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [related, setRelated] = useState<RelatedUniverse[]>([]);
  const [tab, setTab] = useState<TabKey>("posts");
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [loading, setLoading] = useState(true);
  const [offlinePreview, setOfflinePreview] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setNotice(null);
      setNotFound(false);
      setOfflinePreview(false);

      try {
        const universeResult = await supabase
          .from("universes")
          .select("id,slug,name,description,category,subscriber_count,post_count,tags")
          .eq("slug", slug)
          .maybeSingle();

        if (cancelled) return;

        if (universeResult.error) {
          console.error("Universe load error:", universeResult.error);
          setUniverse(makePreviewUniverse(slug));
          setPosts(previewPosts);
          setOfflinePreview(true);
          setNotice("Supabase 연결을 확인할 수 없어 레이아웃 미리보기 모드로 표시 중이에요.");
          setLoading(false);
          return;
        }

        if (!universeResult.data) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setUniverse(universeResult.data as UniverseRow);

        const [postsResult, relatedResult, authResult] = await Promise.all([
          supabase
            .from("posts")
            .select("*")
            .eq("universe_slug", slug)
            .order("created_at", { ascending: false })
            .limit(50),
          supabase
            .from("universes")
            .select("id,slug,name,description,subscriber_count")
            .neq("slug", slug)
            .order("subscriber_count", { ascending: false })
            .limit(4),
          supabase.auth.getUser(),
        ]);

        if (cancelled) return;

        if (postsResult.error) {
          setNotice("게시글을 불러오지 못했어요. 유니버스 정보만 표시합니다.");
        } else {
          setPosts((postsResult.data ?? []) as PostRow[]);
        }

        if (!relatedResult.error) {
          setRelated((relatedResult.data ?? []) as RelatedUniverse[]);
        }

        const user = authResult.data.user;
        if (user) {
          const subscription = await supabase
            .from("universe_subscriptions")
            .select("id")
            .eq("user_id", user.id)
            .eq("universe_slug", slug)
            .maybeSingle();
          if (!subscription.error) setJoined(Boolean(subscription.data));
        }
      } catch (error) {
        console.error("Universe connection error:", error);
        if (!cancelled) {
          setUniverse(makePreviewUniverse(slug));
          setPosts(previewPosts);
          setOfflinePreview(true);
          setNotice("Supabase 연결에 실패해 레이아웃 샘플을 표시합니다.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const visiblePosts = useMemo(() => {
    if (tab !== "popular") return posts;
    return [...posts].sort(
      (a, b) =>
        (b.like_count ?? 0) + (b.comment_count ?? 0) * 2 -
        ((a.like_count ?? 0) + (a.comment_count ?? 0) * 2)
    );
  }, [posts, tab]);

  const imagePosts = useMemo(
    () => posts.filter((post) => !post.preview && Boolean(post.image_url)),
    [posts]
  );

  async function toggleJoin() {
    if (!universe || joining || offlinePreview) return;
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      window.location.href = "/auth/login";
      return;
    }

    setJoining(true);
    setNotice(null);
    try {
      if (joined) {
        const { error } = await supabase
          .from("universe_subscriptions")
          .delete()
          .eq("user_id", data.user.id)
          .eq("universe_slug", slug);
        if (error) throw error;
        setJoined(false);
      } else {
        const { error } = await supabase.from("universe_subscriptions").insert({
          user_id: data.user.id,
          universe_slug: slug,
        });
        if (error) throw error;
        setJoined(true);
      }
    } catch (error) {
      console.error("Universe subscription error:", error);
      setNotice("구독 상태를 변경하지 못했어요.");
    } finally {
      setJoining(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-[#070711]">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="h-10 w-40 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10" />
          <div className="h-64 animate-pulse rounded-[2rem] bg-white dark:bg-white/5" />
        </div>
      </main>
    );
  }

  if (notFound || !universe) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-slate-50 px-4 dark:bg-[#070711]">
        <div className="text-center">
          <div className="text-4xl">🌌</div>
          <h1 className="mt-4 text-2xl font-black dark:text-white">유니버스를 찾을 수 없어요</h1>
          <Link href="/universe" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white dark:bg-white dark:text-slate-950">
            <ArrowLeft className="h-4 w-4" /> 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#070711] dark:text-white">
      <div className="mx-auto max-w-6xl space-y-5 px-4 py-7 sm:px-6 lg:px-8">
        <Link href="/universe" className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:text-white/45 dark:hover:bg-white/5">
          <ArrowLeft className="h-4 w-4" /> 모든 유니버스
        </Link>

        {notice && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
            <WifiOff className="mt-0.5 h-4 w-4 shrink-0" /> {notice}
          </div>
        )}

        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-white/10 dark:bg-[#0d0d19]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-700 dark:bg-violet-400/10 dark:text-violet-200">
                <Globe2 className="h-3.5 w-3.5" /> {universe.category || "기타"}
              </span>
              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">{universe.name}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base dark:text-white/55">
                {universe.description || "이 유니버스의 소개가 아직 작성되지 않았어요."}
              </p>
              <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold text-slate-500 dark:text-white/45">
                <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" /> 멤버 {compact(universe.subscriber_count)}</span>
                <span className="inline-flex items-center gap-1.5"><FileText className="h-4 w-4" /> 게시글 {compact(universe.post_count)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={toggleJoin} disabled={joining || offlinePreview} className={`min-h-11 min-w-28 rounded-xl px-4 text-sm font-black disabled:opacity-40 ${joined ? "border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5" : "bg-slate-950 text-white dark:bg-white dark:text-slate-950"}`}>
                {joining ? "처리 중..." : joined ? "구독 중" : "구독하기"}
              </button>
              <Link href={`/universe/${slug}/write`} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-black text-white">
                <PenLine className="h-4 w-4" /> 글쓰기
              </Link>
            </div>
          </div>
        </section>

        <nav className="flex w-max max-w-full gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 dark:border-white/10 dark:bg-[#0d0d19]">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button key={key} type="button" onClick={() => setTab(key)} className={`inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-xl px-4 text-sm font-bold ${tab === key ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "text-slate-600 dark:text-white/50"}`}>
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </nav>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
          <section className="min-w-0">
            {(tab === "posts" || tab === "popular") && (
              <div className="space-y-3">
                <h2 className="mb-4 text-xl font-black">{tab === "popular" ? "인기 게시글" : "최근 게시글"}</h2>
                {visiblePosts.length ? visiblePosts.map((post) => <PostCard key={String(post.id)} post={post} />) : <EmptyState title="아직 게시글이 없어요" description="이 유니버스의 첫 이야기를 남겨보세요." />}
              </div>
            )}

            {tab === "gallery" && (
              <div>
                <h2 className="mb-4 text-xl font-black">이미지가 있는 게시글</h2>
                {imagePosts.length ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {imagePosts.map((post) => (
                      <Link key={String(post.id)} href={`/post/${post.id}`} className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0d0d19]">
                        <div className="aspect-video bg-slate-100 dark:bg-white/5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={post.image_url!} alt={post.title || "게시글 이미지"} className="h-full w-full object-cover" />
                        </div>
                        <div className="p-4"><p className="flex items-center gap-2 text-xs text-slate-400"><ImageIcon className="h-3.5 w-3.5" /> 이미지 게시글</p><h3 className="mt-2 font-black">{post.title}</h3></div>
                      </Link>
                    ))}
                  </div>
                ) : <EmptyState title="이미지 게시글이 없어요" description="이미지가 연결된 게시글이 생기면 여기에 모여요." />}
              </div>
            )}

            {tab === "about" && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#0d0d19]">
                <h2 className="flex items-center gap-2 text-lg font-black"><Info className="h-5 w-5 text-violet-600" /> 이 유니버스에 대하여</h2>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-white/55">{universe.description || "아직 자세한 소개가 없어요."}</p>
                {!!universe.tags?.length && <div className="mt-5 flex flex-wrap gap-2">{universe.tags.map((tag) => <span key={tag} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-500 dark:border-white/10">#{tag}</span>)}</div>}
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <InfoCard title="유니버스 정보" icon={Sparkles}>
              <Stat label="카테고리" value={universe.category || "기타"} />
              <Stat label="멤버" value={compact(universe.subscriber_count)} />
              <Stat label="게시글" value={compact(universe.post_count)} />
            </InfoCard>
            <InfoCard title="기본 규칙" icon={ShieldCheck}>
              <ul className="space-y-2 text-sm leading-6 text-slate-600 dark:text-white/50"><li>• 주제에 맞는 글을 올려주세요.</li><li>• 다른 창작자를 존중해주세요.</li><li>• 출처와 저작권을 지켜주세요.</li></ul>
            </InfoCard>
            {!!related.length && <InfoCard title="관련 유니버스" icon={Globe2}>{related.map((item) => <Link key={String(item.id)} href={`/universe/${item.slug}`} className="mb-2 block rounded-xl border border-slate-100 p-3 last:mb-0 dark:border-white/10"><p className="text-sm font-black">{item.name}</p><p className="mt-1 text-xs text-slate-400">멤버 {compact(item.subscriber_count)}</p></Link>)}</InfoCard>}
          </aside>
        </div>
      </div>
    </main>
  );
}

function PostCard({ post }: { post: PostRow }) {
  const body = (
    <>
      <p className="text-xs font-semibold text-slate-400">{post.author || "익명"} · {timeAgo(post.created_at, post.preview)}</p>
      <h3 className="mt-3 text-lg font-black">{post.title || "제목 없는 게시글"}</h3>
      <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-white/50">{post.content || ""}</p>
      <div className="mt-4 flex gap-4 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-400 dark:border-white/10"><span>★ {post.like_count ?? 0}</span><span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {post.comment_count ?? 0}</span><span className="ml-auto">조회 {post.view_count ?? 0}</span></div>
    </>
  );

  if (post.preview) return <article className="rounded-3xl border border-dashed border-violet-200 bg-violet-50/50 p-5 dark:border-violet-400/20 dark:bg-violet-400/5">{body}</article>;
  return <Link href={`/post/${post.id}`} className="block rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-violet-300 dark:border-white/10 dark:bg-[#0d0d19]">{body}</Link>;
}

function InfoCard({ title, icon: Icon, children }: { title: string; icon: typeof Info; children: React.ReactNode }) {
  return <section className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#0d0d19]"><h3 className="mb-3 flex items-center gap-2 text-sm font-black"><Icon className="h-4 w-4 text-violet-600" /> {title}</h3>{children}</section>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="mb-2 flex items-center justify-between text-sm last:mb-0"><span className="text-slate-500 dark:text-white/40">{label}</span><strong>{value}</strong></div>;
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="flex min-h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 text-center dark:border-white/10 dark:bg-white/[0.03]"><GalleryHorizontalEnd className="h-6 w-6 text-violet-500" /><h3 className="mt-3 font-black">{title}</h3><p className="mt-2 text-sm text-slate-500 dark:text-white/40">{description}</p></div>;
}
