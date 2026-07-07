"use client";

import { useState } from "react";
import Link from "next/link";
import TabsNav from "@/components/Common/TabsNav";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !nickname || !password || !passwordCheck) {
      setError("모든 칸을 채워주세요!");
      return;
    }

    if (password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 해요! 🧱");
      return;
    }

    if (password !== passwordCheck) {
      setError("비밀번호가 서로 달라요! 😭");
      return;
    }

    try {
      setLoading(true);

      // TODO: 나중에 /api/auth/signup 같은 실제 API랑 연결
      console.log("signup data", { email, nickname, password });

      setSuccess(
        "회원가입 정보가 잘 입력됐어요! (지금은 데모 상태니 잠시 기다려주세요! ✨)"
      );
    } catch (err) {
      setError("알 수 없는 에러가 발생했어요 :(");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="board">
      <div
        className="surface"
        style={{
          padding: "40px",
          maxWidth: "420px",
          margin: "40px auto",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            color: "var(--dream-ink)",
            marginBottom: "24px",
            fontSize: "2.2rem",
          }}
        >
          회원가입
        </h1>

        <p
          style={{
            fontSize: "0.95rem",
            color: "var(--muted)",
            marginBottom: "20px",
          }}
        >
          Drawing Verse 유니버스에 입장할 계정을 만들어봐요! ✨
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}
        >
          <input
            type="email"
            className="input"
            placeholder="이메일 주소"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="text"
            className="input"
            placeholder="닉네임"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />

          <input
            type="password"
            className="input"
            placeholder="비밀번호 (최소 6자)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            className="input"
            placeholder="비밀번호 확인"
            value={passwordCheck}
            onChange={(e) => setPasswordCheck(e.target.value)}
          />

          {error && (
            <p
              style={{
                color: "var(--error)",
                fontSize: "0.9rem",
                marginTop: "4px",
              }}
            >
              {error}
            </p>
          )}

          {success && (
            <p
              style={{
                color: "var(--success)",
                fontSize: "0.9rem",
                marginTop: "4px",
              }}
            >
              {success}
            </p>
          )}

          <button
            type="submit"
            className="btn primary"
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "1rem",
              marginTop: "0.6rem",
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "default" : "pointer",
            }}
            disabled={loading}
          >
            {loading ? "처리 중..." : "회원가입"}
          </button>
        </form>

        <div style={{ marginTop: "20px", fontSize: "0.9rem" }}>
          이미 계정이 있어?{" "}
          <Link
            href="/login"
            style={{
              color: "var(--link)",
              textDecoration: "none",
              marginLeft: "6px",
            }}
          >
            로그인하기
          </Link>
        </div>
      </div>
    </div>
  );
}
