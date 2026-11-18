"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { useSportsFeed } from "@/components/Sports/useSportsFeed";
import { resolveSportsConfig } from "@/lib/sports/config";
import { isActive, isStale, matchesScope, progress, statusLabels } from "@/lib/sports/model";
import type { Match } from "@/lib/sports/types";

const kbo = resolveSportsConfig("kbo")!;
const scheduleTime = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hourCycle: "h23",
});

function fixtureOrder(match: Match) {
  if (isActive(match)) return 0;
  return match.status === "scheduled" ? 1 : 2;
}

function compareFixtures(first: Match, second: Match) {
  const firstOrder = fixtureOrder(first);
  const order = firstOrder - fixtureOrder(second);
  if (order !== 0) return order;
  const time = Date.parse(first.startsAt) - Date.parse(second.startsAt);
  return firstOrder === 2 ? -time : time;
}

export default function KboMatchList() {
  const { feed, error, now, retry } = useSportsFeed(false);
  const matches = useMemo(
    () => (feed?.matches ?? []).filter((match) => matchesScope(match, kbo)).sort(compareFixtures),
    [feed],
  );

  return (
    <section aria-labelledby="kbo-heading" className="space-y-3">
      <h2 id="kbo-heading" className="text-xl font-bold">KBO 경기 일정 및 결과</h2>
      {!feed && !error && <p role="status" className="text-sm text-slate-600 dark:text-slate-300">경기 정보를 불러오는 중이에요.</p>}
      {error && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <p role="status">{matches.length > 0 ? "마지막으로 받은 경기 정보를 표시하고 있어요." : "경기 정보를 가져오지 못했어요."}</p>
          <button type="button" onClick={retry} className="min-h-11 rounded-lg border border-slate-300 px-3 font-bold dark:border-slate-600">
            다시 시도
          </button>
        </div>
      )}
      {!error && feed?.mode === "unconfigured" && <p className="text-sm text-slate-600 dark:text-slate-300">경기 데이터 연결을 준비 중이에요.</p>}
      {!error && feed?.mode === "live" && matches.length === 0 && <p className="text-sm text-slate-600 dark:text-slate-300">표시할 KBO 경기가 없어요.</p>}
      {matches.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {matches.map((match) => {
            const active = isActive(match);
            const stale = active && (error || isStale(match, now));
            const score = active || match.status === "final" ? match.score.join(" : ") : "VS";

            return (
              <li key={match.id} className="min-w-0">
                <Link
                  href={`/sports/${encodeURIComponent(match.id)}`}
                  className="grid h-full gap-3 rounded-xl border border-slate-200 bg-white p-4 text-slate-900 transition-colors hover:border-orange-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-orange-400"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <time dateTime={match.startsAt}>{scheduleTime.format(new Date(match.startsAt))} KST</time>
                    <span className="font-semibold">{stale ? "업데이트 지연" : statusLabels[match.status]}</span>
                  </div>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 font-bold">
                    <span className="break-words">{match.home.name}</span>
                    <span className="font-mono tabular-nums">{score}</span>
                    <span className="break-words text-right">{match.away.name}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <span>{active ? progress(match) : "경기 상세"}</span>
                    <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
