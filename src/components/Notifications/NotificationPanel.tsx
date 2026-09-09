"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Bell, Heart, MessageCircle, Sparkles, Trophy, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export type NotificationItem = {
  id: number;
  type: "achievement" | "comment" | "like" | "subscription";
  title: string;
  message: string;
  href: string | null;
  read: boolean;
  created_at: string;
};

type NotificationPanelProps = {
  open: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  loading: boolean;
  onRead: (id: number) => void | Promise<void>;
};

const iconMap = {
  achievement: Trophy,
  comment: MessageCircle,
  like: Heart,
  subscription: Sparkles,
};

function relativeTime(value: string) {
  const time = new Date(value).getTime();
  const seconds = Math.max(0, Math.floor((Date.now() - time) / 1000));
  if (seconds < 60) return "방금 전";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return new Intl.DateTimeFormat("ko-KR", { month: "short", day: "numeric" }).format(new Date(value));
}

export default function NotificationPanel({
  open,
  onClose,
  notifications,
  loading,
  onRead,
}: NotificationPanelProps) {
  const [mounted, setMounted] = useState(false);
  const unreadCount = notifications.filter((item) => !item.read).length;

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <>
          <button
            type="button"
            aria-label="알림 패널 닫기"
            onClick={onClose}
            className="fixed inset-0 z-[9998] cursor-default bg-transparent"
          />

          <motion.aside
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            style={{
              position: "fixed",
              top: 100,
              right: 20,
              left: "auto",
              width: "min(384px, calc(100vw - 24px))",
              zIndex: 9999,
            }}
            className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/95 shadow-[0_28px_80px_rgba(15,23,42,0.18)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#090916]/95 dark:shadow-[0_28px_80px_rgba(0,0,0,0.45)]"
          >
            <div className="flex items-center justify-between border-b border-slate-200/70 px-4 py-4 dark:border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <Bell className="size-4 text-violet-500" />
                  <h2 className="text-sm font-black text-slate-900 dark:text-white">알림</h2>
                  {unreadCount > 0 ? (
                    <span className="rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-black text-white">
                      {unreadCount}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-[11px] font-semibold text-slate-500 dark:text-white/45">
                  Drawing Verse에서 일어난 새로운 소식
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="알림 닫기"
                className="grid size-9 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="max-h-[min(460px,65vh)] overflow-y-auto p-2">
              {loading ? (
                <div className="px-4 py-12 text-center text-xs font-semibold text-slate-400 dark:text-white/40">
                  알림을 불러오는 중...
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <Bell className="mx-auto size-6 text-slate-300 dark:text-white/20" />
                  <p className="mt-3 text-sm font-black text-slate-700 dark:text-white/75">아직 새로운 알림이 없어요</p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-white/35">새로운 소식이 생기면 여기에 모아둘게요.</p>
                </div>
              ) : (
                notifications.map((item) => {
                  const Icon = iconMap[item.type] ?? Bell;
                  const content = (
                    <div
                      className={`flex gap-3 rounded-2xl border px-3 py-3 transition ${
                        item.read
                          ? "border-transparent bg-transparent hover:bg-slate-50 dark:hover:bg-white/[0.05]"
                          : "border-violet-200/70 bg-violet-50/80 hover:bg-violet-100/80 dark:border-violet-400/20 dark:bg-violet-400/[0.08] dark:hover:bg-violet-400/[0.12]"
                      }`}
                    >
                      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-violet-600 shadow-sm dark:bg-white/10 dark:text-violet-300">
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="truncate text-sm font-black text-slate-900 dark:text-white">{item.title}</p>
                          {!item.read ? <span className="mt-1.5 size-2 shrink-0 rounded-full bg-violet-500" /> : null}
                        </div>
                        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-white/55">{item.message}</p>
                        <p className="mt-1 text-[10px] font-bold text-slate-400 dark:text-white/35">{relativeTime(item.created_at)}</p>
                      </div>
                    </div>
                  );

                  const handleClick = () => {
                    if (!item.read) void onRead(item.id);
                    onClose();
                  };

                  return item.href ? (
                    <Link key={item.id} href={item.href} onClick={handleClick} className="block">
                      {content}
                    </Link>
                  ) : (
                    <button key={item.id} type="button" onClick={handleClick} className="block w-full text-left">
                      {content}
                    </button>
                  );
                })
              )}
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
