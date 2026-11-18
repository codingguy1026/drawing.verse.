import type { Match, MatchState, Sport } from "./types";

export const demoBaseballMatchId = "demo-baseball";

const baseballHighlights = [
  { id: "example-play", label: "7회 말", text: "좌전 안타로 오렌지의 주자가 1, 3루에 진루합니다.", major: true },
  { id: "example-go-ahead", label: "6회 말", text: "오렌지가 적시 2루타로 4 : 3 역전에 성공합니다.", major: true },
  { id: "example-tying-run", label: "5회 말", text: "오렌지의 희생플라이로 3 : 3 동점이 됩니다.", major: true },
  { id: "example-away-lead", label: "4회 초", text: "블루의 솔로 홈런으로 스코어가 2 : 3이 됩니다.", major: true },
];

const examplePlays = [
  baseballHighlights,
  [{ id: "example-play", label: "64′", text: "박공격 득점! 홈팀이 앞서갑니다.", major: true }],
  [{ id: "example-play", label: "3Q 04:32", text: "3점슛 성공! 68 : 65", major: true }],
  [{ id: "example-play", label: "3세트", text: "블로킹 득점! 18 : 16", major: true }],
];

// Fictional, fixed snapshots; never blended into the production feed.
export function demoMatches(now = Date.now()): Match[] {
  const states: MatchState[] = [
    { kind: "baseball", inning: 7, half: "bottom", balls: 2, strikes: 1, outs: 1, bases: [true, false, true], pitcher: "김투수 (예시)", batter: "이타자 (예시)", lastAtBat: "좌전 안타 · 주자 1, 3루" },
    { kind: "football", clock: "후반 67:24", scorers: ["23′ 김공격 · 홈", "51′ 이공격 · 원정", "64′ 박공격 · 홈"], cards: ["38′ 김수비 · 경고"], substitutions: ["61′ 정선수 OUT → 최선수 IN"] },
    { kind: "basketball", quarter: "3쿼터", remaining: "04:32", fouls: [3, 2] },
    { kind: "volleyball", set: 3, sets: [1, 1], serving: "home" },
  ];
  return states.map((state, i) => ({
    id: state.kind === "baseball" ? demoBaseballMatchId : `demo-${state.kind}`, sport: state.kind as Sport, leagueId: i === 0 ? "kbo" : `demo-${state.kind}`, league: "예시 경기 · 실제 기록 아님",
    home: { id: i === 0 ? "hanwha" : "demo-home", name: "오렌지 (예시)", color: "#c2410c" },
    away: { id: i === 0 ? "samsung" : "demo-away", name: "블루 (예시)", color: "#1d4ed8" },
    score: [[4, 3], [2, 1], [68, 65], [18, 16]][i] as [number, number], status: "live", startsAt: new Date(now - 3600000).toISOString(), updatedAt: new Date(now).toISOString(), state,
    events: examplePlays[i],
  }));
}
