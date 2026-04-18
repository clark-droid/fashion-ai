"use client";

import { useMemo } from "react";
import type { Scene } from "@/lib/types";
import { FABRIC_CN, SCENE_CN, SIL_CN } from "@/lib/labels";
import { loadProfile } from "@/lib/storage";
import { listScenes, rankOutfits, SCENE_ICONS } from "@/lib/rules/outfits";
import { BODY_TAG_CN } from "@/lib/labels";
import { AIAssistantFloating } from "@/components/AIAssistantFloating";
import { useState } from "react";

export default function OutfitsPage() {
  const profile = useMemo(() => loadProfile(), []);
  const scenes = listScenes();
  const [scene, setScene] = useState<Scene>("commute");

  const ranked = useMemo(
    () => rankOutfits(profile, scene),
    [profile, scene],
  );

  return (
    <>
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="card-soft p-6 shadow-soft">
        <h1 className="text-2xl font-semibold text-violet-950">场景灵感</h1>
        <p className="mt-2 text-sm text-stone-600">
          AI 根据你的身材特点和偏好，智能推荐适合的穿搭方案。
        </p>

        {/* 场景选择 */}
        <div className="mt-6">
          <p className="mb-3 text-xs font-medium text-stone-500">选择场合</p>
          <div className="flex flex-wrap gap-2">
            {scenes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScene(s)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  scene === s
                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-md shadow-violet-300/70"
                    : "bg-white text-violet-900 shadow-sm shadow-violet-100 hover:bg-violet-50"
                }`}
              >
                <span>{SCENE_ICONS[s]}</span>
                <span>{SCENE_CN[s]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 身材档案摘要 */}
        <div className="mt-6 rounded-2xl bg-gradient-to-br from-violet-50 to-fuchsia-50 p-4">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="text-sm font-semibold text-violet-900">AI 智能分析</span>
          </div>
          <div className="mt-3 space-y-2 text-xs text-stone-600">
            <div>
              <span className="font-medium text-violet-800">体型标签：</span>
              {profile.bodyTags.length
                ? profile.bodyTags.map((t) => BODY_TAG_CN[t] || t).join("、")
                : "未设置"}
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.wantSlim && (
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-rose-700">显瘦需求</span>
              )}
              {profile.wantHideTummy && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">遮小腹</span>
              )}
              {profile.wantTaller && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">显高需求</span>
              )}
            </div>
            {profile.styleLikes.length > 0 && (
              <div>
                <span className="font-medium text-violet-800">偏好风格：</span>
                {profile.styleLikes.join("、")}
              </div>
            )}
          </div>
        </div>

        {/* 避雷提示 */}
        {profile.avoidFabrics.length > 0 && (
          <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs text-rose-700">
            <span className="font-semibold">避雷面料：</span>
            {profile.avoidFabrics.join("、")}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        {/* 推荐标题 */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-violet-950">
            {SCENE_ICONS[scene]} {SCENE_CN[scene]} 穿搭推荐
          </h2>
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-700">
            {ranked.length} 套方案
          </span>
        </div>

        {ranked.map((o, index) => (
          <article key={o.title} className="card-soft p-6 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                {/* 排名标签 */}
                <div className="mb-1 flex items-center gap-2">
                  {index === 0 && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                      ⭐ AI 首选
                    </span>
                  )}
                  <h2 className="text-lg font-semibold text-violet-950">{o.title}</h2>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-stone-700">
                  {o.technique}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-semibold text-fuchsia-900">
                  显瘦 {"★".repeat(o.slimIndex)}
                </span>
                {/* 匹配标签 */}
                {o.bestFor.some((t) => profile.bodyTags.includes(t)) && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                    ✨ 适合你
                  </span>
                )}
              </div>
            </div>

            {/* 单品列表 */}
            <div className="mt-4">
              <p className="text-xs font-medium text-stone-500">单品清单</p>
              <ul className="mt-1 list-inside list-disc text-sm text-stone-600">
                {o.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </div>

            {/* 属性标签 */}
            <div className="mt-4 flex flex-wrap gap-2">
              {o.fabrics.map((f) => (
                <span
                  key={f}
                  className="rounded-full bg-white px-2 py-1 text-xs text-violet-900 shadow-sm shadow-violet-100"
                >
                  {FABRIC_CN[f]}
                </span>
              ))}
              {o.silhouettes.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-violet-50 px-2 py-1 text-xs text-violet-800"
                >
                  {SIL_CN[s]}
                </span>
              ))}
            </div>

            {/* 避雷提示 */}
            {o.avoidFor?.length ? (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>避雷：{o.avoidFor.join("；")}</span>
              </div>
            ) : null}
          </article>
        ))}
        {!ranked.length && (
          <div className="card-soft p-8 text-center text-sm text-stone-500 shadow-soft">
            该场景暂无预设方案
          </div>
        )}
      </section>
    </div>

    {/* 星座幸运色卡片 - 单独放在 grid 下方 */}
    <div className="mt-8">
      <ZodiacLuckyColors />
    </div>

    {/* 悬浮 AI 助手 */}
    <AIAssistantFloating />
    </>
  );
}

// 星座幸运色组件
const ZODIAC_LIST = [
  { name: "白羊座", emoji: "♈", period: "3.21-4.19", colors: ["红色", "橙色", "白色"], tip: "热情张扬，适合亮色系" },
  { name: "金牛座", emoji: "♉", period: "4.20-5.20", colors: ["绿色", "粉色", "米色"], tip: "温柔稳重，适合柔和色" },
  { name: "双子座", emoji: "♊", period: "5.21-6.21", colors: ["黄色", "浅蓝", "银色"], tip: "活泼灵动，适合对比色" },
  { name: "巨蟹座", emoji: "♋", period: "6.22-7.22", colors: ["白色", "银色", "淡蓝"], tip: "温柔细腻，适合纯净色" },
  { name: "狮子座", emoji: "♌", period: "7.23-8.22", colors: ["金色", "橙色", "紫色"], tip: "自信闪耀，适合高饱和色" },
  { name: "处女座", emoji: "♍", period: "8.23-9.22", colors: ["米色", "淡粉", "浅灰"], tip: "精致内敛，适合低饱和色" },
  { name: "天秤座", emoji: "♎", period: "9.23-10.23", colors: ["粉色", "淡紫", "浅绿"], tip: "优雅和谐，适合莫兰迪色" },
  { name: "天蝎座", emoji: "♏", period: "10.24-11.22", colors: ["黑色", "深红", "墨绿"], tip: "神秘深邃，适合深色系" },
  { name: "射手座", emoji: "♐", period: "11.23-12.21", colors: ["宝蓝", "紫色", "橙色"], tip: "自由热情，适合撞色搭配" },
  { name: "摩羯座", emoji: "♑", period: "12.22-1.19", colors: ["深灰", "藏蓝", "棕色"], tip: "低调沉稳，适合经典色" },
  { name: "水瓶座", emoji: "♒", period: "1.20-2.18", colors: ["冰蓝", "银白", "电光蓝"], tip: "独特前卫，适合冷色调" },
  { name: "双鱼座", emoji: "♓", period: "2.19-3.20", colors: ["薰衣草紫", "薄荷绿", "淡粉"], tip: "梦幻浪漫，适合马卡龙色" },
];

const COLOR_PALETTE: Record<string, string> = {
  "红色": "bg-red-500",
  "橙色": "bg-orange-400",
  "白色": "bg-white border",
  "绿色": "bg-green-500",
  "粉色": "bg-pink-400",
  "米色": "bg-amber-100",
  "黄色": "bg-yellow-400",
  "浅蓝": "bg-sky-300",
  "银色": "bg-gray-300",
  "淡蓝": "bg-blue-200",
  "金色": "bg-yellow-500",
  "紫色": "bg-purple-500",
  "淡粉": "bg-pink-200",
  "浅灰": "bg-gray-200",
  "淡紫": "bg-purple-200",
  "浅绿": "bg-green-200",
  "黑色": "bg-gray-900",
  "深红": "bg-red-700",
  "墨绿": "bg-green-800",
  "宝蓝": "bg-blue-600",
  "深灰": "bg-gray-700",
  "藏蓝": "bg-blue-900",
  "棕色": "bg-amber-700",
  "冰蓝": "bg-cyan-200",
  "银白": "bg-gray-100",
  "电光蓝": "bg-cyan-500",
  "薰衣草紫": "bg-violet-300",
  "薄荷绿": "bg-teal-200",
};

function ZodiacLuckyColors() {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [luckyResult, setLuckyResult] = useState<{colors: string[], tip: string} | null>(null);

  async function handleSelect(zodiac: string) {
    setSelected(zodiac);
    setLoading(true);
    setLuckyResult(null);

    try {
      const today = new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer sk-bf9355ec33d3485e8a2c4cb927dc1bbb",
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{
            role: "user",
            content: `今天是${today}，我是${zodiac}。请根据今天的星座运势，推荐3个适合今天穿的幸运色，简要说明原因。用JSON格式返回：{"colors":["颜色1","颜色2","颜色3"],"tip":"一句话穿搭建议"}`
          }],
          max_tokens: 200,
        }),
      });

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";

      // 解析 JSON
      const match = content.match(/\{[\s\S]*?\}/);
      if (match) {
        const result = JSON.parse(match[0]);
        setLuckyResult(result);
      } else {
        // 默认回退
        const zodiacData = ZODIAC_LIST.find(z => z.name === zodiac);
        setLuckyResult({ colors: zodiacData?.colors || [], tip: zodiacData?.tip || "" });
      }
    } catch {
      const zodiacData = ZODIAC_LIST.find(z => z.name === zodiac);
      setLuckyResult({ colors: zodiacData?.colors || [], tip: zodiacData?.tip || "" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card-soft rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-6 shadow-soft">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-2xl">✨</span>
        <h2 className="text-lg font-semibold text-violet-950">星座幸运色</h2>
        <span className="text-xs text-stone-500">AI 实时推荐</span>
      </div>

      {/* 星座选择 */}
      <div className="mb-4 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
        {ZODIAC_LIST.map((z) => (
          <button
            key={z.name}
            onClick={() => handleSelect(z.name)}
            className={`flex flex-col items-center rounded-xl p-2 text-xs transition ${
              selected === z.name
                ? "bg-violet-600 text-white shadow-md"
                : "bg-white text-violet-900 hover:bg-violet-100"
            }`}
          >
            <span className="text-lg">{z.emoji}</span>
            <span className="mt-0.5 font-medium">{z.name}</span>
          </button>
        ))}
      </div>

      {/* 幸运色展示 */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="flex gap-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: "0ms" }} />
            <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: "150ms" }} />
            <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: "300ms" }} />
          </div>
          <span className="ml-2 text-sm text-stone-500">AI 分析今日运势中...</span>
        </div>
      )}

      {luckyResult && !loading && (
        <div className="rounded-xl bg-white/80 p-4">
          <div className="mb-3 flex items-center gap-3">
            <span className="text-3xl">{ZODIAC_LIST.find(z => z.name === selected)?.emoji}</span>
            <div>
              <h3 className="font-semibold text-violet-900">{selected}</h3>
              <p className="text-xs text-stone-500">今日幸运色</p>
            </div>
          </div>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-violet-800">幸运色：</span>
            {luckyResult.colors.map((c) => (
              <div key={c} className="flex items-center gap-1">
                <div className={`h-6 w-6 rounded-full ${COLOR_PALETTE[c] || "bg-gray-300"} ring-2 ring-white shadow-sm`} />
                <span className="text-sm text-stone-700">{c}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-stone-600">{luckyResult.tip}</p>
        </div>
      )}

      {!selected && !loading && (
        <p className="text-center text-sm text-stone-500">点击上方星座，获取今日专属幸运色推荐</p>
      )}
    </div>
  );
}
