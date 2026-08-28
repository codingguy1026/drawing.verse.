"use client";

import { motion } from "framer-motion";

type DguyMascotProps = {
  mode?: "normal" | "error";
  size?: number;
};

export default function DguyMascot({
  mode = "normal",
  size = 190,
}: DguyMascotProps) {
  const isError = mode === "error";

  return (
    <motion.div
      className="relative"
      style={{ width: size, height: size }}
      animate={
        isError
          ? { rotate: [0, -3, 5], y: [0, 3, 10] }
          : {
              y: [0, -8, 0],
              rotate: [-1.5, 1.5, -1.5],
              scale: [1, 1.025, 1],
            }
      }
      transition={
        isError
          ? { duration: 0.55, ease: "easeOut" }
          : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }
      }
    >
      <svg
        viewBox="0 0 300 300"
        className="h-full w-full overflow-visible"
        role="img"
        aria-label={isError ? "쓰러진 드가이" : "드가이"}
      >
        <motion.path d="M150 23 L229 99 L73 100 Z" fill="#fff500" stroke="#bdbc00" strokeWidth="14" strokeLinejoin="round" animate={!isError ? { y: [0, -3, 0] } : undefined} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }} />
        <motion.path d="M65 88 L103 206 L36 163 Z" fill="#00e5e4" stroke="#00aaa9" strokeWidth="14" strokeLinejoin="round" animate={!isError ? { x: [0, -3, 0] } : undefined} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} />
        <motion.path d="M232 87 L265 160 L210 211 L198 102 Z" fill="#f300d7" stroke="#a0009a" strokeWidth="14" strokeLinejoin="round" animate={!isError ? { x: [0, 3, 0] } : undefined} transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }} />
        <motion.path d="M92 207 L151 267 L215 213 L151 229 Z" fill="#ff9094" stroke="#d6534f" strokeWidth="14" strokeLinejoin="round" animate={!isError ? { y: [0, 3, 0] } : undefined} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} />

        <path d="M71 75 Q72 64 92 64 Q151 56 211 67 Q238 72 245 98 Q251 137 242 190 Q242 214 223 218 Q151 231 78 219 Q63 217 66 197 Q60 154 66 111 Q62 90 71 75" fill="#b878ee" stroke="#902cff" strokeWidth="14" strokeLinejoin="round" />

        {isError ? (
          <>
            <path d="M102 116 L134 170 M134 116 L103 172" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" />
            <path d="M168 122 L194 169 M199 119 L172 174" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" />
            <path d="M110 185 Q151 191 197 185" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" />
            <path d="M167 188 Q166 222 181 226 Q196 220 195 188" fill="none" stroke="white" strokeWidth="7" strokeLinecap="round" />
          </>
        ) : (
          <>
            <motion.ellipse cx="118" cy="140" rx="11" ry="27" fill="white" animate={{ scaleY: [1, 1, 0.12, 1, 1] }} transition={{ duration: 4, repeat: Infinity, times: [0, 0.43, 0.47, 0.51, 1] }} />
            <motion.ellipse cx="183" cy="140" rx="11" ry="27" fill="white" animate={{ scaleY: [1, 1, 0.12, 1, 1] }} transition={{ duration: 4, repeat: Infinity, times: [0, 0.43, 0.47, 0.51, 1] }} />
            <path d="M135 169 Q150 182 167 167" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" />
          </>
        )}
      </svg>
    </motion.div>
  );
}
