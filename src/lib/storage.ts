"use client";

import type {
  BodyProfile,
  TryOnFeedback,
  WardrobeItem,
} from "@/lib/types";

const K_PROFILE = "womens_ai_body_profile_v1";
const K_WARDROBE = "womens_ai_wardrobe_v1";
const K_FEEDBACK_TRYON = "womens_ai_tryon_feedback_v1";
const K_PREFS = "womens_ai_style_prefs_v1";

export const defaultProfile: BodyProfile = {
  heightCm: 165,
  weightKg: 52,
  bustCm: 84,
  waistCm: 66,
  hipCm: 90,
  shoulderCm: 38,
  hipWidthCm: 34,
  usualSize: "M",
  bodyTags: ["hourglass"],
  wantSlim: true,
  wantHideTummy: false,
  wantTaller: true,
  styleLikes: ["极简", "温柔针织"],
  avoidFabrics: [],
  avoidSilhouettes: [],
};

export function loadProfile(): BodyProfile {
  if (typeof window === "undefined") return defaultProfile;
  try {
    const raw = localStorage.getItem(K_PROFILE);
    if (!raw) return defaultProfile;
    return { ...defaultProfile, ...JSON.parse(raw) };
  } catch {
    return defaultProfile;
  }
}

export function saveProfile(p: BodyProfile) {
  localStorage.setItem(K_PROFILE, JSON.stringify(p));
}

export function loadWardrobe(): WardrobeItem[] {
  if (typeof window === "undefined") return seedWardrobe();
  try {
    const raw = localStorage.getItem(K_WARDROBE);
    if (!raw) {
      const s = seedWardrobe();
      localStorage.setItem(K_WARDROBE, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw);
  } catch {
    return seedWardrobe();
  }
}

export function saveWardrobe(items: WardrobeItem[]) {
  localStorage.setItem(K_WARDROBE, JSON.stringify(items));
}

export function loadTryOnFeedback(): TryOnFeedback[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(K_FEEDBACK_TRYON);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTryOnFeedback(list: TryOnFeedback[]) {
  localStorage.setItem(K_FEEDBACK_TRYON, JSON.stringify(list));
}

/** 根据反馈提升「喜欢的版型/面料」权重（简易偏好记忆） */
export function recordStylePreference(partial: {
  likeFabrics?: string[];
  likeSilhouettes?: string[];
}) {
  try {
    const prev = JSON.parse(localStorage.getItem(K_PREFS) || "{}");
    localStorage.setItem(
      K_PREFS,
      JSON.stringify({
        likeFabrics: [
          ...(prev.likeFabrics || []),
          ...(partial.likeFabrics || []),
        ].slice(-30),
        likeSilhouettes: [
          ...(prev.likeSilhouettes || []),
          ...(partial.likeSilhouettes || []),
        ].slice(-30),
      }),
    );
  } catch {
    /* ignore */
  }
}

function seedWardrobe(): WardrobeItem[] {
  return [
    {
      id: "w1",
      name: "奶白收腰衬衫",
      category: "top",
      fabric: "cotton",
      silhouette: "cinched",
      season: "spring",
      scenes: ["commute", "interview"],
      slimScore: 4,
      fitBodies: ["apple", "hourglass"],
      avoidFor: ["胯宽慎选过短下摆"],
      tips: "V 领修饰肩颈；塞进高腰下装显高",
    },
    {
      id: "w2",
      name: "浅紫 A 字半裙",
      category: "bottom",
      fabric: "chiffon",
      silhouette: "longline",
      season: "summer",
      scenes: ["date", "campus"],
      slimScore: 5,
      fitBodies: ["pear", "curvy"],
      tips: "遮挡胯部曲线，配合短款上衣优化比例",
    },
    {
      id: "w3",
      name: "直筒牛仔长裤",
      category: "bottom",
      fabric: "denim",
      silhouette: "straight",
      season: "all",
      scenes: ["commute", "campus", "sport"],
      slimScore: 3,
      fitBodies: ["petite", "hourglass"],
      avoidFor: ["面料无弹时胯宽留意腰围"],
    },
  ];
}
