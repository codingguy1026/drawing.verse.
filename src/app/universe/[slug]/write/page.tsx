"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Image as ImageIcon, Loader2, Send, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

const CATEGORIES = ["정보", "창작", "질문", "공지", "기타"];

export default function UniverseWritePage() {
  const { slug } = useParams();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState(CATEGORIES);
  const [category, setCategory] = useState("창작");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const universeSlug = decodeURIComponent((slug as string) ?? "");

  useEffect(() => {
    setMounted(true);

    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        alert("로그인이 필요한 서비스야!");
        router.push("/login");
        return;
      }

      setUser(data.user);
      const { data: universe } = await supabase.from('universes').select('sections').eq('slug', slug).maybeSingle();
      if (universe?.sections?.length) { setCategories(universe.sections); setCategory(universe.sections[0]); }
    };

    checkUser();
  }, [router, slug]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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

    if (!title.trim() || !content.trim() || !user) return;

    const { data: settings, error: settingsError } = await supabase.from('universes').select('owner_id,allow_member_posts').eq('slug', slug).maybeSingle();
    if (settingsError || !settings) { alert('유니버스를 확인하지 못했어요. 잠시 후 다시 시도해주세요.'); return; }
    if (!settings.allow_member_posts && settings.owner_id !== user.id) { alert('이 유니버스는 소유자만 글을 쓸 수 있어요.'); return; }
    setIsSubmitting(true);

    try {
      let imageUrl: string | null = null;

      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("posts")
          .upload(filePath, imageFile);

        if (!uploadError) {
          const {
            data: { publicUrl },
          } = supabase.storage.from("posts").getPublicUrl(filePath);

          imageUrl = publicUrl;
        }
      }

      const { data: post, error } = await supabase
        .from("posts")
        .insert({
          title: title.trim(),
          content: content.trim(),
          category,
          universe_slug: slug,
          author:
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "Anonymous",
          image_url: imageUrl,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      router.push(`/universe/${slug}/${post.id}`);
    } catch (error: any) {
      console.error("Post creation error:", error);
      alert(`글을 올리는 중 오류가 발생했어: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#03050a] px-4 pb-16 pt-20 text-white">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-8 space-y-4">
          <button
            type="button"
            onClick={() => router.push(`/universe/${slug}`)}
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Universe로 돌아가기
          </button>

          <div>
            <p className="text-sm text-slate-500">{universeSlug}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">새 게시글 작성</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              제목, 본문, 분류를 먼저 정리하고 필요한 경우 이미지를 첨부해줘.
            </p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">
            <div className="space-y-2">
              <label htmlFor="post-title" className="text-sm font-semibold text-slate-300">
                제목
              </label>
              <input
                id="post-title"
                autoFocus
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="게시글 제목"
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base outline-none transition focus:border-white/30"
              />
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-300">카테고리</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`rounded-xl border px-4 py-2 text-sm transition ${
                      category === item
                        ? "border-white bg-white text-black"
                        : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="post-content" className="text-sm font-semibold text-slate-300">
                본문
              </label>
              <textarea
                id="post-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="이 Universe에 공유하고 싶은 내용을 적어줘."
                rows={12}
                className="w-full resize-y rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-base leading-7 outline-none transition focus:border-white/30"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-300">이미지</p>
                  <p className="mt-1 text-xs text-slate-500">선택 사항이야. 한 장만 첨부할 수 있어.</p>
                </div>

                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-white/20 hover:text-white">
                  <ImageIcon className="h-4 w-4" />
                  이미지 선택
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              {imagePreview && (
                <div className="relative overflow-hidden rounded-2xl border border-white/10">
                  <img
                    src={imagePreview}
                    alt="첨부 이미지 미리보기"
                    className="max-h-96 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white"
                    aria-label="첨부 이미지 제거"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </section>

          <footer className="sticky bottom-4 z-30 flex flex-col-reverse gap-3 rounded-2xl border border-white/10 bg-[#090b12]/90 p-3 shadow-2xl shadow-black/30 backdrop-blur-xl sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.push(`/universe/${slug}`)}
              className="rounded-2xl border border-white/10 px-6 py-3 font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
            >
              취소
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 font-bold text-black transition disabled:cursor-not-allowed disabled:opacity-40"
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
          </footer>
        </form>
      </div>
    </main>
  );
}
