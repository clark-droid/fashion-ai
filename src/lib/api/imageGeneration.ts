/**
 * 硅基流动图像生成 API
 * 支持 Stable Diffusion 等模型
 */

export interface ImageGenerationResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

/**
 * 使用硅基流动生成穿搭效果图
 */
export async function generateTryOnImage(
  apiKey: string,
  personImageUrl: string,
  garmentDescription: string,
  bodyType: string
): Promise<ImageGenerationResult> {
  const prompt = `A beautiful Asian woman with ${bodyType} body type, wearing ${garmentDescription}. 
  Full body shot, professional fashion photography style, natural lighting, 
  high quality, fashion magazine cover style.`;

  try {
    const response = await fetch("https://api.siliconflow.cn/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "stabilityai/stable-diffusion-3-medium",
        prompt: prompt,
        image_size: "1024x1024",
        num_inference_steps: 30,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `图像生成失败: ${response.status} - ${errorText}`,
      };
    }

    const data = await response.json();
    
    if (data.data && data.data[0] && data.data[0].url) {
      return {
        success: true,
        imageUrl: data.data[0].url,
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
 * 构建设服装描述
 */
export function buildGarmentDescription(garment: {
  name: string;
  fabric: string;
  silhouette: string;
}): string {
  const fabricMap: Record<string, string> = {
    cotton: "cotton fabric",
    polyester: "polyester fabric",
    chiffon: "chiffon fabric",
    knit: "knit fabric",
    denim: "denim fabric",
    linen: "linen fabric",
    wool: "wool fabric",
  };

  const silhouetteMap: Record<string, string> = {
    loose: "loose fit",
    fitted: "fitted",
    straight: "straight cut",
    cinched: "cinched waist",
    cropped: "cropped length",
    longline: "longline style",
  };

  const fabric = fabricMap[garment.fabric] || garment.fabric;
  const silhouette = silhouetteMap[garment.silhouette] || garment.silhouette;

  return `${garment.name}, ${silhouette}, ${fabric}`;
}

/**
 * 获取体型描述（用于生成提示词）
 */
export function getBodyTypeDescription(bodyTags: string[]): string {
  if (bodyTags.includes("pear")) {
    return "pear-shaped body, narrower shoulders, wider hips";
  }
  if (bodyTags.includes("apple")) {
    return "apple-shaped body, wider waist, slimmer hips";
  }
  if (bodyTags.includes("hourglass")) {
    return "hourglass body shape, balanced proportions";
  }
  if (bodyTags.includes("petite")) {
    return "petite/small frame, shorter height";
  }
  if (bodyTags.includes("curvy")) {
    return "curvy body shape";
  }
  return "average female body";
}
