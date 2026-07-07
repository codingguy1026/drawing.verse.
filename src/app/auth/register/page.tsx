"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle,
  Sparkles,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  // 상태 관리
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // 비밀번호 확인용 상태
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // 1. 유효성 검사: 빈 값 체크
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setErrorMsg("모든 필드를 입력해 주세요.");
      setSubmitting(false);
      return;
    }

    // 2. 유효성 검사: 비밀번호 길이 (최소 6자)
    if (password.length < 6) {
      setErrorMsg("비밀번호는 최소 6자 이상이어야 합니다.");
      setSubmitting(false);
      return;
    }

    // 3. 유효성 검사: 비밀번호 일치 여부
    if (password !== confirmPassword) {
      setErrorMsg("비밀번호가 서로 일치하지 않습니다.");
      setSubmitting(false);
      return;
    }

    // Supabase 회원가입 요청
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
    });

    if (error) {
      let message = error.message;
      // 에러 메시지 한글화
      if (message.includes("User already registered"))
        message = "이미 가입된 이메일입니다.";
      if (message.includes("Password should be"))
        message = "비밀번호 보안 수준이 낮습니다.";

      setErrorMsg(message);
      setSubmitting(false);
      return;
    }

    // 성공 처리
    setSuccessMsg("회원가입 성공! 로그인 페이지로 이동합니다.");
    setSubmitting(false);

    // 1.5초 후 로그인 페이지로 이동
    setTimeout(() => {
      router.push("/auth/login");
    }, 1500);
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 배경 장식 (로그인 페이지와 동일한 톤) */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/60 px-8 py-8 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-white/20">
        {/* 상단 제목 */}
        <div className="mb-8 text-center">
          <p className="text-[10px] font-bold tracking-[0.3em] text-indigo-400 uppercase mb-3 flex justify-center items-center gap-2">
            Drawing Verse <Sparkles size={12} />
          </p>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Create Account
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            나만의 유니버스를 만들 준비가 되셨나요? ✨
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* 이메일 */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 ml-1">
              이메일
            </label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 rounded-xl border border-white/10 bg-slate-950/50 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                placeholder="name@example.com"
              />
            </div>
          </div>

          {/* 비밀번호 */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 ml-1">
              비밀번호
            </label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 rounded-xl border border-white/10 bg-slate-950/50 pl-10 pr-10 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                placeholder="최소 6자 이상"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* 비밀번호 확인 */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 ml-1">
              비밀번호 확인
            </label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full h-11 rounded-xl border bg-slate-950/50 pl-10 pr-10 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 transition-all ${
                  confirmPassword && password !== confirmPassword
                    ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                    : "border-white/10 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                }`}
                placeholder="비밀번호를 한 번 더 입력해주세요"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {/* 비밀번호 불일치 실시간 피드백 */}
            {confirmPassword && password !== confirmPassword && (
              <p className="text-[10px] text-red-400 ml-1">
                비밀번호가 일치하지 않습니다.
              </p>
            )}
          </div>

          {/* 에러 메시지 */}
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 animate-pulse">
              <AlertCircle size={16} />
              <p>{errorMsg}</p>
            </div>
          )}

          {/* 성공 메시지 */}
          {successMsg && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400">
              <CheckCircle size={16} />
              <p>{successMsg}</p>
            </div>
          )}

          {/* 회원가입 버튼 */}
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 relative h-11 w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] hover:shadow-indigo-500/40 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-center gap-2">
              {submitting && <Loader2 size={18} className="animate-spin" />}
              {submitting ? "계정 생성 중..." : "회원가입"}
            </div>
          </button>
        </form>

        {/* 하단 링크 */}
        <div className="mt-8 pt-4 border-t border-white/5 text-center">
          <p className="text-xs text-slate-500">
            이미 계정이 있으신가요?{" "}
            <Link
              href="/auth/login"
              className="text-indigo-400 font-semibold hover:text-indigo-300 hover:underline underline-offset-4 transition-all"
            >
              로그인 하기
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
