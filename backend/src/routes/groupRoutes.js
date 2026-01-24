const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const expenseController = require('../controllers/expenseController');
const settlementController = require('../controllers/settlementController');
const authMiddleware = require('../middleware/authMiddleware');

// Group Routes
router.post('/', authMiddleware, groupController.createGroup);
router.get('/', authMiddleware, groupController.getMyGroups);
router.post('/:id/join', authMiddleware, groupController.joinGroup);
router.get('/:id/members', authMiddleware, groupController.getGroupMembers);

// Expense Routes (Nested under groups for clarity usually, or separate. The prompt asked for specific structure, I'll stick to a clean REST style)
// We'll put expense routes here as sub-resources of groups or assume global ID.
// Ideally: POST /api/groups/:id/expenses
router.post('/:id/expenses', authMiddleware, expenseController.addExpense);
router.get('/:id/expenses', authMiddleware, expenseController.getGroupExpenses);

// Settlements
router.get('/:id/settlements', authMiddleware, settlementController.getSettlements);
router.get('/:id/stats', authMiddleware, settlementController.getStats);

module.exports = router;
