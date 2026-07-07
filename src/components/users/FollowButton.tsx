"use client";

import { useState, useEffect } from "react";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { squishyVariants } from "@/lib/animations";

type FollowButtonProps = {
  targetUserId?: string;
  profileId?: string; // Alias for targetUserId
  initialIsFollowing?: boolean;
  initialFollowing?: boolean; // Alias for initialIsFollowing
  className?: string;
};

export default function FollowButton({
  targetUserId,
  profileId,
  initialIsFollowing = false,
  initialFollowing = false,
  className = "",
}: FollowButtonProps) {
  const finalTargetId = targetUserId || profileId;
  const finalInitialState = initialIsFollowing || initialFollowing;

  const [isFollowing, setIsFollowing] = useState(finalInitialState);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (!finalTargetId) return;

    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUser(data.user);

      if (data.user) {
        // Fetch actual initial state if not provided or to ensure accuracy
        const { data: followData } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", data.user.id)
          .eq("following_id", finalTargetId)
          .maybeSingle();
        
        setIsFollowing(!!followData);
      }
    };
    checkUser();
  }, [finalTargetId]);

  const toggleFollow = async () => {
    if (!currentUser) {
      alert("로그인이 필요해!");
      return;
    }
    if (!finalTargetId || currentUser.id === finalTargetId) return;

    setLoading(true);
    try {
      const res = await fetch("/api/follows/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: finalTargetId }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.isFollowing);
      }
    } catch (err) {
      console.error("Follow error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (currentUser?.id === targetUserId) return null;

  return (
    <motion.button
      variants={squishyVariants}
      whileHover="hover"
      whileTap="tap"
      onClick={toggleFollow}
      disabled={loading}
      className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition-all ${
        isFollowing
          ? "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
          : "bg-violet-600 text-white shadow-lg shadow-violet-600/20 hover:bg-violet-700"
      } ${className} ${loading ? "opacity-70" : ""}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <UserMinus className="h-4 w-4" />
      ) : (
        <UserPlus className="h-4 w-4" />
      )}
      {isFollowing ? "팔로잉" : "팔로우"}
    </motion.button>
  );
}
