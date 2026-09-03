"use client";

import * as React from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Orbit, Pencil, Save, Sparkles, X as CloseIcon } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { squishyVariants } from "@/lib/animations";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";

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

type HomePost = {
  id: string | number;
  title: string;
  meta: string;
  stats: string;
  universe: string;
  type: string;
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
  const [trendData, setTrendData] = useState({ visits: 0, posts: 0, universes: 0 });
  const [loading, setLoading] = useState(true);

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
          supabase.from("posts").select("*").order("created_at", { ascending: false }).limit(10),
          supabase.from("universes").select("*").limit(4),
          supabase.from("gallery").select("id", { count: "exact", head: true }),
        ]);

        if (postsResult.error) throw postsResult.error;
        if (universesResult.error) throw universesResult.error;

        const mappedPosts: HomePost[] = (postsResult.data ?? []).map((item) => ({
          id: item.id,
          title: item.title,
          meta: `${item.author || "익명"} · ${new Date(item.created_at).toLocaleDateString("ko-KR")}`,
          stats: `좋아요 ${item.like_count || 0} · 댓글 ${item.comment_count || 0}`,
          universe: item.universe_slug || "unknown",
          type: item.category || "전체",
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
          visits: (galleryResult.count || 0) * 123 + 456,
          posts: mappedPosts.length,
          universes: mappedUniverses.length,
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-950 transition-colors duration-700 dark:bg-[#03050a] dark:text-slate-100">
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 pt-24 md:px-6 lg:px-8 lg:pt-28">
        <main>
          <section className="relative overflow-hidden rounded-[40px] border border-white/90 bg-white/80 shadow-[0_30px_80px_rgba(15,23,42,.08)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#0a0d14]/70">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(244,114,182,.14),transparent_32%),radial-gradient(circle_at_88%_18%,rgba(56,189,248,.16),transparent_34%),radial-gradient(circle_at_55%_100%,rgba(139,92,246,.1),transparent_35%)]" />
            {!userLoading && user && (
              <div className="absolute right-5 top-5 z-30 md:right-7 md:top-7">
                {isEditing ? (
                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-xs font-black text-white"><Save size={14}/>{isSaving ? "저장 중..." : "저장"}</button>
                    <button onClick={handleCancel} className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-black text-slate-600 shadow-sm dark:bg-white/10 dark:text-white"><CloseIcon size={14}/>취소</button>
                  </div>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 rounded-full bg-white/75 px-4 py-2 text-xs font-black text-slate-600 shadow-sm backdrop-blur dark:bg-white/10 dark:text-white"><Pencil size={14}/>홈 수정</button>
                )}
                {saveMessage && <p className="mt-2 rounded-xl bg-white/80 px-3 py-2 text-right text-[11px] font-bold text-slate-500 shadow-sm backdrop-blur dark:bg-black/30 dark:text-slate-300">{saveMessage}</p>}
              </div>
            )}

            <div className="relative grid min-h-[430px] lg:grid-cols-[1.08fr_.92fr]">
              <div className="flex flex-col justify-center px-7 py-10 md:px-12 lg:px-14 lg:py-11">
                <span className="mb-5 w-fit rounded-full border border-fuchsia-200/80 bg-white/70 px-4 py-1.5 text-[10px] font-black uppercase tracking-[.18em] text-fuchsia-500 shadow-sm backdrop-blur dark:border-fuchsia-500/20 dark:bg-white/5">Dreamcore community hub</span>
                <h1 className="max-w-[640px] text-[42px] font-black leading-[.98] tracking-[-.055em] text-slate-950 dark:text-white sm:text-[50px] md:text-[58px] lg:text-[62px] xl:text-[68px]">
                  <EditableText isEditing={isEditing} value={heroTitle} onChange={setHeroTitle} />
                  <br />
                  <span className="inline-flex flex-wrap items-baseline gap-x-0">
                    <span className="whitespace-nowrap bg-gradient-to-r from-violet-600 via-indigo-500 to-sky-400 bg-clip-text text-transparent">
                      <EditableText isEditing={isEditing} value={heroHighlight} onChange={setHeroHighlight} />
                    </span>
                    <span className="whitespace-nowrap">
                      <EditableText isEditing={isEditing} value={heroSuffix} onChange={setHeroSuffix} />
                    </span>
                  </span>
                </h1>
                <EditableText isEditing={isEditing} value={heroDesc} onChange={setHeroDesc} multiline as="p" className="mt-7 max-w-xl text-[15px] leading-7 text-slate-500 dark:text-slate-400 md:text-base" />
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href="/universe" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950">유니버스 둘러보기 <ArrowRight size={14}/></Link>
                  <Link href="/community" className="rounded-full border border-slate-200 bg-white/70 px-6 py-3.5 text-sm font-black text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200">커뮤니티 가기</Link>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {tags.map((tag, idx) => (
                    <span key={idx} className="rounded-full border border-slate-200 bg-white/55 px-3 py-1.5 text-[11px] font-semibold text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">#{tag}</span>
                  ))}
                </div>
              </div>

              <div className="relative flex min-h-[380px] flex-col justify-center border-t border-slate-200/60 bg-[radial-gradient(circle_at_70%_25%,rgba(56,189,248,.12),transparent_36%),linear-gradient(180deg,rgba(248,250,252,.35),rgba(255,255,255,.04))] p-8 dark:border-white/10 lg:min-h-0 lg:border-l lg:border-t-0">
                <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle,#cbd5e1_1px,transparent_1px)] [background-size:34px_34px] dark:opacity-10" />
                <div className="relative z-10">
                  <div className="mb-7 flex items-center justify-between text-[10px] font-black uppercase tracking-[.24em] text-slate-400"><span>Verse signal</span><span>Live ●</span></div>
                  {primaryPost ? (
                    <Link href={`/universe/${primaryPost.universe}/${primaryPost.id}`} className="group mx-auto block aspect-[4/3] w-full max-w-[390px] rounded-[30px] bg-slate-950 p-7 text-white shadow-2xl shadow-violet-500/10 transition hover:-translate-y-1 dark:bg-white dark:text-slate-950">
                      <span className="text-[10px] font-black uppercase tracking-[.2em] text-violet-300 dark:text-violet-600">Featured verse</span>
                      <div className="mt-16"><h3 className="line-clamp-3 text-3xl font-black leading-tight">{primaryPost.title}</h3><p className="mt-4 text-xs text-white/55 dark:text-slate-500">{primaryPost.meta}</p></div>
                    </Link>
                  ) : (
                    <div className="mx-auto flex aspect-[4/3] w-full max-w-[390px] flex-col items-center justify-center rounded-[30px] border border-dashed border-slate-300/80 bg-white/45 text-center backdrop-blur dark:border-white/15 dark:bg-white/5"><Orbit size={32} className="text-violet-400"/><p className="mt-4 font-black">첫 이야기를 기다리는 중</p><p className="mt-2 text-sm text-slate-400">Verse에 첫 별이 뜨면 여기에 나타나요.</p></div>
                  )}
                  <div className="mt-7 grid grid-cols-3 gap-2"><div><p className="text-xl font-black">{trendData.posts}</p><p className="text-[10px] uppercase tracking-wider text-slate-400">New posts</p></div><div><p className="text-xl font-black">{trendData.universes}</p><p className="text-[10px] uppercase tracking-wider text-slate-400">Universes</p></div><div><p className="text-xl font-black">{trendData.visits}</p><p className="text-[10px] uppercase tracking-wider text-slate-400">Pulse</p></div></div>
                </div>
              </div>
            </div>
          </section>

          <section className="relative py-12 md:py-14">
            <div className="mb-7 flex items-end justify-between gap-4"><div><p className="mb-1 text-[11px] font-black uppercase tracking-[0.2em] text-violet-500">Explore the verse</p><h2 className="text-3xl font-black tracking-tight md:text-4xl">우주를 발견해봐</h2></div><Link href="/universe" className="text-sm font-bold text-slate-500 hover:text-violet-600">모든 유니버스 →</Link></div>
            <div className="relative min-h-[220px] overflow-hidden rounded-[32px] border border-slate-200/60 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,.09),transparent_45%)] dark:border-white/5">
              <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle,#cbd5e1_1px,transparent_1px)] [background-size:38px_38px] dark:opacity-10" />
              {loading ? <p className="relative py-28 text-center text-sm text-slate-400">유니버스를 찾는 중...</p> : universes.length === 0 ? <div className="relative flex min-h-[220px] flex-col items-center justify-center"><Orbit size={34} className="text-violet-400"/><p className="mt-3 font-bold">아직 발견된 유니버스가 없어요.</p></div> : (
                <div className={cn("relative grid min-h-[220px] place-items-center gap-5 p-6", universes.length === 1 ? "grid-cols-1" : "sm:grid-cols-2 lg:grid-cols-4")}>
                  {universes.map((universe, index) => (
                    <motion.div key={universe.slug} whileHover={{ y: -7, scale: 1.02 }} className={cn("w-full max-w-[270px]", universes.length === 1 && "max-w-[340px]")}>
                      <Link href={`/universe/${universe.slug}`} className="group block rounded-[26px] border border-white/90 bg-white/78 p-5 shadow-[0_16px_40px_rgba(15,23,42,.07)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0b0e14]/75"><div className="mb-6 flex items-center justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-sky-400 text-white shadow-lg"><Orbit size={20}/></span><span className="text-xs font-black text-slate-300">0{index+1}</span></div><h3 className="text-xl font-black">{universe.name}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{universe.description}</p><div className="mt-5 flex items-center justify-between text-xs font-bold text-slate-400"><span>멤버 {formatMembers(universe.members)}명</span><span className="text-slate-700 group-hover:text-violet-600 dark:text-slate-200">입장 →</span></div></Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="grid gap-10 border-y border-slate-200/80 py-12 lg:grid-cols-[1.35fr_.65fr] dark:border-white/10">
            <div>
              <div className="mb-7 flex items-end justify-between"><div><p className="text-[11px] font-black uppercase tracking-[.2em] text-violet-500">Today in Drawing Verse</p><h2 className="mt-1 text-3xl font-black">오늘의 이야기 ✨</h2></div><Link href="/community" className="text-sm font-bold text-slate-400">더 둘러보기 →</Link></div>
              {loading ? <div className="py-20 text-center text-sm text-slate-400">이야기를 모으는 중...</div> : featuredPosts.length === 0 ? <div className="rounded-[26px] border border-dashed border-slate-300 px-6 py-14 text-center dark:border-white/15"><Sparkles size={22} className="mx-auto text-violet-300"/><p className="mt-3 text-sm font-bold text-slate-500 dark:text-slate-300">아직 오늘의 이야기가 없어요.</p><Link href="/community" className="mt-2 inline-block text-xs font-black text-violet-500 hover:text-violet-600">첫 이야기 남기기 →</Link></div> : (
                <div className="grid gap-4 sm:grid-cols-2">{featuredPosts.slice(0,2).map((post,index)=><Link key={post.id} href={`/universe/${post.universe}/${post.id}`} className={cn("group flex min-h-[230px] flex-col justify-end rounded-[26px] p-6 transition hover:-translate-y-1", index===0 ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "border border-slate-200 bg-white/70 dark:border-white/10 dark:bg-white/5")}><span className={cn("mb-auto text-[10px] font-black uppercase tracking-[.18em]", index===0?"text-violet-300 dark:text-violet-600":"text-violet-500")}>{post.type} · {post.universe}</span><h3 className="line-clamp-3 text-2xl font-black leading-tight">{post.title}</h3><p className={cn("mt-4 text-xs",index===0?"text-white/50 dark:text-slate-500":"text-slate-400")}>{post.meta}</p></Link>)}</div>
              )}
            </div>
            <div><p className="text-[11px] font-black uppercase tracking-[.2em] text-violet-500">Live ranking</p><h2 className="mt-1 text-3xl font-black">지금 뜨는 것</h2><div className="mt-7 divide-y divide-slate-200 dark:divide-white/10">{notices.map((notice,index)=><div key={`${notice}-${index}`} className="group flex items-start gap-4 py-4"><span className="text-2xl font-black text-slate-200 dark:text-white/15">0{index+1}</span>{isEditing?<input value={notice} onChange={(e)=>{const next=[...notices];next[index]=e.target.value;setNotices(next)}} className="min-w-0 flex-1 bg-transparent pt-1 text-sm font-bold outline-none"/>:<p className="min-w-0 flex-1 pt-1 text-sm font-bold leading-6 text-slate-700 dark:text-slate-300">{notice}</p>}{isEditing&&<button onClick={()=>setNotices(notices.filter((_,i)=>i!==index))} className="text-rose-500"><CloseIcon size={14}/></button>}</div>)}</div></div>
          </section>

          <section className="py-12">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="text-[11px] font-black uppercase tracking-[.2em] text-violet-500">Fresh feed</p><h2 className="mt-1 text-3xl font-black">최근 올라온 글</h2></div><div className="flex gap-2">{feedTabs.slice(0,3).map((tab,index)=><button key={tab} className={cn("rounded-full px-4 py-2 text-xs font-black",index===0?"bg-slate-950 text-white dark:bg-white dark:text-slate-950":"text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5")}>{tab}</button>)}</div></div>
            <div className="border-t border-slate-200 dark:border-white/10">{loading?<p className="py-16 text-center text-sm text-slate-400">글 목록 불러오는 중...</p>:posts.length===0?<div className="py-11 text-center"><p className="text-sm font-bold text-slate-500 dark:text-slate-300">아직 최근 글이 없어요.</p><p className="mt-1 text-xs text-slate-400">첫 이야기가 올라오면 이곳에서 바로 만날 수 있어요.</p><Link href="/community" className="mt-3 inline-flex items-center gap-1 text-xs font-black text-violet-500 hover:text-violet-600">첫 글 남기기 <ArrowRight size={12}/></Link></div>:posts.slice(0,7).map((post,index)=><motion.div key={post.id} whileHover={{x:6}}><Link href={`/universe/${post.universe}/${post.id}`} className="grid gap-2 border-b border-slate-200 py-5 sm:grid-cols-[70px_minmax(0,1fr)_160px] sm:items-center dark:border-white/10"><span className="text-xs font-black text-violet-500">{post.type}</span><h3 className="truncate text-base font-bold">{post.title}</h3><span className="truncate text-xs text-slate-400 sm:text-right">{post.universe} · {post.stats}</span></Link></motion.div>)}</div>
          </section>

          <section className="relative isolate overflow-hidden rounded-[34px] bg-[linear-gradient(115deg,#4338ca_0%,#7c3aed_48%,#0284c7_120%)] px-7 py-12 text-white shadow-[0_24px_60px_rgba(79,70,229,.22)] md:px-12 md:py-16"><div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border-[42px] border-white/10"/><div className="pointer-events-none absolute bottom-[-90px] right-[28%] h-44 w-44 rounded-full bg-white/10"/><div className="relative z-10 max-w-2xl"><span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-black ring-1 ring-white/20">Create your universe</span><h2 className="mt-5 text-3xl font-black md:text-4xl">너의 세계를 열어봐 🌌</h2><p className="mt-3 max-w-xl text-sm leading-7 text-white/75 md:text-base">상상하던 설정, 그림, 캐릭터와 이야기를 하나의 우주로 묶어보세요. 아이디어 하나가 새로운 Verse의 시작이 됩니다.</p><Link href="/universe/new" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-black !text-slate-950 shadow-lg transition hover:-translate-y-0.5">Universe 만들기 <ArrowRight size={15}/></Link></div></section>
        </main>
      </div>
    </div>
  );
}
