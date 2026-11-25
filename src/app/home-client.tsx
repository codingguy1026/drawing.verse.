"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import {
  Activity, ArrowRight, ArrowUpRight, Compass, Heart, Images, MessageCircle,
  Link2, Orbit, PenLine, Pencil, Plus, Radio, ScrollText,
} from "lucide-react";
import VersePulse from "@/components/Home/VersePulse";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { supabase } from "@/lib/supabase/client";
import styles from "./home.module.css";

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
  excerpt: string;
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
  heroTitle: "너의 이야기가",
  heroHighlight: "우주가 되는 곳",
  heroSuffix: "",
  heroDesc: "관심사로 모여 글과 그림을 나누는 커뮤니티.",
  tags: ["야구", "역사", "게임", "음악", "창작"],
  notices: [
    "[공지] 드버스 커뮤니티 이용 안내",
    "[안내] 관심 있는 Universe를 구독해 보세요",
    "[안내] 신규 이용자 가이드 업데이트",
  ],
};

const destinations = [
  { href: "/gallery", label: "갤러리", description: "창작 작품 둘러보기", icon: Images },
  { href: "/community", label: "Verse Talk", description: "실시간으로 대화하기", icon: MessageCircle },
  { href: "/sports", label: "스포츠 관제실", description: "KBO 일정과 결과 보기", icon: Activity },
  { href: "/wormhole", label: "Wormhole", description: "두 유니버스 함께 보기", icon: Link2 },
];

const actionClass = "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold";
const secondaryAction = `${actionClass} ${styles.secondary}`;
const primaryAction = `${actionClass} ${styles.primary}`;
const textLink = `inline-flex min-h-10 items-center gap-1.5 rounded text-sm font-semibold hover:underline ${styles.accent}`;
const fieldClass = `w-full rounded-lg border px-3 py-2 font-normal ${styles.secondary}`;

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
  const [universeNames, setUniverseNames] = useState(() => new Map<string, string>());
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
        const postRows = (postsResult.data ?? []).filter((post) => post.universe_slug);
        setPosts(postRows.map((post) => ({
          id: post.id,
          title: post.title || "제목 없는 글",
          excerpt: typeof post.content === "string" ? post.content.trim().slice(0, 280).replace(/\s+/g, " ") : "",
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

        const names = new Map<string, string>(
          (universesResult.data ?? []).map(({ slug, name }) => [slug, name]),
        );
        setUniverseNames(names);
        const missing = [...new Set<string>(postRows.map((post) => post.universe_slug))]
          .filter((slug) => !names.has(slug));
        if (missing.length) {
          void Promise.resolve(supabase.from("universes").select("slug,name").in("slug", missing))
            .then(({ data }) => {
              if (!active || version !== request || !data?.length) return;
              setUniverseNames(new Map([...names, ...data.map(({ slug, name }) => [slug, name] as const)]));
            })
            .catch((error) => console.warn("Failed to load universe names", error));
        }
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

  const latestPost = errors.posts ? undefined : posts[0];
  const notices = config.notices.filter((notice) => notice.trim());
  const tags = config.tags.filter((tag) => tag.trim());

  return (
    <main className={`mx-auto w-full max-w-[1320px] px-4 py-4 sm:px-6 sm:py-6 lg:px-8 ${styles.page}`}>
      <header className={styles.hero}>
        <div className={styles.intro}>
          <h1 className={styles.title}>
            {config.heroTitle} <span>{config.heroHighlight}{config.heroSuffix}</span>
          </h1>
          <p className={styles.description}>{config.heroDesc}</p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link href="/explore" className={`${actionClass} ${styles.heroPrimary}`}>
              <Compass size={16} aria-hidden="true" /> Explore
            </Link>
            <Link href="#home-feed" className={`${actionClass} ${styles.heroSecondary}`}>
              <ScrollText size={16} aria-hidden="true" /> 게시글 보기
            </Link>
          </div>
        </div>
        {latestPost && (
          <Link href={latestPost.href} className={styles.featured}>
            <div className="min-w-0">
              <p className={styles.featuredLabel}>가장 최근에 올라온 글</p>
              <p className={styles.featuredTitle}>{latestPost.title}</p>
              <p className={styles.featuredMeta}>
                {universeNames.get(latestPost.universe) || latestPost.author}
              </p>
            </div>
            <ArrowUpRight size={19} className="mt-0.5 shrink-0" aria-hidden="true" />
          </Link>
        )}
      </header>

      {user && !userLoading && !draft && (
        <div className={styles.editBar} style={{ marginBlock: ".75rem .7rem" }}>
          <button type="button" className={styles.edit}
            onClick={() => { updateDraft(config); setFeedback(null); }}>
            <Pencil size={15} aria-hidden="true" /> 홈 편집
          </button>
        </div>
      )}

      {draft && (
        <form onSubmit={saveHome} className={`${styles.panel} mb-6 space-y-4 p-4 sm:p-5`}>
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
      {saveMessage && <p role="status" className={`mb-4 text-sm ${styles.muted}`}>{saveMessage}</p>}

      <div className={`${styles.content} mt-5`}>
        <section id="home-feed" aria-labelledby="home-feed-heading" className={`${styles.panel} ${styles.feed}`}>
          <div className={styles.panelHeading}>
            <h2 id="home-feed-heading"><ScrollText size={19} aria-hidden="true" /> 커뮤니티 피드</h2>
            <div role="group" aria-label="글 정렬" className={styles.feedSort}>
              {feedTabs.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={feedSort === value}
                  onClick={() => setFeedSort(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-b border-[var(--gc-line)] p-4 sm:p-5">
            <p className="text-sm font-semibold">오늘은 어떤 이야기를 나눌까요?</p>
            <p className={`mt-1 text-xs ${styles.muted}`}>유니버스에 글을 남기거나 갤러리에 작품을 올려보세요.</p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Link href="/universe/write" className={primaryAction}>
                <PenLine size={16} aria-hidden="true" /> 글 쓰기
              </Link>
              <Link href="/gallery/upload" className={secondaryAction}>
                <Images size={16} aria-hidden="true" /> 작품 올리기
              </Link>
            </div>
          </div>

          {loading ? (
            <p role="status" className={`${styles.panelMessage} ${styles.muted}`}>글을 불러오는 중…</p>
          ) : errors.posts ? (
            <div className={styles.panelMessage}>
              <p role="status" className={`mb-3 ${styles.muted}`}>글 목록을 불러오지 못했어요.</p>
              <button type="button" className={secondaryAction} onClick={retry}>다시 시도</button>
            </div>
          ) : ranked.length === 0 ? (
            <div className={styles.panelMessage}>
              <p className={styles.muted}>아직 올라온 글이 없어요.</p>
              <Link href="/universe/write" className={textLink}>첫 이야기 쓰기 <ArrowRight size={14} aria-hidden="true" /></Link>
            </div>
          ) : (
            <ul className={styles.rows}>
              {ranked.slice(0, 7).map((post) => (
                <li key={post.id}>
                  <Link href={post.href} className={styles.feedLink}>
                    <div className="min-w-0">
                      {universeNames.get(post.universe) && (
                        <p className={styles.place}>{universeNames.get(post.universe)}</p>
                      )}
                      <h3>{post.title}</h3>
                      {post.excerpt && <p className={styles.postExcerpt}>{post.excerpt}</p>}
                      <p className={styles.postByline}>
                        {post.author}{post.createdAt > 0 && <> · <time dateTime={new Date(post.createdAt).toISOString()}>{formatDate.format(post.createdAt)}</time></>}
                      </p>
                    </div>
                    <span className={styles.postCounts}>
                      <span><Heart size={14} aria-hidden="true" /><span className="sr-only">좋아요 </span>{formatCount.format(post.likes)}</span>
                      <span><MessageCircle size={14} aria-hidden="true" /><span className="sr-only">댓글 </span>{formatCount.format(post.comments)}</span>
                    </span>
                    <ArrowUpRight size={16} className={styles.feedArrow} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside aria-label="유니버스와 탐색" className="min-w-0 space-y-5">
          <section aria-labelledby="home-universes-heading" className={styles.panel}>
            <div className={styles.panelHeading}>
              <h2 id="home-universes-heading"><Orbit size={19} aria-hidden="true" /> 새 유니버스</h2>
              <Link href="/universe" className={textLink}>전체 보기 <ArrowRight size={13} aria-hidden="true" /></Link>
            </div>
            {loading ? (
              <p role="status" className={`${styles.panelMessage} ${styles.muted}`}>유니버스를 불러오는 중…</p>
            ) : errors.universes ? (
              <div className={styles.panelMessage}>
                <p role="status" className={`mb-3 ${styles.muted}`}>유니버스를 불러오지 못했어요.</p>
                <button type="button" className={secondaryAction} onClick={retry}>다시 시도</button>
              </div>
            ) : universes.length === 0 ? (
              <p className={`${styles.panelMessage} ${styles.muted}`}>아직 공개 유니버스가 없어요.</p>
            ) : (
              <ul className={styles.universeList}>
                {universes.map((universe) => (
                  <li key={universe.slug}>
                    <Link href={`/universe/${encodeURIComponent(universe.slug)}`} className={styles.universeLink}>
                      <span className={styles.universeIcon} aria-hidden="true"><Orbit size={18} /></span>
                      <div className="min-w-0">
                        <h3>{universe.name}</h3>
                        {universe.description && <p className={styles.universeDescription}>{universe.description}</p>}
                        <p className={styles.universeMeta}>
                          {universe.category && <span>{universe.category}</span>}
                          구독 {formatCount.format(universe.members)}
                        </p>
                      </div>
                      <ArrowUpRight size={14} className={styles.universeArrow} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <div className={styles.panelFooter}>
              <Link href="/universe/create" className={textLink}>
                <Plus size={15} aria-hidden="true" /> 유니버스 만들기
              </Link>
            </div>
          </section>

          {(notices.length > 0 || tags.length > 0) && (
            <section aria-labelledby="home-notices-heading" className={styles.panel}>
              <div className={styles.panelHeading}>
                <h2 id="home-notices-heading">{notices.length > 0 ? "공지와 안내" : "관심 주제"}</h2>
              </div>
              {notices.length > 0 && (
                <ul className={styles.notices}>
                  {notices.map((notice, index) => <li key={`${notice}-${index}`}>{notice}</li>)}
                </ul>
              )}
              {tags.length > 0 && (
                <ul aria-label="관심 주제" className={styles.tags}>
                  {tags.map((tag, index) => (
                    <li key={`${tag}-${index}`}>
                      <Link href={`/search?query=${encodeURIComponent(tag)}`}>#{tag}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </aside>
      </div>

      <nav aria-label="바로가기" className={styles.shortcuts}>
        <ul>
          {destinations.map(({ href, label, description, icon: Icon }) => (
            <li key={href}>
              <Link href={href} className={styles.shortcut}>
                <span className={styles.shortcutIcon}><Icon size={19} aria-hidden="true" /></span>
                <ArrowUpRight size={15} className={styles.shortcutArrow} aria-hidden="true" />
                <span className={styles.shortcutTitle}>{label}</span>
                <span className={styles.shortcutDescription}>{description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <section aria-labelledby="home-activity-heading" className={`${styles.panel} ${styles.activity}`}>
        <div className={styles.panelHeading}>
          <h2 id="home-activity-heading"><Radio size={19} aria-hidden="true" /> 드버스 활동</h2>
        </div>
        <div className={styles.activityBody}>
          <dl className={styles.activityTotals}>
            {([
              ["유니버스 게시글", counts.posts, "#home-feed"],
              ["공개 유니버스", counts.universes, "/universe"],
              ["갤러리 작품", counts.artworks, "/gallery"],
            ] as const).map(([label, count, href]) => (
              <div key={label}>
                <dt><Link href={href}>{label}</Link></dt>
                <dd>{count === null ? "—" : formatCount.format(count)}</dd>
              </div>
            ))}
          </dl>
          <div className={styles.pulse}><VersePulse /></div>
        </div>
      </section>
    </main>
  );
}
