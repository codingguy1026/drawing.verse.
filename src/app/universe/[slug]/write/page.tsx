"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Cloud,
  Image as ImageIcon,
  Keyboard,
  Loader2,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

const FALLBACK_CATEGORIES = ["정보", "창작", "질문", "공지", "기타"];

type UniverseSettings = {
  name: string | null;
  icon: string | null;
  sections: string[] | null;
  owner_id: string | null;
  allow_member_posts: boolean;
};

type SavedDraft = {
  title: string;
  content: string;
  category: string;
  savedAt: string;
};

export default function UniverseWritePage() {
  const params = useParams();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const rawSlug = params.slug;
  const universeSlug = decodeURIComponent(
    Array.isArray(rawSlug) ? rawSlug[0] ?? "" : rawSlug ?? ""
  );

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingUniverse, setIsLoadingUniverse] = useState(true);
  const [canPost, setCanPost] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [universeName, setUniverseName] = useState(universeSlug || "Universe");
  const [universeIcon, setUniverseIcon] = useState("✦");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [category, setCategory] = useState("창작");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [draftReady, setDraftReady] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const hasTextDraft = Boolean(title.trim() || content.trim());
  const hasUnsavedWork = Boolean(hasTextDraft || imageFile);
  const canSubmit =
    Boolean(user) &&
    canPost &&
    !isSubmitting &&
    Boolean(title.trim()) &&
    Boolean(content.trim());

  useEffect(() => {
    setMounted(true);

    const initialize = async () => {
      setIsLoadingUniverse(true);
      setLoadError(null);

      const { data: authData } = await supabase.auth.getUser();

      if (!authData.user) {
        router.replace("/login");
        return;
      }

      setUser(authData.user);

      const { data: universe, error } = await supabase
        .from("universes")
        .select("name,icon,sections,owner_id,allow_member_posts")
        .eq("slug", universeSlug)
        .maybeSingle<UniverseSettings>();

      if (error || !universe) {
        setLoadError("유니버스를 불러오지 못했어요.");
        setIsLoadingUniverse(false);
        return;
      }

      const nextCategories =
        universe.sections?.filter(
          (item): item is string => typeof item === "string" && item.trim().length > 0
        ) ?? FALLBACK_CATEGORIES;

      setUniverseName(universe.name || universeSlug);
      setUniverseIcon(universe.icon || "✦");
      setCategories(nextCategories);
      setCanPost(
        Boolean(universe.allow_member_posts || universe.owner_id === authData.user.id)
      );

      const draftKey = `dv:post-draft:${authData.user.id}:${universeSlug}`;

      try {
        const stored = localStorage.getItem(draftKey);

        if (stored) {
          const draft = JSON.parse(stored) as Partial<SavedDraft>;
          setTitle(typeof draft.title === "string" ? draft.title : "");
          setContent(typeof draft.content === "string" ? draft.content : "");

          const restoredCategory =
            typeof draft.category === "string" &&
            nextCategories.includes(draft.category)
              ? draft.category
              : nextCategories[0] || "기타";

          setCategory(restoredCategory);

          if (typeof draft.savedAt === "string") {
            const parsedDate = new Date(draft.savedAt);
            if (!Number.isNaN(parsedDate.getTime())) setSavedAt(parsedDate);
          }
        } else {
          setCategory(nextCategories[0] || "기타");
        }
      } catch (draftError) {
        console.error("Failed to restore draft:", draftError);
        setCategory(nextCategories[0] || "기타");
      }

      setDraftReady(true);
      setIsLoadingUniverse(false);
    };

    initialize();
  }, [router, universeSlug]);

  useEffect(() => {
    if (!draftReady || !user) return;

    const draftKey = `dv:post-draft:${user.id}:${universeSlug}`;
    const timer = window.setTimeout(() => {
      if (!hasTextDraft) {
        localStorage.removeItem(draftKey);
        setSavedAt(null);
        return;
      }

      const now = new Date();
      const draft: SavedDraft = {
        title,
        content,
        category,
        savedAt: now.toISOString(),
      };

      localStorage.setItem(draftKey, JSON.stringify(draft));
      setSavedAt(now);
    }, 650);

    return () => window.clearTimeout(timer);
  }, [
    category,
    content,
    draftReady,
    hasTextDraft,
    title,
    universeSlug,
    user,
  ]);

  useEffect(() => {
    const protectDraft = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedWork || isSubmitting) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", protectDraft);
    return () => window.removeEventListener("beforeunload", protectDraft);
  }, [hasUnsavedWork, isSubmitting]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key !== "Enter") return;
      event.preventDefault();
      if (canSubmit) formRef.current?.requestSubmit();
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [canSubmit]);

  const goBack = () => {
    if (
      hasUnsavedWork &&
      !window.confirm("작성 중인 내용은 초안에 저장돼 있어요. Universe로 돌아갈까요?")
    ) {
      return;
    }

    router.push(`/universe/${encodeURIComponent(universeSlug)}`);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSubmitError(null);
    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !content.trim() || !user || isSubmitting) return;

    setSubmitError(null);

    const { data: settings, error: settingsError } = await supabase
      .from("universes")
      .select("owner_id,allow_member_posts")
      .eq("slug", universeSlug)
      .maybeSingle();

    if (settingsError || !settings) {
      setSubmitError("유니버스를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.");
      return;
    }

    if (!settings.allow_member_posts && settings.owner_id !== user.id) {
      setCanPost(false);
      setSubmitError("이 유니버스는 소유자만 글을 쓸 수 있어요.");
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl: string | null = null;

      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop() || "jpg";
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("posts")
          .upload(filePath, imageFile);

        if (uploadError) {
          throw new Error(
            "이미지 업로드에 실패했어요. 이미지를 다시 선택하거나 잠시 후 재시도해 주세요."
          );
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("posts").getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const { data: post, error } = await supabase
        .from("posts")
        .insert({
          title: title.trim(),
          content: content.trim(),
          category,
          universe_slug: universeSlug,
          author:
            user.user_metadata?.full_name ||
            user.user_metadata?.display_name ||
            user.email?.split("@")[0] ||
            "Anonymous",
          image_url: imageUrl,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      localStorage.removeItem(
        `dv:post-draft:${user.id}:${universeSlug}`
      );

      router.push(
        `/universe/${encodeURIComponent(universeSlug)}/${post.public_id || post.id}`
      );
    } catch (error: any) {
      console.error("Post creation error:", error);
      setSubmitError(
        error?.message || "글을 게시하는 중 문제가 생겼어요. 다시 시도해 주세요."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-950 transition-colors dark:bg-[#05060b] dark:text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12rem] top-[-10rem] h-[30rem] w-[30rem] rounded-full bg-violet-300/20 blur-3xl dark:bg-violet-700/10" />
        <div className="absolute right-[-10rem] top-[18rem] h-[28rem] w-[28rem] rounded-full bg-sky-300/20 blur-3xl dark:bg-sky-600/10" />
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="relative z-10">
        <div className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-2xl dark:border-white/10 dark:bg-[#05060b]/80">
          <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={goBack}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Universe로 돌아가기"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-base" aria-hidden>
                  {universeIcon}
                </span>
                <p className="truncate text-sm font-black">{universeName}</p>
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                {savedAt ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    초안 저장됨 ·{" "}
                    {savedAt.toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </>
                ) : (
                  <>
                    <Cloud className="h-3.5 w-3.5" />
                    {draftReady ? "자동 저장 대기 중" : "초안 불러오는 중"}
                  </>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0 dark:bg-white dark:text-slate-950 sm:px-5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">게시 중</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  게시하기
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 pb-32 pt-8 sm:px-6 sm:pt-12 lg:px-8">
          {loadError ? (
            <section className="mx-auto max-w-3xl rounded-[2rem] border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-500/20 dark:bg-rose-500/10">
              <AlertCircle className="mx-auto h-8 w-8 text-rose-500" />
              <h1 className="mt-4 text-xl font-black">에디터를 열 수 없어요</h1>
              <p className="mt-2 text-sm text-rose-600/80 dark:text-rose-200/70">
                {loadError}
              </p>
              <button
                type="button"
                onClick={goBack}
                className="mt-6 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-black text-white dark:bg-white dark:text-slate-950"
              >
                Universe로 돌아가기
              </button>
            </section>
          ) : (
            <div className="mx-auto max-w-4xl">
              <header className="mb-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-violet-600 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    Verse editor
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    /universe/{universeSlug}
                  </span>
                </div>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                  생각을 정리하려고 애쓰지 않아도 돼요. 제목 하나에서 시작해서
                  이 Verse에 새로운 별 하나를 남겨보세요.
                </p>
              </header>

              {!canPost && !isLoadingUniverse && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  이 유니버스는 현재 소유자만 글을 작성할 수 있어요.
                </div>
              )}

              <section className="overflow-hidden rounded-[2.25rem] border border-slate-200/80 bg-white/85 shadow-[0_30px_90px_rgba(15,23,42,.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.035] dark:shadow-[0_30px_90px_rgba(0,0,0,.25)]">
                <div className="border-b border-slate-200/70 px-5 py-4 dark:border-white/10 sm:px-8">
                  <p className="mb-3 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Category
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((item) => {
                      const selected = category === item;

                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setCategory(item)}
                          className={
                            selected
                              ? "rounded-full bg-violet-600 px-4 py-2 text-xs font-black text-white shadow-md shadow-violet-600/20 transition"
                              : "rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black text-slate-500 transition hover:border-violet-200 hover:text-violet-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:border-violet-500/30 dark:hover:text-violet-300"
                          }
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="px-5 pb-4 pt-7 sm:px-8 sm:pt-9">
                  <label htmlFor="post-title" className="sr-only">
                    게시글 제목
                  </label>
                  <textarea
                    id="post-title"
                    autoFocus
                    rows={2}
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="어떤 이야기를 남길까요?"
                    className="w-full resize-none bg-transparent text-[2.15rem] font-black leading-[1.08] tracking-[-0.045em] text-slate-950 outline-none placeholder:text-slate-300 dark:text-white dark:placeholder:text-white/15 sm:text-[3.15rem]"
                  />
                </div>

                <div className="px-5 pb-6 sm:px-8">
                  <div className="mb-3 h-px bg-gradient-to-r from-violet-500/40 via-slate-200 to-transparent dark:via-white/10" />
                  <label htmlFor="post-content" className="sr-only">
                    게시글 본문
                  </label>
                  <textarea
                    id="post-content"
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    placeholder={"이야기를 시작해보세요.\n\n문장이 길어져도 괜찮아요. 이 공간은 넓습니다."}
                    className="min-h-[46vh] w-full resize-none bg-transparent py-5 text-[17px] leading-8 text-slate-700 outline-none placeholder:text-slate-300 dark:text-slate-200 dark:placeholder:text-white/15 sm:min-h-[52vh] sm:text-lg sm:leading-9"
                  />

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-slate-400 dark:border-white/10">
                    <span>{content.length.toLocaleString("ko-KR")}자</span>
                    <span className="hidden items-center gap-1.5 sm:inline-flex">
                      <Keyboard className="h-3.5 w-3.5" />
                      Ctrl / ⌘ + Enter로 게시
                    </span>
                  </div>
                </div>
              </section>

              <section className="mt-5 rounded-[1.75rem] border border-slate-200/80 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-white/[0.025] sm:p-5">
                {imagePreview ? (
                  <div className="relative overflow-hidden rounded-[1.35rem] border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/5">
                    <img
                      src={imagePreview}
                      alt="첨부 이미지 미리보기"
                      className="max-h-[30rem] w-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur transition hover:bg-black/85"
                      aria-label="첨부 이미지 제거"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="group flex cursor-pointer items-center justify-between gap-4 rounded-[1.35rem] border border-dashed border-slate-300 bg-slate-50/70 px-5 py-5 transition hover:border-violet-300 hover:bg-violet-50/50 dark:border-white/15 dark:bg-white/[0.025] dark:hover:border-violet-500/40 dark:hover:bg-violet-500/5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-violet-500 shadow-sm dark:bg-white/10 dark:text-violet-300">
                        <ImageIcon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-black">이미지 한 장 첨부</p>
                        <p className="mt-1 text-xs text-slate-400">
                          선택 사항 · 이미지는 초안 자동저장에 포함되지 않아요.
                        </p>
                      </div>
                    </div>
                    <span className="hidden rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white dark:bg-white dark:text-slate-950 sm:inline">
                      선택
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </section>

              {submitError && (
                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {submitError}
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 rounded-[1.5rem] border border-slate-200/80 bg-white/80 p-3 shadow-lg shadow-slate-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-[#0a0c13]/90 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1 px-2">
                  <p className="text-xs font-black text-slate-700 dark:text-slate-200">
                    {title.trim() && content.trim()
                      ? "게시할 준비가 됐어요."
                      : "제목과 본문을 채우면 게시할 수 있어요."}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    텍스트 초안은 이 계정과 Universe에 맞춰 자동 저장됩니다.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={goBack}
                    className="flex-1 rounded-full px-5 py-3 text-sm font-black text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white sm:flex-none"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-violet-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-violet-600/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0 sm:flex-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        게시 중...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        게시하기
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </main>
  );
}
