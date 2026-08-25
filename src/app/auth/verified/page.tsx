"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  LogIn,
  MailCheck,
  Sparkles,
} from "lucide-react";

export default function VerifiedPage() {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    setFailed(status === "error");

    if (status !== "error") {
      sessionStorage.removeItem("dv_pending_verification_email");
    }
  }, []);

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-slate-950 p-4 text-white">
      <div className="pointer-events-none absolute left-1/2 top-[-180px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-180px] right-[-120px] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[120px]" />

      <section className="relative w-full max-w-lg rounded-[2rem] border border-white/10 bg-slate-900/70 p-7 text-center shadow-2xl backdrop-blur-xl sm:p-9">
        <div
          className={`mx-auto grid h-20 w-20 place-items-center rounded-[1.75rem] ring-1 ${
            failed
              ? "bg-rose-500/10 text-rose-200 ring-rose-300/20"
              : "bg-emerald-500/10 text-emerald-200 ring-emerald-300/20"
          }`}
        >
          {failed ? (
            <AlertTriangle className="h-9 w-9" />
          ) : (
            <MailCheck className="h-9 w-9" />
          )}
        </div>

        <p className="mt-6 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-violet-300">
          Drawing Verse <Sparkles className="h-3 w-3" />
        </p>

        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          {failed ? "인증 링크를 처리하지 못했어요" : "이메일 인증 완료!"}
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-400">
          {failed
            ? "링크가 만료됐거나 이미 사용된 링크일 수 있어요. 인증 메일을 다시 받아 새 링크로 시도해 주세요."
            : "이제 Drawing Verse 계정의 이메일 인증이 끝났어요. 로그인해서 네 유니버스로 들어가면 됩니다."}
        </p>

        {!failed && (
          <div className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-400/10 px-4 py-2 text-xs font-bold text-emerald-200">
            <CheckCircle2 className="h-4 w-4" /> 인증된 계정
          </div>
        )}

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {failed ? (
            <Link
              href="/auth/verify-email"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 text-sm font-black text-white transition hover:brightness-110"
            >
              인증 메일 다시 받기
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 text-sm font-black text-white transition hover:brightness-110"
            >
              <LogIn className="h-4 w-4" /> 로그인하기
            </Link>
          )}

          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-black text-slate-200 transition hover:bg-white/10"
          >
            홈으로
          </Link>
        </div>
      </section>
    </main>
  );
}
