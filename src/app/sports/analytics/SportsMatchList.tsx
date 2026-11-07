"use client";

import { useEffect, useState } from "react";
import type { Match } from "@/lib/sports/types";

type FeedResult = { mode: string; matches: Match[] };
const sportLabels: Record<string, string> = { baseball: "야구", football: "축구", basketball: "농구", volleyball: "배구", other: "기타" };
const statuses: Record<string, string> = { scheduled: "예정", live: "진행 중", break: "휴식", final: "종료", postponed: "연기", cancelled: "취소" };

export default function SportsMatchList() {
  const [result, setResult] = useState<FeedResult | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/sports", { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error("sports feed failed");
        return response.json() as Promise<FeedResult>;
      })
      .then(data => { if (!controller.signal.aborted) setResult(data); })
      .catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, []);

  return (
    <section aria-labelledby="fixtures-heading" className="space-y-4">
      <h2 id="fixtures-heading" className="text-xl font-semibold">경기 일정 및 결과</h2>
      {!result && !error && <p role="status" className="text-sm text-neutral-500">경기 정보를 불러오는 중이에요.</p>}
      {error && <p role="alert" className="text-sm text-neutral-500">경기 정보를 불러오지 못했어요. 잠시 후 다시 확인해 주세요.</p>}
      {result?.mode === "unconfigured" && <p className="text-sm text-neutral-500">스포츠 데이터 제공업체가 아직 설정되지 않았어요.</p>}
      {result?.mode === "demo" && <p className="text-sm text-neutral-500">예시 경기입니다. 실제 결과가 아니에요.</p>}
      {result && result.matches.length === 0 && result.mode !== "unconfigured" && <p className="text-sm text-neutral-500">표시할 경기 정보가 없어요.</p>}
      {result && result.matches.length > 0 && (
        <ul className="grid gap-3">
          {result.matches.slice(0, 20).map(match => (
            <li key={match.id} className="rounded-xl border border-neutral-300/50 p-4 dark:border-neutral-700">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
                <span>{sportLabels[match.sport] ?? "스포츠"} · {match.league}</span>
                <span>{statuses[match.status] ?? match.status}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm font-semibold">
                <span className="min-w-0 flex-1">{match.home.name}</span>
                <span className="shrink-0 tabular-nums">{match.status === "scheduled" ? "VS" : `${match.score[0]} : ${match.score[1]}`}</span>
                <span className="min-w-0 flex-1 text-right">{match.away.name}</span>
              </div>
              <p className="mt-2 text-xs text-neutral-500">
                {new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", dateStyle: "medium", timeStyle: "short" }).format(new Date(match.startsAt))} (한국시간)
              </p>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-neutral-500">제공업체의 갱신 주기에 따라 결과가 지연될 수 있어요. 승리 확률은 검증된 모델이 준비되면 제공할 예정이에요.</p>
    </section>
  );
}
