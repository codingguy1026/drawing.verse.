"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import {
  Activity, ArrowRight, ArrowUpRight, Compass, Heart, Images, MessageCircle,
  Orbit, PenLine, Pencil, Plus,
} from "lucide-react";
import VersePulse from "@/components/Home/VersePulse";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { supabase } from "@/lib/supabase/client";

const feedTabs = [
  { value: "all", label: "최신" },
  { value: "best", label: "Best" },
  { value: "hot", label: "Hot" },
] as const;

type FeedSort = (typeof feedTabs)[number]["value"];

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
  href: string;
  author: string;
  universe: string;
  createdAt: number;
  likes: number;
  comments: number;
};

type HomeUniverse = {
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  members: number;
};

const defaultConfig: HomeConfig = {
  heroTitle: "Drawing",
  heroHighlight: "Verse",
  heroSuffix: "",
  heroDesc: "좋아하는 유니버스에서 그림과 이야기를 나눠요.",
  tags: ["야구", "역사", "게임", "음악", "창작"],
  notices: [
    "[공지] 드버스 커뮤니티 이용 안내",
    "[안내] 관심 있는 Universe를 구독해 보세요",
    "[안내] 신규 이용자 가이드 업데이트",
  ],
};

const destinations = [
  { href: "/gallery", label: "갤러리", icon: Images },
  { href: "/community", label: "Verse Talk", icon: MessageCircle },
  { href: "/sports", label: "스포츠 관제실", icon: Activity },
];

const panelClass = "min-w-0 rounded-xl border border-slate-200 bg-white dark:border-white/12 dark:bg-[#101620]";
const mutedClass = "text-slate-600 dark:text-slate-300";
const focusClass = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 dark:focus-visible:outline-sky-400";
const actionClass = `inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-semibold ${focusClass}`;
const secondaryAction = `${actionClass} border-slate-300 bg-white hover:bg-slate-100 dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10`;
const primaryAction = `${actionClass} border-transparent bg-slate-900 text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white`;
const textLink = `inline-flex min-h-10 items-center gap-1.5 rounded px-1 text-sm font-semibold text-sky-800 hover:underline dark:text-sky-300 ${focusClass}`;
const fieldClass = `w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal dark:border-white/15 dark:bg-slate-950 ${focusClass}`;

const formatCount = new Intl.NumberFormat("ko-KR");
const formatDate = new Intl.DateTimeFormat("ko-KR", { month: "short", day: "numeric" });

function parseHomeConfig(value: unknown): HomeConfig | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<HomeConfig>;
  const text = (key: "heroTitle" | "heroHighlight" | "heroSuffix" | "heroDesc", length: number) =>
    typeof candidate[key] === "string" ? candidate[key].slice(0, length) : defaultConfig[key];
  const list = (key: "tags" | "notices", limit: number) =>
    Array.isArray(candidate[key])
      ? candidate[key].filter((item) => typeof item === "string").map((item) => item.slice(0, 80)).slice(0, limit)
      : defaultConfig[key];

  return {
    heroTitle: text("heroTitle", 80),
    heroHighlight: text("heroHighlight", 80),
    heroSuffix: text("heroSuffix", 80),
    heroDesc: text("heroDesc", 320),
    tags: list("tags", 10),
    notices: list("notices", 8),
  };
}

function subscribeToHomeStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function readHomeStorage(userId?: string) {
  if (!userId) return null;
  try {
    return localStorage.getItem(`dv_home_config:${userId}`) ?? localStorage.getItem("dv_home_config");
  } catch (error) {
    console.warn("Failed to read home config", error);
    return null;
  }
}

function parseStoredConfig(value: string | null) {
  if (!value) return null;
  try {
    return parseHomeConfig(JSON.parse(value));
  } catch {
    return null;
  }
}

type PersonalConfig = { userId: string; config: HomeConfig };

let homeFeedSubscription = 0;

export default function HomeClient() {
  const { user, loading: userLoading } = useSupabaseUser();
  const [posts, setPosts] = useState<HomePost[]>([]);
  const [universes, setUniverses] = useState<HomeUniverse[]>([]);
  const [counts, setCounts] = useState<{ posts: number | null; universes: number | null; artworks: number | null }>({
    posts: null, universes: null, artworks: null,
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({ posts: false, universes: false });
  const reload = useRef<(() => Promise<void>) | null>(null);
  const [feedSort, setFeedSort] = useState<FeedSort>("all");

  const [saved, setSaved] = useState<PersonalConfig | null>(null);
  const [editor, setEditor] = useState<PersonalConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ userId: string; message: string } | null>(null);

  const userId = user?.id;
  const storageSnapshot = useSyncExternalStore(
    subscribeToHomeStorage,
    () => readHomeStorage(userId),
    () => null,
  );
  const config = userId
    ? parseHomeConfig(user.user_metadata?.home_config) ??
      (saved?.userId === userId ? saved.config : parseStoredConfig(storageSnapshot)) ??
      defaultConfig
    : defaultConfig;
  const draft = userId && editor?.userId === userId ? editor.config : null;
  const saveMessage = userId && feedback?.userId === userId ? feedback.message : "";

  useEffect(() => {
    let active = true;
    let request = 0;

    async function loadData() {
      const version = ++request;
      try {
        const [postsResult, universesResult, galleryResult] = await Promise.all([
          supabase.from("posts").select("*", { count: "exact" })
            .not("universe_slug", "is", null)
            .order("created_at", { ascending: false })
            .limit(10),
          supabase.from("universes")
            .select("slug,name,description,category,subscriber_count", { count: "exact" })
            .eq("visibility", "public")
            .eq("moderation_status", "active")
            .is("parent_slug", null)
            .order("created_at", { ascending: false })
            .limit(4),
          supabase.from("gallery").select("id", { count: "exact", head: true }),
        ]);

        if (!active || version !== request) return;

        setErrors({ posts: Boolean(postsResult.error), universes: Boolean(universesResult.error) });
        setPosts((postsResult.data ?? []).filter((post) => post.universe_slug).map((post) => ({
          id: post.id,
          title: post.title || "제목 없는 글",
          href: `/universe/${encodeURIComponent(post.universe_slug)}/${encodeURIComponent(post.public_id || post.id)}`,
          author: post.author || "알 수 없는 작성자",
          universe: post.universe_slug,
          createdAt: Date.parse(post.created_at) || 0,
          likes: post.like_count ?? post.likes_count ?? 0,
          comments: post.comment_count ?? post.comments_count ?? 0,
        })));
        setUniverses((universesResult.data ?? []).filter((universe) => universe.slug).map((universe) => ({
          slug: universe.slug,
          name: universe.name,
          description: universe.description,
          category: universe.category,
          members: universe.subscriber_count ?? 0,
        })));
        setCounts({ posts: postsResult.count, universes: universesResult.count, artworks: galleryResult.count });
      } catch (error) {
        if (!active || version !== request) return;
        console.error("Failed to load home data", error);
        setErrors({ posts: true, universes: true });
      } finally {
        if (active && version === request) setLoading(false);
      }
    }

    reload.current = loadData;
    void loadData();
    const channel = supabase.channel(`home-feed:${++homeFeedSubscription}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => void loadData())
      .on("postgres_changes", { event: "*", schema: "public", table: "universes" }, () => void loadData())
      .subscribe();

    return () => {
      active = false;
      reload.current = null;
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  function updateDraft(next: HomeConfig) {
    if (userId) setEditor({ userId, config: next });
  }

  async function saveHome(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId || !draft || saving) return;

    const next = parseHomeConfig(draft);
    if (!next || !next.heroTitle.trim() || !next.heroHighlight.trim() || !next.heroDesc.trim()) {
      setFeedback({ userId, message: "제목과 소개 문구를 입력해 주세요." });
      return;
    }

    next.tags = next.tags.map((tag) => tag.trim()).filter(Boolean);
    next.notices = next.notices.map((notice) => notice.trim()).filter(Boolean);

    setSaving(true);
    setFeedback(null);
    try {
      const { error } = await supabase.auth.updateUser({ data: { home_config: next } });
      if (error) throw error;

      try {
        localStorage.setItem(`dv_home_config:${userId}`, JSON.stringify(next));
        localStorage.removeItem("dv_home_config");
      } catch (error) {
        console.warn("Failed to cache home config locally", error);
      }

      setSaved({ userId, config: next });
      setEditor((current) => current?.userId === userId ? null : current);
      setFeedback({ userId, message: "내 홈에 저장됐어요." });
    } catch (error) {
      console.error("Failed to save home config", error);
      setFeedback({ userId, message: "저장에 실패했어요. 잠시 후 다시 시도해 주세요." });
    } finally {
      setSaving(false);
    }
  }

  const ranked = feedSort === "all" ? posts : [...posts].sort((a, b) => {
    const weight = feedSort === "hot" ? 2 : 1;
    return b.likes + b.comments * weight - (a.likes + a.comments * weight) || b.createdAt - a.createdAt;
  });

  const retry = () => {
    setLoading(true);
    void reload.current?.();
  };

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 py-5 text-slate-950 sm:px-6 sm:py-8 lg:px-8 dark:text-slate-100">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-b border-slate-200 pb-5 dark:border-white/12">
        <div className="min-w-0">
          <h1 className="break-words text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {config.heroTitle} <span className="text-sky-800 dark:text-sky-300">{config.heroHighlight}</span>{config.heroSuffix}
          </h1>
          <p className={`mt-1.5 max-w-2xl break-words text-sm leading-6 ${mutedClass}`}>{config.heroDesc}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/explore" className={secondaryAction}>
            <Compass size={16} aria-hidden="true" /> Explore
          </Link>
          <Link href="/universe/write" className={primaryAction}>
            <PenLine size={16} aria-hidden="true" /> 글 쓰기
          </Link>
          {user && !userLoading && !draft && (
            <button
              type="button"
              className={`inline-flex min-h-10 items-center gap-1.5 rounded px-2 text-sm ${mutedClass} ${focusClass}`}
              onClick={() => { updateDraft(config); setFeedback(null); }}
            >
              <Pencil size={14} aria-hidden="true" /> 홈 편집
            </button>
          )}
        </div>
      </header>

      {draft && (
        <form onSubmit={saveHome} className={`${panelClass} mb-5 space-y-4 p-4 sm:p-5`}>
          <h2 className="text-lg font-bold">내 홈 편집</h2>
          <fieldset disabled={saving} className="min-w-0 space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              {([
                ["heroTitle", "제목"],
                ["heroHighlight", "강조 문구"],
                ["heroSuffix", "마무리 문구"],
              ] as const).map(([key, label]) => (
                <label key={key} className="min-w-0 space-y-1 text-sm font-semibold">
                  <span>{label}</span>
                  <input
                    className={fieldClass}
                    value={draft[key]}
                    maxLength={80}
                    required={key !== "heroSuffix"}
                    onChange={(event) => updateDraft({ ...draft, [key]: event.target.value })}
                  />
                </label>
              ))}
            </div>
            <label className="block space-y-1 text-sm font-semibold">
              <span>소개</span>
              <textarea className={fieldClass} rows={2} maxLength={320} required value={draft.heroDesc}
                onChange={(event) => updateDraft({ ...draft, heroDesc: event.target.value })} />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              {([["tags", "관심 주제 (한 줄에 하나, 최대 10개)"], ["notices", "공지 (한 줄에 하나, 최대 8개)"]] as const).map(([key, label]) => (
                <label key={key} className="min-w-0 space-y-1 text-sm font-semibold">
                  <span>{label}</span>
                  <textarea className={fieldClass} rows={3} value={draft[key].join("\n")}
                    onChange={(event) => updateDraft({ ...draft, [key]: event.target.value.split("\n") })} />
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex items-center gap-2">
            <button type="submit" disabled={saving} className={`${primaryAction} disabled:opacity-60`}>{saving ? "저장 중…" : "저장"}</button>
            <button type="button" disabled={saving} className={secondaryAction}
              onClick={() => { setEditor(null); setFeedback(null); }}>취소</button>
          </div>
        </form>
      )}
      {saveMessage && <p role="status" className={`mb-4 text-sm ${mutedClass}`}>{saveMessage}</p>}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.49fr)] lg:items-start">
        <section aria-labelledby="home-feed-heading" className={`${panelClass} overflow-hidden`}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 sm:px-5 dark:border-white/12">
            <h2 id="home-feed-heading" className="text-lg font-bold">최근 올라온 글</h2>
            <div role="group" aria-label="글 정렬" className="inline-flex items-center gap-0.5 rounded-lg bg-slate-100 p-0.5 dark:bg-slate-950">
              {feedTabs.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={feedSort === value}
                  onClick={() => setFeedSort(value)}
                  className={`min-h-9 rounded-md px-2.5 py-1.5 text-xs font-semibold ${focusClass} ${feedSort === value ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : mutedClass}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p role="status" className={`px-4 py-8 text-sm sm:px-5 ${mutedClass}`}>글을 불러오는 중…</p>
          ) : errors.posts ? (
            <div className="space-y-2 px-4 py-6 sm:px-5">
              <p role="status" className={`text-sm ${mutedClass}`}>글 목록을 불러오지 못했어요.</p>
              <button type="button" className={secondaryAction} onClick={retry}>다시 시도</button>
            </div>
          ) : ranked.length === 0 ? (
            <div className="px-4 py-6 sm:px-5">
              <p className={`text-sm ${mutedClass}`}>아직 올라온 글이 없어요.</p>
              <Link href="/universe/write" className={textLink}>첫 이야기 쓰기 <ArrowRight size={14} aria-hidden="true" /></Link>
            </div>
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-white/12">
              {ranked.slice(0, 7).map((post, index) => (
                <li key={post.id}>
                  <Link
                    href={post.href}
                    className={`block px-4 sm:px-5 hover:bg-slate-100 dark:hover:bg-white/8 ${focusClass} focus-visible:-outline-offset-2 ${index === 0 ? "border-s-2 border-s-sky-600 bg-sky-50/60 py-4 dark:border-s-sky-400 dark:bg-sky-300/8" : "py-3.5"}`}
                  >
                    <p className="break-words text-xs font-semibold text-sky-800 dark:text-sky-300">{post.universe}</p>
                    <h3 className={`mt-1 break-words font-semibold leading-snug ${index === 0 ? "text-xl" : "text-base"}`}>{post.title}</h3>
                    <div className={`mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 text-xs ${mutedClass}`}>
                      <span className="min-w-0 break-words">
                        {post.author}{post.createdAt > 0 && <> · <time dateTime={new Date(post.createdAt).toISOString()}>{formatDate.format(post.createdAt)}</time></>}
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1"><Heart size={13} aria-hidden="true" /><span className="sr-only">좋아요 </span>{formatCount.format(post.likes)}</span>
                        <span className="inline-flex items-center gap-1"><MessageCircle size={13} aria-hidden="true" /><span className="sr-only">댓글 </span>{formatCount.format(post.comments)}</span>
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside aria-label="유니버스와 탐색" className="min-w-0 space-y-4">
          <section aria-labelledby="home-universes-heading" className={`${panelClass} p-4`}>
            <div className="flex flex-wrap items-center justify-between gap-x-2">
              <h2 id="home-universes-heading" className="text-base font-bold">새 유니버스</h2>
              <Link href="/universe" className={textLink}>목록 <ArrowRight size={13} aria-hidden="true" /></Link>
            </div>
            {loading ? (
              <p role="status" className={`py-3 text-sm ${mutedClass}`}>유니버스를 불러오는 중…</p>
            ) : errors.universes ? (
              <div className="space-y-2 py-2">
                <p role="status" className={`text-sm ${mutedClass}`}>유니버스를 불러오지 못했어요.</p>
                <button type="button" className={secondaryAction} onClick={retry}>다시 시도</button>
              </div>
            ) : universes.length === 0 ? (
              <p className={`py-3 text-sm ${mutedClass}`}>아직 공개 유니버스가 없어요.</p>
            ) : (
              <ul className="divide-y divide-slate-200 dark:divide-white/12">
                {universes.map((universe) => (
                  <li key={universe.slug}>
                    <Link href={`/universe/${encodeURIComponent(universe.slug)}`}
                      className={`flex min-w-0 gap-2.5 rounded-md px-1 py-3 hover:bg-slate-100 dark:hover:bg-white/8 ${focusClass}`}>
                      <Orbit size={16} className="mt-0.5 shrink-0 text-sky-800 dark:text-sky-300" aria-hidden="true" />
                      <div className="min-w-0">
                        <h3 className="break-words text-sm font-semibold">{universe.name}</h3>
                        {universe.description && <p className={`mt-0.5 line-clamp-2 break-words text-xs leading-5 ${mutedClass}`}>{universe.description}</p>}
                        <p className={`mt-1 break-words text-xs ${mutedClass}`}>
                          {universe.category && `${universe.category} · `}구독 {formatCount.format(universe.members)}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/universe/create" className={`${secondaryAction} mt-2 w-full`}>
              <Plus size={15} aria-hidden="true" /> 유니버스 만들기
            </Link>
          </section>

          <nav aria-labelledby="home-discover-heading" className={`${panelClass} p-4`}>
            <h2 id="home-discover-heading" className="text-base font-bold">둘러보기</h2>
            <ul className="mt-2">
              {destinations.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link href={href} className={`flex min-h-10 items-center gap-2 rounded-md px-1 text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/8 ${focusClass}`}>
                    <Icon size={16} className="shrink-0 text-sky-800 dark:text-sky-300" aria-hidden="true" />
                    {label}
                    <ArrowUpRight size={13} className={`ms-auto shrink-0 ${mutedClass}`} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
            {config.tags.some((tag) => tag.trim()) && (
              <ul aria-label="관심 주제" className="mt-2 flex flex-wrap gap-1.5 border-t border-slate-200 pt-3 dark:border-white/12">
                {config.tags.filter((tag) => tag.trim()).map((tag, index) => (
                  <li key={`${tag}-${index}`} className="min-w-0">
                    <Link href={`/search?query=${encodeURIComponent(tag)}`}
                      className={`inline-flex min-h-8 max-w-full items-center break-all rounded-md bg-slate-100 px-2 text-xs font-medium hover:bg-slate-200 dark:bg-white/8 dark:hover:bg-white/15 ${focusClass}`}>
                      #{tag}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </nav>

          {config.notices.some((notice) => notice.trim()) && (
            <section aria-labelledby="home-notices-heading" className={`${panelClass} p-4`}>
              <h2 id="home-notices-heading" className="text-base font-bold">공지와 안내</h2>
              <ul className={`mt-2 space-y-2 break-words text-sm leading-6 ${mutedClass}`}>
                {config.notices.filter((notice) => notice.trim()).map((notice, index) => <li key={`${notice}-${index}`}>{notice}</li>)}
              </ul>
            </section>
          )}
        </aside>
      </div>

      <section aria-labelledby="home-activity-heading" className={`${panelClass} mt-5 p-4 sm:p-5`}>
        <h2 id="home-activity-heading" className="text-base font-bold">드버스 활동</h2>
        <dl className="mt-3 grid grid-cols-3 gap-2">
          {([["유니버스 게시글", counts.posts], [ "공개 유니버스", counts.universes ], [ "갤러리 작품", counts.artworks ]] as const).map(([label, count]) => (
            <div key={label} className="rounded-md bg-slate-50 px-2.5 py-2 sm:px-4 dark:bg-white/5">
              <dt className={`break-words text-xs ${mutedClass}`}>{label}</dt>
              <dd className="mt-1 break-words text-lg font-semibold tabular-nums">{count === null ? "—" : formatCount.format(count)}</dd>
            </div>
          ))}
        </dl>
        <VersePulse />
      </section>
    </main>
  );
}
