import { NextResponse } from 'next/server';
import { createRequestSupabase } from '@/lib/supabase/request';
import { validateUniverse, type UniverseDraft } from '@/lib/universe-creation';

export async function GET() {
  const supabase = await createRequestSupabase();
  const { data, error } = await supabase.from('universes').select('*').order('id');
  return error ? NextResponse.json({ error: '유니버스를 불러오지 못했어요.' }, { status: 503 }) : NextResponse.json(data);
}
export async function POST(req: Request) {
  try {
    const supabase = await createRequestSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: '로그인 후 다시 시도해주세요.' }, { status: 401 });
    const body: UniverseDraft = await req.json();
    const invalid = validateUniverse(body);
    if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });
    if (body.parent_slug) {
      if (typeof body.parent_slug !== 'string' || body.parent_slug === body.slug)
        return NextResponse.json({ error: '상위 유니버스가 올바르지 않아요.' }, { status: 400 });
      const { data: parent, error: parentError } = await supabase.from('universes')
        .select('slug,owner_id,parent_slug').eq('slug', body.parent_slug).maybeSingle();
      if (parentError || !parent) return NextResponse.json({ error: '상위 유니버스를 찾을 수 없어요.' }, { status: 404 });
      if (parent.owner_id !== user.id) return NextResponse.json({ error: '상위 유니버스 소유자만 행성을 만들 수 있어요.' }, { status: 403 });
      if (parent.parent_slug) return NextResponse.json({ error: '현재는 유니버스 아래 한 단계의 행성만 만들 수 있어요.' }, { status: 400 });
    }
    // One atomic row stores the owner and ordered post categories too: no partial creation.
    const { data, error } = await supabase.from('universes').insert({
      name: body.name.trim(), slug: body.slug, parent_slug: body.parent_slug || null, description: body.description.trim(), category: body.category,
      icon: body.icon.trim(), visibility: body.visibility, owner_id: user.id,
      allow_member_posts: body.allow_member_posts, allow_comments: body.allow_comments,
      rules: body.rules.trim(), sections: body.sections.map(s => s.trim()),
    }).select('id,slug');
    if (error) return NextResponse.json({ error: error.code === '23505' ? '이미 사용 중인 주소예요. 다른 주소를 입력해주세요.' : '유니버스를 저장하지 못했어요. 잠시 후 다시 시도해주세요.' }, { status: error.code === '23505' ? 409 : 503 });
    return NextResponse.json(data, { status: 201 });
  } catch { return NextResponse.json({ error: '요청을 처리하지 못했어요. 입력 내용과 연결 상태를 확인해주세요.' }, { status: 400 }); }
}
