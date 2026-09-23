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
import type { LucideIcon } from "lucide-react";
import {
  ChevronDown,
  Home,
  Images,
  Link2,
  LogIn,
  Menu,
  MessageCircle,
  PenLine,
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
  { label: "Home", href: "/", icon: Home, accent: "#8b5cf6" },
  { label: "Universe", href: "/universe", icon: Sparkles, accent: "#38bdf8" },
  { label: "Wormhole", href: "/wormhole", icon: Link2, accent: "#c084fc" },
  { label: "Community", href: "/community", icon: MessageCircle, accent: "#fb7185" },
  { label: "Gallery", href: "/gallery", icon: Images, accent: "#facc15" },
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

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
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
  }, [pathname]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
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

        <div className="flex h-[68px] items-center gap-2 px-2.5 sm:gap-3 sm:px-4">
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
            <div className="relative flex items-center gap-0.5 rounded-[18px] border border-slate-200/60 bg-slate-100/45 p-1 shadow-inner shadow-white/70 xl:gap-1 dark:border-white/[0.07] dark:bg-black/20 dark:shadow-black/30">
              <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/10" />
              {navItems.map((item) => {
                const active = isActivePath(pathname, item.href);
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.href}
                    variants={squishyVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative flex h-10 items-center gap-1.5 rounded-xl px-2.5 text-[12px] font-bold transition-all xl:gap-2 xl:px-3 xl:text-[13px]",
                        active
                          ? "text-slate-950 dark:text-white"
                          : "text-slate-500 hover:bg-white/70 hover:text-slate-950 dark:text-white/55 dark:hover:bg-white/[0.06] dark:hover:text-white"
                      )}
                      style={
                        active
                          ? {
                              background:
                                "linear-gradient(135deg, color-mix(in srgb, var(--dv-nav-accent) 18%, white), color-mix(in srgb, var(--dv-nav-accent) 8%, transparent))",
                              boxShadow:
                                "0 8px 24px color-mix(in srgb, var(--dv-nav-accent) 18%, transparent), inset 0 0 0 1px color-mix(in srgb, var(--dv-nav-accent) 22%, transparent)",
                            }
                          : undefined
                      }
                    >
                      <Icon size={15} />
                      <span>{item.label}</span>

                      {active && (
                        <>
                          <span
                            className="absolute -bottom-[7px] left-1/2 h-[2px] w-7 -translate-x-1/2 rounded-full"
                            style={{
                              background: "var(--dv-nav-accent)",
                              boxShadow: "0 0 12px var(--dv-nav-accent)",
                            }}
                          />
                          <span
                            className="absolute right-1.5 top-1.5 h-1 w-1 rounded-full"
                            style={{
                              background: "var(--dv-nav-accent)",
                              boxShadow: "0 0 8px var(--dv-nav-accent)",
                            }}
                          />
                        </>
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="hidden w-[270px] shrink-0 2xl:block">
            <div className="relative rounded-[18px] border border-violet-300/25 bg-gradient-to-br from-violet-500/[0.08] to-cyan-400/[0.05] p-[3px] shadow-[0_10px_34px_rgba(99,102,241,.08)] dark:border-white/[0.08] dark:from-violet-500/[0.10] dark:to-cyan-400/[0.06]">
              <div className="pointer-events-none absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-violet-400/70 shadow-[0_0_10px_rgba(167,139,250,.7)]" />
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
                className="group/create relative flex h-10 items-center gap-1.5 overflow-hidden rounded-xl border border-violet-400/35 bg-[linear-gradient(135deg,rgba(124,58,237,.16),rgba(6,182,212,.10))] px-3 text-[12px] font-black text-violet-700 shadow-[0_8px_24px_rgba(124,58,237,.12)] transition hover:-translate-y-0.5 hover:border-cyan-400/40 hover:shadow-[0_12px_30px_rgba(124,58,237,.20)] dark:text-violet-100"
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
                  type="button"
                  aria-label="User menu"
                  aria-expanded={profileOpen}
                  onClick={() => setProfileOpen((value) => !value)}
                  className="flex h-10 items-center gap-2 rounded-xl border border-slate-200/70 bg-white/60 px-1.5 pr-2.5 transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 dark:border-white/10 dark:bg-white/[0.05] dark:hover:bg-white/[0.09]"
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

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.14 }}
                      className="absolute right-0 top-[48px] z-50 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-white/10 dark:bg-[#0b0d16]"
                    >
                      <div className="border-b border-slate-100 px-3 py-2.5 dark:border-white/[0.07]">
                        <p className="truncate text-sm font-black text-slate-900 dark:text-white">
                          {userName}
                        </p>
                        <p className="truncate text-[11px] text-slate-400">
                          {user?.email}
                        </p>
                      </div>

                      <Link
                        href={profileHref}
                        onClick={() => setProfileOpen(false)}
                        className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-white/70 dark:hover:bg-white/[0.07]"
                      >
                        <UserRound size={15} />
                        Profile
                      </Link>

                      <Link
                        href="/universe/write"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-white/70 dark:hover:bg-white/[0.07]"
                      >
                        <PenLine size={15} />
                        Write
                      </Link>

                      <Link
                        href="/universe/create"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-white/70 dark:hover:bg-white/[0.07]"
                      >
                        <Plus size={15} />
                        Create Universe
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
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
            rgba(139, 92, 246, 0.30),
            rgba(255, 255, 255, 0.12) 32%,
            rgba(34, 211, 238, 0.22) 68%,
            rgba(139, 92, 246, 0.22)
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
            var(--dv-nav-accent),
            rgba(255, 255, 255, 0.92),
            var(--dv-nav-accent),
            transparent
          );
          box-shadow: 0 0 18px var(--dv-nav-accent);
          animation: dvBeamPulse 4.2s ease-in-out infinite;
        }
      
        .dv-logo-orbit {
          animation: dvLogoFloat 5.5s ease-in-out infinite;
        }
      
        .dv-orbit-dot {
          animation: dvOrbitDot 3.2s ease-in-out infinite;
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
      
        @keyframes dvLogoFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-1.5px);
          }
        }
      
        @keyframes dvOrbitDot {
          0%,
          100% {
            transform: translate(0, 0) scale(0.9);
            opacity: 0.72;
          }
          50% {
            transform: translate(-5px, 12px) scale(1.15);
            opacity: 1;
          }
        }
      
        @media (prefers-reduced-motion: reduce) {
          .dv-nav-beam,
          .dv-logo-orbit,
          .dv-orbit-dot {
            animation: none;
          }
        }
      `}</style>
    </header>
  );
}
