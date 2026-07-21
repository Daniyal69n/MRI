import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  asChild?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  asChild = false,
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[44px] sm:min-h-0';
  
  const variants = {
    primary: 'bg-gradient-to-r from-mri-blue to-mri-teal text-white hover:from-blue-700 hover:to-teal-600 shadow-[0_4px_14px_0_rgba(0,43,91,0.39)] hover:shadow-[0_6px_20px_rgba(0,168,150,0.23)] hover:-translate-y-0.5',
    secondary: 'bg-slate-700 text-white hover:bg-slate-600 shadow-md hover:shadow-lg hover:-translate-y-0.5',
    outline: 'border border-mri-blue/50 text-mri-blue bg-white/50 backdrop-blur-sm hover:bg-mri-blue/5 hover:border-mri-blue hover:shadow-[0_0_15px_rgba(0,43,91,0.2)] hover:-translate-y-0.5',
    ghost: 'text-slate-600 hover:text-mri-blue hover:bg-slate-100/50 hover:-translate-y-0.5',
  };
  
  const sizes = {
    sm: 'px-3 py-2 sm:py-1.5 text-sm',
    md: 'px-4 py-2.5 sm:py-2 text-base',
    lg: 'px-6 py-3 text-base sm:text-lg',
  };
  
  const buttonClasses = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      className: `${buttonClasses} ${(children.props as any).className || ''}`,
    } as any);
  }
  
  return (
    <button
      className={buttonClasses}
      {...props}
    >
      {children}
    </button>
  );
};

