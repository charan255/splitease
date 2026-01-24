const db = require('../config/db');

exports.addExpense = async (req, res) => {
    const groupId = req.params.id;
    const { amount, description, splits } = req.body; // splits: [{ userId, amount }]
    const paidBy = req.user.userId;

    if (!amount || !splits || splits.length === 0) {
        return res.status(400).json({ error: 'Invalid expense data' });
    }

    // Validate total split matches amount
    const totalSplit = splits.reduce((acc, curr) => acc + Number(curr.amount), 0);
    if (Math.abs(totalSplit - amount) > 0.01) {
        return res.status(400).json({ error: 'Split amounts do not match total' });
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Create Expense
        const expenseRes = await client.query(
            'INSERT INTO expenses (group_id, paid_by, amount, description) VALUES ($1, $2, $3, $4) RETURNING id',
            [groupId, paidBy, amount, description]
        );
        const expenseId = expenseRes.rows[0].id;

        // 2. Create Splits
        for (const split of splits) {
            await client.query(
                'INSERT INTO expense_splits (expense_id, user_id, amount_owed) VALUES ($1, $2, $3)',
                [expenseId, split.userId, split.amount]
            );
        }

        await client.query('COMMIT');
        res.status(201).json({ message: 'Expense added', expenseId });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Failed to add expense' });
    } finally {
        client.release();
    }
};

exports.getGroupExpenses = async (req, res) => {
    const groupId = req.params.id;
    try {
        const expenses = await db.query(
            `SELECT e.*, u.name as paid_by_name 
       FROM expenses e 
       JOIN users u ON e.paid_by = u.id 
       WHERE e.group_id = $1 
       ORDER BY e.created_at DESC`,
            [groupId]
        );

        // Fetch splits for each expense (This is N+1 but acceptable for small scale)
        // Optimization: Join or fetch all splits in one query and map in memory.
        // For simplicity/speed in hackathon:
        /* 
        const expensesWithSplits = await Promise.all(expenses.rows.map(async (exp) => {
            const splits = await db.query('SELECT * FROM expense_splits WHERE expense_id = $1', [exp.id]);
            return { ...exp, splits: splits.rows };
        }));
        */

        res.json(expenses.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
};
