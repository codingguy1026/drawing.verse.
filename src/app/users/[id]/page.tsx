import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  GalleryHorizontalEnd,
  Heart,
  MessageCircle,
  MoonStar,
  PenLine,
  Sparkles,
  Users,
} from "lucide-react";
import FollowButton from "@/components/users/FollowButton";
import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

type Profile = {
  id: string;
  nickname: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  about: string | null;
  tags: string[] | null;
  created_at: string | null;
  followers_count: number | null;
  posts_count: number | null;
  artworks_count: number | null;
  universes_count: number | null;
};

type PostRow = {
  id: number;
  title: string;
  content: string | null;
  universe_slug: string | null;
  created_at: string | null;
  like_count: number | null;
  comment_count: number | null;
};

type GalleryRow = {
  id: number;
  title: string;
  thumbnail_url: string | null;
  category: string | null;
  created_at: string | null;
  like_count: number | null;
  comment_count: number | null;
  view_count: number | null;
};

type UniverseRow = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  subscriber_count: number | null;
  post_count: number | null;
};

function compact(value: number | null | undefined) {
  return new Intl.NumberFormat("ko-KR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value ?? 0);
}

function formatJoined(value: string | null) {
  if (!value) return "가입일 없음";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
  }).format(new Date(value));
}

function timeAgo(value: string | null) {
  if (!value) return "최근";
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return "최근";
  const diff = Math.max(0, Date.now() - time);
  if (diff < 60_000) return "방금 전";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}분 전`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}시간 전`;
  return `${Math.floor(diff / 86_400_000)}일 전`;
}

export default async function UserDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select(
      "id,nickname,display_name,avatar_url,bio,about,tags,created_at,followers_count,posts_count,artworks_count,universes_count"
    )
    .eq("id", id)
    .maybeSingle();

  if (profileError || !profileData) notFound();
  const profile = profileData as Profile;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === id;

  const [postsResult, galleryResult] = await Promise.all([
    supabase
      .from("posts")
      .select("id,title,content,universe_slug,created_at,like_count,comment_count")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("gallery")
      .select(
        "id,title,thumbnail_url,category,created_at,like_count,comment_count,view_count"
      )
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  let ownedUniverses: UniverseRow[] = [];
  const ownedResult = await supabase
    .from("universes")
    .select("id,name,slug,description,subscriber_count,post_count")
    .eq("owner_id", id)
    .order("created_at", { ascending: false })
    .limit(6);

  // owner_id is introduced by 20260825_supabase_alignment.sql. Before the
  // migration this section simply remains empty instead of showing fake data.
  if (!ownedResult.error) {
    ownedUniverses = (ownedResult.data ?? []) as UniverseRow[];
  }

  let isFollowing = false;
  if (user && !isOwner) {
    const { data: follow } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", id)
      .maybeSingle();
    isFollowing = Boolean(follow);
  }

  const posts = (postsResult.data ?? []) as PostRow[];
  const gallery = (galleryResult.data ?? []) as GalleryRow[];
  const displayName = profile.display_name || profile.nickname || "이름 없는 창작자";
  const nickname = profile.nickname || "traveler";
  const intro = profile.about || profile.bio || "아직 자기소개가 없어요.";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#070711] dark:text-white">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-7 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:text-white/45 dark:hover:bg-white/5">
          <ArrowLeft className="h-4 w-4" /> 홈으로
        </Link>

        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0d0d19]">
          <div className="h-28 bg-gradient-to-r from-violet-400/40 via-fuchsia-300/30 to-sky-400/40 dark:from-violet-600/25 dark:via-fuchsia-500/15 dark:to-sky-600/20" />
          <div className="p-5 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex min-w-0 items-end gap-4">
                <div className="-mt-16 grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-[1.75rem] border-4 border-white bg-gradient-to-br from-violet-300 to-sky-300 text-4xl font-black shadow-lg dark:border-[#0d0d19]">
                  {profile.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatar_url} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    displayName.slice(0, 1).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-violet-600 dark:text-violet-300">@{nickname}</p>
                  <h1 className="truncate text-3xl font-black tracking-tight sm:text-4xl">{displayName}</h1>
                </div>
              </div>

              {isOwner ? (
                <Link href={`/users/${id}/edit`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-black text-white dark:bg-white dark:text-slate-950">
                  <PenLine className="h-4 w-4" /> 프로필 편집
                </Link>
              ) : (
                <FollowButton profileId={id} initialFollowing={isFollowing} />
              )}
            </div>

            <p className="mt-5 max-w-3xl whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-white/55">{intro}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-slate-400">
              <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {formatJoined(profile.created_at)}</span>
              <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" /> 팔로워 {compact(profile.followers_count)}</span>
            </div>
            {!!profile.tags?.length && <div className="mt-4 flex flex-wrap gap-2">{profile.tags.map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 dark:bg-white/5 dark:text-white/40">#{tag}</span>)}</div>}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="팔로워" value={compact(profile.followers_count)} />
          <StatCard label="게시글" value={compact(profile.posts_count ?? posts.length)} />
          <StatCard label="작품" value={compact(profile.artworks_count ?? gallery.length)} />
          <StatCard label="유니버스" value={compact(profile.universes_count ?? ownedUniverses.length)} />
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div>
            <SectionTitle icon={Sparkles} title="최근 게시글" />
            {posts.length ? (
              <div className="space-y-3">
                {posts.map((post) => (
                  <Link key={post.id} href={`/post/${post.id}`} className="block rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-violet-300 dark:border-white/10 dark:bg-[#0d0d19]">
                    <p className="text-xs font-semibold text-slate-400">{post.universe_slug || "전체"} · {timeAgo(post.created_at)}</p>
                    <h3 className="mt-2 text-lg font-black">{post.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-white/45">{post.content}</p>
                    <div className="mt-3 flex gap-4 text-xs font-semibold text-slate-400"><span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {post.like_count ?? 0}</span><span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {post.comment_count ?? 0}</span></div>
                  </Link>
                ))}
              </div>
            ) : <Empty title="아직 게시글이 없어요" />}
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0d0d19]">
            <h2 className="text-lg font-black">소개</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-500 dark:text-white/45">{intro}</p>
          </aside>
        </section>

        <section>
          <SectionTitle icon={GalleryHorizontalEnd} title="갤러리" />
          {gallery.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((item) => (
                <Link key={item.id} href={`/gallery/${item.id}`} className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0d0d19]">
                  <div className="aspect-[4/3] bg-slate-100 dark:bg-white/5">{item.thumbnail_url && <img src={item.thumbnail_url} alt={item.title} className="h-full w-full object-cover" />}</div>
                  <div className="p-4"><p className="text-xs font-bold text-violet-500">{item.category || "작품"}</p><h3 className="mt-1 font-black">{item.title}</h3><p className="mt-2 text-xs text-slate-400">♥ {item.like_count ?? 0} · 댓글 {item.comment_count ?? 0} · 조회 {item.view_count ?? 0}</p></div>
                </Link>
              ))}
            </div>
          ) : <Empty title="아직 갤러리 작품이 없어요" />}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between"><SectionTitle icon={MoonStar} title="만든 유니버스" compact /><Link href="/universe" className="text-sm font-bold text-violet-600 dark:text-violet-300">탐색하기</Link></div>
          {ownedUniverses.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ownedUniverses.map((item) => (
                <Link key={item.id} href={`/universe/${item.slug}`} className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0d0d19]"><p className="text-xs font-bold text-violet-500">Universe</p><h3 className="mt-2 text-lg font-black">{item.name}</h3><p className="mt-2 line-clamp-2 text-sm text-slate-500 dark:text-white/45">{item.description}</p><p className="mt-4 text-xs font-semibold text-slate-400">멤버 {compact(item.subscriber_count)} · 글 {compact(item.post_count)}</p></Link>
              ))}
            </div>
          ) : <Empty title="아직 만든 유니버스가 없어요" />}
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#0d0d19]"><p className="text-2xl font-black">{value}</p><p className="mt-1 text-xs font-semibold text-slate-400">{label}</p></div>;
}

function SectionTitle({ icon: Icon, title, compact: small }: { icon: typeof Sparkles; title: string; compact?: boolean }) {
  return <h2 className={`${small ? "mb-0" : "mb-4"} flex items-center gap-2 text-xl font-black`}><Icon className="h-5 w-5 text-violet-600 dark:text-violet-300" /> {title}</h2>;
}

function Empty({ title }: { title: string }) {
  return <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center text-sm font-semibold text-slate-400 dark:border-white/10 dark:bg-white/[0.03]">{title}</div>;
}
