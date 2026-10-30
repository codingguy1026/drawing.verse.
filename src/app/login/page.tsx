"use client";

import { type FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, LockKeyhole, Mail, ArrowRight, ArrowLeft, Sparkles, ShieldCheck, UserRound, Orbit, Github, CheckCircle2, AlertCircle } from "lucide-react";
import "./login.css";

type Mode = "login" | "signup" | "recover";
type Provider = "google" | "github";

function GoogleMark() {
  return <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>;
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const login = mode === "login";
  const recover = mode === "recover";

  function changeMode(next: Mode) {
    if (busy) return;
    setMode(next);
    setError("");
    setNotice("");
    setPassword("");
    setShowPassword(false);
  }

  async function socialSignIn(provider: Provider) {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback?next=/` },
      });
      if (authError) throw authError;
      // A successful provider request navigates the browser away.
    } catch {
      setError(provider === "google" ? "Google 로그인을 시작하지 못했어요. 다시 시도해 주세요." : "GitHub 로그인을 시작하지 못했어요. 다시 시도해 주세요.");
      setBusy(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");

    try {
      const cleanEmail = email.trim();
      if (recover) {
        // Route through the existing PKCE code exchange endpoint before setting a new password.
        const redirectTo = `${window.location.origin}/auth/callback?next=/auth/reset-password`;
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(cleanEmail, { redirectTo });
        if (resetError) throw resetError;
        setNotice("이메일을 확인해 주세요. 해당 계정에 재설정 안내를 보낼 수 있다면 메일이 도착해요.");
      } else if (login) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail, password,
        });
        if (authError || !data.session) throw authError || new Error("No session returned");
        setPassword("");
        router.replace("/");
        router.refresh();
      } else {
        const nickname = username.trim();
        if (nickname.length < 2 || nickname.length > 24) {
          setError("사용자명은 2~24자로 입력해 주세요.");
          return;
        }
        if (password.length < 8) {
          setError("비밀번호는 8자 이상 입력해 주세요.");
          return;
        }
        const { data, error: authError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { data: { username: nickname } },
        });
        if (authError) throw authError;
        setPassword("");
        if (data.session) {
          router.replace("/");
          router.refresh();
        } else {
          setMode("login");
          setNotice("가입 요청이 처리됐어요. 이메일 인증이 필요하다면 받은편지함을 확인해 주세요.");
        }
      }
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "";
      if (recover) {
        setError("재설정 메일을 보내지 못했어요. 잠시 후 다시 시도해 주세요.");
      } else if (login && /invalid login credentials|invalid credentials/i.test(message)) {
        setError("이메일 또는 비밀번호가 일치하지 않아요. 가입 방식을 확인하거나 비밀번호를 재설정해 보세요.");
      } else if (login) {
        setError("로그인할 수 없어요. 인증 설정이나 네트워크를 확인해 주세요.");
      } else {
        setError("회원가입을 완료하지 못했어요. 입력 정보를 확인하고 다시 시도해 주세요.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="dv-auth-screen">
      <section className="dv-auth-layout" aria-label="Drawing Verse 계정">
        <aside className="dv-auth-world" aria-label="Drawing Verse 소개">
          <div className="dv-auth-stars" aria-hidden="true" />
          <div className="dv-auth-world-top">
            <span className="dv-auth-brand-mark" aria-hidden="true">D<span>V</span></span>
            <span className="dv-auth-brand-copy"><strong>Drawing Verse</strong><small>VERSE NAVIGATOR</small></span>
            <span className="dv-auth-star-label">✦ YOUR OWN UNIVERSE</span>
          </div>
          <div className="dv-auth-world-center">
            <span className="dv-auth-eyebrow"><i /> CREATE · EXPLORE · CONNECT</span>
            <h1>모든 상상에는<br /><em>자신만의 우주가 있어.</em></h1>
            <p>이야기를 쓰고, 유니버스를 만들고, 새로운 세계를 발견하는 곳. 오늘도 당신만의 세계를 이어가세요.</p>
            <div className="dv-auth-orbit" aria-hidden="true">
              <span className="dv-auth-orbit-ring dv-auth-ring-one" />
              <span className="dv-auth-orbit-ring dv-auth-ring-two" />
              <span className="dv-auth-orbit-core"><span className="dv-auth-orbit-core-small">D</span><span>V</span></span>
              <span className="dv-auth-orbit-node dv-auth-node-one">✦</span>
              <span className="dv-auth-orbit-node dv-auth-node-two">✎</span>
              <span className="dv-auth-orbit-node dv-auth-node-three">◎</span>
            </div>
          </div>
          <div className="dv-auth-world-bottom">
            <span><Orbit size={15} /> 하나의 계정, 이어지는 세계</span>
            <span>DRAWING VERSE · 2026</span>
          </div>
        </aside>

        <div className="dv-auth-form-panel">
          <div className="dv-auth-top-nav">
            <Link href="/" className="dv-auth-back"><ArrowLeft size={15} /> 홈으로</Link>
            <span className="dv-auth-id-pill"><ShieldCheck size={14} /> Drawing ID</span>
          </div>
          <div className="dv-auth-form-center">
            <div className="dv-auth-mobile-mark" aria-hidden="true">DV</div>
            <p className="dv-auth-form-eyebrow"><Sparkles size={14} />
              {recover ? "ACCOUNT RECOVERY" : login ? "WELCOME BACK" : "START YOUR STORY"}
            </p>
            <h2>{recover ? "비밀번호를 찾고 있나요?" : login ? "다시 만나서 반가워!" : "새로운 세계를 시작해요."}</h2>
            <p className="dv-auth-subtitle">
              {recover ? "가입한 이메일로 재설정 안내를 보내 드릴게요." : login
                ? "Drawing Verse에서 사용하던 계정으로 로그인하세요."
                : "Drawing Verse의 새로운 탐험가가 되어 보세요."}
            </p>

            {!recover && (
              <div className="dv-auth-tabs" role="group" aria-label="계정 기능">
                <button type="button" aria-pressed={login} className={login ? "active" : ""} onClick={() => changeMode("login")}>로그인</button>
                <button type="button" aria-pressed={!login} className={!login ? "active" : ""} onClick={() => changeMode("signup")}>회원가입</button>
              </div>
            )}

            {!recover && (
              <>
                {process.env.NEXT_PUBLIC_DRAWING_SSO_ENABLED === "true" && (
                  <a href="/api/drawing-id/start" className="dv-auth-central"><ShieldCheck size={17} /> Drawing ID로 계속하기 <ArrowRight size={17} /></a>
                )}
                <div className="dv-auth-social">
                  <button type="button" disabled={busy} onClick={() => socialSignIn("google")}><GoogleMark /> Google</button>
                  <button type="button" disabled={busy} onClick={() => socialSignIn("github")}><Github size={20} /> GitHub</button>
                </div>
                <div className="dv-auth-divider"><span>또는 이메일로 계속하기</span></div>
              </>
            )}

            <form className="dv-auth-form" onSubmit={handleSubmit}>
              {!login && !recover && (
                <label className="dv-auth-field-label" htmlFor="dv-auth-username">사용자명
                  <div className="dv-auth-input-wrap"><UserRound size={18} aria-hidden="true" /><input id="dv-auth-username" type="text" autoComplete="username" placeholder="나만의 이름 (2~24자)" value={username} maxLength={24} minLength={2} onChange={event => setUsername(event.target.value)} required disabled={busy} /></div>
                </label>
              )}
              <label className="dv-auth-field-label" htmlFor="dv-auth-email">이메일
                <div className="dv-auth-input-wrap"><Mail size={18} aria-hidden="true" /><input id="dv-auth-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} maxLength={254} onChange={event => setEmail(event.target.value)} required disabled={busy} /></div>
              </label>
              {!recover && (
                <label className="dv-auth-field-label" htmlFor="dv-auth-password">비밀번호
                  <div className="dv-auth-input-wrap"><LockKeyhole size={18} aria-hidden="true" /><input id="dv-auth-password" type={showPassword ? "text" : "password"} autoComplete={login ? "current-password" : "new-password"} minLength={login ? undefined : 8} placeholder={login ? "비밀번호를 입력하세요" : "8자 이상 입력"} value={password} onChange={event => setPassword(event.target.value)} required disabled={busy} />
                    <button type="button" className="dv-auth-show" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 표시"} aria-pressed={showPassword}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  </div>
                </label>
              )}
              {login && <button type="button" className="dv-auth-forgot" onClick={() => changeMode("recover")}>비밀번호를 잊으셨나요?</button>}
              {error && <p className="dv-auth-status dv-auth-error" role="alert"><AlertCircle size={17} aria-hidden="true" /> {error}</p>}
              {notice && <p className="dv-auth-status dv-auth-success" role="status"><CheckCircle2 size={17} aria-hidden="true" /> {notice}</p>}
              <button className="dv-auth-submit" type="submit" disabled={busy}>
                <span>{busy ? "처리 중..." : recover ? "재설정 메일 보내기" : login ? "로그인하고 계속하기" : "Drawing Verse 시작하기"}</span><ArrowRight size={19} />
              </button>
            </form>

            {recover ? <button type="button" className="dv-auth-bottom-link" onClick={() => changeMode("login")}><ArrowLeft size={15} /> 로그인으로 돌아가기</button> :
              <p className="dv-auth-switch">{login ? "아직 계정이 없나요?" : "이미 계정이 있나요?"} <button type="button" onClick={() => changeMode(login ? "signup" : "login")}>{login ? "회원가입하기" : "로그인하기"}</button></p>}
          </div>

          <div className="dv-auth-panel-footer"><span>© 2026 Drawing Verse</span><span>당신의 세계는 계속됩니다.</span></div>
        </div>
      </section>
    </main>
  );
}
