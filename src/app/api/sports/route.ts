import { parseMatches } from "@/lib/sports/validate";
import { demoMatches } from "@/lib/sports/demo";

export const dynamic = "force-dynamic";
const reply = (data: unknown, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
export async function GET(request: Request) {
  if (new URL(request.url).searchParams.get("demo") === "1") return reply({ mode: "demo", matches: demoMatches() });
  const endpoint = process.env.SPORTS_FEED_URL;
  if (!endpoint) return reply({ mode: "unconfigured", matches: [] });
  try {
    // Only a server-owned URL is used; clients cannot choose hosts or supply credentials.
    const url = new URL(endpoint);
    if (url.protocol !== "https:" || url.username || url.password) throw new Error("Invalid feed URL");
    const response = await fetch(url, {
      headers: process.env.SPORTS_FEED_TOKEN ? { Authorization: `Bearer ${process.env.SPORTS_FEED_TOKEN}` } : {},
      signal: AbortSignal.timeout(8000), cache: "no-store", redirect: "error",
    });
    if (!response.ok) throw new Error("Feed unavailable");
    // Bound the body before parsing to protect this public read endpoint.
    const reader = response.body?.getReader();
    if (!reader) throw new Error("Empty feed");
    const chunks: Uint8Array[] = []; let size = 0;
    try {
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        size += value.byteLength;
        if (size > 2_000_000) throw new Error("Feed too large");
        chunks.push(value);
      }
    } finally { await reader.cancel(); }
    const matches = parseMatches(JSON.parse(Buffer.concat(chunks).toString("utf8")));
    return reply({ mode: "live", matches });
  } catch { return reply({ error: "경기 정보를 가져오지 못했어요. 잠시 후 다시 시도해 주세요." }, 503); }
}
