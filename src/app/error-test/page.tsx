"use client";

import { useState } from "react";

export default function ErrorTestPage() {
  const [shouldCrash, setShouldCrash] = useState(false);

  if (shouldCrash) {
    throw new Error("드가이 에러 페이지 테스트");
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <button
        type="button"
        onClick={() => setShouldCrash(true)}
        className="rounded-xl bg-violet-600 px-6 py-3 font-bold text-white"
      >
        드가이 쓰러뜨리기
      </button>
    </main>
  );
}