"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { DguyErrorMascot } from "./DguyErrorMascot";

/**
 * ErrorScreen
 * 
 * 공통 에러 페이지 레이아웃 컴포넌트
 * - 드가이 에러 마스코트 표시
 * - 에러 상태 문구 및 버튼
 * - 다크/라이트 모드 지원
 * - 배경 장식 (격자, 궤도, 별빛, 글로우)
 * - 에러 상태이므로 배경이 약간 흐트러진 느낌
 */

interface ErrorScreenProps {
  onReset: () => void;
  onHome: () => void;
  isDarkMode?: boolean;
}

interface ErrorNodeProps {
  label: string;
  className: string;
  delay: number;
}

function ErrorNode({ label, className, delay }: ErrorNodeProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.span
      className={`absolute z-20 flex h-6 min-w-6 items-center justify-center rounded-full border border-white/12 bg-white/[0.07] px-1.5 text-[8px] font-black tracking-[-0.02em] text-white/48 shadow-[0_0_18px_rgba(125,211,252,0.12)] backdrop-blur-md ${className}`}
      animate={
        prefersReducedMotion
          ? {}
          : {
              opacity: [0.28, 0.72, 0.28],
              scale: [0.88, 1.04, 0.88],
            }
      }
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : {
              duration: 2.2,
              delay,
              repeat: Infinity,
              ease: "easeInOut",
            }
      }
    >
      {label}
    </motion.span>
  );
}

function MiniStar({
  delay = 0,
  className = "",
}: {
  delay?: number;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.span
      className={`absolute block h-0.5 w-0.5 rounded-full bg-white/60 shadow-[0_0_10px_rgba(255,255,255,0.6)] ${className}`}
      animate={
        prefersReducedMotion
          ? {}
          : {
              opacity: [0.12, 0.8, 0.12],
              scale: [0.6, 1.1, 0.6],
            }
      }
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : {
              duration: 2.4,
              delay,
              repeat: Infinity,
              ease: "easeInOut",
            }
      }
    />
  );
}

function BrokenOrbit({
  className = "",
  duration = 5.2,
}: {
  className?: string;
  duration?: number;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.035] ${className}`}
      animate={
        prefersReducedMotion
          ? {}
          : {
              scale: [0.98, 1.02, 0.98],
              opacity: [0.25, 0.45, 0.25],
              rotate: [0, 2, 0],
            }
      }
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : {
              duration,
              repeat: Infinity,
              ease: "easeInOut",
            }
      }
    />
  );
}

export function ErrorScreen({
  onReset,
  onHome,
  isDarkMode = true,
}: ErrorScreenProps) {
  const prefersReducedMotion = useReducedMotion();

  const bgClass = isDarkMode
    ? "bg-[#050612] text-white"
    : "bg-white text-slate-900";

  const gradientOverlay = isDarkMode
    ? "bg-[radial-gradient(circle_at_50%_42%,rgba(124,58,237,0.18),transparent_34%),radial-gradient(circle_at_50%_82%,rgba(14,165,233,0.08),transparent_38%),linear-gradient(to_bottom,#050612_0%,#07091d_48%,#03040c_100%)]"
    : "bg-[radial-gradient(circle_at_50%_42%,rgba(168,85,247,0.12),transparent_34%),radial-gradient(circle_at_50%_82%,rgba(59,130,246,0.08),transparent_38%),linear-gradient(to_bottom,#f8f8ff_0%,#f3f0ff_48%,#faf5ff_100%)]";

  const gridOverlay = isDarkMode
    ? "bg-[linear-gradient(rgba(255,255,255,0.026)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.022)_1px,transparent_1px)]"
    : "bg-[linear-gradient(rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.04)_1px,transparent_1px)]";

  const buttonBaseClass =
    "relative px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 overflow-hidden";

  const resetButtonClass = isDarkMode
    ? "bg-gradient-to-br from-violet-600 to-indigo-700 text-white hover:shadow-[0_0_24px_rgba(167,139,250,0.6)]"
    : "bg-gradient-to-br from-violet-500 to-indigo-600 text-white hover:shadow-[0_0_24px_rgba(168,85,247,0.5)]";

  const homeButtonClass = isDarkMode
    ? "border border-white/20 bg-white/[0.05] text-white/90 hover:bg-white/[0.1] hover:shadow-[0_0_24px_rgba(125,211,252,0.4)]"
    : "border border-slate-300 bg-white/50 text-slate-700 hover:bg-white/70 hover:shadow-[0_0_24px_rgba(59,130,246,0.3)]";

  return (
    <main
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden ${bgClass}`}
      role="status"
      aria-live="polite"
      aria-label="Error page"
    >
      {/* 배경 그라데이션 */}
      <div className={`pointer-events-none absolute inset-0 ${gradientOverlay}`} />

      {/* 가로 그래디언트 라인 */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.02),transparent)] opacity-30" />

      {/* 상단 글로우 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_65%)]" />

      {/* 격자 오버레이 (약간 흐트러짐) */}
      <motion.div
        className={`pointer-events-none absolute inset-0 ${gridOverlay} bg-[size:72px_72px]`}
        animate={
          prefersReducedMotion
            ? {}
            : {
                opacity: [0.12, 0.18, 0.12],
              }
        }
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : {
                duration: 4.8,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
      />

      {/* 별빛 장식 */}
      <MiniStar className="left-[12%] top-[20%]" delay={0.1} />
      <MiniStar className="left-[24%] top-[72%]" delay={0.4} />
      <MiniStar className="left-[76%] top-[28%]" delay={0.8} />
      <MiniStar className="left-[88%] top-[68%]" delay={1.1} />
      <MiniStar className="left-[52%] top-[14%]" delay={1.4} />
      <MiniStar className="left-[62%] top-[82%]" delay={1.7} />

      {/* 궤도선 (기울어지고 끊긴 느낌) */}
      <BrokenOrbit className="h-[360px] w-[360px]" duration={5.2} />
      <BrokenOrbit
        className="h-[540px] w-[540px]"
        duration={6.4}
      />

      {/* 에러 노드 장식 */}
      <ErrorNode label="ERROR" className="left-[8%] top-[32%]" delay={0} />
      <ErrorNode label="500" className="right-[6%] top-[28%]" delay={0.3} />
      <ErrorNode
        label="SIGNAL LOST"
        className="left-[14%] bottom-[24%]"
        delay={0.6}
      />

      {/* 메인 콘텐츠 */}
      <motion.section
        className="relative z-10 mx-6 flex w-full max-w-[480px] flex-col items-center text-center"
        initial={prefersReducedMotion ? {} : { y: 20, opacity: 0 }}
        animate={prefersReducedMotion ? {} : { y: 0, opacity: 1 }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 0.6, ease: "easeOut" }
        }
      >
        {/* 드가이 마스코트 */}
        <div className="mb-8">
          <DguyErrorMascot className="h-56 w-56" />
        </div>

        {/* 상단 작은 문구 */}
        <motion.p
          className={`mb-3 text-[10px] font-bold uppercase tracking-[0.32em] ${
            isDarkMode ? "text-white/40" : "text-slate-500"
          }`}
          animate={
            prefersReducedMotion
              ? {}
              : {
                  opacity: [0.4, 0.8, 0.4],
                }
          }
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : {
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        >
          SYSTEM INTERRUPTION
        </motion.p>

        {/* 큰 제목 */}
        <motion.h1
          className={`mb-4 text-4xl font-black tracking-[-0.05em] drop-shadow-[0_0_20px_rgba(255,255,255,0.15)] sm:text-5xl ${
            isDarkMode ? "text-white" : "text-slate-900"
          }`}
          animate={
            prefersReducedMotion
              ? {}
              : {
                  opacity: [0.85, 1, 0.85],
                }
          }
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : {
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        >
          드가이가 쓰러졌어요
        </motion.h1>

        {/* 설명 문구 */}
        <p
          className={`mb-6 max-w-[340px] text-sm leading-6 ${
            isDarkMode ? "text-white/56" : "text-slate-600"
          }`}
        >
          예상하지 못한 오류를 온몸으로 받아냈어요.
          <br />
          잠시 후 다시 일으켜 주세요.
        </p>

        {/* 상태 표시 칩 */}
        <motion.div
          className={`mb-8 flex items-center gap-2 rounded-full border px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] backdrop-blur-md ${
            isDarkMode
              ? "border-white/10 bg-white/[0.045] text-white/36 shadow-[0_0_24px_rgba(139,92,246,0.1)]"
              : "border-slate-300/30 bg-white/40 text-slate-600 shadow-[0_0_24px_rgba(168,85,247,0.08)]"
          }`}
          animate={
            prefersReducedMotion
              ? {}
              : {
                  opacity: [0.44, 0.88, 0.44],
                }
          }
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : {
                  duration: 3.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isDarkMode
                ? "bg-sky-200/70 shadow-[0_0_10px_rgba(125,211,252,0.8)]"
                : "bg-sky-400/60 shadow-[0_0_10px_rgba(59,130,246,0.6)]"
            }`}
          />
          <span>VERSE SIGNAL · ERROR</span>
        </motion.div>

        {/* 버튼 그룹 */}
        <div className="flex flex-col gap-3 w-full sm:flex-row sm:justify-center">
          {/* 드가이 일으키기 버튼 */}
          <motion.button
            onClick={onReset}
            className={`${buttonBaseClass} ${resetButtonClass}`}
            whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
            type="button"
          >
            <span className="relative z-10">드가이 일으키기</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={
                prefersReducedMotion
                  ? {}
                  : {
                      x: ["-100%", "100%"],
                    }
              }
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
              }
            />
          </motion.button>

          {/* 홈으로 데려가기 버튼 */}
          <motion.button
            onClick={onHome}
            className={`${buttonBaseClass} ${homeButtonClass}`}
            whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
            type="button"
          >
            <span className="relative z-10">홈으로 데려가기</span>
          </motion.button>
        </div>
      </motion.section>
    </main>
  );
}
