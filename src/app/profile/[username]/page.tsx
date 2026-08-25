import { notFound, redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ username: string }>;
};

export default async function LegacyProfilePage({ params }: PageProps) {
  const { username } = await params;
  const value = decodeURIComponent(username).trim();

  if (!value) notFound();

  const supabase = await createServerSupabase();
  let profileId: string | null = null;

  const byId = await supabase
    .from("profiles")
    .select("id")
    .eq("id", value)
    .maybeSingle();

  if (!byId.error && byId.data?.id) {
    profileId = byId.data.id;
  } else {
    const byNickname = await supabase
      .from("profiles")
      .select("id")
      .eq("nickname", value)
      .limit(1)
      .maybeSingle();

    if (!byNickname.error && byNickname.data?.id) {
      profileId = byNickname.data.id;
    }
  }

  if (!profileId) notFound();
  redirect(`/users/${profileId}`);
}
