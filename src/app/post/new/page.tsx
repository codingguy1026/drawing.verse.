"use client";

import { useState } from "react";
import Link from "next/link";

export default function NewPostPage() {
  const [title, setTitle] = useState("");
  const [universeId, setUniverseId] = useState("webtoon");
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 🚧 실제로는 API POST 요청 보내면 됨
    console.log("NEW POST", {
      title,
      universeId,
      content,
    });

    alert("게시물이 임시로 제출되었습니다! (API 연결 전)");
  };

  return (
    <div className="board">
      {/* 상단 제목 */}
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

        {/* 입력 폼 */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* 제목 */}
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
              required
            />
          </div>

          {/* 유니버스 선택 */}
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

          {/* 내용 */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              내용
            </label>
            <textarea
              className="input"
              placeholder="내용을 입력하세요"
              value={content}
              rows={8}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 mt-2">
            <button type="submit" className="btn primary">
              게시물 등록
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
