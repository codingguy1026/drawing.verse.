"use client";

import Link from "next/link";
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
function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

type UniverseTheme = "dreamcore" | "space" | "neon";

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
  dreamcore: {
    id: "dreamcore",
    name: "Dreamcore Universe",
    subtitle: "흐릿한 꿈과 새벽 감성이 모이는 음악 세계",
    description:
      "새벽 2시의 방, 오래된 라디오, 흐릿한 기억을 닮은 음악들이 모이는 유니버스예요. 곡 하나하나가 장면처럼 이어지고, 시리즈는 작은 이야기처럼 쌓여요.",
    theme: "dreamcore",
    tags: ["몽환", "새벽", "ambient", "story", "dreamcore"],
    stats: {
      series: 12,
      tracks: 248,
      members: "1.2K",
    },
  },
  "space-radio": {
    id: "space-radio",
    name: "Space Radio",
    subtitle: "우주 정거장에서 흘러나오는 작은 전파들",
    description:
      "멀리 떨어진 행성, 정거장, 무중력의 밤을 닮은 음악들이 모이는 공간이에요. 잔잔한 전자음과 별빛 같은 멜로디가 중심이에요.",
    theme: "space",
    tags: ["우주", "radio", "synth", "ambient", "cinematic"],
    stats: {
      series: 8,
      tracks: 134,
      members: "642",
    },
  },
};

const featuredSeries: SeriesItem[] = [
  {
    id: "night-radio",
    title: "새벽 라디오",
    description: "잠들지 못한 사람들이 남긴 짧은 음악들",
    tracks: 12,
    posts: 34,
    mood: "dreamy",
    updatedAt: "오늘",
  },
  {
    id: "cloud-station",
    title: "구름 정류장",
    description: "비 오는 창가와 흐린 하늘을 닮은 사운드",
    tracks: 18,
    posts: 51,
    mood: "soft",
    updatedAt: "어제",
  },
  {
    id: "lost-school",
    title: "꿈속 학교",
    description: "복도 끝에서 들려오는 이상하고 예쁜 멜로디",
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
    description: "잠 못 드는 밤의 짧은 음악",
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
    action: "새 곡을 추가했어요",
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
    page: string;
    heroGlow: string;
    planet: string;
    chip: string;
    border: string;
    accentText: string;
  }
> = {
  dreamcore: {
    page: "from-[#fbf7ff] via-[#eef4ff] to-[#fff7fb]",
    heroGlow: "bg-[radial-gradient(circle_at_25%_20%,rgba(216,180,254,0.15),transparent)]",
    planet: "from-violet-200 via-sky-100 to-pink-100 shadow-[0_18px_60px_rgba(168,85,247,0.2)]",
    chip: "bg-violet-50 text-violet-700 ring-violet-200/70",
    border: "border-violet-100",
    accentText: "text-violet-600",
  },
  space: {
    page: "from-[#03050a] via-[#0b101d] to-[#03050a]",
    heroGlow: "bg-[radial-gradient(circle_at_75%_30%,rgba(59,130,246,0.15),transparent)]",
    planet: "from-sky-200 via-indigo-200 to-violet-300 shadow-[0_18px_60px_rgba(59,130,246,0.18)]",
    chip: "bg-sky-50 text-sky-700 ring-sky-200/70",
    border: "border-sky-700/30",
    accentText: "text-sky-400",
  },
  neon: {
    page: "from-[#0a0a0a] via-[#101010] to-[#0a0a0a]",
    heroGlow: "bg-[radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.15),transparent)]",
    planet: "from-fuchsia-200 via-cyan-100 to-violet-300 shadow-[0_18px_60px_rgba(236,72,153,0.16)]",
    chip: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200/70",
    border: "border-fuchsia-700/30",
    accentText: "text-fuchsia-400",
  },
};

export default async function UniverseDetailPage({ slug }: { slug: string }) {
  const universe = universes[slug] ?? universes.dreamcore;
  const theme = themeStyles[universe.theme];
  const isDark = universe.theme !== "dreamcore";

  return (
    <main
      className={cn(
        "min-h-screen overflow-hidden",
        isDark ? "bg-[#03050a] text-white" : "bg-white text-slate-950"
      )}
    >
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-5 sm:px-6 lg:px-8">
        <TopBar isDark={isDark} />

        <UniverseHero universe={universe} theme={theme} isDark={isDark} />

        <section className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)_300px]">
          <aside className="space-y-6">
            <UniverseInfoCard
              universe={universe}
              theme={theme}
              isDark={isDark}
            />
            <MembersCard theme={theme} isDark={isDark} />
          </aside>

          <div className="space-y-6">
            <FeaturedSeriesShelf theme={theme} isDark={isDark} />
            <RecentTracksList theme={theme} isDark={isDark} />
            <SatelliteMap theme={theme} isDark={isDark} />
          </div>

          <aside className="space-y-6">
            <ActivityFeed theme={theme} isDark={isDark} />
            <CreateInUniverseCTA theme={theme} isDark={isDark} />
          </aside>
        </section>
      </div>
    </main>
  );
}

function TopBar({ isDark }: { isDark: boolean }) {
  return (
    <header className="flex items-center justify-between">
      <Link
        href="/universes"
        className={cn(
          "group inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition",
          isDark
            ? "bg-white/10 text-white/80 ring-1 ring-white/15 hover:bg-white/15 hover:text-white"
            : "bg-white/70 text-slate-700 ring-1 ring-slate-200 hover:bg-white hover:text-slate-950"
        )}
      >
        <ArrowLeft className="size-4 transition group-hover:-translate-x-0.5" />
        유니버스로 돌아가기
      </Link>

      <Link
        href="/create"
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition",
          isDark
            ? "bg-white text-slate-950 hover:bg-white/90"
            : "bg-slate-950 text-white hover:bg-slate-800"
        )}
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
  isDark,
}: {
  universe: Universe;
  theme: (typeof themeStyles)[UniverseTheme];
  isDark: boolean;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[2rem] border p-6 shadow-2xl sm:p-8 lg:p-10",
        theme.border,
        isDark ? "bg-white/[0.07]" : "bg-white/65",
        "backdrop-blur-2xl"
      )}
    >
      <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/20 px-3 py-1 text-sm backdrop-blur-xl">
            <Sparkles className="size-4" />
            Universe Detail
          </div>

          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              {universe.name}
            </h1>
            <p
              className={cn(
                "max-w-2xl text-lg leading-8 sm:text-xl",
                isDark ? "text-white/72" : "text-slate-600"
              )}
            >
              {universe.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {universe.tags.map((tag) => (
              <span
                key={tag}
                className={cn(
                  "rounded-full px-3 py-1 text-sm font-semibold ring-1 backdrop-blur-xl",
                  theme.chip
                )}
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="#recent-tracks"
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition",
                isDark
                  ? "bg-white text-slate-950 hover:bg-white/90"
                  : "bg-slate-950 text-white hover:bg-slate-800"
              )}
            >
              <Headphones className="size-4" />
              음악 둘러보기
            </Link>

            <Link
              href="#featured-series"
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold ring-1 transition",
                isDark
                  ? "bg-white/10 text-white ring-white/15 hover:bg-white/15"
                  : "bg-white/70 text-slate-800 ring-slate-200 hover:bg-white"
              )}
            >
              <Radio className="size-4" />
              대표 시리즈
            </Link>
          </div>
        </div>

        <div className="relative mx-auto flex aspect-square w-full max-w-[320px] items-center justify-center">
          <div
            className={cn(
              "relative size-40 rounded-full bg-gradient-to-br",
              theme.planet
            )}
          >
            <div className="absolute left-8 top-7 size-8 rounded-full bg-white/40 blur-sm" />
            <div className="absolute bottom-8 right-7 size-12 rounded-full bg-white/25 blur-md" />
          </div>
        </div>
      </div>
    </section>
  );
}

function UniverseInfoCard({
  universe,
  theme,
  isDark,
}: {
  universe: Universe;
  theme: (typeof themeStyles)[UniverseTheme];
  isDark: boolean;
}) {
  return (
    <section
      className={cn(
        "rounded-3xl border p-5 backdrop-blur-2xl",
        theme.border,
        isDark ? "bg-white/[0.07]" : "bg-white/65"
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        <Orbit className={cn("size-5", theme.accentText)} />
        <h2 className="font-black">유니버스 소개</h2>
      </div>

      <p
        className={cn(
          "text-sm leading-7",
          isDark ? "text-white/68" : "text-slate-600"
        )}
      >
        {universe.description}
      </p>

      <div className="mt-5 grid gap-3">
        <StatRow
          icon={<Radio className="size-4" />}
          label="시리즈"
          value={`${universe.stats.series}개`}
        />
        <StatRow
          icon={<Music2 className="size-4" />}
          label="음악"
          value={`${universe.stats.tracks}개`}
        />
        <StatRow
          icon={<Users className="size-4" />}
          label="멤버"
          value={`${universe.stats.members}명`}
        />
      </div>
    </section>
  );
}

function StatRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/35 px-3 py-3 ring-1 ring-white/20">
      <div className="flex items-center gap-2 text-sm opacity-80">
        {icon}
        {label}
      </div>
      <strong className="text-sm">{value}</strong>
    </div>
  );
}

function MembersCard({
  theme,
  isDark,
}: {
  theme: (typeof themeStyles)[UniverseTheme];
  isDark: boolean;
}) {
  const members = ["드", "구", "별", "몽", "라"];

  return (
    <section
      className={cn(
        "rounded-3xl border p-5 backdrop-blur-2xl",
        theme.border,
        isDark ? "bg-white/[0.07]" : "bg-white/65"
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        <Users className={cn("size-5", theme.accentText)} />
        <h2 className="font-black">멤버</h2>
      </div>

      <div className="flex -space-x-2">
        {members.map((member, index) => (
          <div
            key={member}
            className="grid size-10 place-items-center rounded-full border-2 border-white bg-gradient-to-br from-white/80 to-white/30 text-sm font-black shadow-sm"
            style={{ zIndex: members.length - index }}
          >
            {member}
          </div>
        ))}
      </div>

      <p
        className={cn(
          "mt-4 text-sm leading-6",
          isDark ? "text-white/65" : "text-slate-600"
        )}
      >
        지금 이 유니버스에서 사람들이 음악과 이야기를 쌓고 있어요.
      </p>
    </section>
  );
}

function FeaturedSeriesShelf({
  theme,
  isDark,
}: {
  theme: (typeof themeStyles)[UniverseTheme];
  isDark: boolean;
}) {
  return (
    <section id="featured-series" className="space-y-4">
      <SectionTitle
        icon={<Star className="size-5" />}
        title="대표 시리즈"
        subtitle="이 유니버스에서 먼저 들어가 보면 좋은 공간들이에요."
        theme={theme}
        isDark={isDark}
      />

      <div className="grid gap-4 md:grid-cols-3">
        {featuredSeries.map((item) => (
          <Link
            key={item.id}
            href={`/series/${item.id}`}
            className={cn(
              "group relative overflow-hidden rounded-3xl border p-5 backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl",
              theme.border,
              isDark
                ? "bg-white/[0.07] hover:bg-white/[0.1]"
                : "bg-white/70 hover:bg-white"
            )}
          >
            <div className="relative space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="grid size-11 place-items-center rounded-2xl bg-white/45 ring-1 ring-white/30">
                  <Disc3 className={cn("size-5", theme.accentText)} />
                </div>

                <span className="rounded-full bg-white/35 px-2.5 py-1 text-xs font-bold ring-1 ring-white/25">
                  {item.mood}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black">{item.title}</h3>
                <p
                  className={cn(
                    "mt-2 line-clamp-2 text-sm leading-6",
                    isDark ? "text-white/65" : "text-slate-600"
                  )}
                >
                  {item.description}
                </p>
              </div>

              <div
                className={cn(
                  "flex flex-wrap gap-2 text-xs font-semibold",
                  isDark ? "text-white/60" : "text-slate-500"
                )}
              >
                <span>{item.tracks} tracks</span>
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

function RecentTracksList({
  theme,
  isDark,
}: {
  theme: (typeof themeStyles)[UniverseTheme];
  isDark: boolean;
}) {
  return (
    <section
      id="recent-tracks"
      className={cn(
        "rounded-3xl border p-5 backdrop-blur-2xl",
        theme.border,
        isDark ? "bg-white/[0.07]" : "bg-white/70"
      )}
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <SectionTitle
          icon={<Music2 className="size-5" />}
          title="최근 추가된 음악"
          subtitle="방금 이 유니버스에 떠오른 작은 별들이에요."
          theme={theme}
          isDark={isDark}
          compact
        />

        <Link
          href="/tracks"
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-bold transition",
            isDark
              ? "bg-white/10 hover:bg-white/15"
              : "bg-slate-100 hover:bg-slate-200"
          )}
        >
          전체 보기
          <ChevronRight className="size-4" />
        </Link>
      </div>

      <div className="divide-y divide-white/20">
        {recentTracks.map((track) => (
          <Link
            key={track.id}
            href={`/tracks/${track.id}`}
            className="group grid gap-3 py-4 transition first:pt-0 last:pb-0 sm:grid-cols-[1fr_130px_90px]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/40 ring-1 ring-white/25">
                <Headphones className={cn("size-5", theme.accentText)} />
              </div>

              <div className="min-w-0">
                <h3 className="truncate font-black group-hover:underline">
                  {track.title}
                </h3>
                <p
                  className={cn(
                    "text-sm",
                    isDark ? "text-white/55" : "text-slate-500"
                  )}
                >
                  {track.series}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm opacity-70">
              <Sparkles className="size-4" />
              {track.mood}
            </div>

            <div className="flex items-center gap-2 text-sm opacity-70">
              <Clock3 className="size-4" />
              {track.duration}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function SatelliteMap({
  theme,
  isDark,
}: {
  theme: (typeof themeStyles)[UniverseTheme];
  isDark: boolean;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border p-5 backdrop-blur-2xl",
        theme.border,
        isDark ? "bg-white/[0.07]" : "bg-white/70"
      )}
    >
      <SectionTitle
        icon={<Orbit className="size-5" />}
        title="작은 위성들"
        subtitle="이 유니버스 안에 있는 세부 공간들이에요."
        theme={theme}
        isDark={isDark}
        compact
      />

      <div className="relative mt-5 grid gap-3 md:grid-cols-3">
        {satellites.map((satellite) => (
          <Link
            key={satellite.id}
            href={`/universes/${satellite.id}`}
            className={cn(
              "group rounded-3xl border p-4 transition hover:-translate-y-0.5",
              theme.border,
              isDark
                ? "bg-white/[0.06] hover:bg-white/[0.1]"
                : "bg-white/55 hover:bg-white"
            )}
          >
            <div className="mb-4 flex items-center justify-between">
              <div
                className={cn(
                  "size-4 rounded-full bg-gradient-to-br",
                  theme.planet
                )}
              />
              <ChevronRight className="size-4 opacity-45 transition group-hover:translate-x-1 group-hover:opacity-100" />
            </div>

            <h3 className="font-black">{satellite.name}</h3>
            <p
              className={cn(
                "mt-2 text-sm leading-6",
                isDark ? "text-white/60" : "text-slate-600"
              )}
            >
              {satellite.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ActivityFeed({
  theme,
  isDark,
}: {
  theme: (typeof themeStyles)[UniverseTheme];
  isDark: boolean;
}) {
  return (
    <section
      className={cn(
        "rounded-3xl border p-5 backdrop-blur-2xl",
        theme.border,
        isDark ? "bg-white/[0.07]" : "bg-white/65"
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        <MessageCircle className={cn("size-5", theme.accentText)} />
        <h2 className="font-black">활동 피드</h2>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-3">
            <div className="mt-1 size-2.5 shrink-0 rounded-full bg-current opacity-60" />

            <div>
              <p className="text-sm leading-6">
                <strong>{activity.user}</strong>님이{" "}
                <span className={isDark ? "text-white/70" : "text-slate-600"}>
                  {activity.action}
                </span>
              </p>
              <p className={cn("text-sm font-bold", theme.accentText)}>
                {activity.target}
              </p>
              <p
                className={cn(
                  "mt-1 text-xs",
                  isDark ? "text-white/45" : "text-slate-400"
                )}
              >
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CreateInUniverseCTA({
  theme,
  isDark,
}: {
  theme: (typeof themeStyles)[UniverseTheme];
  isDark: boolean;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-3xl border p-5 backdrop-blur-2xl",
        theme.border,
        isDark ? "bg-white/[0.07]" : "bg-white/65"
      )}
    >
      <div
        className={cn(
          "mb-4 grid size-12 place-items-center rounded-2xl bg-gradient-to-br",
          theme.planet
        )}
      >
        <Plus className="size-5 text-slate-950" />
      </div>

      <h2 className="text-lg font-black">이 유니버스에 추가하기</h2>
      <p
        className={cn(
          "mt-2 text-sm leading-6",
          isDark ? "text-white/62" : "text-slate-600"
        )}
      >
        새 시리즈나 음악을 올려서 이 세계를 더 크게 만들어봐요.
      </p>

      <Link
        href="/create"
        className={cn(
          "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition",
          isDark
            ? "bg-white text-slate-950 hover:bg-white/90"
            : "bg-slate-950 text-white hover:bg-slate-800"
        )}
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
  isDark,
  compact = false,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  theme: (typeof themeStyles)[UniverseTheme];
  isDark: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex gap-3",
        compact ? "items-start" : "items-end justify-between"
      )}
    >
      <div>
        <div className="flex items-center gap-2">
          <span className={theme.accentText}>{icon}</span>
          <h2 className={cn("font-black", compact ? "text-lg" : "text-2xl")}>
            {title}
          </h2>
        </div>
        <p
          className={cn(
            "mt-1 text-sm",
            isDark ? "text-white/58" : "text-slate-500"
          )}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}
