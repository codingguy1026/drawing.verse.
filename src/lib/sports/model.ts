import type { Match, SportsConfig } from "./types";
export const isActive = (m: Match) => m.status === "live" || m.status === "break";
export function matchesScope(m: Match, c: SportsConfig) {
  return (!c.sport || m.sport === c.sport) && (!c.leagueId || m.leagueId === c.leagueId) && (!c.teamId || m.home.id === c.teamId || m.away.id === c.teamId);
}
export function selectMatch(matches: Match[], config: SportsConfig, now = Date.now()) {
  const scoped = matches.filter(m => matchesScope(m, config));
  return scoped.filter(isActive).sort((a,b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))[0]
    ?? scoped.filter(m => m.status === "scheduled" && Date.parse(m.startsAt) >= now).sort((a,b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))[0]
    ?? null;
}
export function isStale(m: Match, now: number) { return isActive(m) && now - Date.parse(m.updatedAt) > 60_000; }
export const statusLabels = { scheduled: "경기 예정", live: "LIVE", break: "경기 중 휴식", final: "경기 종료", postponed: "경기 연기", cancelled: "경기 취소" };
export function progress(m: Match) {
  if (!isActive(m) || !m.state) return statusLabels[m.status];
  const s = m.state;
  switch(s.kind) {
    case "baseball": return `${s.inning}회 ${s.half === "top" ? "초" : "말"}`;
    case "football": return s.clock;
    case "basketball": return `${s.quarter} · ${s.remaining}`;
    case "volleyball": return `${s.set}세트`;
    case "other": return s.period;
  }
}
