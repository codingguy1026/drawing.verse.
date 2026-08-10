import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // 쿠키 갱신이 불가능한 컨텍스트에서는 무시.
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: existingStar, error: lookupError } = await supabase
    .from("post_stars")
    .select("id")
    .eq("post_id", id)
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
      post_id: id,
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
    .eq("post_id", id);

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  const likesCount = count ?? 0;
  const { error: updateError } = await supabase
    .from("posts")
    .update({ likes_count: likesCount })
    .eq("id", id);

  if (updateError) {
    console.warn("Failed to sync posts.likes_count:", updateError.message);
  }

  return NextResponse.json({
    isStarred,
    likes_count: likesCount,
    like_count: likesCount,
  });
}
