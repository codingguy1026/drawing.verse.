// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createUser, findUserByEmail } from "@/lib/db";
import { signUserToken, setAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password, nickname } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, message: "이메일과 비밀번호는 필수입니다." },
        { status: 400 }
      );
    }

    const exists = findUserByEmail(email);
    if (exists) {
      return NextResponse.json(
        { ok: false, message: "이미 가입된 이메일입니다." },
        { status: 409 }
      );
    }

    const user = await createUser(email, password, nickname);
    const token = await signUserToken(user);
    setAuthCookie(token);

    const { passwordHash, ...safeUser } = user;

    return NextResponse.json({ ok: true, user: safeUser });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, message: "회원가입 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
