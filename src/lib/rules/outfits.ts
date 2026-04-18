import type { BodyProfile, BodyTag, OutfitTip, Scene } from "@/lib/types";

const ALL_SCENES: Scene[] = [
  "commute",
  "campus",
  "date",
  "picnic",
  "interview",
  "vacation",
  "sport",
  "formal",
];

export function listScenes(): Scene[] {
  return ALL_SCENES;
}

/**
 * 场景中文名映射
 */
export const SCENE_ICONS: Record<Scene, string> = {
  commute: "💼",
  campus: "📚",
  date: "💕",
  picnic: "🧺",
  interview: "🎯",
  vacation: "✈️",
  sport: "🏃",
  formal: "✨",
};

/**
 * 穿搭知识库 - 按场景分类
 */
const LIB: Record<Scene, OutfitTip[]> = {
  commute: [
    {
      title: "雾霾蓝西装 + 白色直筒裤",
      items: ["雾霾蓝羊毛混纺西装", "白色直筒九分裤", "浅色乐福鞋"],
      technique:
        "直筒裤拉长腿部直线；西装肩线利落，职场干练不显臃肿。雾霾蓝显气质又不沉闷。",
      fabrics: ["wool", "cotton"],
      silhouettes: ["straight", "longline"],
      bestFor: ["apple", "hourglass"],
      slimIndex: 4,
    },
    {
      title: "收腰衬衫 + 高腰阔腿裤",
      items: ["收腰衬衫", "高腰阔腿牛仔", "细腰带"],
      technique:
        "短款上衣 + 高腰阔腿 ≈ 视觉显高 8–10cm；阔腿遮住胯宽，优化梨形身材比例。",
      fabrics: ["cotton", "denim"],
      silhouettes: ["cinched", "longline"],
      bestFor: ["pear", "petite"],
      slimIndex: 5,
    },
    {
      title: "针织连衣裙 + 风衣",
      items: ["燕麦色针织连衣裙", "卡其色风衣", "裸靴"],
      technique:
        "针织裙修身但不勒，风衣遮胯又挡风，通勤舒适又得体。",
      fabrics: ["knit", "cotton"],
      silhouettes: ["fitted", "longline"],
      bestFor: ["pear", "hourglass", "curvy"],
      slimIndex: 4,
    },
    {
      title: "白衬衫 + 吸烟裤",
      items: ["经典白衬衫", "黑色吸烟裤", "乐福鞋"],
      technique:
        "经典不过时的通勤组合。衬衫解开两颗扣子更随性，塞进裤腰更干练。",
      fabrics: ["cotton", "polyester"],
      silhouettes: ["straight", "fitted"],
      bestFor: ["apple", "hourglass", "petite"],
      slimIndex: 3,
    },
  ],
  campus: [
    {
      title: "针织开衫 + A字短裙",
      items: ["燕麦色针织开衫", "灰蓝 A 字短裙", "小白鞋"],
      technique: "A 字裙摆平衡胯部；针织增加温柔感。适合春秋校园日常。",
      fabrics: ["knit", "cotton"],
      silhouettes: ["longline", "cropped"],
      bestFor: ["pear", "hourglass"],
      slimIndex: 4,
    },
    {
      title: "卫衣 + 百褶裙",
      items: ["米色连帽卫衣", "黑色百褶长裙", "帆布鞋"],
      technique: "上松下紧的经典校园风。百褶裙遮腿，百搭又显瘦。",
      fabrics: ["cotton", "knit"],
      silhouettes: ["loose", "longline"],
      bestFor: ["pear", "petite", "curvy"],
      slimIndex: 4,
    },
    {
      title: "衬衫 + 背带裤",
      items: ["条纹衬衫", "深色背带牛仔裤", "帆布鞋"],
      technique: "背带裤减龄又遮肉，内搭衬衫层次感十足。",
      fabrics: ["cotton", "denim"],
      silhouettes: ["loose", "straight"],
      bestFor: ["apple", "pear"],
      slimIndex: 3,
    },
    {
      title: "针织马甲 + 连衣裙",
      items: ["学院风针织马甲", "碎花连衣裙", "玛丽珍鞋"],
      technique: "叠穿增加层次，马甲收腰显瘦，碎花裙甜美可人。",
      fabrics: ["knit", "cotton"],
      silhouettes: ["loose", "cinched"],
      bestFor: ["hourglass", "petite"],
      slimIndex: 4,
    },
  ],
  date: [
    {
      title: "浅紫连衣裙 + 珍珠耳钉",
      items: ["浅紫收腰连衣裙", "浅色单鞋", "小号珍珠耳钉"],
      technique: "收腰连衣裙强调曲线；浅紫配色柔和耐看，约会好感度 UP！",
      fabrics: ["chiffon", "knit"],
      silhouettes: ["cinched", "longline"],
      bestFor: ["hourglass", "petite"],
      slimIndex: 5,
    },
    {
      title: "露肩毛衣 + 高腰裙",
      items: ["慵懒露肩毛衣", "黑色高腰迷你裙", "过膝靴"],
      technique: "露肩设计小性感，高腰裙拉长比例。适合初次约会或姐妹聚会。",
      fabrics: ["knit", "cotton"],
      silhouettes: ["loose", "cinched"],
      bestFor: ["hourglass", "curvy"],
      slimIndex: 4,
      avoidFor: ["apple"],
    },
    {
      title: "法式茶歇裙",
      items: ["碎花茶歇裙", "草编坡跟鞋", "草编包"],
      technique: "茶歇裙收腰+V领是显瘦神器，适合度假或浪漫约会。",
      fabrics: ["chiffon", "cotton"],
      silhouettes: ["cinched", "longline"],
      bestFor: ["pear", "hourglass", "petite"],
      slimIndex: 5,
    },
    {
      title: "缎面吊带裙 + 西装外套",
      items: ["香槟色缎面吊带裙", "黑色西装外套", "细带凉鞋"],
      technique: "娘 man 平衡的经典组合，正式中带点小性感。",
      fabrics: ["polyester", "chiffon"],
      silhouettes: ["loose", "longline"],
      bestFor: ["hourglass", "curvy"],
      slimIndex: 4,
    },
  ],
  picnic: [
    {
      title: "碎花裙 + 草编包",
      items: ["小碎花半身裙", "白T", "草编托特包"],
      technique: "上简下花，避免全身图案碎；半身裙显轻盈，野餐打卡超上镜。",
      fabrics: ["cotton", "chiffon"],
      silhouettes: ["longline", "loose"],
      bestFor: ["pear"],
      slimIndex: 4,
    },
    {
      title: "波点连衣裙 + 草帽",
      items: ["黑白波点连衣裙", "大檐草帽", "编织凉鞋"],
      technique: "波点复古俏皮，草帽遮阳又上镜。整套搭配充满春日气息。",
      fabrics: ["cotton", "polyester"],
      silhouettes: ["cinched", "longline"],
      bestFor: ["hourglass", "petite"],
      slimIndex: 4,
    },
    {
      title: "亚麻套装",
      items: ["白色亚麻衬衫", "卡其亚麻短裤", "草编穆勒鞋"],
      technique: "亚麻透气舒适，套装拍照超上镜。适合户外野餐或露营。",
      fabrics: ["linen", "cotton"],
      silhouettes: ["loose", "straight"],
      bestFor: ["petite", "apple"],
      slimIndex: 3,
    },
  ],
  interview: [
    {
      title: "驼色西装套 + 中跟裸色鞋",
      items: ["驼色修身西装", "同色西装裤", "裸色中跟鞋"],
      technique: "同色套装延伸纵向线条；中跟提升气场不夸张，专业感十足。",
      fabrics: ["wool", "polyester"],
      silhouettes: ["fitted", "straight"],
      bestFor: ["apple", "hourglass"],
      slimIndex: 4,
    },
    {
      title: "白衬衫 + 深色西裤",
      items: ["挺括白衬衫", "黑色九分西裤", "尖头高跟鞋"],
      technique: "经典面试着装。衬衫选有一定硬度的面料更显精神。",
      fabrics: ["cotton", "polyester"],
      silhouettes: ["straight", "fitted"],
      bestFor: ["apple", "pear", "hourglass"],
      slimIndex: 3,
    },
    {
      title: "藏青色连衣裙 + 西装外套",
      items: ["藏青收腰连衣裙", "灰色西装外套", "黑色高跟鞋"],
      technique: "套装感强，藏青色显白又稳重。适合金融、法律等严谨行业面试。",
      fabrics: ["polyester", "wool"],
      silhouettes: ["cinched", "longline"],
      bestFor: ["hourglass", "apple"],
      slimIndex: 4,
    },
    {
      title: "针织衫 + 铅笔裙",
      items: ["米白针织衫", "黑色铅笔裙", "小猫跟鞋"],
      technique: "温柔但不失专业感的组合。适合创意类或女性友好公司面试。",
      fabrics: ["knit", "polyester"],
      silhouettes: ["fitted", "straight"],
      bestFor: ["pear", "hourglass"],
      slimIndex: 4,
    },
  ],
  vacation: [
    {
      title: "亚麻衬衫 + 阔腿短裤",
      items: ["白色亚麻衬衫", "卡其阔腿短裤", "凉鞋"],
      technique: "亚麻透气但易皱，旅行随身小喷雾；阔腿短裤显腿直又凉快。",
      fabrics: ["linen", "cotton"],
      silhouettes: ["loose", "straight"],
      bestFor: ["petite", "hourglass"],
      slimIndex: 3,
    },
    {
      title: "热带印花连衣裙",
      items: ["热带植物印花长裙", "草编帽", "夹脚拖"],
      technique: "度假氛围感拉满，长裙遮肉又防晒，海边拍照超好看！",
      fabrics: ["cotton", "chiffon"],
      silhouettes: ["loose", "longline"],
      bestFor: ["pear", "curvy", "apple"],
      slimIndex: 4,
    },
    {
      title: "白 T + 印花半裙",
      items: ["纯白棉 T", "彩色印花半裙", "小白鞋"],
      technique: "上简下繁的搭配法则，平衡又有重点。适合城市漫游或购物。",
      fabrics: ["cotton"],
      silhouettes: ["loose", "longline"],
      bestFor: ["pear", "hourglass", "petite"],
      slimIndex: 4,
    },
    {
      title: "连体裤",
      items: ["工装风连体裤", "腰带", "马丁靴"],
      technique: "一件搞定全身搭配，工装风帅气又方便。适合户外或暴走旅行。",
      fabrics: ["cotton"],
      silhouettes: ["loose", "straight"],
      bestFor: ["apple", "curvy"],
      slimIndex: 3,
      avoidFor: ["pear"],
    },
  ],
  sport: [
    {
      title: "运动外套 + 鲨鱼裤",
      items: ["淡紫运动外套", "深灰鲨鱼裤", "复古跑鞋"],
      technique: "外松内紧显瘦；鲨鱼裤留意尴尬线，上衣略长更佳。",
      fabrics: ["knit", "polyester"],
      silhouettes: ["fitted", "cropped"],
      bestFor: ["apple", "curvy"],
      slimIndex: 4,
    },
    {
      title: "运动背心 + 高腰瑜伽裤",
      items: ["黑色运动背心", "高腰瑜伽裤", "运动鞋"],
      technique: "显瘦显身材的运动组合，高腰瑜伽裤收腹又提臀。",
      fabrics: ["polyester", "knit"],
      silhouettes: ["fitted", "cinched"],
      bestFor: ["hourglass", "pear"],
      slimIndex: 5,
      avoidFor: ["apple"],
    },
    {
      title: "宽松运动套装",
      items: ["灰色卫衣套装", "老爹运动鞋", "棒球帽"],
      technique: "舒适第一的懒人运动装，宽松遮肉不挑身材。",
      fabrics: ["cotton", "knit"],
      silhouettes: ["loose"],
      bestFor: ["apple", "curvy", "pear"],
      slimIndex: 3,
    },
  ],
  formal: [
    {
      title: "小黑裙 + 尖头鞋",
      items: ["雪纺小黑裙", "黑色尖头鞋", "金属耳饰"],
      technique: "小黑裙收腰位置决定比例；尖头鞋拉长脚背线条，正式场合不出错。",
      fabrics: ["chiffon", "polyester"],
      silhouettes: ["cinched", "longline"],
      bestFor: ["hourglass", "petite"],
      slimIndex: 5,
    },
    {
      title: "丝绒礼服裙",
      items: ["酒红色丝绒裙", "同色系手拿包", "细带高跟鞋"],
      technique: "丝绒高级感十足，酒红色显白又有气场。晚宴或年会必备。",
      fabrics: ["polyester"],
      silhouettes: ["cinched", "longline"],
      bestFor: ["hourglass", "curvy"],
      slimIndex: 5,
    },
    {
      title: "西装连体裤",
      items: ["黑色西装连体裤", "尖头高跟鞋", "手拿包"],
      technique: "连体裤气场强大，西装面料正式又不失女性魅力。",
      fabrics: ["polyester", "wool"],
      silhouettes: ["straight", "fitted"],
      bestFor: ["apple", "hourglass"],
      slimIndex: 4,
    },
    {
      title: "蕾丝上衣 + 阔腿裤",
      items: ["白色蕾丝上衣", "黑色阔腿裤", "裸色高跟鞋"],
      technique: "蕾丝增添女性柔美，阔腿裤气场十足，刚柔并济。",
      fabrics: ["chiffon", "polyester"],
      silhouettes: ["loose", "longline"],
      bestFor: ["pear", "hourglass", "petite"],
      slimIndex: 4,
    },
  ],
};

export function outfitsForScene(scene: Scene): OutfitTip[] {
  return LIB[scene] || [];
}

/**
 * 智能排序算法
 * - 优先匹配体型标签
 * - 考虑用户偏好（wantSlim、wantHideTummy、wantTaller）
 * - 排除避雷体型
 * - 综合评分
 */
export function rankOutfits(profile: BodyProfile, scene: Scene): OutfitTip[] {
  const items = outfitsForScene(scene);
  const tags = new Set(profile.bodyTags);

  return [...items]
    .map((item) => {
      let score = 0;
      const reasons: string[] = [];

      // 体型匹配度
      if (item.bestFor.some((t) => tags.has(t))) {
        score += 30;
        reasons.push("完美匹配你的体型");
      }

      // 避雷检查
      if (item.avoidFor && item.avoidFor.some((t: BodyTag) => tags.has(t))) {
        score -= 50;
        reasons.push("此穿搭可能不适合你的体型");
      }

      // 显瘦指数权重
      if (profile.wantSlim) {
        score += item.slimIndex * 5;
        if (item.slimIndex >= 4) {
          reasons.push(`显瘦指数 ${item.slimIndex}★`);
        }
      }

      // 遮小腹需求
      if (profile.wantHideTummy) {
        if (item.silhouettes.includes("loose") || item.silhouettes.includes("longline")) {
          score += 10;
          reasons.push("宽松版型遮小腹效果好");
        }
      }

      // 显高需求
      if (profile.wantTaller) {
        if (item.silhouettes.includes("cinched") || item.silhouettes.includes("longline")) {
          score += 10;
          reasons.push("收腰/长款有助于显高");
        }
      }

      // 面料偏好避雷
      if (profile.avoidFabrics.some((f) => item.fabrics.includes(f))) {
        score -= 15;
        reasons.push("包含你避雷的面料");
      }

      return { ...item, _score: score, _reasons: reasons };
    })
    .sort((a, b) => {
      // 避雷项优先排除
      const aAvoid = a.avoidFor?.some((t: BodyTag) => tags.has(t));
      const bAvoid = b.avoidFor?.some((t: BodyTag) => tags.has(t));
      if (aAvoid && !bAvoid) return 1;
      if (!aAvoid && bAvoid) return -1;

      // 按综合评分排序
      return b._score - a._score;
    });
}
