import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { demoBaseballMatchId, demoMatches } from "@/lib/sports/demo";
import { progress } from "@/lib/sports/model";
import KboMatchList from "./KboMatchList";

export const metadata: Metadata = {
  title: "스포츠 경기 관제실 | Drawing Verse",
  description: "KBO 경기 일정과 결과, 이닝별 주요 장면을 살펴보세요.",
};

export default function SportsPage() {
  const example = demoMatches().find((match) => match.id === demoBaseballMatchId)!;
  const highlightCount = example.events.filter((event) => event.major).length;

  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
      <header className="space-y-2 border-b border-slate-200 pb-5 dark:border-slate-800">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">스포츠 경기 관제실</h1>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
          KBO 경기 일정과 결과를 보고, 경기 상세에서 이닝과 주요 장면을 확인해요.
        </p>
      </header>

      <KboMatchList />

      <section aria-labelledby="sample-heading" className="grid gap-3">
        <h2 id="sample-heading" className="text-xl font-bold">예시 경기</h2>
        <Link
          href={`/sports/${example.id}?demo=1`}
          className="flex min-h-16 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 text-slate-900 transition-colors hover:border-orange-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-orange-400"
        >
          <span className="grid gap-1">
            <strong>{example.home.name} 대 {example.away.name} 경기 보기</strong>
            <span className="text-sm text-slate-600 dark:text-slate-300">가상 경기 · {progress(example)} · 주요 장면 {highlightCount}개</span>
          </span>
          <ArrowRight className="size-5 shrink-0" aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
}
