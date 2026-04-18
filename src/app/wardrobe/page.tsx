"use client";

import { useEffect, useMemo, useState } from "react";
import type { Fabric, Scene, Silhouette, WardrobeItem } from "@/lib/types";
import { FABRIC_CN, SCENE_CN, SIL_CN } from "@/lib/labels";
import { loadProfile, loadWardrobe, saveWardrobe } from "@/lib/storage";

export default function WardrobePage() {
  const profile = useMemo(() => loadProfile(), []);
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [season, setSeason] = useState<string>("all");
  const [fabric, setFabric] = useState<Fabric | "all">("all");
  const [sil, setSil] = useState<Silhouette | "all">("all");
  const [scene, setScene] = useState<Scene | "all">("all");
  const [minSlim, setMinSlim] = useState(1);

  useEffect(() => {
    setItems(loadWardrobe());
  }, []);

  function persist(next: WardrobeItem[]) {
    setItems(next);
    saveWardrobe(next);
  }

  function toggleFlag(id: string, key: "like" | "dislike" | "risky" | "worn") {
    persist(
      items.map((it) => {
        if (it.id !== id) return it;
        const cur = Boolean(it[key]);
        return { ...it, [key]: !cur };
      }),
    );
  }

  function bulkMark(key: "like" | "dislike" | "risky" | "worn") {
    persist(
      items.map((it) =>
        filtered.includes(it) ? { ...it, [key]: true } : it,
      ),
    );
  }

  const filtered = items.filter((it) => {
    if (season !== "all" && it.season !== season && it.season !== "all")
      return false;
    if (fabric !== "all" && it.fabric !== fabric) return false;
    if (sil !== "all" && it.silhouette !== sil) return false;
    if (scene !== "all" && !it.scenes.includes(scene)) return false;
    if (it.slimScore < minSlim) return false;
    return true;
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr]">
      <section className="card-soft p-6 shadow-soft">
        <h1 className="text-2xl font-semibold text-violet-950">智能衣橱</h1>
        <p className="mt-2 text-sm text-stone-600">
          支持按显瘦指数 / 场景 / 面料 / 版型 / 季节筛选；批量标注有助于后续搭配加权。
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-violet-900">季节</label>
            <select
              className="mt-1 w-full rounded-xl border border-violet-100 bg-white px-3 py-2 text-sm"
              value={season}
              onChange={(e) => setSeason(e.target.value)}
            >
              <option value="all">不限</option>
              <option value="spring">春</option>
              <option value="summer">夏</option>
              <option value="autumn">秋</option>
              <option value="winter">冬</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-violet-900">面料</label>
            <select
              className="mt-1 w-full rounded-xl border border-violet-100 bg-white px-3 py-2 text-sm"
              value={fabric}
              onChange={(e) => setFabric(e.target.value as Fabric | "all")}
            >
              <option value="all">不限</option>
              {(Object.keys(FABRIC_CN) as Fabric[]).map((f) => (
                <option key={f} value={f}>
                  {FABRIC_CN[f]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-violet-900">版型</label>
            <select
              className="mt-1 w-full rounded-xl border border-violet-100 bg-white px-3 py-2 text-sm"
              value={sil}
              onChange={(e) => setSil(e.target.value as Silhouette | "all")}
            >
              <option value="all">不限</option>
              {(Object.keys(SIL_CN) as Silhouette[]).map((s) => (
                <option key={s} value={s}>
                  {SIL_CN[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-violet-900">场景</label>
            <select
              className="mt-1 w-full rounded-xl border border-violet-100 bg-white px-3 py-2 text-sm"
              value={scene}
              onChange={(e) => setScene(e.target.value as Scene | "all")}
            >
              <option value="all">不限</option>
              {(Object.keys(SCENE_CN) as Scene[]).map((sc) => (
                <option key={sc} value={sc}>
                  {SCENE_CN[sc]}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-violet-900">
              最低显瘦指数：{minSlim} 星
            </label>
            <input
              type="range"
              min={1}
              max={5}
              value={minSlim}
              onChange={(e) => setMinSlim(Number(e.target.value))}
              className="mt-2 w-full accent-violet-600"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => bulkMark("like")}
            className="rounded-full bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-violet-300/70"
          >
            批量喜欢（筛选结果）
          </button>
          <button
            type="button"
            onClick={() => bulkMark("dislike")}
            className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-900 shadow-sm"
          >
            批量不喜欢
          </button>
          <button
            type="button"
            onClick={() => bulkMark("risky")}
            className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-950 shadow-sm"
          >
            标记易踩雷
          </button>
          <button
            type="button"
            onClick={() => bulkMark("worn")}
            className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-violet-900 shadow-sm"
          >
            标记已穿
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="rounded-2xl bg-violet-50/80 p-4 text-xs text-violet-900">
          当前身材档案用于展示单品「适配体型」提示：{" "}
          <span className="font-semibold">
            {profile.bodyTags.join(" · ") || "未设置"}
          </span>
        </div>
        {filtered.map((it) => (
          <article key={it.id} className="card-soft p-5 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-violet-950">{it.name}</h2>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-white px-2 py-1 text-violet-900 shadow-sm">
                    {FABRIC_CN[it.fabric]} · {SIL_CN[it.silhouette]}
                  </span>
                  <span className="rounded-full bg-fuchsia-100 px-2 py-1 font-semibold text-fuchsia-900">
                    显瘦 {it.slimScore}★
                  </span>
                  {it.scenes.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-white px-2 py-1 text-violet-800 shadow-sm"
                    >
                      {SCENE_CN[s]}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <MiniToggle
                  label="喜欢"
                  on={!!it.like}
                  onClick={() => toggleFlag(it.id, "like")}
                />
                <MiniToggle
                  label="不喜欢"
                  on={!!it.dislike}
                  onClick={() => toggleFlag(it.id, "dislike")}
                />
                <MiniToggle
                  label="踩雷"
                  on={!!it.risky}
                  onClick={() => toggleFlag(it.id, "risky")}
                />
                <MiniToggle
                  label="已穿"
                  on={!!it.worn}
                  onClick={() => toggleFlag(it.id, "worn")}
                />
              </div>
            </div>
            <p className="mt-3 text-sm text-stone-700">
              <span className="font-medium text-violet-900">适配体型：</span>
              {it.fitBodies.join(" / ")}
            </p>
            {it.avoidFor?.length ? (
              <p className="mt-2 text-xs text-rose-700">
                避雷：{it.avoidFor.join("；")}
              </p>
            ) : null}
            {it.tips && (
              <p className="mt-2 text-sm text-stone-600">
                <span className="font-medium text-violet-900">搭配建议：</span>
                {it.tips}
              </p>
            )}
          </article>
        ))}
        {!filtered.length && (
          <div className="card-soft p-8 text-center text-sm text-stone-500 shadow-soft">
            没有符合筛选条件的单品，可放宽条件试试
          </div>
        )}
      </section>
    </div>
  );
}

function MiniToggle({
  label,
  on,
  onClick,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-2 py-1 ${
        on
          ? "bg-violet-600 text-white shadow-md shadow-violet-300/70"
          : "bg-white text-stone-600 shadow-sm"
      }`}
    >
      {label}
    </button>
  );
}
