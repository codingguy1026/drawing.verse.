import type { Match, MatchState, Sport } from "./types";
// Fictional, fixed snapshots; never blended into the production feed.
export function demoMatches(now = Date.now()): Match[] {
  const states: MatchState[] = [
    { kind: "baseball", inning: 7, half: "bottom", balls: 2, strikes: 1, outs: 1, bases: [true, false, true], pitcher: "김투수 (예시)", batter: "이타자 (예시)", lastAtBat: "좌전 안타 · 주자 1, 3루" },
    { kind: "football", clock: "후반 67:24", scorers: ["23′ 김공격 · 홈", "51′ 이공격 · 원정", "64′ 박공격 · 홈"], cards: ["38′ 김수비 · 경고"], substitutions: ["61′ 정선수 OUT → 최선수 IN"] },
    { kind: "basketball", quarter: "3쿼터", remaining: "04:32", fouls: [3, 2] },
    { kind: "volleyball", set: 3, sets: [1, 1], serving: "home" },
  ];
  return states.map((state, i) => ({
    id: `demo-${state.kind}`, sport: state.kind as Sport, leagueId: i === 0 ? "kbo" : `demo-${state.kind}`, league: "예시 경기 · 실제 기록 아님",
    home: { id: i === 0 ? "hanwha" : "demo-home", name: "오렌지 (예시)", color: "#c2410c" },
    away: { id: i === 0 ? "samsung" : "demo-away", name: "블루 (예시)", color: "#1d4ed8" },
    score: [[4, 3], [2, 1], [68, 65], [18, 16]][i] as [number, number], status: "live", startsAt: new Date(now - 3600000).toISOString(), updatedAt: new Date(now).toISOString(), state,
    events: [{ id: "example-play", label: ["7회 말", "64′", "3Q 04:32", "3세트"][i], text: ["좌전 안타! 주자 1, 3루.", "박공격 득점! 홈팀이 앞서갑니다.", "3점슛 성공! 68 : 65", "블로킹 득점! 18 : 16"][i], major: true }],
  }));
}
