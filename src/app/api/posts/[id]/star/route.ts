import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const postId = Number(id);

  if (!Number.isSafeInteger(postId) || postId <= 0) {
    return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: existingStar, error: lookupError } = await supabase
    .from("post_stars")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (lookupError) {
    return NextResponse.json({ error: lookupError.message }, { status: 500 });
  }

  let isStarred = false;

  if (existingStar) {
    const { error } = await supabase
      .from("post_stars")
      .delete()
      .eq("id", existingStar.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    const { error } = await supabase.from("post_stars").insert({
      post_id: postId,
      user_id: user.id,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    isStarred = true;
  }

  const { count, error: countError } = await supabase
    .from("post_stars")
    .select("id", { count: "exact", head: true })
    .eq("post_id", postId);

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  const likeCount = count ?? 0;

  // 20260825_supabase_alignment.sql keeps posts.like_count in sync with a
  // SECURITY DEFINER trigger. Do not update someone else's post from the
  // current user's RLS session here.
  return NextResponse.json({
    isStarred,
    like_count: likeCount,
    likes_count: likeCount,
  });
}
