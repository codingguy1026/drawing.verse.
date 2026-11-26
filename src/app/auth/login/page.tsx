import { redirect } from "next/navigation";

export default async function LegacyLogin({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  redirect(next === "/universe/create" ? "/login?next=%2Funiverse%2Fcreate" : "/login");
}
