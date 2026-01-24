const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes (to be imported)
const authRoutes = require('./routes/authRoutes');
const groupRoutes = require('./routes/groupRoutes');
// const expenseRoutes = require('./routes/expenseRoutes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
// app.use('/api/expenses', expenseRoutes);

// Basic health check
app.get('/', (req, res) => {
    res.json({ message: 'Group Expense Manager Backend API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
