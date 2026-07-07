import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const query = url.searchParams.get("query")?.trim();

  if (!query) {
    return NextResponse.json({ error: "query parameter required" }, { status: 400 });
  }

  try {
    const [{ data: universes, error: uErr }, { data: posts, error: pErr }] = await Promise.all([
      supabaseAdmin
        .from("universes")
        .select("id,slug,name,description")
        .ilike("name", `%${query}%`)
        .or(`description.ilike.%${query}%`)
        .limit(50),
      supabaseAdmin
        .from("posts")
        .select("id,universe_slug,title")
        .ilike("title", `%${query}%`)
        .limit(50),
    ]);

    if (uErr || pErr) {
      console.error("search API error", uErr || pErr);
      return NextResponse.json({ error: "search failed" }, { status: 500 });
    }

    return NextResponse.json({ universes, posts });
  } catch (err) {
    console.error("search API exception", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
