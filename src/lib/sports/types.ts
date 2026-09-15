export type Sport = "baseball" | "football" | "basketball" | "volleyball" | "other";
export type Team = { id: string; name: string; logo?: string; color?: string };
export type Play = { id: string; label: string; text: string; major?: boolean };
export type MatchState =
  | { kind: "baseball"; inning: number; half: "top" | "bottom"; balls: number; strikes: number; outs: number; bases: [boolean, boolean, boolean]; pitcher: string; batter: string; lastAtBat: string }
  | { kind: "football"; clock: string; scorers: string[]; cards: string[]; substitutions: string[] }
  | { kind: "basketball"; quarter: string; remaining: string; fouls: [number, number] }
  | { kind: "volleyball"; set: number; sets: [number, number]; serving: "home" | "away" | null }
  | { kind: "other"; period: string; details: { label: string; value: string }[] };
export type Match = {
  id: string; sport: Sport; leagueId: string; league: string;
  home: Team; away: Team; score: [number, number];
  status: "scheduled" | "live" | "break" | "final" | "postponed" | "cancelled";
  startsAt: string; updatedAt: string; venue?: string;
  state: MatchState | null; events: Play[];
};
export type SportsConfig = { slug: string; parent?: string; sport?: Sport; leagueId?: string; teamId?: string; color: string; tagline: string; logo?: string; banner?: string };
export type Feed = { mode: "live" | "demo" | "unconfigured"; matches: Match[] };
