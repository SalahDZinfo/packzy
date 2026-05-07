import { TrendingDown } from 'lucide-react';

interface SavingsBadgeProps {
  amount: number | string;
  percentage?: number | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SavingsBadge({
  amount,
  percentage,
  size = 'md',
  className = '',
}: SavingsBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-lg bg-accent text-accent-foreground font-bold ${sizeClasses[size]} ${className}`}
    >
      <TrendingDown className={iconSize[size]} />
      <span>
        {typeof amount === 'number' ? `$${amount.toFixed(2)}` : amount}
        {percentage && ` (${percentage}%)`}
      </span>
    </div>
  );
}
