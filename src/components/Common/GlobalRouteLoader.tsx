"use client";

import { useEffect } from "react";
import { makeLoadingHref } from "./LoadingOverlay";

export default function GlobalRouteLoader() {
  useEffect(() => {
    function shouldLoad(anchor: HTMLAnchorElement): boolean {
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return false;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return false;
      if (href.startsWith("http") && !href.startsWith(window.location.origin)) return false;

      try {
        const next = new URL(anchor.href, window.location.origin);
        const curr = new URL(window.location.href);

        // Never wrap the loading page itself in another loading page.
        if (next.pathname.startsWith("/loading")) return false;

        // Skip same-page navigations.
        if (next.pathname === curr.pathname && next.search === curr.search) return false;
      } catch {
        return false;
      }

      return true;
    }

    function handleClick(event: MouseEvent) {
      // Skip middle click and modifier-key navigation.
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.shiftKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a") as HTMLAnchorElement | null;
      if (!anchor || !shouldLoad(anchor)) return;

      event.preventDefault();
      event.stopPropagation();

      const url = new URL(anchor.href, window.location.origin);
      const targetHref = url.pathname + url.search + url.hash;
      const loadingUrl = makeLoadingHref({ to: targetHref });

      // Use a real document navigation here instead of router.push().
      // This guarantees that /loading is rendered as an actual page before
      // the loading bridge redirects to the final destination.
      window.location.assign(loadingUrl);
    }

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  return null;
}
