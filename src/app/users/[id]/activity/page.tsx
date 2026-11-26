import { notFound, redirect } from "next/navigation";
import { createRequestSupabase } from "@/lib/supabase/request";
import ProfileSectionNav from "@/components/users/ProfileSectionNav";
import ActivityClient from "./activity-client";

export default async function ActivityPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const supabase = await createRequestSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (user.id !== id) notFound();
  const initialTab = query.tab === "comments" || query.tab === "subs" ? query.tab : "posts";
  return <main className="mx-auto max-w-6xl space-y-5 p-4 sm:p-6"><ProfileSectionNav id={id} section="activity" /><ActivityClient ownerId={id} initialTab={initialTab} /></main>;
}
