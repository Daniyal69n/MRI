import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  headerAction,
}) => {
  return (
    <div className={`glass-panel rounded-2xl transition-all duration-300 overflow-hidden ${className}`}>
      {(title || subtitle || headerAction) && (
        <div className="px-5 sm:px-7 py-4 sm:py-6 border-b border-slate-200 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-slate-800">{title}</h3>
              {subtitle && (
                <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
              )}
            </div>
            {headerAction && <div className="flex-shrink-0">{headerAction}</div>}
          </div>
        </div>
      )}
      <div className="p-5 sm:p-7">{children}</div>
    </div>
  );
};
