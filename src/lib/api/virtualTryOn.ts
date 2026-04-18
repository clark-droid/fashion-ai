/**
 * 可选：调用外部「虚拟试穿」HTTP 接口（纯前端，需对方支持 CORS）
 *
 * 环境变量：
 * - NEXT_PUBLIC_VIRTUAL_TRYON_URL  例如 Hugging Face Gradio / 自建代理
 *
 * 约定请求：POST multipart/form-data
 *   - person: File（全身照）
 *   - garment: File（服装平铺/模特图）
 *
 * 约定响应（任选其一）：
 *   - JSON: { imageUrl: string } | { url: string } | { output: string }
 *   - 或返回 image/jpeg、image/png 二进制
 */

export type VirtualTryOnResult =
  | { ok: true; imageUrl: string }
  | { ok: false; message: string };

export async function callVirtualTryOnApi(
  personFile: File,
  garmentFile: File,
): Promise<VirtualTryOnResult> {
  const url =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_VIRTUAL_TRYON_URL?.trim()
      : "";

  if (!url) {
    return {
      ok: false,
      message:
        "未配置 NEXT_PUBLIC_VIRTUAL_TRYON_URL，当前使用示意图 + 规则分析模式",
    };
  }

  const fd = new FormData();
  fd.append("person", personFile);
  fd.append("garment", garmentFile);

  const res = await fetch(url, {
    method: "POST",
    body: fd,
  });

  if (!res.ok) {
    return { ok: false, message: `试穿接口错误：HTTP ${res.status}` };
  }

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const data = (await res.json()) as Record<string, unknown>;
    const imageUrl =
      (typeof data.imageUrl === "string" && data.imageUrl) ||
      (typeof data.url === "string" && data.url) ||
      (typeof data.output === "string" && data.output) ||
      "";
    if (imageUrl) return { ok: true, imageUrl };
    return { ok: false, message: "试穿接口返回 JSON 中未找到图片地址字段" };
  }

  const blob = await res.blob();
  const imageUrl = URL.createObjectURL(blob);
  return { ok: true, imageUrl };
}
