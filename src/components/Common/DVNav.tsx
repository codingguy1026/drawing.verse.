"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { squishyVariants } from "@/lib/animations";
import type { LucideIcon } from "lucide-react";
import {
    Home,
    Sparkles,
    MessageCircle,
    Images,
    UserRound,
    LogIn,
    Menu,
    X,
    Search,
    PenLine,
    WandSparkles,
} from "lucide-react";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { supabase } from "@/lib/supabase/client";
import ThemeToggle from "@/components/Common/ThemeToggle";
import WeatherToggle from "@/components/Common/WeatherToggle";
import CosmicAudioStation from "@/components/Common/CosmicAudioStation";

type NavItem = {
    label: string;
    href: string;
    sub: string;
    icon: LucideIcon;
    accent: string;
};

type DVNavProps = {
    isLoggedIn?: boolean;
    userName?: string;
    avatarUrl?: string;
    profileHref?: string;
};

const navItems: NavItem[] = [
    {
        label: "Home",
        href: "/",
        sub: "시작점",
        icon: Home,
        accent: "#9b7cff",
    },
    {
        label: "Universe",
        href: "/universe",
        sub: "세계들",
        icon: Sparkles,
        accent: "#7dd3fc",
    },
    {
        label: "Community",
        href: "/community",
        sub: "Verse Talk",
        icon: MessageCircle,
        accent: "#fb7185",
    },
    {
        label: "Gallery",
        href: "/gallery",
        sub: "작품관",
        icon: Images,
        accent: "#facc15",
    },
];

function cn(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(" ");
}

function isActivePath(pathname: string, href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
}

export default function DVNav({
    isLoggedIn: propIsLoggedIn,
    userName: propUserName,
    avatarUrl: propAvatarUrl,
    profileHref: propProfileHref,
}: DVNavProps = {}) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    const { user, loading } = useSupabaseUser();
    const [profileName, setProfileName] = useState<string | null>(null);
    const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        let ignore = false;

        async function loadProfile() {
            if (!user?.id) {
                setProfileName(null);
                setProfileAvatarUrl(null);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("nickname, display_name, avatar_url")
                    .eq("id", user.id)
                    .maybeSingle();

                if (error) {
                    throw error;
                }

                if (!ignore) {
                    setProfileName(data?.display_name ?? data?.nickname ?? null);
                    setProfileAvatarUrl(data?.avatar_url ?? null);
                }
            } catch (err) {
                console.error("Profile load failed:", err);
                if (!ignore) {
                    setProfileName(null);
                    setProfileAvatarUrl(null);
                }
            }
        }

        loadProfile();

        return () => {
            ignore = true;
        };
    }, [user?.id]);

    const isLoggedIn = propIsLoggedIn ?? !!user;
    const userName = propUserName ?? (profileName || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "드가이");
    const avatarUrl = propAvatarUrl ?? (profileAvatarUrl || user?.user_metadata?.avatar_url);
    const profileHref = propProfileHref ?? (user ? `/users/${user.id}` : "/login");

    const activeItem =
        navItems.find((item) => isActivePath(pathname, item.href)) ?? navItems[0];

    const accentStyle = {
        "--dv-nav-accent": activeItem.accent,
    } as CSSProperties & Record<string, string>;

    return (
        <header
            style={accentStyle}
            className="fixed left-0 top-0 z-[1000] w-full px-3 pt-3 sm:px-5"
        >
            <nav className="dv-nav-shell relative mx-auto max-w-7xl rounded-[28px] border border-slate-200/60 shadow-[0_18px_70px_rgba(0,0,0,0.08)] dark:border-white/15 dark:shadow-[0_18px_70px_rgba(0,0,0,0.42)]">
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px] bg-white/70 backdrop-blur-2xl dark:bg-[#090916]/75">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(155,124,255,0.15),transparent_34%),radial-gradient(circle_at_88%_12%,rgba(125,211,252,0.15),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.8),transparent)] dark:bg-[radial-gradient(circle_at_10%_0%,rgba(155,124,255,0.32),transparent_34%),radial-gradient(circle_at_88%_12%,rgba(125,211,252,0.23),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.10),transparent)]" />
                </div>

                <div className="relative flex h-[72px] items-center justify-between gap-3 px-3 sm:px-4">
                    <motion.div variants={squishyVariants} whileHover="hover" whileTap="tap">
                        <Link
                            href="/"
                            className="group flex min-w-0 items-center gap-3 rounded-2xl px-2 py-2 transition hover:bg-slate-100 dark:hover:bg-white/10"
                            aria-label="Drawing Verse Home"
                        >
                            <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-slate-200/80 bg-white/50 shadow-inner dark:border-white/15 dark:bg-white/10">
                                <div className="absolute inset-1 rounded-xl bg-[conic-gradient(from_140deg,#fb7185,#facc15,#7dd3fc,#a78bfa,#fb7185)] opacity-60 blur-[1px] dark:opacity-80" />
                                <div className="relative grid h-8 w-8 place-items-center rounded-xl bg-slate-50 text-slate-900 shadow-sm dark:bg-[#111127] dark:text-white dark:shadow-lg">
                                    <WandSparkles size={18} />
                                </div>
                            </div>

                            <div className="hidden leading-tight sm:block">
                                <p className="text-[15px] font-black tracking-tight text-slate-900 dark:text-white">
                                    Drawing Verse
                                </p>
                                <p className="text-[11px] font-semibold text-slate-500 dark:text-white/55">
                                    당신의 그림 유니버스
                                </p>
                            </div>
                        </Link>
                    </motion.div>

                    <div className="hidden items-center gap-1 rounded-2xl border border-slate-200/60 bg-slate-100/50 p-1 md:flex dark:border-white/10 dark:bg-black/20">
                        {navItems.map((item) => {
                            const active = isActivePath(pathname, item.href);
                            const Icon = item.icon;

                            return (
                                <motion.div key={item.href} variants={squishyVariants} whileHover="hover" whileTap="tap">
                                    <Link
                                        href={item.href}
                                        aria-current={active ? "page" : undefined}
                                        className={cn(
                                            "group relative flex items-center gap-2 rounded-xl px-3 py-2 transition",
                                            "text-sm font-bold",
                                            active
                                                ? "bg-white text-violet-600 shadow-[0_10px_30px_rgba(139,92,246,0.15)] dark:bg-white dark:text-[#111127] dark:shadow-[0_10px_30px_rgba(255,255,255,0.13)]"
                                                : "text-slate-600 hover:bg-white/80 hover:text-slate-900 dark:text-white/68 dark:hover:bg-white/10 dark:hover:text-white"
                                        )}
                                    >
                                        <Icon
                                            size={17}
                                            className={cn(
                                                "transition",
                                                active ? "text-violet-600 dark:text-[#111127]" : "text-slate-500 group-hover:text-slate-800 dark:text-white/70 dark:group-hover:text-white"
                                            )}
                                        />
                                        <span>{item.label}</span>

                                        {active && (
                                            <span
                                                className="absolute -bottom-1 left-1/2 h-1.5 w-8 -translate-x-1/2 rounded-full"
                                                style={{
                                                    background:
                                                        "linear-gradient(90deg, transparent, var(--dv-nav-accent), transparent)",
                                                    boxShadow: "0 0 18px var(--dv-nav-accent)",
                                                }}
                                            />
                                        )}
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>

                    <div className="hidden items-center gap-2 lg:flex">
                        <CosmicAudioStation />
                        <ThemeToggle />
                        <WeatherToggle />
                        
                        <motion.div variants={squishyVariants} whileHover="hover" whileTap="tap">
                            <Link
                                href="/search"
                                className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200/80 bg-white/50 text-slate-600 transition hover:bg-white hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/70 dark:hover:bg-white/12 dark:hover:text-white"
                                aria-label="Search"
                            >
                                <Search size={18} />
                            </Link>
                        </motion.div>

                        {isLoggedIn && (
                            <motion.div variants={squishyVariants} whileHover="hover" whileTap="tap">
                                <Link
                                    href="/universe/write"
                                    className="flex h-11 items-center gap-2 rounded-2xl bg-slate-900 px-4 text-sm font-black text-white shadow-[0_12px_34px_rgba(15,23,42,0.16)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_44px_rgba(15,23,42,0.22)] dark:bg-white dark:text-[#111127] dark:shadow-[0_12px_34px_rgba(255,255,255,0.16)] dark:hover:shadow-[0_16px_44px_rgba(255,255,255,0.22)]"
                                >
                                    <PenLine size={17} />
                                    글쓰기
                                </Link>
                            </motion.div>
                        )}

                        {isLoggedIn ? (
                            <motion.div variants={squishyVariants} whileHover="hover" whileTap="tap">
                                <Link
                                    href={profileHref}
                                    className="flex h-11 items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/50 px-2.5 text-slate-800 transition hover:bg-white dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/12"
                                >
                                    {avatarUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={avatarUrl}
                                            alt={userName}
                                            className="h-8 w-8 rounded-xl object-cover"
                                        />
                                    ) : (
                                        <div className="grid h-8 w-8 place-items-center rounded-xl bg-[linear-gradient(135deg,#a78bfa,#7dd3fc)] text-white dark:text-[#111127]">
                                            <UserRound size={17} />
                                        </div>
                                    )}
                                    <span className="max-w-[76px] truncate text-sm font-bold">
                                        {userName}
                                    </span>
                                </Link>
                            </motion.div>
                        ) : (
                            <motion.div variants={squishyVariants} whileHover="hover" whileTap="tap">
                                <Link
                                    href="/login"
                                    className="flex h-11 items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/50 px-4 text-sm font-black text-slate-800 transition hover:bg-white dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/12"
                                >
                                    <LogIn size={17} />
                                    로그인
                                </Link>
                            </motion.div>
                        )}
                    </div>

                    <div className="flex items-center lg:hidden">
                        <CosmicAudioStation />
                    </div>

                    <motion.button
                        variants={squishyVariants}
                        whileHover="hover"
                        whileTap="tap"
                        type="button"
                        onClick={() => setOpen((value) => !value)}
                        className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200/80 bg-white/50 text-slate-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-white md:hidden"
                        aria-label="Open navigation menu"
                        aria-expanded={open}
                    >
                        {open ? <X size={21} /> : <Menu size={21} />}
                    </motion.button>
                </div>

                <div className="pointer-events-none relative h-px overflow-hidden">
                    <div className="dv-nav-wave absolute left-1/2 top-0 h-px w-[64%] -translate-x-1/2" />
                </div>

                {open && (
                    <div className="relative border-t border-slate-200 bg-white/95 p-3 md:hidden dark:border-white/10 dark:bg-[#090916]/92">
                        <div className="grid gap-2">
                            {navItems.map((item) => {
                                const active = isActivePath(pathname, item.href);
                                const Icon = item.icon;

                                return (
                                <motion.div key={item.href} variants={squishyVariants} whileHover="hover" whileTap="tap">
                                    <Link
                                        href={item.href}
                                        onClick={() => setOpen(false)}
                                        className={cn(
                                            "flex items-center justify-between rounded-2xl border px-3 py-3 transition",
                                            active
                                                ? "border-violet-200 bg-violet-50 text-violet-900 dark:border-white/20 dark:bg-white dark:text-[#111127]"
                                                : "border-slate-200/60 bg-slate-50/50 text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.05] dark:text-white dark:hover:bg-white/10"
                                        )}
                                    >
                                        <span className="flex items-center gap-3">
                                            <span
                                                className={cn(
                                                    "grid h-10 w-10 place-items-center rounded-xl",
                                                    active ? "bg-violet-100 text-violet-700 dark:bg-[#111127] dark:text-white" : "bg-slate-200/60 text-slate-500 dark:bg-white/10 dark:text-white"
                                                )}
                                            >
                                                <Icon size={18} />
                                            </span>

                                            <span>
                                                <span className="block text-sm font-black">
                                                    {item.label}
                                                </span>
                                                <span
                                                    className={cn(
                                                        "block text-xs font-semibold",
                                                        active ? "text-violet-600/70 dark:text-[#111127]/55" : "text-slate-500/70 dark:text-white/45"
                                                    )}
                                                >
                                                    {item.sub}
                                                </span>
                                            </span>
                                        </span>

                                        {active && (
                                            <span className="rounded-full bg-violet-600 px-2 py-1 text-[10px] font-black text-white dark:bg-[#111127]">
                                                NOW
                                            </span>
                                        )}
                                    </Link>
                                </motion.div>
                                );
                            })}

                            <div className={`mt-2 grid gap-2 ${isLoggedIn ? "grid-cols-2" : "grid-cols-1"}`}>
                                <motion.div variants={squishyVariants} whileHover="hover" whileTap="tap">
                                    <Link
                                        href="/search"
                                        onClick={() => setOpen(false)}
                                        className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3 py-3 text-sm font-black text-slate-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-white"
                                    >
                                        <Search size={17} />
                                        검색
                                    </Link>
                                </motion.div>

                                {isLoggedIn && (
                                    <motion.div variants={squishyVariants} whileHover="hover" whileTap="tap">
                                        <Link
                                            href="/universe/write"
                                            onClick={() => setOpen(false)}
                                            className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-3 py-3 text-sm font-black text-white dark:bg-white dark:text-[#111127]"
                                        >
                                            <PenLine size={17} />
                                            글쓰기
                                        </Link>
                                    </motion.div>
                                )}
                            </div>

                            <motion.div variants={squishyVariants} whileHover="hover" whileTap="tap">
                                <Link
                                    href={isLoggedIn ? profileHref : "/login"}
                                    onClick={() => setOpen(false)}
                                    className="mt-1 flex items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3 py-3 text-sm font-black text-slate-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-white"
                                >
                                    {isLoggedIn ? <UserRound size={17} /> : <LogIn size={17} />}
                                    {isLoggedIn ? `${userName} 페이지` : "로그인"}
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                )}
            </nav>

            <style jsx>{`
        .dv-nav-shell::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          border-radius: 28px;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16);
        }

        .dv-nav-wave {
          background: linear-gradient(
            90deg,
            transparent,
            var(--dv-nav-accent),
            rgba(255, 255, 255, 0.85),
            var(--dv-nav-accent),
            transparent
          );
          box-shadow: 0 0 24px var(--dv-nav-accent);
          animation: dvNavWave 4.5s ease-in-out infinite;
        }

        @keyframes dvNavWave {
          0%,
          100% {
            opacity: 0.38;
            transform: translateX(-58%) scaleX(0.65);
          }

          50% {
            opacity: 1;
            transform: translateX(-42%) scaleX(1);
          }
        }
      `}</style>
        </header>
    );
}