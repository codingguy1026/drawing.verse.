import { redirect } from "next/navigation";

export default function MePage() {
  redirect("/users/me");
}
