/**
 * AI 穿搭助手 API
 * 支持多种免费/低成本 AI API：
 * 1. Hugging Face Inference API (免费额度)
 * 2. Groq (免费)
 * 3. OpenRouter (有免费模型)
 */

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface AIConfig {
  provider: "huggingface" | "groq" | "openrouter" | "siliconflow" | "deepseek" | "mock";
  apiKey?: string;
  model?: string;
}

// 获取配置的 AI 服务商
export function getAIConfig(): AIConfig {
  if (typeof window === "undefined") {
    return { provider: "mock" };
  }

  // 从环境变量读取 DeepSeek API Key
  const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || "";
  
  // 如果环境变量未配置 API Key，使用 mock 模式
  if (!apiKey) {
    return { provider: "mock" };
  }

  // 使用 DeepSeek API
  localStorage.setItem("ai_fashion_provider", "deepseek");
  localStorage.setItem("ai_fashion_api_key", apiKey);
  localStorage.setItem("ai_fashion_model", "deepseek-chat");

  const provider = "deepseek";
  const model = "deepseek-chat";

  return { provider, apiKey, model };
}

// 保存 AI 配置
export function saveAIConfig(config: AIConfig) {
  if (typeof window === "undefined") return;
  localStorage.setItem("ai_fashion_provider", config.provider);
  if (config.apiKey) {
    localStorage.setItem("ai_fashion_api_key", config.apiKey);
  } else {
    localStorage.removeItem("ai_fashion_api_key");
  }
  if (config.model) {
    localStorage.setItem("ai_fashion_model", config.model);
  } else {
    localStorage.removeItem("ai_fashion_model");
  }
}

// 系统提示词构建 - 让 AI 扮演专业穿搭顾问
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function buildSystemPrompt(userProfile: {
  height: number;
  weight: number;
  bodyTags: string[];
  styleLikes: string[];
  avoidFabrics: string[];
  usualSize: string;
}): string {
  const bodyTagCN: Record<string, string> = {
    pear: "梨形身材",
    apple: "苹果型身材",
    hourglass: "沙漏型身材",
    petite: "小个子",
    curvy: "丰满身材",
    narrow_shoulder: "窄肩",
    o_legs: "O型腿",
  };

  const tagNames = userProfile.bodyTags.map(t => bodyTagCN[t] || t).join("、");

  return `你是一位专业的女装穿搭顾问，有10年女装搭配经验。你的目标是：
1. 根据用户的身材特点（${tagNames}）给出显瘦显气质的穿搭建议
2. 推荐适合的面料、版型和颜色
3. 针对不同场景（通勤、约会、校园、面试等）给出搭配方案
4. 回答尺码选择、显瘦技巧等问题
5. 考虑用户的偏好：喜欢 ${userProfile.styleLikes.join("、") || "简约风格"}
6. 避免的面料：${userProfile.avoidFabrics.join("、") || "无"}

回答风格：
- 专业但亲切，像闺蜜一样给出建议
- 适当使用 emoji 增加趣味性
- 建议要具体、可操作
- 如果需要可以给出单品搭配示例
- 可以适度调侃但不要打击用户自信心

用户基本信息：
- 身高：${userProfile.height}cm
- 体重：${userProfile.weight}kg
- 常用尺码：${userProfile.usualSize}
- 身材特点：${tagNames}`;
}

// 调用 Hugging Face API
async function callHuggingFace(
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[]
): Promise<string> {
  const response = await fetch(
    `https://api-inference.huggingface.co/models/${model}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: messages.map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n"),
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          return_full_text: false,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`HuggingFace API 错误: ${response.status}`);
  }

  const data = await response.json();
  if (Array.isArray(data) && data[0]?.generated_text) {
    return data[0].generated_text;
  }
  return String(data);
}

// 调用 Groq API
async function callGroq(
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[]
): Promise<string> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model || "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "你是专业女装穿搭顾问" },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ],
      max_tokens: 800,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API 错误: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "抱歉，AI 暂时无法回答这个问题。";
}

// 调用 OpenRouter API
async function callOpenRouter(
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[]
): Promise<string> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model || "openai/gpt-3.5-turbo",
      messages: [
        { role: "system", content: "你是专业女装穿搭顾问" },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ],
      max_tokens: 800,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API 错误: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "抱歉，AI 暂时无法回答这个问题。";
}

// 调用硅基流动 API
async function callSiliconFlow(
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[]
): Promise<string> {
  const response = await fetch("https://api.siliconflow.cn/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model || "Qwen/Qwen2-7B-Instruct",
      messages: [
        { role: "system", content: "你是专业女装穿搭顾问" },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ],
      max_tokens: 800,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`硅基流动 API 错误: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "抱歉，AI 暂时无法回答这个问题。";
}

// 调用 DeepSeek API
async function callDeepSeek(
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[]
): Promise<string> {
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model || "deepseek-chat",
      messages: [
        { role: "system", content: "你是专业女装穿搭顾问，说话要简洁自然，像朋友聊天一样，200字以内，不要用Markdown格式，不要用列表，用纯文字回答" },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ],
      max_tokens: 300,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API 错误: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "抱歉，AI 暂时无法回答这个问题。";
}

// Mock 响应 - 用于演示或未配置 API 时
function generateMockResponse(userMessage: string, profile: {
  height: number;
  weight: number;
  bodyTags: string[];
  styleLikes: string[];
}): string {
  const msg = userMessage.toLowerCase();

  if (msg.includes("通勤") || msg.includes("上班")) {
    return `通勤穿搭建议来啦！👗

根据你的身材特点，我推荐：

**上装**：收腰衬衫 + 西装外套
- 面料选棉质或羊毛混纺，透气又有型
- 西装肩线利落，能修饰你 ${profile.bodyTags.includes("pear") ? "胯部线条" : "身形"}

**下装**：高腰直筒裤
- 视觉显高 5-8cm
- 直筒版型显腿直

**鞋子**：乐福鞋或小低跟
- 舒适又通勤

💡 小技巧：把衬衫塞进高腰裤，再加一条细腰带，比例立刻变好！`;
  }

  if (msg.includes("约会") || msg.includes("裙子") || msg.includes("连衣裙")) {
    return `约会穿搭小心机来啦！💕

**连衣裙推荐**：
- 收腰 A 字裙 or 茶歇裙
- 长度到膝盖上方 5-10cm 最显瘦

**颜色建议**：
- 暖皮：珊瑚色、砖红色、酒红色
- 冷皮：雾霾蓝、薰衣草紫

**小心机**：
- V领显脸小
- 开衩设计显腿长
- 配个小项链，精致度 up！

想要具体链接？告诉我你喜欢的风格～`;
  }

  if (msg.includes("小个子") || msg.includes("矮") || msg.includes("显高")) {
    return `小个子显高穿搭秘籍来啦！👠

**黄金法则**：
1. 高腰！高腰！高腰！（重要的事说三遍）
2. 同色系搭配，视觉延伸
3. 竖条纹比横条纹显瘦

**单品推荐**：
- 高腰短裙/短裤
- 九分裤 + 露脚踝
- 短款上衣
- 厚底鞋/小猫跟

**显高神器**：
- 腰带（系在高腰位置）
- V领上衣
- 短发或高马尾

记住：不是穿得越高越好，而是让比例看起来更好！💪`;
  }

  if (msg.includes("梨形") || msg.includes("胯宽") || msg.includes("屁股")) {
    return `梨形身材穿搭攻略来啦！🍐

**上紧下松原则**：
- 上衣：修身的针织衫、衬衫、crop top
- 下装：A字裙、阔腿裤、直筒裤

**颜色搭配**：
- 上浅下深，视觉重心上移
- 深色下装更显瘦

**避雷单品**：
- ❌ 紧身牛仔裤
- ❌ 低腰裤
- ❌ 横条纹短裙

**显瘦技巧**：
1. 突出腰线，转移注意力
2. A字裙是梨形姐妹的救命单品！
3. 长度到膝盖上方或小腿肚都 OK

自信最美！这些单品帮你扬长避短～`;
  }

  if (msg.includes("苹果") || msg.includes("肚子") || msg.includes("腰粗")) {
    return `苹果型身材穿搭技巧来啦！🍎

**核心原则**：遮肚子、秀美腿

**推荐单品**：
- 宽松上衣（但不要太大）
- A字连衣裙
- 高腰阔腿裤
- 短款外套

**避雷单品**：
- ❌ 紧身衣
- ❌ 横条纹
- ❌ 露腰短上衣

**显瘦技巧**：
1. V领拉长脖颈，显脸小
2. 腰部有褶皱或飘带的款式
3. 外搭开衫，遮肉又优雅
4. 突出腿部线条（腿一般是好身材的姐妹！）

记住：露出最自信的部位，就是最好的穿搭！💃`;
  }

  if (msg.includes("面料") || msg.includes("舒服") || msg.includes("透气")) {
    return `面料选择指南来啦！🧵

**按季节选**：
- ☀️ 春夏：棉质、雪纺、亚麻、针织
- ❄️ 秋冬：羊毛、羊绒、灯芯绒

**按需求选**：
- 想要透气 → 亚麻、棉质
- 想要垂感 → 雪纺、人丝
- 想要高级 → 羊毛、羊绒
- 想要好打理 → 聚酯纤维混纺

**易踩雷面料**：
- 纯亚麻：易皱，需要熨烫
- 蕾丝：容易刮花
- 亮面PU：显胖风险高

你的皮肤比较敏感吗？或者有特别喜欢的触感？可以告诉我～`;
  }

  if (msg.includes("颜色") || msg.includes("显白") || msg.includes("黄皮")) {
    return `显白配色指南来啦！✨

**判断肤色小方法**：
手腕血管颜色：紫色/蓝色 → 冷皮，绿色 → 暖皮

**冷皮姐妹适合**：
- 💜 薰衣草紫
- 💙 雾霾蓝
- 🌸 玫瑰粉
- 💚 墨绿色

**暖皮姐妹适合**：
- 🧡 珊瑚橙
- 🤎 焦糖色
- 🧡 暖黄色
- 💛 芥末绿

**万能显白色**：
- 白色（纯白 or 米白）
- 雾霾蓝
- 酒红色

**显黑雷区**：
- 荧光色
- 过于鲜艳的橙色
- 全身黑色（可以加点亮色点缀）

你是什么肤色呀？`;
  }

  // 默认回复
  return `收到你的问题啦！💬

作为一个专业的穿搭顾问，我很乐意帮你解答：

- 通勤/职场穿搭
- 约会小心机
- 不同身材怎么扬长避短
- 面料怎么选
- 颜色怎么搭配
- 显瘦显高技巧

你可以这样问我：
👉 "我是梨形身材，怎么穿显瘦？"
👉 "小个子通勤穿什么？"
👉 "约会穿什么颜色显白？"

或者直接描述你的需求，我来帮你搭配！`;
}

// 发送消息并获取 AI 回复
export async function sendMessage(
  messages: { role: string; content: string }[],
  userProfile: {
    height: number;
    weight: number;
    bodyTags: string[];
    styleLikes: string[];
    avoidFabrics: string[];
    usualSize: string;
  }
): Promise<string> {
  const config = getAIConfig();

  try {
    switch (config.provider) {
      case "huggingface":
        if (!config.apiKey) throw new Error("未配置 HuggingFace API Key");
        return await callHuggingFace(
          config.apiKey,
          config.model || "mistralai/Mistral-7B-Instruct-v0.2",
          messages
        );

      case "groq":
        if (!config.apiKey) throw new Error("未配置 Groq API Key");
        return await callGroq(
          config.apiKey,
          config.model || "llama-3.1-8b-instant",
          messages
        );

      case "openrouter":
        if (!config.apiKey) throw new Error("未配置 OpenRouter API Key");
        return await callOpenRouter(
          config.apiKey,
          config.model || "openai/gpt-3.5-turbo",
          messages
        );

      case "siliconflow":
        if (!config.apiKey) throw new Error("未配置硅基流动 API Key");
        return await callSiliconFlow(
          config.apiKey,
          config.model || "Qwen/Qwen2-7B-Instruct",
          messages
        );

      case "deepseek":
        if (!config.apiKey) throw new Error("未配置 DeepSeek API Key");
        return await callDeepSeek(
          config.apiKey,
          config.model || "deepseek-chat",
          messages
        );

      case "mock":
      default:
        // 使用 mock 响应
        const lastUserMsg = messages.filter(m => m.role === "user").pop()?.content || "";
        return generateMockResponse(lastUserMsg, userProfile);
    }
  } catch (error) {
    // 返回错误信息，让 UI 显示给用户
    const errorMsg = error instanceof Error ? error.message : "未知错误";
    throw new Error(`AI 服务调用失败: ${errorMsg}`);
  }
}

// 快捷问题列表
export const QUICK_QUESTIONS = [
  { label: "通勤怎么穿？", icon: "💼", query: "我是苹果型身材，通勤怎么穿显瘦？" },
  { label: "约会穿搭", icon: "💕", query: "约会穿什么好看？有什么显白颜色推荐？" },
  { label: "小个子显高", icon: "👠", query: "小个子怎么穿显高？有什么单品推荐？" },
  { label: "面料怎么选", icon: "🧵", query: "春夏季节什么面料最舒服透气？" },
  { label: "梨形身材", icon: "🍐", query: "我是梨形身材，胯宽怎么穿？" },
  { label: "颜色搭配", icon: "🎨", query: "黄皮适合什么颜色？显白穿搭？" },
];

// 可用的免费 API 配置说明
export const API_PROVIDERS = [
  {
    id: "mock" as const,
    name: "模拟模式（演示用）",
    description: "内置预设回复，无需 API Key，适合体验功能",
    models: [],
    hasFreeTier: true,
  },
  {
    id: "groq" as const,
    name: "Groq",
    description: "提供免费 Llama 模型，速度快，支持中文",
    models: ["llama-3.1-8b-instant", "llama-3.1-70b-versatile"],
    hasFreeTier: true,
    signupUrl: "https://console.groq.com/",
  },
  {
    id: "huggingface" as const,
    name: "Hugging Face",
    description: "开源模型社区，有免费推理额度",
    models: ["mistralai/Mistral-7B-Instruct-v0.2", "meta-llama/Llama-3.2-1B-Instruct"],
    hasFreeTier: true,
    signupUrl: "https://huggingface.co/inference-api",
  },
  {
    id: "openrouter" as const,
    name: "OpenRouter",
    description: "聚合多个 AI 模型，有免费额度",
    models: ["openai/gpt-3.5-turbo", "anthropic/claude-3-haiku"],
    hasFreeTier: true,
    signupUrl: "https://openrouter.ai/",
  },
  {
    id: "siliconflow" as const,
    name: "硅基流动",
    description: "国内可用，兼容 OpenAI 格式，免费额度多",
    models: [
      "Qwen/Qwen2-7B-Instruct",
      "Qwen/Qwen1.5-7B-Chat",
      "THUDM/glm-4-9b-chat",
      "internlm/internlm2_5-7b-chat",
      "mistralai/Mistral-7B-Instruct-v0.2",
    ],
    hasFreeTier: true,
    signupUrl: "https://cloud.siliconflow.cn/",
  },
  {
    id: "deepseek" as const,
    name: "DeepSeek",
    description: "强大的推理模型，对话效果好",
    models: [
      "deepseek-chat",
      "deepseek-reasoner",
    ],
    hasFreeTier: false,
    signupUrl: "https://platform.deepseek.com/",
  },
];
