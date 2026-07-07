"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import TabsNav from "@/components/Common/TabsNav";

type Comment = {
  id: number;
  author: string;
  content: string;
  date: string;
};

type Post = {
  id: number;
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
  id: number;
  email: string;
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
  const u = universes.find((v) => v.id === id);
  return u ? u.name.replace(" 유니버스", "") : "미분류";
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();

  const rawId = (params as any)?.id;
  const id =
    typeof rawId === "string"
      ? rawId
      : Array.isArray(rawId)
      ? rawId[0]
      : undefined;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 로그인 유저 정보
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 댓글 작성 상태
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentContent, setCommentContent] = useState("");

  const isLoggedIn = !!currentUser;

  // 게시글 로드
  useEffect(() => {
    if (!id) {
      setError("해당 글을 찾을 수 없어요.");
      setLoading(false);
      return;
    }

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/posts/${id}`);
        const json = await res.json();

        if (!res.ok || !json.ok) {
          setError("해당 글을 찾을 수 없어요.");
          return;
        }

        setPost(json.data as Post);
      } catch (err) {
        console.error(err);
        setError("게시글 불러오기 실패");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  // localStorage에서 로그인 상태 읽기
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem("dv_user");
      if (!raw) {
        setCurrentUser(null);
      } else {
        const user = JSON.parse(raw) as CurrentUser;
        setCurrentUser(user);
        setCommentAuthor(user.name);
      }
    } catch (err) {
      console.error(err);
      setCurrentUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const handleAddComment = () => {
    if (!post) return;

    if (!commentAuthor.trim() || !commentContent.trim()) {
      alert("작성자와 내용은 둘 다 입력해줘야 해요!");
      return;
    }

    const newComment: Comment = {
      id: post.comments.length
        ? post.comments[post.comments.length - 1].id + 1
        : 1,
      author: commentAuthor.trim(),
      content: commentContent.trim(),
      date: "방금 전",
    };

    setPost({
      ...post,
      comments: [...post.comments, newComment],
    });

    setCommentAuthor(currentUser?.name ?? "");
    setCommentContent("");
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
            {/* 제목 */}
            <h1
              style={{
                fontSize: "1.6rem",
                marginBottom: "10px",
                color: "var(--text)",
              }}
            >
              {post.title}
            </h1>

            {/* 메타 정보 */}
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
                    <span className="chip">
                      {getUniverseName(post.universeId)}
                    </span>
                  </>
                )}
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <span>조회 {post.views}</span>
                <span>댓글 {post.comments.length}</span>
                <span>좋아요 {post.likes}</span>
              </div>
            </div>

            {/* 본문 */}
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

            {/* 상단 버튼 */}
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

            {/* 댓글 섹션 */}
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

              {/* 댓글 목록 */}
              {post.comments.length === 0 && (
                <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                  아직 댓글이 없어요. 첫 댓글의 주인공이 되어봐! ✏️
                </p>
              )}

              {post.comments.map((c) => (
                <div
                  key={c.id}
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
                    {c.author}
                    <span
                      style={{
                        marginLeft: "8px",
                        fontSize: "0.75rem",
                        color: "var(--muted)",
                      }}
                    >
                      {c.date}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "0.9rem",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {c.content}
                  </div>
                </div>
              ))}

              {/* 댓글 작성 or 로그인 필요 안내 */}
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
                    <p>💬 댓글을 남기려면 로그인을 해야 합니다.</p>
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
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        marginBottom: "8px",
                      }}
                    >
                      <input
                        className="input"
                        style={{ maxWidth: "220px" }}
                        placeholder="닉네임"
                        value={commentAuthor}
                        onChange={(e) => setCommentAuthor(e.target.value)}
                      />
                    </div>
                    <textarea
                      className="input"
                      style={{ minHeight: "80px", resize: "vertical" }}
                      placeholder="댓글을 입력해 주세요."
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                    />
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
                      >
                        댓글 등록
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
