"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Sparkles, 
  Send, 
  Image as ImageIcon, 
  X, 
  Loader2,
  WandSparkles,
  Rocket,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { squishyVariants } from "@/lib/animations";
import { LoadingScreen } from "@/components/Common/LoadingOverlay";

const CATEGORIES = ["정보", "창작", "질문", "공지", "기타"];

export default function UniverseWritePage() {
  const { slug } = useParams();
  const router = useRouter();
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("창작");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        alert("로그인이 필요한 서비스야!");
        router.push("/login");
      } else {
        setUser(data.user);
      }
    };
    checkUser();
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    
    try {
      let imageUrl = null;

      // Image upload logic (placeholder - assumes 'posts' bucket exists)
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('posts')
          .upload(filePath, imageFile);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('posts')
            .getPublicUrl(filePath);
          imageUrl = publicUrl;
        }
      }

      const { data: post, error } = await supabase
        .from("posts")
        .insert({
          title,
          content,
          category,
          universe_slug: slug,
          author: user.user_metadata?.full_name || user.email?.split("@")[0] || "Anonymous",
          image_url: imageUrl,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      router.push(`/universe/${slug}/${post.id}`);
    } catch (err: any) {
      console.error("Post creation error:", err);
      alert("글을 올리는 중 오류가 발생했어: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#020208] text-white pt-24 pb-20 px-4 overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-fuchsia-600/10 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
      </div>

      <div className="relative mx-auto max-w-4xl">
        {/* Header */}
        <header className="mb-10 flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-all">
              <ArrowLeft className="h-5 w-5" />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest">Abort Transmission</span>
          </button>

          <div className="text-right">
            <p className="text-[10px] font-black text-violet-400 uppercase tracking-[0.3em] mb-1">New Record</p>
            <h1 className="text-2xl font-black tracking-tighter">데이터 기록 전송</h1>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Main Content Area */}
          <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.03] backdrop-blur-3xl p-8 shadow-2xl">
            <div className="space-y-6">
              {/* Universe Info Banner */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20 mb-8">
                <Globe className="h-5 w-5 text-violet-400" />
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-violet-400/60">Target Universe</p>
                  <p className="text-sm font-bold">{decodeURIComponent(slug as string)}</p>
                </div>
              </div>

              {/* Title Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Transmission Title</label>
                <input 
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="당신의 발견을 한 문장으로 표현해줘..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xl font-black outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 transition-all placeholder:text-white/20"
                />
              </div>

              {/* Category & Media Actions */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        category === cat 
                          ? "bg-white text-black shadow-lg" 
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="h-10 w-px bg-white/10 mx-2 hidden md:block" />

                <label className="cursor-pointer group flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                  <ImageIcon className="h-4 w-4 text-fuchsia-400" />
                  <span className="text-xs font-bold text-slate-300">이미지 첨부</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className="hidden" 
                  />
                </label>
              </div>

              {/* Image Preview */}
              <AnimatePresence>
                {imagePreview && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative rounded-3xl overflow-hidden border border-white/10 aspect-video group"
                  >
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        type="button"
                        onClick={removeImage}
                        className="h-12 w-12 rounded-full bg-red-500 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Content Editor */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Content Data</label>
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="이 유니버스에서 무엇을 보았는지, 어떤 창작을 했는지 기록해줘..."
                  rows={12}
                  className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-6 py-6 text-base font-medium leading-relaxed outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 transition-all placeholder:text-white/20 resize-none"
                />
              </div>
            </div>
          </section>

          {/* Submit Footer */}
          <footer className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600/20 text-violet-400">
                <Rocket className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Transmission Ready</p>
                <p className="text-xs text-slate-400">데이터가 유니버스 전역으로 동기화됩니다.</p>
              </div>
            </div>

            <motion.button
              variants={squishyVariants}
              whileHover="hover"
              whileTap="tap"
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="flex items-center gap-3 h-16 px-10 rounded-[2rem] bg-white text-black font-black shadow-[0_20px_40px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  전송 중...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  글 올리기
                </>
              )}
            </motion.button>
          </footer>
        </form>
      </div>

      {isSubmitting && (
        <LoadingScreen 
          copy={{
            eyebrow: "Submitting",
            title: "Saving to Universe",
            subtitle: "데이터를 전파 기지에 기록하고 있습니다...",
            progressLabel: "Syncing",
            lines: ["우주에 흔적을 남기는 중..."]
          }}
          progress={50}
          mode="dark"
        />
      )}
    </main>
  );
}
