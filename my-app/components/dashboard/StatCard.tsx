import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  color,
  trend,
}) => {
  const colorClasses = {
    'bg-blue-500': 'from-blue-500 to-blue-600',
    'bg-yellow-500': 'from-amber-500 to-amber-600',
    'bg-green-500': 'from-emerald-500 to-emerald-600',
    'bg-purple-500': 'from-purple-500 to-purple-600',
  };

  const gradientClass = colorClasses[color as keyof typeof colorClasses] || 'from-gray-500 to-gray-600';

  return (
    <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 opacity-50" />
      <div className="relative p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              {label}
            </p>
            <div className="flex flex-wrap items-baseline gap-2">
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{value}</p>
              {trend && (
                <div className={`flex items-center gap-1 text-xs font-semibold ${
                  trend.isPositive ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {trend.isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{trend.value}</span>
                </div>
              )}
            </div>
          </div>
          <div className={`bg-gradient-to-br ${gradientClass} p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
        </div>
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full bg-gradient-to-r ${gradientClass} rounded-full`} style={{ width: '75%' }} />
        </div>
      </div>
    </div>
  );
};
