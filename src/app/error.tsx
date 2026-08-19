'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, RefreshCcw } from 'lucide-react';

function DguyMascot() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, rotate: -2 }}
      animate={{
        opacity: 1,
        y: [0, 7, 0],
        rotate: [-2.5, -1.2, -2.5],
      }}
      transition={{
        opacity: { duration: 0.45 },
        y: { duration: 4.2, repeat: Infinity, ease: 'easeInOut' },
        rotate: { duration: 4.2, repeat: Infinity, ease: 'easeInOut' },
      }}
      className="relative mx-auto w-full max-w-[560px]"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-52 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/25 blur-[70px]" />

      <svg
        viewBox="0 0 560 390"
        role="img"
        aria-label="쓰러진 드가이 마스코트"
        className="relative h-auto w-full overflow-visible drop-shadow-[0_22px_44px_rgba(76,29,149,0.38)]"
      >
        <defs>
          <linearGradient id="dguyBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="42%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#5b21b6" />
          </linearGradient>
          <linearGradient id="dguyStroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c4b5fd" />
            <stop offset="55%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>
          <radialGradient id="dguyShine" cx="35%" cy="20%" r="78%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <filter id="dguyGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="dguySoftShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="18" stdDeviation="17" floodColor="#2e1065" floodOpacity="0.45" />
          </filter>
        </defs>

        <ellipse
          cx="280"
          cy="330"
          rx="178"
          ry="30"
          fill="#4c1d95"
          opacity="0.18"
          filter="url(#dguyGlow)"
        />

        <g transform="rotate(-4 280 200)" filter="url(#dguySoftShadow)">
          {/* The loose outer line is intentionally preserved from the original Dguy drawing. */}
          <path
            d="M169 105 C132 132 111 179 108 212 C105 241 130 262 158 286 C184 309 205 329 239 339 C264 347 286 348 305 355 C337 345 375 329 402 306 C427 285 451 260 453 239 C454 217 432 162 402 110"
            fill="none"
            stroke="url(#dguyStroke)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.92"
          />

          {/* Signature top stroke / tuft. */}
          <path
            d="M191 96 C215 101 288 52 327 36 C341 30 350 42 360 56 C375 77 390 99 405 123"
            fill="none"
            stroke="url(#dguyStroke)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Main square body. */}
          <rect
            x="155"
            y="90"
            width="250"
            height="230"
            rx="30"
            fill="url(#dguyBody)"
            stroke="#9f7aea"
            strokeWidth="7"
          />
          <rect
            x="164"
            y="99"
            width="232"
            height="212"
            rx="24"
            fill="url(#dguyShine)"
          />

          {/* Small edge highlights keep it glossy without turning Dguy into a robot. */}
          <path
            d="M181 108 H366"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.24"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M173 126 V274"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.12"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Tiny dot eyes matched to Dguy's profile expression. */}
          <circle cx="235" cy="184" r="3.2" fill="#f5f3ff" />
          <circle cx="320" cy="181" r="3.2" fill="#f5f3ff" />

          {/* Small, simple smile matched to the profile avatar. */}
          <path
            d="M233 214 C248 228 268 233 286 231 C303 229 316 222 325 213"
            fill="none"
            stroke="#f5f3ff"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>

        {/* Tiny system-error ellipses, matching the simple language of the mascot. */}
        <g fill="#a78bfa" opacity="0.78" filter="url(#dguyGlow)">
          <circle cx="92" cy="252" r="7" />
          <circle cx="114" cy="255" r="7" />
          <circle cx="136" cy="258" r="7" />
          <circle cx="424" cy="250" r="7" />
          <circle cx="446" cy="247" r="7" />
          <circle cx="468" cy="244" r="7" />
        </g>
      </svg>
    </motion.div>
  );
}

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
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#050718] px-5 py-14 text-center text-white">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_50%_22%,rgba(109,40,217,0.24),transparent_34%),radial-gradient(circle_at_50%_88%,rgba(14,165,233,0.09),transparent_32%),linear-gradient(180deg,#0b0b20_0%,#050718_54%,#020817_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-[28%] -z-10 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-400/[0.055]" />
      <div className="pointer-events-none absolute left-1/2 top-[28%] -z-10 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-400/[0.045]" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="mx-auto flex w-full max-w-4xl flex-col items-center"
      >
        <DguyMascot />

        <div className="-mt-8 md:-mt-12">
          <p className="mb-4 text-[11px] font-black uppercase tracking-[0.42em] text-violet-300/45 md:text-xs">
            System interruption
          </p>

          <h1 className="text-balance text-4xl font-black tracking-[-0.055em] text-white sm:text-5xl md:text-7xl">
            드가이가 쓰러졌어요
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-8 text-slate-400 sm:text-lg">
            예상하지 못한 오류를 온몸으로 받아냈어요.
            <br className="hidden sm:block" /> 잠시 후 다시 일으켜 주세요.
          </p>

          <div className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full border border-violet-300/10 bg-white/[0.035] px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-violet-200/40">
            <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400/70 shadow-[0_0_12px_rgba(167,139,250,0.85)]" />
            Verse signal · error
          </div>
        </div>

        <div className="mt-10 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
          <motion.button
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => reset()}
            className="group flex min-h-20 items-center justify-center gap-3 rounded-2xl border border-violet-300/25 bg-[linear-gradient(135deg,rgba(139,92,246,0.34),rgba(79,70,229,0.14))] px-6 text-base font-black text-white shadow-[0_15px_38px_rgba(76,29,149,0.2)] transition hover:border-violet-300/45 hover:bg-violet-500/25"
          >
            <RefreshCcw size={20} className="text-violet-200 transition-transform duration-500 group-hover:rotate-180" />
            드가이 일으키기
          </motion.button>

          <motion.div whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/"
              className="flex min-h-20 items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] px-6 text-base font-black text-white transition hover:border-white/20 hover:bg-white/[0.075]"
            >
              <Home size={20} className="text-slate-300" />
              홈으로 데려가기
            </Link>
          </motion.div>
        </div>

        <p className="mt-7 text-xs text-violet-200/35">
          ( ˘▿˘ ) 드가이는 곧 다시 일어날 거예요.
        </p>
      </motion.div>
    </main>
  );
}
