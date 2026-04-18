"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AIAssistantFloating() {
  const router = useRouter();
  const [hoverText, setHoverText] = useState("AI 穿搭助手");

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* 悬浮提示气泡 */}
      <div
        className="absolute bottom-full right-0 mb-3 whitespace-nowrap rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2 text-sm font-medium text-white shadow-lg"
        style={{
          opacity: 1,
          transform: "translateY(0)",
          transition: "all 0.3s ease",
        }}
      >
        {hoverText}
        <div className="absolute -bottom-1 right-6 h-3 w-3 rotate-45 bg-gradient-to-r from-fuchsia-500 to-violet-600" />
      </div>

      {/* 悬浮按钮 */}
      <button
        onClick={() => router.push("/assistant")}
        onMouseEnter={() => setHoverText("点击咨询穿搭问题！")}
        onMouseLeave={() => setHoverText("AI 穿搭助手")}
        className="group flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-xl shadow-violet-400/50 transition-all hover:scale-110 hover:shadow-2xl hover:shadow-fuchsia-400/40"
      >
        {/* 机器人图标 */}
        <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>

        {/* 脉冲动画 */}
        <span className="absolute h-full w-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 opacity-30 animate-ping" />
      </button>
    </div>
  );
}
