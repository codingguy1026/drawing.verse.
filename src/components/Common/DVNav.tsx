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
  Search,
  Sparkles,
  UserRound,
  WandSparkles,
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
          "relative mx-auto max-w-[1440px] rounded-[24px] border backdrop-blur-xl",
          "transition-[background-color,border-color,box-shadow] duration-300",
          "border-slate-200/70 bg-white/80 dark:border-white/10 dark:bg-[#070912]/80",
          scrolled
            ? "shadow-[0_16px_50px_rgba(15,23,42,0.12)] dark:shadow-[0_18px_60px_rgba(0,0,0,0.42)]"
            : "shadow-[0_8px_30px_rgba(15,23,42,0.07)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.25)]"
        )}
      >
        <div
          className="pointer-events-none absolute inset-x-10 top-0 h-px opacity-70"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--dv-nav-accent), transparent)",
            boxShadow: "0 0 16px var(--dv-nav-accent)",
          }}
        />

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
              className="flex items-center gap-2.5 rounded-xl px-2 py-2 transition hover:bg-slate-100/80 dark:hover:bg-white/[0.06]"
            >
              <div className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl border border-violet-300/40 bg-violet-500/10 dark:border-violet-400/20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(167,139,250,.40),transparent_55%)]" />
                <WandSparkles
                  size={18}
                  className="relative text-violet-600 dark:text-violet-300"
                />
              </div>

              <div className="hidden leading-tight sm:block">
                <p className="whitespace-nowrap text-[14px] font-black tracking-tight text-slate-950 dark:text-white">
                  Drawing Verse
                </p>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-white/35">
                  Verse Navigator
                </p>
              </div>
            </Link>
          </motion.div>

          <div className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
            <div className="flex items-center gap-0.5 xl:gap-1">
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
                          ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
                          : "text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-white/55 dark:hover:bg-white/[0.07] dark:hover:text-white"
                      )}
                    >
                      <Icon size={15} />
                      <span>{item.label}</span>

                      {active && (
                        <span
                          className="absolute -bottom-[7px] left-1/2 h-[2px] w-7 -translate-x-1/2 rounded-full"
                          style={{
                            background: "var(--dv-nav-accent)",
                            boxShadow: "0 0 10px var(--dv-nav-accent)",
                          }}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="hidden w-[250px] shrink-0 2xl:block">
            <SearchBar
              placeholder="Search the Verse..."
              className="w-full"
            />
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
                className="flex h-10 items-center gap-1.5 rounded-xl border border-violet-400/20 bg-violet-500/10 px-3 text-[12px] font-black text-violet-700 transition hover:border-violet-400/40 hover:bg-violet-500/15 dark:text-violet-200"
              >
                <Plus size={15} />
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
              <div className="space-y-2 p-3">
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
    </header>
  );
}
