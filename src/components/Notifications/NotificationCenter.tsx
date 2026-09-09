"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Bell } from "lucide-react";
import { motion } from "framer-motion";
import NotificationPanel, { type NotificationItem } from "@/components/Notifications/NotificationPanel";
import { supabase } from "@/lib/supabase/client";

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [navbar, setNavbar] = useState<HTMLElement | null>(null);
  const [desktopActions, setDesktopActions] = useState<HTMLElement | null>(null);

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
    const nav = document.querySelector<HTMLElement>(".dv-nav-shell");
    setNavbar(nav);

    const searchLink = nav?.querySelector<HTMLElement>('a[aria-label="Search"]');
    const actions = searchLink?.parentElement?.parentElement as HTMLElement | null;
    setDesktopActions(actions ?? null);
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

  const trigger = (
    <motion.button
      type="button"
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => setOpen((value) => !value)}
      aria-label={unreadCount > 0 ? `알림 열기, 읽지 않은 알림 ${unreadCount}개` : "알림 열기"}
      aria-expanded={open}
      className="relative grid h-11 w-11 place-items-center rounded-2xl border border-slate-200/80 bg-white/50 text-slate-600 transition hover:bg-white hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/70 dark:hover:bg-white/12 dark:hover:text-white"
    >
      <Bell size={18} />
      {unreadCount > 0 ? (
        <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-violet-600 px-1 text-[10px] font-black text-white ring-2 ring-white dark:ring-[#111127]">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
    </motion.button>
  );

  return (
    <>
      {desktopActions
        ? createPortal(
            <div className="hidden lg:block" data-dv-notification-trigger>
              {trigger}
            </div>,
            desktopActions,
          )
        : null}

      {navbar
        ? createPortal(
            <div className="absolute right-[64px] top-[14px] z-20 lg:hidden" data-dv-notification-mobile-trigger>
              {trigger}
            </div>,
            navbar,
          )
        : null}

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
