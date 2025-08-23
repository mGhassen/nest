import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  iconColor: "blue" | "amber" | "green" | "purple";
  change?: string;
  changeLabel?: string;
  changeType?: "positive" | "negative" | "neutral";
  loading?: boolean;
  isString?: boolean;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor,
  change,
  changeLabel,
  changeType = "neutral",
  loading = false,
  isString = false,
}: StatsCardProps) {
  const iconColorClasses = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
  };

  const changeColorClasses = {
    positive: "text-green-600",
    negative: "text-red-600",
    neutral: "text-gray-600",
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="mt-4">
          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {isString ? value : typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        <div className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center",
          iconColorClasses[iconColor]
        )}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {change && (
        <div className="mt-4 flex items-center text-sm">
          <span className={changeColorClasses[changeType]}>{change}</span>
          {changeLabel && (
            <span className="text-gray-600 ml-2">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
