"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import type { LucideIcon } from "lucide-react";
import {
  ChevronDown,
  Home,
  Images,
  Link2,
  LogIn,
  LogOut,
  Menu,
  MessageCircle,
  PenLine,
  Pencil,
  Plus,
  Rocket,
  Search,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

import CosmicAudioStation from "@/components/Common/CosmicAudioStation";
import SearchBar from "@/components/Common/SearchBar";
import ThemeToggle from "@/components/Common/ThemeToggle";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { squishyVariants } from "@/lib/animations";
import { supabase } from "@/lib/supabase/client";

type NavItem = {
  label: string;
  href: string;
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
  { label: "Home", href: "/", icon: Home, accent: "#ff6b72" },
  { label: "Universe", href: "/universe", icon: Sparkles, accent: "#b89cff" },
  { label: "Wormhole", href: "/wormhole", icon: Link2, accent: "#8b5cf6" },
  { label: "Community", href: "/community", icon: MessageCircle, accent: "#f472b6" },
  { label: "Gallery", href: "/gallery", icon: Images, accent: "#a78bfa" },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function DVNav({
  isLoggedIn: propIsLoggedIn,
  userName: propUserName,
  avatarUrl: propAvatarUrl,
  profileHref: propProfileHref,
}: DVNavProps = {}) {
  const pathname = usePathname();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const profilePanelRef = useRef<HTMLDivElement>(null);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profilePosition, setProfilePosition] = useState<{ top: number; right: number } | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const { user } = useSupabaseUser();
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

        if (error) throw error;
        if (ignore) return;

        setProfileName(data?.display_name ?? data?.nickname ?? null);
        setProfileAvatarUrl(data?.avatar_url ?? null);
      } catch (error) {
        console.error("Navbar profile load failed:", error);
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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
    setProfilePosition(null);
  }, [pathname]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(target) &&
        profilePanelRef.current &&
        !profilePanelRef.current.contains(target)
      ) {
        setProfileOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!profileOpen) return;

    const updateProfilePosition = () => {
      const button = profileButtonRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();

      setProfilePosition({
        top: rect.bottom + 10,
        right: Math.max(12, window.innerWidth - rect.right),
      });
    };

    updateProfilePosition();

    window.addEventListener("resize", updateProfilePosition);
    window.addEventListener("scroll", updateProfilePosition, true);

    return () => {
      window.removeEventListener("resize", updateProfilePosition);
      window.removeEventListener("scroll", updateProfilePosition, true);
    };
  }, [profileOpen]);

  const isLoggedIn = propIsLoggedIn ?? Boolean(user);
  const userName =
    propUserName ??
    profileName ??
    user?.user_metadata?.full_name ??
    user?.email?.split("@")[0] ??
    "Explorer";
  const avatarUrl =
    propAvatarUrl ??
    profileAvatarUrl ??
    user?.user_metadata?.avatar_url;
  const profileHref =
    propProfileHref ?? (user ? "/users/" + user.id : "/login");

  const handleLogout = async () => {
    setProfileOpen(false);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      window.location.href = "/login";
    } catch (error) {
      console.error("Navbar logout failed:", error);
    }
  };

  const activeItem =
    navItems.find((item) => isActivePath(pathname, item.href)) ?? navItems[0];

  const accentStyle = {
    "--dv-nav-accent": activeItem.accent,
  } as CSSProperties & Record<string, string>;

  return (
    <header
      style={accentStyle}
      className="fixed inset-x-0 top-0 z-[1000] px-3 pt-3 sm:px-5"
    >
      <nav
        className={cn(
          "dv-verse-dock relative mx-auto max-w-[1440px] overflow-visible rounded-[26px] border backdrop-blur-2xl",
          "transition-[background-color,border-color,box-shadow,transform] duration-300",
          "border-slate-200/70 bg-white/[0.88] dark:border-white/[0.12] dark:bg-[#060811]/[0.88]",
          scrolled
            ? "shadow-[0_20px_64px_rgba(15,23,42,0.16)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.58)]"
            : "shadow-[0_12px_42px_rgba(76,29,149,0.10)] dark:shadow-[0_16px_58px_rgba(0,0,0,0.36)]"
        )}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[26px]">
          <div className="absolute -left-16 -top-20 h-44 w-44 rounded-full bg-violet-400/15 blur-3xl dark:bg-violet-500/20" />
          <div className="absolute -right-10 -top-24 h-52 w-52 rounded-full bg-cyan-300/10 blur-3xl dark:bg-cyan-400/15" />
          <div className="absolute left-1/2 top-0 h-px w-[58%] -translate-x-1/2 dv-nav-beam" />
          <div className="absolute bottom-0 left-[14%] h-px w-[22%] bg-gradient-to-r from-transparent via-violet-400/35 to-transparent" />
          <div className="absolute bottom-0 right-[9%] h-px w-[18%] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
        </div>

        <div className="flex h-[74px] items-center gap-2 px-2.5 sm:gap-3 sm:px-4">
          <motion.div
            variants={squishyVariants}
            whileHover="hover"
            whileTap="tap"
            className="shrink-0"
          >
            <Link
              href="/"
              aria-label="Drawing Verse Home"
              className="group flex items-center gap-3 rounded-2xl px-2 py-1.5 transition hover:bg-violet-500/[0.05] dark:hover:bg-white/[0.05]"
            >
              <div className="relative h-[52px] w-[58px] shrink-0">
                <div className="pointer-events-none absolute inset-1 rounded-full bg-[radial-gradient(circle,rgba(255,91,91,.18),rgba(184,156,255,.18)_48%,transparent_72%)] blur-md transition-opacity duration-300 group-hover:opacity-100" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/branding/dverse-logo-mark.svg"
                  alt=""
                  aria-hidden="true"
                  className="relative h-full w-full object-contain drop-shadow-[0_6px_12px_rgba(230,61,85,.14)] transition duration-300 group-hover:-translate-y-0.5 group-hover:drop-shadow-[0_0_14px_rgba(184,156,255,.42)]"
                />
              </div>

              <div className="hidden leading-tight sm:block">
                <div className="flex items-center gap-1.5">
                  <p className="whitespace-nowrap bg-[linear-gradient(92deg,#ef4c5f_0%,#ff5b5b_34%,#a883ff_72%,#8060f1_100%)] bg-clip-text text-[15px] font-black tracking-[-0.025em] text-transparent dark:bg-[linear-gradient(92deg,#ff9292_0%,#ff6b72_34%,#d7c6ff_68%,#b89cff_100%)]">
                    Drawing Verse
                  </p>
                  <span className="hidden text-[8px] text-violet-400 xl:inline">✦</span>
                </div>
                <p className="mt-0.5 text-[8px] font-black uppercase tracking-[0.22em] text-slate-400 dark:text-white/40">
                  Verse Navigator
                </p>
              </div>
            </Link>
          </motion.div>

          <div className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
            <div className="dv-orbit-nav relative flex h-[56px] items-center px-3">
              <div className="dv-orbit-track pointer-events-none absolute left-8 right-8 top-[21px] h-px" />
              <div className="dv-orbit-track-glow pointer-events-none absolute left-8 right-8 top-[21px] h-px" />

              {navItems.map((item, index) => {
                const active = isActivePath(pathname, item.href);
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.href}
                    variants={squishyVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="relative z-10"
                  >
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className="group/orbit relative flex min-w-[72px] flex-col items-center justify-start px-1.5 pt-1 xl:min-w-[82px]"
                    >
                      <span
                        className={cn(
                          "relative grid h-9 w-9 place-items-center rounded-full border transition-all duration-300",
                          active
                            ? "scale-105 border-white/70 bg-white text-slate-950 shadow-[0_8px_22px_rgba(15,23,42,.14)] dark:border-white/80 dark:bg-white dark:text-slate-950"
                            : "border-slate-300/70 bg-white/85 text-slate-500 shadow-[0_4px_14px_rgba(15,23,42,.08)] group-hover/orbit:-translate-y-0.5 group-hover/orbit:border-violet-300 group-hover/orbit:text-violet-600 dark:border-white/15 dark:bg-[#0b0d17]/90 dark:text-white/55 dark:group-hover/orbit:border-violet-300/40 dark:group-hover/orbit:text-white"
                        )}
                        style={
                          active
                            ? {
                                boxShadow:
                                  "0 0 0 4px color-mix(in srgb, var(--dv-nav-accent) 12%, transparent), 0 0 22px color-mix(in srgb, var(--dv-nav-accent) 38%, transparent), 0 8px 22px rgba(15,23,42,.14)",
                              }
                            : undefined
                        }
                      >
                        {active && (
                          <span
                            className="dv-active-orbit absolute -inset-[7px] rounded-full border"
                            style={{
                              borderColor:
                                "color-mix(in srgb, var(--dv-nav-accent) 58%, transparent)",
                            }}
                          />
                        )}

                        <Icon size={15} />

                        <span
                          className={cn(
                            "absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full transition-opacity",
                            active ? "opacity-100" : "opacity-0 group-hover/orbit:opacity-70"
                          )}
                          style={{
                            background: item.accent,
                            boxShadow: `0 0 9px ${item.accent}`,
                          }}
                        />
                      </span>

                      <span
                        className={cn(
                          "mt-1 whitespace-nowrap text-[10px] font-black tracking-[-0.01em] transition-colors xl:text-[11px]",
                          active
                            ? "text-slate-950 dark:text-white"
                            : "text-slate-400 group-hover/orbit:text-slate-700 dark:text-white/35 dark:group-hover/orbit:text-white/70"
                        )}
                      >
                        {item.label}
                      </span>

                      {active && (
                        <span className="absolute -bottom-[8px] text-[7px] font-black uppercase tracking-[.2em] text-violet-500 dark:text-violet-300">
                          Current Verse
                        </span>
                      )}

                      {index < navItems.length - 1 && (
                        <span className="sr-only">Next verse follows</span>
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="hidden w-[270px] shrink-0 2xl:block">
            <div className="relative rounded-[18px] border border-[#b89cff]/25 bg-[linear-gradient(135deg,rgba(255,107,114,.07),rgba(184,156,255,.10))] p-[3px] shadow-[0_10px_34px_rgba(128,96,241,.09)] dark:border-white/[0.08]">
              <div className="pointer-events-none absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#ff6b72]/80 shadow-[0_0_10px_rgba(255,107,114,.65)]" />
              <SearchBar
                placeholder="Search the Verse..."
                className="w-full"
              />
            </div>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
            <motion.div
              variants={squishyVariants}
              whileHover="hover"
              whileTap="tap"
              className="2xl:hidden"
            >
              <Link
                href="/search"
                aria-label="Search"
                className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-white/55 dark:hover:bg-white/[0.07] dark:hover:text-white"
              >
                <Search size={17} />
              </Link>
            </motion.div>

            <div className="hidden items-center gap-1 xl:flex">
              <CosmicAudioStation />
              <ThemeToggle />
            </div>

            <motion.div
              variants={squishyVariants}
              whileHover="hover"
              whileTap="tap"
              className="hidden sm:block"
            >
              <Link
                href="/universe/create"
                className="group/create relative flex h-10 items-center gap-1.5 overflow-hidden rounded-xl border border-[#b89cff]/35 bg-[linear-gradient(105deg,rgba(255,107,114,.16),rgba(184,156,255,.18))] px-3 text-[12px] font-black text-[#8a4cf3] shadow-[0_8px_24px_rgba(128,96,241,.12)] transition hover:-translate-y-0.5 hover:border-[#ff7a7a]/45 hover:shadow-[0_12px_30px_rgba(184,156,255,.22)] dark:text-[#e2d7ff]"
              >
                <span className="pointer-events-none absolute inset-y-0 -left-10 w-8 rotate-12 bg-white/40 blur-md transition-all duration-500 group-hover/create:left-[115%] dark:bg-white/15" />
                <Rocket size={15} />
                <span className="hidden xl:inline">Create Universe</span>
                <span className="xl:hidden">Create</span>
              </Link>
            </motion.div>

            {isLoggedIn ? (
              <div ref={profileMenuRef} className="relative hidden sm:block">
                <button
                  ref={profileButtonRef}
                  type="button"
                  aria-label="User menu"
                  aria-expanded={profileOpen}
                  onClick={() => {
                    if (!profileOpen && profileButtonRef.current) {
                      const rect = profileButtonRef.current.getBoundingClientRect();
                      setProfilePosition({
                        top: rect.bottom + 10,
                        right: Math.max(12, window.innerWidth - rect.right),
                      });
                    }

                    setProfileOpen((value) => !value);
                  }}
                  className={cn(
                    "group/profile flex h-10 items-center gap-2 rounded-xl border px-1.5 pr-2.5 transition-all",
                    "border-[#b89cff]/35 bg-[linear-gradient(135deg,rgba(255,107,114,.07),rgba(184,156,255,.10))]",
                    "hover:-translate-y-0.5 hover:border-[#ff7a7a]/40 hover:shadow-[0_8px_24px_rgba(128,96,241,.14)]",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60",
                    "dark:border-white/10 dark:bg-white/[0.05] dark:hover:bg-white/[0.09]",
                    profileOpen && "border-[#b89cff]/60 shadow-[0_8px_28px_rgba(128,96,241,.16)]"
                  )}
                >
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt={userName}
                      className="h-7 w-7 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="grid h-7 w-7 place-items-center rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-300">
                      <UserRound size={15} />
                    </div>
                  )}

                  <ChevronDown
                    size={13}
                    className={cn(
                      "text-slate-400 transition-transform",
                      profileOpen && "rotate-180"
                    )}
                  />
                </button>

                {typeof document !== "undefined" &&
                  createPortal(
                    <AnimatePresence>
                      {profileOpen && profilePosition && (
                        <motion.div
                          ref={profilePanelRef}
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.16, ease: "easeOut" }}
                      className="fixed z-[2147483000] w-[min(19rem,calc(100vw-1.5rem))] overflow-hidden rounded-[24px] border border-[#b89cff]/25 bg-white/95 p-2.5 shadow-[0_24px_70px_rgba(44,31,80,.18)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#0a0c15]/95 dark:shadow-[0_28px_80px_rgba(0,0,0,.55)]"
                      style={{
                        top: profilePosition.top,
                        right: profilePosition.right,
                      }}
                    >
                      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[24px]">
                        <div className="absolute -left-12 -top-16 h-32 w-32 rounded-full bg-[#ff6b72]/10 blur-3xl" />
                        <div className="absolute -right-10 -top-16 h-36 w-36 rounded-full bg-[#b89cff]/15 blur-3xl" />
                        <div className="absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,#ff7a7a,#b89cff,transparent)] opacity-75" />
                      </div>

                      <div className="relative">
                        <div className="flex items-center gap-3 rounded-[18px] border border-slate-200/70 bg-slate-50/75 p-3 dark:border-white/[0.07] dark:bg-white/[0.04]">
                          <div className="relative h-11 w-11 shrink-0">
                            <div className="absolute -inset-1 rounded-[15px] bg-[linear-gradient(135deg,rgba(255,107,114,.35),rgba(184,156,255,.42))] blur-[5px] opacity-50" />
                            {avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={avatarUrl}
                                alt={userName}
                                className="relative h-11 w-11 rounded-[14px] border border-white/70 object-cover shadow-sm dark:border-white/10"
                              />
                            ) : (
                              <div className="relative grid h-11 w-11 place-items-center rounded-[14px] border border-violet-200/60 bg-[linear-gradient(135deg,#fff1f2,#ede9fe)] text-violet-600 dark:border-white/10 dark:bg-[linear-gradient(135deg,#291625,#211b3f)] dark:text-violet-200">
                                <UserRound size={20} />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="truncate text-[14px] font-black tracking-tight text-slate-950 dark:text-white">
                                {userName}
                              </p>
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_7px_rgba(52,211,153,.65)]" />
                            </div>
                            <p className="mt-0.5 truncate text-[11px] font-medium text-slate-400 dark:text-white/35">
                              {user?.email}
                            </p>
                          </div>
                        </div>

                        <div className="mt-2 grid grid-cols-2 gap-1.5">
                          <Link
                            href={profileHref}
                            onClick={() => setProfileOpen(false)}
                            className="group/menu flex min-h-[66px] flex-col justify-between rounded-[16px] border border-slate-200/70 bg-white/65 p-3 transition hover:-translate-y-0.5 hover:border-[#b89cff]/35 hover:bg-violet-50/55 hover:shadow-[0_8px_20px_rgba(128,96,241,.08)] dark:border-white/[0.07] dark:bg-white/[0.035] dark:hover:bg-white/[0.07]"
                          >
                            <UserRound size={17} className="text-violet-500" />
                            <span className="text-[12px] font-black text-slate-700 dark:text-white/80">
                              Profile
                            </span>
                          </Link>

                          <Link
                            href={user ? "/users/" + user.id + "/edit" : profileHref}
                            onClick={() => setProfileOpen(false)}
                            className="group/menu flex min-h-[66px] flex-col justify-between rounded-[16px] border border-slate-200/70 bg-white/65 p-3 transition hover:-translate-y-0.5 hover:border-[#ff7a7a]/35 hover:bg-rose-50/55 hover:shadow-[0_8px_20px_rgba(255,107,114,.08)] dark:border-white/[0.07] dark:bg-white/[0.035] dark:hover:bg-white/[0.07]"
                          >
                            <Pencil size={17} className="text-[#ef5d68]" />
                            <span className="text-[12px] font-black text-slate-700 dark:text-white/80">
                              Edit profile
                            </span>
                          </Link>

                          <Link
                            href="/universe/write"
                            onClick={() => setProfileOpen(false)}
                            className="group/menu flex items-center gap-2 rounded-[14px] px-3 py-2.5 text-[12px] font-black text-slate-600 transition hover:bg-slate-100/80 dark:text-white/65 dark:hover:bg-white/[0.06]"
                          >
                            <PenLine size={15} className="text-slate-400" />
                            Write
                          </Link>

                          <Link
                            href="/universe/create"
                            onClick={() => setProfileOpen(false)}
                            className="group/menu flex items-center gap-2 rounded-[14px] px-3 py-2.5 text-[12px] font-black text-slate-600 transition hover:bg-slate-100/80 dark:text-white/65 dark:hover:bg-white/[0.06]"
                          >
                            <Rocket size={15} className="text-violet-400" />
                            Create
                          </Link>
                        </div>

                        <div className="my-2 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-white/10" />

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center justify-between rounded-[14px] px-3 py-2.5 text-left transition hover:bg-rose-50 dark:hover:bg-rose-500/10"
                        >
                          <span className="flex items-center gap-2 text-[12px] font-black text-slate-500 dark:text-white/55">
                            <LogOut size={15} />
                            Log out
                          </span>
                          <span className="text-[10px] font-bold text-slate-300 dark:text-white/20">
                            End session
                          </span>
                        </button>
                      </div>
                    </motion.div>
                      )}
                    </AnimatePresence>,
                    document.body
                  )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden h-10 items-center gap-2 rounded-xl px-3 text-sm font-black text-slate-600 transition hover:bg-slate-100 sm:flex dark:text-white/70 dark:hover:bg-white/[0.07]"
              >
                <LogIn size={16} />
                Login
              </Link>
            )}

            <Link
              href={isLoggedIn ? profileHref : "/login"}
              aria-label={isLoggedIn ? "Profile" : "Login"}
              className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl border border-slate-200/70 bg-white/60 text-slate-600 transition hover:bg-white sm:hidden dark:border-white/10 dark:bg-white/[0.05] dark:text-white/70"
            >
              {isLoggedIn && avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={userName}
                  className="h-full w-full object-cover"
                />
              ) : isLoggedIn ? (
                <UserRound size={17} />
              ) : (
                <LogIn size={17} />
              )}
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              aria-label="Navigation menu"
              aria-expanded={mobileOpen}
              className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 lg:hidden dark:text-white/70 dark:hover:bg-white/[0.07]"
            >
              {mobileOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden border-t border-slate-200/70 lg:hidden dark:border-white/[0.08]"
            >
              <div className="relative space-y-2 p-3">
                <div className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />
                <div className="flex items-center justify-between px-1 pb-1 pt-1">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[.24em] text-violet-500 dark:text-violet-300">
                      Verse Navigator
                    </p>
                    <p className="text-[11px] font-bold text-slate-400 dark:text-white/35">
                      Choose your next orbit
                    </p>
                  </div>
                  <Sparkles size={16} className="text-cyan-400" />
                </div>

                <SearchBar
                  placeholder="Search the Verse..."
                  className="w-full"
                />

                <div className="grid gap-1">
                  {navItems.map((item) => {
                    const active = isActivePath(pathname, item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition",
                          active
                            ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                            : "text-slate-600 hover:bg-slate-100 dark:text-white/70 dark:hover:bg-white/[0.07]"
                        )}
                      >
                        <Icon size={17} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>

                <div
                  className={cn(
                    "grid gap-2 pt-1",
                    isLoggedIn ? "grid-cols-2" : "grid-cols-1"
                  )}
                >
                  <Link
                    href="/universe/create"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-3 py-3 text-sm font-black text-white transition hover:bg-violet-500"
                  >
                    <Plus size={16} />
                    Create
                  </Link>

                  {isLoggedIn && (
                    <Link
                      href="/universe/write"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-3 text-sm font-black text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950"
                    >
                      <PenLine size={16} />
                      Write
                    </Link>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-slate-200/70 pt-3 dark:border-white/[0.08]">
                  <div className="flex items-center gap-1">
                    <CosmicAudioStation />
                    <ThemeToggle />
                  </div>

                  <Link
                    href={isLoggedIn ? profileHref : "/login"}
                    onClick={() => setMobileOpen(false)}
                    className="flex max-w-[180px] items-center gap-2 rounded-xl px-3 py-2 text-sm font-black text-slate-600 transition hover:bg-slate-100 dark:text-white/70 dark:hover:bg-white/[0.07]"
                  >
                    {isLoggedIn ? <UserRound size={16} /> : <LogIn size={16} />}
                    <span className="truncate">
                      {isLoggedIn ? userName : "Login"}
                    </span>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      <style jsx>{`
        .dv-verse-dock::before {
          content: "";
          position: absolute;
          inset: -1px;
          z-index: -1;
          border-radius: 27px;
          padding: 1px;
          background: linear-gradient(
            110deg,
            rgba(255, 107, 114, 0.34),
            rgba(255, 255, 255, 0.10) 30%,
            rgba(184, 156, 255, 0.28) 68%,
            rgba(128, 96, 241, 0.26)
          );
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .dv-nav-beam {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 107, 114, 0.75),
            rgba(255, 255, 255, 0.92),
            rgba(184, 156, 255, 0.78),
            transparent
          );
          box-shadow:
            0 0 12px rgba(255, 107, 114, 0.22),
            0 0 18px rgba(184, 156, 255, 0.28);
          animation: dvBeamPulse 4.2s ease-in-out infinite;
        }

        .dv-orbit-nav::before {
          content: "";
          position: absolute;
          left: -26px;
          top: 19px;
          width: 38px;
          height: 7px;
          border-top: 1px solid rgba(255, 107, 114, 0.35);
          border-radius: 50%;
          transform: rotate(-8deg);
          filter: drop-shadow(0 0 5px rgba(255, 107, 114, 0.25));
        }

        .dv-orbit-track {
          background: linear-gradient(
            90deg,
            rgba(255, 107, 114, 0.80) 0%,
            rgba(255, 122, 122, 0.45) 22%,
            rgba(184, 156, 255, 0.58) 58%,
            rgba(128, 96, 241, 0.74) 100%
          );
          opacity: 0.72;
        }

        .dv-orbit-track-glow {
          background: linear-gradient(
            90deg,
            rgba(255, 107, 114, 0.24),
            rgba(184, 156, 255, 0.30),
            rgba(128, 96, 241, 0.24)
          );
          filter: blur(5px);
          opacity: 0.8;
        }

        .dv-active-orbit {
          animation: dvActiveOrbit 3.6s ease-in-out infinite;
        }

        @keyframes dvBeamPulse {
          0%,
          100% {
            opacity: 0.34;
            transform: translateX(-50%) scaleX(0.74);
          }

          50% {
            opacity: 0.92;
            transform: translateX(-50%) scaleX(1);
          }
        }

        @keyframes dvActiveOrbit {
          0%,
          100% {
            opacity: 0.38;
            transform: scale(0.96);
          }

          50% {
            opacity: 0.92;
            transform: scale(1.06);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .dv-nav-beam,
          .dv-active-orbit {
            animation: none;
          }
        }
      `}</style>
    </header>
  );
}
