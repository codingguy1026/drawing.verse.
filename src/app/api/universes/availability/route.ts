import { NextResponse } from 'next/server';
import { createRequestSupabase } from '@/lib/supabase/request';
import { slugError } from '@/lib/universe-creation';
export async function GET(req: Request) {
  const supabase = await createRequestSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '로그인 후 다시 시도해주세요.' }, { status: 401 });
  const slug = new URL(req.url).searchParams.get('slug');
  const invalid = slugError(slug);
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });
  const { data, error } = await supabase.rpc('universe_slug_available', { requested_slug: slug });
  if (error) return NextResponse.json({ error: '주소를 확인하지 못했어요. 잠시 후 다시 시도해주세요.' }, { status: 503 });
  return NextResponse.json({ available: data }, { headers: { 'Cache-Control': 'private, no-store' } });
}
