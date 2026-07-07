import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const query = url.searchParams.get("query")?.trim();

  if (!query) {
    return NextResponse.json({ error: "query parameter required" }, { status: 400 });
  }

  if (!supabaseAdmin) {
    console.error("autocomplete requested but supabaseAdmin is not configured");
    return NextResponse.json({ universes: [], posts: [] });
  }

  try {
    const [{ data: universes, error: uErr }, { data: posts, error: pErr }] = await Promise.all([
      supabaseAdmin
        .from("universes")
        .select("id,slug,name")
        .ilike("name", `%${query}%`)
        .limit(10),
      supabaseAdmin
        .from("posts")
        .select("id,universe_slug,title")
        .ilike("title", `%${query}%`)
        .limit(10),
    ]);

    if (uErr || pErr) {
      console.error("autocomplete API error", uErr || pErr);
      return NextResponse.json({ error: "autocomplete failed" }, { status: 500 });
    }

    // normalize into suggestion list
    const suggestions = [] as Array<{
      type: "universe" | "post";
      id: number;
      label: string;
      slug?: string;
    }>;

    if (universes) {
      for (const u of universes as any[]) {
        suggestions.push({ type: "universe", id: u.id, label: u.name, slug: u.slug });
      }
    }
    if (posts) {
      for (const p of posts as any[]) {
        suggestions.push({ 
          type: "post", 
          id: p.id, 
          label: p.title,
          slug: p.universe_slug 
        });
      }
    }

    return NextResponse.json(suggestions);
  } catch (err) {
    console.error("autocomplete API exception", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
