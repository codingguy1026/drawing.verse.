"use client";

import Link from "next/link";
import * as React from "react";
import { ArrowLeft, Loader2, Plus, Save, ShieldAlert, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type UniverseSettings = {
  slug: string;
  name: string;
  description: string | null;
  icon: string;
  visibility: "public" | "private";
  allow_member_posts: boolean;
  allow_comments: boolean;
  rules: string;
  sections: string[];
  owner_id: string | null;
  parent_slug: string | null;
  moderation_status: "active" | "hidden" | "removed";
};

type ParentOption = { slug: string; name: string };

export default function UniverseSettingsClient({ slug }: { slug: string }) {
  const universeHref = `/universe/${encodeURIComponent(slug)}`;
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [isOwner, setIsOwner] = React.useState(false);
  const [isOperator, setIsOperator] = React.useState(false);
  const [moderationStatus, setModerationStatus] = React.useState<"active" | "hidden" | "removed">("active");
  const [moderationReason, setModerationReason] = React.useState("");
  const [moderating, setModerating] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [icon, setIcon] = React.useState("");
  const [visibility, setVisibility] = React.useState<"public" | "private">("public");
  const [allowMemberPosts, setAllowMemberPosts] = React.useState(true);
  const [allowComments, setAllowComments] = React.useState(true);
  const [rules, setRules] = React.useState("");
  const [sections, setSections] = React.useState<string[]>([]);
  const [parentSlug, setParentSlug] = React.useState("");
  const [parentOptions, setParentOptions] = React.useState<ParentOption[]>([]);
  const [hasChildren, setHasChildren] = React.useState(false);

  React.useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setErrorMessage("");

      const [{ data: authData }, { data: universe, error }, { data: operatorValue }] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from("universes")
          .select("slug,name,description,icon,visibility,allow_member_posts,allow_comments,rules,sections,owner_id,parent_slug,moderation_status")
          .eq("slug", slug)
          .maybeSingle<UniverseSettings>(),
        supabase.rpc("is_dverse_operator"),
      ]);

      if (ignore) return;

      if (!authData.user) {
        window.location.href = "/login";
        return;
      }

      if (error || !universe) {
        setErrorMessage("Universe 설정을 불러오지 못했어요.");
        setLoading(false);
        return;
      }

      const operator = operatorValue === true;
      const owner = universe.owner_id === authData.user.id;
      setIsOwner(owner || operator);
      setIsOperator(operator);
      setModerationStatus(universe.moderation_status || "active");

      if (!owner && !operator) {
        setErrorMessage("이 Universe의 제작자 또는 운영자만 설정을 변경할 수 있어요.");
        setLoading(false);
        return;
      }

      // Preserve actual creator ownership when choosing an eligible parent.
      const [rootsResult, childrenResult] = await Promise.all([
        supabase.from("universes").select("slug,name").eq("owner_id", universe.owner_id).eq("moderation_status", "active").is("parent_slug", null).neq("slug", slug).order("name"),
        supabase.from("universes").select("slug").eq("parent_slug", slug).limit(1),
      ]);
      if (ignore) return;
      if (rootsResult.error || childrenResult.error) {
        setErrorMessage("소속 유니버스 정보를 불러오지 못했어요.");
        setLoading(false);
        return;
      }
      setParentOptions((rootsResult.data as ParentOption[] | null) ?? []);
      setHasChildren(Boolean(childrenResult.data?.length));
      setParentSlug(universe.parent_slug ?? "");
      setName(universe.name || "");
      setDescription(universe.description || "");
      setIcon(universe.icon || "");
      setVisibility(universe.visibility || "public");
      setAllowMemberPosts(Boolean(universe.allow_member_posts));
      setAllowComments(Boolean(universe.allow_comments));
      setRules(universe.rules || "");
      setSections(Array.isArray(universe.sections) ? universe.sections : []);
      setLoading(false);
    }

    load();
    return () => {
      ignore = true;
    };
  }, [slug]);

  function updateSection(index: number, value: string) {
    setSections((current) => current.map((section, i) => i === index ? value : section));
  }

  function addSection() {
    if (sections.length >= 8) return;
    setSections((current) => [...current, "새 섹션"]);
  }

  function removeSection(index: number) {
    if (sections.length <= 1) return;
    setSections((current) => current.filter((_, i) => i !== index));
  }

  function validate() {
    const trimmedName = name.trim();
    const normalizedSections = sections.map((section) => section.trim()).filter(Boolean);

    if (parentSlug === slug) return "자기 자신을 상위 유니버스로 선택할 수 없어요.";
    if (parentSlug && hasChildren) return "소속 행성이 있는 유니버스는 다른 유니버스에 편입할 수 없어요.";
    if (parentSlug && !parentOptions.some((option) => option.slug === parentSlug)) return "선택한 상위 유니버스를 확인해 주세요.";
    if (!trimmedName) return "Universe 이름을 입력해 주세요.";
    if (trimmedName.length > 60) return "Universe 이름은 60자 이내여야 해요.";
    if (description.length > 280) return "설명은 280자 이내여야 해요.";
    if (icon.length > 16) return "아이콘은 짧게 입력해 주세요.";
    if (rules.length > 2000) return "규칙은 2000자 이내여야 해요.";
    if (normalizedSections.length < 1 || normalizedSections.length > 8) return "섹션은 1~8개까지 만들 수 있어요.";
    if (normalizedSections.some((section) => section.length > 30)) return "섹션 이름은 30자 이내여야 해요.";

    const unique = new Set(normalizedSections.map((section) => section.toLocaleLowerCase("ko-KR")));
    if (unique.size !== normalizedSections.length) return "같은 이름의 섹션을 두 번 사용할 수 없어요.";

    return null;
  }

  async function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isOwner || saving) return;

    setMessage("");
    setErrorMessage("");

    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const normalizedSections = sections.map((section) => section.trim()).filter(Boolean);

    setSaving(true);

    const { error } = await supabase
      .from("universes")
      .update({
        name: name.trim(),
        parent_slug: parentSlug || null,
        description: description.trim(),
        icon: icon.trim(),
        visibility,
        allow_member_posts: allowMemberPosts,
        allow_comments: allowComments,
        rules: rules.trim(),
        sections: normalizedSections,
        updated_at: new Date().toISOString(),
      })
      .eq("slug", slug);

    if (error) {
      console.error("Universe settings update failed:", error);
      setErrorMessage(["P0001", "23503", "23514"].includes(error.code || "")
        ? "소속을 변경할 수 없어요. 같은 소유자의 최상위 유니버스만 선택할 수 있어요."
        : (error.message || "설정을 저장하지 못했어요."));
    } else {
      setSections(normalizedSections);
      setMessage("Universe 설정을 저장했어요.");
    }

    setSaving(false);
  }

  async function moderateUniverse(action: "hide" | "remove" | "restore") {
    if (!isOwner || moderating) return;
    if (action === "hide" && !isOperator) return;
    if (action === "restore" && !isOperator) return;
    const label = action === "hide" ? "숨기기" : action === "remove" ? "삭제" : "복구";
    if (!window.confirm(`이 Universe를 정말 ${label}할까요? ${action === "remove" ? "게시글은 보존되며 운영자가 복구할 수 있습니다." : "변경사항은 즉시 적용됩니다."}`)) return;
    setModerating(true);
    setErrorMessage("");
    setMessage("");
    const nextStatus = action === "hide" ? "hidden" : action === "remove" ? "removed" : "active";
    const { data, error } = await supabase.from("universes")
      .update({ moderation_status: nextStatus, moderation_reason: action === "restore" ? null : moderationReason.trim() || null })
      .eq("slug", slug).select("moderation_status").maybeSingle();
    if (error || !data) {
      setErrorMessage(error?.message || "상태를 변경할 권한이 없거나 유니버스를 찾을 수 없어요.");
    } else {
      setModerationStatus(data.moderation_status as "active" | "hidden" | "removed");
      setModerationReason("");
      setMessage(`Universe를 ${label}했어요. 변경 내용은 기록됩니다.`);
      if (action === "remove" && !isOperator) window.location.assign("/universe");
    }
    setModerating(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-[#03050a] sm:px-6">
        <div className="mx-auto max-w-3xl animate-pulse space-y-5">
          <div className="h-5 w-32 rounded bg-slate-200 dark:bg-white/10" />
          <div className="h-20 rounded-xl bg-slate-200 dark:bg-white/10" />
          <div className="h-96 rounded-xl bg-slate-200 dark:bg-white/10" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 dark:bg-[#03050a] dark:text-white sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-3xl">
        <Link href={universeHref} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950 dark:text-white/70 dark:hover:text-white">
          <ArrowLeft className="size-4" />
          Universe로 돌아가기
        </Link>

        <header className="mt-8 border-b border-slate-200 pb-6 dark:border-white/10">
          <p className="text-sm font-semibold text-slate-500">{slug}</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">Universe 설정</h1>
          {isOperator && <p className="mt-2 text-xs font-bold text-violet-600">운영자 공동 소유권 · 실제 제작자 기록은 유지됩니다.</p>}
          {moderationStatus !== "active" && <p className="mt-2 text-sm font-bold text-rose-600">현재 상태: {moderationStatus === "hidden" ? "운영자 숨김" : "삭제됨 · 복구 가능"}</p>}
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-white/55">
            기본 정보, 게시 권한, 댓글, 섹션과 규칙을 한 곳에서 관리합니다.
          </p>
        </header>

        {!isOwner ? (
          <section className="py-10">
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm font-semibold text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
              {errorMessage || "이 Universe의 설정을 변경할 권한이 없어요."}
            </div>
          </section>
        ) : (
          <form onSubmit={saveSettings} className="divide-y divide-slate-200 dark:divide-white/10">
            <section className="py-8">
              <h2 className="text-lg font-black">기본 정보</h2>
              <p className="mt-1 text-sm text-slate-500">Universe에서 가장 먼저 보이는 정보입니다.</p>

              <div className="mt-6 space-y-5">
                <label className="block">
                  <span className="text-sm font-bold">이름</span>
                  <input value={name} onChange={(event) => setName(event.target.value)} maxLength={60} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400 dark:border-white/10 dark:bg-white/[0.03]" />
                </label>

                <label className="block">
                  <span className="text-sm font-bold">설명</span>
                  <textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={280} rows={4} className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-slate-400 dark:border-white/10 dark:bg-white/[0.03]" />
                  <span className="mt-1 block text-right text-xs text-slate-400">{description.length}/280</span>
                </label>

                <label className="block">
                  <span className="text-sm font-bold">아이콘</span>
                  <input value={icon} onChange={(event) => setIcon(event.target.value)} maxLength={16} placeholder="예: 🌌" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-white/[0.03] sm:max-w-40" />
                </label>
              </div>
            </section>

            <section className="py-8">
              <h2 className="text-lg font-black">소속 유니버스</h2>
              <p className="mt-1 text-sm text-slate-500">기존 유니버스를 다른 유니버스의 행성으로 옮기거나 독립시킬 수 있어요. 게시글과 주소는 유지됩니다.</p>
              <label className="mt-5 block">
                <span className="text-sm font-bold">상위 유니버스</span>
                <select value={parentSlug} onChange={(event) => setParentSlug(event.target.value)} disabled={hasChildren} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm disabled:opacity-60 dark:border-white/10 dark:bg-[#080a10]">
                  <option value="">없음 · 독립 유니버스</option>
                  {parentOptions.map((option) => <option key={option.slug} value={option.slug}>{option.name}</option>)}
                </select>
              </label>
              {hasChildren
                ? <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">이 유니버스에는 소속 행성이 있어요. 행성을 먼저 이동하거나 독립시켜야 합니다.</p>
                : <p className="mt-2 text-xs text-slate-500">본인이 소유한 최상위 유니버스만 선택할 수 있어요. 소속은 한 단계까지만 지원합니다.</p>}
            </section>

            <section className="py-8">
              <h2 className="text-lg font-black">공개 범위와 게시 권한</h2>
              <div className="mt-5 space-y-4">
                <label className="block">
                  <span className="text-sm font-bold">공개 범위</span>
                  <select value={visibility} onChange={(event) => setVisibility(event.target.value as "public" | "private")} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-[#080a10]">
                    <option value="public">공개</option>
                    <option value="private">비공개 · 소유자만</option>
                  </select>
                </label>

                <ToggleRow label="멤버 글쓰기 허용" description="켜면 Universe 소유자가 아닌 로그인 사용자도 글을 작성할 수 있어요." checked={allowMemberPosts} onChange={setAllowMemberPosts} />
                <ToggleRow label="댓글 허용" description="끄면 이 Universe의 게시글에 새 댓글을 작성할 수 없어요." checked={allowComments} onChange={setAllowComments} />
              </div>
            </section>

            <section className="py-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black">섹션 관리</h2>
                  <p className="mt-1 text-sm text-slate-500">1~8개의 게시판 섹션을 사용할 수 있어요.</p>
                </div>
                <button type="button" onClick={addSection} disabled={sections.length >= 8} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold disabled:opacity-50 dark:border-white/10">
                  <Plus className="size-3.5" />
                  추가
                </button>
              </div>

              <div className="mt-5 space-y-2">
                {sections.map((section, index) => (
                  <div key={index} className="flex gap-2">
                    <input value={section} onChange={(event) => updateSection(index, event.target.value)} maxLength={30} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-white/[0.03]" />
                    <button type="button" onClick={() => removeSection(index)} disabled={sections.length <= 1} aria-label="섹션 삭제" className="grid size-11 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 disabled:opacity-40 dark:border-white/10">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="py-8">
              <h2 className="text-lg font-black">규칙</h2>
              <textarea value={rules} onChange={(event) => setRules(event.target.value)} maxLength={2000} rows={6} placeholder="이 Universe에서 지켜야 할 규칙을 적어 주세요." className="mt-4 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none dark:border-white/10 dark:bg-white/[0.03]" />
              <span className="mt-1 block text-right text-xs text-slate-400">{rules.length}/2000</span>
            </section>

            <section className="py-8">
              <div className="flex items-start gap-3">
                <ShieldAlert className="mt-0.5 size-5 shrink-0 text-slate-500" />
                <div>
                  <h2 className="text-lg font-black">위험 영역</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    삭제는 복구 가능한 상태 변경으로 처리합니다. 게시글과 실제 제작자 기록은 보존되고, 활동은 노출되지 않습니다.
                  </p>
                  <p className="mt-2 text-xs text-slate-500">소속 행성이 있다면 부모 유니버스의 제재 상태에 따라 함께 숨겨집니다.</p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <label className="block text-sm font-semibold">관리 사유 (선택, 최대 500자)
                  <textarea value={moderationReason} onChange={(event) => setModerationReason(event.target.value)} maxLength={500} rows={2} placeholder="규칙 위반, 제작자 요청 등" className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-white/10 dark:bg-white/[0.03]" />
                </label>
                <div className="flex flex-wrap gap-2">
                  {isOperator && moderationStatus === "active" && <button type="button" disabled={moderating} onClick={() => moderateUniverse("hide")} className="rounded-xl border border-amber-300 px-4 py-2 text-sm font-bold text-amber-700 disabled:opacity-50">유니버스 숨기기</button>}
                  {moderationStatus !== "removed" && <button type="button" disabled={moderating} onClick={() => moderateUniverse("remove")} className="rounded-xl border border-rose-300 px-4 py-2 text-sm font-bold text-rose-700 disabled:opacity-50">유니버스 삭제</button>}
                  {isOperator && moderationStatus !== "active" && <button type="button" disabled={moderating} onClick={() => moderateUniverse("restore")} className="rounded-xl border border-emerald-300 px-4 py-2 text-sm font-bold text-emerald-700 disabled:opacity-50">유니버스 복구</button>}
                </div>
              </div>
            </section>

            {(errorMessage || message) && (
              <div className="py-5">
                <p className={`rounded-xl border px-4 py-3 text-sm font-semibold ${errorMessage ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200" : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"}`}>
                  {errorMessage || message}
                </p>
              </div>
            )}

            <div className="sticky bottom-3 z-10 flex flex-col-reverse gap-2 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur dark:border-white/10 dark:bg-[#080a10]/95 sm:flex-row sm:justify-end">
              <Link href={universeHref} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-bold dark:border-white/10">
                취소
              </Link>
              <button type="submit" disabled={saving} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white disabled:opacity-60 dark:bg-white dark:text-slate-950">
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                {saving ? "저장 중..." : "변경사항 저장"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-4 dark:border-white/10 dark:bg-white/[0.03]">
      <div>
        <p className="text-sm font-bold">{label}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 size-4" />
    </label>
  );
}
