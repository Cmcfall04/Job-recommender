import clsx from "clsx";

interface Props {
  tier: string | null;
  score: number | null;
}

export default function MatchBadge({ tier, score }: Props) {
  if (!tier) return <span className="text-gray-400 text-sm">--</span>;

  const styles = {
    strong: "bg-emerald-50 text-emerald-700 border-emerald-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    low: "bg-red-50 text-red-700 border-red-200",
  };

  const style = styles[tier as keyof typeof styles] || styles.low;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border",
        style
      )}
    >
      {tier.charAt(0).toUpperCase() + tier.slice(1)}
      {score !== null && (
        <span className="opacity-70">({Math.round(score * 100)}%)</span>
      )}
    </span>
  );
}
