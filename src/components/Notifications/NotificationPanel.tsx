"use client";

import Link from "next/link";
import { Bell, Heart, MessageCircle, Sparkles, Trophy, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type NotificationItem = {
  id: string;
  type: "achievement" | "comment" | "like" | "subscription";
  title: string;
  message: string;
  href?: string;
  read: boolean;
  createdAt: string;
};

type NotificationPanelProps = {
  open: boolean;
  onClose: () => void;
};

const notifications: NotificationItem[] = [
  {
    id: "achievement-genesis",
    type: "achievement",
    title: "도전과제를 달성했어요",
    message: "새로운 도전과제가 기록되었습니다.",
    href: "/me",
    read: false,
    createdAt: "방금 전",
  },
  {
    id: "comment-example",
    type: "comment",
    title: "새 댓글이 도착했어요",
    message: "게시물에 새로운 이야기가 이어졌습니다.",
    href: "/community",
    read: false,
    createdAt: "12분 전",
  },
  {
    id: "like-example",
    type: "like",
    title: "누군가 게시물을 좋아해요",
    message: "작성한 이야기에 새로운 반응이 생겼습니다.",
    href: "/universe",
    read: true,
    createdAt: "1시간 전",
  },
];

const iconMap = {
  achievement: Trophy,
  comment: MessageCircle,
  like: Heart,
  subscription: Sparkles,
};

export default function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <AnimatePresence>
      {open ? (
        <>
          <button
            type="button"
            aria-label="알림 패널 닫기"
            onClick={onClose}
            className="fixed inset-0 z-[1090] cursor-default bg-transparent"
          />

          <motion.aside
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="fixed right-3 top-[92px] z-[1100] w-[calc(100%-1.5rem)] max-w-sm overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/95 shadow-[0_28px_80px_rgba(15,23,42,0.18)] backdrop-blur-2xl sm:right-5 sm:top-[100px] dark:border-white/10 dark:bg-[#090916]/95 dark:shadow-[0_28px_80px_rgba(0,0,0,0.45)]"
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
              {notifications.map((item) => {
                const Icon = iconMap[item.type];
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
                      <p className="mt-1 text-[10px] font-bold text-slate-400 dark:text-white/35">{item.createdAt}</p>
                    </div>
                  </div>
                );

                return item.href ? (
                  <Link key={item.id} href={item.href} onClick={onClose} className="block">
                    {content}
                  </Link>
                ) : (
                  <div key={item.id}>{content}</div>
                );
              })}
            </div>

            <div className="border-t border-slate-200/70 px-3 py-3 dark:border-white/10">
              <p className="text-center text-[11px] font-semibold text-slate-400 dark:text-white/35">
                실제 알림 데이터 연결은 다음 단계에서 추가됩니다.
              </p>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
