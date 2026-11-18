import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SportsPanel from "@/components/Sports/SportsPanel";
import { resolveSportsConfig } from "@/lib/sports/config";
import { demoBaseballMatchId } from "@/lib/sports/demo";

export const metadata: Metadata = { title: "KBO 경기 상세 | Drawing Verse" };

export default async function KboMatchPage({ params, searchParams }: {
  params: Promise<{ matchId: string }>;
  searchParams: Promise<{ demo?: string | string[] }>;
}) {
  const [{ matchId }, { demo }] = await Promise.all([params, searchParams]);
  const showDemo = matchId === demoBaseballMatchId && demo === "1";

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <Link href="/sports" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" />
        경기 목록
      </Link>
      <h1 className="mt-2 text-3xl font-black tracking-tight">{showDemo ? "KBO 예시 경기" : "KBO 경기 상세"}</h1>
      <SportsPanel
        key={`${matchId}:${showDemo}`}
        config={resolveSportsConfig("kbo")!}
        matchId={matchId}
        initialDemo={showDemo}
        highlightsOnly
      />
    </main>
  );
}
