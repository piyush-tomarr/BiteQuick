# Food Delivery App — Backend

A REST API for a food delivery order management system. Handles user authentication, menu browsing, order placement, and order status tracking with live updates over WebSockets.

## What this does

- Users sign up / sign in and get a JWT.
- Users browse the menu, place orders, and view their order history.
- Admins (via a shared admin key) view all orders and update order status.
- When an order's status changes, the customer and any connected admin dashboard get notified instantly through Socket.IO — no polling needed.

## Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js + Express |
| Database | PostgreSQL (hosted on Neon) |
| Auth | JWT (`jsonwebtoken`) + bcrypt password hashing |
| Validation | Zod |
| Real-time | Socket.IO |
| Tests | Jest + Supertest |

## Project Structure

```
backend/
├── app.js                     # Express app setup (middleware, routes, error handling)
├── db.js                      # PostgreSQL connection pool
├── socket.js                  # Socket.IO setup (rooms for order tracking + admin)
├── bin/www                    # Server entry point (starts HTTP + socket server)
├── Middleware/
│   ├── auth.middleware.js     # Verifies JWT, attaches user id to request
│   └── admin.middleware.js    # Checks admin secret header
├── routes/
│   ├── AuthRoutes/
│   │   ├── auth.routes.js         # /signup, /signin
│   │   ├── auth.controller.js     # Request handling
│   │   ├── auth.service.js        # DB queries + password hashing + JWT generation
│   │   └── Validators/authvalidation.js
│   └── OrderRoutes/
│       ├── orders.routes.js       # Menu, place order, order history, admin routes
│       ├── orders.controller.js   # Request handling
│       ├── orders.service.js      # DB queries for menu/orders
│       └── Validators/orderValidation.js
└── tests/
    ├── auth.test.js
    └── orders.test.js
```

**Why this structure?** Each feature (auth, orders) is split into routes → controller → service → validator. Routes just wire up HTTP methods to controllers. Controllers handle request/response and error codes. Services talk to the database. Validators (Zod schemas) check incoming data before it touches business logic. This keeps each file doing one job, which makes it easier to test and change things without breaking unrelated code.

## Database Schema

The app expects four tables in Postgres: `users`, `menu_items`, `orders`, and `order_items`.

- **users** — id, username, email, password_hash, created_at
- **menu_items** — id, name, description, price, category, image (and whatever else your menu needs)
- **orders** — id, user_id, customer_name, phone, address, status, total_amount, created_at
- **order_items** — id, order_id, menu_item_id, quantity, price

> **Note:** This repo doesn't currently include a `schema.sql` or seed script — the tables were created directly in the Neon console during development. If you're setting this up fresh, you'll need to create these tables yourself (matching the columns referenced in `orders.service.js` and `auth.service.js`) and add at least one row to `menu_items` before running the order tests.

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require
JWT_SECRET=<a long random string>
ADMIN_SECRET=<a secret string only admins know>
PORT=2212
```

`.env` is already git-ignored — never commit real credentials. If you're picking up this repo and the connection string was ever pushed to git history in the past, rotate the database password and secrets before using them.

### 3. Run the server
```bash
npm start
```
Server runs on `http://localhost:2212` by default.

### 4. Run tests
```bash
npm test
```

⚠️ **Heads up:** the tests in this repo are integration tests — they call the real API which hits the real database configured in `.env`. They need:
- Network access to your Postgres database
- At least one row already in `menu_items`

They are **not** unit tests with a mocked database, so running `npm test` will create and delete real rows (test users, in particular) in whatever database `DATABASE_URL` points to. Don't point this at production data.

## API Reference

All routes are prefixed with `/api/v1`.

### Auth

| Method | Route | Auth required | Description |
|---|---|---|---|
| POST | `/signup` | No | Create an account. Body: `{ username, email, password }`. Password must be 8+ chars with an uppercase, lowercase, and number. |
| POST | `/signin` | No | Log in with `username` or `email` + `password`. Returns a JWT. |

### Menu & Orders (customer)

| Method | Route | Auth required | Description |
|---|---|---|---|
| GET | `/menu` | JWT | Returns the menu, grouped by category. |
| POST | `/place-order` | JWT | Places an order. Body: `{ customer_name, phone, address, items: [{ menu_item_id, quantity }] }`. |
| GET | `/order-history` | JWT | Returns the logged-in user's past orders. |
| PATCH | `/cancel-order` | JWT | Cancels an order — only allowed before it's "Out For Delivery" or already delivered/cancelled. Body: `{ order_id }`. |

### Orders (admin)

| Method | Route | Auth required | Description |
|---|---|---|---|
| GET | `/orders` | Admin key | Returns every order in the system. |
| PATCH | `/orders/status` | Admin key | Updates an order's status. Body: `{ order_id, status }`. Status must be one of `Preparing`, `Out For Delivery`, `Delivered`. |

**Auth header for user routes:** `Authorization: Bearer <token>`
**Auth header for admin routes:** `x-admin-key: <ADMIN_SECRET>`

### Real-time updates

Connect to the Socket.IO server and:
- `socket.emit('join_order', orderId)` — join a room to get live updates for a specific order.
- `socket.emit('join_admin')` — join the admin room to get live updates for every order.

When an order's status changes (via `/orders/status` or `/cancel-order`), the server emits:
- `status_update` to the order's room — `{ order_id, status }`
- `order_status_changed` to the admin room — the full updated order


