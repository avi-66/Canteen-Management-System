# Canteen Management System

A full-stack web application for managing canteen orders, shops, and menus. Built with React (Vite) frontend and Node.js/Express backend.

## Features

- 🔐 **Authentication**: Email/password and Google OAuth login
- 👤 **Role-based Access**: Users, Shop Admins, and Super Admins
- 🏪 **Shop Management**: Create and manage multiple canteen shops
- 🍔 **Menu Management**: Add, edit, and organize menu items by category
- 🛒 **Cart & Ordering**: Add items to cart and place orders
- 📦 **Order Tracking**: Real-time order status updates
- 📊 **Admin Dashboard**: Analytics and management tools

## Project Structure

```
Canteen-Management/
├── package.json              # Root package with build/start scripts
├── .gitignore                # Git ignore rules
├── README.md                 # This file
├── server/                   # Backend (Node.js/Express)
│   ├── src/
│   │   ├── routes/           # API route definitions
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Auth & role middleware
│   │   ├── utils/            # Helper utilities
│   │   ├── config/           # Passport.js & constants
│   │   ├── data/             # JSON data storage
│   │   │   ├── users.json
│   │   │   ├── shops.json
│   │   │   ├── items.json
│   │   │   └── orders.json
│   │   └── server.js         # Express app entry point
│   ├── .env.example          # Environment template
│   └── package.json
├── client/                   # Frontend (React/Vite)
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── common/       # Shared components
│   │   │   ├── user/         # User-facing components
│   │   │   └── admin/        # Admin components
│   │   ├── pages/            # Page components
│   │   ├── context/          # React Context (Auth, Cart)
│   │   ├── services/         # API service layer
│   │   └── utils/            # Constants & helpers
│   ├── .env.example          # Environment template
│   └── package.json
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd canteen-management-system
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```
   This will install dependencies for root, server, and client.

3. **Environment Setup**

   **Server** (`server/.env`):
   ```env
   PORT=5000
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   FRONTEND_URL=http://localhost:5173
   SUPER_ADMIN_EMAIL=admin@college.edu
   ```

   **Client** (`client/.env`):
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. **Run Locally**
   ```bash
   npm run dev
   ```
   This starts both the server (port 5000) and client (port 5173) development servers.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies (root, server, client) |
| `npm run dev` | Start both server and client in development mode |
| `npm run build` | Build the client for production |
| `npm start` | Start the production server |

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check endpoint |
| `POST /api/auth/login` | Email/password login |
| `POST /api/auth/register` | User registration |
| `GET /api/auth/google` | Google OAuth login |
| `GET /api/shops` | List all shops |
| `GET /api/items` | List menu items |
| `POST /api/orders` | Create new order |
| `GET /api/orders` | Get user's orders |

## Deployment (Render)

This repository is configured for deployment on Render as a single Web Service.

### Render Configuration

| Setting | Value |
|---------|-------|
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Node Version** | 18+ |

### Environment Variables (Render)

Set these in your Render dashboard:

```
PORT=10000
NODE_ENV=production
JWT_SECRET=<your-secure-secret>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_CALLBACK_URL=https://your-app.onrender.com/api/auth/google/callback
FRONTEND_URL=https://your-app.onrender.com
SUPER_ADMIN_EMAIL=admin@college.edu
```

For the client, the API base URL defaults to `/api` in production, so no additional environment variable is needed.

## User Roles

| Role | Permissions |
|------|-------------|
| **USER** | Browse shops, view menus, place orders, track orders |
| **SHOP_ADMIN** | Manage menu items, view/update shop orders |
| **SUPER_ADMIN** | Manage all shops, users, and system settings |

## Tech Stack

### Frontend
- React 18
- Vite
- React Router DOM
- Tailwind CSS
- Axios
- Lucide React Icons

### Backend
- Node.js
- Express.js
- Passport.js (Google OAuth)
- JSON Web Tokens (JWT)
- bcrypt (password hashing)

## License

ISC
