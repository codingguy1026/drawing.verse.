"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Loader2, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export default function GalleryUploadPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("일러스트");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      if (!data.user) router.replace("/auth/login");
      else setAuthLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function chooseFile(next: File | null) {
    setErrorMessage(null);
    if (!next) {
      setFile(null);
      return;
    }
    if (!ALLOWED_TYPES.has(next.type)) {
      setErrorMessage("JPG, PNG, WebP, GIF 이미지만 올릴 수 있어요.");
      return;
    }
    if (next.size > MAX_FILE_SIZE) {
      setErrorMessage("이미지는 10MB 이하로 올려 주세요.");
      return;
    }
    setFile(next);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || !file || !title.trim()) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        router.replace("/auth/login");
        return;
      }

      const user = authData.user;
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(path, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(
          uploadError.message.includes("Bucket")
            ? "gallery Storage가 아직 준비되지 않았어요. Supabase alignment migration을 먼저 적용해 주세요."
            : uploadError.message
        );
      }

      const { data: publicData } = supabase.storage.from("gallery").getPublicUrl(path);

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name,nickname")
        .eq("id", user.id)
        .maybeSingle();

      const author =
        profile?.display_name?.trim() ||
        profile?.nickname?.trim() ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "Anonymous";

      const { data: item, error: insertError } = await supabase
        .from("gallery")
        .insert({
          title: title.trim().slice(0, 160),
          author: String(author).slice(0, 80),
          thumbnail_url: publicData.publicUrl,
          category: category.trim().slice(0, 40) || "기타",
          user_id: user.id,
          view_count: 0,
          like_count: 0,
          comment_count: 0,
        })
        .select("id")
        .single();

      if (insertError) {
        await supabase.storage.from("gallery").remove([path]);
        throw insertError;
      }

      router.push(`/gallery/${item.id}`);
      router.refresh();
    } catch (error) {
      console.error("Gallery upload error:", error);
      setErrorMessage(error instanceof Error ? error.message : "작품을 업로드하지 못했어요.");
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return <main className="grid min-h-[70vh] place-items-center bg-slate-50 dark:bg-[#070711]"><Loader2 className="h-7 w-7 animate-spin text-violet-500" /></main>;
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#070711] dark:text-white">
      <div className="mx-auto max-w-4xl px-4 py-7 sm:px-6">
        <Link href="/gallery" className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:text-white/45 dark:hover:bg-white/5"><ArrowLeft className="h-4 w-4" /> 갤러리로</Link>

        <header className="mt-4 rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#0d0d19]">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-600 dark:text-violet-300">Gallery upload</p>
          <h1 className="mt-2 text-3xl font-black">작품 올리기</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-white/45">이미지는 Supabase Storage에, 작품 정보는 gallery 테이블에 저장됩니다.</p>
        </header>

        <form onSubmit={submit} className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px] lg:items-start">
          <section className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0d0d19]">
            <label className="block"><span className="mb-2 block text-sm font-black">제목</span><input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={160} placeholder="작품 제목" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-violet-400 dark:border-white/10 dark:bg-white/5" /></label>
            <label className="block"><span className="mb-2 block text-sm font-black">카테고리</span><input value={category} onChange={(e) => setCategory(e.target.value)} maxLength={40} placeholder="일러스트" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-violet-400 dark:border-white/10 dark:bg-white/5" /></label>

            <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center transition hover:border-violet-400 dark:border-white/15 dark:bg-white/[0.03]">
              <ImagePlus className="h-7 w-7 text-violet-500" />
              <span className="mt-3 font-black">이미지 선택</span>
              <span className="mt-1 text-xs text-slate-400">JPG · PNG · WebP · GIF, 최대 10MB</span>
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(event) => chooseFile(event.target.files?.[0] ?? null)} />
            </label>

            {errorMessage && <p role="status" className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:bg-rose-400/10 dark:text-rose-100">{errorMessage}</p>}
          </section>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0d0d19]">
              <div className="aspect-[4/3] bg-slate-100 dark:bg-white/5">{previewUrl ? <img src={previewUrl} alt="업로드 미리보기" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-sm font-semibold text-slate-400">미리보기</div>}</div>
              <div className="p-4"><p className="text-xs font-bold text-violet-500">{category || "기타"}</p><h2 className="mt-1 font-black">{title || "작품 제목"}</h2></div>
            </div>

            <button type="submit" disabled={loading || !file || !title.trim()} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-black text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {loading ? "업로드 중..." : "작품 공개"}
            </button>
          </aside>
        </form>
      </div>
    </main>
  );
}
