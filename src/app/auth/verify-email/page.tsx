"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Mail,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;

  const visible = local.slice(0, Math.min(2, local.length));
  const hidden = "•".repeat(Math.max(3, local.length - visible.length));
  return `${visible}${hidden}@${domain}`;
}

export default function VerifyEmailPage() {
  const [email, setEmail] = useState("");
  const [ready, setReady] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const pendingEmail = sessionStorage.getItem("dv_pending_verification_email") ?? "";
    setEmail(pendingEmail);
    setReady(true);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = window.setInterval(() => {
      setCooldown((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldown]);

  const maskedEmail = useMemo(() => (email ? maskEmail(email) : ""), [email]);

  async function resend() {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || sending || cooldown > 0) return;

    setSending(true);
    setMessage(null);
    setMessageType(null);

    const emailRedirectTo = `${window.location.origin}/auth/callback?next=/auth/verified`;
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: cleanEmail,
      options: { emailRedirectTo },
    });

    if (error) {
      setMessage(
        error.message.toLowerCase().includes("rate")
          ? "잠시 후 다시 시도해 주세요. 인증 메일 재전송 횟수 제한에 걸렸을 수 있어요."
          : error.message
      );
      setMessageType("error");
      setSending(false);
      return;
    }

    sessionStorage.setItem("dv_pending_verification_email", cleanEmail);
    setEmail(cleanEmail);
    setCooldown(60);
    setMessage("인증 메일을 다시 보냈어요. 받은편지함과 스팸함을 확인해 주세요.");
    setMessageType("success");
    setSending(false);
  }

  if (!ready) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 text-white">
        <Loader2 className="h-7 w-7 animate-spin text-violet-300" />
      </main>
    );
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-slate-950 p-4 text-white">
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-violet-500/15 blur-[110px]" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-sky-500/10 blur-[110px]" />

      <section className="relative w-full max-w-lg rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-violet-500/15 text-violet-200 ring-1 ring-violet-300/20">
          <Mail className="h-8 w-8" />
        </div>

        <div className="mt-6 text-center">
          <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-violet-300">
            Drawing Verse <Sparkles className="h-3 w-3" />
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">이메일을 확인해 주세요</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            가입을 마치려면 받은 인증 메일의 링크를 눌러야 해요.
          </p>

          {maskedEmail && (
            <div className="mx-auto mt-5 w-fit rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-200">
              {maskedEmail}
            </div>
          )}
        </div>

        {!email && (
          <label className="mt-6 block">
            <span className="mb-2 block text-xs font-bold text-slate-300">
              인증 메일을 다시 받을 이메일
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="name@example.com"
              className="min-h-12 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 text-base text-white outline-none transition focus:border-violet-400/60 focus:ring-4 focus:ring-violet-500/10"
            />
          </label>
        )}

        {message && (
          <div
            role={messageType === "error" ? "alert" : "status"}
            className={`mt-5 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
              messageType === "error"
                ? "border-rose-400/20 bg-rose-400/10 text-rose-200"
                : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
            }`}
          >
            {messageType === "error" ? (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span>{message}</span>
          </div>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={resend}
            disabled={!email.trim() || sending || cooldown > 0}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 text-sm font-black text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {sending
              ? "보내는 중..."
              : cooldown > 0
                ? `${cooldown}초 후 재전송`
                : "인증 메일 다시 보내기"}
          </button>

          <Link
            href="/auth/login"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-black text-slate-200 transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" /> 로그인으로
          </Link>
        </div>

        <p className="mt-5 text-center text-xs leading-5 text-slate-500">
          메일이 바로 보이지 않으면 스팸함도 확인해 주세요. 링크는 한 번만 사용할 수 있어요.
        </p>
      </section>
    </main>
  );
}
