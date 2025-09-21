# Event Ticket Backend

A professional Node.js backend for an Event Booking System with Stripe payment integration.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with user/admin roles
- **Event Management**: Full CRUD operations for events
- **Booking System**: Stripe integration for secure payments
- **Admin Dashboard**: Analytics and management tools
- **Security**: Rate limiting, helmet, CORS, data sanitization
- **Database**: MongoDB with Mongoose ODM

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Stripe account (for payment processing)

## 🛠 Installation

1. **Navigate to backend directory:**

   ```bash
   cd backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Environment Setup:**
   Copy `.env.example` to `.env` and fill in your values:

   ```bash
   cp .env.example .env
   ```

4. **Configure your .env file:**

   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database
   MONGO_URI=mongodb://localhost:27017/event-ticket-db

   # JWT
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d

   # Stripe (Test Mode)
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

   # CORS
   CLIENT_URL=http://localhost:3000
   ```

## 🚀 Running the Server

**Development mode:**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password

### Events

- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get single event
- `GET /api/events/upcoming` - Get upcoming events
- `GET /api/events/search` - Search events
- `POST /api/events` - Create event (Admin only)
- `PUT /api/events/:id` - Update event (Admin only)
- `DELETE /api/events/:id` - Delete event (Admin only)

### Bookings

- `POST /api/bookings/create-checkout-session` - Create Stripe session
- `POST /api/bookings/confirm-payment` - Confirm payment
- `GET /api/bookings/my-bookings` - Get user bookings
- `GET /api/bookings/:id` - Get single booking
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Admin

- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - Get all users
- `GET /api/admin/bookings` - Get all bookings
- `GET /api/admin/events/:eventId/attendees` - Get event attendees

## 🔒 Security Features

- **Helmet**: Sets security headers
- **Rate Limiting**: Prevents brute force attacks
- **CORS**: Cross-origin resource sharing
- **Data Sanitization**: Prevents NoSQL injection
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt for password security

## 📊 Database Models

### User

- Authentication and profile information
- Role-based access (user/admin)
- Password hashing and JWT tokens

### Event

- Complete event details with venue information
- Category-based organization
- Ticket availability tracking

### Booking

- Payment integration with Stripe
- Booking status and attendee management
- QR codes for ticket verification

## 💳 Stripe Integration

The system uses Stripe Checkout for secure payment processing:

1. **Create Checkout Session**: Generate secure payment link
2. **Payment Confirmation**: Verify payment and create booking
3. **Webhook Handling**: Process Stripe events
4. **Refund Support**: Handle cancellations and refunds

## 🔧 Environment Variables

| Variable                | Description               | Required                  |
| ----------------------- | ------------------------- | ------------------------- |
| `PORT`                  | Server port               | No (default: 5000)        |
| `NODE_ENV`              | Environment mode          | No (default: development) |
| `MONGO_URI`             | MongoDB connection string | Yes                       |
| `JWT_SECRET`            | JWT secret key            | Yes                       |
| `JWT_EXPIRE`            | JWT expiration time       | No (default: 7d)          |
| `STRIPE_SECRET_KEY`     | Stripe secret key         | Yes                       |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret     | Yes                       |
| `CLIENT_URL`            | Frontend URL for CORS     | Yes                       |

## 🐛 Error Handling

The API includes comprehensive error handling:

- Custom error response class
- Mongoose error handling
- Async error catching
- Validation error formatting

## 📝 Logging

Development mode includes:

- Request method and URL logging
- Colored console output
- Error stack traces

## 🧪 Testing

Health check endpoint available at:

```
GET /health
```

Returns server status and environment information.

## 🚀 Deployment

1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set up Stripe webhook endpoints
4. Configure CORS for production domain
5. Set secure environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.
