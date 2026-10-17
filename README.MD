# WrapMate

WrapMate is a web-based bubble wrap packaging **order management** system for a
cellphone & accessories shop. It records box-shaped products, calculates exactly
how much bubble wrap each order needs, tracks orders through a fulfillment
queue, and reports income and material usage.

## The bubble wrap formula

For every order WrapMate computes the required wrap length from the product's
box dimensions and the chosen protection level:

```
L = 2 × (W + H) × P + 5
```

- **W** – box width (cm)
- **H** – box height (cm)
- **P** – protection level / number of layers (1, 2 or 3)
- **5** – fixed packaging allowance (cm)

> **Box-shaped products only.** The formula is perimeter-based, so it is valid
> only for square / rectangular (boxed) items. Irregular or round products
> (vases, balls, tubes, etc.) are not supported.

## Tech stack

**Frontend**
- React + [Refine](https://refine.dev/) (admin framework)
- Vite (dev server & build)
- Tailwind CSS (styling)
- Recharts (charts)

**Backend**
- Node.js + Express REST API
- JWT authentication (`jsonwebtoken`) + bcrypt password hashing
- [Supabase](https://supabase.com/) (PostgreSQL) as the database
- [Cloudinary](https://cloudinary.com/) for product / avatar image uploads
- Multer for multipart upload handling

## Project layout

```
.
├── src/                 # React + Refine frontend
│   ├── backend/         # API client, auth provider, data types
│   └── frontend/        # pages, components, hooks
├── backend/             # Express API server
│   ├── src/             # routes, auth, supabase + cloudinary clients
│   └── schema.sql       # database schema (run in Supabase)
└── public/              # static assets
```

## Setup

### Prerequisites
- Node.js 18+ and npm
- A Supabase project (URL + service role key)
- A Cloudinary account (cloud name + API key/secret)

### 1. Configure the backend environment
Copy the example env file and fill in your keys:

```bash
cp backend/.env.example backend/.env
```

Set the following in `backend/.env`:
- `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`
- `JWT_SECRET` – **required**; a long random string (the server refuses to
  start without it)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `FRONTEND_URL`, `PORT` (optional overrides)

> Never commit `backend/.env`.

### 2. Create the database schema
Open the Supabase dashboard → **SQL Editor** → **New query**, paste the contents
of `backend/schema.sql`, and run it. The script is re-runnable: it creates the
`users`, `products`, `orders` and `counters` tables, adds the unique constraints
on `order_code` / `sku`, and installs the atomic `next_counter()` function.

### 3. Start the backend API

```bash
cd backend
npm install
npm run dev        # http://localhost:4000
```

### 4. Start the frontend
From the project root (optionally copy `.env.example` to `.env` to point
`VITE_API_URL` at the backend):

```bash
npm install
npm run dev        # http://localhost:5173
```

Open the frontend in your browser, register an account on the sign-up page, and
sign in.

## Features (page by page)

- **Dashboard** – at-a-glance overview: total orders, bubble wrap used and
  average wrap length (completed orders), a bubble-wrap-usage chart, and a
  recent-activity feed.
- **Order Queue** – create orders (customer + product + protection + quantity),
  watch the wrap length and revenue/profit compute live, change status
  (Pending → Processing → Completed), and delete orders with confirmation.
- **Products** – manage the product catalog (box width/height, cost, selling
  price, image). SKUs are auto-generated (`WM-PROD-001`); wrap-length previews
  are shown per protection level. Deletes require confirmation.
- **Records** – a searchable table of every order for reference and auditing.
- **Analytics** – completed-order insights: revenue and profit per product,
  total bubble wrap used per product, and average wrap length per product.
- **Settings** – update your profile (name, email, avatar) and change your
  password.

## API overview

The backend exposes a REST API under `/api`:

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`,
  `PATCH /api/auth/profile`, `PATCH /api/auth/password`
- `GET/POST /api/products`, `PATCH/DELETE /api/products/:id`
- `GET/POST /api/orders`, `PATCH/DELETE /api/orders/:rowId`
- `POST /api/upload` (Cloudinary image upload)
- `GET /api/stats` (income & wrap-usage summaries, completed orders only)

All data routes require a `Bearer` JWT obtained from login.
