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
    'bg-blue-500': 'from-mri-blue to-mri-teal',
    'bg-yellow-500': 'from-amber-400 to-orange-500',
    'bg-green-500': 'from-emerald-400 to-mri-cyan',
    'bg-purple-500': 'from-indigo-500 to-purple-600',
  };

  const gradientClass = colorClasses[color as keyof typeof colorClasses] || 'from-gray-500 to-gray-600';

  return (
    <div className="glass-panel group relative overflow-hidden rounded-xl sm:rounded-2xl transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 opacity-50" />
      <div className="relative p-5 sm:p-7">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              {label}
            </p>
            <div className="flex flex-wrap items-baseline gap-2">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-800">{value}</p>
              {trend && (
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                  trend.isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
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
          <div className={`bg-gradient-to-br ${gradientClass} p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.1)] group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-[0_0_20px_rgba(0,0,0,0.2)] transition-all duration-300 flex-shrink-0`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};
