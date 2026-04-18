import type {
  BodyProfile,
  GarmentMeta,
  RiskLevel,
  RiskTag,
  SizeRecommendation,
  SizeRow,
} from "@/lib/types";

function levelToClass(l: RiskLevel): string {
  if (l === "high") return "bg-rose-100 text-rose-800 border-rose-200";
  if (l === "warn") return "bg-amber-100 text-amber-900 border-amber-200";
  return "bg-violet-100 text-violet-800 border-violet-200";
}

export { levelToClass };

export function recommendSize(
  profile: BodyProfile,
  chart: SizeRow[],
  garment: GarmentMeta,
): SizeRecommendation {
  if (!chart.length) {
    return {
      recommended: profile.usualSize,
      note: "正码",
      confidence: 0.4,
      reasons: ["未填写尺码表，先按日常尺码兜底"],
      risks: fabricRisks(garment, profile),
    };
  }

  const scored = chart.map((row) => {
    let penalty = 0;
    const reasons: string[] = [];

    if (row.bustCm != null) {
      const d = Math.abs(row.bustCm - profile.bustCm);
      penalty += d / 10;
      if (d <= 2) reasons.push(`胸围贴合 ${row.label}`);
      else if (profile.bustCm > row.bustCm) reasons.push(`${row.label} 胸围偏小`);
      else reasons.push(`${row.label} 胸围偏大`);
    }
    if (row.waistCm != null) {
      const d = Math.abs(row.waistCm - profile.waistCm);
      penalty += d / 8;
      if (profile.waistCm > row.waistCm + 3)
        reasons.push("腰腹略紧风险");
    }
    if (row.shoulderCm != null && profile.shoulderCm != null) {
      penalty += Math.abs(row.shoulderCm - profile.shoulderCm) / 6;
    }

    penalty += garment.runsSmall ? 5 : 0;
    penalty -= garment.runsLarge ? 3 : 0;

    return { row, penalty, reasons };
  });

  scored.sort((a, b) => a.penalty - b.penalty);
  const best = scored[0];
  let note: SizeRecommendation["note"] = "正码";
  if (garment.runsSmall) note = "偏小一码";
  else if (garment.runsLarge) note = "偏大半码";
  else if (best.row.bustCm != null && profile.bustCm > best.row.bustCm + 4)
    note = "偏小一码";
  else if (best.row.bustCm != null && profile.bustCm < best.row.bustCm - 4)
    note = "偏大半码";

  const risks = [...fabricRisks(garment, profile), ...bodyGarmentRisks(profile, garment)];

  return {
    recommended: best.row.label,
    note,
    confidence: Math.max(0.35, Math.min(0.92, 1 - best.penalty / 40)),
    reasons: Array.from(new Set(best.reasons)).slice(0, 4),
    risks,
  };
}

function fabricRisks(g: GarmentMeta, p: BodyProfile): RiskTag[] {
  const out: RiskTag[] = [];
  if (g.isSheer)
    out.push({
      level: "warn",
      text: "面料偏透 · 建议内搭吊带/打底",
    });
  if (g.wrinklesEasy)
    out.push({ level: "warn", text: "易皱 · 久坐通勤留意熨烫" });
  if (g.pillsEasy)
    out.push({ level: "warn", text: "易起球 · 摩擦部位注意护理" });
  if (p.avoidFabrics.includes(g.fabric))
    out.push({
      level: "high",
      text: `你在偏好里避雷该面料（${g.fabric}）`,
    });
  return out;
}

export function bodyGarmentRisks(p: BodyProfile, g: GarmentMeta): RiskTag[] {
  const out: RiskTag[] = [];
  if (p.bodyTags.includes("pear") && g.silhouette === "fitted" && g.fabric === "denim") {
    out.push({
      level: "warn",
      text: "梨形 + 紧身牛仔 · 胯部视觉放大风险",
    });
  }
  if (p.bodyTags.includes("apple") && g.silhouette === "cropped") {
    out.push({
      level: "warn",
      text: "苹果型慎选过短上衣 · 腰腹暴露风险",
    });
  }
  if (p.wantHideTummy && g.silhouette === "fitted") {
    out.push({
      level: "warn",
      text: "修身款遮小腹能力弱 · 可考虑大一码或外搭",
    });
  }
  return out;
}
