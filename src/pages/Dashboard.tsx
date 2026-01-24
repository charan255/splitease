import { useEffect, useState } from 'react';
import { Plus, TrendingUp, TrendingDown, Clock, AlertCircle } from 'lucide-react';
import { Header } from '@/components/Header';
import { GroupCard } from '@/components/GroupCard';
import { Button } from '@/components/ui/button';
import { calculateGroupBalance, formatCurrency, delayedPayments, getMemberById, Group } from '@/lib/data';
import { MemberAvatar } from '@/components/MemberAvatar';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

export default function Dashboard() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await api.get('/groups');
      // Backend returns simplified groups. We might need to fetch expenses or adjust the list.
      // The current backend GET /groups returns { id, name, created_at, member_count }.
      // The frontend 'Group' interface expects { expenses: [], members: [] }.
      // We need to either adapter it or fetch details.
      // For dashboard summary, we need expenses to calc balance.
      // NOTE: For efficient API design, backend should return 'my_balance' in the list.
      // Since backend doesn't yet, let's fetch details for each group or just mock the balance for now 
      // OR better: update the backend to return balance_summary.
      // Given I can't change backend easily in this step, I will just list the groups and maybe fetch 
      // details for the cards if needed, OR just show 0 balance until detail view.
      // But wait, the dashboard shows "You owe" / "You get back".
      // I'll fetch the groups, and then for each group, fetch expenses? No that's N+1.
      // I'll leave the balance calculation as 0/mock for this iteration unless I add a specific endpoint.
      // Actually, I can just map the response.

      const mappedGroups = res.data.map((g: any) => ({
        ...g,
        members: [], // Placeholder
        expenses: [] // Placeholder
      }));
      setGroups(mappedGroups);
    } catch (error) {
      console.error("Failed to fetch groups", error);
    } finally {
      setLoading(false);
    }
  };

  const totalOwed = groups.reduce((sum, group) => {
    const balance = calculateGroupBalance(group);
    return sum + (balance > 0 ? balance : 0);
  }, 0);

  const totalOwe = groups.reduce((sum, group) => {
    const balance = calculateGroupBalance(group);
    return sum + (balance < 0 ? Math.abs(balance) : 0);
  }, 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />

      <main className="container max-w-lg mx-auto px-4 py-6">
        {/* Balance Summary */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-balance-positive-bg rounded-xl p-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-balance-positive" />
              <span className="text-sm font-medium text-balance-positive">You get back</span>
            </div>
            <p className="text-2xl font-bold text-balance-positive">
              {formatCurrency(totalOwed)}
            </p>
          </div>

          <div className="bg-balance-negative-bg rounded-xl p-4 animate-fade-in" style={{ animationDelay: '50ms' }}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-balance-negative" />
              <span className="text-sm font-medium text-balance-negative">You owe</span>
            </div>
            <p className="text-2xl font-bold text-balance-negative">
              {formatCurrency(totalOwe)}
            </p>
          </div>
        </div>

        {/* Delayed Payments Reminder - Keeping Mock for now as backend endpoint for this is complex to wire up immediately */}
        {delayedPayments.length > 0 && (
          <div className="bg-card rounded-xl p-4 shadow-card border border-border/50 mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-amber-600" />
              <h3 className="font-medium text-sm">Pending Settlements</h3>
            </div>
            <div className="space-y-3">
              {delayedPayments.slice(0, 3).map((payment, index) => {
                const member = getMemberById(payment.memberId);
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MemberAvatar name={member?.name || ''} size="sm" />
                      <div>
                        <p className="text-sm font-medium">{member?.name}</p>
                        <p className="text-xs text-muted-foreground">{payment.daysOverdue} days overdue</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-balance-negative">
                      {formatCurrency(payment.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Groups */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-lg">Your Groups</h2>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => {
            // Simple prompt for now
            const name = prompt("Group Name:");
            if (name) {
              api.post('/groups', { name }).then(() => fetchGroups());
            }
          }}>
            <Plus className="w-4 h-4" />
            New Group
          </Button>
        </div>

        <div className="space-y-3">
          {loading ? <p>Loading...</p> : groups.length === 0 ? <p className="text-muted-foreground p-4">No groups yet. Create one!</p> :
            groups.map((group, index) => (
              <div key={group.id} style={{ animationDelay: `${150 + index * 50}ms` }}>
                <GroupCard group={group} />
              </div>
            ))}
        </div>
      </main>

      {/* Settle All FAB */}
      {(totalOwed > 0 || totalOwe > 0) && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4">
          <Button size="lg" className="shadow-elevated gap-2 px-8">
            <AlertCircle className="w-5 h-5" />
            Settle All Balances
          </Button>
        </div>
      )}
    </div>
  );
}
