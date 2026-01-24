import { ArrowRight, Send } from 'lucide-react';
import { Settlement, getMemberById, formatCurrency, currentUser } from '@/lib/data';
import { MemberAvatar } from './MemberAvatar';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface SettlementCardProps {
  settlement: Settlement;
  onPay?: () => void;
  className?: string;
}

export function SettlementCard({ settlement, onPay, className }: SettlementCardProps) {
  const fromMember = getMemberById(settlement.from);
  const toMember = getMemberById(settlement.to);
  const isYouPaying = settlement.from === currentUser.id;
  const isYouReceiving = settlement.to === currentUser.id;
  
  return (
    <div className={cn(
      'bg-card rounded-xl p-4 shadow-card border border-border/50',
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <MemberAvatar name={fromMember?.name || ''} size="md" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">
              {isYouPaying ? 'You' : fromMember?.name}
            </p>
            <p className="text-sm text-muted-foreground">pays</p>
          </div>
        </div>
        
        <ArrowRight className="w-5 h-5 text-muted-foreground mx-3" />
        
        <div className="flex items-center gap-3 flex-1 justify-end">
          <div className="flex-1 min-w-0 text-right">
            <p className="font-medium text-foreground truncate">
              {isYouReceiving ? 'You' : toMember?.name}
            </p>
            <p className="text-sm text-muted-foreground">receives</p>
          </div>
          <MemberAvatar name={toMember?.name || ''} size="md" />
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <p className="text-xl font-semibold text-foreground">
          {formatCurrency(settlement.amount)}
        </p>
        
        {isYouPaying && (
          <Button onClick={onPay} className="gap-2">
            <Send className="w-4 h-4" />
            Pay via UPI
          </Button>
        )}
        
        {isYouReceiving && (
          <Button variant="outline" className="gap-2">
            Send Reminder
          </Button>
        )}
      </div>
    </div>
  );
}
