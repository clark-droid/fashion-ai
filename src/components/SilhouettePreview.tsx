/** 身形示意图（非真实像素试衣） */
export function SilhouettePreview({
  pear,
  apple,
}: {
  pear?: boolean;
  apple?: boolean;
}) {
  return (
    <svg viewBox="0 0 120 240" className="h-full w-auto max-h-80 text-violet-300">
      <defs>
        <linearGradient id="skin" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#fde7f3" />
          <stop offset="100%" stopColor="#ddd6fe" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="28" rx="22" ry="24" fill="url(#skin)" />
      <path
        d="M38 52 Q60 42 82 52 L92 118 Q95 138 82 148 L82 228 L38 228 L38 148 Q26 138 28 118 Z"
        fill="url(#skin)"
        stroke="#c4b5fd"
        strokeWidth="1.5"
      />
      {/* 提示区域 */}
      <ellipse
        cx="60"
        cy="118"
        rx={apple ? 26 : pear ? 22 : 24}
        ry={apple ? 22 : pear ? 24 : 20}
        fill="none"
        stroke="#f472b6"
        strokeDasharray="4 4"
        opacity="0.85"
      />
      <text x="60" y="14" textAnchor="middle" fill="#7c3aed" fontSize="10">
        身形示意
      </text>
      {pear && (
        <text x="92" y="132" fill="#a855f7" fontSize="9">
          胯部
        </text>
      )}
      {apple && (
        <text x="92" y="118" fill="#a855f7" fontSize="9">
          腰腹
        </text>
      )}
    </svg>
  );
}
