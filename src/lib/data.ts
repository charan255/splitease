// Dummy data for the expense management app

export interface Member {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  splitAmong: string[];
  date: string;
  category: 'food' | 'transport' | 'entertainment' | 'utilities' | 'other';
}

export interface Group {
  id: string;
  name: string;
  members: Member[];
  expenses: Expense[];
  createdAt: string;
}

export interface Balance {
  memberId: string;
  amount: number; // positive = they owe you, negative = you owe them
}

export const currentUser: Member = {
  id: 'user-1',
  name: 'You',
  phone: '+91 98765 43210',
};

export const members: Member[] = [
  currentUser,
  { id: 'user-2', name: 'Arjun Sharma', phone: '+91 98765 43211' },
  { id: 'user-3', name: 'Priya Patel', phone: '+91 98765 43212' },
  { id: 'user-4', name: 'Rahul Verma', phone: '+91 98765 43213' },
  { id: 'user-5', name: 'Sneha Gupta', phone: '+91 98765 43214' },
  { id: 'user-6', name: 'Vikram Singh', phone: '+91 98765 43215' },
];

export const groups: Group[] = [
  {
    id: 'group-1',
    name: 'Goa Trip 2024',
    members: [members[0], members[1], members[2], members[3]],
    expenses: [
      {
        id: 'exp-1',
        description: 'Hotel booking',
        amount: 12000,
        paidBy: 'user-2',
        splitAmong: ['user-1', 'user-2', 'user-3', 'user-4'],
        date: '2024-01-15',
        category: 'other',
      },
      {
        id: 'exp-2',
        description: 'Dinner at beach shack',
        amount: 3200,
        paidBy: 'user-1',
        splitAmong: ['user-1', 'user-2', 'user-3', 'user-4'],
        date: '2024-01-16',
        category: 'food',
      },
      {
        id: 'exp-3',
        description: 'Water sports',
        amount: 4800,
        paidBy: 'user-3',
        splitAmong: ['user-1', 'user-2', 'user-3'],
        date: '2024-01-17',
        category: 'entertainment',
      },
    ],
    createdAt: '2024-01-10',
  },
  {
    id: 'group-2',
    name: 'Flat Expenses',
    members: [members[0], members[4], members[5]],
    expenses: [
      {
        id: 'exp-4',
        description: 'Electricity bill - Jan',
        amount: 2400,
        paidBy: 'user-1',
        splitAmong: ['user-1', 'user-5', 'user-6'],
        date: '2024-01-20',
        category: 'utilities',
      },
      {
        id: 'exp-5',
        description: 'WiFi subscription',
        amount: 999,
        paidBy: 'user-5',
        splitAmong: ['user-1', 'user-5', 'user-6'],
        date: '2024-01-18',
        category: 'utilities',
      },
      {
        id: 'exp-6',
        description: 'Groceries',
        amount: 1850,
        paidBy: 'user-6',
        splitAmong: ['user-1', 'user-5', 'user-6'],
        date: '2024-01-22',
        category: 'food',
      },
    ],
    createdAt: '2024-01-01',
  },
  {
    id: 'group-3',
    name: 'Office Lunch Club',
    members: [members[0], members[1], members[4]],
    expenses: [
      {
        id: 'exp-7',
        description: 'Monday lunch',
        amount: 750,
        paidBy: 'user-1',
        splitAmong: ['user-1', 'user-2', 'user-5'],
        date: '2024-01-22',
        category: 'food',
      },
      {
        id: 'exp-8',
        description: 'Tuesday lunch',
        amount: 680,
        paidBy: 'user-2',
        splitAmong: ['user-1', 'user-2', 'user-5'],
        date: '2024-01-23',
        category: 'food',
      },
    ],
    createdAt: '2024-01-15',
  },
];

export function calculateGroupBalance(group: Group, userId: string = 'user-1'): number {
  let balance = 0;
  
  group.expenses.forEach(expense => {
    const splitAmount = expense.amount / expense.splitAmong.length;
    
    if (expense.paidBy === userId) {
      // User paid, others owe them
      const othersShare = expense.splitAmong.filter(id => id !== userId).length * splitAmount;
      balance += othersShare;
    } else if (expense.splitAmong.includes(userId)) {
      // User owes the payer
      balance -= splitAmount;
    }
  });
  
  return Math.round(balance);
}

export function calculateMemberBalances(group: Group, userId: string = 'user-1'): Balance[] {
  const balances: Record<string, number> = {};
  
  group.members.forEach(member => {
    if (member.id !== userId) {
      balances[member.id] = 0;
    }
  });
  
  group.expenses.forEach(expense => {
    const splitAmount = expense.amount / expense.splitAmong.length;
    
    if (expense.paidBy === userId) {
      expense.splitAmong.forEach(memberId => {
        if (memberId !== userId && balances[memberId] !== undefined) {
          balances[memberId] += splitAmount;
        }
      });
    } else if (expense.splitAmong.includes(userId)) {
      if (balances[expense.paidBy] !== undefined) {
        balances[expense.paidBy] -= splitAmount;
      }
    }
  });
  
  return Object.entries(balances).map(([memberId, amount]) => ({
    memberId,
    amount: Math.round(amount),
  }));
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export function calculateOptimizedSettlements(group: Group): Settlement[] {
  const netBalances: Record<string, number> = {};
  
  group.members.forEach(member => {
    netBalances[member.id] = 0;
  });
  
  group.expenses.forEach(expense => {
    const splitAmount = expense.amount / expense.splitAmong.length;
    netBalances[expense.paidBy] += expense.amount;
    expense.splitAmong.forEach(memberId => {
      netBalances[memberId] -= splitAmount;
    });
  });
  
  const creditors: { id: string; amount: number }[] = [];
  const debtors: { id: string; amount: number }[] = [];
  
  Object.entries(netBalances).forEach(([id, amount]) => {
    const rounded = Math.round(amount);
    if (rounded > 0) {
      creditors.push({ id, amount: rounded });
    } else if (rounded < 0) {
      debtors.push({ id, amount: -rounded });
    }
  });
  
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);
  
  const settlements: Settlement[] = [];
  
  let i = 0, j = 0;
  while (i < creditors.length && j < debtors.length) {
    const settleAmount = Math.min(creditors[i].amount, debtors[j].amount);
    
    if (settleAmount > 0) {
      settlements.push({
        from: debtors[j].id,
        to: creditors[i].id,
        amount: settleAmount,
      });
    }
    
    creditors[i].amount -= settleAmount;
    debtors[j].amount -= settleAmount;
    
    if (creditors[i].amount === 0) i++;
    if (debtors[j].amount === 0) j++;
  }
  
  return settlements;
}

export function getMemberById(id: string): Member | undefined {
  return members.find(m => m.id === id);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

export const delayedPayments = [
  { memberId: 'user-2', groupId: 'group-1', daysOverdue: 12, amount: 2200 },
  { memberId: 'user-4', groupId: 'group-1', daysOverdue: 8, amount: 800 },
  { memberId: 'user-5', groupId: 'group-2', daysOverdue: 5, amount: 467 },
];
