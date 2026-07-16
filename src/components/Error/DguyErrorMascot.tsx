"use client";

import { motion, Transition } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * DguyErrorMascot
 * 
 * 드가이가 에러로 인해 완전히 엎어진 모습을 표현하는 컴포넌트
 * - 네모난 보라색 몸체 (등판이 화면을 향함)
 * - 양팔은 힘없이 양옆으로 꺾여 널브러진 자세
 * - 얼굴은 보이지 않음 (엎어진 상태)
 * - 머리 위 마름모 장식은 기울어져 있음
 * - 미세한 숨쉬기 애니메이션과 손가락 움찔거림만 허용
 * - 아래에 부드러운 그림자로 바닥에 엎어진 느낌 표현
 */

interface DguyErrorMascotProps {
  className?: string;
}

export function DguyErrorMascot({ className = "" }: DguyErrorMascotProps) {
  const prefersReducedMotion = useReducedMotion();

  const bodyVariants = {
    animate: prefersReducedMotion
      ? { y: 0 }
      : {
          y: [0, 1, 0, -1, 0],
        },
  };

  const bodyTransition: Transition = prefersReducedMotion
    ? { duration: 0 }
    : {
        duration: 4.2,
        repeat: Infinity,
        ease: "easeInOut",
      };

  const fingerVariants = {
    animate: prefersReducedMotion
      ? { scaleY: 1 }
      : {
          scaleY: [1, 0.85, 1, 0.9, 1],
        },
  };

  const fingerTransition: Transition = prefersReducedMotion
    ? { duration: 0 }
    : {
        duration: 3.8,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0.5,
      };

  const diamondVariants = {
    initial: prefersReducedMotion ? { rotate: -8 } : { rotate: -8, opacity: 0 },
    animate: prefersReducedMotion
      ? { rotate: -8 }
      : {
          rotate: [-8, -12, -8],
          opacity: 1,
        },
  };

  const diamondTransition: Transition = prefersReducedMotion
    ? { duration: 0 }
    : {
        duration: 0.6,
        ease: "easeInOut",
        times: [0, 0.5, 1],
      };

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* 그림자 */}
      <motion.div
        className="absolute -bottom-6 h-20 w-32 rounded-full bg-gradient-to-r from-violet-600/20 via-violet-500/30 to-transparent blur-2xl"
        animate={prefersReducedMotion ? {} : { opacity: [0.4, 0.6, 0.4] }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 3.6, repeat: Infinity, ease: "easeInOut" }
        }
      />

      {/* 메인 컨테이너 */}
      <motion.div
        className="relative h-48 w-40"
        variants={bodyVariants}
        animate="animate"
        transition={bodyTransition}
      >
        {/* 머리 위 마름모 장식 (기울어진 상태) */}
        <motion.div
          className="absolute -top-8 left-1/2 -translate-x-1/2"
          variants={diamondVariants}
          initial="initial"
          animate="animate"
          transition={diamondTransition}
        >
          <div className="relative h-12 w-12">
            {/* 외부 마름모 */}
            <div className="absolute inset-0 rotate-45 rounded-md border-2 border-violet-400/60 bg-gradient-to-br from-violet-500/40 to-fuchsia-500/30 shadow-[0_0_20px_rgba(167,139,250,0.4)]" />
            {/* 내부 마름모 */}
            <div className="absolute inset-2 rotate-45 border border-violet-300/40 bg-gradient-to-br from-violet-400/20 to-transparent" />
          </div>
        </motion.div>

        {/* 메인 몸체 (네모난 보라색) */}
        <div className="absolute inset-0 rounded-2xl border-2 border-violet-400/50 bg-gradient-to-br from-violet-500 via-indigo-600 to-purple-700 shadow-[0_20px_60px_rgba(79,70,229,0.5),inset_0_1px_0_rgba(255,255,255,0.2)]">
          {/* 등판 광택 효과 */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/15 via-transparent to-transparent" />

          {/* 내부 음영 */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent via-transparent to-indigo-900/30" />
        </div>

        {/* 왼쪽 팔 (힘없이 꺾임) */}
        <motion.div
          className="absolute top-16 -left-20 h-16 w-20 origin-right"
          animate={prefersReducedMotion ? {} : { rotate: [8, 5, 8, 6, 8] }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 4.8, repeat: Infinity, ease: "easeInOut" }
          }
        >
          {/* 팔 */}
          <div className="h-full w-full rounded-full border-2 border-violet-400/40 bg-gradient-to-br from-violet-500/60 to-indigo-600/50 shadow-[0_8px_24px_rgba(79,70,229,0.3)]" />

          {/* 왼손 (둥근 손가락) */}
          <motion.div
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-1"
            variants={fingerVariants}
            animate="animate"
            transition={fingerTransition}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={`left-finger-${i}`}
                className="h-3 w-2 rounded-full bg-gradient-to-b from-violet-400/70 to-indigo-500/60 shadow-[0_2px_8px_rgba(79,70,229,0.4)]"
              />
            ))}
          </motion.div>
        </motion.div>

        {/* 오른쪽 팔 (힘없이 꺾임) */}
        <motion.div
          className="absolute top-16 -right-20 h-16 w-20 origin-left"
          animate={prefersReducedMotion ? {} : { rotate: [-8, -5, -8, -6, -8] }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 4.8, repeat: Infinity, ease: "easeInOut" }
          }
        >
          {/* 팔 */}
          <div className="h-full w-full rounded-full border-2 border-violet-400/40 bg-gradient-to-br from-violet-500/60 to-indigo-600/50 shadow-[0_8px_24px_rgba(79,70,229,0.3)]" />

          {/* 오른손 (둥근 손가락) */}
          <motion.div
            className="absolute -bottom-8 right-1/2 translate-x-1/2 flex gap-1"
            variants={fingerVariants}
            animate="animate"
            transition={fingerTransition}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={`right-finger-${i}`}
                className="h-3 w-2 rounded-full bg-gradient-to-b from-violet-400/70 to-indigo-500/60 shadow-[0_2px_8px_rgba(79,70,229,0.4)]"
              />
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
