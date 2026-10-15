"use client";

import Link from "next/link";
import * as React from "react";
import { ArrowLeft, Bell, Crown, UserRound, UsersRound } from "lucide-react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type UniverseRow = {
  slug: string;
  name: string;
  owner_id: string | null;
  subscriber_count: number | null;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
  nickname: string | null;
  avatar_url: string | null;
};

export default function UniverseMembersPage() {
  const params = useParams();
  const rawSlug = params.slug;
  const slug = decodeURIComponent(Array.isArray(rawSlug) ? rawSlug[0] ?? "" : rawSlug ?? "");
  const universeHref = `/universe/${encodeURIComponent(slug)}`;

  const [universe, setUniverse] = React.useState<UniverseRow | null>(null);
  const [owner, setOwner] = React.useState<ProfileRow | null>(null);
  const [subscribed, setSubscribed] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState("");

  React.useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setErrorMessage("");

      const [{ data: universeData, error }, { data: authData }] = await Promise.all([
        supabase
          .from("universes")
          .select("slug,name,owner_id,subscriber_count")
          .eq("slug", slug)
          .maybeSingle<UniverseRow>(),
        supabase.auth.getUser(),
      ]);

      if (ignore) return;

      if (error || !universeData) {
        setErrorMessage("Universe 참여 정보를 불러오지 못했어요.");
        setLoading(false);
        return;
      }

      setUniverse(universeData);

      const jobs: PromiseLike<unknown>[] = [];

      if (universeData.owner_id) {
        jobs.push(
          supabase
            .from("profiles")
            .select("id,display_name,nickname,avatar_url")
            .eq("id", universeData.owner_id)
            .maybeSingle<ProfileRow>()
            .then(({ data }) => {
              if (!ignore) setOwner(data ?? null);
            })
        );
      }

      if (authData.user) {
        jobs.push(
          supabase
            .from("universe_subscriptions")
            .select("id")
            .eq("user_id", authData.user.id)
            .eq("universe_slug", slug)
            .maybeSingle()
            .then(({ data }) => {
              if (!ignore) setSubscribed(Boolean(data));
            })
        );
      }

      await Promise.all(jobs);
      if (!ignore) setLoading(false);
    }

    load();
    return () => {
      ignore = true;
    };
  }, [slug]);

  const ownerName =
    owner?.display_name?.trim() ||
    owner?.nickname?.trim() ||
    "Universe 소유자";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 dark:bg-[#03050a] dark:text-white sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-3xl">
        <Link href={universeHref} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950 dark:text-white/70 dark:hover:text-white">
          <ArrowLeft className="size-4" />
          Universe로 돌아가기
        </Link>

        <header className="mt-8 border-b border-slate-200 pb-6 dark:border-white/10">
          <p className="text-sm font-semibold text-slate-500">{slug}</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">참여 정보</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-white/55">
            가짜 멤버 목록 대신 실제 Universe 소유자와 구독 현황을 표시합니다.
          </p>
        </header>

        {loading ? (
          <div className="mt-8 h-48 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10" />
        ) : errorMessage || !universe ? (
          <p className="mt-8 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
            {errorMessage || "Universe를 찾을 수 없어요."}
          </p>
        ) : (
          <>
            <section className="grid gap-3 py-7 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex items-center gap-3">
                  <UsersRound className="size-5 text-slate-500" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500">구독자</p>
                    <p className="text-xl font-black">{(universe.subscriber_count ?? 0).toLocaleString("ko-KR")}명</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex items-center gap-3">
                  <Bell className="size-5 text-slate-500" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500">내 상태</p>
                    <p className="text-sm font-black">{subscribed ? "구독 중" : "구독하지 않음"}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="border-t border-slate-200 py-7 dark:border-white/10">
              <h2 className="text-lg font-black">Universe 소유자</h2>

              {universe.owner_id ? (
                <Link href={`/users/${universe.owner_id}`} className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4 hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.03]">
                  {owner?.avatar_url ? (
                    <img src={owner.avatar_url} alt="" className="size-11 rounded-full object-cover" />
                  ) : (
                    <div className="grid size-11 place-items-center rounded-full bg-slate-100 dark:bg-white/10">
                      <UserRound className="size-5 text-slate-500" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black">{ownerName}</p>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
                      <Crown className="size-3.5" />
                      소유자
                    </p>
                  </div>
                </Link>
              ) : (
                <p className="mt-4 text-sm text-slate-500">소유자 정보가 연결되지 않았어요.</p>
              )}
            </section>

            <section className="border-t border-slate-200 py-7 dark:border-white/10">
              <h2 className="text-lg font-black">멤버 목록에 대해</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-white/55">
                현재 Drawing Verse의 Universe는 별도 멤버십 명단 대신 구독 구조를 사용합니다.
                다른 사용자의 구독 목록은 공개하지 않고, 전체 인원 수만 표시합니다.
              </p>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
