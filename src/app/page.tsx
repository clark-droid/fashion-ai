import Link from "next/link";

export default function HomePage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
      <section className="card-soft p-8 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">
          Womens AI Outfit
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-violet-950 md:text-4xl">
          专治女装网购尺码翻车
        </h1>
        <p className="mt-4 leading-relaxed text-stone-600">
          记录你的身高体重与体型标签，使用{" "}
          <span className="font-medium text-violet-800">
            规则引擎做尺码推算 + AI 智能穿搭建议
          </span>
          ；虚拟试穿先用「上身示意图 +
          关键标注」呈现版型适配度；AI 助手支持自然语言对话，可接入免费 API。
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/profile"
            className="rounded-2xl border border-violet-200 bg-white px-6 py-3 text-sm font-semibold text-violet-900 shadow-sm hover:bg-violet-50"
          >
            我的身材数据
          </Link>
          <Link
            href="/try-on"
            className="rounded-2xl border border-violet-200 bg-white px-6 py-3 text-sm font-semibold text-violet-900 shadow-sm hover:bg-violet-50"
          >
            虚拟试穿
          </Link>
          <Link
            href="/wardrobe"
            className="rounded-2xl border border-violet-200 bg-white px-6 py-3 text-sm font-semibold text-violet-900 shadow-sm hover:bg-violet-50"
          >
            智能衣橱筛选
          </Link>
        </div>
      </section>

      <aside className="card-soft flex flex-col gap-4 p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-violet-950">三分钟上手</h2>
        <ol className="list-inside list-decimal space-y-3 text-sm leading-relaxed text-stone-600">
          <li>
            先在「我的身材」录入尺码与体型标签（梨形 / 苹果型 / 小个子等）。
          </li>
          <li>
            「虚拟试穿」上传全身照与服装图；AI 智能分析适配度与尺码推荐。
          </li>
          <li>
            「场景穿搭」按通勤 / 约会 / 校园等场景给出女装搭配与显瘦技巧。
          </li>
          <li>
            「衣橱」支持按显瘦指数 / 版型 / 面料筛选，并可批量标注喜欢与否。
          </li>
        </ol>
      </aside>
    </div>
  );
}
