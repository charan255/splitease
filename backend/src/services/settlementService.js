/**
 * Minimizes transactions using a greedy algorithm.
 * 
 * Logic:
 * 1. Calculate net balance for each user.
 * 2. Separate into Debtors (-) and Creditors (+).
 * 3. Sort both lists by magnitude.
 * 4. Greedily pay off the max debtor to the max creditor.
 */
exports.minimizeTransactions = (balances) => {
    // balances: { userId: netAmount }

    let debtors = [];
    let creditors = [];

    for (const [userId, amount] of Object.entries(balances)) {
        if (amount < -0.01) debtors.push({ userId, amount });
        else if (amount > 0.01) creditors.push({ userId, amount });
    }

    // Sort by magnitude (descending)
    debtors.sort((a, b) => a.amount - b.amount); // Most negative first
    creditors.sort((a, b) => b.amount - a.amount); // Most positive first

    const settlements = [];
    let i = 0; // debtor index
    let j = 0; // creditor index

    while (i < debtors.length && j < creditors.length) {
        let debtor = debtors[i];
        let creditor = creditors[j];

        // The amount to settle is the minimum of (abs(debt), credit)
        let amount = Math.min(Math.abs(debtor.amount), creditor.amount);

        // Round to 2 decimals
        amount = Math.round(amount * 100) / 100;

        if (amount > 0) {
            settlements.push({
                from: debtor.userId,
                to: creditor.userId,
                amount: amount
            });
        }

        // Adjust balances
        debtor.amount += amount;
        creditor.amount -= amount;

        // If settled, move to next
        if (Math.abs(debtor.amount) < 0.01) i++;
        if (creditor.amount < 0.01) j++;
    }

    return settlements;
};
