import type { SportsConfig } from "./types";

// Keys are existing universe slugs. Child configurations inherit sport and league.
export const sportsUniverses: Record<string, Partial<SportsConfig>> = {
  sports: { color: "#6d28d9", tagline: "같은 순간, 함께 뛰는 우리." },
  baseball: { parent: "sports", sport: "baseball", color: "#c2410c", tagline: "마지막 아웃까지, 우리의 이야기는 끝나지 않는다." },
  football: { parent: "sports", sport: "football", color: "#047857", tagline: "휘슬이 울리는 순간부터, 하나의 함성으로." },
  basketball: { parent: "sports", sport: "basketball", color: "#b45309", tagline: "버저가 울릴 때까지, 코트 위의 모든 순간." },
  volleyball: { parent: "sports", sport: "volleyball", color: "#1d4ed8", tagline: "공을 놓지 않는 마음, 함께 잇는 한 점." },
  kbo: { parent: "baseball", leagueId: "kbo" },
  "hanwha-eagles": { parent: "kbo", teamId: "hanwha", color: "#c2410c", tagline: "우리의 함성은 마지막 아웃보다 오래 남는다." },
  "samsung-lions": { parent: "kbo", teamId: "samsung", color: "#1d4ed8", tagline: "푸른 함성으로, 끝까지 함께." },
};
const categories: Record<string, string> = { 스포츠: "sports", 야구: "baseball", 축구: "football", 농구: "basketball", 배구: "volleyball" };
export function resolveSportsConfig(slug: string, category?: string | null, seen = new Set<string>()): SportsConfig | null {
  if (seen.has(slug)) return null;
  seen.add(slug);
  const item = sportsUniverses[slug];
  if (!item) {
    const base = categories[category ?? ""];
    return base ? { ...resolveSportsConfig(base)!, slug } : null;
  }
  const parent = item.parent ? resolveSportsConfig(item.parent, null, seen) : null;
  if (item.parent && !parent) return null;
  return { color: "#6d28d9", tagline: "같은 순간, 함께 뛰는 우리.", ...parent, ...item, slug };
}
export function safeAsset(value?: string) {
  return value && (/^\/(?!\/)/.test(value) || /^https:\/\//.test(value)) ? value : undefined;
}
