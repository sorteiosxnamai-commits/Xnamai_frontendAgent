import { cn } from '@/utils';
import { Radio } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showCompany?: boolean;
  className?: string;
}

const sizes = {
  sm: { icon: 'h-7 w-7', text: 'text-lg', sub: 'text-[10px]' },
  md: { icon: 'h-9 w-9', text: 'text-xl', sub: 'text-xs' },
  lg: { icon: 'h-11 w-11', text: 'text-2xl', sub: 'text-sm' },
};

export function Logo({ size = 'md', showText = true, showCompany = false, className }: LogoProps) {
  const s = sizes[size];
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className={cn('gradient-hero flex items-center justify-center rounded-xl text-white shadow-lg shadow-primary-600/30', s.icon)}>
        <Radio className="h-1/2 w-1/2" />
      </div>
      {showText && (
        <div>
          <span className={cn('font-bold tracking-tight text-gray-900 dark:text-white', s.text)}>
            Pulse<span className="text-primary-600">Desk</span>
          </span>
          {showCompany && (
            <p className={cn('text-gray-500 dark:text-gray-400', s.sub)}>by Tironitech</p>
          )}
        </div>
      )}
    </div>
  );
}
