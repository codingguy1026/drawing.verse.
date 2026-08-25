import { redirect } from "next/navigation";

export default function LegacyUniverseWritePage() {
  redirect("/post/new");
}
