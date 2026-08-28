"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import DguyMascot from "@/components/DguyMascot";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f8fc] px-6 text-slate-950 dark:bg-[#03050a] dark:text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-400/10 blur-[140px]" />
        <div className="absolute left-[32%] top-[40%] h-44 w-44 rounded-full bg-rose-300/10 blur-[100px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 flex w-full max-w-lg flex-col items-center text-center">
        <DguyMascot mode="error" size={220} />

        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-rose-500">Verse connection lost</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">드가이가 쓰러졌어요.</h1>
        <p className="mt-4 max-w-md text-sm leading-7 text-slate-500 dark:text-slate-400">
          Verse를 연결하던 중 예상치 못한 문제가 생겼어요.
          <br />
          다시 시도하면 대부분 금방 돌아올 거예요.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950">
            <RotateCcw size={15} />
            다시 시도
          </button>
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-6 py-3 text-sm font-black text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5 dark:text-white">
            <Home size={15} />
            홈으로
          </Link>
        </div>

        {process.env.NODE_ENV === "development" && (
          <details className="mt-9 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white/70 text-left shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
            <summary className="cursor-pointer px-5 py-4 text-xs font-bold text-slate-400">개발자용 오류 정보</summary>
            <div className="border-t border-slate-200 px-5 py-4 dark:border-white/10">
              <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words text-[11px] leading-5 text-rose-500">{error.message}</pre>
              {error.digest && <p className="mt-3 text-[10px] text-slate-400">digest: {error.digest}</p>}
            </div>
          </details>
        )}
      </motion.div>
    </div>
  );
}
