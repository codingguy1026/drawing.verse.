"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type RecentUniverse = { id: string | number; slug: string; name: string; description: string | null };

export default function RecentUniverseCards() {
  const [items, setItems] = useState<RecentUniverse[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;
    async function load() {
      const { data, error } = await supabase
        .from("universes")
        .select("id, slug, name, description")
        .order("created_at", { ascending: false })
        .limit(3);
      if (!active) return;
      if (error) {
        setStatus("error");
        return;
      }
      setItems((data ?? []).filter((item) => Boolean(item.slug)));
      setStatus("ready");
    }
    void load();
    return () => { active = false; };
  }, []);

  if (status === "loading") return <p role="status" className="text-sm text-slate-500">최근 세계관을 불러오는 중…</p>;
  if (status === "error") return <p role="alert" className="text-sm text-slate-500">목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>;
  if (items.length === 0) return <p className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">아직 등록된 세계관이 없습니다.</p>;

  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
    {items.map((item) => <Link key={item.id} href={`/universe/${encodeURIComponent(item.slug)}`}
      className="min-w-0 rounded-xl border border-slate-200 p-4 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-slate-700 dark:hover:bg-slate-800">
      <h3 className="truncate font-semibold">{item.name}</h3>
      <p className="mt-2 line-clamp-3 text-sm text-slate-500 dark:text-slate-400">{item.description || "소개가 아직 없습니다."}</p>
    </Link>)}
  </div>;
}
