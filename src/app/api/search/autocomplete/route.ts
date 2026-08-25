import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const query = url.searchParams.get("query")?.trim();

  if (!query) {
    return NextResponse.json({ error: "query parameter required" }, { status: 400 });
  }

  try {
    const supabase = await createServerSupabase();
    const [{ data: universes, error: uErr }, { data: posts, error: pErr }] =
      await Promise.all([
        supabase
          .from("universes")
          .select("id,slug,name")
          .ilike("name", `%${query}%`)
          .limit(10),
        supabase
          .from("posts")
          .select("id,universe_slug,title")
          .ilike("title", `%${query}%`)
          .limit(10),
      ]);

    if (uErr || pErr) {
      console.error("autocomplete API error", uErr || pErr);
      return NextResponse.json({ error: "autocomplete failed" }, { status: 500 });
    }

    const suggestions: Array<{
      type: "universe" | "post";
      id: number;
      label: string;
      slug?: string;
    }> = [];

    for (const universe of universes ?? []) {
      suggestions.push({
        type: "universe",
        id: Number(universe.id),
        label: universe.name,
        slug: universe.slug,
      });
    }

    for (const post of posts ?? []) {
      suggestions.push({
        type: "post",
        id: Number(post.id),
        label: post.title,
        slug: post.universe_slug ?? undefined,
      });
    }

    return NextResponse.json(suggestions);
  } catch (err) {
    console.error("autocomplete API exception", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
