import { redirect } from 'next/navigation';
import { createRequestSupabase } from '@/lib/supabase/request';
import UniverseCreationWizard from '@/components/Universe/create/UniverseCreationWizard';

export default async function CreateUniversePage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  if (process.env.NODE_ENV === 'development' && (await searchParams).demo === '1') return <UniverseCreationWizard demo />;
  const supabase = await createRequestSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?next=/universe/create');
  return <UniverseCreationWizard />;
}
