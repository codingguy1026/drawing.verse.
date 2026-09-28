"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, ReactNode } from "react";
import {
  Images,
  Link2,
  MessageCircle,
  Orbit,
  PenLine,
  Search,
  Sparkles,
  UserRound,
} from "lucide-react";

type FrameItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string; size?: number }>;
};

const exploreItems: FrameItem[] = [
  { label: "Universe", href: "/universe", icon: Orbit },
  { label: "Wormhole", href: "/wormhole", icon: Link2 },
  { label: "Gallery", href: "/gallery", icon: Images },
  { label: "Community", href: "/community", icon: MessageCircle },
];

const createItems: FrameItem[] = [
  { label: "새 글", href: "/post/new", icon: PenLine },
  { label: "새 Universe", href: "/universe/create", icon: Sparkles },
];

const personalItems: FrameItem[] = [
  { label: "My Space", href: "/me", icon: UserRound },
  { label: "검색", href: "/search", icon: Search },
];

function isActive(pathname: string, href: string) {
  if (href === "/universe") {
    return pathname === href || (pathname.startsWith("/universe/") && pathname !== "/universe/create");
  }
  return pathname === href || pathname.startsWith(href + "/");
}

function routeMeta(pathname: string) {
  if (pathname.startsWith("/gallery")) return { eyebrow: "ART ORBIT", title: "Gallery", tone: "coral" };
  if (pathname.startsWith("/community")) return { eyebrow: "SOCIAL SIGNAL", title: "Community", tone: "coral" };
  if (pathname.startsWith("/wormhole")) return { eyebrow: "CROSS VERSE", title: "Wormhole", tone: "lavender" };
  if (pathname.startsWith("/universe/create")) return { eyebrow: "GENESIS", title: "Create Universe", tone: "coral" };
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

function RailGroup({ label, items, pathname }: { label: string; items: FrameItem[]; pathname: string }) {
  return (
    <div className="dv-frame-group">
      <p className="dv-frame-group-label">{label}</p>
      <div className="dv-frame-group-items">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`dv-frame-link${active ? " is-active" : ""}`}
            >
              <span className="dv-frame-link-icon"><Icon size={16} /></span>
              <span>{item.label}</span>
              {active ? <span className="dv-frame-link-dot" /> : null}
            </Link>
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
          <span className="dv-focus-signal"><i /> Secure Verse Access</span>
        </div>
        <div className="dv-route-content dv-subpage-slot">{children}</div>
      </div>
    );
  }

  return (
    <div className="dv-subpage-frame">
      <aside className="dv-subpage-rail" aria-label="Drawing Verse sections">
        <Link href="/" className="dv-frame-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/branding/dverse-logo-mark.svg" alt="" aria-hidden="true" />
          <span>
            <strong>DV</strong>
            <small>Verse Rail</small>
          </span>
        </Link>

        <div className="dv-frame-nav-scroll">
          <RailGroup label="EXPLORE" items={exploreItems} pathname={pathname} />
          <RailGroup label="CREATE" items={createItems} pathname={pathname} />
          <RailGroup label="PERSONAL" items={personalItems} pathname={pathname} />
        </div>

        <div className="dv-frame-rail-footer">
          <span className="dv-frame-orbit-mark" />
          <p>Coral signal</p>
          <p>Lavender orbit</p>
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
