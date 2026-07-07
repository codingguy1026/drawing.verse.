// src/app/users/[id]/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import type { ElementType } from "react";
import Image from "next/image";
import FollowButton from "@/components/users/FollowButton";
import {
    ArrowUpRight,
    BadgeCheck,
    BookOpen,
    Brush,
    CalendarDays,
    ChevronRight,
    Crown,
    Eye,
    Flame,
    GalleryHorizontalEnd,
    Heart,
    Link as LinkIcon,
    MessageCircle,
    MoonStar,
    MoreHorizontal,
    Palette,
    PenLine,
    Rocket,
    Search,
    Share2,
    ShieldCheck,
    Sparkles,
    Star,
    Users,
    WandSparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

type PageProps = {
    params: Promise<{ id: string }>;
};

type Profile = {
    id: string;
    nickname: string | null;
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    about: string | null;
    created_at: string | null;
    followers_count?: number | null;
    posts_count?: number | null;
    artworks_count?: number | null;
    universes_count?: number | null;
};

type Post = {
    id: string;
    title: string | null;
    content: string | null;
    universe_slug: string | null;
    created_at: string | null;
    likes_count?: number | null;
    comments_count?: number | null;
    views_count?: number | null;
};

type Artwork = {
    id: string;
    title: string | null;
    image_url: string | null;
    tag: string | null;
    score?: number | null;
    created_at: string | null;
};

type Universe = {
    id: string;
    name: string | null;
    slug: string | null;
    description: string | null;
    members_count?: number | null;
};

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey) {
        throw new Error(
            "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
        );
    }

    return createClient(url, serviceRoleKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });
}

async function getUserSupabase() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll() {
                    // Server Component에서는 쿠키 쓰기 안 함
                },
            },
        }
    );
}

function cn(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(" ");
}

function formatDate(date: string | null) {
    if (!date) return "알 수 없음";

    return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "2-digit",
    }).format(new Date(date));
}

function getInitial(name: string) {
    return name.trim().slice(0, 1).toUpperCase() || "D";
}

function compactNumber(value: number | null | undefined) {
    const number = value ?? 0;

    return new Intl.NumberFormat("ko-KR", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(number);
}

function timeAgo(date: string | null) {
    if (!date) return "언젠가";

    const now = Date.now();
    const target = new Date(date).getTime();
    const diff = Math.max(0, now - target);

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < minute) return "방금 전";
    if (diff < hour) return `${Math.floor(diff / minute)}분 전`;
    if (diff < day) return `${Math.floor(diff / hour)}시간 전`;
    if (diff < day * 7) return `${Math.floor(diff / day)}일 전`;

    return new Intl.DateTimeFormat("ko-KR", {
        month: "short",
        day: "numeric",
    }).format(new Date(date));
}

function StatCard({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: string;
    icon: ElementType;
}) {
    return (
        <div className="group relative overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.06] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-slate-300 dark:border-white/20 hover:bg-white/[0.08]">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 transition group-hover:opacity-100" />

            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white shadow-inner shadow-white/5">
                <Icon size={18} />
            </div>

            <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {value}
            </div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</div>
        </div>
    );
}

function EmptyState({
    title,
    description,
    icon: Icon,
}: {
    title: string;
    description: string;
    icon: ElementType;
}) {
    return (
        <div className="relative overflow-hidden rounded-3xl border border-dashed border-slate-300 dark:border-white/15 bg-white/50 dark:bg-white/40 dark:bg-black/20 p-8 text-center">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(216,180,254,0.16),transparent_45%)]" />

            <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl border border-slate-200 dark:border-white/10 bg-white/[0.07] text-cyan-700 dark:text-cyan-100">
                <Icon size={24} />
            </div>

            <p className="relative text-lg font-black text-slate-900 dark:text-white">{title}</p>
            <p className="relative mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {description}
            </p>
        </div>
    );
}

function ProfileHero({
    profile,
    isOwner,
    isFollowing,
    stats,
}: {
    profile: Profile;
    isOwner: boolean;
    isFollowing: boolean;
    stats: { posts: number; artworks: number; universes: number };
}) {
    const displayName =
        profile.display_name || profile.nickname || "이름 없는 창작자";
    const nickname = profile.nickname || "unknown";
    const bio =
        profile.bio ||
        profile.about ||
        "아직 자기소개가 없어요. 하지만 분명 엄청난 세계관을 숨기고 있을지도 몰라요.";

    const statsTotal = stats.posts + stats.artworks + stats.universes;
    
    let level = 1;
    let auraClass = "shadow-[0_25px_70px_rgba(99,102,241,0.45)]";
    let glowClass = "";
    let title = "Novice Creator";
    let titleColor = "text-slate-900 dark:text-white/80";

    if (statsTotal >= 20) {
        level = 4;
        title = "Legendary Worldbuilder";
        auraClass = "ring-2 ring-fuchsia-400 shadow-[0_0_60px_rgba(217,70,239,0.8)]";
        glowClass = "absolute -inset-6 rounded-[3rem] bg-gradient-to-r from-fuchsia-500 via-indigo-500 to-cyan-500 opacity-60 blur-2xl animate-[spin_8s_linear_infinite]";
        titleColor = "text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400 font-black drop-shadow-[0_0_12px_rgba(217,70,239,0.6)]";
    } else if (statsTotal >= 10) {
        level = 3;
        title = "Advanced Creator";
        auraClass = "ring-2 ring-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.5)]";
        glowClass = "absolute -inset-4 rounded-[3rem] bg-gradient-to-r from-cyan-500 to-indigo-500 opacity-40 blur-xl animate-[spin_15s_linear_infinite]";
        titleColor = "text-cyan-600 dark:text-cyan-300 font-black drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]";
    } else if (statsTotal >= 3) {
        level = 2;
        title = "Universe Explorer";
        auraClass = "ring-1 ring-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.4)]";
        glowClass = "absolute -inset-3 rounded-[3rem] bg-indigo-500 opacity-20 blur-lg";
        titleColor = "text-indigo-600 dark:text-indigo-300 font-bold";
    }

    return (
        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.06] shadow-[0_35px_100px_rgba(0,0,0,0.35)] ring-1 ring-slate-200 dark:ring-white/5 backdrop-blur-2xl">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(99,102,241,0.35),rgba(236,72,153,0.18),rgba(34,211,238,0.18))]" />


            <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.15fr_0.85fr] lg:p-9">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
                        <div className="relative z-10">
                            {glowClass && <div className={cn("z-[-1]", glowClass)} />}
                            <div className={cn("relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[2rem] border border-slate-300 dark:border-white/20 bg-gradient-to-br from-indigo-300 via-fuchsia-300 to-cyan-200 text-6xl font-black text-[#090a18] transition-all duration-1000", auraClass)}>
                                {profile.avatar_url ? (
                                    <Image
                                        src={profile.avatar_url}
                                        alt={`${displayName} avatar`}
                                        fill
                                        className="object-cover"
                                        priority
                                        sizes="112px"
                                    />
                                ) : (
                                    getInitial(displayName)
                                )}

                                {level >= 3 && (
                                    <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-300 dark:border-white/20 bg-white dark:bg-[#101225] text-cyan-600 dark:text-cyan-200 shadow-xl">
                                        <Crown size={18} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="min-w-0">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/10 px-3 py-1 text-xs font-bold text-cyan-700 dark:text-cyan-100">
                                    @{nickname}
                                </span>

                                <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-100">
                                    창작 활동 중
                                </span>
                            </div>

                            <h1 className="flex flex-wrap items-center gap-3 text-4xl font-black tracking-tight sm:text-5xl">
                                {displayName}
                                {level >= 2 && <BadgeCheck className="text-cyan-600 dark:text-cyan-200" size={30} />}
                            </h1>

                            <p className={cn("mt-2 text-lg font-bold", titleColor)}>
                                {title}
                            </p>

                            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-700 dark:text-slate-200 sm:text-base">
                                {bio}
                            </p>
                        </div>
                    </div>


                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                        <span className="inline-flex items-center gap-2">
                            <CalendarDays size={16} /> 가입 {formatDate(profile.created_at)}
                        </span>

                        <span className="inline-flex items-center gap-2">
                            <LinkIcon size={16} /> drawing-verse.app/users/{profile.id}
                        </span>

                        <span className="inline-flex items-center gap-2">
                            <ShieldCheck size={16} /> 안전한 창작자 프로필
                        </span>
                    </div>
                </div>

                <aside className="flex flex-col justify-between gap-5 rounded-[1.75rem] border border-slate-200 dark:border-white/10 bg-white/55 dark:bg-[#080a18]/55 p-5 backdrop-blur-xl">

                    <div className="grid grid-cols-2 gap-3">
                        {isOwner ? (
                            <Link
                                href={`/users/${profile.id}/edit`}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-200 via-white to-fuchsia-200 px-4 py-3 text-sm font-black text-white dark:text-[#080a18] shadow-[0_12px_35px_rgba(216,180,254,0.22)] transition hover:scale-[1.02]"
                            >
                                <PenLine size={17} /> 편집
                            </Link>
                        ) : (
                            <FollowButton
                                profileId={profile.id}
                                initialFollowing={isFollowing}
                            />
                        )}

                        <Link
                            href={`/messages?to=${profile.id}`}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/10 px-4 py-3 text-sm font-black text-slate-900 dark:text-white transition hover:bg-white/15"
                        >
                            <MessageCircle size={17} /> 대화
                        </Link>

                        <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/10 px-4 py-3 text-sm font-black text-slate-900 dark:text-white transition hover:bg-white/15">
                            <Share2 size={17} /> 공유
                        </button>

                        <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/10 px-4 py-3 text-sm font-black text-slate-900 dark:text-white transition hover:bg-white/15">
                            <Star size={17} /> 저장
                        </button>
                    </div>
                </aside>
            </div>
        </section>
    );
}



function RecentPosts({ posts }: { posts: Post[] }) {
    if (posts.length === 0) {
        return (
            <EmptyState
                title="아직 게시글이 없어요"
                description="첫 게시글이 올라오면 여기에 반짝 뜰 거예요."
                icon={PenLine}
            />
        );
    }

    return (
        <div className="space-y-3">
            {posts.map((post) => (
                <article
                    key={post.id}
                    className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white/40 dark:bg-black/20 p-4 transition hover:bg-white/[0.07]"
                >
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                        <span className="rounded-full bg-slate-100 dark:bg-white/10 px-2 py-1 text-cyan-700 dark:text-cyan-100">
                            {post.universe_slug || "free"}
                        </span>
                        <span>{timeAgo(post.created_at)}</span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        {post.title || "제목 없는 게시글"}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {post.content || "내용이 비어 있어요."}
                    </p>

                    <div className="mt-4 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1">
                            <Heart size={15} /> {compactNumber(post.likes_count)}
                        </span>

                        <span className="inline-flex items-center gap-1">
                            <MessageCircle size={15} /> {compactNumber(post.comments_count)}
                        </span>

                        <span className="inline-flex items-center gap-1">
                            <Eye size={15} /> {compactNumber(post.views_count)}
                        </span>
                    </div>
                </article>
            ))}
        </div>
    );
}

function GalleryGrid({ artworks }: { artworks: Artwork[] }) {
    if (artworks.length === 0) {
        return (
            <EmptyState
                title="아직 공개된 작품이 없어요"
                description="갤러리에 작품이 생기면 여기서 바로 보여요."
                icon={GalleryHorizontalEnd}
            />
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {artworks.map((art) => (
                <article
                    key={art.id}
                    className="group overflow-hidden rounded-[1.75rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.06] p-3 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/[0.08]"
                >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[1.35rem] bg-gradient-to-br from-indigo-300/30 via-fuchsia-300/20 to-cyan-200/25">
                        {art.image_url ? (
                            <Image
                                src={art.image_url}
                                alt={art.title || "artwork"}
                                fill
                                className="object-cover transition duration-500 group-hover:scale-105"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                        ) : (
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_30%),radial-gradient(circle_at_70%_65%,rgba(255,255,255,0.24),transparent_24%)]" />
                        )}

                        <div className="absolute bottom-3 left-3 rounded-full bg-black/35 px-3 py-1 text-xs font-black text-slate-900 dark:text-white backdrop-blur-xl">
                            #{art.tag || "dream"}
                        </div>

                        <div className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-white dark:text-[#080a18]">
                            ★ {art.score ?? "9.5"}
                        </div>
                    </div>

                    <div className="p-3">
                        <h3 className="text-lg font-black">{art.title || "Untitled"}</h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {timeAgo(art.created_at)}
                        </p>
                    </div>
                </article>
            ))}
        </div>
    );
}

function UniverseGrid({ universes }: { universes: Universe[] }) {
    if (universes.length === 0) {
        return (
            <EmptyState
                title="참여 중인 유니버스가 없어요"
                description="유니버스 활동이 생기면 여기에 착륙해요."
                icon={MoonStar}
            />
        );
    }

    return (
        <div className="grid gap-4 lg:grid-cols-3">
            {universes.map((verse, index) => (
                <Link
                    key={verse.id}
                    href={`/universe/${verse.slug}`}
                    className="overflow-hidden rounded-[1.75rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.06] backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/[0.08]"
                >
                    <div
                        className={cn(
                            "h-32 bg-gradient-to-br",
                            index % 3 === 0 && "from-indigo-400/25 to-fuchsia-400/25",
                            index % 3 === 1 && "from-cyan-400/25 to-blue-400/25",
                            index % 3 === 2 && "from-rose-400/25 to-orange-300/25"
                        )}
                    />

                    <div className="p-5">
                        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/10">
                            <MoonStar size={20} />
                        </div>

                        <h3 className="text-xl font-black">
                            {verse.name || "이름 없는 유니버스"}
                        </h3>

                        <p className="mt-2 min-h-20 leading-6 text-slate-600 dark:text-slate-300">
                            {verse.description || "설명이 아직 없어요."}
                        </p>

                        <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 dark:border-white/10 bg-white/40 dark:bg-black/20 px-3 py-3">
                            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">멤버</span>
                            <span className="font-black text-slate-900 dark:text-white">
                                {compactNumber(verse.members_count)}
                            </span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}

export default async function UserDetailPage({ params }: PageProps) {
    const { id } = await params;

    const supabase = getSupabaseAdmin();
    const userSupabase = await getUserSupabase();

    const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(
            "id,nickname,display_name,avatar_url,bio,about,created_at,followers_count,posts_count,artworks_count,universes_count"
        )
        .eq("id", id)
        .maybeSingle();

    const profile = profileData as Profile | null;

    if (profileError || !profile) {
        notFound();
    }

    const {
        data: { user },
    } = await userSupabase.auth.getUser();

    const isOwner = user?.id === profile.id;
    let isFollowing = false;

    if (user && !isOwner) {
        const { data: follow } = await userSupabase
            .from("follows")
            .select("id")
            .eq("follower_id", user.id)
            .eq("following_id", profile.id)
            .maybeSingle();

        isFollowing = !!follow;
    }

    const [{ data: postsData }, { data: artworksData }, { data: universesData }] =
        await Promise.all([
            supabase
                .from("posts")
                .select(
                    "id,title,content,universe_slug,created_at,likes_count,comments_count,views_count"
                )
                .eq("author_id", profile.id)
                .order("created_at", { ascending: false })
                .limit(3),

            supabase
                .from("gallery")
                .select("id,title,image_url,tag,score,created_at")
                .eq("user_id", profile.id)
                .order("created_at", { ascending: false })
                .limit(6),

            supabase
                .from("universes")
                .select("id,name,slug,description,members_count")
                .order("members_count", { ascending: false })
                .limit(3),
        ]);

    const posts = (postsData ?? []) as Post[];
    const artworks = (artworksData ?? []) as Artwork[];
    const universes = (universesData ?? []) as Universe[];

    const displayName = profile.display_name || profile.nickname || "창작자";

    return (
        <main className="min-h-screen overflow-hidden bg-[#f4f2ff] text-slate-900 dark:bg-[#070816] dark:text-white">
            <div className="pointer-events-none fixed inset-0">
                <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
                <div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-cyan-400/15 blur-3xl" />
                <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.16)_1px,transparent_0)] [background-size:28px_28px] opacity-25" />
            </div>

            <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
                <nav className="flex items-center justify-between rounded-3xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.05] px-4 py-3 backdrop-blur-2xl">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/10">
                            <WandSparkles size={19} />
                        </div>

                        <div>
                            <p className="text-sm font-black tracking-tight">Drawing Verse</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">User Detail</p>
                        </div>
                    </Link>

                    <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black/15 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 md:flex">
                        <Search size={16} />
                        <span>창작자, 작품, 유니버스 검색</span>
                    </div>

                    <button className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.06] p-2 text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:bg-white/10">
                        <MoreHorizontal size={18} />
                    </button>
                </nav>

                <ProfileHero
                    profile={profile}
                    isOwner={isOwner}
                    isFollowing={isFollowing}
                    stats={{
                        posts: profile.posts_count ?? posts.length,
                        artworks: profile.artworks_count ?? artworks.length,
                        universes: profile.universes_count ?? universes.length,
                    }}
                />

                <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <StatCard
                        label="팔로워"
                        value={compactNumber(profile.followers_count)}
                        icon={Users}
                    />
                    <StatCard
                        label="게시글"
                        value={compactNumber(profile.posts_count ?? posts.length)}
                        icon={PenLine}
                    />
                    <StatCard
                        label="작품"
                        value={compactNumber(profile.artworks_count ?? artworks.length)}
                        icon={Palette}
                    />
                    <StatCard
                        label="유니버스"
                        value={compactNumber(profile.universes_count ?? universes.length)}
                        icon={MoonStar}
                    />
                </section>


                <section className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
                    <div className="space-y-6">
                        <section className="rounded-[1.75rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.06] p-5 backdrop-blur-xl">
                            <h2 className="mb-4 flex items-center gap-2 text-xl font-black">
                                <BookOpen size={20} /> 소개
                            </h2>

                            <p className="leading-7 text-slate-600 dark:text-slate-300">
                                {profile.about ||
                                    profile.bio ||
                                    `${displayName}님의 소개가 아직 비어 있어요. 곧 멋진 창작 세계가 채워질 거예요.`}
                            </p>
                        </section>

                    </div>

                    <section className="rounded-[1.75rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.06] p-5 backdrop-blur-xl">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="flex items-center gap-2 text-xl font-black">
                                <Sparkles size={20} /> 최근 활동
                            </h2>

                            <Link
                                href={`/users/${profile.id}/posts`}
                                className="inline-flex items-center gap-1 text-sm font-bold text-cyan-700 dark:text-cyan-100"
                            >
                                전체 보기 <ChevronRight size={16} />
                            </Link>
                        </div>

                        <RecentPosts posts={posts} />
                    </section>
                </section>

                <section>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="flex items-center gap-2 text-2xl font-black tracking-tight">
                            <GalleryHorizontalEnd size={23} /> 갤러리
                        </h2>

                        <Link
                            href={`/users/${profile.id}/gallery`}
                            className="inline-flex items-center gap-1 text-sm font-bold text-cyan-700 dark:text-cyan-100"
                        >
                            더 보기 <ChevronRight size={16} />
                        </Link>
                    </div>

                    <GalleryGrid artworks={artworks} />
                </section>

                <section>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="flex items-center gap-2 text-2xl font-black tracking-tight">
                            <MoonStar size={23} /> 유니버스
                        </h2>

                        <Link
                            href="/universes"
                            className="inline-flex items-center gap-1 text-sm font-bold text-cyan-700 dark:text-cyan-100"
                        >
                            탐색하기 <ChevronRight size={16} />
                        </Link>
                    </div>

                    <UniverseGrid universes={universes} />
                </section>
            </div>
        </main>
    );
}