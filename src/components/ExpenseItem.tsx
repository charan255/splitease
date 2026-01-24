import { Receipt, Utensils, Car, Tv, Zap, MoreHorizontal } from 'lucide-react';
import { Expense, getMemberById, formatCurrency, formatDate, currentUser } from '@/lib/data';
import { MemberAvatar } from './MemberAvatar';
import { cn } from '@/lib/utils';

interface ExpenseItemProps {
  expense: Expense;
  className?: string;
}

const categoryIcons = {
  food: Utensils,
  transport: Car,
  entertainment: Tv,
  utilities: Zap,
  other: Receipt,
};

const categoryColors = {
  food: 'bg-amber-100 text-amber-600',
  transport: 'bg-blue-100 text-blue-600',
  entertainment: 'bg-violet-100 text-violet-600',
  utilities: 'bg-emerald-100 text-emerald-600',
  other: 'bg-muted text-muted-foreground',
};

export function ExpenseItem({ expense, className }: ExpenseItemProps) {
  const paidByMember = getMemberById(expense.paidBy);
  const Icon = categoryIcons[expense.category];
  const yourShare = expense.amount / expense.splitAmong.length;
  const paidByYou = expense.paidBy === currentUser.id;
  const involvedYou = expense.splitAmong.includes(currentUser.id);
  
  let balanceText = '';
  let balanceClass = '';
  
  if (paidByYou) {
    const othersShare = expense.amount - yourShare;
    balanceText = `You lent ${formatCurrency(othersShare)}`;
    balanceClass = 'text-balance-positive';
  } else if (involvedYou) {
    balanceText = `You owe ${formatCurrency(yourShare)}`;
    balanceClass = 'text-balance-negative';
  }
  
  return (
    <div className={cn(
      'flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors',
      className
    )}>
      <div className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center',
        categoryColors[expense.category]
      )}>
        <Icon className="w-5 h-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{expense.description}</p>
        <p className="text-sm text-muted-foreground">
          {paidByMember?.id === currentUser.id ? 'You' : paidByMember?.name} paid • {formatDate(expense.date)}
        </p>
      </div>
      
      <div className="text-right">
        <p className="font-semibold text-foreground">{formatCurrency(expense.amount)}</p>
        {balanceText && (
          <p className={cn('text-sm font-medium', balanceClass)}>{balanceText}</p>
        )}
      </div>
    </div>
  );
}
