"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PageFrame } from "@/components/Layout/PageFrame";
import { DreamSection } from "@/components/Layout/DreamSection";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (password !== passwordConfirm) {
      setErrorMsg("비밀번호가 일치하지 않습니다.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: nickname,
          },
        },
      });

      if (error) {
        setErrorMsg(error.message || "회원가입에 실패했습니다.");
        setLoading(false);
        return;
      }

      console.log("register success:", data.user);
      alert("회원가입이 완료되었습니다! 이메일을 확인해주세요 (이메일 인증이 설정된 경우).");
      router.push("/login");
    } catch (err) {
      console.error(err);
      setErrorMsg("알 수 없는 오류가 발생했습니다.");
      setLoading(false);
    }
  };

  return (
    <PageFrame>
      {/* 상단 인트로 */}
      <DreamSection>
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
            Drawing Verse
          </p>
          <h1 className="text-2xl font-semibold text-slate-50">
            새 계정 만들기
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            하나의 계정으로 모든 유니버스를 구독하고, 나만의 그림 세계를
            기록해보세요 ✨
          </p>
        </div>
      </DreamSection>

      {/* 회원가입 폼 */}
      <DreamSection>
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-50">회원가입</h2>
            <p className="mt-1 text-xs text-slate-400">
              기본 정보만 입력하면 바로 시작할 수 있어요.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* 닉네임 */}
            <div className="space-y-1.5">
              <label
                htmlFor="nickname"
                className="block text-xs font-medium text-slate-200"
              >
                닉네임
              </label>
              <input
                id="nickname"
                type="text"
                placeholder="예: 드가이"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
              />
            </div>

            {/* 이메일 */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-medium text-slate-200"
              >
                이메일
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* 비밀번호 */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-medium text-slate-200"
              >
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* 비밀번호 확인 */}
            <div className="space-y-1.5">
              <label
                htmlFor="passwordConfirm"
                className="block text-xs font-medium text-slate-200"
              >
                비밀번호 확인
              </label>
              <input
                id="passwordConfirm"
                type="password"
                placeholder="다시 한 번 입력하세요"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
              />
            </div>

            {/* 에러 메시지 */}
            {errorMsg && (
              <p className="text-xs text-rose-400 whitespace-pre-wrap">
                {errorMsg}
              </p>
            )}

            {/* 회원가입 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-pink-500 px-4 py-2 text-sm font-medium text-slate-50 shadow-[0_0_24px_rgba(129,140,248,0.5)] transition hover:brightness-110 disabled:opacity-60"
            >
              {loading ? "가입 중..." : "회원가입 완료하기"}
            </button>
          </form>

          {/* 로그인 링크 */}
          <p className="pt-2 text-center text-[0.75rem] text-slate-400">
            이미 계정이 있으신가요?{" "}
            <Link
              href="/login"
              className="text-sky-300 underline-offset-2 hover:text-sky-200 hover:underline"
            >
              로그인 하기 →
            </Link>
          </p>
        </div>
      </DreamSection>
    </PageFrame>
  );
}

