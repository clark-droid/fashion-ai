"use client";

import { useEffect, useState } from "react";
import type { BodyProfile, BodyTag, Fabric, Silhouette } from "@/lib/types";
import { BODY_TAG_CN, FABRIC_CN, SIL_CN } from "@/lib/labels";
import { defaultProfile, loadProfile, saveProfile } from "@/lib/storage";

const BODY_OPTIONS: BodyTag[] = [
  "pear",
  "apple",
  "hourglass",
  "petite",
  "curvy",
  "narrow_shoulder",
  "o_legs",
];

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

export default function ProfilePage() {
  const [p, setP] = useState<BodyProfile>(defaultProfile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setP(loadProfile());
  }, []);

  function toggleTag(tag: BodyTag) {
    setP((prev) => ({
      ...prev,
      bodyTags: prev.bodyTags.includes(tag)
        ? prev.bodyTags.filter((t) => t !== tag)
        : [...prev.bodyTags, tag],
    }));
  }

  function toggleFabric(f: Fabric) {
    setP((prev) => ({
      ...prev,
      avoidFabrics: prev.avoidFabrics.includes(f)
        ? prev.avoidFabrics.filter((x) => x !== f)
        : [...prev.avoidFabrics, f],
    }));
  }

  function toggleSil(s: Silhouette) {
    setP((prev) => ({
      ...prev,
      avoidSilhouettes: prev.avoidSilhouettes.includes(s)
        ? prev.avoidSilhouettes.filter((x) => x !== s)
        : [...prev.avoidSilhouettes, s],
    }));
  }

  function save() {
    saveProfile(p);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="card-soft p-6 shadow-soft">
        <h1 className="text-2xl font-semibold text-violet-950">我的身材</h1>
        <p className="mt-2 text-sm text-stone-600">
          数据仅保存在本机 <code className="text-violet-800">localStorage</code>
          ，用于尺码推算与穿搭规则匹配。
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field
            label="身高 cm"
            type="number"
            value={p.heightCm}
            onChange={(v) => setP({ ...p, heightCm: v })}
          />
          <Field
            label="体重 kg"
            type="number"
            value={p.weightKg}
            onChange={(v) => setP({ ...p, weightKg: v })}
          />
          <Field
            label="胸围 cm"
            type="number"
            value={p.bustCm}
            onChange={(v) => setP({ ...p, bustCm: v })}
          />
          <Field
            label="腰围 cm"
            type="number"
            value={p.waistCm}
            onChange={(v) => setP({ ...p, waistCm: v })}
          />
          <Field
            label="臀围 cm"
            type="number"
            value={p.hipCm}
            onChange={(v) => setP({ ...p, hipCm: v })}
          />
          <OptionalField
            label="肩宽 cm（可选）"
            value={p.shoulderCm}
            onChange={(v) => setP({ ...p, shoulderCm: v })}
          />
          <OptionalField
            label="胯宽 cm（可选）"
            value={p.hipWidthCm}
            onChange={(v) => setP({ ...p, hipWidthCm: v })}
          />
          <div>
            <label className="text-xs font-medium text-violet-900">
              日常尺码
            </label>
            <input
              className="mt-1 w-full rounded-xl border border-violet-100 bg-white px-3 py-2 text-sm outline-none ring-violet-200 focus:ring-2"
              value={p.usualSize}
              onChange={(e) => setP({ ...p, usualSize: e.target.value })}
            />
          </div>
        </div>

        <div className="mt-6">
          <div className="text-xs font-medium text-violet-900">体型标签（多选）</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {BODY_OPTIONS.map((tag) => {
              const on = p.bodyTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full px-3 py-1 text-xs transition ${
                    on
                      ? "bg-violet-600 text-white shadow-md shadow-violet-300/60"
                      : "bg-violet-50 text-violet-900 hover:bg-violet-100"
                  }`}
                >
                  {BODY_TAG_CN[tag]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Toggle
            label="显瘦需求"
            value={p.wantSlim}
            onChange={(v) => setP({ ...p, wantSlim: v })}
          />
          <Toggle
            label="遮小腹"
            value={p.wantHideTummy}
            onChange={(v) => setP({ ...p, wantHideTummy: v })}
          />
          <Toggle
            label="显高需求"
            value={p.wantTaller}
            onChange={(v) => setP({ ...p, wantTaller: v })}
          />
        </div>

        <div className="mt-6">
          <label className="text-xs font-medium text-violet-900">
            喜欢的风格（逗号分隔）
          </label>
          <input
            className="mt-1 w-full rounded-xl border border-violet-100 bg-white px-3 py-2 text-sm outline-none ring-violet-200 focus:ring-2"
            value={p.styleLikes.join("，")}
            onChange={(e) =>
              setP({
                ...p,
                styleLikes: e.target.value
                  .split(/[,，]/)
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
          />
        </div>

        <div className="mt-6">
          <div className="text-xs font-medium text-violet-900">避雷面料</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {FABRICS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => toggleFabric(f)}
                className={`rounded-full px-3 py-1 text-xs ${
                  p.avoidFabrics.includes(f)
                    ? "bg-rose-100 text-rose-900"
                    : "bg-stone-50 text-stone-700 hover:bg-stone-100"
                }`}
              >
                {FABRIC_CN[f]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="text-xs font-medium text-violet-900">避雷版型</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {SILS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSil(s)}
                className={`rounded-full px-3 py-1 text-xs ${
                  p.avoidSilhouettes.includes(s)
                    ? "bg-amber-100 text-amber-950"
                    : "bg-stone-50 text-stone-700 hover:bg-stone-100"
                }`}
              >
                {SIL_CN[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center gap-4">
          <button
            type="button"
            onClick={save}
            className="rounded-2xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-300/70"
          >
            保存身材档案
          </button>
          {saved && (
            <span className="text-sm text-emerald-600">已保存到本机</span>
          )}
        </div>
    </div>
  );
}

function OptionalField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: number;
  onChange: (v: number | undefined) => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-violet-900">{label}</label>
      <input
        type="number"
        className="mt-1 w-full rounded-xl border border-violet-100 bg-white px-3 py-2 text-sm outline-none ring-violet-200 focus:ring-2"
        value={value ?? ""}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") onChange(undefined);
          else onChange(Number(raw));
        }}
      />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type,
}: {
  label: string;
  value: number | "";
  onChange: (v: number) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-violet-900">{label}</label>
      <input
        type={type || "number"}
        className="mt-1 w-full rounded-xl border border-violet-100 bg-white px-3 py-2 text-sm outline-none ring-violet-200 focus:ring-2"
        value={value === undefined || value === null ? "" : value}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") return;
          onChange(Number(raw));
        }}
      />
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm ${
        value
          ? "border-violet-300 bg-violet-50 text-violet-950"
          : "border-violet-100 bg-white text-stone-600"
      }`}
    >
      {label}
      <span className="text-xs">{value ? "开" : "关"}</span>
    </button>
  );
}
