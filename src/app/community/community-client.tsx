"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { squishyVariants } from "@/lib/animations";
import type { User } from "@supabase/supabase-js";
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

type QueueEntry = {
  id: string;
  user_id: string;
  nickname: string;
  created_at: string;
};

type VerseTalkRoom = {
  id: string;
  user_a: string;
  user_b: string;
  user_a_nickname: string | null;
  user_b_nickname: string | null;
  status: "waiting" | "active" | "ended";
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

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeNickname(value: string) {
  return value.trim().slice(0, 30);
}

function getOpponentNickname(room: VerseTalkRoom | null, user_id?: string | null) {
  if (!room || !user_id) return "Anonymous";

  if (room.user_a === user_id) {
    return room.user_b_nickname || "Anonymous";
  }

  return room.user_a_nickname || "Anonymous";
}

function getSupabaseErrorMessage(error: unknown) {
  if (!error) return "알 수 없는 오류가 발생했어.";

  if (typeof error === "string") return error;

  if (typeof error === "object") {
    const maybeError = error as {
      message?: string;
      details?: string;
      hint?: string;
      code?: string;
    };

    return [maybeError.message, maybeError.details, maybeError.hint, maybeError.code]
      .filter(Boolean)
      .join(" / ") || "Supabase 요청이 실패했어.";
  }

  return "Supabase 요청이 실패했어.";
}

export default function CommunityPage() {


  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [talkState, setTalkState] = useState<TalkState>("intro");
  const [nickname, setNickname] = useState("");
  const [queueId, setQueueId] = useState<string | null>(null);
  const [room, setRoom] = useState<VerseTalkRoom | null>(null);
  const [messages, setMessages] = useState<TalkMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [matchingTime, setMatchingTime] = useState(0);

  const [isBusy, setIsBusy] = useState(false);
  const [errorText, setErrorText] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const matchIntervalRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);

  const opponentNickname = useMemo(
    () => getOpponentNickname(room, user?.id),
    [room, user?.id]
  );

  const isOpponentConnected = room?.status === "active";

  const clearMatchingIntervals = useCallback(() => {
    if (matchIntervalRef.current) {
      clearInterval(matchIntervalRef.current);
      matchIntervalRef.current = null;
    }

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const resetToIntro = useCallback(() => {
    clearMatchingIntervals();
    setTalkState("intro");
    setQueueId(null);
    setRoom(null);
    setMessages([]);
    setMessageInput("");
    setMatchingTime(0);
    setIsBusy(false);
    setErrorText("");
  }, [clearMatchingIntervals]);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (!isMounted) return;

        if (error) {
          console.warn("Auth check error:", error.message);
          setUser(null);
        } else {
          setUser(data?.user ?? null);
        }
        setIsAuthLoading(false);
      } catch (err) {
        console.error("Critical auth error:", err);
        if (isMounted) setIsAuthLoading(false);
      }
    };

    loadUser();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;

      setUser(session?.user ?? null);
      setIsAuthLoading(false);
    });

    const subscription = data?.subscription;

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    return () => {
      clearMatchingIntervals();
    };
  }, [clearMatchingIntervals]);

  const loadMessages = useCallback(
    async (room_id: string) => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("room_id", room_id)
        .order("created_at", { ascending: true });

      if (error) {
        const message = getSupabaseErrorMessage(error);
        console.warn("Load messages error:", message);
        setErrorText(message);
        return;
      }

      setMessages((data || []) as TalkMessage[]);
    },
    [supabase]
  );

  const enterRoom = useCallback(
    async (nextRoom: VerseTalkRoom) => {
      clearMatchingIntervals();

      setRoom(nextRoom);
      setTalkState("chat");
      setQueueId(null);
      setMatchingTime(0);
      setErrorText("");

      await loadMessages(nextRoom.id);
    },
    [clearMatchingIntervals, loadMessages]
  );

  const findActiveRoom = useCallback(async () => {
    if (!user?.id) return null;

    const { data, error } = await supabase
      .from("verse_talk_rooms")
      .select("*")
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      const message = getSupabaseErrorMessage(error);
      console.warn("Find active room error:", message);
      setErrorText(message);
      return null;
    }

    if (!data || data.length === 0) return null;

    return data[0] as VerseTalkRoom;
  }, [supabase, user?.id]);

  const tryMatch = useCallback(
    async (myQueueId?: string, myNickname?: string) => {
      if (!user?.id) return;

      const activeRoom = await findActiveRoom();

      if (activeRoom) {
        await enterRoom(activeRoom);
        return;
      }

      const { data: opponentQueue, error: opponentError } = await supabase
        .from("verse_talk_queue")
        .select("*")
        .neq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(1);

      if (opponentError) {
        const message = getSupabaseErrorMessage(opponentError);
        console.warn("Find opponent error:", message);
        setErrorText(message);
        return;
      }

      const opponent = opponentQueue?.[0] as QueueEntry | undefined;

      if (!opponent) return;

      const cleanNickname = myNickname || normalizeNickname(nickname) || "Anonymous";

      const { data: newRoom, error: roomError } = await supabase
        .from("verse_talk_rooms")
        .insert({
          id: createId(),
          user_a: user.id,
          user_b: opponent.user_id,
          user_a_nickname: cleanNickname,
          user_b_nickname: opponent.nickname,
          status: "active",
        })
        .select()
        .single();

      if (roomError) {
        const message = getSupabaseErrorMessage(roomError);
        console.warn("Create room error:", message);
        setErrorText(message);
        return;
      }

      const idsToDelete = [...new Set([myQueueId, queueId, opponent.id].filter(Boolean))] as string[];

      if (idsToDelete.length > 0) {
        await supabase.from("verse_talk_queue").delete().in("id", idsToDelete);
      }

      await enterRoom(newRoom as VerseTalkRoom);
    },
    [enterRoom, findActiveRoom, nickname, queueId, supabase, user?.id]
  );

  const startMatching = async () => {
    if (!user?.id) {
      setErrorText("로그인이 필요해.");
      return;
    }

    const cleanNickname = normalizeNickname(nickname);

    if (!cleanNickname) {
      setErrorText("닉네임을 입력해줘!");
      return;
    }

    setIsBusy(true);
    setErrorText("");

    const alreadyRoom = await findActiveRoom();

    if (alreadyRoom) {
      setIsBusy(false);
      await enterRoom(alreadyRoom);
      return;
    }

    await supabase.from("verse_talk_queue").delete().eq("user_id", user.id);

    const { data, error } = await supabase
      .from("verse_talk_queue")
      .insert({
        id: createId(),
        user_id: user.id,
        nickname: cleanNickname,
      })
      .select()
      .single();

    if (error) {
      const message = getSupabaseErrorMessage(error);
      console.warn("Start matching error:", message);
      setErrorText(message);
      setIsBusy(false);
      return;
    }

    const nextQueueId = data.id as string;

    setQueueId(nextQueueId);
    setTalkState("matching");
    setMatchingTime(0);
    setIsBusy(false);

    timerIntervalRef.current = setInterval(() => {
      setMatchingTime((prev) => prev + 1);
    }, 1000);

    await tryMatch(nextQueueId, cleanNickname);

    matchIntervalRef.current = setInterval(() => {
      tryMatch(nextQueueId, cleanNickname);
    }, 2000);
  };

  const cancelMatching = async () => {
    setIsBusy(true);

    if (queueId) {
      await supabase.from("verse_talk_queue").delete().eq("id", queueId);
    }

    resetToIntro();
  };

  const sendMessage = async () => {
    if (!user?.id || !room?.id) return;

    const content = messageInput.trim().slice(0, 1000);

    if (!content) return;

    setMessageInput("");

    const { data, error } = await supabase
      .from("messages")
      .insert({
        id: createId(),
        room_id: room.id,
        sender_id: user.id,
        content,
      })
      .select()
      .single();

    if (error) {
      const message = getSupabaseErrorMessage(error);
      console.warn("Send message error:", message);
      setErrorText(message);
      setMessageInput(content);
      return;
    }

    const insertedMessage = data as TalkMessage;

    setMessages((prev) => {
      if (prev.some((message) => message.id === insertedMessage.id)) return prev;
      return [...prev, insertedMessage];
    });
  };

  const leaveChat = async () => {
    setIsBusy(true);

    if (room?.id) {
      await supabase
        .from("verse_talk_rooms")
        .update({
          status: "ended",
          ended_at: new Date().toISOString(),
        })
        .eq("id", room.id);
    }

    resetToIntro();
  };

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
          const nextMessage = payload.new as TalkMessage;

          setMessages((prev) => {
            if (prev.some((message) => message.id === nextMessage.id)) return prev;
            return [...prev, nextMessage];
          });
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
          setRoom(payload.new as VerseTalkRoom);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(messageChannel);
      void supabase.removeChannel(roomChannel);
    };
  }, [room?.id, supabase]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#ede9fe,transparent_30%),radial-gradient(circle_at_top_right,#fce7f3,transparent_28%),linear-gradient(180deg,#f8fafc,#f1f5f9)] px-4 pt-24 text-slate-900 transition-colors dark:bg-[radial-gradient(circle_at_top_left,#4c1d95,transparent_30%),radial-gradient(circle_at_top_right,#831843,transparent_28%),linear-gradient(180deg,#020617,#0f172a)] dark:text-white">
      {isAuthLoading && (
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-fuchsia-400 border-t-transparent" />
            <p className="text-sm text-slate-500 dark:text-white/50">인증 확인 중...</p>
          </div>
        </div>
      )}

      {!isAuthLoading && !user && (
        <section className="mx-auto max-w-xl rounded-3xl border border-slate-200/60 bg-white/70 p-8 text-center shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] dark:shadow-2xl">
          <MessageCircle className="mx-auto mb-4 h-11 w-11 text-fuchsia-400 dark:text-fuchsia-300" />

          <h1 className="text-3xl font-black">Verse Talk</h1>

          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            랜덤 대화를 시작하려면 먼저 로그인해야 해.
          </p>
        </section>
      )}

      {!isAuthLoading && user && (
        <section className="mx-auto max-w-3xl pb-12">
          {talkState === "intro" && (
          <div className="space-y-7">
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-fuchsia-500/20">
                <MessageCircle className="h-8 w-8" />
              </div>

              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-xs font-semibold text-violet-700 dark:border-white/10 dark:bg-white/10 dark:text-purple-100">
                <Sparkles className="h-3.5 w-3.5" />
                Drawing Verse Community
              </p>

              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                Verse Talk
              </h1>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                지금 접속한 누군가와 랜덤으로 연결돼서 짧고 가볍게 이야기해봐.
                창작, 그림, 세계관, 아무 말 대잔치까지 전부 환영이야.
              </p>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="rounded-[2rem] border border-slate-200/60 bg-white/70 p-5 shadow-xl backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-white/[0.06] dark:shadow-2xl"
            >
              <div className="mb-6 grid gap-3 sm:grid-cols-3">
                {[
                  { icon: WandSparkles, color: "text-fuchsia-400 dark:text-fuchsia-300", title: "랜덤 연결", desc: "대기 중인 유저와 자동으로 매칭돼." },
                  { icon: Sparkles, color: "text-violet-400 dark:text-violet-300", title: "창작 대화", desc: "그림, 세계관, 아이디어 이야기하기 좋아." },
                  { icon: MessageCircle, color: "text-pink-400 dark:text-pink-300", title: "실시간 채팅", desc: "Supabase Realtime으로 메시지가 바로 떠." }
                ].map((item, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className="rounded-3xl border border-slate-200/60 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-white/[0.06]"
                  >
                    <item.icon className={`mb-3 h-5 w-5 ${item.color}`} />
                    <p className="text-sm font-bold">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {item.desc}
                    </p>
                  </motion.div>
                ))}
              </div>

              <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-100">
                오늘 사용할 닉네임
              </label>

              <motion.input
                whileFocus={{ scale: 1.01 }}
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                maxLength={30}
                placeholder="예: 우주먼지작가"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-400/10 dark:border-white/10 dark:bg-white/10 dark:text-white dark:focus:border-fuchsia-300/60 dark:focus:ring-fuchsia-400/10"
              />

              {errorText && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                >
                  {errorText}
                </motion.p>
              )}

              <motion.button
                variants={squishyVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={startMatching}
                disabled={isBusy || !nickname.trim()}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-3 font-black text-white shadow-lg shadow-fuchsia-500/20 transition hover:shadow-fuchsia-500/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isBusy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    준비 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    랜덤 매칭 시작
                  </>
                )}
              </motion.button>

              <p className="mt-4 text-center text-xs text-slate-500">
                낯선 사람과 연결될 수 있으니까 개인정보는 말하지 않는 게 좋아.
              </p>
            </motion.div>
          </div>
        )}

        {talkState === "matching" && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <div className="absolute h-20 w-20 animate-ping rounded-full border-2 border-fuchsia-400/30" />
              <div className="h-14 w-14 animate-spin rounded-full border-2 border-fuchsia-400 border-t-transparent" />
            </div>
            <div className="text-center">
              <p className="text-lg font-black">상대 찾는 중...</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-white/50">{matchingTime}초째 우주 전파 송신 중이야.</p>
            </div>
            <button
              onClick={cancelMatching}
              disabled={isBusy}
              className="rounded-2xl border border-slate-200 bg-white px-6 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10"
            >
              매칭 취소
            </button>
          </div>
        )}

        {talkState === "chat" && room && (
          <div className="flex h-[78vh] overflow-hidden rounded-[2rem] border border-slate-200/60 bg-white/80 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] dark:shadow-2xl">
            <div className="flex min-w-0 flex-1 flex-col">
              <header className="flex items-center justify-between border-b border-slate-200 bg-slate-50/50 px-5 py-4 dark:border-white/10 dark:bg-white/[0.05]">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500 dark:text-fuchsia-200/80">
                    Connected with
                  </p>

                  <h2 className="mt-1 truncate text-lg font-black">
                    {opponentNickname}
                  </h2>

                  <p className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-300">
                    <span
                      className={`h-2 w-2 rounded-full ${isOpponentConnected ? "bg-emerald-400" : "bg-red-400"
                        }`}
                    />
                    {isOpponentConnected ? "연결됨" : "상대가 나갔어요"}
                  </p>
                </div>

                <button
                  onClick={leaveChat}
                  disabled={isBusy}
                  className="rounded-2xl bg-red-500/10 p-3 text-red-200 transition hover:bg-red-500/20 disabled:opacity-50"
                  aria-label="Leave chat"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </header>

              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-5">
                <AnimatePresence initial={false}>
                  {messages.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex h-full items-center justify-center text-center"
                    >
                      <div>
                        <MessageCircle className="mx-auto mb-3 h-8 w-8 text-slate-400 dark:text-slate-500" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          첫 메시지를 보내서 대화를 시작해봐!
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    messages.map((message) => {
                      const isMine = user && message.sender_id === user.id;

                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className={`flex ${isMine ? "justify-end" : "justify-start"
                            }`}
                        >
                          <div
                            className={`max-w-[78%] rounded-3xl px-4 py-2 text-sm leading-6 shadow ${isMine
                                ? "rounded-br-md bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-fuchsia-500/10"
                                : "rounded-bl-md border border-slate-100 bg-white text-slate-800 dark:border-none dark:bg-white/10 dark:text-slate-100"
                              }`}
                          >
                            {message.content}
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>

              <footer className="border-t border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
                <div className="flex gap-2">
                  <input
                    value={messageInput}
                    onChange={(event) => setMessageInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        sendMessage();
                      }
                    }}
                    disabled={!isOpponentConnected}
                    maxLength={1000}
                    placeholder={
                      isOpponentConnected
                        ? "메시지를 입력해줘"
                        : "상대가 나가서 보낼 수 없어요"
                    }
                    className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-violet-400 disabled:opacity-50 dark:border-white/10 dark:bg-white/10 dark:text-white dark:focus:border-fuchsia-300/60"
                  />

                  <button
                    onClick={sendMessage}
                    disabled={!messageInput.trim() || !isOpponentConnected}
                    className="rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 text-white transition hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Send message"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </footer>
            </div>
          </div>
        )}
        </section>
      )}
    </main>
  );
}
