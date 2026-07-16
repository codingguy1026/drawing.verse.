"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ErrorScreen } from "@/components/Error/ErrorScreen";

/**
 * error.tsx
 * 
 * Next.js App Router의 에러 바운더리 핸들러
 * - 예상치 못한 런타임 에러를 캡처
 * - 개발 중 console.error로 오류 정보 기록
 * - 사용자에게는 친화적인 에러 화면 표시
 * - reset() 함수로 컴포넌트 재렌더링 가능
 * - 홈으로 이동 기능 제공
 */

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    // 개발 환경에서 오류 정보 로깅
    console.error("Error boundary caught:", error);
    if (error.digest) {
      console.error("Error digest:", error.digest);
    }
  }, [error]);

  const handleReset = () => {
    reset();
  };

  const handleHome = () => {
    router.replace("/");
  };

  return (
    <ErrorScreen
      onReset={handleReset}
      onHome={handleHome}
      isDarkMode={true}
    />
  );
}
