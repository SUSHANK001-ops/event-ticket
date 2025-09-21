# 🚀 Quick Setup Guide for Event Ticket Backend

## Prerequisites

- Node.js (v16+)
- MongoDB (local or Atlas)
- Stripe account

## Setup Steps

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

### 4. Required Environment Variables

Update your `.env` file with:

- **MONGO_URI**: Your MongoDB connection string
- **JWT_SECRET**: A strong secret key for JWT tokens
- **STRIPE_SECRET_KEY**: Your Stripe secret key (test mode)
- **STRIPE_PUBLISHABLE_KEY**: Your Stripe publishable key
- **CLIENT_URL**: Your frontend URL (http://localhost:3000)

### 5. Start the Server

```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

### 6. Load Sample Data (Optional)

```bash
# Import sample users and events
npm run data:import

# Remove all data
npm run data:destroy
```

## 🔑 Default Admin Account

- **Email**: admin@eventticket.com
- **Password**: 123456
- **Role**: admin

## 📡 API Base URL

```
http://localhost:5000/api
```

## 🧪 Test the API

Health check endpoint:

```
GET http://localhost:5000/health
```

## 🔐 Stripe Configuration

1. Get your test keys from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Add webhook endpoint: `http://localhost:5000/api/bookings/webhook`
3. Select events: `checkout.session.completed`, `payment_intent.payment_failed`

## 📋 Next Steps

1. Configure your MongoDB database
2. Set up Stripe webhook in dashboard
3. Test authentication endpoints
4. Create some events via admin endpoints
5. Test booking flow with frontend

## 🛠 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run data:import` - Import sample data
- `npm run data:destroy` - Remove all data

## 📚 API Documentation

Check `README.md` for complete API endpoint documentation.

## 🚨 Important Security Notes

- Change default admin password immediately
- Use strong JWT secrets in production
- Set up proper CORS policies
- Configure rate limiting for production
- Use HTTPS in production environment
