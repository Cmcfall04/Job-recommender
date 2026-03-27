import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: { source: string; count: number }[];
}

export default function SourceChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        No source data yet.
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.source.charAt(0).toUpperCase() + d.source.slice(1),
    jobs: d.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" fontSize={12} tick={{ fill: "#6b7280" }} />
        <YAxis fontSize={12} tick={{ fill: "#6b7280" }} />
        <Tooltip />
        <Bar dataKey="jobs" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
