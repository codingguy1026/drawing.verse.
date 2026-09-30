import Link from "next/link";
import { ArrowLeft, Crown, ShieldCheck, UserRound, UsersRound } from "lucide-react";

const previewMembers = [
  { name: "Universe Owner", role: "소유자", icon: Crown },
  { name: "Moderator", role: "운영자", icon: ShieldCheck },
  { name: "Member", role: "멤버", icon: UserRound },
];

export default async function UniverseMembersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const universeHref = `/universe/${encodeURIComponent(slug)}`;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 dark:bg-[#03050a] dark:text-white sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          href={universeHref}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950 dark:text-white/60 dark:hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Universe로 돌아가기
        </Link>

        <header className="mt-8 border-b border-slate-200 pb-6 dark:border-white/10">
          <p className="text-sm font-semibold text-slate-500">{slug}</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">멤버</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-white/50">
            이 Universe에 참여하는 사람과 역할을 확인하는 공간입니다.
          </p>
        </header>

        <section className="py-7">
          <div className="flex items-center gap-3">
            <UsersRound className="size-5 text-slate-500" />
            <div>
              <p className="text-xs font-semibold text-slate-500">전체 멤버</p>
              <p className="text-xl font-black">{previewMembers.length}명</p>
            </div>
          </div>
        </section>

        <section aria-labelledby="member-list-title">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <h2 id="member-list-title" className="text-lg font-black">멤버 목록</h2>
              <p className="mt-1 text-xs text-slate-500">현재는 레이아웃 확인용 예시 데이터입니다.</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.03]">
            {previewMembers.map(({ name, role, icon: Icon }, index) => (
              <div
                key={name}
                className={`flex items-center gap-3 px-4 py-4 ${index !== previewMembers.length - 1 ? "border-b border-slate-200 dark:border-white/10" : ""}`}
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-white/[0.06]">
                  <Icon className="size-4 text-slate-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
