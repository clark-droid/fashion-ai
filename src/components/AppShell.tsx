"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "首页" },
  { href: "/profile", label: "我的身材" },
  { href: "/try-on", label: "虚拟试穿" },
  { href: "/outfits", label: "场景穿搭" },
  { href: "/wardrobe", label: "衣橱" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#f5f0ff_0%,_#fefcf8_45%,_#faf8ff_100%)] text-stone-800">
      <header className="sticky top-0 z-20 border-b border-violet-100/80 bg-[#fefcf8]/90 backdrop-blur-md shadow-sm shadow-violet-100/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-200 to-fuchsia-100 text-lg shadow-md shadow-violet-200/80">
              <svg className="h-5 w-5 text-violet-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </span>
            <div>
              <div className="text-sm font-semibold tracking-wide text-violet-900">
                女装 AI 穿搭助手
              </div>
              <div className="text-xs text-violet-600/80">
                智能尺码 · 虚拟试穿 · 场景搭配
              </div>
            </div>
          </Link>
          <nav className="flex flex-wrap gap-2">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-full px-3 py-1.5 text-sm transition ${
                    active
                      ? "bg-violet-600 text-white shadow-md shadow-violet-300/70"
                      : "bg-white/80 text-violet-900 shadow-sm shadow-violet-100 hover:bg-violet-50"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      <footer className="border-t border-violet-100 bg-[#fefcf8]/80 py-6 text-center text-xs text-violet-700/70">
        基于身材规则的尺码与风险提示 · 数据仅存本机浏览器 localStorage
      </footer>
    </div>
  );
}
