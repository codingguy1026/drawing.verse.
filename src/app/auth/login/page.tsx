"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [msgType, setMsgType] = useState<"error" | "success" | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setMsgType(null);

    const cleanEmail = email.trim().toLowerCase();

    const kill = window.setTimeout(() => {
      setLoading(false);
      setMsg("로그인이 지연되고 있어요… 새로고침 후 다시 시도해봐요 🥲");
      setMsgType("error");
    }, 10000);

    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    window.clearTimeout(kill);
    setLoading(false);

    if (error) {
      const code = "code" in error ? error.code : undefined;
      const isUnconfirmed =
        code === "email_not_confirmed" ||
        error.message.toLowerCase().includes("email not confirmed");

      if (isUnconfirmed) {
        sessionStorage.setItem("dv_pending_verification_email", cleanEmail);
        window.location.href = "/auth/verify-email?reason=unconfirmed";
        return;
      }

      let message = error.message;
      if (message.includes("Invalid login credentials")) {
        message = "이메일 또는 비밀번호가 잘못되었습니다.";
      }
      setMsg(message);
      setMsgType("error");
      return;
    }

    setMsg("로그인 완료! 홈페이지로 이동합니다...");
    setMsgType("success");

    setTimeout(() => {
      window.location.href = "/";
    }, 800);
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/60 px-8 py-8 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-white/20">
        <div className="mb-8 text-center">
          <p className="text-[10px] font-bold tracking-[0.3em] text-violet-400 uppercase mb-3 flex justify-center items-center gap-2">
            Drawing Verse <Sparkles size={12} />
          </p>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            당신의 유니버스로 돌아오세요 ✨
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 ml-1">
              이메일
            </label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 transition-colors">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full h-11 rounded-xl border border-white/10 bg-slate-950/50 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all disabled:opacity-50"
                placeholder="당신의 이메일"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 ml-1">
              비밀번호
            </label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full h-11 rounded-xl border border-white/10 bg-slate-950/50 pl-10 pr-10 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all disabled:opacity-50"
                placeholder="비밀번호"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400 transition-colors disabled:opacity-50"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {msg && (
            <div
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                msgType === "error"
                  ? "bg-red-500/10 border border-red-500/20 text-red-400"
                  : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
              }`}
            >
              <AlertCircle size={16} className="shrink-0" />
              <span>{msg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`h-11 rounded-xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 ${
              loading
                ? "bg-violet-500/50 text-white/70 cursor-not-allowed"
                : "bg-gradient-to-r from-violet-500 to-violet-600 text-white hover:from-violet-600 hover:to-violet-700 shadow-lg hover:shadow-violet-500/25"
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                로그인 중...
              </>
            ) : (
              "로그인"
            )}
          </button>
        </form>

        <div className="mt-6 space-y-3 text-sm">
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs">또는</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="text-center text-slate-400">
            아직 계정이 없나요?{" "}
            <Link
              className="text-violet-400 font-semibold hover:text-violet-300 transition-colors"
              href="/auth/register"
            >
              회원가입 →
            </Link>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-slate-400 transition-colors underline-offset-2 hover:underline"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
