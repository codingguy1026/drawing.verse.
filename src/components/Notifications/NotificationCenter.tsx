"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { motion } from "framer-motion";
import NotificationPanel, { type NotificationItem } from "@/components/Notifications/NotificationPanel";
import { supabase } from "@/lib/supabase/client";

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("id,type,title,message,href,read,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) {
      console.error("Failed to load notifications:", error);
      setNotifications([]);
    } else {
      setNotifications((data ?? []) as NotificationItem[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadNotifications();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      setLoading(true);
      void loadNotifications();
    });

    return () => authListener.subscription.unsubscribe();
  }, [loadNotifications]);

  const markAsRead = useCallback(async (id: number) => {
    setNotifications((items) =>
      items.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);

    if (error) {
      console.error("Failed to mark notification as read:", error);
      void loadNotifications();
    }
  }, [loadNotifications]);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const button = (
    <motion.button
      type="button"
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => setOpen((value) => !value)}
      aria-label={unreadCount > 0 ? `알림 열기, 읽지 않은 알림 ${unreadCount}개` : "알림 열기"}
      aria-expanded={open}
      className="relative flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-3 text-slate-700 shadow-sm backdrop-blur-xl transition hover:bg-white hover:text-slate-900 dark:border-white/10 dark:bg-[#111127]/90 dark:text-white/80 dark:hover:bg-[#171735] dark:hover:text-white"
    >
      <Bell size={18} />
      <span className="hidden text-sm font-black xl:inline">알림</span>
      {unreadCount > 0 ? (
        <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-violet-600 px-1 text-[10px] font-black text-white ring-2 ring-white dark:ring-[#111127]">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
    </motion.button>
  );

  return (
    <>
      {/* Desktop: align the notification control with the navbar shell itself. */}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-[1050] hidden px-3 sm:px-5 lg:block">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-end">
          <div className="pointer-events-auto mr-[220px]">{button}</div>
        </div>
      </div>

      {/* Mobile/tablet: keep it clearly visible beside the navbar controls. */}
      <div className="fixed right-[120px] top-6 z-[1050] lg:hidden sm:right-[132px]">
        {button}
      </div>

      <NotificationPanel
        open={open}
        onClose={() => setOpen(false)}
        notifications={notifications}
        loading={loading}
        onRead={markAsRead}
      />
    </>
  );
}
