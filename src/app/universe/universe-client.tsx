"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import UniverseGrid from "@/components/Universe/UniverseGrid";
import UniverseSidebar from "@/components/Universe/UniverseSidebar";
import UniverseToolbar from "@/components/Universe/UniverseToolbar";
import { supabase } from "@/lib/supabase/client";
import { useEffect } from "react";
import type { UniverseItem, UniverseCategory } from "@/components/Universe/universe.types";

const UniverseHero = dynamic(() => import("@/components/Universe/UniverseHero"), { ssr: false });
const CosmicGalaxyExplorer = dynamic(() => import("@/components/Universe/CosmicGalaxyExplorer"), { ssr: false });

import {
  quickTags,
  universeCategories,
} from "@/components/Universe/universe.mock";

import { motion, AnimatePresence } from "framer-motion";

export default function UniversePage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("전체");
  const [sort, setSort] = useState("popular");
  const [viewMode, setViewMode] = useState<"grid" | "map">("map");
  const [realUniverses, setRealUniverses] = useState<UniverseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUniverses = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("universes")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (data) {
          const mappedUniverses: UniverseItem[] = data.map((item: any) => ({
            id: item.id,
            slug: item.slug,
            name: item.name,
            description: item.description,
            category: item.category as UniverseCategory,
            subscribers: item.subscriber_count || 0,
            posts: item.post_count || 0,
            updatedAt: "최근", 
            tags: item.tags || [],
          }));
          setRealUniverses(mappedUniverses);
        }
      } catch (error) {
        console.error("Error fetching universes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUniverses();
  }, []);

  const filteredUniverses = useMemo(() => {
    let result = [...realUniverses];

    if (activeCategory !== "전체" && activeCategory !== "인기" && activeCategory !== "최신") {
      if (activeCategory === "구독 중") {
        result = result.slice(0, 3);
      } else {
        result = result.filter((item) => item.category === activeCategory);
      }
    }

    if (search.trim()) {
      const keyword = search.toLowerCase();

      result = result.filter((item) => {
        const target = [
          item.name,
          item.description,
          item.category,
          ...(item.tags ?? []),
        ]
          .join(" ")
          .toLowerCase();

        return target.includes(keyword);
      });
    }

    switch (sort) {
      case "popular":
        result.sort((a, b) => b.subscribers - a.subscribers);
        break;
      case "latest":
        result.sort((a, b) => b.posts - a.posts);
        break;
      case "active":
        result.sort(
          (a, b) => b.posts + b.subscribers - (a.posts + a.subscribers)
        );
        break;
      default:
        break;
    }

    return result;
  }, [activeCategory, search, sort, realUniverses]);

  return (
    <div className="relative min-h-screen text-slate-900 dark:text-white bg-slate-50/50 dark:bg-[#070612]">
      {/* Decorative Background Elements */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Soft Glows - Dreamcore/Space Aesthetic */}
        <div className="absolute -left-24 top-10 h-96 w-96 rounded-full bg-violet-500/5 blur-[100px] dark:bg-violet-600/10 dark:blur-[130px]" />
        <div className="absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full bg-cyan-400/5 blur-[120px] dark:bg-cyan-600/10 dark:blur-[150px]" />
        <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-fuchsia-400/5 blur-[100px] dark:bg-fuchsia-600/10 dark:blur-[120px]" />
        
        {/* Subtle Starlight/Dot Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.03)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] [background-size:40px_40px] opacity-40" />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-12 md:px-6 xl:px-8">
      {isLoading ? (
        <div className="flex h-[60vh] items-center justify-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-10 w-10 rounded-full border-4 border-slate-200 dark:border-white/10 border-t-cyan-500"
          />
        </div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <UniverseHero
              search={search}
              onSearchChange={setSearch}
              quickTags={quickTags}
              onTagClick={(tag) => setSearch(tag)}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <UniverseToolbar
              categories={universeCategories as unknown as string[]}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              sort={sort}
              onSortChange={setSort}
              resultCount={filteredUniverses.length}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </motion.div>

          <AnimatePresence mode="wait">
            {viewMode === "grid" ? (
              <motion.section 
                key="grid"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"
              >
                <UniverseGrid items={filteredUniverses} />
                <UniverseSidebar items={realUniverses} />
              </motion.section>
            ) : (
              <motion.div 
                key="map"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
              >
                <CosmicGalaxyExplorer items={filteredUniverses} />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
      </main>
    </div>
  );
}