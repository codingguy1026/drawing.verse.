"use client";

import { useState } from "react";
import { X } from "lucide-react";

type CreateUniverseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function CreateUniverseModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateUniverseModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    category: "general",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) return;

    setLoading(true);
    try {
      const res = await fetch("/api/universes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({ name: "", slug: "", description: "", category: "general" });
        onClose();
        onSuccess?.();
      }
    } catch (err) {
      console.error("Failed to create universe:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/95 backdrop-blur-3xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">🌌 새로운 유니버스 창조</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              유니버스 이름 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="예: 스페이스 오페라"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-white/30 focus:outline-none"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              슬러그 (URL) *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="예: space-opera"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-white/30 focus:outline-none"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="유니버스에 대해 설명해보세요"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-white/30 focus:outline-none resize-none h-20"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              카테고리
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
              disabled={loading}
            >
              <option value="general">일반</option>
              <option value="art">미술</option>
              <option value="fantasy">판타지</option>
              <option value="scifi">공상과학</option>
              <option value="romance">로맨스</option>
              <option value="horror">공포</option>
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 transition disabled:opacity-50"
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-500 px-3 py-2 text-sm font-bold text-white hover:from-violet-600 hover:to-cyan-600 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "만드는 중..." : "만들기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
