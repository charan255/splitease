import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Users, Receipt, ArrowRightLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { Header } from '@/components/Header';
import { MemberAvatar } from '@/components/MemberAvatar';
import { BalanceBadge } from '@/components/BalanceBadge';
import { ExpenseItem } from '@/components/ExpenseItem';
import { SettlementCard } from '@/components/SettlementCard';
import { AddExpenseModal } from '@/components/AddExpenseModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { groups, calculateMemberBalances, calculateOptimizedSettlements, getMemberById, formatCurrency, currentUser } from '@/lib/data';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function GroupDetails() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [showAllMembers, setShowAllMembers] = useState(false);
  
  const group = groups.find(g => g.id === id);
  
  if (!group) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Group not found</p>
      </div>
    );
  }
  
  const memberBalances = calculateMemberBalances(group);
  const settlements = calculateOptimizedSettlements(group);
  const displayedMembers = showAllMembers ? group.members : group.members.slice(0, 4);
  
  const handleAddExpense = (expense: {
    description: string;
    amount: number;
    paidBy: string;
    splitAmong: string[];
  }) => {
    toast({
      title: 'Expense added',
      description: `${expense.description} - ${formatCurrency(expense.amount)}`,
    });
  };
  
  const handlePay = () => {
    toast({
      title: 'Opening UPI...',
      description: 'This is a demo. In production, this would open your UPI app.',
    });
  };
  
  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title={group.name} showBack />
      
      <main className="container max-w-lg mx-auto px-4 py-6">
        {/* Members Section */}
        <section className="mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-semibold">Members</h2>
            </div>
            <span className="text-sm text-muted-foreground">{group.members.length} people</span>
          </div>
          
          <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
            <div className="divide-y divide-border">
              {displayedMembers.map((member) => {
                const balance = memberBalances.find(b => b.memberId === member.id);
                const isCurrentUser = member.id === currentUser.id;
                
                return (
                  <div key={member.id} className="flex items-center gap-3 p-4">
                    <MemberAvatar name={member.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {isCurrentUser ? 'You' : member.name}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">{member.phone}</p>
                    </div>
                    {!isCurrentUser && balance && (
                      <BalanceBadge amount={balance.amount} size="sm" />
                    )}
                  </div>
                );
              })}
            </div>
            
            {group.members.length > 4 && (
              <button
                onClick={() => setShowAllMembers(!showAllMembers)}
                className="w-full flex items-center justify-center gap-1.5 py-3 text-sm font-medium text-primary hover:bg-accent transition-colors"
              >
                {showAllMembers ? (
                  <>
                    Show less
                    <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Show all {group.members.length} members
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </section>
        
        {/* Tabs for Expenses and Settlements */}
        <Tabs defaultValue="expenses" className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger value="expenses" className="gap-2">
              <Receipt className="w-4 h-4" />
              Expenses
            </TabsTrigger>
            <TabsTrigger value="settlements" className="gap-2">
              <ArrowRightLeft className="w-4 h-4" />
              Settle Up
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="expenses" className="mt-0">
            <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
              {group.expenses.length > 0 ? (
                <div className="divide-y divide-border">
                  {group.expenses.map((expense) => (
                    <ExpenseItem key={expense.id} expense={expense} />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Receipt className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground">No expenses yet</p>
                  <p className="text-sm text-muted-foreground/70">Add your first expense to get started</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="settlements" className="mt-0 space-y-4">
            {settlements.length > 0 ? (
              <>
                <div className="bg-accent/50 rounded-lg px-4 py-3">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{settlements.length} payment{settlements.length !== 1 ? 's' : ''}</span> needed to settle all balances
                  </p>
                </div>
                
                {settlements.map((settlement, index) => (
                  <SettlementCard
                    key={index}
                    settlement={settlement}
                    onPay={handlePay}
                  />
                ))}
              </>
            ) : (
              <div className="bg-card rounded-xl shadow-card border border-border/50 p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-balance-positive-bg flex items-center justify-center mx-auto mb-3">
                  <ArrowRightLeft className="w-6 h-6 text-balance-positive" />
                </div>
                <p className="font-medium text-foreground">All settled up!</p>
                <p className="text-sm text-muted-foreground">No pending settlements in this group</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Add Expense FAB */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4">
        <Button size="lg" className="shadow-elevated gap-2 px-8" onClick={() => setShowModal(true)}>
          <Plus className="w-5 h-5" />
          Add Expense
        </Button>
      </div>
      
      <AddExpenseModal
        group={group}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAdd={handleAddExpense}
      />
    </div>
  );
}
