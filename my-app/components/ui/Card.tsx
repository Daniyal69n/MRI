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
    <div className={`bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${className}`}>
      {(title || subtitle || headerAction) && (
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>
              {subtitle && (
                <p className="text-xs sm:text-sm text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
            {headerAction && <div className="flex-shrink-0">{headerAction}</div>}
          </div>
        </div>
      )}
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
};
