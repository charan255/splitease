import { useState } from 'react';
import { X, Receipt, Check } from 'lucide-react';
import { Group, Member, currentUser, formatCurrency } from '@/lib/data';
import { MemberAvatar } from './MemberAvatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';

interface AddExpenseModalProps {
  group: Group;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (expense: {
    description: string;
    amount: number;
    paidBy: string;
    splitAmong: string[];
  }) => void;
}

export function AddExpenseModal({ group, isOpen, onClose, onAdd }: AddExpenseModalProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(currentUser.id);
  const [splitAmong, setSplitAmong] = useState<string[]>(group.members.map(m => m.id));
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  
  if (!isOpen) return null;
  
  const amountNum = parseFloat(amount) || 0;
  const perPersonAmount = splitAmong.length > 0 ? amountNum / splitAmong.length : 0;
  
  const toggleMember = (memberId: string) => {
    setSplitAmong(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description && amountNum > 0 && paidBy && splitAmong.length > 0) {
      onAdd({
        description,
        amount: amountNum,
        paidBy,
        splitAmong,
      });
      onClose();
      setDescription('');
      setAmount('');
      setPaidBy(currentUser.id);
      setSplitAmong(group.members.map(m => m.id));
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-card rounded-t-2xl sm:rounded-2xl shadow-modal max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add Expense</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this expense for?"
              className="h-12"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="h-12 pl-8 text-lg font-semibold"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <Label>Paid by</Label>
            <div className="flex flex-wrap gap-2">
              {group.members.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setPaidBy(member.id)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
                    paidBy === member.id
                      ? 'border-primary bg-accent'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <MemberAvatar name={member.name} size="sm" />
                  <span className="text-sm font-medium">
                    {member.id === currentUser.id ? 'You' : member.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Split among</Label>
              <div className="flex rounded-lg border border-border overflow-hidden">
                <button
                  type="button"
                  onClick={() => setSplitType('equal')}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium transition-colors',
                    splitType === 'equal' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  )}
                >
                  Equal
                </button>
                <button
                  type="button"
                  onClick={() => setSplitType('custom')}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium transition-colors',
                    splitType === 'custom' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  )}
                >
                  Custom
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              {group.members.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => toggleMember(member.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all',
                    splitAmong.includes(member.id)
                      ? 'border-primary bg-accent'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <div className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                    splitAmong.includes(member.id)
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground'
                  )}>
                    {splitAmong.includes(member.id) && (
                      <Check className="w-3 h-3 text-primary-foreground" />
                    )}
                  </div>
                  <MemberAvatar name={member.name} size="sm" />
                  <span className="flex-1 text-left font-medium">
                    {member.id === currentUser.id ? 'You' : member.name}
                  </span>
                  {splitAmong.includes(member.id) && amountNum > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(perPersonAmount)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <Button type="submit" className="w-full h-12 text-base" disabled={!description || amountNum <= 0 || splitAmong.length === 0}>
            <Receipt className="w-5 h-5 mr-2" />
            Add Expense
          </Button>
        </form>
      </div>
    </div>
  );
}
