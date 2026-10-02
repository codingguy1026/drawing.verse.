"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Compass, Orbit, Rocket, Sparkles, Star, Sun, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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

const TAU = Math.PI * 2;
const accents = ["#b89cff", "#ff7a7a", "#67e8f9", "#fbbf24", "#86efac", "#f0abfc", "#93c5fd"];

function hash(input: string) {
  let value = 0;
  for (let i = 0; i < input.length; i++) value = (value * 31 + input.charCodeAt(i)) >>> 0;
  return value;
}

function seededPoint(item: UniverseItem, index: number, total: number) {
  const h = hash(item.slug || item.id);
  // Keep small galaxies deliberately readable: 1-6 universes get evenly spaced,
  // guaranteed in-frame positions instead of hash-dependent clustering.
  const safeTotal = Math.max(total, 1);
  const angle = -Math.PI / 2 + (index / safeTotal) * TAU + ((h % 17) - 8) * 0.012;
  const radius = safeTotal <= 2 ? 28 : safeTotal <= 6 ? 34 : 38 + (index % 2) * 5;
  return {
    x: 50 + Math.cos(angle) * radius,
    y: 50 + Math.sin(angle) * radius * 0.68,
    size: 66 + (h % 24),
    accent: accents[h % accents.length],
  };
}

function Stars() {
  const dots = useMemo(() => Array.from({ length: 110 }, (_, i) => ({
    left: `${(i * 47 + 11) % 101}%`,
    top: `${(i * 73 + 7) % 100}%`,
    size: i % 11 === 0 ? 2 : 1,
    opacity: .18 + ((i * 17) % 55) / 100,
  })), []);
  return <div className="pointer-events-none absolute inset-0 overflow-hidden">{dots.map((dot,i)=><i key={i} className="absolute rounded-full bg-white" style={{left:dot.left,top:dot.top,width:dot.size,height:dot.size,opacity:dot.opacity}}/>)}</div>;
}

function Breadcrumb({ focus, onGalaxy, onUniverse }: { focus: Focus; onGalaxy:()=>void; onUniverse:()=>void }) {
  return <div className="flex min-w-0 items-center gap-2 text-[11px] font-black uppercase tracking-[.18em] text-white/45">
    <button onClick={onGalaxy} className="transition hover:text-white">Drawing Verse</button>
    {focus.level !== "galaxy" && <><span>/</span><button onClick={onUniverse} className="max-w-40 truncate text-violet-200 transition hover:text-white">{focus.universe.name}</button></>}
    {focus.level === "system" && <><span>/</span><span className="max-w-40 truncate text-amber-200">{focus.system.name}</span></>}
  </div>;
}

function GalaxyView({ items, onOpen }: { items: UniverseItem[]; onOpen:(item:UniverseItem)=>void }) {
  return <motion.div key="galaxy" initial={{opacity:0,scale:.82}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:1.18}} transition={{duration:.55,ease:[.2,.8,.2,1]}} className="absolute inset-0">
    <div className="absolute left-1/2 top-1/2 size-[44%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-[80px]"/>
    <div className="absolute left-1/2 top-1/2 size-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-200/15 bg-violet-400/10 shadow-[0_0_90px_rgba(184,156,255,.22)]">
      <div className="absolute inset-[28%] rounded-full bg-white shadow-[0_0_45px_rgba(255,255,255,.8)]"/>
    </div>
    {items.map((item,index)=>{
      const p=seededPoint(item,index,items.length);
      return <button key={item.id} onClick={()=>onOpen(item)} className="group absolute z-40 -translate-x-1/2 -translate-y-1/2 text-left" style={{left:`${p.x}%`,top:`${p.y}%`}}>
        <span className="absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 blur-2xl transition group-hover:opacity-40" style={{background:p.accent}}/>
        <span className="relative grid rounded-full border border-white/20 shadow-2xl transition duration-300 group-hover:scale-110 group-hover:border-white/55" style={{width:p.size,height:p.size,background:`radial-gradient(circle at 34% 28%, #fff, ${p.accent} 34%, #11152c 100%)`}}>
          <span className="m-auto max-w-[70%] truncate text-[10px] font-black text-slate-950">{item.name.slice(0,7)}</span>
        </span>
        <span className="pointer-events-none absolute left-1/2 top-[calc(100%+9px)] w-max max-w-40 -translate-x-1/2 rounded-full border border-white/10 bg-black/70 px-3 py-1.5 text-[10px] font-bold text-white/70 opacity-0 backdrop-blur-xl transition group-hover:opacity-100">{item.name}</span>
      </button>;
    })}
    {items.length===0 && <div className="absolute inset-0 grid place-items-center text-center"><div><Star className="mx-auto size-8 text-violet-300"/><p className="mt-3 font-black">아직 발견된 Universe가 없어요.</p></div></div>}
  </motion.div>;
}

function UniverseView({ universe, systems, onSystem }: { universe:UniverseItem; systems:StellarSystem[]; onSystem:(s:StellarSystem)=>void }) {
  const router=useRouter();
  return <motion.div key={`universe-${universe.slug}`} initial={{opacity:0,scale:1.5}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:.7}} transition={{duration:.55,ease:[.2,.8,.2,1]}} className="absolute inset-0">
    <div className="absolute left-1/2 top-1/2 size-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-200/10"/>
    <div className="absolute left-1/2 top-1/2 size-[48%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/[.07]"/>
    <div className="absolute left-1/2 top-1/2 z-20 flex size-36 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-white via-violet-200 to-violet-500 text-center text-slate-950 shadow-[0_0_100px_rgba(184,156,255,.4)]">
      <Orbit className="size-5"/><strong className="mt-1 max-w-24 truncate text-sm">{universe.name}</strong><span className="mt-1 text-[9px] font-bold opacity-55">UNIVERSE CORE</span>
    </div>
    {systems.map((system,index)=>{
      const angle=(index/Math.max(systems.length,1))*TAU-Math.PI/2;
      const radius=systems.length<=4?31:36;
      const x=50+Math.cos(angle)*radius;
      const y=50+Math.sin(angle)*radius*.72;
      return <button key={system.id} onClick={()=>onSystem(system)} className="group absolute z-30 -translate-x-1/2 -translate-y-1/2" style={{left:`${x}%`,top:`${y}%`}}>
        <span className="absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-2xl transition group-hover:opacity-70" style={{background:system.accent}}/>
        <span className="relative grid size-16 place-items-center rounded-full border border-white/30 text-2xl shadow-xl transition group-hover:scale-110" style={{background:`radial-gradient(circle at 35% 30%, white, ${system.accent} 42%, #18181b)`}}>{system.icon}</span>
        <span className="absolute left-1/2 top-20 w-max max-w-40 -translate-x-1/2 truncate rounded-full bg-black/65 px-3 py-1.5 text-[10px] font-black text-white/75 backdrop-blur-xl">{system.name}</span>
      </button>;
    })}
    {systems.length===0 && <div className="absolute bottom-[15%] left-1/2 z-30 w-[min(90%,430px)] -translate-x-1/2 rounded-3xl border border-dashed border-white/15 bg-black/30 p-5 text-center backdrop-blur-xl"><Sun className="mx-auto size-6 text-amber-300"/><p className="mt-2 font-black">아직 점화된 항성계가 없어요.</p><p className="mt-1 text-xs text-white/45">이 Universe에서 첫 항성계를 만들어 보세요.</p></div>}
    <button onClick={()=>router.push(`/universe/${universe.slug}`)} className="absolute bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-black text-slate-950 shadow-xl"><ArrowUpRight className="size-4"/> Universe 입장</button>
  </motion.div>;
}

function SystemView({ universe, system }: { universe:UniverseItem; system:StellarSystem }) {
  const router=useRouter();
  const planets=universe.tags?.slice(0,5) ?? [];
  return <motion.div key={`system-${system.slug}`} initial={{opacity:0,scale:1.55}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:.72}} transition={{duration:.55,ease:[.2,.8,.2,1]}} className="absolute inset-0">
    {[24,39,55].map((size,i)=><div key={size} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border" style={{width:`${size}%`,aspectRatio:"1",borderColor:`${system.accent}${i===0?"35":"18"}`}}/>)}
    <div className="absolute left-1/2 top-1/2 z-30 grid size-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-5xl shadow-[0_0_100px_rgba(245,158,11,.35)]" style={{background:`radial-gradient(circle at 35% 30%, white, ${system.accent} 44%, #1c1917)`}}>{system.icon}</div>
    {planets.map((planet,index)=>{
      const angle=index/Math.max(planets.length,1)*TAU-.8;
      const radius=22+index*5.2;
      return <div key={planet} className="absolute z-20 -translate-x-1/2 -translate-y-1/2" style={{left:`${50+Math.cos(angle)*radius}%`,top:`${50+Math.sin(angle)*radius*.65}%`}}><div className="size-9 rounded-full border border-white/30 bg-gradient-to-br from-cyan-100 via-violet-300 to-slate-700 shadow-xl"/><span className="absolute left-1/2 top-11 w-max -translate-x-1/2 text-[9px] font-bold text-white/55">{planet}</span></div>
    })}
    <div className="absolute left-1/2 top-[15%] z-40 w-[min(90%,520px)] -translate-x-1/2 text-center"><p className="text-[10px] font-black uppercase tracking-[.3em]" style={{color:system.accent}}>STELLAR SYSTEM</p><h3 className="mt-2 text-3xl font-black">{system.name}</h3><p className="mx-auto mt-2 max-w-md text-xs leading-5 text-white/45">{system.description||`${universe.name} 안에서 빛나는 항성계입니다.`}</p></div>
    <button onClick={()=>router.push(`/universe/${universe.slug}/system/${system.slug}`)} className="absolute bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-black text-slate-950 shadow-xl" style={{background:system.accent}}><Rocket className="size-4"/> 항성계 진입</button>
  </motion.div>;
}

export default function CosmicGalaxyExplorer({ items=[] }: { items?:UniverseItem[] }) {
  const reduced=useReducedMotion();
  const [focus,setFocus]=useState<Focus>({level:"galaxy"});
  const [systems,setSystems]=useState<StellarSystem[]>([]);
  const [loadingSystems,setLoadingSystems]=useState(false);

  useEffect(()=>{
    if(focus.level==="galaxy"){setSystems([]);return;}
    const slug=focus.universe.slug;
    let alive=true;
    setLoadingSystems(true);
    supabase.from("stellar_systems").select("id,universe_slug,slug,name,description,icon,accent").eq("universe_slug",slug).order("created_at",{ascending:true})
      .then(({data})=>{if(alive){setSystems((data as StellarSystem[]|null)??[]);setLoadingSystems(false);}});
    return()=>{alive=false;};
  },[focus.level==="galaxy"?"galaxy":focus.universe.slug]);

  const universe=focus.level==="galaxy"?null:focus.universe;
  const title=focus.level==="galaxy"?"Interverse Galaxy":focus.level==="universe"?focus.universe.name:focus.system.name;
  const subtitle=focus.level==="galaxy"?`${items.length}개의 Universe가 실제 데이터로 빛나는 은하`:focus.level==="universe"?`${systems.length}개의 항성계가 이 Universe 안에서 공전 중`:`${focus.universe.name} · Stellar System`;

  return <section className="relative isolate w-full overflow-hidden rounded-[2.4rem] border border-white/10 bg-[#03040b] text-white shadow-[0_35px_120px_rgba(0,0,0,.42)]">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(128,96,241,.18),transparent_32%),radial-gradient(circle_at_18%_20%,rgba(255,122,122,.11),transparent_25%),radial-gradient(circle_at_82%_78%,rgba(103,232,249,.08),transparent_28%)]"/>
    <Stars/>
    <div className="relative z-[80] flex flex-col gap-4 border-b border-white/[.07] bg-black/55 px-4 py-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="min-w-0"><Breadcrumb focus={focus} onGalaxy={()=>setFocus({level:"galaxy"})} onUniverse={()=>universe&&setFocus({level:"universe",universe})}/><h2 className="mt-2 truncate text-2xl font-black tracking-[-.04em] sm:text-3xl">{title}</h2><p className="mt-1 text-xs text-white/40">{subtitle}</p></div>
      <div className="flex items-center gap-2">{focus.level!=="galaxy"&&<button onClick={()=>focus.level==="system"?setFocus({level:"universe",universe:focus.universe}):setFocus({level:"galaxy"})} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-3 py-2 text-xs font-black text-white/70"><ArrowLeft className="size-4"/> 뒤로</button>}<span className="inline-flex items-center gap-2 rounded-full border border-violet-200/15 bg-violet-300/[.08] px-3 py-2 text-[10px] font-black uppercase tracking-[.16em] text-violet-200"><Compass className="size-3.5"/> Live Map</span></div>
    </div>
    <div className="relative h-[620px] overflow-hidden sm:h-[700px] lg:h-[760px]">
      <AnimatePresence mode="wait" initial={!reduced}>
        {focus.level==="galaxy"&&<GalaxyView items={items} onOpen={item=>setFocus({level:"universe",universe:item})}/>}
        {focus.level==="universe"&&<UniverseView universe={focus.universe} systems={systems} onSystem={system=>setFocus({level:"system",universe:focus.universe,system})}/>}
        {focus.level==="system"&&<SystemView universe={focus.universe} system={focus.system}/>}
      </AnimatePresence>
      {loadingSystems&&focus.level!=="galaxy"&&<div className="absolute inset-0 z-[70] grid place-items-center bg-black/20 backdrop-blur-sm"><motion.div animate={{rotate:360}} transition={{duration:1,repeat:Infinity,ease:"linear"}} className="size-9 rounded-full border-2 border-white/15 border-t-violet-200"/></div>}
    </div>
    <div className="relative z-50 flex flex-wrap items-center justify-between gap-3 border-t border-white/[.07] bg-black/45 px-5 py-3 text-[10px] font-bold text-white/35"><span>GALAXY → UNIVERSE → STELLAR SYSTEM</span><span className="flex items-center gap-1.5"><Sparkles className="size-3"/> 클릭해서 공간을 확대하세요</span></div>
  </section>;
}
