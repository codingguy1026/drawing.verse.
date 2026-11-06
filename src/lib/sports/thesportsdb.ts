import type { Match, Sport } from "./types";
import { parseMatches } from "./validate";

type RawEvent = Record<string, unknown>;
const API = "https://www.thesportsdb.com/api/v1/json/123";
const allowed = new Set<Sport>(["baseball", "football", "basketball", "volleyball", "other"]);
const str = (value: unknown) => typeof value === "string" ? value.trim() : "";
const score = (value: unknown) => {
  const n = Number(value);
  return value !== null && value !== undefined && value !== "" && Number.isInteger(n) && n >= 0 && n <= 10000 ? n : null;
};
const dateTime = (event: RawEvent): string | null => {
  const raw = str(event.strTimestamp);
  if (raw) {
    const normalized = raw.includes("T") ? raw : raw.replace(" ", "T") + "Z";
    const time = Date.parse(normalized);
    if (Number.isFinite(time)) return new Date(time).toISOString();
  }
  const date = str(event.dateEvent);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const time = /^\d{2}:\d{2}:\d{2}$/.test(str(event.strTime)) ? str(event.strTime) : "00:00:00";
  const timestamp = Date.parse(`${date}T${time}Z`);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
};
const status = (event: RawEvent): Match["status"] => {
  const description = str(event.strStatus).toLowerCase();
  if (/postponed/.test(description)) return "postponed";
  if (/cancelled|canceled/.test(description)) return "cancelled";
  if (/half.time|break/.test(description)) return "break";
  if (/live|in progress|1st half|2nd half/.test(description)) return "live";
  if (/finished|full.time|final|match finished/.test(description)) return "final";
  if (score(event.intHomeScore) !== null && score(event.intAwayScore) !== null) return "final";
  return "scheduled";
};
function convert(event: RawEvent, sport: Sport, leagueId: string, league: string): Match | null {
  const id = str(event.idEvent), home = str(event.strHomeTeam), away = str(event.strAwayTeam);
  const startsAt = dateTime(event);
  if (!id || !home || !away || !startsAt) return null;
  const homeScore = score(event.intHomeScore), awayScore = score(event.intAwayScore);
  const currentStatus = status(event);
  // The existing Match validator requires play-by-play state for live/break games.
  // The free fixture endpoint does not supply that state, so do not fake it.
  if (currentStatus === "live" || currentStatus === "break") return null;
  // A missing score is not evidence of a 0:0 result; scheduled games use a placeholder only.
  if (currentStatus === "final" && (homeScore === null || awayScore === null)) return null;
  return {
    id: `tsdb-${id}`, sport, leagueId, league,
    home: { id: str(event.idHomeTeam) || `home-${id}`, name: home },
    away: { id: str(event.idAwayTeam) || `away-${id}`, name: away },
    score: [homeScore ?? 0, awayScore ?? 0], status: currentStatus,
    startsAt, updatedAt: new Date().toISOString(), venue: str(event.strVenue) || undefined,
    state: null, events: [],
  };
}
export async function fetchTheSportsDbMatches(): Promise<Match[]> {
  // Semicolon-separated entries: football:4328:English Premier League;basketball:ID:League name
  const configured = process.env.THESPORTSDB_LEAGUES || "football:4328:English Premier League";
  const leagues = configured.split(";").slice(0, 8).map(entry => {
    const [sport, id, ...name] = entry.split(":");
    return { sport: sport as Sport, id, name: name.join(":") };
  }).filter(item => allowed.has(item.sport) && /^\d{1,12}$/.test(item.id) && item.name.length > 0 && item.name.length <= 120);
  const requests = leagues.flatMap(league => ["eventsnextleague.php", "eventspastleague.php"].map(async path => {
    const url = `${API}/${path}?id=${league.id}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(7000), next: { revalidate: 300 } });
    if (!response.ok) throw new Error("TheSportsDB unavailable");
    const body: unknown = await response.json();
    if (!body || typeof body !== "object" || !("events" in body)) return [] as Match[];
    const events = (body as { events: unknown }).events;
    if (!Array.isArray(events)) return [] as Match[];
    return events.slice(0, 100).flatMap(event => {
      if (!event || typeof event !== "object" || Array.isArray(event)) return [];
      const match = convert(event as RawEvent, league.sport, league.id, league.name);
      return match ? [match] : [];
    });
  }));
  const results = await Promise.allSettled(requests);
  if (results.length && results.every(result => result.status === "rejected")) throw new Error("All sports feeds unavailable");
  const unique = new Map<string, Match>();
  for (const result of results) if (result.status === "fulfilled") {
    for (const match of result.value) unique.set(match.id, match);
  }
  return parseMatches({ matches: [...unique.values()].sort((a, b) => a.startsAt.localeCompare(b.startsAt)) });
}
