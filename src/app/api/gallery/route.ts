import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("gallery")
    .select("id,title,author,thumbnail_url,category,view_count,like_count,comment_count,user_id,created_at,updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("GET /api/gallery error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
