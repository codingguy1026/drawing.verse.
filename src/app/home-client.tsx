"use client";

import * as React from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Orbit, Pencil, Save, Sparkles, X as CloseIcon } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { squishyVariants } from "@/lib/animations";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import VersePulse from "@/components/Home/VersePulse";

const feedTabs = ["전체", "Best", "Hot"] as const;
type FeedTab = (typeof feedTabs)[number];
const noticeRankings = [
  "[공지] 홈 화면 리워크 의견 모아보기",
  "[이벤트] 이번 주 인기 유니버스 선정 중",
  "[안내] 신규 유저 가이드 업데이트",
];
const featuredTags = ["세계관", "팬아트", "시", "단편", "창작 커뮤니티"];

type HomeConfig = {
  heroTitle: string;
  heroHighlight: string;
  heroSuffix: string;
  heroDesc: string;
  tags: string[];
  notices: string[];
};

type HomePost = {
  id: string | number;
  publicId: string | number;
  title: string;
  meta: string;
  stats: string;
  universe: string;
  type: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
};

type HomeUniverse = {
  name: string;
  description: string;
  members: number;
  tags: string[];
  slug: string;
};

const defaultHomeConfig: HomeConfig = {
  heroTitle: "그림과 이야기,",
  heroHighlight: "너만의 우주",
  heroSuffix: "가 모이다",
  heroDesc:
    "팬아트, 오리지널 세계관, 짧은 글, 긴 이야기까지. Drawing Verse에서는 당신의 상상이 빛나는 별이 됩니다.",
  tags: featuredTags,
  notices: noticeRankings,
};

function cloneHomeConfig(config: HomeConfig): HomeConfig {
  return {
    ...config,
    tags: [...config.tags],
    notices: [...config.notices],
  };
}

function parseHomeConfig(value: unknown): HomeConfig | null {
  if (!value || typeof value !== "object") return null;

  const candidate = value as Partial<HomeConfig>;
  const readText = (text: unknown, fallback: string, maxLength: number) =>
    typeof text === "string" ? text.slice(0, maxLength) : fallback;
  const readList = (list: unknown, fallback: string[], limit: number) =>
    Array.isArray(list)
      ? list
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.slice(0, 80))
          .slice(0, limit)
      : [...fallback];

  return {
    heroTitle: readText(candidate.heroTitle, defaultHomeConfig.heroTitle, 80),
    heroHighlight: readText(
      candidate.heroHighlight,
      defaultHomeConfig.heroHighlight,
      80
    ),
    heroSuffix: readText(candidate.heroSuffix, defaultHomeConfig.heroSuffix, 80),
    heroDesc: readText(candidate.heroDesc, defaultHomeConfig.heroDesc, 320),
    tags: readList(candidate.tags, defaultHomeConfig.tags, 10),
    notices: readList(candidate.notices, defaultHomeConfig.notices, 8),
  };
}

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function formatMembers(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function StatPill(props: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1.5 font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-300">
      {props.children}
    </span>
  );
}

function EditableText({
  isEditing,
  value,
  onChange,
  className,
  multiline = false,
  as: Component = "span",
}: {
  isEditing: boolean;
  value: string;
  onChange: (val: string) => void;
  className?: string;
  multiline?: boolean;
  as?: React.ElementType;
}) {
  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full rounded-xl border border-violet-500/30 bg-slate-100/50 p-3 text-slate-900 outline-none focus:ring-2 focus:ring-violet-500/50 dark:bg-white/10 dark:text-white",
            className
          )}
          rows={3}
        />
      );
    }

    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full rounded-xl border border-violet-500/30 bg-slate-100/50 px-3 py-1 text-slate-900 outline-none focus:ring-2 focus:ring-violet-500/50 dark:bg-white/10 dark:text-white",
          className
        )}
      />
    );
  }

  return <Component className={className}>{value}</Component>;
}

export default function HomeClient() {
  const { user, loading: userLoading } = useSupabaseUser();
  const [posts, setPosts] = useState<HomePost[]>([]);
  const [universes, setUniverses] = useState<HomeUniverse[]>([]);
  const [trendData, setTrendData] = useState({ artworks: 0, posts: 0, universes: 0 });
  const [loading, setLoading] = useState(true);
  const [activeFeedTab, setActiveFeedTab] = useState<FeedTab>("전체");

  const [isEditing, setIsEditing] = useState(false);
  const [heroTitle, setHeroTitle] = useState(defaultHomeConfig.heroTitle);
  const [heroHighlight, setHeroHighlight] = useState(defaultHomeConfig.heroHighlight);
  const [heroSuffix, setHeroSuffix] = useState(defaultHomeConfig.heroSuffix);
  const [heroDesc, setHeroDesc] = useState(defaultHomeConfig.heroDesc);
  const [tags, setTags] = useState([...defaultHomeConfig.tags]);
  const [notices, setNotices] = useState([...defaultHomeConfig.notices]);
  const [savedConfig, setSavedConfig] = useState(() => cloneHomeConfig(defaultHomeConfig));
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const applyHomeConfig = React.useCallback((config: HomeConfig) => {
    setHeroTitle(config.heroTitle);
    setHeroHighlight(config.heroHighlight);
    setHeroSuffix(config.heroSuffix);
    setHeroDesc(config.heroDesc);
    setTags([...config.tags]);
    setNotices([...config.notices]);
  }, []);

  useEffect(() => {
    if (userLoading) return;

    if (!user) {
      const defaults = cloneHomeConfig(defaultHomeConfig);
      applyHomeConfig(defaults);
      setSavedConfig(defaults);
      setIsEditing(false);
      setSaveMessage(null);
      return;
    }

    const storageKey = `dv_home_config:${user.id}`;
    let localConfig: HomeConfig | null = null;

    try {
      const savedData = localStorage.getItem(storageKey) ?? localStorage.getItem("dv_home_config");
      if (savedData) localConfig = parseHomeConfig(JSON.parse(savedData));
    } catch (error) {
      console.error("Failed to load local home config", error);
    }

    const config =
      parseHomeConfig(user.user_metadata?.home_config) ??
      localConfig ??
      cloneHomeConfig(defaultHomeConfig);

    applyHomeConfig(config);
    setSavedConfig(cloneHomeConfig(config));
    setIsEditing(false);
    setSaveMessage(null);
  }, [applyHomeConfig, user, userLoading]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      try {
        const [postsResult, universesResult, galleryResult] = await Promise.all([
          supabase.from("posts").select("*", { count: "exact" }).order("created_at", { ascending: false }).limit(10),
          supabase.from("universes").select("*", { count: "exact" }).limit(4),
          supabase.from("gallery").select("id", { count: "exact", head: true }),
        ]);

        if (postsResult.error) throw postsResult.error;
        if (universesResult.error) throw universesResult.error;

        const mappedPosts: HomePost[] = (postsResult.data ?? []).map((item) => ({
          id: item.id,
          publicId: item.public_id || item.id,
          title: item.title,
          meta: `${item.author || "익명"} · ${new Date(item.created_at).toLocaleDateString("ko-KR")}`,
          stats: `좋아요 ${item.like_count || 0} · 댓글 ${item.comment_count || 0}`,
          universe: item.universe_slug || "unknown",
          type: item.category || "전체",
          createdAt: item.created_at,
          likeCount: item.like_count ?? item.likes_count ?? 0,
          commentCount: item.comment_count ?? item.comments_count ?? 0,
        }));

        const mappedUniverses: HomeUniverse[] = (universesResult.data ?? []).map((item) => ({
          name: item.name,
          description: item.description || "아직 소개가 없는 유니버스예요.",
          members: item.subscriber_count || 0,
          tags: [item.category].filter(Boolean),
          slug: item.slug,
        }));

        setPosts(mappedPosts);
        setUniverses(mappedUniverses);
        setTrendData({
          artworks: galleryResult.count || 0,
          posts: postsResult.count || 0,
          universes: universesResult.count || 0,
        });
      } catch (error) {
        console.error("Error loading home data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    const postsChannel = supabase
      .channel("realtime-posts-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => loadData())
      .subscribe();

    const universesChannel = supabase
      .channel("realtime-universes-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "universes" }, () => loadData())
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(universesChannel);
    };
  }, []);

  const handleSave = async () => {
    if (!user || isSaving) return;

    const nextConfig = parseHomeConfig({ heroTitle, heroHighlight, heroSuffix, heroDesc, tags, notices });
    if (!nextConfig) return;

    if (!nextConfig.heroTitle.trim() || !nextConfig.heroHighlight.trim() || !nextConfig.heroDesc.trim()) {
      setSaveMessage("제목과 소개 문구는 비워둘 수 없어요.");
      return;
    }

    nextConfig.tags = nextConfig.tags.map((tag) => tag.trim()).filter(Boolean);
    nextConfig.notices = nextConfig.notices.map((notice) => notice.trim()).filter(Boolean);

    setIsSaving(true);
    setSaveMessage(null);

    const { error } = await supabase.auth.updateUser({ data: { home_config: nextConfig } });

    if (error) {
      console.error("Failed to save home config", error);
      setSaveMessage("저장에 실패했어요. 잠시 후 다시 시도해 주세요.");
      setIsSaving(false);
      return;
    }

    localStorage.setItem(`dv_home_config:${user.id}`, JSON.stringify(nextConfig));
    localStorage.removeItem("dv_home_config");
    applyHomeConfig(nextConfig);
    setSavedConfig(cloneHomeConfig(nextConfig));
    setIsEditing(false);
    setIsSaving(false);
    setSaveMessage("내 홈에 저장됐어요.");
  };

  const handleCancel = () => {
    applyHomeConfig(savedConfig);
    setIsEditing(false);
    setSaveMessage(null);
  };

  const primaryPost = posts[0];
  const featuredPosts = posts.slice(0, 3);
  const filteredPosts = React.useMemo(() => {
    if (activeFeedTab === "전체") return posts;

    const ranked = [...posts];

    if (activeFeedTab === "Best") {
      return ranked.sort(
        (a, b) =>
          b.likeCount + b.commentCount - (a.likeCount + a.commentCount) ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return ranked.sort(
      (a, b) =>
        b.commentCount * 2 + b.likeCount - (a.commentCount * 2 + a.likeCount) ||
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [activeFeedTab, posts]);

  const orbitPositions = [
    "left-[8%] top-[18%]",
    "right-[3%] top-[24%]",
    "left-[2%] bottom-[18%]",
    "right-[12%] bottom-[10%]",
  ] as const;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f8f7fb] text-slate-950 transition-colors duration-700 dark:bg-[#03050a] dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12%] top-[-10%] h-[560px] w-[560px] rounded-full bg-[#ff6b72]/10 blur-[140px] dark:bg-[#ff6b72]/12" />
        <div className="absolute right-[-8%] top-[4%] h-[620px] w-[620px] rounded-full bg-[#b89cff]/12 blur-[150px] dark:bg-[#8060f1]/18" />
        <div className="absolute left-[34%] top-[28%] h-[420px] w-[420px] rounded-full bg-violet-400/5 blur-[150px] dark:bg-violet-400/8" />
        <div className="absolute inset-0 opacity-[0.34] [background-image:radial-gradient(circle,rgba(100,116,139,.26)_1px,transparent_1px)] [background-size:34px_34px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)] dark:opacity-[0.16]" />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-[1380px] px-4 pb-24 pt-5 sm:px-6 sm:pt-7 lg:px-8">
        <section className="relative min-h-[660px] overflow-visible pb-14 pt-8 sm:pt-12 lg:grid lg:grid-cols-[1.02fr_.98fr] lg:items-center lg:gap-10 lg:pb-20 lg:pt-16">
          {!userLoading && user && (
            <div className="absolute right-0 top-0 z-20">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-xs font-black text-white shadow-[0_10px_24px_rgba(16,185,129,.22)] transition hover:-translate-y-0.5 disabled:opacity-60"
                  >
                    <Save size={14} />
                    {isSaving ? "저장 중..." : "저장"}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-black text-slate-600 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.07] dark:text-white"
                  >
                    <CloseIcon size={14} />
                    취소
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/75 px-4 py-2 text-xs font-black text-slate-500 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-violet-300 hover:text-violet-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/65"
                >
                  <Pencil size={14} />
                  홈 수정
                </button>
              )}

              {saveMessage && (
                <p className="mt-2 rounded-xl border border-slate-200/70 bg-white/85 px-3 py-2 text-right text-[11px] font-bold text-slate-500 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-black/40 dark:text-slate-300">
                  {saveMessage}
                </p>
              )}
            </div>
          )}

          <div className="relative z-10 max-w-[720px]">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-7 flex w-fit items-center gap-3"
            >
              <span className="h-2 w-2 rounded-full bg-[#ff6b72] shadow-[0_0_12px_rgba(255,107,114,.85)]" />
              <span className="text-[10px] font-black uppercase tracking-[.28em] text-slate-400 dark:text-white/35">
                Drawing Verse · Interverse Gateway
              </span>
              <span className="h-px w-10 bg-gradient-to-r from-[#ff6b72]/60 to-[#b89cff]/20" />
            </motion.div>

            <h1 className="max-w-[760px] text-[48px] font-black leading-[.92] tracking-[-.065em] text-slate-950 dark:text-white sm:text-[62px] md:text-[74px] lg:text-[76px] xl:text-[86px]">
              <EditableText
                isEditing={isEditing}
                value={heroTitle}
                onChange={setHeroTitle}
              />
              <br />
              <span className="bg-[linear-gradient(96deg,#ef4c5f_0%,#ff6b72_30%,#b89cff_67%,#8060f1_100%)] bg-clip-text text-transparent">
                <EditableText
                  isEditing={isEditing}
                  value={heroHighlight}
                  onChange={setHeroHighlight}
                />
              </span>
              <span className="text-slate-950 dark:text-white">
                <EditableText
                  isEditing={isEditing}
                  value={heroSuffix}
                  onChange={setHeroSuffix}
                />
              </span>
            </h1>

            <EditableText
              isEditing={isEditing}
              value={heroDesc}
              onChange={setHeroDesc}
              multiline
              as="p"
              className="mt-8 max-w-[650px] text-[15px] font-medium leading-8 text-slate-500 dark:text-white/45 sm:text-base"
            />

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <motion.div variants={squishyVariants} whileHover="hover" whileTap="tap">
                <Link
                  href="/universe"
                  className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-slate-950 px-6 text-sm font-black text-white shadow-[0_16px_40px_rgba(15,23,42,.18)] transition dark:bg-white dark:text-slate-950"
                >
                  Enter the Verse
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>

              <motion.div variants={squishyVariants} whileHover="hover" whileTap="tap">
                <Link
                  href="/universe/create"
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-[#b89cff]/30 bg-[linear-gradient(105deg,rgba(255,107,114,.10),rgba(184,156,255,.14))] px-6 text-sm font-black text-[#8050de] shadow-[0_10px_30px_rgba(128,96,241,.08)] transition hover:border-[#ff7a7a]/40 dark:text-[#d9ccff]"
                >
                  <Sparkles size={15} />
                  Create Universe
                </Link>
              </motion.div>

              <Link
                href="/community"
                className="px-3 py-3 text-sm font-black text-slate-400 transition hover:text-slate-900 dark:text-white/35 dark:hover:text-white"
              >
                Community →
              </Link>
            </div>

            <div className="mt-8 flex max-w-[680px] flex-wrap gap-2">
              {tags.map((tag, idx) =>
                isEditing ? (
                  <input
                    key={idx}
                    value={tag}
                    onChange={(e) => {
                      const next = [...tags];
                      next[idx] = e.target.value;
                      setTags(next);
                    }}
                    className="min-w-[90px] rounded-full border border-violet-300/40 bg-white/70 px-3 py-1.5 text-[11px] font-bold text-slate-600 outline-none focus:ring-2 focus:ring-violet-400/30 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/70"
                  />
                ) : (
                  <span
                    key={idx}
                    className="rounded-full border border-slate-200/75 bg-white/55 px-3 py-1.5 text-[11px] font-bold text-slate-400 backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.035] dark:text-white/35"
                  >
                    #{tag}
                  </span>
                )
              )}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08 }}
            className="relative mx-auto mt-16 h-[500px] w-full max-w-[590px] lg:mt-0 lg:h-[570px]"
          >
            <div className="absolute inset-[7%] rounded-full border border-[#b89cff]/15" />
            <div className="absolute inset-[16%] rounded-full border border-dashed border-[#ff7a7a]/20" />
            <div className="absolute inset-[27%] rounded-full border border-[#b89cff]/20" />
            <div className="absolute inset-[36%] rounded-full bg-[radial-gradient(circle,rgba(184,156,255,.18),transparent_64%)] blur-xl" />

            <div className="absolute left-1/2 top-1/2 z-10 flex h-[132px] w-[132px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/60 shadow-[0_26px_70px_rgba(128,96,241,.14)] backdrop-blur-xl dark:bg-white/[0.045] dark:shadow-[0_24px_80px_rgba(0,0,0,.45)]">
              <div className="absolute inset-2 rounded-full border border-[#b89cff]/20" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/branding/dverse-logo-mark.svg"
                alt="Drawing Verse"
                className="relative h-[82px] w-[96px] object-contain drop-shadow-[0_12px_24px_rgba(128,96,241,.18)]"
              />
              <span className="absolute -bottom-7 whitespace-nowrap text-[8px] font-black uppercase tracking-[.28em] text-slate-400 dark:text-white/30">
                Verse Core
              </span>
            </div>

            <div className="absolute left-1/2 top-1/2 h-[52%] w-px -translate-x-1/2 -translate-y-1/2 rotate-[42deg] bg-gradient-to-b from-transparent via-[#b89cff]/25 to-transparent" />
            <div className="absolute left-1/2 top-1/2 h-[58%] w-px -translate-x-1/2 -translate-y-1/2 -rotate-[55deg] bg-gradient-to-b from-transparent via-[#ff6b72]/20 to-transparent" />

            {(universes.length ? universes.slice(0, 4) : [
              { slug: "universe", name: "Discover", description: "", members: 0, tags: [] },
              { slug: "community", name: "Stories", description: "", members: 0, tags: [] },
              { slug: "gallery", name: "Gallery", description: "", members: 0, tags: [] },
              { slug: "wormhole", name: "Wormhole", description: "", members: 0, tags: [] },
            ]).map((universe, index) => {
              const fallbackHref =
                universe.slug === "community" || universe.slug === "gallery" || universe.slug === "wormhole"
                  ? "/" + universe.slug
                  : "/universe";
              const href = universes.length
                ? `/universe/${universe.slug}`
                : fallbackHref;

              return (
                <motion.div
                  key={universe.slug + index}
                  animate={{ y: [0, index % 2 === 0 ? -6 : 6, 0] }}
                  transition={{ duration: 4.8 + index * 0.45, repeat: Infinity, ease: "easeInOut" }}
                  className={cn("absolute z-20", orbitPositions[index])}
                >
                  <Link
                    href={href}
                    className="group block w-[150px] rounded-[20px] border border-white/80 bg-white/72 p-3.5 shadow-[0_16px_44px_rgba(15,23,42,.09)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-[#b89cff]/40 hover:shadow-[0_18px_50px_rgba(128,96,241,.14)] dark:border-white/10 dark:bg-[#0b0d17]/72"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-[linear-gradient(135deg,#ff7a7a,#b89cff)] text-white shadow-[0_6px_18px_rgba(128,96,241,.18)]">
                        <Orbit size={13} />
                      </span>
                      <span className="text-[9px] font-black text-slate-300 dark:text-white/20">
                        0{index + 1}
                      </span>
                    </div>
                    <p className="truncate text-[13px] font-black text-slate-800 dark:text-white/80">
                      {universe.name}
                    </p>
                    {universes.length > 0 && (
                      <p className="mt-1 text-[10px] font-bold text-slate-400 dark:text-white/30">
                        {formatMembers(universe.members)} members
                      </p>
                    )}
                  </Link>
                </motion.div>
              );
            })}

            <div className="absolute bottom-3 left-1/2 w-[min(92%,420px)] -translate-x-1/2 rounded-[22px] border border-slate-200/70 bg-white/70 p-3 shadow-[0_18px_50px_rgba(15,23,42,.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#090b13]/75">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[.22em] text-[#8a61dd]">
                    Live verse signal
                  </p>
                  <p className="mt-1 max-w-[280px] truncate text-[12px] font-black text-slate-700 dark:text-white/75">
                    {primaryPost ? primaryPost.title : "첫 이야기를 기다리는 중"}
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-1.5 text-[9px] font-black uppercase tracking-[.14em] text-emerald-500">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.75)]" />
                  Live
                </span>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="border-y border-slate-200/70 py-7 dark:border-white/[0.08]">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-[1.2fr_repeat(3,.7fr)] lg:items-center">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[.24em] text-slate-400 dark:text-white/25">
                Network status
              </p>
              <p className="mt-1 text-sm font-black text-slate-700 dark:text-white/70">
                Drawing Verse is alive right now.
              </p>
            </div>
            {[
              ["Posts", trendData.posts],
              ["Universes", trendData.universes],
              ["Artworks", trendData.artworks],
            ].map(([label, value]) => (
              <div key={label} className="lg:text-right">
                <p className="text-2xl font-black tracking-[-0.04em] text-slate-950 dark:text-white">
                  {value}
                </p>
                <p className="text-[9px] font-black uppercase tracking-[.2em] text-slate-400 dark:text-white/25">
                  {label}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <VersePulse />
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.24em] text-[#8a61dd]">
                Orbit destinations
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-.045em] sm:text-4xl">
                지금 열려 있는 Universe
              </h2>
            </div>
            <Link href="/universe" className="text-sm font-black text-slate-400 transition hover:text-violet-600">
              전체 보기 →
            </Link>
          </div>

          {loading ? (
            <p className="py-20 text-center text-sm font-bold text-slate-400">유니버스를 찾는 중...</p>
          ) : universes.length === 0 ? (
            <div className="rounded-[30px] border border-dashed border-slate-300/80 px-6 py-16 text-center dark:border-white/15">
              <Orbit size={30} className="mx-auto text-violet-400" />
              <p className="mt-4 font-black">아직 발견된 유니버스가 없어요.</p>
              <Link href="/universe/create" className="mt-3 inline-flex text-xs font-black text-violet-500">
                첫 Universe 만들기 →
              </Link>
            </div>
          ) : (
            <div className="grid gap-px overflow-hidden rounded-[32px] border border-slate-200/70 bg-slate-200/70 sm:grid-cols-2 lg:grid-cols-4 dark:border-white/[0.08] dark:bg-white/[0.08]">
              {universes.map((universe, index) => (
                <motion.div key={universe.slug} whileHover={{ y: -4 }}>
                  <Link
                    href={`/universe/${universe.slug}`}
                    className="group flex min-h-[260px] h-full flex-col bg-white/80 p-6 backdrop-blur-xl transition hover:bg-white dark:bg-[#080a11]/88 dark:hover:bg-[#0d0f19]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="grid h-10 w-10 place-items-center rounded-full border border-[#b89cff]/25 bg-[linear-gradient(135deg,rgba(255,107,114,.10),rgba(184,156,255,.18))] text-violet-500">
                        <Orbit size={17} />
                      </span>
                      <span className="text-[10px] font-black tracking-[.16em] text-slate-300 dark:text-white/20">
                        0{index + 1}
                      </span>
                    </div>
                    <h3 className="mt-auto text-2xl font-black tracking-[-.035em] text-slate-900 transition group-hover:text-violet-600 dark:text-white">
                      {universe.name}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-white/35">
                      {universe.description}
                    </p>
                    <div className="mt-5 flex items-center justify-between text-[11px] font-black text-slate-400">
                      <span>{formatMembers(universe.members)} members</span>
                      <span className="transition group-hover:translate-x-1 group-hover:text-violet-500">Enter →</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-12 border-y border-slate-200/70 py-16 lg:grid-cols-[1.35fr_.65fr] dark:border-white/[0.08]">
          <div>
            <div className="mb-7 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.22em] text-[#ef5d68]">
                  Verse signal
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-[-.04em]">오늘의 이야기</h2>
              </div>
              <Link href="/community" className="text-sm font-black text-slate-400 hover:text-violet-600">
                Community →
              </Link>
            </div>

            {loading ? (
              <div className="py-20 text-center text-sm font-bold text-slate-400">이야기를 모으는 중...</div>
            ) : featuredPosts.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-slate-300/80 px-6 py-14 text-center dark:border-white/15">
                <Sparkles size={22} className="mx-auto text-violet-300" />
                <p className="mt-3 text-sm font-black text-slate-500 dark:text-slate-300">아직 오늘의 이야기가 없어요.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {featuredPosts.slice(0, 2).map((post, index) => (
                  <Link
                    key={post.id}
                    href={`/universe/${post.universe}/${post.publicId}`}
                    className={cn(
                      "group flex min-h-[300px] flex-col justify-end overflow-hidden rounded-[30px] p-7 transition hover:-translate-y-1",
                      index === 0
                        ? "bg-slate-950 text-white shadow-[0_22px_60px_rgba(15,23,42,.18)] dark:bg-white dark:text-slate-950"
                        : "border border-slate-200/80 bg-white/68 shadow-[0_18px_50px_rgba(15,23,42,.06)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]"
                    )}
                  >
                    <span
                      className={cn(
                        "mb-auto text-[9px] font-black uppercase tracking-[.2em]",
                        index === 0 ? "text-[#d4c5ff] dark:text-violet-600" : "text-violet-500"
                      )}
                    >
                      {post.type} · {post.universe}
                    </span>
                    <h3 className="line-clamp-3 text-2xl font-black leading-tight tracking-[-.03em]">{post.title}</h3>
                    <p className={cn("mt-4 text-xs", index === 0 ? "text-white/45 dark:text-slate-500" : "text-slate-400")}>
                      {post.meta}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[.22em] text-[#8a61dd]">Transmission</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-.04em]">공지 & 이벤트</h2>
            <div className="mt-7 divide-y divide-slate-200/80 dark:divide-white/[0.08]">
              {notices.map((notice, index) => (
                <div key={`${notice}-${index}`} className="group flex items-start gap-4 py-5">
                  <span className="text-2xl font-black text-slate-200 dark:text-white/10">0{index + 1}</span>
                  {isEditing ? (
                    <input
                      value={notice}
                      onChange={(e) => {
                        const next = [...notices];
                        next[index] = e.target.value;
                        setNotices(next);
                      }}
                      className="min-w-0 flex-1 bg-transparent pt-1 text-sm font-bold outline-none"
                    />
                  ) : (
                    <p className="min-w-0 flex-1 pt-1 text-sm font-bold leading-6 text-slate-700 dark:text-white/60">
                      {notice}
                    </p>
                  )}
                  {isEditing && (
                    <button
                      onClick={() => setNotices(notices.filter((_, i) => i !== index))}
                      className="text-rose-500"
                    >
                      <CloseIcon size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.22em] text-[#8a61dd]">Fresh feed</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-.04em]">최근 올라온 글</h2>
            </div>

            <div className="flex rounded-full border border-slate-200/80 bg-white/55 p-1 dark:border-white/10 dark:bg-white/[0.035]">
              {feedTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveFeedTab(tab)}
                  aria-pressed={activeFeedTab === tab}
                  className={cn(
                    "rounded-full px-4 py-2 text-xs font-black transition",
                    activeFeedTab === tab
                      ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
                      : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200/80 dark:border-white/[0.08]">
            {loading ? (
              <p className="py-16 text-center text-sm font-bold text-slate-400">글 목록 불러오는 중...</p>
            ) : posts.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm font-black text-slate-500 dark:text-slate-300">아직 최근 글이 없어요.</p>
                <Link href="/community" className="mt-3 inline-flex text-xs font-black text-violet-500">
                  첫 이야기 남기기 →
                </Link>
              </div>
            ) : (
              filteredPosts.slice(0, 7).map((post, index) => (
                <motion.div key={post.id} whileHover={{ x: 5 }}>
                  <Link
                    href={`/universe/${post.universe}/${post.publicId}`}
                    className="grid gap-2 border-b border-slate-200/80 py-5 sm:grid-cols-[60px_minmax(0,1fr)_180px] sm:items-center dark:border-white/[0.08]"
                  >
                    <span className="text-[10px] font-black text-violet-500">0{index + 1}</span>
                    <div className="min-w-0">
                      <p className="truncate text-base font-black text-slate-800 dark:text-white/75">{post.title}</p>
                      <p className="mt-1 truncate text-[11px] font-bold text-slate-400">{post.type}</p>
                    </div>
                    <span className="truncate text-xs font-bold text-slate-400 sm:text-right">
                      {post.universe} · {post.stats}
                    </span>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[36px] border border-[#b89cff]/18 bg-[#0b0d16] px-7 py-14 text-white shadow-[0_30px_80px_rgba(35,25,70,.26)] sm:px-10 md:px-14 md:py-16">
          <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-[#ff6b72]/18 blur-[90px]" />
          <div className="pointer-events-none absolute -right-10 -bottom-24 h-80 w-80 rounded-full bg-[#8060f1]/25 blur-[100px]" />
          <div className="pointer-events-none absolute left-[46%] top-[-110px] h-[320px] w-[320px] rounded-full border border-white/[0.06]" />

          <div className="relative z-10 max-w-3xl">
            <span className="text-[9px] font-black uppercase tracking-[.28em] text-[#d7c6ff]">Open a new orbit</span>
            <h2 className="mt-5 text-4xl font-black tracking-[-.05em] sm:text-5xl">너의 세계를 Verse에 연결해.</h2>
            <p className="mt-5 max-w-2xl text-sm font-medium leading-7 text-white/50 sm:text-base">
              상상하던 설정, 그림, 캐릭터와 이야기를 하나의 Universe로 묶어보세요.
              새로운 세계 하나가 Drawing Verse의 다음 궤도가 됩니다.
            </p>
            <Link
              href="/universe/create"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-black text-slate-950 transition hover:-translate-y-0.5"
            >
              Universe 만들기
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
