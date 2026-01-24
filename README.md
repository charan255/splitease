# Group Balance - Expense Sharing App

A full-stack application for managing shared expenses and calculating group balances. Keep track of who owes whom and settle debts efficiently.

## Project Overview

Group Balance is a web-based expense management system that allows groups to:

- Create and manage expense groups
- Add and track shared expenses
- Automatically calculate who owes whom
- Generate settlement plans to minimize transactions
- Maintain transaction history

## Tech Stack

### Frontend

- **Vite** - Fast build tool and dev server
- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn-ui** - High-quality React components

### Backend

- **Node.js** - JavaScript runtime
- **Express** - Web framework for APIs
- **PostgreSQL** - Relational database
- **dotenv** - Environment configuration

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL (for backend)

### Installation

1. Clone the repository:

```bash
git clone <YOUR_GIT_URL>
cd group-balance-main
```

2. Install root dependencies:

```bash
npm install
```

3. Install and setup backend:

```bash
cd backend
npm install
```

4. Create a `.env` file in the backend directory:

```env
PORT=5000
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=group_balance
JWT_SECRET=your_secret_key
```

5. Setup the database:

```bash
psql -U your_user -d group_balance -f schema.sql
```

### Running the Application

**Frontend (from root directory):**

```bash
npm run dev
```

The frontend will be available at `http://localhost:8080`

**Backend (from backend directory):**

```bash
cd backend
npm start
```

The backend API will run on `http://localhost:5000`

## Project Structure

```
group-balance-main/
├── src/                    # Frontend React components
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── lib/              # Utility functions and API calls
│   └── hooks/            # Custom React hooks
├── backend/
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── routes/       # API route definitions
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Express middleware
│   │   └── config/       # Configuration files
│   └── schema.sql        # Database schema
├── public/               # Static assets
└── vite.config.ts        # Vite configuration
```

## Key Features

- **User Authentication** - Secure login and registration
- **Group Management** - Create and manage expense groups
- **Expense Tracking** - Add expenses with multiple participants
- **Balance Calculation** - Automatic calculation of who owes whom
- **Settlement Generation** - Smart algorithm to minimize settlement transactions
- **Responsive Design** - Works on desktop and mobile devices

## API Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/groups` - Get all groups
- `POST /api/groups` - Create a new group
- `GET /api/groups/:id` - Get group details
- `POST /api/groups/:id/expenses` - Add expense to group

## Development

To contribute:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and commit: `git commit -m 'Add feature'`
3. Push to the branch: `git push origin feature/your-feature`
4. Open a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.
