## Event Ticketing App – Setup, Usage, and Stripe Test Guide

This project is a full‑stack event ticketing app with a React frontend and a Node/Express + MongoDB backend. Payments are handled via Stripe Checkout in test mode.

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Stripe account (test mode is fine)

## 1) Clone and install

```powershell
# From the project root
npm install
cd backend; npm install; cd ..
```

## 2) Configure environment
env is already there for now  soon removed


## 3) Use your existing database (no seeding required)

If you already have your own MongoDB data (users/events/bookings), just point `MONGO_URI` in `backend/.env` to that database. No seeding is required.

### Optional: Seed sample data

If you do NOT have data and want to try the app quickly, you can import sample users and events:

```powershell
cd backend
npm run data:import
```

Default admin user from sample data (change in production):

- Email: `admin@eventticket.com`
- Password: `123456`

## 4) Run the app

Open two terminals.

Backend (port 5000):

```powershell
cd backend
npm run dev
```

Frontend (Vite dev server, usually http://localhost:5173):

```powershell
npm run dev
```

## 5) Using the app

- Register or log in. **For testing purposes, use the test email from the login form directly - no need to register.**
- Browse events on the Home page.
- Open an event → choose ticket quantity → click "Book Ticket".
- You'll be redirected to Stripe Checkout (test mode). On success you'll land on `Booking Success` and the booking will appear in `User Dashboard`.
- If you log in as admin, open `Admin Dashboard` to create/delete events and view attendees per event.

## Stripe test cards

Use these in Checkout while in test mode:

- Successful payment: `4242 4242 4242 4242` with any future date, any CVC, any ZIP.
- 3D Secure required: `4000 0027 6000 3184` (Stripe will display a test authentication modal).
- Declined card: `4000 0000 0000 9995`.

More test cards: https://stripe.com/docs/testing

## Notes about static/mock data

- All remaining pages now use live API endpoints. The old mock data file `src/data/mockData.js` has been removed.
- Event models use a structured `venue` object and `startTime`/`endTime`. UI has been updated to reflect this (no more plain `location`/`time`).

## Troubleshooting

- If the backend fails to start, verify `MONGO_URI` and that MongoDB is running.
- If Stripe redirect fails, confirm `CLIENT_URL` and Stripe test keys in `.env`.
- If you get 401/403 errors, make sure you're logged in and, for admin routes, using the admin account.

## Scripts

Frontend:

- `npm run dev` – start Vite dev server
- `npm run build` – production build
- `npm run preview` – preview production build

Backend (inside `backend/`):

- `npm run dev` – nodemon dev server
- `npm start` – production server
- `npm run data:import` – seed DB with sample users/events
- `npm run data:destroy` – wipe users/events/bookings



