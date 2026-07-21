import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
}

export const PageHeader = ({ title, description, icon: Icon, action }: PageHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
      <div className="min-w-0">
        <div className="flex items-center gap-3 mb-1 sm:mb-2">
          {Icon && (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-mri-blue/10 to-mri-cyan/10 text-mri-blue ring-1 ring-mri-blue/20 shadow-sm shrink-0">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-800 tracking-tight">{title}</h1>
        </div>
        {description && (
          <p className="text-sm sm:text-base text-slate-500 font-medium ml-15">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};
