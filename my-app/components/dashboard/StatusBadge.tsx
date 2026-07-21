import React from 'react';

interface StatusBadgeProps {
  status: 'Completed' | 'Processing' | 'Pending' | 'Failed';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusStyles = {
    Completed: 'bg-emerald-100/80 text-emerald-700 border-emerald-200/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
    Processing: 'bg-amber-100/80 text-amber-700 border-amber-200/50 shadow-[0_0_10px_rgba(245,158,11,0.2)] animate-pulse',
    Pending: 'bg-slate-100/80 text-slate-700 border-slate-200/50',
    Failed: 'bg-rose-100/80 text-rose-700 border-rose-200/50 shadow-[0_0_10px_rgba(244,63,94,0.2)]',
  };

  return (
    <span
      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${
        statusStyles[status]
      }`}
    >
      {status}
    </span>
  );
};

