import LoginClient from "./login-client";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ mode?: string; next?: string }> }) {
  const query = await searchParams;
  const initialMode = query.mode === "signup" ? "signup" : query.mode === "recover" ? "recover" : "login";
  const nextPath = query.next === "/universe/create" ? "/universe/create" : "/";
  return <LoginClient key={initialMode + nextPath} initialMode={initialMode} nextPath={nextPath} />;
}
