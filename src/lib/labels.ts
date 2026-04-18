import type { Fabric, Scene, Silhouette } from "@/lib/types";

export const FABRIC_CN: Record<Fabric, string> = {
  cotton: "棉",
  polyester: "涤纶",
  chiffon: "雪纺",
  knit: "针织",
  denim: "牛仔",
  linen: "亚麻",
  wool: "羊毛混纺",
};

export const SIL_CN: Record<Silhouette, string> = {
  loose: "宽松",
  fitted: "修身",
  straight: "直筒",
  cinched: "收腰",
  cropped: "短款",
  longline: "长款",
};

export const SCENE_CN: Record<Scene, string> = {
  commute: "职场通勤",
  campus: "校园上课",
  date: "约会聚餐",
  picnic: "户外野餐",
  interview: "求职面试",
  vacation: "度假出行",
  sport: "运动休闲",
  formal: "正式场合",
};

export const BODY_TAG_CN: Record<string, string> = {
  pear: "梨形",
  apple: "苹果型",
  hourglass: "沙漏型",
  petite: "小个子",
  curvy: "微胖",
  narrow_shoulder: "溜肩",
  o_legs: "O型腿",
};
