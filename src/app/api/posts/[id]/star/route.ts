import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
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
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // ignore
          }
        },
      },
    }
  );
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Check if already starred
  const { data: existingStar } = await supabase
    .from("post_stars")
    .select("id")
    .eq("post_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  let isStarred = false;

  if (existingStar) {
    // 2. Unstar
    await supabase
      .from("post_stars")
      .delete()
      .eq("id", existingStar.id);
    
    isStarred = false;
  } else {
    // 3. Star
    await supabase
      .from("post_stars")
      .insert({
        post_id: id,
        user_id: user.id
      });
    
    isStarred = true;
  }

  // 4. Update like_count in posts table (denormalized for performance)
  // Note: In a production app, you might want to use a DB trigger instead.
  const { data: countData } = await supabase
    .from("post_stars")
    .select("id", { count: "exact" })
    .eq("post_id", id);
  
  const count = countData?.length || 0;

  await supabase
    .from("posts")
    .update({ like_count: count })
    .eq("id", id);

  return NextResponse.json({ isStarred, like_count: count });
}
