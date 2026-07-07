"use client";

import { Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { motion } from "framer-motion";
import { squishyVariants } from "@/lib/animations";

type Suggestion = {
  type: "universe" | "post";
  id: number;
  label: string;
  slug?: string;
  universe_slug?: string;
};

export default function SearchBar({
  className = "",
  placeholder = "유니버스, 작품, 태그, 유저 검색...",
}: {
  className?: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // fetch suggestions with debounce
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search/autocomplete?query=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data: Suggestion[] = await res.json();
          setSuggestions(data);
          setShow(true);
        }
      } catch {
        // ignore aborted or network errors
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // click outside to close
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShow(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = query.trim();
    if (text) {
      router.push(`/search?query=${encodeURIComponent(text)}`);
      setShow(false);
    }
  };

  return (
    <div className={"relative " + className} ref={ref}>
      <motion.form 
        variants={squishyVariants}
        whileHover="hover"
        whileTap="tap"
        onSubmit={onSubmit} 
        className="relative w-full max-w-md group"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setShow(true);
          }}
          type="text"
          name="query"
          placeholder={placeholder}
          className="w-full rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-white/5 px-5 py-3 text-[14px] text-slate-900 dark:text-white outline-none transition-all duration-300 focus:border-violet-500/30 dark:focus:border-violet-500/30 focus:bg-white dark:focus:bg-white/[0.08] focus:ring-1 focus:ring-violet-500/20 placeholder:text-slate-400 dark:placeholder:text-white/20"
        />
        <button
          type="submit"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/20 hover:text-violet-500 dark:hover:text-white transition-colors"
          aria-label="검색"
        >
          <Search className="w-4 h-4" />
        </button>
      </motion.form>
      {show && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-[24px] dv-glass-gradient p-2 shadow-premium max-h-80 custom-scrollbar">
          {suggestions.map((s, i) => (
            <li key={i}>
              <a
                href={
                  s.type === "universe" 
                    ? `/universe/${s.slug}` 
                    : `/universe/${s.universe_slug || 'all'}/${s.id}`
                }
                className="group/item flex items-center justify-between rounded-xl px-4 py-3 text-sm transition-all hover:bg-violet-500/5 dark:hover:bg-white/5"
                onClick={() => setShow(false)}
              >
                <span className="font-medium text-slate-600 dark:text-white/70 group-hover/item:text-violet-600 dark:group-hover/item:text-white transition-colors capitalize">
                  {s.label}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400 opacity-60">
                  {s.type}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
