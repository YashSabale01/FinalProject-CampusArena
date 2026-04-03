# CampusArena - Event Management System

A full-stack campus event management platform built with React and Node.js, featuring real-time notifications, payment processing, and role-based access control.

## 🛠️ Tech Stack

- **Frontend** - React 18, Tailwind CSS, Axios, Socket.IO Client, React Router
- **Backend** - Node.js, Express.js, MongoDB (Atlas), JWT, Socket.IO, Stripe, Bcrypt, Helmet
- **Database** - MongoDB Atlas

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (free tier)
- Stripe account (for payments)
- Git

## 🔧 Installation

### 1. Clone the repository
```bash
git clone https://github.com/YashSabale01/CampusArenaProject.git
cd CampusArenaProject
```

### 2. Install server dependencies
```bash
cd server
npm install
```

### 3. Install client dependencies
```bash
cd ../client
npm install
```

### 4. Environment Configuration

Create `.env` file inside the `server/` directory:
```env
# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/campusarena?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_long_random_secret_here

# Server
PORT=8000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Admin default password
DEFAULT_ADMIN_PASSWORD=Admin@123

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

> ⚠️ Never commit your `.env` file. It is already in `.gitignore`.

## 🚀 Running the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

Frontend runs on `http://localhost:3000`, Backend on `http://localhost:8000`

## 📱 Default Admin Accounts

| Username | Password  |
|----------|-----------|
| admin1   | Admin@123 |
| admin2   | Admin@123 |

> Admin accounts are auto-created on first server start.

## 🔒 Security Features

- JWT authentication (30 day expiry)
- Password hashing with Bcrypt
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Security headers with Helmet
- Role-based access control (Student / Admin)

## 📊 Database Collections

| Collection | Description |
|------------|-------------|
| users | User accounts and authentication |
| events | Campus events and registrations |
| reviews | Event ratings and reviews |
| comments | Event discussions and replies |
| favorites | User saved events |
| chats | Event chat messages |

## 📄 License

MIT License
