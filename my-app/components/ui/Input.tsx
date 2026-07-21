import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2.5 sm:py-2 min-h-[44px] sm:min-h-0 text-base border rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-mri-blue focus:border-transparent transition-all shadow-sm ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 hover:border-slate-400'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-[#ff6b6b]">{error}</p>
      )}
    </div>
  );
};

