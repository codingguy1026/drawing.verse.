import Link from "next/link";

const sports = [
  { name: "야구", emoji: "⚾", detail: "이닝 · 점수 · 주자 상황" },
  { name: "축구", emoji: "⚽", detail: "전·후반 · 득점 · 무승부" },
  { name: "농구", emoji: "🏀", detail: "쿼터 · 남은 시간 · 점수 차" },
];

export default function SportsAnalyticsPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="space-y-3">
        <Link href="/" className="text-sm underline underline-offset-4">← Drawing Verse</Link>
        <h1 className="text-3xl font-bold tracking-tight">스포츠 분석</h1>
        <p className="max-w-2xl text-sm text-neutral-500">
          경기 일정과 결과를 확인하고, 검증된 분석 모델이 준비되면 경기 전·경기 중 승리 확률을 살펴볼 수 있어요.
        </p>
      </header>

      <section aria-labelledby="sport-heading" className="space-y-4">
        <h2 id="sport-heading" className="text-xl font-semibold">종목별 경기</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {sports.map((sport) => (
            <article key={sport.name} className="rounded-xl border border-neutral-300/50 p-5 dark:border-neutral-700">
              <div className="text-2xl" aria-hidden="true">{sport.emoji}</div>
              <h3 className="mt-3 font-semibold">{sport.name}</h3>
              <p className="mt-1 text-sm text-neutral-500">{sport.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="prediction-heading" className="space-y-4">
        <h2 id="prediction-heading" className="text-xl font-semibold">승리 확률</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <article className="rounded-xl border border-neutral-300/50 p-5 dark:border-neutral-700">
            <h3 className="font-semibold">경기 전 예측</h3>
            <p className="mt-2 text-sm text-neutral-500">팀 전력과 과거 기록을 이용한 예측 영역입니다.</p>
            <p className="mt-4 text-sm font-medium">예측 모델 준비 중</p>
          </article>
          <article className="rounded-xl border border-neutral-300/50 p-5 dark:border-neutral-700">
            <h3 className="font-semibold">경기 중 예측</h3>
            <p className="mt-2 text-sm text-neutral-500">현재 점수와 경기 상황을 반영할 예정입니다.</p>
            <p className="mt-4 text-sm font-medium">실시간 데이터 연동 준비 중</p>
          </article>
        </div>
        <p className="text-xs text-neutral-500">
          승리 확률은 통계적 추정이며 실제 결과를 보장하지 않습니다. 이 페이지는 베팅이나 배당률 정보를 제공하지 않습니다.
        </p>
      </section>
    </main>
  );
}
