"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Orbit, Sparkles, Sun } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function CreateStellarSystemPage() {
  const params = useParams<{ slug: string }>();
  const universeSlug = params.slug;
  const router = useRouter();
  const [universeName, setUniverseName] = useState(universeSlug);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("☀️");
  const [accent, setAccent] = useState("#f59e0b");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.from("universes").select("name").eq("slug", universeSlug).maybeSingle()
      .then(({ data }) => data?.name && setUniverseName(data.name));
  }, [universeSlug]);

  function updateName(value: string) {
    setName(value);
    setSlug(value.toLowerCase().trim().replace(/[^a-z0-9가-힣\s-]/g, "").replace(/[가-힣]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""));
  }

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    const res = await fetch("/api/stellar-systems", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ universe_slug: universeSlug, name, slug, description, icon, accent }),
    });
    const result = await res.json();
    if (!res.ok) { setError(result.error ?? "항성계를 만들지 못했어요."); setBusy(false); return; }
    router.push(`/universe/${encodeURIComponent(universeSlug)}/system/${encodeURIComponent(result.slug)}`);
  }

  return <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 dark:bg-[#03050a] dark:text-white sm:px-6">
    <div className="mx-auto max-w-3xl">
      <Link href={`/universe/${encodeURIComponent(universeSlug)}`} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500"><ArrowLeft className="size-4"/> {universeName}</Link>
      <section className="mt-5 overflow-hidden rounded-[2rem] border border-amber-200/70 bg-white p-6 shadow-xl shadow-amber-100/30 dark:border-amber-300/10 dark:bg-white/[0.04] dark:shadow-none sm:p-9">
        <div className="flex items-center gap-4"><div className="grid size-14 place-items-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-400/10"><Sun className="size-7"/></div><div><p className="text-xs font-black uppercase tracking-[.24em] text-amber-500">Stellar Genesis</p><h1 className="mt-1 text-3xl font-black">새 항성계 만들기</h1></div></div>
        <p className="mt-4 text-sm leading-6 text-slate-500">Universe 안의 주제와 커뮤니티를 하나의 항성계로 묶어보세요. 행성들이 모여 하나의 작은 세계를 이루는 자리예요.</p>
        <form onSubmit={submit} className="mt-8 space-y-5">
          <div className="grid gap-4 sm:grid-cols-[100px_1fr]"><label className="block"><span className="text-xs font-black text-slate-500">아이콘</span><input value={icon} onChange={e=>setIcon(e.target.value)} maxLength={16} className="mt-2 w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-center text-2xl dark:border-white/10"/></label><label className="block"><span className="text-xs font-black text-slate-500">항성계 이름</span><input required value={name} onChange={e=>updateName(e.target.value)} maxLength={60} placeholder="예: KBO League" className="mt-2 w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 font-bold dark:border-white/10"/></label></div>
          <label className="block"><span className="text-xs font-black text-slate-500">주소</span><div className="mt-2 flex items-center rounded-2xl border border-slate-200 px-4 dark:border-white/10"><span className="text-xs text-slate-400">system/</span><input required value={slug} onChange={e=>setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,""))} placeholder="kbo-league" className="min-w-0 flex-1 bg-transparent px-1 py-3 font-mono text-sm outline-none"/></div></label>
          <label className="block"><span className="text-xs font-black text-slate-500">설명</span><textarea value={description} onChange={e=>setDescription(e.target.value)} maxLength={280} rows={4} className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-transparent px-4 py-3 dark:border-white/10" placeholder="이 항성계에는 어떤 세계들이 모이나요?"/></label>
          <label className="block"><span className="text-xs font-black text-slate-500">항성 색</span><div className="mt-2 flex items-center gap-3"><input type="color" value={accent} onChange={e=>setAccent(e.target.value)} className="h-11 w-16 rounded-xl border-0 bg-transparent"/><span className="font-mono text-sm text-slate-500">{accent}</span></div></label>
          {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">{error}</p>}
          <button disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3.5 font-black text-white shadow-lg shadow-amber-500/20 disabled:opacity-50"><Sparkles className="size-4"/>{busy ? "항성 점화 중..." : "항성계 점화하기"}</button>
        </form>
      </section>
    </div>
  </main>;
}
