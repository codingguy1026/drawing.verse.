"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import {
  Loader2,
  LogOut,
  MessageCircle,
  Send,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type TalkState = "intro" | "matching" | "chat";

type VerseTalkRoom = {
  id: string;
  user_a: string;
  user_b: string;
  user_a_nickname: string;
  user_b_nickname: string;
  status: "active" | "ended";
  created_at: string;
  ended_at: string | null;
};

type TalkMessage = {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

function normalizeNickname(value: string) {
  return value.trim().slice(0, 30);
}

function getOpponentNickname(room: VerseTalkRoom | null, userId?: string | null) {
  if (!room || !userId) return "Anonymous";
  return room.user_a === userId
    ? room.user_b_nickname || "Anonymous"
    : room.user_a_nickname || "Anonymous";
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error) {
    return String((error as { message?: unknown }).message || "Supabase 요청이 실패했어요.");
  }
  return "Supabase 요청이 실패했어요.";
}

export default function CommunityPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [state, setState] = useState<TalkState>("intro");
  const [nickname, setNickname] = useState("");
  const [room, setRoom] = useState<VerseTalkRoom | null>(null);
  const [messages, setMessages] = useState<TalkMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [matchingTime, setMatchingTime] = useState(0);
  const [busy, setBusy] = useState(false);
  const [errorText, setErrorText] = useState("");

  const matchTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secondsTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const matchingRef = useRef(false);

  const opponentNickname = useMemo(
    () => getOpponentNickname(room, user?.id),
    [room, user?.id]
  );

  const stopTimers = useCallback(() => {
    if (matchTimerRef.current) clearInterval(matchTimerRef.current);
    if (secondsTimerRef.current) clearInterval(secondsTimerRef.current);
    matchTimerRef.current = null;
    secondsTimerRef.current = null;
    matchingRef.current = false;
  }, []);

  const loadMessages = useCallback(async (roomId: string) => {
    const { data, error } = await supabase
      .from("messages")
      .select("id,room_id,sender_id,content,created_at")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true });

    if (error) {
      setErrorText(error.message);
      return;
    }

    setMessages((data ?? []) as TalkMessage[]);
  }, []);

  const enterRoom = useCallback(
    async (nextRoom: VerseTalkRoom) => {
      stopTimers();
      setRoom(nextRoom);
      setState("chat");
      setMatchingTime(0);
      setErrorText("");
      await loadMessages(nextRoom.id);
    },
    [loadMessages, stopTimers]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      const { data, error } = await supabase.auth.getUser();
      if (cancelled) return;
      setUser(error ? null : data.user ?? null);
      setAuthLoading(false);
    }

    loadUser();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
      stopTimers();
    };
  }, [stopTimers]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const attemptMatch = useCallback(
    async (cleanNickname: string) => {
      if (!user?.id || matchingRef.current) return;
      matchingRef.current = true;

      try {
        const { data, error } = await supabase.rpc("match_verse_talk", {
          display_nickname: cleanNickname,
        });

        if (error) {
          const message = errorMessage(error);
          if (message.toLowerCase().includes("function") || message.includes("match_verse_talk")) {
            setErrorText(
              "Verse Talk DB가 아직 준비되지 않았어요. 20260825_supabase_alignment.sql migration을 적용해 주세요."
            );
            stopTimers();
            setState("intro");
          } else {
            setErrorText(message);
          }
          return;
        }

        const matchedRoom = Array.isArray(data) ? data[0] : data;
        if (matchedRoom?.id) {
          await enterRoom(matchedRoom as VerseTalkRoom);
        }
      } catch (error) {
        setErrorText(errorMessage(error));
      } finally {
        matchingRef.current = false;
      }
    },
    [enterRoom, stopTimers, user?.id]
  );

  async function startMatching() {
    if (!user) {
      setErrorText("로그인이 필요해요.");
      return;
    }

    const cleanNickname = normalizeNickname(nickname);
    if (!cleanNickname) {
      setErrorText("닉네임을 입력해 주세요.");
      return;
    }

    setBusy(true);
    setErrorText("");
    setState("matching");
    setMatchingTime(0);

    await attemptMatch(cleanNickname);

    if (state !== "chat") {
      secondsTimerRef.current = setInterval(() => {
        setMatchingTime((value) => value + 1);
      }, 1000);
      matchTimerRef.current = setInterval(() => {
        void attemptMatch(cleanNickname);
      }, 2000);
    }

    setBusy(false);
  }

  async function cancelMatching() {
    stopTimers();
    if (user?.id) {
      await supabase.from("verse_talk_queue").delete().eq("user_id", user.id);
    }
    setState("intro");
    setMatchingTime(0);
    setErrorText("");
  }

  async function sendMessage() {
    if (!user?.id || !room?.id) return;
    const content = messageInput.trim().slice(0, 1000);
    if (!content) return;

    setMessageInput("");
    const { data, error } = await supabase
      .from("messages")
      .insert({ room_id: room.id, sender_id: user.id, content })
      .select("id,room_id,sender_id,content,created_at")
      .single();

    if (error) {
      setErrorText(error.message);
      setMessageInput(content);
      return;
    }

    const nextMessage = data as TalkMessage;
    setMessages((current) =>
      current.some((message) => message.id === nextMessage.id)
        ? current
        : [...current, nextMessage]
    );
  }

  async function leaveChat() {
    if (room?.id) {
      const { error } = await supabase
        .from("verse_talk_rooms")
        .update({ status: "ended", ended_at: new Date().toISOString() })
        .eq("id", room.id);
      if (error) setErrorText(error.message);
    }

    setRoom(null);
    setMessages([]);
    setMessageInput("");
    setState("intro");
  }

  useEffect(() => {
    if (!room?.id) return;

    const messageChannel = supabase
      .channel(`verse-talk-messages-${room.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${room.id}`,
        },
        (payload) => {
          const next = payload.new as TalkMessage;
          setMessages((current) =>
            current.some((message) => message.id === next.id)
              ? current
              : [...current, next]
          );
        }
      )
      .subscribe();

    const roomChannel = supabase
      .channel(`verse-talk-room-${room.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "verse_talk_rooms",
          filter: `id=eq.${room.id}`,
        },
        (payload) => {
          const next = payload.new as VerseTalkRoom;
          setRoom(next);
          if (next.status === "ended") {
            setErrorText("상대가 대화를 종료했어요.");
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(messageChannel);
      void supabase.removeChannel(roomChannel);
    };
  }, [room?.id]);

  if (authLoading) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-slate-50 dark:bg-[#070711]">
        <Loader2 className="h-7 w-7 animate-spin text-violet-500" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 pt-28 dark:bg-[#070711] dark:text-white">
        <section className="mx-auto max-w-xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center dark:border-white/10 dark:bg-[#0d0d19]">
          <MessageCircle className="mx-auto h-10 w-10 text-violet-500" />
          <h1 className="mt-4 text-3xl font-black">Verse Talk</h1>
          <p className="mt-3 text-sm text-slate-500 dark:text-white/45">랜덤 대화를 시작하려면 먼저 로그인해 주세요.</p>
          <a href="/auth/login" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-slate-950 px-5 text-sm font-black text-white dark:bg-white dark:text-slate-950">로그인</a>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-12 pt-28 text-slate-950 dark:bg-[#070711] dark:text-white sm:px-6">
      <section className="mx-auto max-w-3xl">
        {state === "intro" && (
          <div className="space-y-6">
            <header className="text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg">
                <MessageCircle className="h-8 w-8" />
              </div>
              <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300">Drawing Verse Community</p>
              <h1 className="mt-2 text-4xl font-black sm:text-5xl">Verse Talk</h1>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 dark:text-white/45">대기 중인 한 명과 연결되어 창작, 세계관, 그림 이야기를 실시간으로 나눌 수 있어요.</p>
            </header>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-white/10 dark:bg-[#0d0d19]">
              <div className="grid gap-3 sm:grid-cols-3">
                <Feature icon={WandSparkles} title="원자적 매칭" description="DB 함수가 한 번에 상대를 잡아 중복 방을 줄여요." />
                <Feature icon={Sparkles} title="RLS 보호" description="내 방과 내 메시지만 접근할 수 있어요." />
                <Feature icon={MessageCircle} title="Realtime" description="새 메시지가 들어오면 바로 화면에 나타나요." />
              </div>

              <label className="mt-6 block text-sm font-black">오늘 사용할 닉네임</label>
              <input value={nickname} onChange={(event) => setNickname(event.target.value)} maxLength={30} placeholder="예: 우주먼지작가" className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-base outline-none focus:border-violet-400 dark:border-white/10 dark:bg-white/5" />

              {errorText && <p role="status" className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:bg-rose-400/10 dark:text-rose-100">{errorText}</p>}

              <button type="button" onClick={startMatching} disabled={busy || !nickname.trim()} className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 font-black text-white disabled:opacity-40">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                랜덤 매칭 시작
              </button>
              <p className="mt-4 text-center text-xs leading-5 text-slate-400">낯선 사람과 연결될 수 있으니 개인 연락처, 주소 같은 개인정보는 공유하지 않는 게 좋아요.</p>
            </motion.div>
          </div>
        )}

        {state === "matching" && (
          <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
            <div className="relative grid h-20 w-20 place-items-center"><div className="absolute inset-0 animate-ping rounded-full border-2 border-violet-400/25" /><Loader2 className="h-9 w-9 animate-spin text-violet-500" /></div>
            <h2 className="mt-5 text-xl font-black">상대를 찾는 중...</h2>
            <p className="mt-2 text-sm text-slate-400">{matchingTime}초째 우주 전파 송신 중</p>
            {errorText && <p className="mt-4 max-w-md rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-400/10 dark:text-rose-100">{errorText}</p>}
            <button type="button" onClick={cancelMatching} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold dark:border-white/10 dark:bg-white/5"><X className="h-4 w-4" /> 매칭 취소</button>
          </div>
        )}

        {state === "chat" && room && (
          <div className="flex min-h-[620px] flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0d0d19]">
            <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
              <div><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-500">Connected with</p><h2 className="mt-1 text-lg font-black">{opponentNickname}</h2></div>
              <button type="button" onClick={leaveChat} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-500 dark:border-white/10 dark:text-white/50"><LogOut className="h-4 w-4" /> 나가기</button>
            </header>

            {room.status === "ended" && <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">대화가 종료됐어요. 새 매칭을 시작하려면 나가기를 눌러 주세요.</div>}

            <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
              {!messages.length && <p className="py-10 text-center text-sm text-slate-400">첫 메시지를 보내보세요 👋</p>}
              {messages.map((message) => {
                const mine = message.sender_id === user.id;
                return (
                  <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${mine ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-700 dark:bg-white/7 dark:text-white/75"}`}>
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      <p className={`mt-1 text-[10px] ${mine ? "text-white/55" : "text-slate-400"}`}>{new Intl.DateTimeFormat("ko-KR", { hour: "2-digit", minute: "2-digit" }).format(new Date(message.created_at))}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {errorText && <p className="mx-4 mb-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 dark:bg-rose-400/10 dark:text-rose-100">{errorText}</p>}

            <div className="border-t border-slate-200 p-4 dark:border-white/10">
              <div className="flex gap-2">
                <textarea value={messageInput} onChange={(event) => setMessageInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} maxLength={1000} disabled={room.status !== "active"} rows={2} placeholder="메시지를 입력하세요" className="min-h-12 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base outline-none focus:border-violet-400 disabled:opacity-40 dark:border-white/10 dark:bg-white/5" />
                <button type="button" onClick={sendMessage} disabled={!messageInput.trim() || room.status !== "active"} className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-violet-600 text-white disabled:opacity-35" aria-label="메시지 보내기"><Send className="h-5 w-5" /></button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function Feature({ icon: Icon, title, description }: { icon: typeof Sparkles; title: string; description: string }) {
  return <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.04]"><Icon className="h-5 w-5 text-violet-500" /><p className="mt-3 text-sm font-black">{title}</p><p className="mt-1 text-xs leading-5 text-slate-400">{description}</p></div>;
}
