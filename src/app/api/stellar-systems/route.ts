import { NextResponse } from "next/server";
import { createRequestSupabase } from "@/lib/supabase/request";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const accentPattern = /^#[0-9a-fA-F]{6}$/;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const universeSlug = searchParams.get("universe");
  if (!universeSlug) return NextResponse.json({ error: "Universe 주소가 필요해요." }, { status: 400 });

  const supabase = await createRequestSupabase();
  const { data, error } = await supabase
    .from("stellar_systems")
    .select("id,universe_slug,slug,name,description,icon,accent,owner_id,created_at")
    .eq("universe_slug", universeSlug)
    .order("created_at", { ascending: true });

  return error
    ? NextResponse.json({ error: "항성계를 불러오지 못했어요." }, { status: 503 })
    : NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  try {
    const supabase = await createRequestSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });

    const body = await req.json();
    const universeSlug = String(body.universe_slug ?? "").trim();
    const slug = String(body.slug ?? "").trim().toLowerCase();
    const name = String(body.name ?? "").trim();
    const description = String(body.description ?? "").trim();
    const icon = String(body.icon ?? "☀️").trim() || "☀️";
    const accent = String(body.accent ?? "#f59e0b").trim();

    if (!universeSlug || !slugPattern.test(slug) || slug.length > 64)
      return NextResponse.json({ error: "항성계 주소는 영문 소문자, 숫자, 하이픈만 사용할 수 있어요." }, { status: 400 });
    if (!name || name.length > 60)
      return NextResponse.json({ error: "항성계 이름은 1~60자로 입력해주세요." }, { status: 400 });
    if (description.length > 280 || icon.length > 16 || !accentPattern.test(accent))
      return NextResponse.json({ error: "항성계 입력값을 다시 확인해주세요." }, { status: 400 });

    const { data: universe } = await supabase
      .from("universes").select("owner_id").eq("slug", universeSlug).maybeSingle();
    if (!universe || universe.owner_id !== user.id)
      return NextResponse.json({ error: "이 Universe의 소유자만 항성계를 만들 수 있어요." }, { status: 403 });

    const { data, error } = await supabase.from("stellar_systems").insert({
      universe_slug: universeSlug, slug, name, description, icon, accent, owner_id: user.id,
    }).select("id,universe_slug,slug,name,description,icon,accent").single();

    if (error) return NextResponse.json(
      { error: error.code === "23505" ? "이미 같은 주소의 항성계가 있어요." : "항성계를 만들지 못했어요." },
      { status: error.code === "23505" ? 409 : 503 },
    );

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "요청을 처리하지 못했어요." }, { status: 400 });
  }
}
