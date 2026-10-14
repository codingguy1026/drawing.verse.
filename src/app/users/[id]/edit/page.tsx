"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, Loader2, Save, UserRound } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type EditableProfile = {
  display_name: string | null;
  nickname: string | null;
  bio: string | null;
};

export default function EditUserPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = params.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (cancelled) return;
      if (authError || !auth.user) {
        router.replace("/login");
        return;
      }
      if (auth.user.id !== userId) {
        router.replace("/me");
        return;
      }
      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("display_name,nickname,bio")
        .eq("id", userId)
        .maybeSingle();

      if (cancelled) return;
      if (profileError || !data) {
        setError("프로필을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
      } else {
        const profile = data as EditableProfile;
        setDisplayName(profile.display_name ?? profile.nickname ?? "");
        setBio(profile.bio ?? "");
      }
      setLoading(false);
    }
    void load();
    return () => { cancelled = true; };
  }, [router, userId]);

  async function onSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = displayName.trim();
    if (!name || name.length > 40) {
      setError("표시 이름은 1~40자로 입력해 주세요.");
      return;
    }
    if (bio.length > 500) {
      setError("소개는 500자 이내로 적어 주세요.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    const { data: auth } = await supabase.auth.getUser();
    if (auth.user?.id !== userId) {
      setError("로그인을 다시 확인해 주세요.");
      setSaving(false);
      return;
    }
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ display_name: name, bio: bio.trim() })
      .eq("id", userId);

    setSaving(false);
    if (updateError) {
      setError("프로필 저장에 실패했어요. 변경 권한과 연결 상태를 확인해 주세요.");
      return;
    }
    setMessage("프로필을 저장했어요.");
    router.refresh();
  }

  return (
    <main className="dv-profile-editor mx-auto w-full max-w-3xl px-4 pb-16 pt-8 sm:px-6">
      <Link href={`/users/${userId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-violet-700 dark:text-slate-300 dark:hover:text-violet-200">
        <ArrowLeft size={17} /> 내 프로필로
      </Link>
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#171426]">
        <div className="border-b border-slate-200 px-6 py-6 dark:border-white/10 sm:px-8">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-300/15 dark:text-violet-200">
            <UserRound size={24} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[.13em] text-violet-700 dark:text-violet-200">MY SPACE · PROFILE</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">프로필 편집</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            나를 소개하는 이름과 한 줄 이야기를 바꿔보세요. 기존 게시글과 유니버스는 그대로 유지돼요.
          </p>
        </div>
        {loading ? (
          <div className="flex items-center gap-3 px-6 py-10 text-sm text-slate-600 dark:text-slate-300" role="status">
            <Loader2 size={18} className="animate-spin" /> 프로필 불러오는 중…
          </div>
        ) : (
          <form onSubmit={onSave} className="space-y-6 px-6 py-7 sm:px-8">
            <div>
              <label htmlFor="dv-display-name" className="mb-2 block text-sm font-bold text-slate-900 dark:text-white">표시 이름</label>
              <input id="dv-display-name" name="display_name" autoComplete="nickname" value={displayName} onChange={event => setDisplayName(event.target.value)} maxLength={40} required
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-violet-500 dark:border-white/20 dark:bg-[#201c2f] dark:text-white"
                placeholder="어떻게 불리고 싶나요?" />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <label htmlFor="dv-bio" className="text-sm font-bold text-slate-900 dark:text-white">소개</label>
                <span className="text-xs tabular-nums text-slate-500 dark:text-slate-300">{bio.length}/500</span>
              </div>
              <textarea id="dv-bio" name="bio" value={bio} onChange={event => setBio(event.target.value)} maxLength={500} rows={5}
                className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none focus:border-violet-500 dark:border-white/20 dark:bg-[#201c2f] dark:text-white"
                placeholder="관심사, 만드는 세계관, 나를 소개하는 이야기를 적어보세요." />
            </div>
            {error && <p role="alert" className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-400/30 dark:bg-rose-950/25 dark:text-rose-200">{error}</p>}
            {message && <p role="status" className="flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-950/25 dark:text-emerald-200"><Check size={16} /> {message}</p>}
            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-5 dark:border-white/10">
              <Link href={`/users/${userId}`} className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/20 dark:text-slate-200 dark:hover:bg-white/5">취소</Link>
              <button type="submit" disabled={saving || Boolean(error && !displayName)} className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-800 disabled:cursor-wait disabled:opacity-60">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? "저장 중…" : "변경 사항 저장"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
