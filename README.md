# 🥐 Editorial Patisserie — MERN Full-Stack E-Commerce

A premium artisan bakery e-commerce application built with the MERN stack (MongoDB, Express, React, Node.js).

## ✦ Design System
- **"The Artisanal Gallery"** — editorial patisserie aesthetic
- Fonts: Plus Jakarta Sans (headlines), Be Vietnam Pro (body)
- Colors: Warm cocoa, cream, berry-pink palette
- No-border rule: depth through tonal layering

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URL)

### 1. Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Seed the Database

```bash
cd server
node config/seed.js
```

This creates:
- **Admin**: `admin@patisserie.com` / `admin123`
- **Customer**: `customer@patisserie.com` / `customer123`
- 12 artisan bakery products

### 3. Start Development Servers

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

---

## 📁 Project Structure

```
├── server/                 # Express.js Backend
│   ├── config/
│   │   ├── db.js          # MongoDB connection
│   │   └── seed.js        # Database seeder
│   ├── controllers/       # Route handlers
│   ├── middleware/         # JWT auth, admin guard
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   └── server.js          # Entry point
│
├── client/                 # React + Vite Frontend
│   ├── src/
│   │   ├── api/           # Axios instance
│   │   ├── components/    # Layout, shop components
│   │   ├── pages/         # All page views
│   │   ├── store/         # Zustand state stores
│   │   ├── App.jsx        # Router & layout
│   │   └── index.css      # Tailwind + design tokens
│   └── vite.config.js     # Vite + Tailwind config
```

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/products` | — | List products |
| GET | `/api/products/:id` | — | Product details |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| POST | `/api/orders` | User | Create order |
| GET | `/api/orders` | Admin | All orders |
| GET | `/api/orders/my` | User | My orders |
| PUT | `/api/orders/:id` | Admin | Update status |

## 🎨 Pages

- **Home** — Hero, featured carousel, reviews bento grid
- **Shop** — Category filters, sort, animated product grid
- **Product Details** — Image gallery, qty selector, related items
- **Cart** — Animated items, summary, checkout CTA
- **Checkout** — Delivery form, payment method, order confirmation
- **Login/Register** — Auth with toggle, Google OAuth placeholder
- **Admin Dashboard** — Revenue stats, product CRUD, order management
