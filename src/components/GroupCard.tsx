import { Link } from 'react-router-dom';
import { ChevronRight, Users } from 'lucide-react';
import { Group, calculateGroupBalance, formatCurrency } from '@/lib/data';
import { MemberAvatar } from './MemberAvatar';
import { BalanceBadge } from './BalanceBadge';
import { cn } from '@/lib/utils';

interface GroupCardProps {
  group: Group;
  className?: string;
}

export function GroupCard({ group, className }: GroupCardProps) {
  const balance = calculateGroupBalance(group);
  const totalExpenses = group.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  return (
    <Link
      to={`/group/${group.id}`}
      className={cn(
        'block bg-card rounded-xl p-5 shadow-card border border-border/50',
        'hover:shadow-elevated hover:border-border transition-all duration-200',
        'animate-fade-in',
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-foreground mb-1">{group.name}</h3>
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <Users className="w-4 h-4" />
            <span>{group.members.length} members</span>
            <span className="mx-1">•</span>
            <span>{formatCurrency(totalExpenses)} total</span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground mt-1" />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {group.members.slice(0, 4).map((member) => (
            <MemberAvatar
              key={member.id}
              name={member.name}
              size="sm"
              className="ring-2 ring-card"
            />
          ))}
          {group.members.length > 4 && (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground ring-2 ring-card">
              +{group.members.length - 4}
            </div>
          )}
        </div>
        
        <BalanceBadge amount={balance} />
      </div>
    </Link>
  );
}
