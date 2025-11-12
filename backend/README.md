# Cafe SaaS Backend

A production-ready **multi-tenant café management system** built with **Node.js, Express, TypeScript, and Prisma**.

## Features

- 🏢 **Multi-tenant architecture** - Support multiple café businesses
- 🔐 **JWT authentication** - Secure token-based auth
- 📊 **Dashboard & Analytics** - Real-time statistics and reporting
- 🛒 **Order Management** - Track orders, KOT (Kitchen Order Ticket)
- 📋 **Menu Management** - Dynamic menu items and categories
- 💰 **Billing System** - Invoices and payment tracking
- 📦 **Inventory Management** - Stock tracking and low stock alerts
- 👥 **Staff Management** - Employee roles and permissions
- 📄 **Reporting** - Export sales, inventory, and staff reports
- 🔔 **WebSocket Support** - Real-time notifications via Socket.IO
- 🎯 **Rate Limiting** - Protect against abuse
- 🚀 **Queue Management** - Background job processing with Bull MQ & Redis

## Tech Stack

- **Runtime**: Node.js (22+)
- **Language**: TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Cache/Queue**: Redis, Bull MQ
- **Real-time**: Socket.IO
- **Logging**: Pino
- **Testing**: Vitest

## Project Structure

```
cafe-saas-backend/
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── server.ts              # HTTP server bootstrap
│   ├── sockets.ts             # WebSocket configuration
│   ├── config/
│   │   ├── db.config.ts       # Prisma client
│   │   ├── env.config.ts      # Environment variables
│   │   ├── logger.ts          # Pino logger
│   │   └── cors.config.ts     # CORS & security headers
│   ├── routes/
│   │   ├── index.ts           # Route aggregator
│   │   ├── auth.routes.ts
│   │   ├── tenant.routes.ts
│   │   ├── booking.routes.ts
│   │   ├── order.routes.ts
│   │   ├── kot.routes.ts
│   │   ├── billing.routes.ts
│   │   ├── inventory.routes.ts
│   │   ├── dashboard.routes.ts
│   │   ├── staff.routes.ts
│   │   ├── menu.routes.ts
│   │   ├── upload.routes.ts
│   │   └── report.routes.ts
│   ├── controllers/           # Request handlers
│   ├── services/              # Business logic & DB operations
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── tenant.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── validate.middleware.ts
│   │   └── rateLimiter.middleware.ts
│   ├── utils/
│   │   ├── jwt.util.ts
│   │   └── response.util.ts
│   └── queues/
│       └── queue.config.ts    # Bull MQ setup
├── prisma/
│   ├── schema.prisma          # Data model
│   ├── migrations/            # Database migrations
│   └── seed.ts                # Database seeding
├── worker/
│   └── index.ts               # Background job worker
├── .env                       # Environment variables
├── .env.example
├── package.json
├── tsconfig.json
├── docker-compose.yml
└── README.md
```

## Prerequisites

- **Node.js 22+** - [Download](https://nodejs.org/)
- **PostgreSQL 14+** - [Download](https://www.postgresql.org/)
- **Redis 7+** (optional, for queues) - [Download](https://redis.io/)
- **npm** or **yarn**

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/JT4563/cafe-backend.git
cd cafe-saas-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
# Edit .env with your database, JWT, S3, and other credentials
```

### 4. Setup database

```bash
# Run Prisma migrations
npm run prisma:migrate

# (Optional) Seed with sample data
npx prisma db seed
```

### 5. Start development server

```bash
npm run dev
```

Server will run on **`http://localhost:4000`**

## Available Scripts

```bash
# Development with hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

## Troubleshooting npm install Issues

### Issue 1: ES Module vs CommonJS Conflict

**Error**: `Must use import to load ES Module`

**Solution**: The project uses ES Modules (ESNext). Ensure:

- `package.json` has `"type": "module"`
- `tsconfig.json` has `"module": "ESNext"`
- `npm run dev` uses correct loader: `ts-node-dev --loader ts-node/esm`

### Issue 2: Peer Dependency Conflicts

**Error**: `peer dependencies not met`

**Solution**:

```bash
npm install --legacy-peer-deps
```

### Issue 3: Module Not Found

**Error**: `Cannot find module 'X'`

**Solution**:

```bash
npm install
npx tsc --noEmit  # Check TypeScript errors
rm -rf node_modules package-lock.json
npm install
```

### Issue 4: Node Modules Permission Denied (Windows)

**Error**: `EPERM: operation not permitted`

**Solution**:

```bash
# Run as Administrator or use:
npm install --prefer-offline --no-audit
```

## API Documentation

### Authentication

#### Register

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "tenantName": "My Cafe"
}
```

#### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "tenantId": "tenant_456"
    }
  }
}
```

### Orders

#### Get Orders

```http
GET /api/v1/orders/:tenantId
Authorization: Bearer <token>
```

#### Create Order

```http
POST /api/v1/orders/:tenantId
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    { "menuItemId": "item_123", "quantity": 2, "specialRequest": "No sugar" }
  ],
  "tableNumber": 5,
  "totalAmount": 250.00
}
```

### Menu

#### Get Menu Items

```http
GET /api/v1/menu/:tenantId?category=beverages
Authorization: Bearer <token>
```

#### Create Menu Item

```http
POST /api/v1/menu/:tenantId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Cappuccino",
  "category": "beverages",
  "price": 150.00,
  "description": "Classic Italian coffee"
}
```

### Billing

#### Get Billing Summary

```http
GET /api/v1/billing/summary/:tenantId
Authorization: Bearer <token>
```

## Deployment

### Using Docker

```bash
# Build Docker image
docker build -f Dockerfile.api -t cafe-saas-backend .

# Run container
docker run -p 4000:4000 --env-file .env cafe-saas-backend
```

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api
```

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a Pull Request

## License

MIT License - See LICENSE file

## Support

For issues, questions, or suggestions:

- Create an issue on [GitHub Issues](https://github.com/JT4563/cafe-backend/issues)
