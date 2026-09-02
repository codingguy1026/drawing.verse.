"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Home,
  MessageCircle,
  Users,
  Play,
  Sparkles,
} from "lucide-react";

const icons = [Home, MessageCircle, Users, Play, Sparkles];

// 배경에 무작위로 반짝이는 별 입자 데이터
const stars = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 2 + 1.5,
  delay: Math.random() * 2,
}));

export default function Loading() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 로딩이 끝나면 리다이렉트
    const timer = setTimeout(() => {
      const targetPath = searchParams.get("to") || "/";
      router.push(targetPath);
    }, 3000); // 3초 후 이동 (필요시 조정)

    return () => clearTimeout(timer);
  }, [router, searchParams]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#03030c] text-white">
      {/* 1. 우주 배경: 성운 오로라 효과 */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-[500px] w-[500px] rounded-full bg-indigo-600/15 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-[500px] w-[500px] rounded-full bg-purple-600/15 blur-[140px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-[160px]" />

      {/* 2. 배경에 반짝이는 작은 별들 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            initial={{ opacity: 0.1, scale: 0.8 }}
            animate={{ opacity: [0.1, 0.9, 0.1], scale: [0.8, 1.2, 0.8] }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
              ease: "easeInOut",
            }}
            className="absolute rounded-full bg-white"
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              boxShadow: "0 0 8px rgba(255,255,255,0.8)",
            }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center z-10">
        {/* 3. 아이콘 라인 & 행성 궤도 글로우 */}
        <div className="flex items-center gap-6 sm:gap-9">
          {icons.map((Icon, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12, scale: 0.9 }}
              animate={{
                opacity: [0.4, 1, 0.4],
                y: [0, -6, 0],
                scale: [0.95, 1.05, 0.95],
              }}
              transition={{
                duration: 3,
                delay: index * 0.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="group relative flex items-center justify-center p-3"
            >
              {/* 행성 테두리 링 (Orbital Ring) */}
              <div className="absolute inset-0 rounded-full border border-violet-500/30 bg-violet-950/20 backdrop-blur-md transition-all group-hover:border-violet-400/60" />

              {/* 뒷배경 펄스 글로우 */}
              <motion.div
                animate={{
                  opacity: [0.2, 0.6, 0.2],
                  scale: [0.8, 1.3, 0.8],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: index * 0.2,
                }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600/30 to-fuchsia-600/30 blur-md"
              />

              <Icon
                strokeWidth={1.8}
                className="relative h-6 w-6 text-violet-200 drop-shadow-[0_0_8px_rgba(167,139,250,0.6)]"
              />
            </motion.div>
          ))}
        </div>

        {/* 4. 브랜딩 및 텍스트 영역 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-10 text-center"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-violet-400 drop-shadow-[0_0_10px_rgba(167,139,250,0.5)]">
            Drawing Verse
          </p>

          <h2 className="mt-3 text-xl font-bold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.3)]">
            새로운 우주를 여는 중
            <LoadingDots />
          </h2>

          <p className="mt-2 text-xs font-medium text-violet-200/50">
            잠시만 기다려 주세요
          </p>
        </motion.div>

        {/* 5. 유성(Meteor) 스타일 게이지 바 */}
        <div className="relative mt-8 h-[3px] w-44 overflow-hidden rounded-full bg-violet-950/60 border border-violet-800/30">
          <motion.div
            className="absolute h-full w-16 bg-gradient-to-r from-transparent via-violet-400 to-white shadow-[0_0_12px_#a78bfa]"
            animate={{
              x: [-70, 180],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </div>
    </div>
  );
}

function LoadingDots() {
  return (
    <span className="ml-1 inline-flex">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.2, 1, 0.2], y: [0, -2, 0] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
          }}
          className="text-violet-300"
        >
          .
        </motion.span>
      ))}
    </span>
  );
}