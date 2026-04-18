# 女装专属 AI 穿搭 Demo（Next.js）

基于 **Next.js 14 App Router + Tailwind CSS**，纯前端项目，`localStorage` 持久化，支持尺码分析、场景穿搭推荐和虚拟试穿功能。

## 快速开始

```bash
npm install
npm run dev
```

浏览器打开 `http://localhost:3000`。

## 功能一览

| 路由 | 说明 |
:|------|------|
| `/` | 首页导航 |
| `/profile` | 身材档案（体型多选、偏好、避雷面料/版型） |
| `/try-on` | 虚拟试穿、尺码表 JSON、试穿反馈 |
| `/outfits` | 场景穿搭（通勤/约会/校园等），按体型排序 |
| `/wardrobe` | 衣橱筛选 + 批量标注 |

## 配置 API（如需虚拟试穿图像生成）

复制 `.env.example` 为 `.env.local`，填入你的 API 密钥。

## 构建

```bash
npm run build && npm start
```
