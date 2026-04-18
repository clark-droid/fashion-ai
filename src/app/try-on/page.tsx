"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type {
  Fabric,
  GarmentMeta,
  Silhouette,
  SizeRow,
  TryOnFeedback,
  RiskTag,
} from "@/lib/types";
import { FABRIC_CN, SIL_CN } from "@/lib/labels";
import { generateTryOnImageWithDoubao, analyzeTryOnImageWithDoubao, fileToDataUrl } from "@/lib/api/doubaoSeedream";

// 从环境变量读取豆包 ARK API Key
const DOUBAO_API_KEY = process.env.NEXT_PUBLIC_DOUBAO_ARK_API_KEY || "";
import { analyzeTryOnSchematic, getSmartSuggestions } from "@/lib/rules/tryOnAnalysis";
import { recommendSize } from "@/lib/rules/sizeAndRisk";
import { RiskBadges } from "@/components/RiskBadges";
import { AIAssistantFloating } from "@/components/AIAssistantFloating";
import {
  loadProfile,
  loadTryOnFeedback,
  recordStylePreference,
  saveTryOnFeedback,
} from "@/lib/storage";

const FABRICS: Fabric[] = [
  "cotton",
  "polyester",
  "chiffon",
  "knit",
  "denim",
  "linen",
  "wool",
];

const SILS: Silhouette[] = [
  "loose",
  "fitted",
  "straight",
  "cinched",
  "cropped",
  "longline",
];

export default function TryOnPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_profile, setProfile] = useState(loadProfile);
  const [person, setPerson] = useState<File | null>(null);
  const [garmentImg, setGarmentImg] = useState<File | null>(null);
  const [personUrl, setPersonUrl] = useState<string | null>(null);
  const [garmentUrl, setGarmentUrl] = useState<string | null>(null);

  const [garment, setGarment] = useState<GarmentMeta>({
    name: "示例连衣裙",
    fabric: "chiffon",
    silhouette: "cinched",
    isSheer: false,
    wrinklesEasy: false,
    pillsEasy: false,
    runsSmall: false,
    runsLarge: false,
  });

  const [chartJson, setChartJson] = useState(`[
  { "label": "S", "bustCm": 82, "waistCm": 64, "shoulderCm": 37 },
  { "label": "M", "bustCm": 86, "waistCm": 68, "shoulderCm": 38 },
  { "label": "L", "bustCm": 90, "waistCm": 72, "shoulderCm": 39 }
]`);

  const [analysis, setAnalysis] = useState(() =>
    analyzeTryOnSchematic(loadProfile(), {
      name: "示例连衣裙",
      fabric: "chiffon",
      silhouette: "cinched",
    }),
  );
  const [suggestions, setSuggestions] = useState(() =>
    getSmartSuggestions(loadProfile(), {
      name: "示例连衣裙",
      fabric: "chiffon",
      silhouette: "cinched",
    }),
  );

  const [apiUrl, setApiUrl] = useState<string | null>(null);
  const [apiMsg, setApiMsg] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"analysis" | "suggestion">("analysis");

  const [fbSlim, setFbSlim] = useState<"slim" | "neutral" | "wide">("neutral");
  const [fbFit, setFbFit] = useState<"fit" | "loose" | "tight">("fit");
  const [fbLike, setFbLike] = useState(true);
  const [fbNote, setFbNote] = useState("");

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  useEffect(() => {
    return () => {
      if (personUrl) URL.revokeObjectURL(personUrl);
      if (garmentUrl) URL.revokeObjectURL(garmentUrl);
      if (apiUrl) URL.revokeObjectURL(apiUrl);
    };
  }, [personUrl, garmentUrl, apiUrl]);

  function parseChart(): SizeRow[] {
    try {
      return JSON.parse(chartJson) as SizeRow[];
    } catch {
      return [];
    }
  }

  async function runTryOn() {
    setLoading(true);
    setApiMsg("正在生成试穿效果图...");

    const fresh = loadProfile();
    setProfile(fresh);
    const chart = parseChart();
    const size = recommendSize(fresh, chart, garment);
    const base = analyzeTryOnSchematic(fresh, garment);
    const smartSuggestions = getSmartSuggestions(fresh, garment);

    setAnalysis({
      ...base,
      fitScore: Math.min(95, Math.max(55, Math.round(size.confidence * 100))),
      annotations: [...base.annotations, ...size.reasons.map((r) => `尺码：${r}`)],
      risks: [...size.risks, ...base.risks].slice(0, 8),
    });
    setSuggestions(smartSuggestions);

    // ========== 豆包 seedDream API（优先调用）==========
    if (person && garmentImg && DOUBAO_API_KEY && DOUBAO_API_KEY.startsWith("ark-")) {
      try {
        setApiMsg("正在调用豆包 seedDream API...");
        const personImageData = await fileToDataUrl(person);
        const garmentImageData = await fileToDataUrl(garmentImg);

        console.log("调用豆包 API，图片数据长度:", personImageData.length, garmentImageData.length);

        const result = await generateTryOnImageWithDoubao(
          DOUBAO_API_KEY,
          personImageData,
          garmentImageData,
          "doubao-seedream-5-0-260128"
        );

        console.log("豆包 API 返回:", result);

        if (result.success && result.imageUrl) {
          setApiUrl(result.imageUrl);
          setApiMsg("正在使用 AI 分析试穿效果...");

          // 调用视觉理解 API 分析生成的试穿图
          try {
            const aiAnalysis = await analyzeTryOnImageWithDoubao(
              DOUBAO_API_KEY,
              result.imageUrl,
              {
                heightCm: fresh.heightCm,
                weightKg: fresh.weightKg,
                bodyTags: fresh.bodyTags,
              }
            );

            console.log("AI 视觉分析结果:", aiAnalysis);

            // 更新分析结果
            setAnalysis({
              fitScore: aiAnalysis.fitScore || 75,
              slimIndex: (Math.min(5, Math.max(1, aiAnalysis.slimIndex || 3)) as 1 | 2 | 3 | 4 | 5),
              waistPlacement: aiAnalysis.waistPlacement || "适中",
              hemFeel: aiAnalysis.hemFeel || "自然",
              hipVisual: aiAnalysis.hipVisual || "正常",
              shoulderVisual: aiAnalysis.shoulderVisual || "合适",
              annotations: aiAnalysis.annotations || [],
              risks: (aiAnalysis.risks || []).map((r: string | RiskTag) =>
                typeof r === "string" ? { level: "warn" as const, text: r } : r
              ),
            });

            setApiMsg(`已生成试穿效果图 | 适配分 ${aiAnalysis.fitScore} | ${aiAnalysis.overallComment || ""}`);
          } catch (analysisErr) {
            console.error("AI 分析失败:", analysisErr);
            setApiMsg("已生成试穿效果图（AI分析失败，请查看图片自行判断）");
          }

          setLoading(false);
          return;
        } else {
          setApiMsg(`豆包 API 返回错误: ${result.error}`);
        }
      } catch (err) {
        console.error("豆包 API 调用异常:", err);
        setApiMsg(`豆包 API 调用异常: ${err}`);
      }
    } else {
      if (!person) {
        setApiMsg("请上传全身照");
      } else if (!garmentImg) {
        setApiMsg("请上传服装图");
      }
    }

    setLoading(false);
  }

  function updateAnalysis() {
    const fresh = loadProfile();
    const base = analyzeTryOnSchematic(fresh, garment);
    const smartSuggestions = getSmartSuggestions(fresh, garment);
    setAnalysis(base);
    setSuggestions(smartSuggestions);
  }

  // 监听服装参数变化
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    updateAnalysis();
  }, [garment]);

  function submitFeedback() {
    const item: TryOnFeedback = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      slimFeel: fbSlim,
      fitFeel: fbFit,
      like: fbLike,
      note: fbNote || undefined,
    };
    const list = [item, ...loadTryOnFeedback()].slice(0, 50);
    saveTryOnFeedback(list);
    if (fbLike) {
      recordStylePreference({
        likeFabrics: [garment.fabric],
        likeSilhouettes: [garment.silhouette],
      });
    }
    setFbNote("");
    alert("反馈已记录，用于后续偏好加权（本机）");
  }

  return (
    <>
    <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="card-soft p-6 shadow-soft">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-violet-950">虚拟试穿</h1>
            <p className="mt-2 text-sm text-stone-600">
              填写服装参数，AI 智能分析适配度与穿搭建议。配置 API 可获取真实试穿图。
            </p>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={runTryOn}
            className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-400/60 disabled:opacity-60"
          >
            {loading ? "分析中..." : "生成分析报告"}
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Drop
            label="全身照（尽量正面、光线均匀）"
            preview={personUrl}
            onFile={(f) => {
              setPerson(f);
              setPersonUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return f ? URL.createObjectURL(f) : null;
              });
            }}
          />
          <Drop
            label="服装图（平铺/模特图均可）"
            preview={garmentUrl}
            onFile={(f) => {
              setGarmentImg(f);
              setGarmentUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return f ? URL.createObjectURL(f) : null;
              });
            }}
          />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-violet-900">单品名称</label>
            <input
              className="mt-1 w-full rounded-xl border border-violet-100 bg-white px-3 py-2 text-sm outline-none ring-violet-200 focus:ring-2"
              value={garment.name}
              onChange={(e) => setGarment({ ...garment, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-violet-900">面料</label>
            <select
              className="mt-1 w-full rounded-xl border border-violet-100 bg-white px-3 py-2 text-sm outline-none ring-violet-200 focus:ring-2"
              value={garment.fabric}
              onChange={(e) =>
                setGarment({ ...garment, fabric: e.target.value as Fabric })
              }
            >
              {FABRICS.map((f) => (
                <option key={f} value={f}>
                  {FABRIC_CN[f]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-violet-900">版型</label>
            <select
              className="mt-1 w-full rounded-xl border border-violet-100 bg-white px-3 py-2 text-sm outline-none ring-violet-200 focus:ring-2"
              value={garment.silhouette}
              onChange={(e) =>
                setGarment({
                  ...garment,
                  silhouette: e.target.value as Silhouette,
                })
              }
            >
              {SILS.map((s) => (
                <option key={s} value={s}>
                  {SIL_CN[s]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Check
            label="面料偏透"
            value={!!garment.isSheer}
            onChange={(v) => setGarment({ ...garment, isSheer: v })}
          />
          <Check
            label="易皱"
            value={!!garment.wrinklesEasy}
            onChange={(v) => setGarment({ ...garment, wrinklesEasy: v })}
          />
          <Check
            label="易起球"
            value={!!garment.pillsEasy}
            onChange={(v) => setGarment({ ...garment, pillsEasy: v })}
          />
          <Check
            label="版型偏小"
            value={!!garment.runsSmall}
            onChange={(v) => setGarment({ ...garment, runsSmall: v })}
          />
          <Check
            label="版型偏大"
            value={!!garment.runsLarge}
            onChange={(v) => setGarment({ ...garment, runsLarge: v })}
          />
        </div>

        <div className="mt-6">
          <label className="text-xs font-medium text-violet-900">
            商品尺码表 JSON（肩宽/胸围/腰围/裤长等，字段名见占位示例）
          </label>
          <textarea
            className="mt-1 min-h-[130px] w-full rounded-xl border border-violet-100 bg-white px-3 py-2 font-mono text-xs outline-none ring-violet-200 focus:ring-2"
            value={chartJson}
            onChange={(e) => setChartJson(e.target.value)}
          />
        </div>
      </section>

      <aside className="flex flex-col gap-6">
        {/* 试穿结果 */}
        <div className="card-soft p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-violet-950">试穿分析</h2>
          <p className="mt-2 text-xs text-stone-600">{apiMsg}</p>

          {/* Tab 切换 */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setActiveTab("analysis")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                activeTab === "analysis"
                  ? "bg-violet-600 text-white"
                  : "bg-white text-violet-900 hover:bg-violet-50"
              }`}
            >
              适配分析
            </button>
            <button
              onClick={() => setActiveTab("suggestion")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                activeTab === "suggestion"
                  ? "bg-violet-600 text-white"
                  : "bg-white text-violet-900 hover:bg-violet-50"
              }`}
            >
              搭配建议
            </button>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-violet-100 bg-violet-50/40">
            {apiUrl ? (
              <Image
                src={apiUrl}
                alt="试穿合成"
                width={480}
                height={640}
                unoptimized
                className="h-auto w-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center px-4 py-10 text-sm text-violet-600">
                配置 API 后显示真实试穿图
              </div>
            )}
          </div>

          {/* 适配分展示 */}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full bg-violet-600 px-3 py-1 text-xs font-semibold text-white shadow-md shadow-violet-300/70">
              适配分 {analysis.fitScore}
            </span>
            <span className="rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-semibold text-fuchsia-900">
              显瘦指数 {"★".repeat(analysis.slimIndex)}
              {"☆".repeat(5 - analysis.slimIndex)}
            </span>
          </div>
        </div>

        {/* 分析详情 / 搭配建议 */}
        {activeTab === "analysis" ? (
          <div className="card-soft p-6 shadow-soft">
            <h3 className="text-base font-semibold text-violet-950">详细分析</h3>
            <ul className="mt-3 space-y-2 text-sm text-stone-700">
              <li>
                <span className="font-medium text-violet-900">腰头位置：</span>
                {analysis.waistPlacement}
              </li>
              <li>
                <span className="font-medium text-violet-900">下摆垂坠：</span>
                {analysis.hemFeel}
              </li>
              <li>
                <span className="font-medium text-violet-900">胯部视觉：</span>
                {analysis.hipVisual}
              </li>
              <li>
                <span className="font-medium text-violet-900">肩线视觉：</span>
                {analysis.shoulderVisual}
              </li>
            </ul>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-stone-600">
              {analysis.annotations.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
            <RiskBadges risks={analysis.risks} />
          </div>
        ) : (
          <div className="card-soft p-6 shadow-soft">
            <h3 className="text-base font-semibold text-violet-950">智能搭配建议</h3>

            {suggestions.bestMatch.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-emerald-700">推荐搭配</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {suggestions.bestMatch.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-800"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {suggestions.avoidMatch.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-rose-700">建议避免</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {suggestions.avoidMatch.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-rose-50 px-2 py-0.5 text-xs text-rose-800"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {suggestions.occasions.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-violet-700">适合场合</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {suggestions.occasions.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-violet-50 px-2 py-0.5 text-xs text-violet-800"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {suggestions.stylingTips.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-amber-700">穿搭技巧</p>
                <ul className="mt-1 space-y-1 text-xs text-stone-600">
                  {suggestions.stylingTips.map((tip, i) => (
                    <li key={i}>💡 {tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* 试穿反馈 */}
        <div className="card-soft p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-violet-950">试穿反馈</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs text-violet-900">显瘦感受</label>
              <select
                className="mt-1 w-full rounded-xl border border-violet-100 bg-white px-3 py-2 text-sm"
                value={fbSlim}
                onChange={(e) => setFbSlim(e.target.value as typeof fbSlim)}
              >
                <option value="slim">显瘦</option>
                <option value="neutral">一般</option>
                <option value="wide">显胖</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-violet-900">合身度</label>
              <select
                className="mt-1 w-full rounded-xl border border-violet-100 bg-white px-3 py-2 text-sm"
                value={fbFit}
                onChange={(e) => setFbFit(e.target.value as typeof fbFit)}
              >
                <option value="fit">合身</option>
                <option value="loose">偏大</option>
                <option value="tight">偏紧</option>
              </select>
            </div>
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm text-violet-900">
            <input
              type="checkbox"
              checked={fbLike}
              onChange={(e) => setFbLike(e.target.checked)}
            />
            喜欢这件的版型/面料（写入偏好）
          </label>
          <textarea
            className="mt-3 min-h-[72px] w-full rounded-xl border border-violet-100 bg-white px-3 py-2 text-sm"
            placeholder="备注：例如肩线正好但腰围略紧"
            value={fbNote}
            onChange={(e) => setFbNote(e.target.value)}
          />
          <button
            type="button"
            onClick={submitFeedback}
            className="mt-4 w-full rounded-2xl bg-violet-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-300/70"
          >
            提交反馈
          </button>
        </div>
      </aside>
    </div>
    {/* 悬浮 AI 助手 */}
    <AIAssistantFloating />
    </>
  );
}

function Drop({
  label,
  preview,
  onFile,
}: {
  label: string;
  preview: string | null;
  onFile: (f: File | null) => void;
}) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-violet-200 bg-white/90 p-4 transition hover:border-violet-400 hover:bg-violet-50/50">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-violet-900">{label}</div>
        <label className="cursor-pointer rounded-lg bg-violet-100 px-3 py-1.5 text-xs font-semibold text-violet-900 transition hover:bg-violet-200">
          选择文件
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              onFile(file);
              // 重置 input 以允许选择相同文件
              e.target.value = "";
            }}
          />
        </label>
      </div>
      {!preview && (
        <p className="mt-2 text-center text-xs text-stone-400">
          支持 JPG、PNG、WebP 格式
        </p>
      )}
      {preview && (
        <div className="relative mt-3 aspect-[3/4] w-full overflow-hidden rounded-xl border border-violet-100 bg-violet-50">
          <Image
            src={preview}
            alt="preview"
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      )}
    </div>
  );
}

function Check({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-violet-100 bg-white px-3 py-2 text-sm text-stone-700">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
