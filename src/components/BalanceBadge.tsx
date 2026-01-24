import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/data';

interface BalanceBadgeProps {
  amount: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BalanceBadge({ amount, showLabel = true, size = 'md', className }: BalanceBadgeProps) {
  const isPositive = amount > 0;
  const isZero = amount === 0;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };
  
  if (isZero) {
    return (
      <span className={cn(
        'inline-flex items-center rounded-full font-medium bg-muted text-muted-foreground',
        sizeClasses[size],
        className
      )}>
        Settled up
      </span>
    );
  }
  
  return (
    <span className={cn(
      'inline-flex items-center rounded-full font-medium',
      isPositive ? 'bg-balance-positive-bg text-balance-positive' : 'bg-balance-negative-bg text-balance-negative',
      sizeClasses[size],
      className
    )}>
      {showLabel && (
        <span className="mr-1">{isPositive ? 'You get' : 'You owe'}</span>
      )}
      {formatCurrency(Math.abs(amount))}
    </span>
  );
}
