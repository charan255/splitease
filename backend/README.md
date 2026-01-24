# Group Expense Manager Backend

Node.js + Express + PostgreSQL backend for a fintech-like group expense application.

## Prerequisites

- Node.js (v14+)
- PostgreSQL

## Setup

1.  **Install Dependencies**
    ```bash
    cd backend
    npm install
    ```

2.  **Database Setup**
    - Create a PostgreSQL database (e.g., `group_expense_db`).
    - Run the schema script locally or via a tool (e.g., pgAdmin):
      ```bash
      # Example using psql
      psql -U postgres -d group_expense_db -f schema.sql
      ```

3.  **Environment Variables**
    - Rename `.env.example` to `.env` (if applicable) or edit `.env`.
    - Update `DB_USER`, `DB_PASSWORD`, `DB_NAME` in `.env`.

4.  **Run Server**
    ```bash
    npm run dev
    ```

## API Endpoints

### Auth
- `POST /api/auth/login` - Request OTP (Mock: 1234)
- `POST /api/auth/verify` - Verify OTP & Get Token

### Groups
- `POST /api/groups` - Create a group
- `POST /api/groups/:id/join` - Join a group
- `GET /api/groups` - List user's groups

### Expenses
- `POST /api/groups/:id/expenses` - Add expense with splits
- `GET /api/groups/:id/expenses` - List expenses

### Settlements
- `GET /api/groups/:id/settlements` - Get optimized settlement plan

## Algorithm
Uses a greedy algorithm to minimize transactions:
1.  Calculates net balance for every user.
2.  Matches highest debtor with highest creditor repeatedly until all debts are settled.
