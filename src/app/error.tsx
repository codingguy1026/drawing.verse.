'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
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
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative mb-8"
      >
        <div className="absolute inset-0 animate-pulse rounded-full bg-rose-500/20 blur-3xl" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-rose-500/10 text-rose-500 backdrop-blur-xl border border-rose-500/20">
          <AlertCircle size={48} />
        </div>
      </motion.div>

      <h2 className="mb-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
        차원에 오류가 발생했습니다
      </h2>
      <p className="mb-8 max-w-md text-slate-500 dark:text-slate-400">
        우주의 균형이 일시적으로 깨진 것 같습니다. 아래 버튼을 눌러 다시 시도하거나 홈으로 돌아가주세요.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 dark:bg-white dark:text-slate-900"
        >
          <RefreshCcw size={18} />
          다시 시도하기
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition-all hover:scale-105 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
        >
          <Home size={18} />
          홈으로 이동
        </Link>
      </div>
    </div>
  );
}
