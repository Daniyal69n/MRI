import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface QuickActionButtonProps {
  href: string;
  icon: LucideIcon;
  label: string;
  variant?: 'primary' | 'outline';
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  href,
  icon: Icon,
  label,
  variant = 'primary',
}) => {
  return (
    <Link href={href} className="block">
      <Button
        variant={variant}
        size="lg"
        className="w-full shadow-md hover:shadow-xl transition-all duration-300 group"
      >
        <div className="flex items-center justify-center gap-3">
          <div className={`p-2 rounded-lg ${
            variant === 'primary' 
              ? 'bg-white/20 group-hover:bg-white/30' 
              : 'bg-blue-50 group-hover:bg-blue-100'
          } transition-colors`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="font-semibold">{label}</span>
        </div>
      </Button>
    </Link>
  );
};

