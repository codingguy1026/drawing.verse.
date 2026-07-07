// src/components/TabsNav.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Orbit,
  MessageCircle,
  Image as ImageIcon,
  Menu,
  X,
  Sun,
  Moon,
  PenSquare,
} from "lucide-react";
import SearchBar from "./SearchBar";
import { useTheme } from "@/lib/ThemeProvider";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { supabase } from "@/lib/supabase/client";
import { squishyVariants } from "@/lib/animations";

const NAV_ITEMS = [
  { href: "/", label: "Feed", icon: Home },
  { href: "/universe", label: "Universe", icon: Orbit },
  { href: "/community", label: "Discuss", icon: MessageCircle },
  { href: "/gallery", label: "Gallery", icon: ImageIcon },
] as const;

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function isNavItemActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavItemLink({
  href,
  label,
  icon: Icon,
  active,
  mobile = false,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: typeof Home;
  active: boolean;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <motion.div
      variants={squishyVariants}
      whileHover="hover"
      whileTap="tap"
      className="relative"
    >
      <Link
        href={href}
        onClick={onNavigate}
        className={cx(
          "group relative flex items-center gap-2 transition-colors duration-200",
          mobile
            ? "rounded-2xl px-4 py-3"
            : "rounded-full px-4 py-2.5",
          active
            ? "text-slate-900 dark:text-white"
            : "text-slate-500 hover:text-slate-900 dark:text-slate-300/80 dark:hover:text-white"
        )}
      >
        {active && (
          <motion.span
            layoutId={mobile ? "mobile-active-pill" : "active-pill"}
            className={cx(
              "absolute inset-0 z-0",
              mobile ? "rounded-2xl" : "rounded-full",
              "bg-slate-100 shadow-sm dark:bg-white/15 dark:shadow-[0_8px_20px_rgba(168,139,250,0.25)]"
            )}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}
        
        {!active && (
          <span
            className={cx(
              "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
              mobile ? "rounded-2xl" : "rounded-full",
              "bg-slate-100/60 dark:bg-white/10"
            )}
          />
        )}

        <Icon
          className={cx(
            "relative z-10 h-4 w-4 transition-transform duration-200",
            active ? "scale-110 stroke-[2.4px]" : "stroke-2"
          )}
        />

        <span className="relative z-10 text-sm font-semibold tracking-tight">
          {label}
        </span>
      </Link>
    </motion.div>
  );
}

export default function TabsNav() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, loading } = useSupabaseUser();

  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [profileName, setProfileName] = useState<string | null>(null);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 18);

    window.addEventListener("scroll", onScroll);
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        userMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setUserMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [userMenuOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

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

  const activeItem = useMemo(
    () =>
      NAV_ITEMS.find((item) => isNavItemActive(pathname, item.href)) ??
      NAV_ITEMS[0],
    [pathname]
  );

  const profileHref = user ? `/users/${user.id}` : "/login";

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const avatarLetter = (
    profileName ||
    user?.user_metadata?.full_name ||
    user?.email ||
    "D"
  )
    .slice(0, 1)
    .toUpperCase();

  const displayName =
    profileName || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cx(
        "fixed left-0 right-0 top-0 transition-all duration-300 ease-out",
        isScrolled ? "py-2" : "py-4"
      )}
      style={{ zIndex: 50 }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div
          className={cx(
            "relative rounded-[2rem] px-4 py-3 transition-all duration-300 sm:px-5",
            "border border-slate-200/60 bg-white/80 shadow-lg shadow-violet-500/5 backdrop-blur-xl dark:border-white/10 dark:bg-[#090514]/80",
            isScrolled &&
            "border-slate-200 bg-white/95 shadow-violet-500/10 dark:border-white/20 dark:bg-[#090514]"
          )}
        >
          <div className="relative z-10 flex items-center justify-between gap-3">
            <Link
              href="/"
              className="group flex items-center gap-3"
            >
              <motion.div 
                variants={squishyVariants}
                whileHover="hover"
                whileTap="tap"
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/40 bg-white/45 text-slate-700 shadow-[0_8px_24px_rgba(168,139,250,0.10)] backdrop-blur-md dark:border-white/15 dark:bg-white/[0.08] dark:text-white"
              >
                <span className="text-lg font-black tracking-tighter">DV</span>
              </motion.div>

              <div className="hidden lg:block">
                <div className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                  DRAWING{" "}
                  <span className="text-violet-500 dark:text-violet-400">
                    VERSE
                  </span>
                </div>
                <div className="text-[10px] uppercase tracking-[0.32em] text-slate-500 dark:text-slate-300/70">
                  dreaming space
                </div>
              </div>
            </Link>

            <div className="mx-auto hidden max-w-md flex-1 md:block lg:max-w-lg">
              <div className="rounded-full border border-slate-200 bg-slate-50/50 p-1 shadow-sm backdrop-blur-md dark:border-white/15 dark:bg-white/5">
                <SearchBar />
              </div>
            </div>

            <nav className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50/50 p-1.5 shadow-sm backdrop-blur-md dark:border-white/15 dark:bg-white/5 lg:flex">
              {NAV_ITEMS.map((item) => (
                <NavItemLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={isNavItemActive(pathname, item.href)}
                />
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {user && (
                <motion.div
                  variants={squishyVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Link
                    href="/write"
                    className="hidden items-center gap-2 rounded-full bg-violet-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(139,92,246,0.20)] md:flex"
                  >
                    <PenSquare className="h-4 w-4 stroke-[2.5px]" />
                    <span>글쓰기</span>
                  </Link>
                </motion.div>
              )}

              <motion.button
                variants={squishyVariants}
                whileHover="hover"
                whileTap="tap"
                type="button"
                onClick={toggleTheme}
                className="group flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50/50 text-slate-500 dark:border-white/15 dark:bg-white/5 dark:text-slate-300"
                aria-label="Toggle Theme"
              >
                {!mounted ? (
                  <div className="h-4 w-4" />
                ) : theme === "light" ? (
                  <Moon className="h-4 w-4 transition-transform group-hover:-rotate-12" />
                ) : (
                  <Sun className="h-4 w-4 transition-transform group-hover:rotate-45" />
                )}
              </motion.button>

              <div className="relative">
                {loading ? (
                  <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
                ) : user ? (
                  <>
                    <motion.button
                      ref={buttonRef}
                      variants={squishyVariants}
                      whileHover="hover"
                      whileTap="tap"
                      type="button"
                      onClick={() => setUserMenuOpen((value) => !value)}
                      className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50/50 text-slate-500 dark:border-white/15 dark:bg-white/5 dark:text-slate-300"
                      aria-label="User Menu"
                      aria-expanded={userMenuOpen}
                    >
                      {profileAvatarUrl || user.user_metadata?.avatar_url ? (
                        <Image
                          src={
                            profileAvatarUrl ||
                            user.user_metadata?.avatar_url
                          }
                          alt="User avatar"
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500 to-indigo-500 text-sm font-black text-white">
                          {avatarLetter}
                        </div>
                      )}
                    </motion.button>

                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          ref={menuRef}
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          className={cx(
                            "absolute right-0 top-[calc(100%+10px)] w-56 overflow-hidden rounded-[1.4rem] border p-2 shadow-lg backdrop-blur-xl transition-all dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
                            "border-slate-200 bg-white/95 text-slate-900 dark:border-white/15 dark:bg-[#0f1220]/95 dark:text-white"
                          )}
                        >
                          <div
                            className={cx(
                              "mb-2 rounded-[1.1rem] border px-3 py-3",
                              "border-slate-100 bg-slate-50 dark:border-white/10 dark:bg-white/5"
                            )}
                          >
                            <div className="truncate text-sm font-semibold">
                              {displayName}
                            </div>
                            <div className="mt-1 truncate text-[10px] text-slate-500 dark:text-slate-300/70">
                              {user.email}
                            </div>
                          </div>

                          <div className="grid gap-1">
                            <Link
                              href={profileHref}
                              className={cx(
                                "rounded-xl px-3 py-2.5 text-sm transition",
                                "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                              )}
                            >
                              프로필 보러가기
                            </Link>

                            <Link
                              href={`/users/${user.id}/edit`}
                              className={cx(
                                "rounded-xl px-3 py-2.5 text-sm transition",
                                "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                              )}
                            >
                              프로필 수정
                            </Link>

                            <Link
                              href="/settings"
                              className={cx(
                                "rounded-xl px-3 py-2.5 text-sm transition",
                                "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                              )}
                            >
                              설정
                            </Link>

                            <button
                              type="button"
                              onClick={handleLogout}
                              className="rounded-xl px-3 py-2.5 text-left text-sm text-rose-400 transition hover:bg-rose-400/10"
                            >
                              로그아웃
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="flex h-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50/50 px-4 text-xs font-bold text-slate-600 transition-all hover:bg-slate-200 hover:text-slate-900 dark:border-white/15 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/15 dark:hover:text-white"
                  >
                    로그인
                  </Link>
                )}
              </div>

              <button
                type="button"
                onClick={() => setMobileOpen((value) => !value)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50/50 text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-900 active:scale-95 dark:border-white/15 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/15 dark:hover:text-white lg:hidden"
                aria-label="Mobile Menu"
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative z-10 overflow-hidden lg:hidden"
              >
                <div className="pt-4">
                  <div
                    className={cx(
                      "rounded-[1.6rem] border p-2 backdrop-blur-xl",
                      "border-slate-200 bg-white/90 dark:border-white/15 dark:bg-[#090514]/90"
                    )}
                  >
                    <div className="mb-2 md:hidden">
                      <div
                        className={cx(
                          "rounded-full border p-1",
                          "border-slate-200 bg-slate-50/50 dark:border-white/10 dark:bg-white/5"
                        )}
                      >
                        <SearchBar />
                      </div>
                    </div>

                    <div className="grid gap-1.5">
                      {NAV_ITEMS.map((item) => (
                        <NavItemLink
                          key={item.href}
                          href={item.href}
                          label={item.label}
                          icon={item.icon}
                          active={isNavItemActive(pathname, item.href)}
                          mobile
                          onNavigate={() => setMobileOpen(false)}
                        />
                      ))}
                    </div>

                    {user && (
                      <div className="mt-2 grid gap-2">
                        <Link
                          href="/write"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center justify-center gap-2 rounded-2xl bg-violet-500 px-4 py-3 text-sm font-bold text-white"
                        >
                          <PenSquare className="h-4 w-4 stroke-[2.5px]" />
                          글쓰기
                        </Link>

                        <Link
                          href={`/users/${user.id}`}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 dark:border-white/15 dark:bg-white/5 dark:text-slate-200"
                        >
                          내 프로필
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeItem.label}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className="mt-3 hidden sm:block"
        >
          <div
            className={cx(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.28em] backdrop-blur-md",
              "border-slate-200 bg-slate-50/50 text-slate-600 dark:border-white/15 dark:bg-white/5 dark:text-slate-300"
            )}
          >
            <span className="relative flex h-2 w-2 items-center justify-center">
              <span className="absolute h-2 w-2 animate-ping rounded-full bg-violet-300/30" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-violet-400" />
            </span>
            {activeItem.label}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.header>
  );
}

export function runTabsNavPathTests() {
  const cases = [
    ["/", "/", true],
    ["/universe", "/universe", true],
    ["/universe/space", "/universe", true],
    ["/community/post/3", "/community", true],
    ["/gallery/item/2", "/gallery", true],
    ["/galleryish", "/gallery", false],
    ["/profile", "/", false],
    ["/profile/orbit", "/", false],
    ["/users/abc", "/", false],
  ] as const;

  return cases.map(([pathname, href, expected]) => ({
    pathname,
    href,
    expected,
    actual: isNavItemActive(pathname, href),
    pass: isNavItemActive(pathname, href) === expected,
  }));
}
