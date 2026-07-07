"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Search, PenLine, Star, Users, MessageSquare, ChevronRight, Globe, Info, Zap, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";

type Role = "admin" | "manager" | "member" | "guest";
type Badge = "공지" | "인기" | "그림" | "썰" | "질문";
type Tab = "전체" | Badge;
type ViewMode = "list" | "gallery";

type CurrentUser = {
  id: string;
  nickname: string;
  role: Role;
};

type Channel = {
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  members: number;
  online: number;
  posts: number;
  ranking: number;
  tags: string[];
  profileEmoji: string;
  profile_url?: string;
  banner_url?: string;
};

type Post = {
  id: number;
  badge: Badge;
  title: string;
  author: string;
  comments: number;
  views: number;
  time: string;
  hot: boolean;
  hasImage: boolean;
  preview: string;
  created_at: string;
};

type AdminAction = {
  title: string;
  detail: string;
  icon: string;
  danger?: boolean;
};

type UniverseQuest = {
  title: string;
  detail: string;
  reward: string;
  progress: number;
};

type LoreNode = {
  title: string;
  detail: string;
  energy: number;
};

type CreatorSignal = {
  nickname: string;
  role: string;
  signal: string;
};

const tabs: Tab[] = ["전체", "인기", "그림", "썰", "질문", "공지"];

const adminActions: AdminAction[] = [
  { icon: "🛠", title: "채널 기본 설정", detail: "이름, 설명, 탭, 공개 범위 수정" },
  { icon: "📌", title: "공지/상단글 관리", detail: "공지 고정, 중요글 지정, 배너 공지" },
  { icon: "🧹", title: "게시글 관리", detail: "숨김, 잠금, 이동, 삭제 요청 처리" },
  { icon: "💬", title: "댓글/신고함", detail: "신고 댓글 확인, 분쟁 스레드 잠금" },
  { icon: "👥", title: "멤버 권한", detail: "매니저 지정, 차단, 뮤트, 활동 제한" },
  { icon: "🖼", title: "미디어 관리", detail: "프로필, 배너, 갤러리 대표 이미지 변경" },
  { icon: "🔔", title: "채널 알림", detail: "이벤트, 공지, 업데이트 알림 발송" },
  { icon: "🚫", title: "차단/필터", detail: "키워드 필터, 도배 방지, 새 계정 제한", danger: true },
];

const universeQuests: UniverseQuest[] = [
  {
    title: "오늘의 첫 설정글",
    detail: "캐릭터의 비밀 하나를 공개하면 파동 보너스가 붙어요.",
    reward: "+18 공명",
    progress: 72,
  },
  {
    title: "서로의 자캐 한줄평",
    detail: "댓글 5개 이상 남기면 유니버스 온도가 올라가요.",
    reward: "댓글 배지",
    progress: 46,
  },
  {
    title: "갤러리 별자리 만들기",
    detail: "오늘 올라온 그림 3개가 연결되면 대표 별자리가 생겨요.",
    reward: "별자리 슬롯",
    progress: 88,
  },
];

const loreNodes: LoreNode[] = [
  { title: "마법학교", detail: "요즘 가장 많이 언급된 배경", energy: 91 },
  { title: "금지구역", detail: "댓글로 설정 확장중", energy: 76 },
  { title: "별빛 기사단", detail: "새 캐릭터 관계도 생성됨", energy: 63 },
  { title: "분홍 달", detail: "팬아트 파동 상승", energy: 58 },
];

const creatorSignals: CreatorSignal[] = [
  { nickname: "별가루펜", role: "그림", signal: "오늘 그림 파동 1위" },
  { nickname: "설정충99", role: "세계관", signal: "댓글 확장률 높음" },
  { nickname: "드림낙서러", role: "자캐", signal: "첫인상 밈 생성" },
];

const starterPrompts = [
  "내 자캐가 절대 숨기고 싶은 비밀은?",
  "이 세계에서 가장 위험한 장소는?",
  "내 캐릭터를 색깔 하나로 표현하면?",
  "오늘 그림의 분위기를 한 문장으로 말하면?",
];

function formatNumber(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function canManageChannel(user: CurrentUser | null) {
  return user?.role === "admin" || user?.role === "manager";
}

function getPulseScore(online: number, members: number, hotPostCount: number) {
  const onlineRatio = members <= 0 ? 0 : Math.min(online / members, 0.05) / 0.05;
  const hotRatio = Math.min(Math.max(hotPostCount, 0) / 5, 1);
  return Math.round(Math.max(12, Math.min(99, onlineRatio * 58 + hotRatio * 34 + 8)));
}

function getPulseLabel(score: number) {
  if (score >= 78) return "폭발공명";
  if (score >= 55) return "활발공명";
  if (score >= 30) return "몽글공명";
  return "고요공명";
}

function getQuestState(progress: number) {
  if (progress >= 85) return "완료 임박";
  if (progress >= 55) return "진행중";
  return "시작 가능";
}

function getLoreSize(energy: number) {
  return Math.max(42, Math.min(92, energy));
}

function filterPosts(sourcePosts: Post[], activeTab: Tab, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  return sourcePosts.filter((post) => {
    const tabMatch = activeTab === "전체" || post.badge === activeTab;
    const queryMatch =
      normalizedQuery.length === 0 ||
      post.title.toLowerCase().includes(normalizedQuery) ||
      post.author.toLowerCase().includes(normalizedQuery) ||
      post.badge.toLowerCase().includes(normalizedQuery);

    return tabMatch && queryMatch;
  });
}

function readImageFile(file: File, onLoad: (dataUrl: string) => void) {
  if (!file.type.startsWith("image/")) return;

  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === "string") onLoad(reader.result);
  };
  reader.readAsDataURL(file);
}

function runSelfTests() {
  console.assert(formatNumber(12840) === "12,840", "formatNumber should format ko-KR numbers");
  console.assert(canManageChannel({ id: "1", nickname: "관리자", role: "admin" }) === true, "admin can manage");
  console.assert(canManageChannel({ id: "2", nickname: "매니저", role: "manager" }) === true, "manager can manage");
  console.assert(canManageChannel({ id: "3", nickname: "멤버", role: "member" }) === false, "member cannot manage");
  console.assert(getPulseScore(0, 0, 0) === 12, "pulse should have a calm minimum");
  console.assert(getPulseLabel(64) === "활발공명", "pulse label should match score band");
  console.assert(getQuestState(90) === "완료 임박", "quest state should detect almost completed quests");
  console.assert(getQuestState(40) === "시작 가능", "quest state should detect early quests");
  console.assert(getLoreSize(120) === 92, "lore size should clamp high values");
  console.assert(getLoreSize(10) === 42, "lore size should clamp low values");
}

if (typeof window !== "undefined") runSelfTests();

function MiniTopBar({ visible, profilePreview, channel }: { visible: boolean; profilePreview: string | null; channel: Channel }) {
  return (
    <div
      className={`fixed left-0 right-0 top-0 z-50 border-b border-slate-200/60 bg-white/80 dark:border-white/10 dark:bg-[#080914]/90 backdrop-blur-2xl transition-all duration-300 ${visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex min-w-0 items-center gap-3">
          <ChannelAvatar channel={channel} profilePreview={profilePreview} small />
          <div className="min-w-0">
            <div className="truncate text-sm font-black text-slate-900 dark:text-white">{channel.name}</div>
            <div className="truncate text-xs text-slate-500 dark:text-violet-100/50">
              {formatNumber(channel.members)}명 · 지금 {formatNumber(channel.online)}명
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="hidden rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10 sm:block">
            구독중
          </button>
          <button className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-black text-white hover:bg-slate-800 dark:bg-white dark:text-[#10111d] dark:hover:bg-slate-100">글쓰기</button>
        </div>
      </div>
    </div>
  );
}

function ChannelAvatar({ channel, profilePreview, small = false }: { channel: Channel; profilePreview: string | null; small?: boolean }) {
  return (
    <div
      className={`grid shrink-0 place-items-center overflow-hidden bg-gradient-to-br from-fuchsia-300 via-violet-300 to-cyan-200 font-black text-[#171024] ring-4 ring-white/20 dark:ring-white/15 ${small ? "h-10 w-10 rounded-2xl text-lg" : "h-24 w-24 rounded-[1.8rem] text-5xl"
        }`}
    >
      {profilePreview ? <img src={profilePreview} alt="채널 프로필" className="h-full w-full object-cover" /> : (channel.profile_url ? <img src={channel.profile_url} alt="채널 프로필" className="h-full w-full object-cover" /> : channel.profileEmoji)}
    </div>
  );
}

function ChannelHeader({
  channel,
  canManage,
  profilePreview,
  bannerPreview,
  onPickProfile,
  onPickBanner,
  isSubscribed,
  onToggleSubscribe,
  subLoading
}: {
  channel: Channel;
  canManage: boolean;
  profilePreview: string | null;
  bannerPreview: string | null;
  onPickProfile: () => void;
  onPickBanner: () => void;
  isSubscribed: boolean;
  onToggleSubscribe: () => void;
  subLoading: boolean;
}) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_28px_120px_rgba(0,0,0,0.05)] dark:border-white/10 dark:bg-[#111827] dark:shadow-[0_28px_120px_rgba(0,0,0,0.45)]">
      {bannerPreview ? (
        <img src={bannerPreview} alt="채널 배너" className="absolute inset-0 h-full w-full object-cover opacity-70" />
      ) : (
        (channel.banner_url ? (
          <img src={channel.banner_url} alt="채널 배너" className="absolute inset-0 h-full w-full object-cover opacity-70" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(244,114,182,0.15),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.12),transparent_34%),linear-gradient(135deg,rgba(248,250,252,1),rgba(241,245,249,1))] dark:bg-[radial-gradient(circle_at_15%_15%,rgba(244,114,182,0.34),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.26),transparent_34%),linear-gradient(135deg,rgba(17,24,39,1),rgba(30,24,58,1))]" />
        ))
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/30 to-white/60 dark:from-black/25 dark:via-black/45 dark:to-black/70" />

      {canManage && (
        <button
          onClick={onPickBanner}
          className="absolute right-5 top-5 z-20 rounded-full border border-slate-200/50 bg-white/70 px-4 py-2 text-xs font-black text-slate-900 backdrop-blur-xl hover:bg-white dark:border-white/15 dark:bg-black/35 dark:text-white dark:hover:bg-black/50"
        >
          🖼 배너 변경
        </button>
      )}

      <div className="relative z-10 p-5 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-black text-violet-600 backdrop-blur-xl dark:border-white/15 dark:bg-white/10 dark:text-violet-50">
              👑 랭킹 #{channel.ranking} · Dream Channel
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <ChannelAvatar channel={channel} profilePreview={profilePreview} />
                {canManage && (
                  <button
                    onClick={onPickProfile}
                    className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white shadow-xl hover:scale-105 dark:border-white/25 dark:bg-[#111827]/90 dark:backdrop-blur-xl"
                    aria-label="채널 프로필 변경"
                  >
                    📷
                  </button>
                )}
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">{channel.name}</h1>
                <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-violet-100/75 sm:text-base">{channel.subtitle}</p>
              </div>
            </div>

            <p className="mt-6 max-w-3xl text-sm leading-7 text-slate-600 dark:text-violet-50/78 sm:text-base">{channel.description}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {channel.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 dark:border-white/12 dark:bg-white/8 dark:text-white/80">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-600 hover:bg-slate-50 dark:border-white/12 dark:bg-white/10 dark:text-white dark:hover:bg-white/15">🔔 알림</button>
            <button 
              onClick={onToggleSubscribe}
              disabled={subLoading}
              className={`rounded-full px-5 py-2.5 text-sm font-black shadow-xl transition-all hover:scale-[1.02] ${
                isSubscribed 
                ? "bg-slate-100 text-slate-400 border border-slate-200 dark:bg-white/10 dark:text-white dark:border-white/10 shadow-none" 
                : "bg-slate-900 text-white dark:bg-white dark:text-[#151021] shadow-slate-200 dark:shadow-white/10"
              }`}
            >
              {isSubscribed ? "✓ 구독중" : "⭐ 구독하기"}
            </button>
            <button className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-600 hover:bg-slate-50 dark:border-white/12 dark:bg-white/10 dark:text-white dark:hover:bg-white/15">⋯</button>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_70px_rgba(0,0,0,0.03)] dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_18px_70px_rgba(0,0,0,0.18)] backdrop-blur-xl">
      <div className="mb-2 text-xs font-bold text-slate-400 dark:text-violet-100/60">{icon} {label}</div>
      <div className="text-xl font-black tracking-tight text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}

function PulsePanel({ score }: { score: number }) {
  return (
    <section className="mt-5 overflow-hidden rounded-[2rem] border border-slate-200 bg-white/50 p-5 shadow-[0_24px_100px_rgba(0,0,0,0.03)] backdrop-blur-2xl dark:border-cyan-200/15 dark:bg-white/[0.055] dark:shadow-[0_24px_100px_rgba(0,0,0,0.24)]">
      <div className="grid gap-5 lg:grid-cols-[260px_1fr] lg:items-center">
        <div>
          <div className="mb-2 text-xs font-black text-cyan-600 dark:text-cyan-100/80">DV PULSE</div>
          <div className="flex items-end gap-3">
            <div className="grid h-20 w-20 place-items-center rounded-[1.7rem] bg-gradient-to-br from-cyan-200 via-violet-300 to-fuchsia-300 text-3xl text-[#151021] shadow-[0_0_45px_rgba(125,211,252,0.22)]">◈</div>
            <div>
              <div className="text-4xl font-black text-slate-900 dark:text-white">{score}</div>
              <div className="text-sm font-black text-cyan-600/80 dark:text-cyan-100/75">{getPulseLabel(score)}</div>
            </div>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200 dark:bg-white/8 dark:ring-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-200 via-violet-300 to-fuchsia-300" style={{ width: `${score}%` }} />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {[
            ["✨ 오늘의 공기", "설정글과 캐릭터 썰이 잘 붙는 흐름이에요.", "몽글 +18%"],
            ["🔥 핫스팟", "첫인상 추측 글이 중심 궤도에 올라왔어요.", "댓글 상승"],
            ["🖼 그림 파동", "마법학교 컨셉 그림이 조용히 퍼지는 중이에요.", "확산중"],
          ].map(([title, detail, metric]) => (
            <article key={title} className="rounded-[1.4rem] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-black/15">
              <div className="mb-3 inline-flex rounded-full bg-cyan-50 px-2.5 py-1 text-[11px] font-black text-cyan-600 ring-1 ring-cyan-200 dark:bg-white/8 dark:text-cyan-50/75 dark:ring-white/10">{metric}</div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">{title}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-violet-50/58">{detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrendTicker() {
  const trends = ["🔥 자캐 첫인상 테스트 유행중", "🌌 세계관 떡밥 확산중", "✨ 그림 파동 급상승", "💬 새벽 감성썰 증가중"];

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white/50 py-3 dark:border-white/10 dark:bg-white/[0.045]">
      <div className="animate-[marquee_18s_linear_infinite] flex w-max gap-8 px-4 text-sm font-black text-slate-600 dark:text-violet-50/80">
        {[...trends, ...trends].map((item, index) => (
          <div key={`${item}-${index}`} className="shrink-0">{item}</div>
        ))}
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}

function UniverseIdentityLayer() {
  return (
    <section className="mt-5 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-fuchsia-50 via-violet-50 to-cyan-50 p-5 shadow-[0_24px_100px_rgba(0,0,0,0.02)] backdrop-blur-2xl dark:border-fuchsia-200/15 dark:bg-gradient-to-br dark:from-fuchsia-300/[0.09] dark:via-violet-300/[0.07] dark:to-cyan-300/[0.08] dark:shadow-[0_24px_100px_rgba(0,0,0,0.2)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">🌌 유니버스 정체성</h2>
            <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-violet-100/50">일반 게시판과 다르게, 이 채널은 하나의 세계처럼 성장해요.</p>
          </div>
          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black text-cyan-600 ring-1 ring-slate-200 dark:bg-white/10 dark:text-cyan-100 dark:ring-white/10">WORLD CORE</span>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {[
            ["세계관 온도", "82°", "설정글이 활발해요"],
            ["창작 친화도", "A+", "부드러운 피드백 많음"],
            ["공명 타입", "Dream", "몽환/캐릭터 중심"],
          ].map(([label, value, detail]) => (
            <div key={label} className="rounded-[1.4rem] border border-white/50 bg-white/60 p-4 dark:border-white/10 dark:bg-black/20">
              <div className="text-xs font-black text-slate-400 dark:text-violet-100/45">{label}</div>
              <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{value}</div>
              <div className="mt-2 text-xs font-semibold text-slate-500 dark:text-violet-100/55">{detail}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_100px_rgba(0,0,0,0.02)] backdrop-blur-2xl dark:border-cyan-200/12 dark:bg-white/[0.055] dark:shadow-[0_24px_100px_rgba(0,0,0,0.18)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">🪄 첫 글 도우미</h2>
          <span className="text-xs font-black text-slate-300 dark:text-violet-100/40">NEWBIE SAFE</span>
        </div>
        <div className="grid gap-2">
          {starterPrompts.map((prompt) => (
            <button key={prompt} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-left text-sm font-bold text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:bg-black/20 dark:text-violet-50/78 dark:hover:bg-white/[0.08]">
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function UniverseQuestBoard() {
  return (
    <section className="mt-5 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_100px_rgba(0,0,0,0.02)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[0_24px_100px_rgba(0,0,0,0.2)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">🎮 오늘의 유니버스 퀘스트</h2>
          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-violet-100/45">활동을 숙제처럼 만들지 말고, 놀거리처럼 보여주는 DV 전용 시스템이에요.</p>
        </div>
        <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-black text-white hover:bg-slate-800 dark:bg-cyan-200 dark:text-[#121020] dark:hover:bg-cyan-100">보상 보기</button>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {universeQuests.map((quest) => (
          <article key={quest.title} className="rounded-[1.5rem] border border-slate-100 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-black/20">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-[11px] font-black text-cyan-700 ring-1 ring-cyan-200 dark:bg-white/10 dark:text-cyan-100 dark:ring-white/10">{getQuestState(quest.progress)}</span>
              <span className="text-xs font-black text-fuchsia-600 dark:text-fuchsia-100/80">{quest.reward}</span>
            </div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">{quest.title}</h3>
            <p className="mt-2 min-h-[40px] text-xs leading-5 text-slate-500 dark:text-violet-100/55">{quest.detail}</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-fuchsia-300 via-violet-300 to-cyan-200" style={{ width: `${quest.progress}%` }} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function LoreConstellation() {
  return (
    <section className="mt-5 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_100px_rgba(0,0,0,0.02)] backdrop-blur-2xl dark:border-violet-200/12 dark:bg-gradient-to-br dark:from-violet-300/[0.07] dark:to-cyan-300/[0.04] dark:shadow-[0_24px_100px_rgba(0,0,0,0.18)]">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">🧬 세계관 별자리</h2>
          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-violet-100/45">자주 언급되는 설정이 노드처럼 연결돼요.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500 ring-1 ring-slate-200 dark:bg-violet-200/12 dark:text-violet-50 dark:ring-white/10">AUTO MAP</span>
      </div>

      <div className="relative min-h-[230px] overflow-hidden rounded-[1.5rem] border border-slate-100 bg-slate-50/30 p-5 dark:border-white/10 dark:bg-black/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(0,0,0,0.03),transparent_20%),radial-gradient(circle_at_70%_60%,rgba(0,0,0,0.03),transparent_24%)] dark:bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.13),transparent_20%),radial-gradient(circle_at_70%_60%,rgba(125,211,252,0.13),transparent_24%)]" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          {loreNodes.map((node) => (
            <div key={node.title} className="flex flex-col items-center text-center">
              <div
                className="grid place-items-center rounded-full bg-gradient-to-br from-fuchsia-300/80 to-cyan-200/80 font-black text-[#151021] shadow-[0_0_42px_rgba(125,211,252,0.15)] dark:shadow-[0_0_42px_rgba(125,211,252,0.2)]"
                style={{ width: getLoreSize(node.energy), height: getLoreSize(node.energy) }}
              >
                {node.energy}
              </div>
              <div className="mt-3 text-sm font-black text-slate-900 dark:text-white">{node.title}</div>
              <div className="mt-1 text-xs leading-5 text-slate-500 dark:text-violet-100/48">{node.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AdminPanel({ canManage, user, onPickProfile, onPickBanner }: { canManage: boolean; user: CurrentUser; onPickProfile: () => void; onPickBanner: () => void }) {
  if (!canManage) {
    return (
      <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl">
        <div className="mb-3 text-sm font-black text-white">🔒 관리자 설정</div>
        <p className="text-sm leading-6 text-violet-50/58">채널 프로필과 배너는 관리자만 변경할 수 있어요.</p>
      </div>
    );
  }

  return (
    <div className="rounded-[1.7rem] border border-fuchsia-200/18 bg-fuchsia-200/[0.075] p-5 shadow-[0_22px_90px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-white">👑 운영센터</h2>
          <p className="mt-1 text-xs font-semibold text-violet-100/55">{user.nickname}님은 관리자 권한이에요.</p>
        </div>
        <span className="rounded-full bg-fuchsia-200/15 px-2.5 py-1 text-[11px] font-black text-fuchsia-100">ADMIN</span>
      </div>

      <div className="grid gap-2">
        <button onClick={onPickProfile} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.075] px-4 py-3 text-sm font-black text-violet-50 hover:bg-white/[0.12]">
          <span>📷 프로필 이미지 변경</span><span>업로드</span>
        </button>
        <button onClick={onPickBanner} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.075] px-4 py-3 text-sm font-black text-violet-50 hover:bg-white/[0.12]">
          <span>🖼 배너 이미지 변경</span><span>업로드</span>
        </button>
      </div>

      <div className="mt-4 grid gap-2">
        {adminActions.map((action) => (
          <button key={action.title} className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition hover:bg-white/[0.08] ${action.danger ? "border-rose-300/15 bg-rose-300/[0.06]" : "border-white/10 bg-black/20"}`}>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/10">{action.icon}</div>
              <div>
                <div className="text-sm font-black text-white">{action.title}</div>
                <div className="text-xs text-violet-100/50">{action.detail}</div>
              </div>
            </div>
            <span className="text-violet-100/35">›</span>
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-fuchsia-200/10 bg-black/20 p-4">
        <div className="mb-2 text-sm font-black text-fuchsia-100">최근 운영 로그</div>
        <div className="space-y-2 text-xs text-violet-100/55">
          <div>• 배너가 변경됐어요.</div>
          <div>• 공지글이 상단에 고정됐어요.</div>
          <div>• 신고 댓글 3개가 검토 대기중이에요.</div>
        </div>
      </div>
    </div>
  );
}

function BoardToolbar({ activeTab, setActiveTab, query, setQuery, viewMode, setViewMode }: { activeTab: Tab; setActiveTab: (tab: Tab) => void; query: string; setQuery: (query: string) => void; viewMode: ViewMode; setViewMode: (mode: ViewMode) => void }) {
  return (
    <div className="sticky top-16 z-30 rounded-3xl border border-white/10 bg-[#0b0a19]/80 p-3 shadow-[0_18px_90px_rgba(0,0,0,0.25)] backdrop-blur-2xl">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-black transition ${activeTab === tab ? "bg-white text-[#121020] shadow-lg shadow-white/10" : "bg-white/7 text-violet-100/70 hover:bg-white/11 hover:text-white"}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-violet-100/55 xl:w-72">
            🔎
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="채널 안에서 검색" className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-violet-100/35" />
          </label>

          <div className="flex gap-2">
            <button onClick={() => setViewMode("list")} className={`rounded-full px-3 py-2 text-sm font-black ${viewMode === "list" ? "bg-cyan-200 text-[#121020]" : "bg-white/7 text-violet-100/70"}`}>리스트</button>
            <button onClick={() => setViewMode("gallery")} className={`rounded-full px-3 py-2 text-sm font-black ${viewMode === "gallery" ? "bg-cyan-200 text-[#121020]" : "bg-white/7 text-violet-100/70"}`}>갤러리</button>
            <button className="rounded-full bg-violet-300/16 px-3 py-2 text-sm font-black text-violet-50 ring-1 ring-violet-200/15">최신순⌄</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BadgePill({ badge }: { badge: Badge }) {
  const style =
    badge === "공지"
      ? "bg-rose-300/18 text-rose-100 ring-rose-200/20"
      : badge === "인기"
        ? "bg-orange-300/18 text-orange-100 ring-orange-200/20"
        : "bg-violet-300/16 text-violet-100 ring-violet-200/18";

  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ring-1 ${style}`}>{badge}</span>;
}

function PostRow({ post }: { post: Post }) {
  return (
    <article className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur-xl transition hover:bg-white/[0.085] md:grid-cols-[74px_1fr_72px_72px_78px] md:items-center">
      <div className="flex items-center gap-2 md:block">
        <BadgePill badge={post.badge} />
        {post.hasImage && <span className="rounded-full bg-cyan-200/12 px-2 py-1 text-[11px] font-black text-cyan-100 md:mt-2 md:inline-block">IMG</span>}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {post.hot && <span className="text-xs">🔥</span>}
          <h3 className="truncate text-sm font-black text-white sm:text-base">{post.title}</h3>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-violet-100/50">
          <span>{post.author}</span>
          <span>{post.time}</span>
          <span>조회 {formatNumber(post.views)}</span>
        </div>
      </div>

      <div className="hidden text-center text-sm font-bold text-violet-100/60 md:block">조회<br />{formatNumber(post.views)}</div>
      <div className="hidden text-center text-sm font-bold text-cyan-100/80 md:block">댓글<br />{post.comments}</div>
      <button className="justify-self-start rounded-full border border-white/10 bg-white/7 px-3 py-2 text-xs font-black text-violet-50/75 hover:bg-white/12 md:justify-self-end">열기</button>
    </article>
  );
}

function GalleryGrid({ posts }: { posts: Post[] }) {
  const galleryPosts = posts.filter((post) => post.hasImage);

  if (galleryPosts.length === 0) {
    return <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.04] p-10 text-center text-sm font-bold text-violet-100/54">이미지 글이 없어요.</div>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {galleryPosts.map((post) => (
        <article key={post.id} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.055] transition hover:-translate-y-1 hover:bg-white/[0.08]">
          <div className={`h-36 bg-gradient-to-br ${post.preview} relative`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_28%)]" />
            <div className="absolute bottom-3 left-3"><BadgePill badge={post.badge} /></div>
          </div>
          <div className="p-4">
            <h3 className="line-clamp-2 text-sm font-black text-white">{post.title}</h3>
            <div className="mt-2 text-xs text-violet-100/50">{post.author} · 댓글 {post.comments}</div>
          </div>
        </article>
      ))}
    </div>
  );
}

function Board({ posts, viewMode, slug }: { posts: Post[]; viewMode: ViewMode; slug: string }) {
  return (
    <div className="mt-4 rounded-[1.8rem] border border-white/10 bg-white/[0.035] p-3 shadow-[0_22px_100px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between px-2 py-1">
        <div>
          <h2 className="text-lg font-black text-white">채널 게시판</h2>
          <p className="mt-1 text-xs font-semibold text-violet-100/45">아카식 밀도는 살리고, DV식 파동을 얹었어요.</p>
        </div>
        <Link 
          href={`/universe/${slug}/write`}
          className="rounded-full bg-gradient-to-r from-fuchsia-300 to-cyan-200 px-4 py-2 text-sm font-black text-[#171024] shadow-lg shadow-fuchsia-500/10 hover:scale-[1.02] flex items-center gap-2"
        >
          ✍ 글쓰기
        </Link>
      </div>

      <div className="mb-2 rounded-2xl border border-cyan-200/10 bg-cyan-200/[0.06] px-4 py-3 text-sm font-bold text-cyan-50/85">
        📌 공지 · 창작물 출처 표기와 부드러운 피드백 규칙을 확인해주세요.
      </div>

      {viewMode === "gallery" ? (
        <GalleryGrid posts={posts} />
      ) : (
        <div className="space-y-2">
          {posts.map((post) => <PostRow key={post.id} post={post} />)}
          {posts.length === 0 && <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.04] p-10 text-center text-sm font-bold text-violet-100/54">검색 결과가 없어요.</div>}
        </div>
      )}
    </div>
  );
}

function SidePanel({ canManage }: { canManage: boolean }) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-[1.7rem] border border-cyan-200/10 bg-gradient-to-br from-cyan-300/[0.08] to-violet-300/[0.05] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-black text-white">실시간 궤도</h2>
          <span className="rounded-full bg-green-400/15 px-2 py-1 text-[11px] font-black text-green-200">LIVE</span>
        </div>
        <div className="space-y-3">
          {["드림낙서러 님 글 급상승", "세계관 썰 댓글 폭주중", "새 유니버스 생성됨", "팬아트 탭 반응 증가"].map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-bold text-violet-50/75">{item}</div>
          ))}
          {[
            ["📜 가이드북", "세계관 핵심 설정"],
            ["🎭 캐릭터 도감", "주요 인물 리스트"],
            ["🗺 월드맵", "지리 및 장소 정보"],
          ].map(([title, detail]) => (
            <div key={title} className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-violet-400" />
              <div>
                <div className="text-xs font-black text-slate-900 dark:text-white">{title}</div>
                <div className="text-[10px] font-bold text-slate-400 dark:text-violet-100/40">{detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_100px_rgba(0,0,0,0.02)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[0_24px_100px_rgba(0,0,0,0.2)]">
        <h2 className="mb-4 text-sm font-black text-slate-900 dark:text-white">👥 최근 활동 멤버</h2>
        <div className="flex -space-x-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-slate-200 dark:border-[#121020] dark:bg-white/10" />
          ))}
          <div className="grid h-10 w-10 place-items-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-black text-slate-400 dark:border-[#121020] dark:bg-white/5 dark:text-white/30">+42</div>
        </div>
      </section>
    </aside>
  );
}

export default function UniverseDetailClient({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  
  const [activeTab, setActiveTab] = useState<Tab>("전체");
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [collapsed, setCollapsed] = useState(false);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subLoading, setSubLoading] = useState(false);

  const profileInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      const decodedSlug = decodeURIComponent(slug).trim();

      const { data: u } = await supabase
        .from("universes")
        .select("*")
        .eq("slug", decodedSlug)
        .maybeSingle();

      if (!u) {
        setLoading(false);
        return;
      }

      const { data: p } = await supabase
        .from("posts")
        .select("*")
        .eq("universe_slug", u.slug)
        .order("created_at", { ascending: false });

      const { data: auth } = await supabase.auth.getUser();
      let currUser: CurrentUser | null = null;
      if (auth.user) {
        currUser = {
          id: auth.user.id,
          nickname: auth.user.user_metadata?.nickname || "Explorer",
          role: "member"
        };
        
        const { data: sub } = await supabase
          .from("universe_subscriptions")
          .select("id")
          .eq("user_id", auth.user.id)
          .eq("universe_slug", u.slug)
          .maybeSingle();
        setIsSubscribed(!!sub);
      }

      if (!ignore) {
        setChannel({
          slug: u.slug,
          name: u.name,
          subtitle: u.category || "Original Universe",
          description: u.description || "No description provided.",
          members: u.subscriber_count || 0,
          online: Math.floor(Math.random() * 50),
          posts: u.post_count || 0,
          ranking: Math.floor(Math.random() * 10) + 1,
          tags: u.tags || ["Creative", "Universe"],
          profileEmoji: "✦",
          profile_url: u.profile_url,
          banner_url: u.banner_url
        });
        
        setPosts((p as any[])?.map(item => ({
          id: item.id,
          badge: item.category as Badge || "그림",
          title: item.title,
          author: item.author || "Anonymous",
          comments: item.comment_count || 0,
          views: item.like_count || 0,
          time: new Date(item.created_at).toLocaleDateString(),
          hot: (item.comment_count || 0) > 10,
          hasImage: !!item.image_url,
          preview: "from-violet-300/40 to-cyan-300/20",
          created_at: item.created_at
        })) || []);
        
        setCurrentUser(currUser);
        setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [slug]);

  const canManage = canManageChannel(currentUser);
  const filteredPosts = useMemo(() => filterPosts(posts, activeTab, query), [posts, activeTab, query]);
  const pulseScore = useMemo(() => {
    if (!channel) return 12;
    return getPulseScore(channel.online, channel.members, posts.filter((post) => post.hot).length);
  }, [channel, posts]);

  useEffect(() => {
    const onScroll = () => setCollapsed(window.scrollY > 160);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const pickProfile = () => {
    if (canManage) profileInputRef.current?.click();
  };

  const pickBanner = () => {
    if (canManage) bannerInputRef.current?.click();
  };

  const toggleSubscribe = async () => {
    if (!channel || !currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }
    setSubLoading(true);
    if (isSubscribed) {
      await supabase.from("universe_subscriptions").delete().eq("user_id", currentUser.id).eq("universe_slug", channel.slug);
      setIsSubscribed(false);
      setChannel(prev => prev ? { ...prev, members: Math.max(0, prev.members - 1) } : null);
    } else {
      await supabase.from("universe_subscriptions").insert([{ user_id: currentUser.id, universe_slug: channel.slug }]);
      setIsSubscribed(true);
      setChannel(prev => prev ? { ...prev, members: prev.members + 1 } : null);
    }
    setSubLoading(false);
  };

  if (loading) return <div className="min-h-screen bg-slate-50 dark:bg-[#070612] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" /></div>;
  if (!channel) return <div className="min-h-screen bg-slate-50 dark:bg-[#070612] flex items-center justify-center text-slate-900 dark:text-white">Universe not found</div>;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-violet-500/30 selection:text-slate-900 dark:bg-[#070612] dark:text-white dark:selection:bg-fuchsia-300/30 dark:selection:text-white">
      <MiniTopBar visible={collapsed} profilePreview={profilePreview} channel={channel} />

      <input ref={profileInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => {
        const file = event.target.files?.[0];
        if (file && canManage) readImageFile(file, setProfilePreview);
        event.currentTarget.value = "";
      }} />

      <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => {
        const file = event.target.files?.[0];
        if (file && canManage) readImageFile(file, setBannerPreview);
        event.currentTarget.value = "";
      }} />

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-8rem] h-96 w-96 rounded-full bg-violet-400/10 blur-3xl dark:bg-violet-500/20" />
        <div className="absolute right-[-9rem] top-52 h-96 w-96 rounded-full bg-cyan-300/10 blur-3xl dark:bg-cyan-400/13" />
        <div className="absolute bottom-[-10rem] left-1/3 h-96 w-96 rounded-full bg-pink-300/10 blur-3xl dark:bg-pink-400/14" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        <ChannelHeader 
          channel={channel}
          canManage={canManage} 
          profilePreview={profilePreview} 
          bannerPreview={bannerPreview} 
          onPickProfile={pickProfile} 
          onPickBanner={pickBanner} 
          isSubscribed={isSubscribed}
          onToggleSubscribe={toggleSubscribe}
          subLoading={subLoading}
        />

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard icon="👥" label="멤버" value={`${formatNumber(channel.members)}명`} />
          <StatCard icon="🧭" label="접속중" value={`${formatNumber(channel.online)}명`} />
          <StatCard icon="✍" label="게시글" value={formatNumber(channel.posts)} />
          <StatCard icon="🛡" label="분위기" value="창작친화" />
        </div>

        <PulsePanel score={pulseScore} />
        <TrendTicker />
        <UniverseIdentityLayer />
        <UniverseQuestBoard />
        <LoreConstellation />

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="min-w-0">
            <BoardToolbar activeTab={activeTab} setActiveTab={setActiveTab} query={query} setQuery={setQuery} viewMode={viewMode} setViewMode={setViewMode} />
            <Board posts={filteredPosts} viewMode={viewMode} slug={slug} />
          </section>

          <div className="space-y-4">
            <AdminPanel canManage={canManage} user={currentUser!} onPickProfile={pickProfile} onPickBanner={pickBanner} />
            <SidePanel canManage={canManage} />
          </div>
        </div>
      </div>
    </main>
  );
}
