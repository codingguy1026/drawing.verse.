"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Globe2,
  Image as ImageIcon,
  Info,
  Loader2,
  Send,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

const TITLE_MAX = 160;
const CONTENT_MAX = 20000;

type AuthState = "checking" | "authenticated" | "signed-out" | "unavailable";

function humanizeSlug(value: string) {
  const decoded = decodeURIComponent(value);
  return decoded
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function UniverseWritePage() {
  const params = useParams<{ slug: string | string[] }>();
  const router = useRouter();

  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const universeName = useMemo(() => humanizeSlug(slug || "universe"), [slug]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [authState, setAuthState] = useState<AuthState>("checking");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkUser() {
      const { data, error } = await supabase.auth.getUser();
      if (cancelled) return;

      if (error) {
        console.warn("Unable to verify auth state:", error);
        setAuthState("unavailable");
        return;
      }

      setAuthState(data.user ? "authenticated" : "signed-out");
    }

    checkUser();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const cleanTitle = title.trim();
    const cleanContent = content.trim();

    if (!cleanTitle || !cleanContent || !slug) return;

    if (authState === "signed-out") {
      router.push("/auth/login");
      return;
    }

    if (authState !== "authenticated") {
      setErrorMessage("로그인 상태를 확인할 수 없어요. 연결이 복구된 뒤 다시 시도해 주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: cleanTitle,
          content: cleanContent,
          universeSlug: slug,
        }),
      });

      const result = await response.json().catch(() => null);

      if (response.status === 401) {
        setAuthState("signed-out");
        router.push("/auth/login");
        return;
      }

      if (!response.ok || !result?.ok || !result?.data?.id) {
        throw new Error(result?.error || "글을 저장하지 못했어요.");
      }

      router.push(`/post/${result.data.id}`);
      router.refresh();
    } catch (error) {
      console.error("Post creation error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "글을 올리는 중 오류가 발생했어요."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const canSubmit = Boolean(title.trim() && content.trim() && slug);
  const connectionUnavailable = authState === "unavailable";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#070711] dark:text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/universe/${slug || ""}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-white/45 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            유니버스로 돌아가기
          </Link>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-white/30">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            자동 저장은 다음 단계에서 연결
          </div>
        </div>

        <header className="mb-6 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-[#0d0d19]">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-700 dark:bg-violet-400/10 dark:text-violet-200">
                <Globe2 className="h-3.5 w-3.5" />
                {universeName}
              </div>
              <h1 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
                새 게시글 작성
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-white/45">
                제목과 본문에 집중할 수 있도록 작성 화면을 단순하게 정리했어요. 미디어와 추가 분류는 데이터 구조가 준비된 뒤 연결합니다.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/40">
              제목 {title.length}/{TITLE_MAX}
              <br />
              본문 {content.length.toLocaleString()}/{CONTENT_MAX.toLocaleString()}
            </div>
          </div>
        </header>

        {connectionUnavailable && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-black">현재 로그인 서버 연결을 확인할 수 없어요.</p>
              <p className="mt-1 text-xs leading-5 opacity-80">
                레이아웃과 입력은 그대로 테스트할 수 있지만 실제 게시 버튼은 연결이 복구된 뒤 사용할 수 있어요.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
          <section className="min-w-0 space-y-4">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-white/10 dark:bg-[#0d0d19]">
              <label htmlFor="post-title" className="text-xs font-black uppercase tracking-[0.14em] text-slate-400 dark:text-white/30">
                제목
              </label>
              <input
                id="post-title"
                value={title}
                maxLength={TITLE_MAX}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="무슨 이야기를 나누고 싶나요?"
                className="mt-3 w-full border-0 bg-transparent p-0 text-2xl font-black tracking-tight outline-none placeholder:text-slate-300 dark:placeholder:text-white/15 sm:text-3xl"
              />
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-white/10 dark:bg-[#0d0d19]">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-white/7">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-violet-600 dark:text-violet-300" />
                  <span className="text-sm font-black">본문</span>
                </div>
                <span className="text-xs font-semibold text-slate-400 dark:text-white/25">
                  Markdown 편집기는 다음 단계
                </span>
              </div>

              <textarea
                value={content}
                maxLength={CONTENT_MAX}
                onChange={(event) => setContent(event.target.value)}
                placeholder="내용을 자유롭게 작성해 주세요."
                rows={16}
                className="mt-4 min-h-[360px] w-full resize-y border-0 bg-transparent p-0 text-[15px] leading-7 text-slate-700 outline-none placeholder:text-slate-300 dark:text-white/70 dark:placeholder:text-white/15 sm:min-h-[430px] sm:text-base"
              />
            </div>

            <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.02]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-white/40">
                    <ImageIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-black">미디어 첨부</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-white/35">
                      Storage 버킷과 게시글 스키마가 확정되면 여기에 이미지·영상 첨부를 연결할 예정이에요.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled
                  className="min-h-10 shrink-0 rounded-xl border border-slate-200 bg-slate-100 px-4 text-xs font-black text-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-white/25"
                >
                  준비 중
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-100">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Link
                href={`/universe/${slug || ""}`}
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting || authState === "checking" || connectionUnavailable}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 text-sm font-black text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    게시 중...
                  </>
                ) : authState === "signed-out" ? (
                  <>
                    <Send className="h-4 w-4" />
                    로그인 후 게시
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    게시하기
                  </>
                )}
              </button>
            </div>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0d0d19]">
              <div className="mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                <h2 className="text-sm font-black">게시 전 확인</h2>
              </div>
              <div className="space-y-3 text-sm">
                <CheckRow label="제목 입력" done={Boolean(title.trim())} />
                <CheckRow label="본문 입력" done={Boolean(content.trim())} />
                <CheckRow label="유니버스 지정" done={Boolean(slug)} />
                <CheckRow label="로그인 확인" done={authState === "authenticated"} />
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0d0d19]">
              <div className="mb-3 flex items-center gap-2">
                <Info className="h-4 w-4 text-violet-600 dark:text-violet-300" />
                <h2 className="text-sm font-black">작성 가이드</h2>
              </div>
              <ul className="space-y-2 text-xs leading-5 text-slate-500 dark:text-white/40">
                <li>• 유니버스 주제와 관련된 내용을 작성해 주세요.</li>
                <li>• 다른 창작자와 이용자를 존중해 주세요.</li>
                <li>• 이미지 첨부는 현재 UI 자리만 마련되어 있어요.</li>
              </ul>
            </section>
          </aside>
        </form>
      </div>
    </main>
  );
}

function CheckRow({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500 dark:text-white/40">{label}</span>
      <span
        className={`rounded-full px-2 py-1 text-[10px] font-black ${
          done
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200"
            : "bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-white/25"
        }`}
      >
        {done ? "완료" : "대기"}
      </span>
    </div>
  );
}
