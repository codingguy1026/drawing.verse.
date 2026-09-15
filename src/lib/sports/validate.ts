import type { Match } from "./types";
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const text = (v: unknown): v is string => typeof v === "string" && v.length <= 2000;
const count = (v: unknown, max = 10000) => typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= max;
const date = (v: unknown) => text(v) && Number.isFinite(Date.parse(v));
const strings = (v: unknown) => Array.isArray(v) && v.length <= 500 && v.every(text);
const pair = (v: unknown) => Array.isArray(v) && v.length === 2 && v.every(n => count(n));
const team = (v: unknown) => object(v) && text(v.id) && text(v.name) && (v.logo === undefined || text(v.logo)) && (v.color === undefined || text(v.color));
export function validMatch(v: unknown): v is Match {
  if (!object(v) || !text(v.id) || !v.id || !text(v.leagueId) || !text(v.league) || !team(v.home) || !team(v.away) || !pair(v.score) || !date(v.startsAt) || !date(v.updatedAt)) return false;
  if (v.venue !== undefined && !text(v.venue)) return false;
  if (!["scheduled", "live", "break", "final", "postponed", "cancelled"].includes(String(v.status))) return false;
  if (!["baseball", "football", "basketball", "volleyball", "other"].includes(String(v.sport))) return false;
  if (!Array.isArray(v.events) || v.events.length > 500 || !v.events.every(e => object(e) && text(e.id) && text(e.label) && text(e.text) && (e.major === undefined || typeof e.major === "boolean"))) return false;
  if (new Set(v.events.map(e => e.id)).size !== v.events.length) return false;
  if (v.state === null) return v.status !== "live" && v.status !== "break";
  const s = v.state;
  if (!object(s) || s.kind !== v.sport) return false;
  switch(s.kind) {
    case "baseball": return count(s.inning, 100) && Number(s.inning) > 0 && ["top", "bottom"].includes(String(s.half)) && count(s.balls, 3) && count(s.strikes, 2) && count(s.outs, 3) && Array.isArray(s.bases) && s.bases.length === 3 && s.bases.every(b => typeof b === "boolean") && text(s.pitcher) && text(s.batter) && text(s.lastAtBat);
    case "football": return text(s.clock) && strings(s.scorers) && strings(s.cards) && strings(s.substitutions);
    case "basketball": return text(s.quarter) && text(s.remaining) && pair(s.fouls);
    case "volleyball": return count(s.set, 20) && Number(s.set) > 0 && pair(s.sets) && ["home", "away", null].includes(s.serving as string | null);
    case "other": return text(s.period) && Array.isArray(s.details) && s.details.length <= 30 && s.details.every(d => object(d) && text(d.label) && text(d.value));
    default: return false;
  }
}
export function parseMatches(input: unknown): Match[] {
  if (!object(input) || !Array.isArray(input.matches) || input.matches.length > 1000 || !input.matches.every(validMatch)) throw new Error("Invalid sports feed");
  if (new Set(input.matches.map(m => m.id)).size !== input.matches.length) throw new Error("Duplicate matches");
  return input.matches;
}
