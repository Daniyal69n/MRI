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
        <label className="block text-sm font-medium text-[#8c96a8] mb-1">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2.5 sm:py-2 min-h-[44px] sm:min-h-0 text-base border rounded-lg bg-[#090c11]/50 text-[#e7ebf1] focus:outline-none focus:ring-2 focus:ring-tissue-csf focus:border-transparent transition-all shadow-inner ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-[#232b38] hover:border-[#5b6576]'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-[#ff6b6b]">{error}</p>
      )}
    </div>
  );
};

