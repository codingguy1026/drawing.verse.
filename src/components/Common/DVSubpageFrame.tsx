"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, CSSProperties, ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Home,
  Images,
  Link2,
  MessageCircle,
  Orbit,
  PenLine,
  Search,
  Sparkles,
  UserRound,
} from "lucide-react";
import ThemeToggle from "@/components/Common/ThemeToggle";
import { squishyVariants } from "@/lib/animations";

type FrameItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string; size?: number }>;
  accent: string;
};

const verseItems: FrameItem[] = [
  { label: "Home", href: "/", icon: Home, accent: "#ff6b72" },
  { label: "Universe", href: "/universe", icon: Orbit, accent: "#b89cff" },
  { label: "Wormhole", href: "/wormhole", icon: Link2, accent: "#8b5cf6" },
  { label: "Community", href: "/community", icon: MessageCircle, accent: "#f472b6" },
  { label: "Gallery", href: "/gallery", icon: Images, accent: "#a78bfa" },
];

const toolItems: FrameItem[] = [
  { label: "새 글", href: "/post/new", icon: PenLine, accent: "#ff6b72" },
  { label: "새 Universe", href: "/universe/create", icon: Sparkles, accent: "#b89cff" },\n  { label: "항성계", href: "/universe", icon: Sun, accent: "#f59e0b" },
  { label: "검색", href: "/search", icon: Search, accent: "#8a67e8" },
  { label: "My Space", href: "/me", icon: UserRound, accent: "#ff7a7a" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/universe") {
    return pathname === href || (
      pathname.startsWith("/universe/") &&
      !pathname.startsWith("/universe/create")
    );
  }
  return pathname === href || pathname.startsWith(href + "/");
}

function routeMeta(pathname: string) {
  if (pathname === "/") return { eyebrow: "INTERVERSE GATEWAY", title: "Home", tone: "coral" };
  if (pathname.startsWith("/gallery")) return { eyebrow: "ART ORBIT", title: "Gallery", tone: "coral" };
  if (pathname.startsWith("/community")) return { eyebrow: "SOCIAL SIGNAL", title: "Community", tone: "coral" };
  if (pathname.startsWith("/wormhole")) return { eyebrow: "CROSS VERSE", title: "Wormhole", tone: "lavender" };
  if (pathname.includes("/system/create")) return { eyebrow: "STELLAR GENESIS", title: "Create System", tone: "coral" };\n  if (pathname.includes("/system/")) return { eyebrow: "STELLAR ORBIT", title: "Stellar System", tone: "lavender" };\n  if (pathname.startsWith("/universe/create")) return { eyebrow: "GENESIS", title: "Create Universe", tone: "coral" };
  if (pathname.startsWith("/universe")) return { eyebrow: "VERSE MAP", title: "Universe", tone: "lavender" };
  if (pathname.startsWith("/post/new")) return { eyebrow: "TRANSMISSION", title: "Create Post", tone: "coral" };
  if (pathname.startsWith("/post/")) return { eyebrow: "TRANSMISSION", title: "Post", tone: "lavender" };
  if (pathname.startsWith("/profile/") || pathname.startsWith("/users/") || pathname === "/me") {
    return { eyebrow: "IDENTITY", title: "My Space", tone: "lavender" };
  }
  if (pathname.startsWith("/search")) return { eyebrow: "DEEP SCAN", title: "Search", tone: "lavender" };
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/auth/")
  ) {
    return { eyebrow: "ACCESS GATE", title: "Drawing Verse", tone: "coral" };
  }
  return { eyebrow: "DRAWING VERSE", title: "Verse", tone: "lavender" };
}

function DockGroup({
  label,
  items,
  pathname,
  orbit = false,
}: {
  label: string;
  items: FrameItem[];
  pathname: string;
  orbit?: boolean;
}) {
  return (
    <div className={`dv-frame-group${orbit ? " dv-frame-group--orbit" : ""}`}>
      <p className="dv-frame-group-label">{label}</p>
      <div className="dv-frame-group-items">
        {orbit ? <span className="dv-rail-orbit-line" aria-hidden="true" /> : null}
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;

          return (
            <motion.div
              key={item.href}
              variants={squishyVariants}
              whileHover="hover"
              whileTap="tap"
              className="dv-frame-link-wrap"
            >
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`dv-frame-link${active ? " is-active" : ""}`}
                style={{ "--dv-item-accent": item.accent } as CSSProperties}
              >
                <span className="dv-frame-link-icon">
                  {active ? <span className="dv-frame-active-orbit" aria-hidden="true" /> : null}
                  <Icon size={15} />
                  <i className="dv-frame-node" aria-hidden="true" />
                </span>
                <span className="dv-frame-link-copy">
                  <strong>{item.label}</strong>
                  {active ? <small>Current Verse</small> : null}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function DVSubpageFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const meta = routeMeta(pathname);
  const focusMode =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/auth/");

  if (focusMode) {
    return (
      <div className="dv-subpage-frame dv-subpage-frame--focus">
        <div className="dv-focus-brandbar">
          <Link href="/" className="dv-focus-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/branding/dverse-logo-mark.svg" alt="" aria-hidden="true" />
            <span>
              <strong>Drawing Verse</strong>
              <small>{meta.eyebrow}</small>
            </span>
          </Link>
          <div className="dv-focus-actions">
            <span className="dv-focus-signal"><i /> Secure Verse Access</span>
            <ThemeToggle />
          </div>
        </div>
        <div className="dv-route-content dv-subpage-slot">{children}</div>
      </div>
    );
  }

  return (
    <div className="dv-subpage-frame">
      <aside className="dv-subpage-rail" aria-label="Drawing Verse navigation">
        <div className="dv-rail-depth-shadow" aria-hidden="true" />
        <div className="dv-rail-underplate" aria-hidden="true" />
        <div className="dv-rail-stars" aria-hidden="true" />

        <Link href="/" className="dv-frame-brand" aria-label="Drawing Verse Home">
          <span className="dv-frame-brand-mark">
            <i aria-hidden="true" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/branding/dverse-logo-mark.svg" alt="" aria-hidden="true" />
          </span>
          <span className="dv-frame-brand-copy">
            <strong>Drawing Verse</strong>
            <small>Verse Navigator</small>
          </span>
        </Link>

        <div className="dv-frame-nav-scroll">
          <DockGroup label="VERSE MAP" items={verseItems} pathname={pathname} orbit />
          <DockGroup label="TOOLS" items={toolItems} pathname={pathname} />
        </div>

        <div className="dv-frame-rail-footer">
          <div className="dv-frame-utility">
            <ThemeToggle />
            <div>
              <strong>Appearance</strong>
              <small>Light / Dark</small>
            </div>
          </div>
          <span className="dv-frame-orbit-mark" />
          <p>Drawing Verse · Navigator</p>
        </div>
      </aside>

      <section className="dv-subpage-stage">
        <div className="dv-subpage-contextbar">
          <div className="dv-context-copy">
            <span className={`dv-context-signal is-${meta.tone}`} />
            <div>
              <p>{meta.eyebrow}</p>
              <strong>{meta.title}</strong>
            </div>
          </div>

          <div className="dv-context-path" title={pathname}>
            <span>dv://</span>{pathname.replace(/^\//, "") || "home"}
          </div>
        </div>

        <div className="dv-route-content dv-subpage-slot">{children}</div>
      </section>
    </div>
  );
}
