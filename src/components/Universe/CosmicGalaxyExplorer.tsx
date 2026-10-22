"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, Compass, Orbit, Search, Sparkles, Users, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { UniverseItem } from "./universe.types";

type StellarSystem = {
  id: number | string;
  universe_slug: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  accent: string;
};

type Focus =
  | { level: "galaxy" }
  | { level: "universe"; universe: UniverseItem }
  | { level: "system"; universe: UniverseItem; system: StellarSystem };

const palette = ["#8a61dd", "#ef5d68", "#6d9fd3", "#c78c46", "#48a6a1", "#a679d2"];
function hash(value: string) {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0;
  return h;
}
function accent(value: string) { return palette[hash(value) % palette.length]; }

export default function CosmicGalaxyExplorer({ items = [] }: { items?: UniverseItem[] }) {
  const [focus, setFocus] = useState<Focus>({ level: "galaxy" });
  const [systems, setSystems] = useState<StellarSystem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");

  const selectedSlug = focus.level === "galaxy" ? null : focus.universe.slug;
  useEffect(() => {
    if (!selectedSlug) return;
    let active = true;
    setSystems([]);
    setError(false);
    setLoading(true);
    void (async () => {
      try {
        const { data, error: requestError } = await supabase
          .from("stellar_systems")
          .select("id,universe_slug,slug,name,description,icon,accent")
          .eq("universe_slug", selectedSlug)
          .order("created_at", { ascending: true });
        if (requestError) throw requestError;
        if (active) setSystems((data as StellarSystem[] | null) ?? []);
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [selectedSlug]);

  // Keep selection valid when search/filter results change.
  useEffect(() => {
    if (focus.level !== "galaxy" && !items.some(item => item.slug === focus.universe.slug)) {
      setFocus({ level: "galaxy" });
    }
  }, [items, focus]);

  const filtered = items.filter(item =>
    [item.name, item.description, item.category, item.slug]
      .join(" ").toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
  );
  const universe = focus.level === "galaxy" ? null : focus.universe;
  const system = focus.level === "system" ? focus.system : null;
  const back = () => setFocus(focus.level === "system" && universe
    ? { level: "universe", universe }
    : { level: "galaxy" });

  return (
    <section aria-label="Cosmic Galaxy Explorer" className="dv-galaxy-root relative overflow-hidden rounded-[28px] border border-slate-200 bg-white text-slate-900 shadow-[0_20px_60px_rgba(15,23,42,.07)] dark:border-white/10 dark:bg-[#0d101b] dark:text-white">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-5 dark:border-white/10 sm:px-7">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-[#8a61dd]"><Sparkles className="size-4"/> Drawing Verse / Cosmic Explorer</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
            {system ? system.name : universe ? universe.name : "우주 탐험 지도"}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {system ? "항성계 상세 정보" : universe ? "이 우주에 속한 항성계를 탐험해 보세요." : `${items.length}개의 유니버스를 탐험할 수 있어요.`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {focus.level !== "galaxy" && <button type="button" onClick={back} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-bold hover:bg-slate-50 dark:border-white/15 dark:hover:bg-white/10"><ArrowLeft className="size-4"/> 뒤로</button>}
          <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-2 text-xs font-black text-violet-700 dark:bg-violet-500/15 dark:text-violet-200"><Compass className="size-4"/> Galaxy Map</span>
        </div>
      </header>

      <div className="dv-galaxy-layout min-h-[480px]">
        <div className="dv-galaxy-stage relative min-w-0 overflow-hidden bg-[radial-gradient(ellipse_at_50%_40%,#eee8ff_0%,#f8f7ff_48%,#fff_100%)] p-5 dark:bg-[radial-gradient(ellipse_at_50%_40%,#30234c_0%,#131426_50%,#0b0d16_100%)] sm:p-8">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-50" style={{ backgroundImage: "radial-gradient(#b8a7fa 1px, transparent 1px)", backgroundSize: "30px 30px" }}/>
          <div className="relative">
            <div className="mb-6 flex items-center justify-between gap-3">
              <span className="text-xs font-black uppercase tracking-[.15em] text-slate-500 dark:text-slate-300">
                {focus.level === "galaxy" ? "Universe constellation" : focus.level === "universe" ? "Stellar systems" : "System overview"}
              </span>
              <span className="rounded-full border border-violet-200 bg-white/80 px-3 py-1 text-xs font-bold text-violet-700 dark:border-violet-400/20 dark:bg-white/10 dark:text-violet-200">
                {focus.level === "galaxy" ? filtered.length : focus.level === "universe" ? systems.length : 1} objects
              </span>
            </div>
            {focus.level === "galaxy" ? (
              <>
                <label className="mb-6 flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-[#151625]">
                  <Search className="size-4 text-slate-400"/>
                  <span className="sr-only">지도에서 유니버스 검색</span>
                  <input className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="지도에서 우주 찾기" value={query} onChange={event => setQuery(event.target.value)}/>
                  {query && <button type="button" onClick={() => setQuery("")} aria-label="검색 초기화"><X className="size-4"/></button>}
                </label>
                {filtered.length ? <div className="dv-galaxy-planet-grid grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                  {filtered.map(item => <button key={item.id} type="button" onClick={() => setFocus({ level: "universe", universe: item })} className="group flex min-w-0 flex-col items-center gap-3 rounded-2xl border border-violet-100/80 bg-white/70 px-3 py-6 text-center transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-violet-500 dark:border-white/10 dark:bg-white/[.06]">
                    <span className="grid size-16 place-items-center rounded-full border-2 border-white/70 text-2xl shadow-[inset_-12px_-10px_20px_#0002,0_10px_24px_#0002] transition group-hover:scale-105 sm:size-20" style={{background:`radial-gradient(circle at 30% 25%, #fff, ${accent(item.slug)} 52%, #22213b)`}} aria-hidden="true">{(item as UniverseItem & {icon?: string}).icon || "✦"}</span>
                    <span className="w-full truncate text-sm font-black">{item.name}</span>
                    <span className="max-w-full truncate text-[11px] text-slate-500 dark:text-slate-400">{item.category || "Universe"}</span>
                  </button>)}
                </div> : <div className="rounded-2xl border border-dashed border-violet-200 bg-white/60 p-10 text-center text-sm text-slate-500 dark:border-white/15 dark:bg-white/5">일치하는 유니버스가 없어요.</div>}
              </>
            ) : focus.level === "universe" ? (
              <div className="flex flex-col items-center">
                <div className="mb-6 grid size-24 place-items-center rounded-full border-4 border-white/80 text-3xl shadow-xl" style={{background:`radial-gradient(circle at 30% 25%, #fff, ${accent(focus.universe.slug)} 52%, #22213b)`}}><Orbit className="size-10 text-white"/></div>
                <h3 className="mb-5 text-center text-xl font-black">{focus.universe.name}</h3>
                {loading ? <p className="py-10 text-sm text-slate-500" role="status">항성계를 불러오는 중...</p> : error ? <p className="py-10 text-sm text-rose-600" role="alert">항성계 정보를 불러오지 못했어요.</p> : systems.length ? (
                  <div className="dv-galaxy-system-grid grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
                    {systems.map(s => <button key={s.id} type="button" onClick={() => setFocus({ level: "system", universe: focus.universe, system: s })} className="flex min-w-0 flex-col items-center gap-3 rounded-2xl border border-violet-100 bg-white/80 p-5 text-center transition hover:border-violet-300 hover:shadow-md dark:border-white/10 dark:bg-white/5">
                      <span className="grid size-14 place-items-center rounded-full text-2xl shadow-md" style={{background:`radial-gradient(circle at 30% 25%, #fff, ${s.accent || "#b89cff"} 65%, #29213a)`}}>{s.icon || "✦"}</span>
                      <span className="w-full truncate text-xs font-black">{s.name}</span>
                    </button>)}
                  </div>
                ) : <p className="rounded-2xl border border-dashed border-violet-200 bg-white/70 px-6 py-8 text-center text-sm text-slate-500 dark:border-white/15 dark:bg-white/5">아직 생성된 항성계가 없어요.</p>}
              </div>
            ) : (
              <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
                <div className="grid size-28 place-items-center rounded-full border-4 border-white/70 text-5xl shadow-xl" style={{background:`radial-gradient(circle at 30% 25%, #fff, ${focus.system.accent || "#b89cff"} 60%, #29213a)`}}>{focus.system.icon || "✦"}</div>
                <h3 className="mt-6 text-2xl font-black">{focus.system.name}</h3>
                <p className="mt-3 max-w-md text-sm leading-7 text-slate-600 dark:text-slate-300">{focus.system.description || "이 항성계의 이야기를 만나보세요."}</p>
              </div>
            )}
          </div>
        </div>

        <aside className="dv-galaxy-aside flex min-w-0 flex-col gap-5 border-t border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#10121c] lg:border-l lg:border-t-0 sm:p-7">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#8a61dd]">Explorer details</p>
            <h3 className="mt-2 text-xl font-black">{system ? system.name : universe ? universe.name : "탐험 안내"}</h3>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-300">
              {system ? system.description || "이 항성계의 이야기를 만나보세요." : universe ? universe.description || "아직 소개글이 없어요." : "행성을 선택하면 유니버스의 정보와 항성계를 탐색할 수 있어요. 원하는 세계를 선택해 보세요."}
            </p>
          </div>
          {universe && <div className="flex items-center gap-4 border-y border-slate-100 py-4 text-xs font-bold text-slate-500 dark:border-white/10">
            <span className="inline-flex items-center gap-1.5"><Users className="size-4"/> {universe.subscribers ?? 0} 구독</span>
            <span className="inline-flex items-center gap-1.5"><Orbit className="size-4"/> {universe.posts ?? 0} 게시글</span>
          </div>}
          <div className="mt-auto space-y-3">
            {system && universe ? <Link className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-violet-700 dark:bg-white dark:text-slate-950" href={`/universe/${encodeURIComponent(universe.slug)}/system/${encodeURIComponent(system.slug)}`}>항성계 입장 <ArrowUpRight className="size-4"/></Link>
              : universe ? <Link className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-violet-700 dark:bg-white dark:text-slate-950" href={`/universe/${encodeURIComponent(universe.slug)}`}>Universe 입장 <ArrowUpRight className="size-4"/></Link>
              : <p className="rounded-xl bg-violet-50 p-4 text-xs leading-6 text-violet-700 dark:bg-violet-500/10 dark:text-violet-200">실제 Drawing Verse 유니버스 데이터를 표시하고 있어요.</p>}
            {focus.level !== "galaxy" && <button type="button" onClick={() => setFocus({ level: "galaxy" })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold hover:bg-slate-50 dark:border-white/15 dark:hover:bg-white/10">전체 우주 보기</button>}
          </div>
        </aside>
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-5 py-3 text-[11px] font-semibold text-slate-500 dark:border-white/10 dark:text-slate-400 sm:px-7">
        <span>GALAXY → UNIVERSE → STELLAR SYSTEM</span>
        <span>Drawing Verse · Explore your worlds</span>
      </footer>
    </section>
  );
}
