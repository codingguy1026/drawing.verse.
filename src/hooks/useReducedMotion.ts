import { useEffect, useState } from "react";

/**
 * useReducedMotion
 * 
 * prefers-reduced-motion 미디어 쿼리를 감지하여
 * 사용자가 애니메이션을 최소화하기를 원하는지 확인하는 훅
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // 초기 상태 확인
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    // 변경 감지
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}
