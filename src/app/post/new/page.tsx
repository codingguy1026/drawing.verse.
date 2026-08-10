"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [universeId, setUniverseId] = useState("webtoon");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          universeSlug: universeId,
          content,
        }),
      });

      const json = await res.json();

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok || !json.ok) {
        setError(json.error || "게시물 등록에 실패했어요.");
        return;
      }

      router.push(`/post/${json.data.id}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("게시물 등록 중 네트워크 오류가 발생했어요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="board">
      <div className="surface" style={{ padding: "2rem" }}>
        <h1
          style={{
            fontSize: "1.8rem",
            fontWeight: 800,
            color: "var(--dream-ink)",
            marginBottom: "1rem",
          }}
        >
          ✏️ 새 게시물 작성
        </h1>

        <p className="text-gray-600" style={{ marginBottom: "1.5rem" }}>
          멋진 그림과 이야기를 커뮤니티에 공유해보세요!
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              제목
            </label>
            <input
              type="text"
              className="input"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={160}
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              유니버스 선택
            </label>
            <select
              className="input"
              value={universeId}
              onChange={(e) => setUniverseId(e.target.value)}
            >
              <option value="webtoon">웹툰</option>
              <option value="illust">일러스트</option>
              <option value="character">캐릭터</option>
              <option value="sketch">스케치</option>
              <option value="free">자유</option>
              <option value="fanart">팬아트</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              내용
            </label>
            <textarea
              className="input"
              placeholder="내용을 입력하세요"
              value={content}
              rows={8}
              maxLength={20000}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          {error && (
            <p style={{ color: "var(--error)", fontSize: "0.9rem" }}>{error}</p>
          )}

          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              className="btn primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "등록 중..." : "게시물 등록"}
            </button>

            <Link href="/" className="btn outline">
              취소
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
