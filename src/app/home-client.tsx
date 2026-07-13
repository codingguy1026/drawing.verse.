"use client";
import * as React from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { squishyVariants } from "@/lib/animations";
import { useWeatherStore } from "@/store/useWeatherStore";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import CosmicGalaxyExplorer from "@/components/Universe/CosmicGalaxyExplorer";
import { Pencil, Save, X as CloseIcon } from "lucide-react";

const boards = ["전체", "인기", "창작", "피드백", "팬아트", "세계관"];
const shortcuts = ["실시간 베스트", "Best", "Hot", "New", "최근 방문"];
const feedTabs = ["전체", "Best", "Hot", "New", "팔로잉"];
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
    heroSuffix: readText(
      candidate.heroSuffix,
      defaultHomeConfig.heroSuffix,
      80
    ),
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

function SidebarCard(props: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="group relative overflow-hidden rounded-[24px] border border-white/70 bg-white/75 p-3 shadow-[0_10px_30px_rgba(148,163,184,0.14)] backdrop-blur-xl transition-all duration-500 hover:shadow-2xl dark:border-white/12 dark:bg-[#0f111a]/80 dark:shadow-[0_0_20px_rgba(139,92,246,0.05)]"
    >
      <div className="absolute -right-4 -top-4 h-12 w-12 rounded-full bg-violet-500/10 blur-xl transition-all group-hover:bg-violet-500/20 dark:bg-violet-500/20" />
      <p className="bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-sky-400 bg-clip-text px-2 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-transparent">
        {props.title}
      </p>
      <div className="relative z-10">{props.children}</div>
    </motion.div>
  );
}

function StatPill(props: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-slate-100 dark:bg-white/10 px-3 py-1.5 font-semibold text-slate-700 dark:text-slate-300">
      {props.children}
    </span>
  );
}

function SidebarShell(props: {
  sidebarExtra: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto grid w-full max-w-7xl md:grid-cols-[220px_minmax(0,1fr)] gap-6 px-4 py-6 md:px-6 lg:px-8">
      <aside className="sticky top-24 hidden md:flex h-fit w-[220px] flex-col gap-3 self-start">
        <SidebarCard title="Boards">
          <div className="space-y-1">
            {boards.map((board, index) => (
              <motion.button
                key={board}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition",
                  index === 0
                    ? "bg-slate-900 text-white dark:bg-white/15"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                )}
              >
                {board}
              </motion.button>
            ))}
          </div>
        </SidebarCard>

        <SidebarCard title="Shortcuts">
          <div className="space-y-1">
            {shortcuts.map((shortcut, index) => (
              <motion.button
                key={shortcut}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "w-full rounded-xl px-3 py-2 text-left text-sm transition",
                  index === 0
                    ? "bg-slate-100 text-slate-900 dark:bg-white/15 dark:text-white"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                )}
              >
                {shortcut}
              </motion.button>
            ))}
          </div>
        </SidebarCard>

        <SidebarCard title="Preview checks">
          <div className="space-y-2">{props.sidebarExtra}</div>
        </SidebarCard>
      </aside>

      <div className="flex min-w-0 flex-col gap-8">{props.children}</div>
    </div>
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
  as?: any;
}) {
  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full bg-slate-100/50 dark:bg-white/10 border border-violet-500/30 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-slate-900 dark:text-white",
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
          "w-full bg-slate-100/50 dark:bg-white/10 border border-violet-500/30 rounded-xl px-3 py-1 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-slate-900 dark:text-white",
          className
        )}
      />
    );
  }
  return <Component className={className}>{value}</Component>;
}

export default function HomeClient() {
  const { weather } = useWeatherStore();
  const { user, loading: userLoading } = useSupabaseUser();
  const [posts, setPosts] = useState<any[]>([]);
  const [universes, setUniverses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Editable Home State
  const [isEditing, setIsEditing] = useState(false);
  const [heroTitle, setHeroTitle] = useState(defaultHomeConfig.heroTitle);
  const [heroHighlight, setHeroHighlight] = useState(
    defaultHomeConfig.heroHighlight
  );
  const [heroSuffix, setHeroSuffix] = useState(defaultHomeConfig.heroSuffix);
  const [heroDesc, setHeroDesc] = useState(defaultHomeConfig.heroDesc);
  const [tags, setTags] = useState([...defaultHomeConfig.tags]);
  const [notices, setNotices] = useState([...defaultHomeConfig.notices]);
  const [savedConfig, setSavedConfig] = useState(() =>
    cloneHomeConfig(defaultHomeConfig)
  );
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
      const savedData =
        localStorage.getItem(storageKey) ??
        localStorage.getItem("dv_home_config");
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
        const { data: p } = await supabase
          .from("posts")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

        const { data: u } = await supabase
          .from("universes")
          .select("*")
          .limit(4);

        if (p) {
          setPosts(
            p.map((item) => ({
              id: item.id,
              title: item.title,
              meta: `${item.author || "익명"} · ${new Date(
                item.created_at
              ).toLocaleDateString()}`,
              stats: `좋아요 ${item.like_count || 0} · 댓글 ${
                item.comment_count || 0
              }`,
              universe: item.universe_slug,
              type: item.category || "전체",
            }))
          );
        }

        if (u) {
          setUniverses(
            u.map((item) => ({
              name: item.name,
              description: item.description,
              members: item.subscriber_count || 0,
              tags: [item.category].filter(Boolean),
              slug: item.slug,
            }))
          );
        }
      } catch (error) {
        console.error("Error loading feed data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    const postsChannel = supabase
      .channel("realtime-posts-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        () => loadData()
      )
      .subscribe();

    const universesChannel = supabase
      .channel("realtime-universes-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "universes" },
        () => loadData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(universesChannel);
    };
  }, []);

  const handleSave = async () => {
    if (!user || isSaving) return;

    const nextConfig = parseHomeConfig({
      heroTitle,
      heroHighlight,
      heroSuffix,
      heroDesc,
      tags,
      notices,
    });

    if (!nextConfig) return;

    if (
      !nextConfig.heroTitle.trim() ||
      !nextConfig.heroHighlight.trim() ||
      !nextConfig.heroDesc.trim()
    ) {
      setSaveMessage("제목과 소개 문구는 비워둘 수 없어요.");
      return;
    }

    nextConfig.tags = nextConfig.tags.map((tag) => tag.trim()).filter(Boolean);
    nextConfig.notices = nextConfig.notices
      .map((notice) => notice.trim())
      .filter(Boolean);

    setIsSaving(true);
    setSaveMessage(null);

    const { error } = await supabase.auth.updateUser({
      data: { home_config: nextConfig },
    });

    if (error) {
      console.error("Failed to save home config", error);
      setSaveMessage("저장에 실패했어요. 잠시 후 다시 시도해 주세요.");
      setIsSaving(false);
      return;
    }

    localStorage.setItem(
      `dv_home_config:${user.id}`,
      JSON.stringify(nextConfig)
    );
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

  const previewChecks = [
    { label: "boards", pass: boards.length > 0 },
    { label: "posts (fetched)", pass: posts.length > 0 },
    { label: "universes (fetched)", pass: universes.length > 0 },
    { label: "loading state", pass: !loading },
  ];

  return (
    <div className="relative min-h-screen bg-slate-50 transition-colors duration-700 dark:bg-[#03050a]">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-0 transition-opacity duration-1000 dark:opacity-100">
        <div
          className={cn(
            "absolute left-[10%] top-[5%] h-[500px] w-[500px] rounded-full blur-[120px] transition-colors duration-1000",
            weather === "sunny"
              ? "bg-orange-600/10"
              : weather === "rainy"
              ? "bg-blue-600/10"
              : weather === "snowy"
              ? "bg-sky-400/10"
              : weather === "cloudy"
              ? "bg-slate-600/10"
              : "bg-violet-600/10"
          )}
        />
        <div
          className={cn(
            "absolute right-[5%] top-[15%] h-[400px] w-[400px] rounded-full blur-[100px] transition-colors duration-1000",
            weather === "sunny"
              ? "bg-yellow-600/10"
              : weather === "rainy"
              ? "bg-slate-600/10"
              : weather === "snowy"
              ? "bg-blue-300/10"
              : weather === "cloudy"
              ? "bg-gray-600/10"
              : "bg-indigo-600/10"
          )}
        />
        <div
          className={cn(
            "absolute bottom-[10%] left-[20%] h-[600px] w-[600px] rounded-full blur-[150px] transition-colors duration-1000",
            weather === "sunny"
              ? "bg-amber-600/5"
              : weather === "rainy"
              ? "bg-indigo-600/5"
              : weather === "snowy"
              ? "bg-indigo-200/5"
              : weather === "cloudy"
              ? "bg-zinc-600/5"
              : "bg-fuchsia-600/5"
          )}
        />
      </div>

      <div className="relative z-10 text-slate-900 dark:text-slate-100">
        <SidebarShell
          sidebarExtra={previewChecks.map((check) => (
            <div
              key={check.label}
              className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-white/5 px-3 py-2 text-xs"
            >
              <span className="font-medium text-slate-600 dark:text-slate-400">
                {check.label}
              </span>
              <span
                className={
                  check.pass
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-500 dark:text-rose-400"
                }
              >
                {check.pass ? "OK" : "FAIL"}
              </span>
            </div>
          ))}
        >
          <main className="flex flex-col gap-8">
            <section className="group relative overflow-hidden rounded-[40px] border border-white/80 bg-white/75 p-6 shadow-[0_32px_64px_rgba(148,163,184,0.18)] backdrop-blur-3xl transition-all duration-700 dark:border-white/10 dark:bg-[#0b0e14]/60 dark:shadow-[0_32px_64px_rgba(0,0,0,0.45)] md:p-8 lg:p-12">
              <div className="pointer-events-none absolute -left-16 top-0 h-44 w-44 rounded-full bg-pink-200/35 dark:bg-pink-600/20 blur-3xl" />
              <div className="pointer-events-none absolute right-0 top-10 h-40 w-40 rounded-full bg-sky-200/35 dark:bg-sky-600/20 blur-3xl" />

              {/* Edit Controls */}
              {!userLoading && user && (
                <div className="absolute right-6 top-6 z-20">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 disabled:cursor-wait disabled:opacity-60"
                      >
                        <Save size={16} />
                        {isSaving ? "저장 중..." : "저장"}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="flex items-center gap-2 rounded-full bg-slate-200 px-4 py-2 text-sm font-bold text-slate-700 shadow-lg dark:bg-white/10 dark:text-white"
                      >
                        <CloseIcon size={16} />
                        취소
                      </motion.button>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSaveMessage(null);
                        setIsEditing(true);
                      }}
                      className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-slate-700 shadow-lg backdrop-blur-md dark:bg-white/10 dark:text-white"
                    >
                      <Pencil size={16} />홈 수정하기
                    </motion.button>
                  )}
                  {saveMessage && (
                    <p
                      role="status"
                      className={cn(
                        "mt-2 max-w-56 rounded-xl px-3 py-2 text-right text-xs font-semibold backdrop-blur-md",
                        saveMessage.includes("실패") ||
                          saveMessage.includes("비워둘")
                          ? "bg-rose-50/90 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300"
                          : "bg-emerald-50/90 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
                      )}
                    >
                      {saveMessage}
                    </p>
                  )}
                </div>
              )}

              <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
                <div className="flex flex-col gap-5">
                  <span className="w-fit rounded-full border border-fuchsia-200/70 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-fuchsia-500 shadow-sm backdrop-blur">
                    Dreamcore community hub
                  </span>
                  <div className="space-y-6">
                    <h1 className="max-w-4xl text-5xl font-black leading-[1.1] tracking-tighter text-slate-950 dark:text-white md:text-6xl lg:text-7xl">
                      <EditableText
                        isEditing={isEditing}
                        value={heroTitle}
                        onChange={setHeroTitle}
                      />
                      <br />
                      <span
                        className={cn(
                          "bg-clip-text text-transparent transition-all duration-1000",
                          weather === "sunny"
                            ? "bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 dark:from-orange-400 dark:via-amber-400 dark:to-yellow-300"
                            : weather === "rainy"
                            ? "bg-gradient-to-r from-blue-600 via-slate-500 to-indigo-500 dark:from-blue-400 dark:via-slate-400 dark:to-indigo-400"
                            : weather === "cloudy"
                            ? "bg-gradient-to-r from-slate-600 via-gray-500 to-zinc-500 dark:from-slate-400 dark:via-gray-400 dark:to-zinc-400"
                            : weather === "snowy"
                            ? "bg-gradient-to-r from-blue-300 via-cyan-300 to-sky-300 dark:from-blue-200 dark:via-cyan-200 dark:to-sky-200"
                            : "bg-gradient-to-r from-violet-600 via-indigo-500 to-sky-400 dark:from-violet-400 dark:via-indigo-300 dark:to-sky-200"
                        )}
                      >
                        <EditableText
                          isEditing={isEditing}
                          value={heroHighlight}
                          onChange={setHeroHighlight}
                        />
                      </span>
                      <EditableText
                        isEditing={isEditing}
                        value={heroSuffix}
                        onChange={setHeroSuffix}
                      />
                    </h1>
                    <div className="max-w-xl">
                      <EditableText
                        isEditing={isEditing}
                        value={heroDesc}
                        onChange={setHeroDesc}
                        multiline
                        className="text-lg leading-relaxed text-slate-600 dark:text-slate-400"
                        as="p"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <motion.button
                      variants={squishyVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="group relative overflow-hidden rounded-full bg-slate-900 px-8 py-4 text-sm font-bold text-white transition-shadow hover:shadow-xl hover:shadow-violet-500/20 dark:bg-white dark:text-slate-950"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 transition-opacity group-hover:opacity-100" />
                      <span className="relative z-10">유니버스 둘러보기</span>
                    </motion.button>
                    <motion.button
                      variants={squishyVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="rounded-full border border-slate-200 bg-white px-8 py-4 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                    >
                      커뮤니티 가기
                    </motion.button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <div className="flex w-full flex-wrap items-center gap-2 pb-2 text-xs text-slate-500">
                      <StatPill>오늘 게시글 993</StatPill>
                      <StatPill>댓글 2.6K</StatPill>
                      <StatPill>유니버스 93개</StatPill>
                    </div>
                    {tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="group relative rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 shadow-sm"
                      >
                        {isEditing ? (
                          <input
                            value={tag}
                            onChange={(e) => {
                              const newTags = [...tags];
                              newTags[idx] = e.target.value;
                              setTags(newTags);
                            }}
                            className="w-20 bg-transparent outline-none focus:ring-1 focus:ring-violet-500 rounded"
                          />
                        ) : (
                          `#${tag}`
                        )}
                        {isEditing && (
                          <button
                            onClick={() =>
                              setTags(tags.filter((_, i) => i !== idx))
                            }
                            className="ml-1 text-rose-500 hover:text-rose-700"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                    {isEditing && (
                      <button
                        onClick={() => setTags([...tags, "새 태그"])}
                        className="rounded-full border border-dashed border-slate-300 dark:border-white/20 px-3 py-1.5 text-xs font-medium text-slate-400 hover:border-violet-500 hover:text-violet-500 transition-colors"
                      >
                        + 태그 추가
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid gap-4">
                  <section className="rounded-3xl border border-white/70 bg-white/72 dark:border-white/10 dark:bg-white/5 p-5 shadow-[0_12px_30px_rgba(148,163,184,0.14)] dark:shadow-none backdrop-blur-xl">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          실시간 피드
                        </p>
                        <p className="text-xs text-slate-400">
                          커뮤니티 홈에서 바로 훑어보기
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      {loading ? (
                        <p className="py-10 text-center text-xs text-slate-400">
                          피드 불러오는 중...
                        </p>
                      ) : posts.length === 0 ? (
                        <p className="py-10 text-center text-xs text-slate-400">
                          아직 올라온 글이 없어요.
                        </p>
                      ) : (
                        posts.slice(0, 4).map((post) => (
                          <motion.div
                            key={post.id || post.title}
                            whileHover={{ scale: 1.02, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 12,
                            }}
                          >
                            <Link
                              href={`/universe/${post.universe}/${post.id}`}
                              className="block rounded-2xl border border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 px-4 py-3 shadow-sm transition-colors hover:bg-slate-50 dark:hover:bg-white/10"
                            >
                              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                {post.title}
                              </p>
                              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                {post.universe} · {post.meta}
                              </p>
                            </Link>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </section>

                  <section className="group relative overflow-hidden rounded-[32px] border border-indigo-900/50 bg-[#0f111a] p-6 shadow-2xl">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-black uppercase tracking-widest text-indigo-400">
                        Weekly Trend
                      </p>
                      <span className="animate-pulse rounded-full bg-indigo-500/20 px-3 py-1 text-[10px] font-bold text-indigo-400 ring-1 ring-indigo-500/30">
                        HOT NOW
                      </span>
                    </div>
                    <div className="mt-5 grid grid-cols-3 gap-3">
                      {[
                        ["2.4K", "방문"],
                        ["148", "새 글"],
                        ["36", "유니버스"],
                      ].map((item) => (
                        <div
                          key={item[1]}
                          className="rounded-2xl bg-white/5 p-4 text-center ring-1 ring-white/5"
                        >
                          <p className="text-xl font-black text-white">
                            {item[0]}
                          </p>
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            {item[1]}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </section>

            <CosmicGalaxyExplorer />

            <section className="grid items-stretch gap-6 lg:grid-cols-[3fr_2fr]">
              <section className="rounded-3xl border border-white/70 bg-white/74 dark:border-white/10 dark:bg-white/5 p-6 shadow-[0_12px_30px_rgba(148,163,184,0.14)] dark:shadow-none backdrop-blur-xl md:p-7">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    지금 인기 있는 유니버스
                  </h2>
                </div>
                <div className="grid gap-4 md:auto-rows-fr md:grid-cols-2">
                  {loading ? (
                    <p className="col-span-full py-20 text-center text-sm text-slate-400">
                      유니버스 찾는 중...
                    </p>
                  ) : universes.length === 0 ? (
                    <p className="col-span-full py-20 text-center text-sm text-slate-400">
                      등록된 유니버스가 없습니다.
                    </p>
                  ) : (
                    universes.map((universe, index) => (
                      <motion.article
                        key={universe.slug || universe.name}
                        variants={squishyVariants}
                        whileHover="hover"
                        whileTap="tap"
                        className="group relative flex h-full min-h-[220px] overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-sm"
                      >
                        <div className="relative flex h-full flex-col gap-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                {universe.name}
                              </h3>
                              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                                {universe.description}
                              </p>
                            </div>
                            <span className="rounded-full bg-slate-900 dark:bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                              #{index + 1}
                            </span>
                          </div>
                          <div className="mt-auto flex items-center justify-between pt-2">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-300">
                              멤버 {formatMembers(universe.members)}명
                            </p>
                            <Link
                              href={`/universe/${universe.slug}`}
                              className="rounded-full border border-slate-200 dark:border-white/20 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition group-hover:bg-slate-900 dark:group-hover:bg-white/20 group-hover:text-white"
                            >
                              입장하기
                            </Link>
                          </div>
                        </div>
                      </motion.article>
                    ))
                  )}
                </div>
              </section>

              <aside className="flex h-full flex-col gap-6">
                <section className="relative overflow-hidden rounded-3xl border border-indigo-950/80 bg-[linear-gradient(135deg,#0f172a_0%,#312e81_58%,#1e293b_100%)] p-6 text-white shadow-[0_16px_36px_rgba(49,46,129,0.28)]">
                  <h2 className="mt-2 text-2xl font-bold">
                    너의 세계를 열어봐
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-white/70">
                    상상만 하던 설정, 그림, 캐릭터, 문장을 진짜 공간으로
                    꺼내놓을 시간.
                  </p>
                  <button className="mt-5 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5">
                    지금 시작하기
                  </button>
                </section>

                <section className="rounded-3xl border border-white/70 bg-white/72 dark:border-white/10 dark:bg-white/5 p-6 shadow-[0_12px_30px_rgba(148,163,184,0.14)] dark:shadow-none backdrop-blur-xl">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                    실시간 인기
                  </p>
                  <div className="mt-3 space-y-2.5">
                    {notices.map((notice, index) => (
                      <div
                        key={index}
                        className="group relative flex w-full items-center gap-3 rounded-2xl bg-slate-50 dark:bg-white/5 px-3 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-white/10"
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 dark:bg-white/20 text-xs font-bold text-white">
                          {index + 1}
                        </span>
                        {isEditing ? (
                          <input
                            value={notice}
                            onChange={(e) => {
                              const newNotices = [...notices];
                              newNotices[index] = e.target.value;
                              setNotices(newNotices);
                            }}
                            className="flex-1 bg-transparent outline-none focus:ring-1 focus:ring-violet-500 rounded"
                          />
                        ) : (
                          <span className="truncate">{notice}</span>
                        )}
                        {isEditing && (
                          <button
                            onClick={() =>
                              setNotices(notices.filter((_, i) => i !== index))
                            }
                            className="text-rose-500 hover:text-rose-700 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <CloseIcon size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                    {isEditing && (
                      <button
                        onClick={() =>
                          setNotices([
                            ...notices,
                            "[새 소식] 내용을 입력하세요",
                          ])
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 dark:border-white/20 py-2.5 text-xs font-medium text-slate-400 hover:border-violet-500 hover:text-violet-500 transition-colors"
                      >
                        + 소식 추가
                      </button>
                    )}
                  </div>
                </section>
              </aside>
            </section>

            <section className="rounded-3xl border border-white/70 bg-white/74 dark:border-white/10 dark:bg-white/5 p-6 shadow-[0_12px_30px_rgba(148,163,184,0.14)] dark:shadow-none backdrop-blur-xl md:p-7">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  최근 올라온 글
                </h2>
                <div className="flex flex-wrap gap-2">
                  {feedTabs.map((tab, index) => (
                    <button
                      key={tab}
                      className={cn(
                        "rounded-full px-4 py-2 text-sm font-medium transition",
                        index === 0
                          ? "bg-slate-900 text-white dark:bg-white/20"
                          : "border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-slate-600 dark:text-slate-300"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-hidden rounded-3xl border border-white/70 dark:border-white/10 bg-white/80 dark:bg-black/40 shadow-sm backdrop-blur-xl">
                <div>
                  {loading ? (
                    <p className="py-20 text-center text-sm text-slate-400">
                      글 목록 불러오는 중...
                    </p>
                  ) : posts.length === 0 ? (
                    <p className="py-20 text-center text-sm text-slate-400">
                      최근 작성된 글이 없습니다.
                    </p>
                  ) : (
                    posts.map((post, index) => (
                      <motion.div
                        key={post.id || post.title}
                        whileHover={{ x: 10 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        }}
                      >
                        <Link
                          href={`/universe/${post.universe}/${post.id}`}
                          className={cn(
                            "grid grid-cols-4 items-center gap-4 px-5 py-3.5 transition-colors",
                            index !== posts.length - 1 &&
                              "border-b border-slate-100 dark:border-white/5"
                          )}
                        >
                          <span className="w-fit rounded-full bg-indigo-50 dark:bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-500 dark:text-indigo-300">
                            {post.type}
                          </span>
                          <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-200">
                            {post.title}
                          </h3>
                          <span className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">
                            {post.universe}
                          </span>
                          <span className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">
                            {post.stats}
                          </span>
                        </Link>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </main>
        </SidebarShell>
      </div>
    </div>
  );
}
