const db = require('../config/db');
const settlementService = require('../services/settlementService');

exports.getSettlements = async (req, res) => {
    const groupId = req.params.id;

    try {
        // 1. Get all expenses and splits
        const expensesRes = await db.query('SELECT * FROM expenses WHERE group_id = $1', [groupId]);
        const splitsRes = await db.query(
            `SELECT es.* FROM expense_splits es 
         JOIN expenses e ON es.expense_id = e.id 
         WHERE e.group_id = $1`,
            [groupId]
        );

        // 2. Fetch Users mapping
        const usersRes = await db.query(
            `SELECT u.id, u.name FROM users u 
         JOIN group_members gm ON u.id = gm.user_id 
         WHERE gm.group_id = $1`,
            [groupId]
        );
        const userMap = {};
        usersRes.rows.forEach(u => userMap[u.id] = u.name);

        // 3. Calculate Net Balances
        const balances = {}; // userId -> amount

        // Initialize 0
        usersRes.rows.forEach(u => balances[u.id] = 0);

        // Add what they PAID (Positive)
        expensesRes.rows.forEach(exp => {
            balances[exp.paid_by] = (balances[exp.paid_by] || 0) + Number(exp.amount);
        });

        // Subtract what they OWE (Negative)
        splitsRes.rows.forEach(split => {
            balances[split.user_id] = (balances[split.user_id] || 0) - Number(split.amount_owed);
        });

        // 4. Run Minimization Algorithm
        const simplified = settlementService.minimizeTransactions(balances);

        // 5. Enhance response with Names
        const results = simplified.map(s => ({
            from: s.from,
            from_name: userMap[s.from],
            to: s.to,
            to_name: userMap[s.to],
            amount: s.amount
        }));

        res.json(results);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to calculate settlements' });
    }
};

exports.getStats = async (req, res) => {
    // Basic stats: Total spent, your net balance
    const groupId = req.params.id;
    const userId = req.user.userId;

    try {
        // Similar logic to balances, but just for the requesting user
        // Omitted for brevity, but follows the same pattern.
        res.json({ message: "Stats endpoint placeholder" });
    } catch (err) {
        res.status(500).json({ error: 'Error' });
    }
};
