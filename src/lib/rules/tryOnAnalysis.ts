import type { BodyProfile, GarmentMeta, TryOnAnalysis } from "@/lib/types";
import { recommendSize } from "@/lib/rules/sizeAndRisk";

/**
 * 体型标签中文映射
 */
const BODY_TAG_CN: Record<string, string> = {
  pear: "梨形身材",
  apple: "苹果型身材",
  hourglass: "沙漏型身材",
  petite: "小个子",
  curvy: "丰满身材",
  narrow_shoulder: "窄肩",
  o_legs: "O型腿",
};

/**
 * 面料特性分析
 */
const FABRIC_ANALYSIS: Record<string, { pros: string[]; cons: string[]; care: string }> = {
  cotton: {
    pros: ["透气舒适", "亲肤无刺激", "适合春夏"],
    cons: ["易皱", "可能缩水"],
    care: "建议冷水手洗或轻柔机洗，避免高温烘干",
  },
  chiffon: {
    pros: ["轻盈飘逸", "仙气十足", "适合约会"],
    cons: ["偏透", "易刮丝", "不耐造"],
    care: "建议手洗，轻柔搓洗，避免用力拧绞",
  },
  knit: {
    pros: ["弹性好", "修身不勒", "保暖又百搭"],
    cons: ["可能起球", "长期拉伸会变形"],
    care: "建议平铺晾晒，避免挂晒导致变形",
  },
  denim: {
    pros: ["挺括有型", "耐穿耐磨", "显瘦效果佳"],
    cons: ["初期偏硬", "透气性一般"],
    care: "首次清洗建议单独浸泡，日常避免频繁洗涤",
  },
  linen: {
    pros: ["天然透气", "凉爽舒适", "适合夏季"],
    cons: ["易皱", "需要熨烫"],
    care: "建议半干时熨烫，效果更佳",
  },
  polyester: {
    pros: ["不易皱", "快干好打理", "色牢度高"],
    cons: ["透气性差", "可能起静电"],
    care: "可机洗，但避免高温熨烫",
  },
  wool: {
    pros: ["保暖高级", "垂感好", "显档次"],
    cons: ["需干洗", "可能起球", "价格偏高"],
    care: "建议干洗，日常存放注意防虫蛀",
  },
};

/**
 * 版型与身材匹配分析
 */
function analyzeSilhouetteFit(profile: BodyProfile, garment: GarmentMeta): {
  score: number;
  verdict: string;
  tips: string[];
} {
  const tags = profile.bodyTags;
  const sil = garment.silhouette;
  let score = 75;
  const tips: string[] = [];

  // 梨形身材
  if (tags.includes("pear")) {
    if (sil === "loose" || sil === "longline") {
      score += 15;
      tips.push("A字/长款设计完美遮盖胯部线条");
    } else if (sil === "fitted") {
      score -= 20;
      tips.push("紧身款可能暴露胯宽，建议搭配外套");
    }
  }

  // 苹果型身材
  if (tags.includes("apple")) {
    if (sil === "loose" || sil === "longline") {
      score += 15;
      tips.push("宽松版型有效遮盖腹部，优雅大方");
    } else if (sil === "cropped") {
      score -= 15;
      tips.push("短款上衣可能暴露腹部，建议选择中长款");
    }
  }

  // 小个子
  if (tags.includes("petite")) {
    if (sil === "longline") {
      score -= 10;
      tips.push("长款可能显矮，建议搭配高跟鞋或腰带");
    } else if (sil === "cinched" || sil === "cropped") {
      score += 10;
      tips.push("收腰/短款设计有助于优化比例");
    }
  }

  // 窄肩
  if (tags.includes("narrow_shoulder")) {
    if (sil === "loose") {
      score += 5;
      tips.push("宽松肩部设计视觉上拓宽肩线");
    }
  }

  // 想要显高
  if (profile.wantTaller) {
    if (sil === "longline") {
      tips.push("长款单品建议搭配高跟鞋或收腰设计");
    }
    if (sil === "cinched") {
      score += 5;
      tips.push("收腰设计有助于拉长下身比例");
    }
  }

  // 想要显瘦
  if (profile.wantSlim) {
    if (sil === "loose" && garment.fabric !== "chiffon") {
      score += 5;
      tips.push("适度宽松可遮肉，但避免过于臃肿");
    }
    if (sil === "fitted" && !tags.includes("hourglass")) {
      score -= 10;
      tips.push("修身款可能暴露身形，建议参考试穿反馈");
    }
  }

  // 确保分数在合理范围内
  score = Math.max(30, Math.min(98, score));

  const verdict = score >= 85
    ? "完美匹配"
    : score >= 70
    ? "基本合适"
    : score >= 50
    ? "需要注意"
    : "可能踩雷";

  return { score, verdict, tips };
}

/**
 * 颜色搭配建议
 */
function suggestColors(profile: BodyProfile): {
  recommended: string[];
  neutral: string[];
  avoid: string[];
} {
  const tagNames = profile.bodyTags.join(",");
  
  // 通用推荐
  const recommended: string[] = ["雾霾蓝", "燕麦色", "浅灰"];
  const neutral: string[] = ["黑色", "白色", "灰色"];
  const avoid: string[] = [];

  // 苹果型 - 上浅下深
  if (tagNames.includes("apple")) {
    recommended.push("浅紫色", "珊瑚色");
    avoid.push("全身深色"); // 会更显沉重
  }

  // 梨形 - 上浅下深
  if (tagNames.includes("pear")) {
    recommended.push("香槟色", "淡粉色");
    neutral.push("深蓝色", "酒红色");
  }

  // 小个子
  if (tagNames.includes("petite")) {
    recommended.push("同色系搭配");
    avoid.push("太多颜色分割"); // 会显矮
  }

  // 丰满身材
  if (tagNames.includes("curvy")) {
    recommended.push("深色系", "竖条纹");
    avoid.push("过于鲜艳的图案");
  }

  return {
    recommended: Array.from(new Set(recommended)),
    neutral: Array.from(new Set(neutral)),
    avoid: Array.from(new Set(avoid)),
  };
}

/**
 * 方案 A：无真实像素级试衣，基于规则生成「上身示意图文案 + 适配度」
 * 增强版：更详细的智能分析
 */
export function analyzeTryOnSchematic(
  profile: BodyProfile,
  garment: GarmentMeta,
): TryOnAnalysis {
  const fakeChart = [
    { label: "S", bustCm: 82, waistCm: 64, shoulderCm: 37 },
    { label: "M", bustCm: 86, waistCm: 68, shoulderCm: 38 },
    { label: "L", bustCm: 90, waistCm: 72, shoulderCm: 39 },
  ];
  const size = recommendSize(profile, fakeChart, garment);

  // 版型匹配分析
  const silhouetteFit = analyzeSilhouetteFit(profile, garment);

  // 计算综合适配分
  const fitScore = Math.round(
    size.confidence * 40 + silhouetteFit.score * 0.6
  );

  // 显瘦指数计算
  let slimIndex = 3 as TryOnAnalysis["slimIndex"];
  if (profile.wantSlim) {
    if (silhouetteFit.score >= 85) {
      slimIndex = 5;
    } else if (silhouetteFit.score >= 70) {
      slimIndex = 4;
    } else if (silhouetteFit.score < 50) {
      slimIndex = 2;
    }
  } else {
    slimIndex = 3; // 无显瘦需求时给中等分
  }

  const annotations: string[] = [];

  // 尺码建议
  annotations.push(`💡 尺码建议：${size.recommended}（${size.note}）`);

  // 面料分析
  const fabricInfo = FABRIC_ANALYSIS[garment.fabric];
  if (fabricInfo) {
    const prosStr = fabricInfo.pros.slice(0, 2).join("、");
    annotations.push(`✨ 面料优势：${prosStr}`);
  }

  // 版型匹配
  annotations.push(
    `🎯 版型匹配度：${silhouetteFit.verdict}（${silhouetteFit.score}%）`
  );

  // 个性化提示
  if (silhouetteFit.tips.length > 0) {
    annotations.push(`📌 ${silhouetteFit.tips[0]}`);
  }

  // 身材相关性
  const tags = profile.bodyTags;
  if (tags.length > 0) {
    const tagCNs = tags.map(t => BODY_TAG_CN[t] || t).join("、");
    annotations.push(`👤 针对身材：${tagCNs}`);
  }

  // 颜色建议
  const colors = suggestColors(profile);
  if (colors.recommended.length > 0) {
    annotations.push(`🎨 推荐颜色：${colors.recommended.slice(0, 3).join("、")}`);
  }

  // 风险评估
  const risks = size.risks.slice(0, 6);

  return {
    fitScore,
    waistPlacement:
      garment.silhouette === "cinched"
        ? "腰线位于自然腰上方约 2cm（收腰优化比例）"
        : garment.silhouette === "loose"
        ? "腰部宽松，不挑身材，但可能缺乏曲线感"
        : "腰线接近自然腰（直筒/修身）",
    hemFeel:
      garment.silhouette === "longline"
        ? "下摆落至小腿中上，走动有纵向延伸感"
        : garment.silhouette === "cropped"
        ? "短款设计，露腰效果，适合高腰下装搭配"
        : "下摆长度适中，日常活动不受限",
    hipVisual: profile.bodyTags.includes("pear")
      ? "胯部：A字/长裙更友好；紧身款显胯风险↑"
      : profile.bodyTags.includes("apple")
      ? "胯部：H型版型更舒适，避免过紧"
      : "胯部：版型覆盖均衡",
    shoulderVisual: profile.bodyTags.includes("narrow_shoulder")
      ? "肩线：可选垫肩/V领修饰肩部比例"
      : profile.bodyTags.includes("curvy")
      ? "肩线：注意肩宽与整体比例协调"
      : "肩线：与身形匹配度良好",
    annotations,
    slimIndex,
    risks,
  };
}

/**
 * 获取智能搭配建议
 */
export function getSmartSuggestions(profile: BodyProfile, garment: GarmentMeta): {
  bestMatch: string[];
  avoidMatch: string[];
  occasions: string[];
  stylingTips: string[];
} {
  const bestMatch: string[] = [];
  const avoidMatch: string[] = [];
  const occasions: string[] = [];
  const stylingTips: string[] = [];

  // 基于面料推荐搭配
  if (garment.fabric === "chiffon") {
    bestMatch.push("细带凉鞋", "小巧首饰", "轻薄手包");
    avoidMatch.push("笨重运动鞋", "大体积配饰");
    occasions.push("约会", "下午茶", "度假");
    stylingTips.push("搭配简约配饰，避免喧宾夺主");
  } else if (garment.fabric === "cotton") {
    bestMatch.push("帆布鞋", "草编包", "棒球帽");
    avoidMatch.push("过于正式的高跟鞋");
    occasions.push("校园", "逛街", "休闲约会");
    stylingTips.push("可盐可甜，随性自然");
  } else if (garment.fabric === "denim") {
    bestMatch.push("小白鞋", "马丁靴", "皮带");
    avoidMatch.push("正装皮鞋");
    occasions.push("通勤", "聚会", "出游");
    stylingTips.push("卷起裤脚更时髦");
  } else if (garment.fabric === "knit") {
    bestMatch.push("踝靴", "丝巾", "精致耳环");
    avoidMatch.push("过于粗犷的配饰");
    occasions.push("通勤", "约会", "日常办公");
    stylingTips.push("柔软针织搭配硬朗配饰，层次感更佳");
  } else if (garment.fabric === "wool") {
    bestMatch.push("短靴", "围巾", "公文包");
    avoidMatch.push("凉鞋", "草编包");
    occasions.push("正式场合", "秋冬通勤", "商务会议");
    stylingTips.push("同色系穿搭更显高级");
  }

  // 基于身材添加建议
  if (profile.bodyTags.includes("pear")) {
    stylingTips.push("上半身可加亮点配饰，吸引视线");
  }
  if (profile.bodyTags.includes("petite")) {
    stylingTips.push("扎起头发或戴帽子可显高");
  }
  if (profile.wantHideTummy) {
    stylingTips.push("外搭开衫或长外套，遮腹效果更佳");
  }

  return { bestMatch, avoidMatch, occasions, stylingTips };
}
