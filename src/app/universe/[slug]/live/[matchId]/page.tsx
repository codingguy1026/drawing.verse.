import Link from "next/link";
import SportsPanel from "@/components/Sports/SportsPanel";
import { resolveSportsConfig } from "@/lib/sports/config";
import type { Sport } from "@/lib/sports/types";

export default async function LivePage({ params, searchParams }: {
  params: Promise<{ slug: string; matchId: string }>;
  searchParams: Promise<{ demo?: string; sport?: string }>;
}) {
  const { slug, matchId } = await params;
  const query = await searchParams;
  const kind = ["baseball", "football", "basketball", "volleyball", "other"].includes(query.sport ?? "") ? query.sport as Sport : undefined;
  const config = resolveSportsConfig(slug) ?? { ...resolveSportsConfig("sports")!, slug, sport: kind };
  return <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6">
    <Link href={`/universe/${encodeURIComponent(slug)}`} className="text-sm font-bold text-violet-600 dark:text-violet-300">← 유니버스로 돌아가기</Link>
    <h1 className="mt-6 text-2xl font-black sm:text-3xl">{config.tagline}</h1>
    <SportsPanel key={`${slug}:${matchId}:${query.demo}`} config={config} matchId={matchId} initialDemo={query.demo === "1"}/>
  </main>;
}
