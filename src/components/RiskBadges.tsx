import type { RiskTag } from "@/lib/types";
import { levelToClass } from "@/lib/rules/sizeAndRisk";

export function RiskBadges({ risks }: { risks: RiskTag[] }) {
  if (!risks.length) return null;
  return (
    <ul className="mt-2 flex flex-wrap gap-2">
      {risks.map((r, i) => (
        <li
          key={`${r.text}-${i}`}
          className={`rounded-full border px-2.5 py-1 text-xs ${levelToClass(r.level)}`}
        >
          {r.level === "high" && "● "}
          {r.level === "warn" && "▲ "}
          {r.text}
        </li>
      ))}
    </ul>
  );
}
