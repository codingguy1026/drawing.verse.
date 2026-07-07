"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    ArrowLeft,
    AtSign,
    BadgeCheck,
    CalendarDays,
    Eye,
    FileText,
    Heart,
    Image as ImageIcon,
    Loader2,
    MessageCircle,
    PenLine,
    Rocket,
    Settings,
    Sparkles,
    UserRound,
    Users,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type Profile = {
    id: string;
    username: string;
    display_name: string | null;
    bio: string | null;
    avatar_url: string | null;
    banner_url: string | null;
    website: string | null;
    created_at: string;
};

type PostItem = {
    id: string;
    title?: string | null;
    content?: string | null;
    universe_slug?: string | null;
    created_at?: string | null;
    like_count?: number | null;
    comment_count?: number | null;
    view_count?: number | null;
};

type GalleryItem = {
    id: string;
    title?: string | null;
    thumbnail_url?: string | null;
    category?: string | null;
    created_at?: string | null;
    like_count?: number | null;
    comment_count?: number | null;
    view_count?: number | null;
};

type TabKey = "posts" | "gallery" | "universes";

function cn(...values: Array<string | false | null | undefined>) {
    return values.filter(Boolean).join(" ");
}

function getSafeNumber(value: number | null | undefined) {
    return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function getInitial(name: string | null | undefined) {
    const trimmed = name?.trim();

    if (!trimmed) {
        return "D";
    }

    return trimmed[0]?.toUpperCase() ?? "D";
}

function formatDate(value: string | null | undefined) {
    if (!value) {
        return "날짜 없음";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "날짜 없음";
    }

    return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function formatShortDate(value: string | null | undefined) {
    if (!value) {
        return "방금";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "방금";
    }

    return date.toLocaleDateString("ko-KR", {
        month: "short",
        day: "numeric",
    });
}

async function loadPosts(profile: Profile) {
    const byAuthorId = await supabase
        .from("posts")
        .select("*")
        .eq("author_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(12);

    if (!byAuthorId.error) {
        return (byAuthorId.data ?? []) as PostItem[];
    }

    const fallbackName = profile.display_name || profile.username;

    const byAuthorName = await supabase
        .from("posts")
        .select("*")
        .eq("author", fallbackName)
        .order("created_at", { ascending: false })
        .limit(12);

    if (!byAuthorName.error) {
        return (byAuthorName.data ?? []) as PostItem[];
    }

    return [];
}

async function loadGallery(profile: Profile) {
    const byAuthorId = await supabase
        .from("gallery")
        .select("*")
        .eq("author_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(12);

    if (!byAuthorId.error) {
        return (byAuthorId.data ?? []) as GalleryItem[];
    }

    const fallbackName = profile.display_name || profile.username;

    const byAuthorName = await supabase
        .from("gallery")
        .select("*")
        .eq("author", fallbackName)
        .order("created_at", { ascending: false })
        .limit(12);

    if (!byAuthorName.error) {
        return (byAuthorName.data ?? []) as GalleryItem[];
    }

    return [];
}

function EmptyState({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center rounded-[36px] border border-dashed border-slate-200 bg-white/60 px-6 py-20 text-center shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03]">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[26px] bg-slate-100 text-slate-300 dark:bg-white/5 dark:text-white/30">
                {icon}
            </div>
            <h3 className="text-xl font-black text-slate-950 dark:text-white">
                {title}
            </h3>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {description}
            </p>
        </div>
    );
}

export default function ProfilePage() {
    const params = useParams<{ username?: string | string[] }>();

    const username = React.useMemo(() => {
        const raw = params.username;
        return Array.isArray(raw) ? raw[0] : raw;
    }, [params.username]);

    const [profile, setProfile] = React.useState<Profile | null>(null);
    const [posts, setPosts] = React.useState<PostItem[]>([]);
    const [gallery, setGallery] = React.useState<GalleryItem[]>([]);
    const [activeTab, setActiveTab] = React.useState<TabKey>("posts");
    const [loading, setLoading] = React.useState(true);
    const [isMe, setIsMe] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");

    React.useEffect(() => {
        let ignore = false;

        async function loadProfilePage() {
            if (!username) {
                return;
            }

            setLoading(true);
            setErrorMessage("");

            try {
                const { data: profileData, error: profileError } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("username", username)
                    .maybeSingle();

                if (profileError) {
                    throw profileError;
                }

                if (!profileData) {
                    if (!ignore) {
                        setProfile(null);
                        setPosts([]);
                        setGallery([]);
                        setErrorMessage("이 프로필을 찾지 못했어요.");
                    }

                    return;
                }

                const loadedProfile = profileData as Profile;

                const [{ data: authData }, postItems, galleryItems] = await Promise.all([
                    supabase.auth.getUser(),
                    loadPosts(loadedProfile),
                    loadGallery(loadedProfile),
                ]);

                if (!ignore) {
                    setProfile(loadedProfile);
                    setPosts(postItems);
                    setGallery(galleryItems);
                    setIsMe(authData.user?.id === loadedProfile.id);
                }
            } catch (error) {
                console.error("Profile page load error:", error);

                if (!ignore) {
                    setErrorMessage(
                        "프로필을 불러오지 못했어요. profiles 테이블이나 RLS 설정을 확인해 주세요."
                    );
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        loadProfilePage();

        return () => {
            ignore = true;
        };
    }, [username]);

    const displayName = profile?.display_name || profile?.username || "Unknown Orbit";
    const totalLikes =
        posts.reduce((sum, post) => sum + getSafeNumber(post.like_count), 0) +
        gallery.reduce((sum, item) => sum + getSafeNumber(item.like_count), 0);

    const tabs: Array<{
        key: TabKey;
        label: string;
        count: number;
        icon: React.ElementType;
    }> = [
            { key: "posts", label: "게시글", count: posts.length, icon: FileText },
            { key: "gallery", label: "갤러리", count: gallery.length, icon: ImageIcon },
            { key: "universes", label: "유니버스", count: 0, icon: Rocket },
        ];

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-white text-slate-950 dark:bg-[#03050a] dark:text-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                    <p className="text-sm font-black text-slate-400">
                        프로필 우주를 불러오는 중...
                    </p>
                </div>
            </main>
        );
    }

    if (errorMessage && !profile) {
        return (
            <main className="relative min-h-screen overflow-hidden bg-white text-slate-950 dark:bg-[#03050a] dark:text-white">
                <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(129,140,248,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.18),transparent_35%)]" />

                <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[32px] bg-slate-100 text-slate-300 dark:bg-white/5 dark:text-white/30">
                        <UserRound className="h-10 w-10" />
                    </div>

                    <h1 className="text-3xl font-black tracking-tight">
                        프로필을 찾지 못했어요
                    </h1>

                    <p className="mt-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                        {errorMessage}
                    </p>

                    <Link
                        href="/"
                        className="mt-8 rounded-full bg-slate-950 px-7 py-3 text-sm font-black text-white transition hover:bg-indigo-600 dark:bg-white dark:text-slate-950"
                    >
                        홈으로 돌아가기
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-white text-slate-950 transition-colors duration-700 dark:bg-[#03050a] dark:text-white">
            <div className="pointer-events-none fixed inset-0 z-0">
                <div className="absolute left-[-10%] top-[8%] h-[460px] w-[460px] rounded-full bg-violet-300/20 blur-[130px] dark:bg-violet-600/15" />
                <div className="absolute right-[-8%] top-[34%] h-[520px] w-[520px] rounded-full bg-sky-300/20 blur-[140px] dark:bg-indigo-600/15" />
                <div className="absolute bottom-[-20%] left-[25%] h-[560px] w-[560px] rounded-full bg-indigo-200/25 blur-[150px] dark:bg-sky-600/10" />
            </div>

            <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_1px_1px,rgba(99,102,241,0.12)_1px,transparent_0)] bg-[length:34px_34px] opacity-40 dark:opacity-20" />

            <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between gap-3">
                    <Link
                        href="/"
                        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-xs font-black text-slate-500 shadow-sm backdrop-blur-xl transition hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        돌아가기
                    </Link>

                    {isMe ? (
                        <Link
                            href="/profile/edit"
                            className="flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-xs font-black text-white shadow-xl shadow-slate-900/10 transition hover:bg-indigo-600 dark:bg-white dark:text-slate-950"
                        >
                            <Settings className="h-4 w-4" />
                            프로필 수정
                        </Link>
                    ) : (
                        <button
                            type="button"
                            className="flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-xs font-black text-white shadow-xl shadow-slate-900/10 transition hover:bg-indigo-600 dark:bg-white dark:text-slate-950"
                        >
                            <Users className="h-4 w-4" />
                            팔로우
                        </button>
                    )}
                </div>

                <section className="overflow-hidden rounded-[44px] border border-slate-200/70 bg-white/70 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">
                    <div className="relative h-56 overflow-hidden bg-gradient-to-br from-violet-500 via-indigo-500 to-sky-400">
                        {profile?.banner_url ? (
                            <img
                                src={profile.banner_url}
                                alt={`${displayName} 배너`}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <>
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_24%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.25),transparent_22%),radial-gradient(circle_at_50%_90%,rgba(255,255,255,0.22),transparent_30%)]" />
                                <div className="absolute inset-0 bg-black/10" />
                            </>
                        )}

                        <div className="absolute left-6 top-6 flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-white backdrop-blur-md">
                            <Sparkles className="h-3 w-3" />
                            Drawing Verse Profile
                        </div>
                    </div>

                    <div className="px-6 pb-8 sm:px-8 lg:px-10">
                        <div className="-mt-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
                                <div className="relative">
                                    <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-[40px] border-4 border-white bg-gradient-to-br from-violet-500 to-indigo-500 text-4xl font-black text-white shadow-2xl shadow-indigo-500/20 dark:border-[#0b0e14]">
                                        {profile?.avatar_url ? (
                                            <img
                                                src={profile.avatar_url}
                                                alt={`${displayName} 프로필 이미지`}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            getInitial(displayName)
                                        )}
                                    </div>

                                    <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-2xl border-4 border-white bg-emerald-500 text-white dark:border-[#0b0e14]">
                                        <BadgeCheck className="h-5 w-5" />
                                    </div>
                                </div>

                                <div className="pb-1">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h1 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white">
                                            {displayName}
                                        </h1>

                                        {isMe && (
                                            <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-[11px] font-black text-indigo-600 dark:text-indigo-300">
                                                내 프로필
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-bold text-slate-400">
                                        <span className="flex items-center gap-1.5">
                                            <AtSign className="h-4 w-4" />
                                            {profile?.username}
                                        </span>

                                        <span className="flex items-center gap-1.5">
                                            <CalendarDays className="h-4 w-4" />
                                            {formatDate(profile?.created_at)} 가입
                                        </span>
                                    </div>

                                    <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                                        {profile?.bio ||
                                            "아직 자기소개가 없어요. 이 창작자의 우주는 이제 막 반짝이기 시작했어요."}
                                    </p>
                                </div>
                            </div>

                            {isMe && (
                                <Link
                                    href="/profile/edit"
                                    className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-black text-slate-600 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                                >
                                    <PenLine className="h-4 w-4" />
                                    소개 편집
                                </Link>
                            )}
                        </div>

                        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                {
                                    label: "게시글",
                                    value: posts.length,
                                    icon: FileText,
                                    color: "text-indigo-500",
                                },
                                {
                                    label: "작품",
                                    value: gallery.length,
                                    icon: ImageIcon,
                                    color: "text-violet-500",
                                },
                                {
                                    label: "받은 좋아요",
                                    value: totalLikes,
                                    icon: Heart,
                                    color: "text-rose-500",
                                },
                                {
                                    label: "가입 유니버스",
                                    value: 0,
                                    icon: Rocket,
                                    color: "text-sky-500",
                                },
                            ].map((stat) => {
                                const Icon = stat.icon;

                                return (
                                    <div
                                        key={stat.label}
                                        className="rounded-[28px] border border-slate-200 bg-white/75 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]"
                                    >
                                        <div className={cn("mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5", stat.color)}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <p className="text-3xl font-black tracking-tight">
                                            {stat.value}
                                        </p>
                                        <p className="mt-1 text-xs font-black text-slate-400">
                                            {stat.label}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="mt-8">
                    <div className="mb-8 flex flex-wrap gap-2 rounded-[30px] border border-slate-200/70 bg-white/65 p-2 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;

                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setActiveTab(tab.key)}
                                    className={cn(
                                        "flex items-center gap-2 rounded-[22px] px-5 py-3 text-xs font-black transition-all",
                                        activeTab === tab.key
                                            ? "bg-slate-950 text-white shadow-xl shadow-slate-900/10 dark:bg-white dark:text-slate-950"
                                            : "text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                    <span
                                        className={cn(
                                            "rounded-full px-2 py-0.5 text-[10px]",
                                            activeTab === tab.key
                                                ? "bg-white/20 text-white dark:bg-slate-950/10 dark:text-slate-950"
                                                : "bg-slate-100 text-slate-400 dark:bg-white/5"
                                        )}
                                    >
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {activeTab === "posts" && (
                        <>
                            {posts.length === 0 ? (
                                <EmptyState
                                    icon={<FileText className="h-8 w-8" />}
                                    title="아직 작성한 게시글이 없어요"
                                    description="첫 게시글이 올라오면 이곳에 창작자의 생각과 이야기가 차곡차곡 쌓일 거예요."
                                />
                            ) : (
                                <div className="grid gap-5 lg:grid-cols-2">
                                    {posts.map((post) => (
                                        <Link
                                            key={post.id}
                                            href={`/community/post/${post.id}`}
                                            className="group rounded-[32px] border border-slate-200 bg-white/75 p-6 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.04]"
                                        >
                                            <div className="mb-4 flex items-center justify-between gap-3">
                                                <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-[10px] font-black text-indigo-600 dark:text-indigo-300">
                                                    {post.universe_slug || "community"}
                                                </span>

                                                <span className="text-[10px] font-black text-slate-400">
                                                    {formatShortDate(post.created_at)}
                                                </span>
                                            </div>

                                            <h3 className="line-clamp-1 text-lg font-black text-slate-950 transition group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-300">
                                                {post.title || "제목 없는 게시글"}
                                            </h3>

                                            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                                                {post.content || "내용 미리보기가 없어요."}
                                            </p>

                                            <div className="mt-5 flex items-center gap-4 text-xs font-black text-slate-400">
                                                <span className="flex items-center gap-1.5">
                                                    <Heart className="h-4 w-4" />
                                                    {getSafeNumber(post.like_count)}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <MessageCircle className="h-4 w-4" />
                                                    {getSafeNumber(post.comment_count)}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Eye className="h-4 w-4" />
                                                    {getSafeNumber(post.view_count)}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === "gallery" && (
                        <>
                            {gallery.length === 0 ? (
                                <EmptyState
                                    icon={<ImageIcon className="h-8 w-8" />}
                                    title="아직 올린 작품이 없어요"
                                    description="작품을 업로드하면 이곳에 작은 별자리처럼 모이게 될 거예요."
                                />
                            ) : (
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {gallery.map((item) => (
                                        <Link
                                            key={item.id}
                                            href={`/gallery/${item.id}`}
                                            className="group overflow-hidden rounded-[32px] border border-white bg-white shadow-sm transition-all hover:-translate-y-2 hover:shadow-[0_24px_70px_rgba(49,46,129,0.14)] dark:border-white/10 dark:bg-[#0b0e14]/70"
                                        >
                                            <div className="relative aspect-[4/5] overflow-hidden">
                                                {item.thumbnail_url ? (
                                                    <img
                                                        src={item.thumbnail_url}
                                                        alt={item.title || "갤러리 작품"}
                                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500/10 via-indigo-500/10 to-sky-500/10">
                                                        <ImageIcon className="h-10 w-10 text-slate-300 dark:text-white/30" />
                                                    </div>
                                                )}

                                                <div className="absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1 text-[10px] font-black text-slate-700 shadow-sm backdrop-blur-md dark:bg-black/35 dark:text-white">
                                                    {item.category || "아트워크"}
                                                </div>
                                            </div>

                                            <div className="p-5">
                                                <h3 className="line-clamp-1 text-base font-black text-slate-950 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-300">
                                                    {item.title || "Untitled Space"}
                                                </h3>

                                                <div className="mt-4 flex items-center justify-between text-[11px] font-black text-slate-400">
                                                    <span>{formatShortDate(item.created_at)}</span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Heart className="h-3.5 w-3.5" />
                                                        {getSafeNumber(item.like_count)}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === "universes" && (
                        <EmptyState
                            icon={<Rocket className="h-8 w-8" />}
                            title="유니버스 연동은 다음 단계예요"
                            description="가입한 유니버스, 만든 유니버스, 즐겨찾는 유니버스를 여기에 붙이면 프로필이 진짜 완성돼요."
                        />
                    )}
                </section>
            </div>
        </main>
    );
}