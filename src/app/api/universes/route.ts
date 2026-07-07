import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("universes")
    .select("*")
    .order("id");

  if (error) {
    console.error("GET /api/universes error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, category, slug } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "name과 slug는 필수입니다" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("universes")
      .insert([
        {
          name,
          description: description || "",
          category: category || "general",
          slug: slug.toLowerCase(),
          subscriber_count: 0,
          post_count: 0,
        },
      ])
      .select();

    if (error) {
      console.error("POST /api/universes error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("POST /api/universes error:", err);
    return NextResponse.json(
      { error: "서버 오류" },
      { status: 500 }
    );
  }
}
