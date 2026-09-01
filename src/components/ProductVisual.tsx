const JAR_COLORS: Record<string, { lid: string; body: string; label: string; badge: string }> = {
  clay: { lid: "#3E5429", body: "#8B4A2B", label: "#F6EFDD", badge: "#5C7A3F" },
  leaf: { lid: "#5C7A3F", body: "#C8973C", label: "#F6EFDD", badge: "#8B4A2B" },
  honey: { lid: "#A87A28", body: "#2B1B12", label: "#F6EFDD", badge: "#C8973C" },
  cream: { lid: "#A9C17A", body: "#F6EFDD", label: "#5C7A3F", badge: "#A9C17A" },
};

const BG_TINTS: Record<string, string> = {
  clay: "#EFE6CC",
  leaf: "#E3EFD8",
  honey: "#E6EAD4",
  cream: "#F1DCC9",
};

export default function ProductVisual({
  colorway = "clay",
  isBox = false,
  size = 100,
}: {
  colorway?: string;
  isBox?: boolean;
  size?: number;
}) {
  const c = JAR_COLORS[colorway] ?? JAR_COLORS.clay;
  const bg = BG_TINTS[colorway] ?? BG_TINTS.clay;

  return (
    <div
      className="flex h-full w-full items-center justify-center rounded-2xl"
      style={{ background: bg }}
    >
      {isBox ? (
        <svg viewBox="0 0 100 100" width={size}>
          <rect x="14" y="26" width="72" height="58" rx="6" fill={c.body} />
          <path d="M14 40h72M50 26v58" stroke={c.lid} strokeWidth="2" />
          <path d="M14 26l14-14h44l14 14" fill="none" stroke={c.lid} strokeWidth="3" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 100 110" width={size}>
          <rect x="14" y="6" width="72" height="12" rx="4" fill={c.lid} />
          <path d="M20 18 h60 v72 a10 10 0 01-10 10 h-40 a10 10 0 01-10-10z" fill={c.body} stroke={c.lid} strokeWidth="1.5" />
          <rect x="24" y="46" width="52" height="30" rx="3" fill={c.label} />
          <circle cx="50" cy="61" r="9" fill={c.badge} />
        </svg>
      )}
    </div>
  );
}
