// src/components/Common/Footer.tsx

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/60 bg-slate-950/80">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-4 text-[0.7rem] text-slate-500 md:flex-row md:items-center md:justify-between">
        <div>
          © 2026 Drawing Verse. All rights reserved.{" "}
          <span className="text-slate-400">
            Made with ❤️ by Wrtn AI &amp; 드가이
          </span>
        </div>
        <div className="flex gap-4">
          <button className="hover:text-slate-300" type="button">
            개인정보처리방침
          </button>
          <button className="hover:text-slate-300" type="button">
            이용약관
          </button>
        </div>
      </div>
    </footer>
  );
}
