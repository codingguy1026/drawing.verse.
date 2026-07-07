"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { makeLoadingHref } from "./LoadingOverlay";

export default function GlobalRouteLoader() {
  const router = useRouter();

  useEffect(() => {
    function shouldLoad(anchor: HTMLAnchorElement): boolean {
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return false;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return false;
      if (href.startsWith("http") && !href.startsWith(window.location.origin)) return false;

      try {
        const next = new URL(anchor.href, window.location.origin);
        const curr = new URL(window.location.href);
        // Skip same page navigations
        if (next.pathname === curr.pathname && next.search === curr.search) return false;
      } catch {
        return false;
      }
      return true;
    }

    function handleClick(e: MouseEvent) {
      // Skip middle click, cmd/ctrl+click
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;

      const anchor = (e.target as HTMLElement)?.closest("a") as HTMLAnchorElement | null;
      if (!anchor || !shouldLoad(anchor)) return;

      e.preventDefault();
      
      const url = new URL(anchor.href, window.location.origin);
      const targetHref = url.pathname + url.search + url.hash;
      const loadingUrl = makeLoadingHref({ to: targetHref });
      
      router.push(loadingUrl);
    }

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [router]);

  return null;
}
