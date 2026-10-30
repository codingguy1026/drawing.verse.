"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ShieldCheck, ArrowLeft, ArrowRight, LockKeyhole, CheckCircle2, AlertCircle } from "lucide-react";
import "../../login/login.css";

export default function ResetPasswordPage() {
  const supabase = useMemo(() => createClient(), []);
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    // The existing /auth/callback route already exchanged the PKCE recovery code.
    supabase.auth.getUser().then(({data,error}) => {
      if (live) { setReady(!error && !!data.user); setChecking(false); }
    }).catch(() => { if (live) setChecking(false); });
    return () => { live = false; };
  }, [supabase]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || busy) return;
    if (password.length < 8) { setError("비밀번호는 최소 8자 이상으로 설정해 주세요."); return; }
    if (password !== confirm) { setError("두 비밀번호가 일치하지 않아요."); return; }
    setBusy(true);
    setError("");
    try {
      const {error: updateError} = await supabase.auth.updateUser({password});
      if (updateError) throw updateError;
      setPassword("");
      setConfirm("");
      setDone(true);
    } catch {
      setError("비밀번호를 변경하지 못했어요. 재설정 링크를 다시 확인해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="dv-auth-screen">
    <section className="dv-auth-layout">
      <aside className="dv-auth-world" aria-label="Drawing Verse">
        <div className="dv-auth-world-top">
          <span className="dv-auth-brand-mark" aria-hidden="true">D<span>V</span></span>
          <span className="dv-auth-brand-copy"><strong>Drawing Verse</strong><small>VERSE NAVIGATOR</small></span>
        </div>
        <div className="dv-auth-world-center">
          <p className="dv-auth-eyebrow">✦ ACCOUNT RECOVERY</p>
          <h1>다시 시작되는<br /><em>당신만의 우주.</em></h1>
          <p>잊어버린 비밀번호를 바꾸고, 새로운 이야기를 이어가세요.</p>
          <div className="dv-auth-orbit" aria-hidden="true"><span className="dv-auth-orbit-ring dv-auth-ring-one" /><span className="dv-auth-orbit-core">DV</span></div>
        </div>
        <div className="dv-auth-world-bottom"><span>DRAWING VERSE · 2026</span></div>
      </aside>
      <div className="dv-auth-form-panel">
        <div className="dv-auth-top-nav"><Link href="/login" className="dv-auth-back"><ArrowLeft size={15} /> 로그인으로</Link><span className="dv-auth-id-pill"><ShieldCheck size={14} /> Drawing ID</span></div>
        <div className="dv-auth-form-center">
          <p className="dv-auth-form-eyebrow">ACCOUNT RECOVERY</p>
          <h2>새 비밀번호 만들기</h2>
          <p className="dv-auth-subtitle">보안을 위해 새로운 비밀번호를 입력해 주세요.</p>
          {checking ? <p className="dv-auth-status dv-auth-success" role="status">인증 정보를 확인하고 있어요...</p> :
            !ready ? <p className="dv-auth-status dv-auth-error" role="alert"><AlertCircle size={17} /> 유효한 로그인 세션이 없어요. 로그인 페이지에서 재설정 메일을 다시 요청해 주세요.</p> :
            done ? <div><p className="dv-auth-status dv-auth-success" role="status"><CheckCircle2 size={17} /> 비밀번호 변경이 완료됐어요!</p><Link href="/" className="dv-auth-central" style={{marginTop:20}}>드버스로 돌아가기 <ArrowRight size={18} /></Link></div> :
            <form className="dv-auth-form" onSubmit={submit}>
              <label className="dv-auth-field-label" htmlFor="dv-new-password">새 비밀번호
                <div className="dv-auth-input-wrap"><LockKeyhole size={18} /><input id="dv-new-password" type="password" autoComplete="new-password" minLength={8} value={password} onChange={event=>setPassword(event.target.value)} required disabled={busy} placeholder="8자 이상 입력" /></div>
              </label>
              <label className="dv-auth-field-label" htmlFor="dv-confirm-password">비밀번호 확인
                <div className="dv-auth-input-wrap"><LockKeyhole size={18} /><input id="dv-confirm-password" type="password" autoComplete="new-password" minLength={8} value={confirm} onChange={event=>setConfirm(event.target.value)} required disabled={busy} placeholder="비밀번호 다시 입력" /></div>
              </label>
              {error && <p className="dv-auth-status dv-auth-error" role="alert"><AlertCircle size={17} /> {error}</p>}
              <button className="dv-auth-submit" type="submit" disabled={busy}>{busy?"변경 중...":"비밀번호 변경하기"} <ArrowRight size={18} /></button>
            </form>}
        </div>
        <div className="dv-auth-panel-footer"><span>© 2026 Drawing Verse</span><span>Continue your universe.</span></div>
      </div>
    </section>
  </main>;
}
