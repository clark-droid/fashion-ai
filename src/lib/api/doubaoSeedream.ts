/**
 * 豆包 seedDream 图像生成 API（火山方舟 ARK）
 * 文档：https://www.volcengine.com/docs/82379/1824121
 */

export interface DoubaoImageResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export interface ImageAnalysisResult {
  fitScore: number;           // 适配分 0-100
  slimIndex: number;          // 显瘦指数 1-5
  waistPlacement: string;     // 腰头位置
  hemFeel: string;            // 下摆垂坠
  hipVisual: string;          // 胯部视觉
  shoulderVisual: string;     // 肩线视觉
  annotations: string[];      // 分析注释
  risks: string[];            // 风险提示
  overallComment: string;     // 整体评价
}

/**
 * 调用豆包 seedDream 生成虚拟试穿图
 */
export async function generateTryOnImageWithDoubao(
  apiKey: string,
  personImageUrl: string,
  garmentImageUrl: string,
  model: string = "doubao-seedream-5-0-260128"
): Promise<DoubaoImageResult> {
  const prompt = "将图1的人物穿上图2的服装";

  try {
    const response = await fetch("https://ark.cn-beijing.volces.com/api/v3/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        image: [personImageUrl, garmentImageUrl],
        sequential_image_generation: "disabled",
        response_format: "url",
        size: "2K",
        stream: false,
        watermark: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `豆包 API 错误: ${response.status} - ${errorText}`,
      };
    }

    const data = await response.json();

    if (data.data && data.data[0] && data.data[0].url) {
      return {
        success: true,
        imageUrl: data.data[0].url,
      };
    }

    if (data.data && data.data[0] && data.data[0].b64_json) {
      const base64Image = `data:image/png;base64,${data.data[0].b64_json}`;
      return {
        success: true,
        imageUrl: base64Image,
      };
    }

    return {
      success: false,
      error: "图像生成返回格式错误",
    };
  } catch (error) {
    return {
      success: false,
      error: `网络错误: ${error instanceof Error ? error.message : "未知错误"}`,
    };
  }
}

/**
 * 调用豆包视觉理解 API 分析试穿效果图
 * 分析服装穿在人物身上的效果
 */
export async function analyzeTryOnImageWithDoubao(
  apiKey: string,
  tryOnImageUrl: string,
  userProfile: {
    heightCm: number;
    weightKg: number;
    bodyTags: string[];
  }
): Promise<ImageAnalysisResult> {
  const bodyTagCN: Record<string, string> = {
    pear: "梨形身材",
    apple: "苹果型身材",
    hourglass: "沙漏型身材",
    petite: "小个子",
    curvy: "微胖身材",
    narrow_shoulder: "窄肩",
    o_legs: "O型腿",
  };

  const tags = userProfile.bodyTags.map(t => bodyTagCN[t] || t).join("、");

  const prompt = `你是一位专业女装穿搭分析师。请仔细分析这张虚拟试穿效果图（图1是原始人物，图2是试穿效果）。

用户信息：身高${userProfile.heightCm}cm，体重${userProfile.weightKg}kg，身材特点：${tags || "普通身材"}

请用JSON格式返回分析结果：
{
  "fitScore": 适配分(0-100，基于衣服是否合身、是否显瘦、整体效果),
  "slimIndex": 显瘦指数(1-5星),
  "waistPlacement": "腰头位置描述（如：高腰位置合适/腰线略低/腰头偏上等）",
  "hemFeel": "下摆垂坠感描述（如：自然垂落/略翘/刚好到膝盖等）",
  "hipVisual": "胯部视觉效果（如：不显胯/略微包臀/正好等）",
  "shoulderVisual": "肩线视觉效果（如：肩线利落/略宽/正合适等）",
  "annotations": ["分析要点1", "分析要点2", "分析要点3"],
  "risks": ["风险提示1", "风险提示2"],
  "overallComment": "整体评价和建议（30字以内）"
}

请只返回JSON，不要有其他文字。`;

  try {
    const response = await fetch("https://ark.cn-beijing.volces.com/api/v3/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "doubao-pro-32k",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: tryOnImageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`视觉分析 API 错误: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";

    // 尝试解析 JSON
    try {
      // 清理可能的 markdown 代码块
      const jsonStr = content.replace(/```json\n?|```\n?/g, "").trim();
      const result = JSON.parse(jsonStr);
      return result;
    } catch {
      // JSON 解析失败，返回默认分析
      return {
        fitScore: 75,
        slimIndex: 3,
        waistPlacement: "腰线位置适中",
        hemFeel: "下摆自然",
        hipVisual: "胯部效果正常",
        shoulderVisual: "肩线合适",
        annotations: ["AI分析结果解析失败，请查看图片自行判断"],
        risks: [],
        overallComment: "请根据实际试穿效果自行判断",
      };
    }
  } catch (error) {
    console.error("视觉分析 API 调用失败:", error);
    // 返回默认分析结果
    return {
      fitScore: 75,
      slimIndex: 3,
      waistPlacement: "腰线位置适中",
      hemFeel: "下摆自然",
      hipVisual: "胯部效果正常",
      shoulderVisual: "肩线合适",
      annotations: ["视觉分析API调用失败"],
      risks: [],
      overallComment: "请根据实际效果判断",
    };
  }
}

/**
 * 将 File 对象转换为 base64 字符串
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * 将 File 对象转换为公开可访问的 URL
 */
export async function fileToDataUrl(file: File): Promise<string> {
  return fileToBase64(file);
}
