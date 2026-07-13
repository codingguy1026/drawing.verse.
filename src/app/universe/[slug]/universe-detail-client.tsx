"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Clock3,
  Disc3,
  Headphones,
  MessageCircle,
  Music2,
  Orbit,
  Plus,
  Radio,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

type UniverseTheme = "dreamcore" | "space" | "neon" | "sports" | "art";

type Universe = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  theme: UniverseTheme;
  tags: string[];
  stats: {
    series: number;
    tracks: number;
    members: string;
  };
};

type SeriesItem = {
  id: string;
  title: string;
  description: string;
  tracks: number;
  posts: number;
  mood: string;
  updatedAt: string;
};

type TrackItem = {
  id: string;
  title: string;
  series: string;
  mood: string;
  duration: string;
};

type SatelliteItem = {
  id: string;
  name: string;
  description: string;
};

type ActivityItem = {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
};

const universes: Record<string, Universe> = {
  baseball: {
    id: "baseball",
    name: "야구 유니버스",
    subtitle: "응원과 기록, 명장면이 쌓이는 야구 세계",
    description:
      "구단 이야기, 경기 리뷰, 선수 썰, 응원 감정이 한 공간에 모이는 유니버스예요. 글 하나하나가 경기장의 함성처럼 이어져요.",
    theme: "sports",
    tags: ["KBO", "응원", "경기리뷰", "선수", "기록"],
    stats: {
      series: 14,
      tracks: 312,
      members: "12.8K",
    },
  },
  soccer: {
    id: "soccer",
    name: "축구 유니버스",
    subtitle: "전술과 응원, 골 장면이 모이는 축구 세계",
    description:
      "리그 이야기, 선수 분석, 전술 토론, 직관 후기가 자연스럽게 쌓이는 축구 유니버스예요.",
    theme: "sports",
    tags: ["K리그", "해외축구", "전술", "응원", "하이라이트"],
    stats: {
      series: 10,
      tracks: 206,
      members: "8.4K",
    },
  },
  compose: {
    id: "compose",
    name: "작곡 유니버스",
    subtitle: "멜로디와 코드가 작은 세계가 되는 공간",
    description:
      "짧은 멜로디, 코드 진행, 작업 기록, 음악 아이디어가 모이는 유니버스예요. 아직 완성되지 않은 소리도 여기서는 하나의 별처럼 남아요.",
    theme: "space",
    tags: ["작곡", "멜로디", "코드", "음악", "아이디어"],
    stats: {
      series: 8,
      tracks: 134,
      members: "642",
    },
  },
  doodle: {
    id: "doodle",
    name: "낙서 유니버스",
    subtitle: "가볍게 그린 선들이 모여 커지는 그림 세계",
    description:
      "연습장 같은 낙서, 캐릭터 스케치, 즉흥 그림들이 편하게 올라오는 유니버스예요.",
    theme: "art",
    tags: ["낙서", "스케치", "팬아트", "연습", "그림"],
    stats: {
      series: 11,
      tracks: 248,
      members: "3.1K",
    },
  },
  dreamcore: {
    id: "dreamcore",
    name: "Dreamcore Universe",
    subtitle: "흐릿한 꿈과 새벽 감성이 모이는 세계",
    description:
      "새벽 2시의 방, 오래된 라디오, 흐릿한 기억을 닮은 창작물들이 모이는 유니버스예요. 글과 이미지가 장면처럼 이어지고, 시리즈는 작은 이야기처럼 쌓여요.",
    theme: "dreamcore",
    tags: ["몽환", "새벽", "dreamcore", "story", "감성"],
    stats: {
      series: 12,
      tracks: 248,
      members: "1.2K",
    },
  },
};

const featuredSeries: SeriesItem[] = [
  {
    id: "night-radio",
    title: "새벽 라디오",
    description: "잠들지 못한 사람들이 남긴 짧은 이야기들",
    tracks: 12,
    posts: 34,
    mood: "dreamy",
    updatedAt: "오늘",
  },
  {
    id: "cloud-station",
    title: "구름 정류장",
    description: "비 오는 창가와 흐린 하늘을 닮은 공간",
    tracks: 18,
    posts: 51,
    mood: "soft",
    updatedAt: "어제",
  },
  {
    id: "lost-school",
    title: "꿈속 학교",
    description: "복도 끝에서 들려오는 이상하고 예쁜 장면들",
    tracks: 9,
    posts: 22,
    mood: "liminal",
    updatedAt: "3일 전",
  },
];

const recentTracks: TrackItem[] = [
  {
    id: "fading-window",
    title: "fading window",
    series: "새벽 라디오",
    mood: "dreamcore",
    duration: "1:42",
  },
  {
    id: "cloud-station",
    title: "cloud station",
    series: "구름 정류장",
    mood: "ambient",
    duration: "2:08",
  },
  {
    id: "after-school-rain",
    title: "after school rain",
    series: "꿈속 학교",
    mood: "piano",
    duration: "1:16",
  },
  {
    id: "old-cassette-moon",
    title: "old cassette moon",
    series: "새벽 라디오",
    mood: "lo-fi",
    duration: "1:58",
  },
];

const satellites: SatelliteItem[] = [
  {
    id: "night-radio",
    name: "새벽 라디오",
    description: "잠 못 드는 밤의 짧은 기록",
  },
  {
    id: "memory-archive",
    name: "기억 보관소",
    description: "희미한 장면과 오래된 감정",
  },
  {
    id: "cloud-stop",
    name: "구름 정류장",
    description: "비와 구름, 창문 쪽 분위기",
  },
];

const activities: ActivityItem[] = [
  {
    id: "activity-1",
    user: "민트구름",
    action: "새 글을 추가했어요",
    target: "fading window",
    time: "12분 전",
  },
  {
    id: "activity-2",
    user: "하늘고래",
    action: "댓글을 남겼어요",
    target: "cloud station",
    time: "48분 전",
  },
  {
    id: "activity-3",
    user: "드가이",
    action: "새 시리즈를 만들었어요",
    target: "꿈속 학교",
    time: "오늘",
  },
];

const themeStyles: Record<
  UniverseTheme,
  {
    planet: string;
    chip: string;
    border: string;
    accentText: string;
    softPanel: string;
  }
> = {
  dreamcore: {
    planet: "from-violet-200 via-sky-100 to-pink-100 shadow-[0_18px_60px_rgba(168,85,247,0.2)]",
    chip: "bg-violet-50 text-violet-700 ring-violet-200/70",
    border: "border-violet-100",
    accentText: "text-violet-600",
    softPanel: "bg-violet-50/60",
  },
  space: {
    planet: "from-sky-200 via-indigo-200 to-violet-300 shadow-[0_18px_60px_rgba(59,130,246,0.18)]",
    chip: "bg-sky-50 text-sky-700 ring-sky-200/70",
    border: "border-sky-100",
    accentText: "text-sky-600",
    softPanel: "bg-sky-50/60",
  },
  neon: {
    planet: "from-fuchsia-200 via-cyan-100 to-violet-300 shadow-[0_18px_60px_rgba(236,72,153,0.16)]",
    chip: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200/70",
    border: "border-fuchsia-100",
    accentText: "text-fuchsia-600",
    softPanel: "bg-fuchsia-50/60",
  },
  sports: {
    planet: "from-orange-200 via-amber-100 to-rose-200 shadow-[0_18px_60px_rgba(249,115,22,0.16)]",
    chip: "bg-orange-50 text-orange-700 ring-orange-200/70",
    border: "border-orange-100",
    accentText: "text-orange-600",
    softPanel: "bg-orange-50/60",
  },
  art: {
    planet: "from-cyan-100 via-violet-100 to-pink-100 shadow-[0_18px_60px_rgba(14,165,233,0.14)]",
    chip: "bg-cyan-50 text-cyan-700 ring-cyan-200/70",
    border: "border-cyan-100",
    accentText: "text-cyan-600",
    softPanel: "bg-cyan-50/60",
  },
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getUniverse(slug: string): Universe {
  if (universes[slug]) return universes[slug];

  const title = slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    id: slug,
    name: `${title || "Unknown"} Universe`,
    subtitle: "새로운 창작과 이야기가 모이는 유니버스",
    description:
      "아직 정식 데이터가 연결되지 않은 유니버스예요. 지금은 미리보기 화면으로, 이후 Supabase 데이터와 연결하면 실제 소개와 활동이 표시돼요.",
    theme: "dreamcore",
    tags: ["창작", "세계관", "커뮤니티", "preview"],
    stats: {
      series: 5,
      tracks: 42,
      members: "128",
    },
  };
}

export default function UniverseDetailClient({ slug }: { slug: string }) {
  const universe = getUniverse(slug);
  const theme = themeStyles[universe.theme];

  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-5 sm:px-6 lg:px-8">
        <TopBar />

        <UniverseHero universe={universe} theme={theme} />

        <section className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)_300px]">
          <aside className="space-y-6">
            <UniverseInfoCard universe={universe} theme={theme} />
            <MembersCard theme={theme} />
          </aside>

          <div className="space-y-6">
            <FeaturedSeriesShelf theme={theme} />
            <RecentTracksList theme={theme} />
            <SatelliteMap theme={theme} />
          </div>

          <aside className="space-y-6">
            <ActivityFeed theme={theme} />
            <CreateInUniverseCTA theme={theme} />
          </aside>
        </section>
      </div>
    </main>
  );
}

function TopBar() {
  return (
    <header className="flex items-center justify-between">
      <Link
        href="/universe"
        className="group inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-950"
      >
        <ArrowLeft className="size-4 transition group-hover:-translate-x-0.5" />
        유니버스로 돌아가기
      </Link>

      <Link
        href="/create"
        className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
      >
        <Plus className="size-4" />
        만들기
      </Link>
    </header>
  );
}

function UniverseHero({
  universe,
  theme,
}: {
  universe: Universe;
  theme: (typeof themeStyles)[UniverseTheme];
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[2rem] border bg-white p-6 shadow-[0_20px_80px_rgba(15,23,42,0.06)] sm:p-8 lg:p-10",
        theme.border
      )}
    >
      <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold ring-1", theme.chip)}>
            <Sparkles className="size-4" />
            Universe Detail
          </div>

          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              {universe.name}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              {universe.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {universe.tags.map((tag) => (
              <span
                key={tag}
                className={cn("rounded-full px-3 py-1 text-sm font-bold ring-1", theme.chip)}
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="#recent-tracks"
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
            >
              <Headphones className="size-4" />
              최근 글 보기
            </Link>

            <Link
              href="#featured-series"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-slate-800 ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              <Radio className="size-4" />
              대표 시리즈
            </Link>
          </div>
        </div>

        <div className="relative mx-auto flex aspect-square w-full max-w-[300px] items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-slate-100" />
          <div className="absolute inset-8 rounded-full border border-slate-100" />
          <div className="absolute inset-16 rounded-full border border-slate-100" />

          <div className={cn("relative size-40 rounded-full bg-gradient-to-br", theme.planet)}>
            <div className="absolute left-8 top-7 size-8 rounded-full bg-white/60 blur-sm" />
            <div className="absolute bottom-8 right-7 size-12 rounded-full bg-white/35 blur-md" />
          </div>

          <div className="absolute left-8 top-12 size-4 rounded-full bg-slate-200 shadow-sm" />
          <div className="absolute bottom-12 right-12 size-3 rounded-full bg-slate-200 shadow-sm" />
          <div className="absolute right-8 top-24 size-5 rounded-full bg-slate-100 shadow-sm" />
        </div>
      </div>
    </section>
  );
}

function UniverseInfoCard({
  universe,
  theme,
}: {
  universe: Universe;
  theme: (typeof themeStyles)[UniverseTheme];
}) {
  return (
    <section className={cn("rounded-3xl border bg-white p-5 shadow-sm", theme.border)}>
      <div className="mb-4 flex items-center gap-2">
        <Orbit className={cn("size-5", theme.accentText)} />
        <h2 className="font-black">유니버스 소개</h2>
      </div>

      <p className="text-sm leading-7 text-slate-600">{universe.description}</p>

      <div className="mt-5 grid gap-3">
        <StatRow icon={<Radio className="size-4" />} label="시리즈" value={`${universe.stats.series}개`} />
        <StatRow icon={<Music2 className="size-4" />} label="글/작품" value={`${universe.stats.tracks}개`} />
        <StatRow icon={<Users className="size-4" />} label="멤버" value={`${universe.stats.members}명`} />
      </div>
    </section>
  );
}

function StatRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-3 ring-1 ring-slate-100">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        {icon}
        {label}
      </div>
      <strong className="text-sm text-slate-950">{value}</strong>
    </div>
  );
}

function MembersCard({ theme }: { theme: (typeof themeStyles)[UniverseTheme] }) {
  const members = ["드", "구", "별", "몽", "라"];

  return (
    <section className={cn("rounded-3xl border bg-white p-5 shadow-sm", theme.border)}>
      <div className="mb-4 flex items-center gap-2">
        <Users className={cn("size-5", theme.accentText)} />
        <h2 className="font-black">멤버</h2>
      </div>

      <div className="flex -space-x-2">
        {members.map((member, index) => (
          <div
            key={member}
            className={cn(
              "grid size-10 place-items-center rounded-full border-2 border-white bg-gradient-to-br text-sm font-black text-slate-900 shadow-sm",
              theme.planet
            )}
            style={{ zIndex: members.length - index }}
          >
            {member}
          </div>
        ))}
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">
        지금 이 유니버스에서 사람들이 글과 작품을 쌓고 있어요.
      </p>
    </section>
  );
}

function FeaturedSeriesShelf({ theme }: { theme: (typeof themeStyles)[UniverseTheme] }) {
  return (
    <section id="featured-series" className="space-y-4">
      <SectionTitle
        icon={<Star className="size-5" />}
        title="대표 시리즈"
        subtitle="이 유니버스에서 먼저 들어가 보면 좋은 공간들이에요."
        theme={theme}
      />

      <div className="grid gap-4 md:grid-cols-3">
        {featuredSeries.map((item) => (
          <Link
            key={item.id}
            href={`/series/${item.id}`}
            className={cn(
              "group relative overflow-hidden rounded-3xl border bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl",
              theme.border
            )}
          >
            <div className={cn("absolute -right-10 -top-10 size-28 rounded-full blur-2xl transition group-hover:scale-125", theme.softPanel)} />

            <div className="relative space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className={cn("grid size-11 place-items-center rounded-2xl ring-1", theme.chip)}>
                  <Disc3 className={cn("size-5", theme.accentText)} />
                </div>

                <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-100">
                  {item.mood}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black">{item.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                  {item.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                <span>{item.tracks} items</span>
                <span>·</span>
                <span>{item.posts} posts</span>
                <span>·</span>
                <span>{item.updatedAt}</span>
              </div>

              <div className="flex items-center gap-1 text-sm font-bold">
                들어가기
                <ChevronRight className="size-4 transition group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function RecentTracksList({ theme }: { theme: (typeof themeStyles)[UniverseTheme] }) {
  return (
    <section id="recent-tracks" className={cn("rounded-3xl border bg-white p-5 shadow-sm", theme.border)}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <SectionTitle
          icon={<Music2 className="size-5" />}
          title="최근 추가된 글"
          subtitle="방금 이 유니버스에 떠오른 작은 기록들이에요."
          theme={theme}
          compact
        />

        <Link
          href="/posts"
          className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
        >
          전체 보기
          <ChevronRight className="size-4" />
        </Link>
      </div>

      <div className="divide-y divide-slate-100">
        {recentTracks.map((track) => (
          <Link
            key={track.id}
            href={`/posts/${track.id}`}
            className="group grid gap-3 py-4 transition first:pt-0 last:pb-0 sm:grid-cols-[1fr_130px_90px]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className={cn("grid size-10 shrink-0 place-items-center rounded-2xl ring-1", theme.chip)}>
                <Headphones className={cn("size-5", theme.accentText)} />
              </div>

              <div className="min-w-0">
                <h3 className="truncate font-black group-hover:underline">{track.title}</h3>
                <p className="text-sm text-slate-500">{track.series}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Sparkles className="size-4" />
              {track.mood}
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Clock3 className="size-4" />
              {track.duration}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function SatelliteMap({ theme }: { theme: (typeof themeStyles)[UniverseTheme] }) {
  return (
    <section className={cn("relative overflow-hidden rounded-3xl border bg-white p-5 shadow-sm", theme.border)}>
      <SectionTitle
        icon={<Orbit className="size-5" />}
        title="작은 위성들"
        subtitle="이 유니버스 안에 있는 세부 공간들이에요."
        theme={theme}
        compact
      />

      <div className="relative mt-5 grid gap-3 md:grid-cols-3">
        {satellites.map((satellite) => (
          <Link
            key={satellite.id}
            href={`/universe/${satellite.id}`}
            className={cn("group rounded-3xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md", theme.border)}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className={cn("size-4 rounded-full bg-gradient-to-br", theme.planet)} />
              <ChevronRight className="size-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-700" />
            </div>

            <h3 className="font-black">{satellite.name}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{satellite.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ActivityFeed({ theme }: { theme: (typeof themeStyles)[UniverseTheme] }) {
  return (
    <section className={cn("rounded-3xl border bg-white p-5 shadow-sm", theme.border)}>
      <div className="mb-4 flex items-center gap-2">
        <MessageCircle className={cn("size-5", theme.accentText)} />
        <h2 className="font-black">활동 피드</h2>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-3">
            <div className={cn("mt-1 size-2.5 shrink-0 rounded-full", theme.softPanel)} />

            <div>
              <p className="text-sm leading-6">
                <strong>{activity.user}</strong>님이 <span className="text-slate-600">{activity.action}</span>
              </p>
              <p className={cn("text-sm font-bold", theme.accentText)}>{activity.target}</p>
              <p className="mt-1 text-xs text-slate-400">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CreateInUniverseCTA({ theme }: { theme: (typeof themeStyles)[UniverseTheme] }) {
  return (
    <section className={cn("overflow-hidden rounded-3xl border bg-white p-5 shadow-sm", theme.border)}>
      <div className={cn("mb-4 grid size-12 place-items-center rounded-2xl bg-gradient-to-br", theme.planet)}>
        <Plus className="size-5 text-slate-950" />
      </div>

      <h2 className="text-lg font-black">이 유니버스에 추가하기</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        새 시리즈나 글을 올려서 이 세계를 더 크게 만들어봐요.
      </p>

      <Link
        href="/create"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800"
      >
        <Plus className="size-4" />
        새로 만들기
      </Link>
    </section>
  );
}

function SectionTitle({
  icon,
  title,
  subtitle,
  theme,
  compact = false,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  theme: (typeof themeStyles)[UniverseTheme];
  compact?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div>
        <div className="flex items-center gap-2">
          <span className={theme.accentText}>{icon}</span>
          <h2 className={cn("font-black", compact ? "text-lg" : "text-2xl")}>{title}</h2>
        </div>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}
