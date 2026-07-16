import { cn } from '@/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showCompany?: boolean;
  className?: string;
}

const sizes = {
  sm: { icon: 'h-8 w-8', mark: 'h-5 w-5', text: 'text-[17px]', sub: 'text-[9px]' },
  md: { icon: 'h-9 w-9', mark: 'h-5 w-5', text: 'text-xl', sub: 'text-[10px]' },
  lg: { icon: 'h-11 w-11', mark: 'h-6 w-6', text: 'text-2xl', sub: 'text-xs' },
};

export function Logo({ size = 'md', showText = true, showCompany = false, className }: LogoProps) {
  const s = sizes[size];
  return (
    <div className={cn('flex items-center gap-2.5 leading-none', className)}>
      <div className={cn('flex items-center justify-center rounded-xl bg-[#0b1220] text-white shadow-md shadow-blue-600/20 ring-1 ring-white/15 dark:bg-white/10', s.icon)}>
        <svg viewBox="0 0 32 32" className={cn('drop-shadow-sm', s.mark)} aria-hidden="true">
          <rect x="3" y="3" width="26" height="26" rx="8" fill="url(#nitrus-badge-gradient)" />
          <path
            d="M18.5 6.5 9.4 17.2h6.1l-1.7 8.3 9.1-11.1h-6l1.6-7.9Z"
            fill="white"
            fillOpacity="0.96"
          />
          <path
            d="M18.5 6.5 9.4 17.2h6.1l-1.7 8.3 9.1-11.1h-6l1.6-7.9Z"
            fill="none"
            stroke="url(#nitrus-bolt-stroke)"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="nitrus-badge-gradient" x1="3" y1="3" x2="29" y2="29" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0B1220" />
              <stop offset="0.5" stopColor="#2563EB" />
              <stop offset="1" stopColor="#EF4444" />
            </linearGradient>
            <linearGradient id="nitrus-bolt-stroke" x1="9.4" y1="6.5" x2="22.9" y2="25.5" gradientUnits="userSpaceOnUse">
              <stop stopColor="#60A5FA" />
              <stop offset="0.48" stopColor="#2563EB" />
              <stop offset="1" stopColor="#EF4444" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col justify-center">
          <span className={cn('font-display font-black tracking-[0.02em] text-gray-950 dark:text-white', s.text)}>
            ChatBô
          </span>
          {showCompany && (
            <p className={cn('mt-0.5 font-semibold tracking-[0.08em] text-gray-500 dark:text-gray-400', s.sub)}>by Tironi Tech</p>
          )}
        </div>
      )}
    </div>
  );
}
