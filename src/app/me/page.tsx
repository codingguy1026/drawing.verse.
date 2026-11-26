import { redirect } from "next/navigation";
import { createRequestSupabase } from "@/lib/supabase/request";

export default async function MePage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const query = await searchParams;
  const supabase = await createRequestSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const base = `/users/${encodeURIComponent(user.id)}`;
  if (query.tab === "posts" || query.tab === "comments" || query.tab === "subs") redirect(base + "/activity?tab=" + query.tab);
  redirect(base);
}
