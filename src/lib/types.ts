/** 女装穿搭 Demo — 类型定义（纯前端 localStorage） */

export type BodyTag =
  | "pear"
  | "apple"
  | "hourglass"
  | "petite"
  | "curvy"
  | "narrow_shoulder"
  | "o_legs";

export type Fabric =
  | "cotton"
  | "polyester"
  | "chiffon"
  | "knit"
  | "denim"
  | "linen"
  | "wool";

export type Silhouette =
  | "loose"
  | "fitted"
  | "straight"
  | "cinched"
  | "cropped"
  | "longline";

export type Scene =
  | "commute"
  | "campus"
  | "date"
  | "picnic"
  | "interview"
  | "vacation"
  | "sport"
  | "formal";

export interface BodyProfile {
  heightCm: number;
  weightKg: number;
  bustCm: number;
  waistCm: number;
  hipCm: number;
  shoulderCm?: number;
  hipWidthCm?: number;
  usualSize: string;
  bodyTags: BodyTag[];
  wantSlim: boolean;
  wantHideTummy: boolean;
  wantTaller: boolean;
  styleLikes: string[];
  avoidFabrics: Fabric[];
  avoidSilhouettes: Silhouette[];
}

export interface SizeRow {
  label: string;
  shoulderCm?: number;
  bustCm?: number;
  waistCm?: number;
  lengthCm?: number;
}

export interface GarmentMeta {
  name: string;
  fabric: Fabric;
  silhouette: Silhouette;
  isSheer?: boolean;
  wrinklesEasy?: boolean;
  pillsEasy?: boolean;
  runsSmall?: boolean;
  runsLarge?: boolean;
}

export interface WardrobeItem {
  id: string;
  name: string;
  category: "top" | "bottom" | "dress" | "outer" | "shoes" | "bag";
  fabric: Fabric;
  silhouette: Silhouette;
  season: "spring" | "summer" | "autumn" | "winter" | "all";
  scenes: Scene[];
  slimScore: 1 | 2 | 3 | 4 | 5;
  fitBodies: BodyTag[];
  avoidFor?: string[];
  tips?: string;
  worn?: boolean;
  like?: boolean;
  dislike?: boolean;
  risky?: boolean;
}

export type RiskLevel = "low" | "warn" | "high";

export interface RiskTag {
  level: RiskLevel;
  text: string;
}

export interface SizeRecommendation {
  recommended: string;
  note: "正码" | "偏大半码" | "偏小一码";
  confidence: number;
  reasons: string[];
  risks: RiskTag[];
}

export interface TryOnAnalysis {
  fitScore: number;
  waistPlacement: string;
  hemFeel: string;
  hipVisual: string;
  shoulderVisual: string;
  annotations: string[];
  slimIndex: 1 | 2 | 3 | 4 | 5;
  risks: RiskTag[];
}

export interface TryOnFeedback {
  id: string;
  createdAt: string;
  slimFeel: "slim" | "neutral" | "wide";
  fitFeel: "fit" | "loose" | "tight";
  like: boolean;
  note?: string;
}

export interface OutfitTip {
  title: string;
  items: string[];
  technique: string;
  fabrics: Fabric[];
  silhouettes: Silhouette[];
  bestFor: BodyTag[];
  avoidFor?: BodyTag[];
  slimIndex: 1 | 2 | 3 | 4 | 5;
}
