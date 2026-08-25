"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Sparkles,
  UserRound,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const cleanNickname = nickname.trim().slice(0, 40);
    const cleanEmail = email.trim().toLowerCase();

    setErrorMessage(null);
    setSuccessMessage(null);

    if (!cleanNickname || !cleanEmail || !password || !confirmPassword) {
      setErrorMessage("모든 필드를 입력해 주세요.");
      return;
    }

    if (cleanNickname.length < 2) {
      setErrorMessage("닉네임은 2자 이상 입력해 주세요.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("비밀번호가 서로 일치하지 않습니다.");
      return;
    }

    setSubmitting(true);

    const emailRedirectTo = `${window.location.origin}/auth/callback?next=/auth/verified`;
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        emailRedirectTo,
        data: {
          nickname: cleanNickname,
          display_name: cleanNickname,
        },
      },
    });

    if (error) {
      let message = error.message;
      if (message.toLowerCase().includes("password")) {
        message = "비밀번호 보안 수준을 확인해 주세요.";
      }
      setErrorMessage(message);
      setSubmitting(false);
      return;
    }

    // Confirm email OFF: Supabase returns a session immediately.
    if (data.session) {
      setSuccessMessage("계정과 프로필이 생성됐어요. 내 프로필로 이동합니다.");
      setTimeout(() => {
        router.push(`/users/${data.user?.id}`);
        router.refresh();
      }, 700);
      setSubmitting(false);
      return;
    }

    // Confirm email ON: Supabase sent a confirmation email and returns no session.
    sessionStorage.setItem("dv_pending_verification_email", cleanEmail);
    setSuccessMessage("인증 메일을 보냈어요. 이메일 확인 페이지로 이동합니다.");

    setTimeout(() => {
      router.push("/auth/verify-email");
    }, 600);

    setSubmitting(false);
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-slate-950 p-4 text-white">
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-violet-500/15 blur-[110px]" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-sky-500/10 blur-[110px]" />

      <section className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="text-center">
          <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-violet-300">
            Drawing Verse <Sparkles className="h-3 w-3" />
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">계정 만들기</h1>
          <p className="mt-2 text-sm text-slate-400">
            닉네임은 가입과 동시에 Drawing Verse 프로필에 연결됩니다.
          </p>
        </div>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <Field label="닉네임" icon={UserRound}>
            <input
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              maxLength={40}
              autoComplete="nickname"
              placeholder="Drawing Verse에서 사용할 이름"
              className="field"
            />
          </Field>

          <Field label="이메일" icon={Mail}>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="name@example.com"
              className="field"
            />
          </Field>

          <PasswordField
            label="비밀번호"
            value={password}
            setValue={setPassword}
            visible={showPassword}
            toggle={() => setShowPassword((value) => !value)}
            autoComplete="new-password"
          />

          <PasswordField
            label="비밀번호 확인"
            value={confirmPassword}
            setValue={setConfirmPassword}
            visible={showConfirmPassword}
            toggle={() => setShowConfirmPassword((value) => !value)}
            autoComplete="new-password"
          />

          {confirmPassword && password !== confirmPassword && (
            <p className="text-xs font-semibold text-rose-300">비밀번호가 일치하지 않아요.</p>
          )}

          {errorMessage && (
            <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 text-sm font-black text-white shadow-lg shadow-violet-500/15 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "계정 생성 중..." : "회원가입"}
          </button>
        </form>

        <p className="mt-6 border-t border-white/10 pt-5 text-center text-xs text-slate-400">
          이미 계정이 있나요?{" "}
          <Link href="/auth/login" className="font-black text-violet-300 hover:text-violet-200">
            로그인
          </Link>
        </p>
      </section>

      <style jsx>{`
        .field {
          min-height: 44px;
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgb(255 255 255 / 0.1);
          background: rgb(2 6 23 / 0.55);
          padding: 0 0.9rem 0 2.65rem;
          font-size: 16px;
          color: white;
          outline: none;
        }
        .field:focus {
          border-color: rgb(167 139 250 / 0.65);
          box-shadow: 0 0 0 3px rgb(139 92 246 / 0.12);
        }
      `}</style>
    </main>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: typeof Mail;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold text-slate-300">{label}</span>
      <span className="relative block">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        {children}
      </span>
    </label>
  );
}

function PasswordField({
  label,
  value,
  setValue,
  visible,
  toggle,
  autoComplete,
}: {
  label: string;
  value: string;
  setValue: (value: string) => void;
  visible: boolean;
  toggle: () => void;
  autoComplete: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold text-slate-300">{label}</span>
      <span className="relative block">
        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          autoComplete={autoComplete}
          className="field pr-12"
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
          aria-label={visible ? "비밀번호 숨기기" : "비밀번호 보기"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </span>
    </label>
  );
}
