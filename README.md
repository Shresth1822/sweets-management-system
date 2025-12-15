# Sweets Management System 🍬

A full-stack web application for managing a sweets inventory, processing purchases, and tracking sales statistics. Built with a premium glassmorphism UI and a robust Node.js/PostgreSQL backend.

## ✨ Features

### 🛍️ User Experience

- **Premium UI**: Glassmorphism design with "Deep Purple" & "Hot Pink" gradients and smooth animations.
- **Search & Filter**: Find sweets by name, category, or price range.
- **Dynamic Cart**: Add items to cart and purchase with real-time stock validation.
- **Stats Dashboard**: Users can track their total spending.

### 🛡️ Admin Panel

- **Inventory Management**: Create, Edit, and Delete sweets.
- **Restock**: Quick actions to replenish stock levels.
- **Custom Categories**: Add new sweet categories on the fly.
- **Revenue Analytics**: View total revenue generated from detailed transaction history.
- **Role-Based Access**: Secure Admin-only routes protected by JWT.

## 🛠️ Tech Stack

**Frontend:**

- React 18 (Vite)
- TypeScript
- Tailwind CSS (Custom Premium Theme)
- Axios & Context API

**Backend:**

- Node.js & Express
- PostgreSQL (Raw SQL Queries - No ORM)
- JWT Authentication
- Jest & Supertest (Automated Testing)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL (Local or Cloud)

### 1. Clone & Install

```bash
git clone https://github.com/Shresth1822/sweets-management-system.git
cd sweets-management-system

# Install Frontend Dependencies
cd client
npm install

# Install Backend Dependencies
cd ../server
npm install
```

### 2. Environment Setup

Create a `.env` file in the `server` directory:

```env
PORT=3000
DATABASE_URL=postgres://user:password@localhost:5432/sweets_db
JWT_SECRET=your_super_secret_key
```

### 3. Database Setup

```bash
cd server
# Run Migrations (Create Tables)
npm run migrate

# Seed Data (Initial Sweets & Admin User)
npm run seed
```

- **Admin Credentials**: `admin@sweets.com` / `admin123`

### 4. Run Locally

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

Visit `http://localhost:5173` to see the app!

## 🧪 Testing

The project includes a comprehensive automated testing suite using Jest.

```bash
cd server
npm test
```

Includes tests for:

- ✅ Authentication (Register/Login)
- ✅ Sweets CRUD & Search
- ✅ Inventory & Purchasing

## ☁️ Deployment (Vercel)

This project is configured for Vercel deployment with a Serverless Backend.

1.  Push to GitHub.
2.  Import project in Vercel.
3.  Set Environment Variables (`DATABASE_URL`, `JWT_SECRET`).
4.  Deploy!

_Note: For Vercel, use a cloud database like Neon.tech or Supabase._
