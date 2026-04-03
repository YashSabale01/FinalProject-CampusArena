# CampusArena - Event Management System

A comprehensive campus event management platform built with React and Node.js, featuring real-time notifications, payment processing, and role-based access control.

## 🚀 Features

### For Students
- **Event Discovery** - Browse and search campus events by category, date, and location
- **Event Registration** - Register for free and paid events with integrated payment system
- **Payment Processing** - Secure payment handling with Stripe integration
- **Real-time Updates** - Live notifications for event updates and registrations
- **Event Reviews** - Rate and review attended events
- **Favorites System** - Save events for quick access
- **Discussion Forums** - Comment and discuss events with other attendees

### For Administrators
- **Event Management** - Create, update, and delete events with rich details
- **User Management** - Manage student accounts and permissions
- **Analytics Dashboard** - View registration statistics and revenue reports
- **Check-in System** - QR code-based event check-in functionality
- **Export Features** - Download registration data and generate reports
- **Real-time Monitoring** - Track event capacity and registration status

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **Socket.IO Client** - Real-time communication
- **React Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Token authentication
- **Socket.IO** - Real-time bidirectional communication
- **Stripe** - Payment processing integration
- **Bcrypt** - Password hashing
- **Helmet** - Security middleware

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Stripe account (for payments)
- Git

## 🔧 Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/campusarena.git
cd campusarena
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

Create `.env` file in the server directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/campusarena

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Server
PORT=8000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:3000

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Admin
DEFAULT_ADMIN_PASSWORD=Admin@123

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

### 5. Seed Database (Optional)
```bash
cd server
npm run seed
```

## 🚀 Running the Application

### Development Mode

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

### Production Mode

**Build Frontend:**
```bash
cd client
npm run build
```

**Start Server:**
```bash
cd server
npm start
```

## 📱 Usage

### Default Admin Accounts
- **Username:** `admin1` | **Password:** `Admin@123`
- **Username:** `admin2` | **Password:** `Admin@123`

### Student Registration
- Students can register through the signup form
- All public registrations are automatically assigned Student role
- Only admins can create other admin accounts

### API Endpoints

#### Authentication
- `POST /api/auth/signup` - Register new student
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

#### Events
- `GET /api/events` - Get all events (public)
- `POST /api/events` - Create event (admin only)
- `POST /api/events/:id/register` - Register for event
- `GET /api/events/my-registrations` - Get user registrations

#### Payments
- `POST /api/payments/events/:id/create-payment-intent` - Create payment
- `POST /api/payments/events/:id/confirm-payment` - Confirm payment

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Security headers with Helmet
- Input validation and sanitization
- Role-based access control

## 📊 Database Schema

### Collections
- **users** - User accounts and authentication
- **events** - Campus events and registrations
- **reviews** - Event reviews and ratings
- **comments** - Event discussions
- **chats** - Event chat messages
- **favorites** - User favorite events

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- React team for the amazing framework
- Express.js community for the robust backend framework
- MongoDB for the flexible database solution
- Stripe for secure payment processing
- All contributors and testers

## 📞 Support

For support, email your-email@example.com or create an issue in this repository.

---

**CampusArena** - Making campus event management simple and efficient! 🎓✨