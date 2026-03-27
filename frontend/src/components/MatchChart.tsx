import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface Props {
  data: { tier: string; count: number }[];
}

const TIER_COLORS: Record<string, string> = {
  strong: "#059669",
  medium: "#d97706",
  low: "#dc2626",
};

export default function MatchChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        No match data yet. Upload a resume and run a scan.
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.tier.charAt(0).toUpperCase() + d.tier.slice(1),
    value: d.count,
    fill: TIER_COLORS[d.tier] || "#6b7280",
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={index} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
