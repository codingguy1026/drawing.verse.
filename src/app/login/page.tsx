"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function IconEye() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-slate-400 transition-colors group-hover:text-violet-500">
      <path d="M1 12C3.5 7 7.5 4 12 4s8.5 3 11 8c-2.5 5-6.5 8-11 8s-8.5-3-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconEyeOff() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-slate-400 transition-colors group-hover:text-violet-500">
      <path d="M17.94 17.94C16.2 19.2 14.2 20 12 20c-4.5 0-8.5-3-11-8 1.2-2.4 2.8-4.3 4.7-5.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconGithub() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.29 9.43 7.86 10.96.57.1.78-.25.78-.55v-2c-3.2.7-3.87-1.38-3.87-1.38-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.33.96.1-.74.4-1.25.73-1.54-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.3 1.18-3.11-.12-.3-.51-1.52.11-3.17 0 0 .96-.31 3.15 1.18a10.9 10.9 0 012.87-.39c.97 0 1.95.13 2.87.39 2.18-1.5 3.14-1.18 3.14-1.18.63 1.65.24 2.87.12 3.17.73.81 1.18 1.85 1.18 3.11 0 4.43-2.7 5.4-5.28 5.69.41.35.77 1.04.77 2.1v3.12c0 .3.2.66.79.55A11.51 11.51 0 0023.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

function IconGoogle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}


function DreamOrb({ className }: { className: string }) {
  return <div className={className} />;
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/45 px-3 py-3 text-left shadow-sm backdrop-blur-md">
      <p className="text-base font-black text-slate-900">{value}</p>
      <p className="mt-0.5 text-[11px] font-semibold text-slate-400">{label}</p>
    </div>
  );
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isLogin = mode === "login";
  const supabase = createClient();
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/`,
      },
    });
    if (error) {
      console.error(error.message);
      setError("Google 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.");
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/`,
      },
    });
    if (error) {
      console.error(error.message);
      setError("GitHub 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.");
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
        setLoading(false);
      } else {
        router.push("/");
        router.refresh();
      }
    } else {
      if (!username) {
        setError("사용자명을 입력해주세요.");
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        setError(null);
        alert("가입 확인 이메일을 보냈습니다. 이메일을 확인해주세요! 📬");
        setMode("login");
        setLoading(false);
      }
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-5 font-sans transition-colors duration-700 dark:bg-[#03050a]">
      {/* Deep Space Background Atmosphere */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-1000 dark:opacity-100">
        <div className="absolute left-[-10%] top-[-10%] h-[600px] w-[600px] rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[-5%] h-[500px] w-[500px] rounded-full bg-indigo-600/15 blur-[100px]" />
      </div>

      <section className="group relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[40px] border border-slate-200 bg-white/80 shadow-[0_32px_80px_rgba(148,163,184,0.15)] backdrop-blur-3xl transition-all duration-700 dark:border-white/10 dark:bg-[#0b0e14]/60 dark:shadow-[0_32px_80px_rgba(0,0,0,0.5)] lg:grid-cols-[1.05fr_0.95fr]">
        <DreamOrb className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-pink-500/10 blur-[100px] transition-all group-hover:bg-pink-500/20 dark:bg-pink-500/15" />
        <DreamOrb className="absolute -bottom-32 right-[-60px] h-96 w-96 rounded-full bg-violet-500/10 blur-[120px] transition-all group-hover:bg-violet-500/20 dark:bg-violet-500/15" />

        <aside className="relative hidden min-h-[700px] flex-col justify-between border-r border-slate-100 bg-slate-50/30 p-12 backdrop-blur-2xl dark:border-white/5 dark:bg-white/[0.02] lg:flex">
          <div className="relative z-10">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-slate-950 text-xl font-black tracking-tighter text-white shadow-2xl dark:bg-white dark:text-slate-950">
                DV
              </div>
              <div>
                <p className="text-xl font-black tracking-tight text-slate-950 dark:text-white">DRAWING VERSE</p>
                <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">dreaming space</p>
              </div>
            </div>

            <div className="mt-20 max-w-md">
              <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.25em] text-indigo-500 dark:text-indigo-400">
                Creative universe
              </span>

              <h1 className="mt-6 text-6xl font-black leading-[1.1] tracking-tighter text-slate-900 dark:text-white">
                다시 돌아온 걸
                <br />
                <span className="bg-gradient-to-r from-violet-600 via-indigo-500 to-sky-400 bg-clip-text text-transparent dark:from-violet-400 dark:via-indigo-300 dark:to-sky-200">
                  환영해
                </span>
              </h1>

              <p className="mt-8 text-lg leading-relaxed text-slate-500 dark:text-slate-400">
                당신의 모든 그림과 이야기, 세계관이
                하나의 별이 되어 모이는 곳.
                오늘도 이어질 당신의 기록을 기다려요.
              </p>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-4">
            <MiniStat value="93" label="Universes" />
            <MiniStat value="2.6K" label="Comments" />
            <MiniStat value="42" label="Online" />
          </div>
        </aside>

        <div className="relative flex min-h-[700px] items-center justify-center p-8 lg:p-12">
          <div className="relative z-10 w-full max-w-[400px]">
            <header className="mb-10 text-center lg:text-left">
              <div className="mb-8 flex justify-center lg:hidden">
                <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-slate-950 text-xl font-black tracking-tighter text-white shadow-2xl dark:bg-white dark:text-slate-950">
                  DV
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-500 dark:text-indigo-400">
                  {isLogin ? "Welcome back" : "Create account"}
                </p>

                <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">
                  {isLogin ? "로그인" : "회원가입"}
                </h2>

                <p className="text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-500">
                  {isLogin ? "계정에 로그인하고 DV 홈으로 돌아가세요." : "새로운 유니버스를 지금 시작해보세요."}
                </p>
              </div>
            </header>

            <div className="grid gap-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="flex h-14 w-full items-center justify-center gap-3 rounded-[1.25rem] border border-slate-200 bg-white px-2 text-sm font-bold text-slate-700 shadow-sm transition-all hover:-translate-y-1 hover:bg-slate-50 hover:shadow-md disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                <IconGoogle />
                <span className="mt-0.5">{loading ? "이동 중..." : "Google로 로그인"}</span>
              </button>

              <button
                type="button"
                onClick={handleGithubLogin}
                disabled={loading}
                className="flex h-14 w-full items-center justify-center gap-3 rounded-[1.25rem] border border-slate-200 bg-white px-2 text-sm font-bold text-slate-700 shadow-sm transition-all hover:-translate-y-1 hover:bg-slate-50 hover:shadow-md disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                <IconGithub />
                <span className="mt-0.5">{loading ? "이동 중..." : "GitHub으로 로그인"}</span>
              </button>
            </div>

            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-white/5" />
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className="bg-white px-4 font-black uppercase tracking-[0.2em] text-slate-400 dark:bg-[#0b0e14] dark:text-slate-600">
                  OR USE EMAIL
                </span>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleEmailSubmit}>
              {!isLogin && (
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-[1.25rem] border border-slate-200 bg-slate-50/50 px-5 py-4 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-600 dark:focus:border-indigo-500/50"
                    placeholder="사용자명"
                  />
                </div>
              )}

              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-[1.25rem] border border-slate-200 bg-slate-50/50 px-5 py-4 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-600 dark:focus:border-indigo-500/50"
                  placeholder="이메일"
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-[1.25rem] border border-slate-200 bg-slate-50/50 px-5 py-4 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-600 dark:focus:border-indigo-500/50"
                  placeholder="비밀번호"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 transition-colors hover:text-indigo-500"
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>

              {isLogin && (
                <div className="flex items-center justify-between px-1 text-xs">
                  <label className="flex items-center gap-2 font-bold text-slate-500 dark:text-slate-600">
                    <input type="checkbox" className="h-4 w-4 rounded border-slate-200 dark:border-white/10 dark:bg-white/5" />
                    로그인 상태 유지
                  </label>
                  <button type="button" className="font-bold text-slate-500 transition-colors hover:text-indigo-500 dark:text-slate-600 dark:hover:text-white">
                    비밀번호를 잊으셨나요?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full rounded-[1.25rem] bg-slate-950 py-4 text-sm font-black text-white shadow-2xl transition-all hover:-translate-y-1 hover:bg-slate-900 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
              >
                {loading ? "처리 중..." : isLogin ? "계정 로그인" : "시작하기"}
              </button>
            </form>

            <p className="mt-10 text-center text-xs font-bold text-slate-400 dark:text-slate-600">
              {isLogin ? "아직 회원이 아니신가요? " : "이미 계정이 있으신가요? "}
              <button
                type="button"
                onClick={() => setMode(isLogin ? "signup" : "login")}
                className="text-slate-950 underline-offset-4 hover:underline dark:text-white"
              >
                {isLogin ? "회원가입" : "로그인"}
              </button>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}