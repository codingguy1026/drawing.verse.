import Link from "next/link";

export default function ProfileSectionNav({ id, section }: { id: string; section: "profile" | "activity" }) {
  const base = `/users/${encodeURIComponent(id)}`;
  return <nav aria-label="내 프로필 메뉴" className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 p-2 dark:border-white/10">
    <Link aria-current={section === "profile" ? "page" : undefined} className={`rounded-xl px-4 py-2 text-sm font-semibold ${section === "profile" ? "bg-violet-600 text-white" : "hover:bg-slate-100 dark:hover:bg-white/10"}`} href={base}>공개 프로필</Link>
    <Link aria-current={section === "activity" ? "page" : undefined} className={`rounded-xl px-4 py-2 text-sm font-semibold ${section === "activity" ? "bg-violet-600 text-white" : "hover:bg-slate-100 dark:hover:bg-white/10"}`} href={base + "/activity"}>내 활동 · 구독</Link>
    <Link className="rounded-xl px-4 py-2 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-white/10" href={base + "/edit"}>프로필 편집</Link>
  </nav>;
}
