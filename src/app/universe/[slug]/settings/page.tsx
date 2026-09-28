import Link from "next/link";
import { ArrowLeft, ChevronRight, Layers3, LockKeyhole, ShieldAlert, UsersRound } from "lucide-react";

export default async function UniverseSettingsPage({
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
          <h1 className="mt-1 text-3xl font-black tracking-tight">Universe 설정</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-white/50">
            Universe의 기본 정보와 운영 방식을 관리하는 공간입니다. 지금은 기능보다 설정의 위치와 순서를 먼저 잡습니다.
          </p>
        </header>

        <div className="divide-y divide-slate-200 dark:divide-white/10">
          <section className="py-8">
            <div>
              <h2 className="text-lg font-black">기본 정보</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-white/50">
                Universe 이름, 설명, 아이콘처럼 사람들이 가장 먼저 보는 정보를 관리합니다.
              </p>
            </div>

            <form className="mt-6 space-y-5">
              <label className="block">
                <span className="text-sm font-bold">이름</span>
                <input
                  type="text"
                  name="name"
                  placeholder="Universe 이름"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-slate-400 dark:border-white/10 dark:bg-white/[0.03] dark:focus:border-white/30"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold">설명</span>
                <textarea
                  name="description"
                  rows={4}
                  placeholder="이 Universe가 어떤 공간인지 설명해 주세요."
                  className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none placeholder:text-slate-400 focus:border-slate-400 dark:border-white/10 dark:bg-white/[0.03] dark:focus:border-white/30"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold">아이콘</span>
                <input
                  type="text"
                  name="icon"
                  placeholder="예: 🌌"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-slate-400 dark:border-white/10 dark:bg-white/[0.03] dark:focus:border-white/30 sm:max-w-40"
                />
              </label>

              <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-5 dark:border-white/10 sm:flex-row sm:justify-end">
                <Link
                  href={universeHref}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-bold dark:border-white/10"
                >
                  취소
                </Link>
                <button
                  type="button"
                  disabled
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950"
                >
                  변경사항 저장
                </button>
              </div>
            </form>
          </section>

          <SettingsSection
            icon={<UsersRound className="size-5" />}
            title="게시 권한"
            description="누가 이 Universe에 글을 작성할 수 있는지 정합니다."
            items={["멤버 글쓰기 허용", "공개 범위"]}
          />

          <SettingsSection
            icon={<Layers3 className="size-5" />}
            title="섹션 관리"
            description="게시글을 나누는 섹션의 이름과 순서를 관리합니다."
            items={["섹션 목록", "순서 변경"]}
          />

          <section className="py-8">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 size-5 shrink-0 text-slate-500" />
              <div>
                <h2 className="text-lg font-black">위험 영역</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-white/50">
                  되돌리기 어려운 작업은 다른 설정과 분리합니다.
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-4 dark:border-white/10">
              <div>
                <p className="text-sm font-bold">Universe 삭제</p>
                <p className="mt-1 text-xs text-slate-500">삭제 기능은 아직 연결하지 않습니다.</p>
              </div>
              <button disabled className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-400 disabled:cursor-not-allowed dark:border-white/10">
                준비 중
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function SettingsSection({
  icon,
  title,
  description,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <section className="py-8">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-slate-500">{icon}</div>
        <div>
          <h2 className="text-lg font-black">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-white/50">{description}</p>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.03]">
        {items.map((item, index) => (
          <div
            key={item}
            className="flex min-h-14 items-center justify-between gap-4 px-4 py-3 text-sm not-last:border-b not-last:border-slate-200 dark:not-last:border-white/10"
          >
            <span className="font-semibold">{item}</span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
              <LockKeyhole className="size-3.5" />
              다음 단계
              <ChevronRight className="size-3.5" />
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
