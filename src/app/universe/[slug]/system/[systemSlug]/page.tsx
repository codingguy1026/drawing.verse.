"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Orbit, Sparkles, Sun } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type SystemRow={id:number|string;universe_slug:string;slug:string;name:string;description:string;icon:string;accent:string;created_at:string};
export default function StellarSystemDetailPage(){
 const {slug,systemSlug}=useParams<{slug:string;systemSlug:string}>();
 const [system,setSystem]=useState<SystemRow|null>(null); const [universeName,setUniverseName]=useState(slug); const [loading,setLoading]=useState(true);
 useEffect(()=>{Promise.all([
  supabase.from("stellar_systems").select("*").eq("universe_slug",slug).eq("slug",systemSlug).maybeSingle(),
  supabase.from("universes").select("name").eq("slug",slug).maybeSingle()
 ]).then(([s,u])=>{setSystem((s.data as SystemRow|null)??null);if(u.data?.name)setUniverseName(u.data.name);setLoading(false);});},[slug,systemSlug]);
 if(loading)return <main className="min-h-screen bg-slate-50 p-8 dark:bg-[#03050a]"><div className="mx-auto h-72 max-w-5xl animate-pulse rounded-[2rem] bg-white dark:bg-white/5"/></main>;
 if(!system)return <main className="min-h-screen bg-slate-50 px-4 py-24 text-center dark:bg-[#03050a] dark:text-white"><Sun className="mx-auto size-10 text-amber-500"/><h1 className="mt-4 text-3xl font-black">이 항성계는 아직 없어요.</h1><Link href={`/universe/${slug}`} className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white dark:bg-white dark:text-slate-950">Universe로 돌아가기</Link></main>;
 return <main className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-8 text-slate-950 dark:bg-[#03050a] dark:text-white sm:px-6">
  <div className="pointer-events-none absolute inset-0" style={{background:`radial-gradient(circle at 70% 18%, ${system.accent}22, transparent 32%)`}}/>
  <div className="relative mx-auto max-w-6xl">
   <Link href={`/universe/${slug}`} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500"><ArrowLeft className="size-4"/> {universeName}</Link>
   <section className="relative mt-5 overflow-hidden rounded-[2.4rem] border border-slate-200 bg-white/85 p-7 shadow-2xl dark:border-white/10 dark:bg-white/[0.04] sm:p-10">
    <div className="absolute right-[-80px] top-[-90px] size-72 rounded-full border opacity-30" style={{borderColor:system.accent}}/><div className="absolute right-10 top-14 size-32 rounded-full border opacity-20" style={{borderColor:system.accent}}/>
    <div className="relative max-w-3xl"><span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black" style={{backgroundColor:`${system.accent}18`,color:system.accent}}><Orbit className="size-3.5"/> STELLAR SYSTEM</span><div className="mt-6 flex items-center gap-5"><div className="grid size-20 shrink-0 place-items-center rounded-full text-4xl shadow-[0_0_50px_rgba(245,158,11,.25)]" style={{background:`radial-gradient(circle at 35% 30%, white, ${system.accent})`}}>{system.icon}</div><div><p className="text-xs font-black uppercase tracking-[.25em] text-slate-400">{universeName}</p><h1 className="mt-1 text-4xl font-black tracking-tight sm:text-5xl">{system.name}</h1></div></div><p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 dark:text-white/55">{system.description||"이 항성계의 첫 행성이 빛나기 시작했습니다."}</p></div>
   </section>
   <section className="mt-7 rounded-[2rem] border border-dashed border-slate-300 p-8 text-center dark:border-white/15"><Sparkles className="mx-auto size-6" style={{color:system.accent}}/><h2 className="mt-3 text-xl font-black">행성 궤도 준비 중</h2><p className="mt-2 text-sm text-slate-500">다음 단계에서 이 항성계 안에 커뮤니티와 행성을 연결할 수 있어요.</p></section>
  </div>
 </main>;
}
