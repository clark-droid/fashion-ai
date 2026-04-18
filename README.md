# 女装专属 AI 穿搭 Demo（Next.js）

基于思路参考 [fengjiabin43/ai-outfit-demo](https://github.com/fengjiabin43/ai-outfit-demo)（上游为 **Vite + React**），本项目为 **女装向**重写：**Next.js 14 App Router + Tailwind**，纯前端，`localStorage` 持久化，尺码/场景/试穿分析均走 **规则引擎**。

## 快速开始

```bash
cd womens-ai-outfit-demo
npm install
npm run dev
```

浏览器打开 `http://localhost:3000`。

## 功能一览

| 路由 | 说明 |
|------|------|
| `/` | 首页导航 |
| `/profile` | 身材档案（体型多选、偏好、避雷面料/版型） |
| `/try-on` | 虚拟试穿（可选外部 API；默认示意图 + 规则标注）、尺码表 JSON、试穿反馈 |
| `/outfits` | 场景穿搭（通勤/约会/校园等），按体型排序 |
| `/wardrobe` | 衣橱筛选 + 批量标注 |

## 可选：虚拟试穿 API

复制 `.env.example` 为 `.env.local`，填写 `NEXT_PUBLIC_VIRTUAL_TRYON_URL`。约定见 `src/lib/api/virtualTryOn.ts`。

未配置时自动使用 **方案 A**：身形示意图 + 适配度 / 风险提示文案。

## 构建

```bash
npm run build && npm start
```
