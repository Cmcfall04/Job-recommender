import { Briefcase, CheckCircle, AlertCircle, MinusCircle } from "lucide-react";
import type { DashboardStats } from "../types";

interface Props {
  stats: DashboardStats;
}

export default function StatsCards({ stats }: Props) {
  const cards = [
    {
      label: "Total Jobs",
      value: stats.total_jobs,
      icon: Briefcase,
      color: "text-gray-700",
      bg: "bg-gray-100",
    },
    {
      label: "Strong Matches",
      value: stats.strong_matches,
      icon: CheckCircle,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
    },
    {
      label: "Medium Matches",
      value: stats.medium_matches,
      icon: AlertCircle,
      color: "text-amber-700",
      bg: "bg-amber-50",
    },
    {
      label: "Low Matches",
      value: stats.low_matches,
      icon: MinusCircle,
      color: "text-red-700",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {card.value}
              </p>
            </div>
            <div className={`${card.bg} p-2.5 rounded-lg`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
