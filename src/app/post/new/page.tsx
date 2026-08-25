"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PenLine } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type UniverseOption = { slug: string; name: string };

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [universeSlug, setUniverseSlug] = useState("");
  const [content, setContent] = useState("");
  const [universes, setUniverses] = useState<UniverseOption[]>([]);
  const [loadingUniverses, setLoadingUniverses] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data, error } = await supabase
        .from("universes")
        .select("slug,name")
        .order("name", { ascending: true });
      if (cancelled) return;
      if (error) setError("유니버스 목록을 불러오지 못했어요.");
      else setUniverses((data ?? []) as UniverseOption[]);
      setLoadingUniverses(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || !title.trim() || !content.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          universeSlug: universeSlug || "",
        }),
      });
      const json = await response.json();

      if (response.status === 401) {
        router.push("/auth/login");
        return;
      }
      if (!response.ok || !json.ok) {
        throw new Error(json.error || "게시물을 등록하지 못했어요.");
      }

      router.push(`/post/${json.data.id}`);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "게시물을 등록하지 못했어요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#070711] dark:text-white">
      <div className="mx-auto max-w-3xl px-4 py-7 sm:px-6">
        <header className="rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#0d0d19]">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-600 dark:text-violet-300">New post</p>
          <h1 className="mt-2 flex items-center gap-2 text-3xl font-black"><PenLine className="h-6 w-6" /> 새 게시물 작성</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-white/45">유니버스를 선택하거나 전체 게시글로 올릴 수 있어요.</p>
        </header>

        <form onSubmit={submit} className="mt-5 space-y-4 rounded-[2rem] border border-slate-200 bg-white p-5 sm:p-6 dark:border-white/10 dark:bg-[#0d0d19]">
          <label className="block"><span className="mb-2 block text-sm font-black">제목</span><input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={160} required className="min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-base outline-none focus:border-violet-400 dark:border-white/10 dark:bg-white/5" /></label>

          <label className="block"><span className="mb-2 block text-sm font-black">유니버스</span><select value={universeSlug} onChange={(e) => setUniverseSlug(e.target.value)} disabled={loadingUniverses} className="min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-base outline-none dark:border-white/10 dark:bg-white/5"><option value="">전체 / 미분류</option>{universes.map((universe) => <option key={universe.slug} value={universe.slug}>{universe.name}</option>)}</select></label>

          <label className="block"><span className="mb-2 block text-sm font-black">내용</span><textarea value={content} onChange={(e) => setContent(e.target.value)} maxLength={20000} rows={12} required className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base leading-7 outline-none focus:border-violet-400 dark:border-white/10 dark:bg-white/5" /></label>

          {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:bg-rose-400/10 dark:text-rose-100">{error}</p>}

          <div className="flex flex-wrap gap-2"><button type="submit" disabled={submitting || !title.trim() || !content.trim()} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-black text-white disabled:opacity-40">{submitting && <Loader2 className="h-4 w-4 animate-spin" />}{submitting ? "등록 중..." : "게시물 등록"}</button><Link href="/" className="inline-flex min-h-12 items-center rounded-xl border border-slate-200 px-5 text-sm font-black dark:border-white/10">취소</Link></div>
        </form>
      </div>
    </main>
  );
}
