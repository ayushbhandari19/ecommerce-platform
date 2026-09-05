# E-Commerce Platform

A production-ready full-stack e-commerce platform built with Next.js, Express, Prisma, and PostgreSQL.

The project implements the core functionality of a modern online store, including authentication, product and category management, cart and checkout flows, orders, payments, wishlist, reviews, and an admin dashboard.

## Live Demo

- Frontend: https://ecommerce-platform-6uoew4z2s-ayush-e822.vercel.app
- Backend API: https://ecommerce-backend-uci2.onrender.com

## Architecture

Next.js Frontend
       |
       | REST API
       v
Express Backend
       |
   Prisma ORM
       |
       v
PostgreSQL Database

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- Express
- Prisma ORM
- Zod
- JWT
- bcryptjs

### Database
- PostgreSQL

### Testing
- Vitest
- Supertest
- Prisma

**76/76 backend tests passing**

## Features

### Authentication

- User registration
- User login
- JWT-based authentication
- Authenticated user profile
- Password hashing with bcrypt
- Role-based access control
- Customer and admin roles

### Products

- Product listing
- Product details
- Category filtering
- Product sorting
- Stock management
- Product creation
- Product updates
- Product deletion
- Admin product management

### Categories

- Category listing
- Category creation
- Category updates
- Category deletion
- Admin-only category management

### Shopping Cart

- Add products to cart
- Update quantities
- Remove items
- Clear cart
- Stock validation
- Quantity limits

### Checkout & Orders

- Checkout flow
- Order creation
- Order history
- Order details
- Order ownership protection
- Stock deduction
- Order status management

Supported order states:

PENDING → CONFIRMED → SHIPPED → DELIVERED
   │          │
   └──────────┴──→ CANCELLED

### Payments

- Payment creation
- Payment status tracking
- Duplicate payment protection
- Payment ownership validation
- Payment confirmation
- Failed payment handling
- Transaction-safe payment operations

### Wishlist

- Add products to wishlist
- Remove products
- View wishlist
- Ownership protection

### Reviews

- Product reviews
- Review creation
- Review validation
- Review ownership protection

### Admin Dashboard

- Admin authentication
- Product management
- Category management
- Order management
- Order status updates
- Admin order details
- Role-based route protection

## API

The backend exposes REST endpoints for:

- `/api/health`
- `/api/auth`
- `/api/products`
- `/api/categories`
- `/api/cart`
- `/api/orders`
- `/api/payments`
- `/api/wishlist`
- `/api/reviews`

Authenticated endpoints use JWT bearer authentication:

```text
Authorization: Bearer <JWT_TOKEN>
```

## Project Structure

```text
ecommerce-platform/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── controllers/
│   │   ├── lib/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── app/
│   │   ├── admin/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── login/
│   │   ├── orders/
│   │   ├── payment/
│   │   ├── products/
│   │   └── register/
│   ├── components/
│   │   ├── auth/
│   │   ├── layout/
│   │   ├── products/
│   │   └── providers/
│   ├── lib/
│   └── types/
│
├── docs/
├── .gitignore
└── README.md
```

## Database Models

The main Prisma models include:

- User
- Category
- Product
- Cart
- CartItem
- WishlistItem
- Order
- OrderItem
- Payment
- Review

## Testing

The backend test suite is built with Vitest and Supertest and uses Prisma for database operations.

Current result:

**76/76 tests passing**

The tests cover authentication, authorization, products, categories, cart operations, orders, payments, wishlist, reviews, validation, ownership protection, stock handling, and payment state transitions.

## Local Development

### Backend

```bash
cd backend
npm install
```

Create a `.env` file based on `.env.example`:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@HOST:5432/DATABASE_NAME"
PORT=5001
JWT_SECRET="replace_with_a_long_random_secret"
FRONTEND_URL="http://localhost:3000"
```

Generate the Prisma client and run migrations:

```bash
npx prisma generate
npx prisma migrate dev
node prisma/seed.js
```

Start the backend:

```bash
npm run dev
```

The API runs on `http://localhost:5001`.

### Frontend

In a separate terminal:

```bash
cd frontend
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

Start the frontend:

```bash
npm run dev
```

The frontend runs on `http://localhost:3000`.

## Production Deployment

The application is deployed using:

- **Frontend:** Next.js on Vercel
- **Backend:** Express on Render
- **Database:** PostgreSQL on Neon

Production secrets and environment variables are configured through the hosting platforms and are not committed to the repository.

## Security

The application includes several production-oriented security measures:

- JWT authentication
- Explicit JWT algorithm verification
- Password hashing with bcrypt
- Role-based authorization
- Resource ownership checks
- Zod request validation
- Helmet security headers
- Restricted CORS configuration
- API rate limiting
- Login-specific rate limiting
- Transaction-based database operations
- Stock validation
- Duplicate payment protection
- Environment-based configuration
- Secrets excluded from version control

## Engineering Highlights

This project focuses on backend correctness and real-world application behavior rather than only basic CRUD operations.

Key implementation areas include:

- Transaction-safe order creation
- Inventory and stock handling
- Payment state management
- Valid order status transitions
- User resource ownership protection
- Admin authorization
- Request validation
- Centralized error handling
- API rate limiting
- Production environment configuration
- Automated API testing

## Project Status

The core application is complete and deployed.

- Frontend: **Live**
- Backend API: **Live**
- PostgreSQL database: **Production**
- Authentication: **Complete**
- Cart & checkout: **Complete**
- Orders: **Complete**
- Payments: **Complete**
- Wishlist: **Complete**
- Reviews: **Complete**
- Admin dashboard: **Complete**
- Automated tests: **76/76 passing**

## License

This project is currently intended as a portfolio and learning project.
