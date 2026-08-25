"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, UserRound } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type FormState = {
  nickname: string;
  displayName: string;
  bio: string;
  about: string;
  avatarUrl: string;
  tags: string;
};

const emptyForm: FormState = {
  nickname: "",
  displayName: "",
  bio: "",
  about: "",
  avatarUrl: "",
  tags: "",
};

export default function EditUserPage() {
  const params = useParams<{ id: string | string[] }>();
  const router = useRouter();
  const id = useMemo(
    () => (Array.isArray(params.id) ? params.id[0] : params.id),
    [params.id]
  );

  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!id) return;
      setLoading(true);

      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (cancelled) return;

      if (authError || !authData.user) {
        router.replace("/auth/login");
        return;
      }

      if (authData.user.id !== id) {
        router.replace(`/users/${id}`);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("nickname,display_name,bio,about,avatar_url,tags")
        .eq("id", id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        setMessage("프로필을 불러오지 못했어요.");
      } else {
        setForm({
          nickname: data?.nickname ?? "",
          displayName: data?.display_name ?? "",
          bio: data?.bio ?? "",
          about: data?.about ?? "",
          avatarUrl: data?.avatar_url ?? "",
          tags: Array.isArray(data?.tags) ? data.tags.join(", ") : "",
        });
      }

      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, router]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    if (!id || saving) return;

    const nickname = form.nickname.trim().slice(0, 40);
    const displayName = form.displayName.trim().slice(0, 80);

    if (!nickname && !displayName) {
      setMessage("닉네임이나 표시 이름 중 하나는 입력해 주세요.");
      return;
    }

    const tags = form.tags
      .split(",")
      .map((tag) => tag.trim().replace(/^#/, ""))
      .filter(Boolean)
      .slice(0, 12);

    setSaving(true);
    setMessage(null);

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user || authData.user.id !== id) {
      setSaving(false);
      router.replace("/auth/login");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        nickname: nickname || null,
        display_name: displayName || null,
        bio: form.bio.trim().slice(0, 240) || null,
        about: form.about.trim().slice(0, 3000) || null,
        avatar_url: form.avatarUrl.trim().slice(0, 1000) || null,
        tags,
      })
      .eq("id", id);

    if (error) {
      console.error("Profile update error:", error);
      setMessage(error.message);
      setSaving(false);
      return;
    }

    router.push(`/users/${id}`);
    router.refresh();
  }

  if (loading) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-slate-50 dark:bg-[#070711]">
        <Loader2 className="h-7 w-7 animate-spin text-violet-500" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#070711] dark:text-white">
      <div className="mx-auto max-w-3xl px-4 py-7 sm:px-6">
        <Link href={`/users/${id}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:text-white/45 dark:hover:bg-white/5">
          <ArrowLeft className="h-4 w-4" /> 프로필로 돌아가기
        </Link>

        <header className="mt-4 rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#0d0d19]">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-400/10 dark:text-violet-200">
              {form.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.avatarUrl} alt="프로필 미리보기" className="h-full w-full object-cover" />
              ) : (
                <UserRound className="h-6 w-6" />
              )}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-600 dark:text-violet-300">Profile settings</p>
              <h1 className="mt-1 text-2xl font-black">프로필 편집</h1>
            </div>
          </div>
        </header>

        <section className="mt-5 space-y-5 rounded-[2rem] border border-slate-200 bg-white p-5 sm:p-6 dark:border-white/10 dark:bg-[#0d0d19]">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="닉네임">
              <input value={form.nickname} onChange={(event) => update("nickname", event.target.value)} maxLength={40} className="input" placeholder="예: 드가이" />
            </Field>
            <Field label="표시 이름">
              <input value={form.displayName} onChange={(event) => update("displayName", event.target.value)} maxLength={80} className="input" placeholder="프로필에 크게 보일 이름" />
            </Field>
          </div>

          <Field label="한 줄 소개">
            <input value={form.bio} onChange={(event) => update("bio", event.target.value)} maxLength={240} className="input" placeholder="짧은 소개" />
          </Field>

          <Field label="자세한 소개">
            <textarea value={form.about} onChange={(event) => update("about", event.target.value)} maxLength={3000} rows={7} className="input resize-y" placeholder="창작 활동이나 관심사를 소개해 보세요." />
          </Field>

          <Field label="태그" hint="쉼표로 구분">
            <input value={form.tags} onChange={(event) => update("tags", event.target.value)} className="input" placeholder="세계관, 팬아트, SF" />
          </Field>

          <Field label="아바타 이미지 URL" hint="Storage 아바타 업로드는 별도 단계에서 연결">
            <input value={form.avatarUrl} onChange={(event) => update("avatarUrl", event.target.value)} className="input" inputMode="url" placeholder="https://..." />
          </Field>

          {message && <p role="status" className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 dark:bg-amber-400/10 dark:text-amber-100">{message}</p>}

          <button type="button" onClick={save} disabled={saving} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-black text-white transition hover:bg-violet-700 disabled:opacity-50 sm:w-auto">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "저장 중..." : "변경 저장"}
          </button>
        </section>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.875rem;
          border: 1px solid rgb(226 232 240);
          background: rgb(248 250 252);
          padding: 0.8rem 0.9rem;
          font-size: 0.95rem;
          outline: none;
        }
        .input:focus {
          border-color: rgb(139 92 246);
          box-shadow: 0 0 0 3px rgb(139 92 246 / 0.1);
        }
        :global(.dark) .input {
          border-color: rgb(255 255 255 / 0.1);
          background: rgb(255 255 255 / 0.04);
          color: white;
        }
      `}</style>
    </main>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between gap-3 text-sm font-black">
        {label}
        {hint && <span className="text-[11px] font-semibold text-slate-400">{hint}</span>}
      </span>
      {children}
    </label>
  );
}
