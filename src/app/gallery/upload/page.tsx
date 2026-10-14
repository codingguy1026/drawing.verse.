"use client";

import Link from "next/link";
import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Image as ImageIcon, Loader2, Trash2, UploadCloud } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

const categories = ["일러스트", "웹툰", "캐릭터", "스케치", "배경", "팬아트"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

type ProfileIdentity = {
  display_name: string | null;
  nickname: string | null;
  avatar_url: string | null;
};

export default function GalleryUploadPage() {
  const router = useRouter();
  const [userId, setUserId] = React.useState<string | null>(null);
  const [profile, setProfile] = React.useState<ProfileIdentity | null>(null);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    let ignore = false;

    async function loadIdentity() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.replace("/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("display_name,nickname,avatar_url")
        .eq("id", data.user.id)
        .maybeSingle<ProfileIdentity>();

      if (ignore) return;
      setUserId(data.user.id);
      setProfile(profileData ?? null);
    }

    loadIdentity();
    return () => {
      ignore = true;
    };
  }, [router]);

  function resetImage() {
    setImageFile(null);
    setPreviewUrl(null);
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setErrorMessage("");

    if (!file.type.startsWith("image/")) {
      setErrorMessage("이미지 파일만 업로드할 수 있어요.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage("이미지는 10MB 이하로 올려 주세요.");
      event.target.value = "";
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!userId) {
      setErrorMessage("로그인 정보를 확인하지 못했어요.");
      return;
    }
    if (!imageFile) {
      setErrorMessage("작품 이미지를 선택해 주세요.");
      return;
    }
    if (!title.trim()) {
      setErrorMessage("작품 제목을 입력해 주세요.");
      return;
    }
    if (!category) {
      setErrorMessage("카테고리를 선택해 주세요.");
      return;
    }

    setSubmitting(true);
    let uploadedPath: string | null = null;

    try {
      const ext = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
      uploadedPath = `${userId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(uploadedPath, imageFile, {
          cacheControl: "3600",
          contentType: imageFile.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("gallery").getPublicUrl(uploadedPath);

      const author =
        profile?.display_name?.trim() ||
        profile?.nickname?.trim() ||
        "사용자";

      const { data: artwork, error: insertError } = await supabase
        .from("gallery")
        .insert({
          title: title.trim(),
          description: description.trim(),
          category,
          thumbnail_url: publicUrl,
          author,
          user_id: userId,
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      router.push(`/gallery/${artwork.id}`);
    } catch (error) {
      console.error("Gallery upload failed:", error);

      if (uploadedPath) {
        await supabase.storage.from("gallery").remove([uploadedPath]);
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "작품을 등록하는 중 문제가 생겼어요."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const authorName =
    profile?.display_name?.trim() ||
    profile?.nickname?.trim() ||
    "내 프로필";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 dark:bg-[#03050a] dark:text-white sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-3xl">
        <Link href="/gallery" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-950 dark:text-white/70 dark:hover:text-white">
          <ArrowLeft className="size-4" />
          갤러리로 돌아가기
        </Link>

        <header className="mt-8 border-b border-slate-200 pb-6 dark:border-white/10">
          <p className="text-sm font-semibold text-slate-500">Gallery Upload</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">작품 업로드</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-white/55">
            작품 이미지와 정보를 등록하면 내 Drawing Verse 프로필 이름으로 갤러리에 공개됩니다.
          </p>

          <div className="mt-4 flex items-center gap-3">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="size-9 rounded-full object-cover" />
            ) : (
              <div className="grid size-9 place-items-center rounded-full bg-slate-200 text-sm font-black text-slate-600 dark:bg-white/10 dark:text-white/70">
                {authorName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-xs text-slate-500">이 프로필로 등록</p>
              <p className="text-sm font-black">{authorName}</p>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="py-8">
          <section>
            <h2 className="text-sm font-black">작품 이미지 <span className="text-rose-500">*</span></h2>

            <label className="mt-3 flex min-h-72 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white dark:border-white/15 dark:bg-white/[0.03]">
              {previewUrl ? (
                <img src={previewUrl} alt="작품 미리보기" className="max-h-[32rem] w-full object-contain" />
              ) : (
                <div className="px-6 py-12 text-center">
                  <div className="mx-auto grid size-12 place-items-center rounded-full bg-slate-100 dark:bg-white/10">
                    <UploadCloud className="size-5 text-slate-500" />
                  </div>
                  <p className="mt-4 text-sm font-black">이미지 선택</p>
                  <p className="mt-1 text-xs text-slate-500">이미지 파일 · 최대 10MB</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>

            {imageFile && (
              <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
                <span className="truncate">{imageFile.name}</span>
                <button type="button" onClick={resetImage} className="inline-flex shrink-0 items-center gap-1.5 font-bold text-slate-700 hover:text-rose-600 dark:text-white/75">
                  <Trash2 className="size-3.5" />
                  이미지 제거
                </button>
              </div>
            )}
          </section>

          <section className="mt-8 space-y-5 border-t border-slate-200 pt-8 dark:border-white/10">
            <label className="block">
              <span className="text-sm font-black">작품 제목 <span className="text-rose-500">*</span></span>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={120}
                placeholder="작품 제목"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400 dark:border-white/10 dark:bg-white/[0.03] dark:focus:border-white/30"
              />
            </label>

            <label className="block">
              <span className="text-sm font-black">설명</span>
              <textarea
                rows={5}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={2000}
                placeholder="작품에 대한 설명을 적어 주세요."
                className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-slate-400 dark:border-white/10 dark:bg-white/[0.03] dark:focus:border-white/30"
              />
              <span className="mt-1 block text-right text-xs text-slate-400">{description.length}/2000</span>
            </label>

            <label className="block">
              <span className="text-sm font-black">카테고리 <span className="text-rose-500">*</span></span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#080a10]"
              >
                <option value="" disabled>카테고리 선택</option>
                {categories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
          </section>

          {errorMessage && (
            <div className="mt-6 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {errorMessage}
            </div>
          )}

          <div className="mt-8 flex flex-col-reverse gap-2 border-t border-slate-200 pt-6 dark:border-white/10 sm:flex-row sm:justify-end">
            <Link href="/gallery" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-bold dark:border-white/10">
              취소
            </Link>
            <button
              type="submit"
              disabled={submitting || !userId}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
            >
              {submitting ? <Loader2 className="size-4 animate-spin" /> : <ImageIcon className="size-4" />}
              {submitting ? "등록 중..." : "작품 등록"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
