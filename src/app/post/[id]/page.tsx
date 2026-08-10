"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

type Comment = {
  id: string;
  author: string;
  content: string;
  date: string;
};

type Post = {
  id: string;
  title: string;
  author: string;
  content: string;
  date: string;
  views: number;
  comments: Comment[];
  tag?: string | null;
  universeId?: string | null;
  likes: number;
};

type CurrentUser = {
  id: string;
  email: string | null;
  name: string;
};

const universes = [
  { id: "webtoon", name: "웹툰 유니버스" },
  { id: "illust", name: "일러스트 유니버스" },
  { id: "character", name: "캐릭터 유니버스" },
  { id: "sketch", name: "스케치 유니버스" },
  { id: "free", name: "자유 유니버스" },
  { id: "fanart", name: "팬아트 유니버스" },
];

function getUniverseName(id?: string | null) {
  const universe = universes.find((item) => item.id === id);
  return universe ? universe.name.replace(" 유니버스", "") : "미분류";
}

function getUserName(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}) {
  const metadata = user.user_metadata ?? {};
  const candidates = [
    metadata.display_name,
    metadata.full_name,
    metadata.name,
    metadata.nickname,
  ];

  const fromMetadata = candidates.find(
    (value): value is string => typeof value === "string" && value.trim().length > 0
  );

  if (fromMetadata) return fromMetadata.trim();
  return user.email?.split("@")[0] || "익명";
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params as { id?: string | string[] } | null)?.id;
  const id = typeof rawId === "string" ? rawId : rawId?.[0];

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [commentContent, setCommentContent] = useState("");
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const isLoggedIn = !!currentUser;

  useEffect(() => {
    if (!id) {
      setError("해당 글을 찾을 수 없어요.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/posts/${encodeURIComponent(id)}`, {
          cache: "no-store",
        });
        const json = await res.json();

        if (cancelled) return;

        if (!res.ok || !json.ok) {
          setError(json.error || "해당 글을 찾을 수 없어요.");
          return;
        }

        setPost(json.data as Post);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("게시글을 불러오지 못했어요.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let mounted = true;

    const applyUser = (user: {
      id: string;
      email?: string | null;
      user_metadata?: Record<string, unknown>;
    } | null) => {
      if (!mounted) return;

      if (!user) {
        setCurrentUser(null);
      } else {
        setCurrentUser({
          id: user.id,
          email: user.email ?? null,
          name: getUserName(user),
        });
      }

      setAuthLoading(false);
    };

    supabase.auth
      .getUser()
      .then(({ data }) => applyUser(data.user))
      .catch((err) => {
        console.error("Supabase auth check failed:", err);
        applyUser(null);
      });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      applyUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const handleAddComment = async () => {
    if (!post || !id || isCommentSubmitting) return;

    const content = commentContent.trim();
    if (!content) {
      setCommentError("댓글 내용을 입력해 주세요.");
      return;
    }

    setIsCommentSubmitting(true);
    setCommentError(null);

    try {
      const res = await fetch(`/api/comments/${encodeURIComponent(id)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const json = await res.json();

      if (res.status === 401) {
        setCurrentUser(null);
        setCommentError("로그인이 필요해요.");
        return;
      }

      if (!res.ok || !json.ok) {
        setCommentError(json.error || "댓글 등록에 실패했어요.");
        return;
      }

      setPost((current) =>
        current
          ? { ...current, comments: [...current.comments, json.data as Comment] }
          : current
      );
      setCommentContent("");
    } catch (err) {
      console.error(err);
      setCommentError("댓글 등록 중 네트워크 오류가 발생했어요.");
    } finally {
      setIsCommentSubmitting(false);
    }
  };

  return (
    <div className="board">
      <div className="surface" style={{ padding: "24px 24px 32px" }}>
        {loading && <p>불러오는 중...</p>}

        {!loading && error && (
          <div>
            <p style={{ color: "var(--error)", marginBottom: "16px" }}>
              {error}
            </p>
            <button className="btn outline" onClick={() => router.push("/")}>
              목록으로 돌아가기
            </button>
          </div>
        )}

        {!loading && !error && post && (
          <>
            <h1
              style={{
                fontSize: "1.6rem",
                marginBottom: "10px",
                color: "var(--text)",
              }}
            >
              {post.title}
            </h1>

            <div
              style={{
                fontSize: "0.85rem",
                color: "var(--muted)",
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                justifyContent: "space-between",
                borderBottom: "1px solid var(--border)",
                paddingBottom: "8px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <span>{post.author}</span>
                <span>·</span>
                <span>{post.date}</span>

                {post.tag && (
                  <>
                    <span>·</span>
                    <span className="chip">{post.tag}</span>
                  </>
                )}

                {post.universeId && (
                  <>
                    <span>·</span>
                    <span className="chip">{getUniverseName(post.universeId)}</span>
                  </>
                )}
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <span>조회 {post.views}</span>
                <span>댓글 {post.comments.length}</span>
                <span>좋아요 {post.likes}</span>
              </div>
            </div>

            <div
              style={{
                minHeight: "200px",
                fontSize: "0.95rem",
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
              }}
            >
              {post.content}
            </div>

            <div
              style={{
                marginTop: "24px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Link href="/" className="btn outline">
                목록으로
              </Link>
              <Link href="/post/new" className="btn primary">
                새 글 쓰기
              </Link>
            </div>

            <div
              style={{
                marginTop: "32px",
                paddingTop: "24px",
                borderTop: "1px solid var(--border)",
              }}
            >
              <h2
                style={{
                  fontSize: "1.2rem",
                  marginBottom: "12px",
                  color: "var(--dream-ink)",
                }}
              >
                댓글 {post.comments.length > 0 && `(${post.comments.length})`}
              </h2>

              {post.comments.length === 0 && (
                <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                  아직 댓글이 없어요. 첫 댓글의 주인공이 되어봐! ✏️
                </p>
              )}

              {post.comments.map((comment) => (
                <div
                  key={comment.id}
                  style={{
                    padding: "10px 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      marginBottom: "4px",
                    }}
                  >
                    {comment.author}
                    <span
                      style={{
                        marginLeft: "8px",
                        fontSize: "0.75rem",
                        color: "var(--muted)",
                      }}
                    >
                      {comment.date}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.9rem", whiteSpace: "pre-wrap" }}>
                    {comment.content}
                  </div>
                </div>
              ))}

              <div
                style={{
                  marginTop: "18px",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(248, 249, 252, 0.9)",
                  border: "1px solid var(--border)",
                }}
              >
                {authLoading ? (
                  <p
                    style={{
                      textAlign: "center",
                      color: "var(--muted)",
                      fontSize: "0.9rem",
                    }}
                  >
                    로그인 상태 확인 중...
                  </p>
                ) : !isLoggedIn ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px 10px",
                      color: "var(--muted)",
                      fontSize: "0.95rem",
                    }}
                  >
                    <p>💬 댓글을 남기려면 로그인이 필요해요.</p>
                    <Link
                      href="/login"
                      style={{
                        color: "var(--link)",
                        textDecoration: "underline",
                        fontWeight: 600,
                      }}
                    >
                      로그인 하러 가기 →
                    </Link>
                  </div>
                ) : (
                  <>
                    <p
                      style={{
                        color: "var(--muted)",
                        fontSize: "0.82rem",
                        marginBottom: "8px",
                      }}
                    >
                      {currentUser.name} 님으로 댓글 작성
                    </p>
                    <textarea
                      className="input"
                      style={{ minHeight: "80px", resize: "vertical" }}
                      placeholder="댓글을 입력해 주세요."
                      value={commentContent}
                      maxLength={3000}
                      onChange={(e) => setCommentContent(e.target.value)}
                    />
                    {commentError && (
                      <p
                        style={{
                          color: "var(--error)",
                          fontSize: "0.85rem",
                          marginTop: "8px",
                        }}
                      >
                        {commentError}
                      </p>
                    )}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        marginTop: "10px",
                      }}
                    >
                      <button
                        type="button"
                        className="btn secondary"
                        onClick={handleAddComment}
                        disabled={isCommentSubmitting}
                      >
                        {isCommentSubmitting ? "등록 중..." : "댓글 등록"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
