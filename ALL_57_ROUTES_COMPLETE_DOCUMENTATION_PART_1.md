# COMPLETE 57 ROUTES API DOCUMENTATION - PART 1

## All Routes with Exact Request Body, Response Body & Authentication

**Last Updated:** November 12, 2025
**Total Routes Documented:** 57
**Format:** Markdown (Complete Reference)

---

## TABLE OF CONTENTS

1. [AUTH ROUTES (3)](#auth-routes)
2. [BILLING ROUTES (5)](#billing-routes)
3. [BOOKING ROUTES (2)](#booking-routes)
4. [DASHBOARD ROUTES (4)](#dashboard-routes)
5. [INVENTORY ROUTES (5)](#inventory-routes)
6. [KOT ROUTES (2)](#kot-routes)
7. [MENU ROUTES (7)](#menu-routes)
8. [ORDER ROUTES (2)](#order-routes)

---

# AUTH ROUTES

## (3 Routes - Public + Refresh Token)

### Route 1: POST /api/v1/auth/register

**Purpose:** Register new restaurant owner (creates Tenant + Owner User + Default Branch)
**Authentication:** None (Public)
**Middleware:** validateRequest(registerSchema)

#### Request Body:

```json
{
  "email": "owner@pizzahub.com",
  "password": "SecurePass123",
  "name": "John Pizza",
  "tenantName": "Pizza Hub Bangalore"
}
```

#### Request Validation Rules:

```
- email: string, valid email format (required)
- password: string, minimum 6 characters (required)
- name: string (required)
- tenantName: string (required)
```

#### Success Response (201):

```json
{
  "user": {
    "id": "user-001-uuid",
    "tenantId": "tenant-pizzahub-001-uuid",
    "email": "owner@pizzahub.com",
    "name": "John Pizza",
    "role": "OWNER",
    "isActive": true,
    "createdAt": "2025-11-12T10:00:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tenant": {
    "id": "tenant-pizzahub-001-uuid",
    "name": "Pizza Hub Bangalore",
    "currency": "USD",
    "timezone": "UTC",
    "isActive": true,
    "createdAt": "2025-11-12T10:00:00Z"
  }
}
```

#### Error Response (400):

```json
{
  "error": "Email already exists"
}
```

#### Database Changes:

```
Created:
- Tenant { id, name, currency, timezone, isActive }
- User { id, tenantId, email, name, password(hashed), role: OWNER, isActive }
- Branch { id, tenantId, name: "Default" }
```

---

### Route 2: POST /api/v1/auth/login

**Purpose:** Authenticate user and get access tokens
**Authentication:** None (Public)
**Middleware:** validateRequest(loginSchema)

#### Request Body:

```json
{
  "email": "owner@pizzahub.com",
  "password": "SecurePass123"
}
```

#### Request Validation Rules:

```
- email: string, valid email format (required)
- password: string, minimum 6 characters (required)
```

#### Success Response (200):

```json
{
  "user": {
    "id": "user-001-uuid",
    "tenantId": "tenant-pizzahub-001-uuid",
    "email": "owner@pizzahub.com",
    "name": "John Pizza",
    "role": "OWNER",
    "isActive": true,
    "lastLogin": "2025-11-12T10:15:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24h"
}
```

#### Error Response (401):

```json
{
  "error": "Invalid email or password"
}
```

#### Database Changes:

```
Updated:
- User { lastLogin: now() }
```

---

### Route 3: POST /api/v1/auth/refresh

**Purpose:** Refresh access token using refresh token
**Authentication:** None (Public)
**Middleware:** validateRequest(refreshTokenSchema)

#### Request Body:

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Request Validation Rules:

```
- refreshToken: string (required)
```

#### Success Response (200):

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24h"
}
```

#### Error Response (401):

```json
{
  "error": "Invalid refresh token"
}
```

---

# BILLING ROUTES

## (5 Routes - Invoice & Payment Management)

### Route 4: GET /api/v1/billing/:tenantId

**Purpose:** Get all invoices for a tenant
**Authentication:** Required (JWT Bearer Token)
**Middleware:** authMiddleware → tenantMiddleware → validateParams(tenantIdParamSchema)
**Authorization:** Tenant users only

#### URL Parameters:

```
- tenantId: UUID (required)
```

#### Success Response (200):

```json
{
  "invoices": [
    {
      "id": "invoice-001-uuid",
      "tenantId": "tenant-pizzahub-001-uuid",
      "orderId": "order-001-uuid",
      "invoiceNumber": "INV-001",
      "amount": "815.00",
      "tax": "40.00",
      "discount": "0.00",
      "totalAmount": "855.00",
      "status": "DRAFT",
      "dueDate": "2025-12-12T00:00:00Z",
      "createdAt": "2025-11-12T10:20:00Z",
      "updatedAt": "2025-11-12T10:20:00Z"
    },
    {
      "id": "invoice-002-uuid",
      "tenantId": "tenant-pizzahub-001-uuid",
      "orderId": "order-002-uuid",
      "invoiceNumber": "INV-002",
      "amount": "1200.00",
      "tax": "60.00",
      "discount": "100.00",
      "totalAmount": "1160.00",
      "status": "PAID",
      "dueDate": "2025-12-12T00:00:00Z",
      "createdAt": "2025-11-11T14:30:00Z",
      "updatedAt": "2025-11-11T16:00:00Z"
    }
  ],
  "total": 2,
  "page": 1
}
```

#### Error Response (403):

```json
{
  "error": "Unauthorized - Tenant mismatch"
}
```

---

### Route 5: POST /api/v1/billing/:tenantId

**Purpose:** Create new invoice from order
**Authentication:** Required (JWT Bearer Token)
**Middleware:** authMiddleware → tenantMiddleware → validateParams(tenantIdParamSchema) → validateRequest(createInvoiceSchema)
**Authorization:** MANAGER, ACCOUNTANT, OWNER

#### URL Parameters:

```
- tenantId: UUID (required)
```

#### Request Body:

```json
{
  "orderId": "order-001-uuid",
  "amount": 815.0,
  "tax": 40,
  "discount": 0,
  "dueDate": "2025-12-12T00:00:00Z"
}
```

#### Request Validation Rules:

```
- orderId: UUID string (required)
- amount: positive number (required)
- tax: number, minimum 0 (default: 0)
- discount: number, minimum 0 (default: 0)
- dueDate: ISO date (optional)
```

#### Success Response (201):

```json
{
  "id": "invoice-001-uuid",
  "tenantId": "tenant-pizzahub-001-uuid",
  "orderId": "order-001-uuid",
  "invoiceNumber": "INV-001",
  "amount": "815.00",
  "tax": "40.00",
  "discount": "0.00",
  "totalAmount": "855.00",
  "status": "DRAFT",
  "dueDate": "2025-12-12T00:00:00Z",
  "createdAt": "2025-11-12T10:20:00Z",
  "updatedAt": "2025-11-12T10:20:00Z"
}
```

#### Database Changes:

```
Created:
- Invoice { id, tenantId, orderId, invoiceNumber, amount, tax, discount, status: DRAFT, dueDate }

Audit Log:
- INVOICE_CREATED action recorded
```

---

### Route 6: GET /api/v1/billing/:tenantId/summary

**Purpose:** Get billing summary (total revenue, paid, pending)
**Authentication:** Required (JWT Bearer Token)
**Middleware:** authMiddleware → tenantMiddleware → validateParams(tenantIdParamSchema)
**Authorization:** ACCOUNTANT, MANAGER, OWNER

#### URL Parameters:

```
- tenantId: UUID (required)
```

#### Success Response (200):

```json
{
  "totalRevenue": "25000.00",
  "totalPaid": "22000.00",
  "totalPending": "3000.00",
  "totalInvoices": 45,
  "paidInvoices": 42,
  "pendingInvoices": 3,
  "overdue": 0,
  "averageInvoiceValue": "555.56",
  "lastUpdated": "2025-11-12T10:30:00Z"
}
```

---

### Route 7: GET /api/v1/billing/:tenantId/invoices/:invoiceId

**Purpose:** Get specific invoice details
**Authentication:** Required (JWT Bearer Token)
**Middleware:** authMiddleware → tenantMiddleware → validateParams(invoiceIdParamSchema)
**Authorization:** ACCOUNTANT, MANAGER, OWNER

#### URL Parameters:

```
- tenantId: UUID (required)
- invoiceId: UUID (required)
```

#### Success Response (200):

```json
{
  "id": "invoice-001-uuid",
  "tenantId": "tenant-pizzahub-001-uuid",
  "orderId": "order-001-uuid",
  "invoiceNumber": "INV-001",
  "amount": "815.00",
  "tax": "40.00",
  "discount": "0.00",
  "totalAmount": "855.00",
  "status": "PAID",
  "dueDate": "2025-12-12T00:00:00Z",
  "paidAt": "2025-11-12T12:00:00Z",
  "items": [
    {
      "id": "item-001",
      "productName": "Margherita Pizza",
      "quantity": 2,
      "price": "350.00",
      "total": "700.00"
    },
    {
      "id": "item-002",
      "productName": "Coca Cola",
      "quantity": 2,
      "price": "50.00",
      "total": "100.00"
    }
  ],
  "payments": [
    {
      "id": "payment-001-uuid",
      "amount": "855.00",
      "method": "CASH",
      "reference": "CASH-PAYMENT-001",
      "status": "COMPLETED",
      "createdAt": "2025-11-12T12:00:00Z"
    }
  ],
  "createdAt": "2025-11-12T10:20:00Z",
  "updatedAt": "2025-11-12T12:00:00Z"
}
```

---

### Route 8: POST /api/v1/billing/:tenantId/invoices/:invoiceId/payments

**Purpose:** Process payment for invoice
**Authentication:** Required (JWT Bearer Token)
**Middleware:** authMiddleware → tenantMiddleware → validateParams(invoiceIdParamSchema) → validateRequest(processPaymentSchema)
**Authorization:** ACCOUNTANT, MANAGER, OWNER

#### URL Parameters:

```
- tenantId: UUID (required)
- invoiceId: UUID (required)
```

#### Request Body:

```json
{
  "amount": 855.0,
  "method": "CASH",
  "reference": "CASH-PAYMENT-001"
}
```

#### Request Validation Rules:

```
- amount: positive number (required)
- method: enum [CASH, CARD, UPI, BANK_TRANSFER, WALLET, CHEQUE] (required)
- reference: string (optional)
```

#### Success Response (200):

```json
{
  "paymentId": "payment-001-uuid",
  "invoiceId": "invoice-001-uuid",
  "amount": "855.00",
  "method": "CASH",
  "reference": "CASH-PAYMENT-001",
  "status": "COMPLETED",
  "invoiceStatus": "PAID",
  "createdAt": "2025-11-12T12:00:00Z"
}
```

#### Error Response (400):

```json
{
  "error": "Payment amount exceeds invoice total"
}
```

#### Database Changes:

```
Created:
- Payment { id, invoiceId, amount, method, reference, status: COMPLETED }

Updated:
- Invoice { status: PAID, paidAt: now() }

Audit Log:
- PAYMENT_PROCESSED action recorded
```

---

# BOOKING ROUTES

## (2 Routes - Table Reservations)

### Route 9: POST /api/v1/bookings/

**Purpose:** Create table booking
**Authentication:** Required (JWT Bearer Token)
**Middleware:** authMiddleware → tenantMiddleware → validateRequest(createBookingSchema)
**Authorization:** WAITER, MANAGER, OWNER

#### Request Body:

```json
{
  "branchId": "branch-001-uuid",
  "tableId": "table-05-uuid",
  "customerName": "Rajesh Singh",
  "customerPhone": "9876543210",
  "partySize": 4,
  "startTime": "2025-11-12T20:00:00Z",
  "endTime": "2025-11-12T21:30:00Z",
  "deposit": 500,
  "notes": "Window side table preferred"
}
```

#### Request Validation Rules:

```
- branchId: UUID (required)
- tableId: UUID (optional)
- customerName: string, 2-100 characters (required)
- customerPhone: string (optional)
- partySize: positive integer (required)
- startTime: ISO date (required)
- endTime: ISO date (required)
- deposit: number, minimum 0 (optional)
- notes: string (optional)
```

#### Success Response (201):

```json
{
  "id": "booking-001-uuid",
  "tenantId": "tenant-pizzahub-001-uuid",
  "branchId": "branch-001-uuid",
  "tableId": "table-05-uuid",
  "customerName": "Rajesh Singh",
  "customerPhone": "9876543210",
  "partySize": 4,
  "startTime": "2025-11-12T20:00:00Z",
  "endTime": "2025-11-12T21:30:00Z",
  "deposit": "500.00",
  "notes": "Window side table preferred",
  "status": "CONFIRMED",
  "createdAt": "2025-11-12T14:00:00Z",
  "updatedAt": "2025-11-12T14:00:00Z"
}
```

#### Database Changes:

```
Created:
- Booking { id, tenantId, branchId, tableId, customerName, customerPhone, partySize, startTime, endTime, deposit, notes, status: CONFIRMED }

Audit Log:
- BOOKING_CREATED action recorded
```

---

### Route 10: GET /api/v1/bookings/branch/:branchId

**Purpose:** Get all bookings for a branch
**Authentication:** Required (JWT Bearer Token)
**Middleware:** authMiddleware → tenantMiddleware → validateParams(branchIdParamSchema)
**Authorization:** Tenant users

#### URL Parameters:

```
- branchId: UUID (required)
```

#### Query Parameters (Optional):

```
- status: enum [PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW]
- from: ISO date (to filter bookings after this date)
- to: ISO date (to filter bookings before this date)
- page: positive integer (default: 1)
- limit: positive integer, max 100 (default: 50)
```

#### Success Response (200):

```json
{
  "bookings": [
    {
      "id": "booking-001-uuid",
      "tenantId": "tenant-pizzahub-001-uuid",
      "branchId": "branch-001-uuid",
      "tableId": "table-05-uuid",
      "customerName": "Rajesh Singh",
      "customerPhone": "9876543210",
      "partySize": 4,
      "startTime": "2025-11-12T20:00:00Z",
      "endTime": "2025-11-12T21:30:00Z",
      "deposit": "500.00",
      "status": "CONFIRMED",
      "createdAt": "2025-11-12T14:00:00Z"
    },
    {
      "id": "booking-002-uuid",
      "tenantId": "tenant-pizzahub-001-uuid",
      "branchId": "branch-001-uuid",
      "tableId": "table-08-uuid",
      "customerName": "Priya Sharma",
      "customerPhone": "9123456789",
      "partySize": 2,
      "startTime": "2025-11-12T19:00:00Z",
      "endTime": "2025-11-12T20:30:00Z",
      "deposit": "0.00",
      "status": "PENDING",
      "createdAt": "2025-11-12T13:30:00Z"
    }
  ],
  "total": 2,
  "page": 1,
  "limit": 50
}
```

---

# DASHBOARD ROUTES

## (4 Routes - Analytics & Metrics)

### Route 11: GET /api/v1/dashboard/overview/:tenantId

**Purpose:** Get dashboard overview (total orders, revenue, customers, etc.)
**Authentication:** Required (JWT Bearer Token)
**Middleware:** authMiddleware → tenantMiddleware → validateParams(tenantIdParamSchema)
**Authorization:** MANAGER, OWNER

#### URL Parameters:

```
- tenantId: UUID (required)
```

#### Success Response (200):

```json
{
  "totalOrders": 45,
  "totalRevenue": "25000.00",
  "totalCustomers": 30,
  "averageOrderValue": "556.00",
  "todayOrders": 5,
  "todayRevenue": "2800.00",
  "weekOrders": 28,
  "weekRevenue": "15600.00",
  "monthOrders": 45,
  "monthRevenue": "25000.00",
  "lastUpdated": "2025-11-12T10:30:00Z"
}
```

---

### Route 12: GET /api/v1/dashboard/analytics/:tenantId

**Purpose:** Get sales analytics with date range
**Authentication:** Required (JWT Bearer Token)
**Middleware:** authMiddleware → tenantMiddleware → validateParams(tenantIdParamSchema) → validateQuery(analyticsQuerySchema)
**Authorization:** MANAGER, OWNER

#### URL Parameters:

```
- tenantId: UUID (required)
```

#### Query Parameters (Required):

```
- startDate: date (format: YYYY-MM-DD)
- endDate: date (format: YYYY-MM-DD)
```

#### Success Response (200):

```json
{
  "startDate": "2025-11-01",
  "endDate": "2025-11-12",
  "dailyAnalytics": [
    {
      "date": "2025-11-01",
      "revenue": "5000.00",
      "orders": 10,
      "customers": 8,
      "averageOrderValue": "500.00"
    },
    {
      "date": "2025-11-02",
      "revenue": "5500.00",
      "orders": 12,
      "customers": 9,
      "averageOrderValue": "458.33"
    }
  ],
  "totalRevenue": "25000.00",
  "totalOrders": 45,
  "totalCustomers": 30,
  "averageOrderValue": "556.00",
  "bestDay": {
    "date": "2025-11-05",
    "revenue": "3200.00",
    "orders": 8
  }
}
```

---

### Route 13: GET /api/v1/dashboard/charts/:tenantId

**Purpose:** Get revenue chart data
**Authentication:** Required (JWT Bearer Token)
**Middleware:** authMiddleware → tenantMiddleware → validateParams(tenantIdParamSchema)
**Authorization:** MANAGER, OWNER

#### URL Parameters:

```
- tenantId: UUID (required)
```

#### Success Response (200):

```json
{
  "chartType": "line",
  "data": {
    "labels": ["Nov 1", "Nov 2", "Nov 3", "Nov 4", "Nov 5"],
    "datasets": [
      {
        "label": "Revenue",
        "data": [5000, 5500, 4800, 5200, 3200],
        "borderColor": "#4CAF50",
        "backgroundColor": "rgba(76, 175, 80, 0.1)"
      },
      {
        "label": "Orders",
        "data": [10, 12, 10, 11, 8],
        "borderColor": "#2196F3",
        "backgroundColor": "rgba(33, 150, 243, 0.1)"
      }
    ]
  },
  "period": "last_7_days"
}
```

---

### Route 14: GET /api/v1/dashboard/top-products/:tenantId

**Purpose:** Get top selling products
**Authentication:** Required (JWT Bearer Token)
**Middleware:** authMiddleware → tenantMiddleware → validateParams(tenantIdParamSchema) → validateQuery(topProductsQuerySchema)
**Authorization:** MANAGER, OWNER

#### URL Parameters:

```
- tenantId: UUID (required)
```

#### Query Parameters (Optional):

```
- limit: positive integer, 1-100 (default: 10)
```

#### Success Response (200):

```json
{
  "topProducts": [
    {
      "id": "product-001-uuid",
      "name": "Margherita Pizza",
      "category": "Pizza",
      "quantity": 120,
      "revenue": "42000.00",
      "averagePrice": "350.00"
    },
    {
      "id": "product-002-uuid",
      "name": "Paneer Pizza",
      "category": "Pizza",
      "quantity": 95,
      "revenue": "38000.00",
      "averagePrice": "400.00"
    },
    {
      "id": "product-003-uuid",
      "name": "Coca Cola",
      "category": "Beverages",
      "quantity": 200,
      "revenue": "10000.00",
      "averagePrice": "50.00"
    }
  ],
  "limit": 10,
  "period": "last_30_days"
}
```

---

# INVENTORY ROUTES

## (5 Routes - Stock Management)

### Route 15: GET /api/v1/inventory/:tenantId

**Purpose:** Get all inventory items
**Authentication:** Required (JWT Bearer Token)
**Middleware:** authMiddleware → tenantMiddleware → validateParams(tenantIdParamSchema) → validateQuery(inventoryQuerySchema)
**Authorization:** MANAGER, ACCOUNTANT, OWNER

#### URL Parameters:

```
- tenantId: UUID (required)
```

#### Query Parameters (Optional):

```
- branchId: UUID
- page: positive integer (default: 1)
- limit: positive integer, 1-100 (default: 50)
```

#### Success Response (200):

```json
{
  "items": [
    {
      "id": "stock-001-uuid",
      "tenantId": "tenant-pizzahub-001-uuid",
      "productId": "product-001-uuid",
      "productName": "Margherita Pizza",
      "qty": 98,
      "minQty": 20,
      "status": "OK",
      "lastUpdated": "2025-11-12T10:00:00Z"
    },
    {
      "id": "stock-002-uuid",
      "tenantId": "tenant-pizzahub-001-uuid",
      "productId": "product-002-uuid",
      "productName": "Paneer Pizza",
      "qty": 130,
      "minQty": 15,
      "status": "OK",
      "lastUpdated": "2025-11-12T09:30:00Z"
    },
    {
      "id": "stock-003-uuid",
      "tenantId": "tenant-pizzahub-001-uuid",
      "productId": "product-003-uuid",
      "productName": "Coca Cola",
      "qty": 198,
      "minQty": 50,
      "status": "OK",
      "lastUpdated": "2025-11-11T15:00:00Z"
    }
  ],
  "total": 3,
  "page": 1,
  "limit": 50
}
```

---

### Route 16: GET /api/v1/inventory/:tenantId/low-stock

**Purpose:** Get low stock items (qty <= minQty)
**Authentication:** Required (JWT Bearer Token)
**Middleware:** authMiddleware → tenantMiddleware → validateParams(tenantIdParamSchema) → validateQuery(lowStockQuerySchema)
**Authorization:** MANAGER, ACCOUNTANT, OWNER

#### URL Parameters:

```
- tenantId: UUID (required)
```

#### Query Parameters (Optional):

```
- branchId: UUID
```

#### Success Response (200):

```json
{
  "lowStockItems": [
    {
      "id": "stock-004-uuid",
      "tenantId": "tenant-pizzahub-001-uuid",
      "productId": "product-004-uuid",
      "productName": "Garlic Bread",
      "qty": 8,
      "minQty": 10,
      "variance": -2,
      "action": "URGENT_REORDER",
      "lastUpdated": "2025-11-12T08:00:00Z"
    }
  ],
  "totalLowStockItems": 1,
  "alertLevel": "WARNING"
}
```

---

### Route 17: POST /api/v1/inventory/:tenantId

**Purpose:** Create new inventory item
**Authentication:** Required (JWT Bearer Token)
**Middleware:** authMiddleware → tenantMiddleware → validateParams(tenantIdParamSchema) → validateRequest(createInventoryItemSchema)
**Authorization:** MANAGER, OWNER

#### URL Parameters:

```
- tenantId: UUID (required)
```

#### Request Body:

```json
{
  "productId": "product-001-uuid",
  "qty": 100,
  "minQty": 20
}
```

#### Request Validation Rules:

```
- productId: UUID (required)
- qty: integer, minimum 0 (required)
- minQty: integer, minimum 0 (default: 10)
```

#### Success Response (201):

```json
{
  "id": "stock-001-uuid",
  "tenantId": "tenant-pizzahub-001-uuid",
  "productId": "product-001-uuid",
  "productName": "Margherita Pizza",
  "qty": 100,
  "minQty": 20,
  "status": "OK",
  "createdAt": "2025-11-12T10:00:00Z",
  "updatedAt": "2025-11-12T10:00:00Z"
}
```

#### Database Changes:

```
Created:
- StockItem { id, tenantId, productId, qty, minQty }

Audit Log:
- STOCK_CREATED action recorded
```

---

### Route 18: PUT /api/v1/inventory/:itemId

**Purpose:** Update inventory item (qty, minQty)
**Authentication:** Required (JWT Bearer Token)
**Middleware:** authMiddleware → tenantMiddleware → validateParams(itemIdParamSchema) → validateRequest(updateInventoryItemSchema)
**Authorization:** MANAGER, OWNER

#### URL Parameters:

```
- itemId: UUID (required)
```

#### Request Body (at least one field required):

```json
{
  "qty": 85,
  "minQty": 15
}
```

#### Request Validation Rules:

```
- qty: integer, minimum 0 (optional)
- minQty: integer, minimum 0 (optional)
- NOTE: At least one field must be provided
```

#### Success Response (200):

```json
{
  "id": "stock-002-uuid",
  "tenantId": "tenant-pizzahub-001-uuid",
  "productId": "product-002-uuid",
  "productName": "Paneer Pizza",
  "qty": 85,
  "minQty": 15,
  "status": "OK",
  "previousQty": 80,
  "qtyChanged": 5,
  "updatedAt": "2025-11-12T11:00:00Z"
}
```

#### Database Changes:

```
Updated:
- StockItem { qty, minQty, updatedAt: now() }

Created:
- StockMovement { type: UPDATE, oldQty, newQty, difference }

Audit Log:
- STOCK_UPDATED action recorded
```

---

### Route 19: DELETE /api/v1/inventory/:itemId

**Purpose:** Delete inventory item
**Authentication:** Required (JWT Bearer Token)
**Middleware:** authMiddleware → tenantMiddleware → validateParams(itemIdParamSchema)
**Authorization:** OWNER (only)

#### URL Parameters:

```
- itemId: UUID (required)
```

#### Success Response (200):

```json
{
  "message": "Inventory item deleted successfully",
  "itemId": "stock-004-uuid",
  "productName": "Garlic Bread",
  "deletedAt": "2025-11-12T12:00:00Z"
}
```

#### Error Response (403):

```json
{
  "error": "Only OWNER can delete inventory items"
}
```

#### Database Changes:

```
Deleted:
- StockItem { id } (soft delete or hard delete depending on implementation)

Audit Log:
- STOCK_DELETED action recorded
```

---

# KOT ROUTES

## (2 Routes - Kitchen Order Ticket)

### Route 20: GET /api/v1/kot/branch/:branchId

**Purpose:** Get KOT tickets for branch
**Authentication:** Required (JWT Bearer Token)
**Middleware:** authMiddleware → tenantMiddleware → validateParams(branchIdParamSchema) → validateQuery(kotQuerySchema)
**Authorization:** KITCHEN, MANAGER, OWNER

#### URL Parameters:

```
- branchId: UUID (required)
```

#### Query Parameters (Optional):

```
- page: positive integer (default: 1)
- limit: positive integer, 1-100 (default: 50)
- printed: boolean (filter by print status)
```

#### Success Response (200):

```json
{
  "kots": [
    {
      "id": "kot-001-uuid",
      "tenantId": "tenant-pizzahub-001-uuid",
      "branchId": "branch-001-uuid",
      "orderId": "order-001-uuid",
      "tableId": "table-05-uuid",
      "items": [
        {
          "id": "item-001",
          "productName": "Margherita Pizza",
          "qty": 2,
          "specialRequest": "Extra cheese"
        },
        {
          "id": "item-002",
          "productName": "Coca Cola",
          "qty": 2
        }
      ],
      "printed": false,
      "printedAt": null,
      "createdAt": "2025-11-12T19:31:00Z"
    }
  ],
  "total": 1,
  "page": 1
}
```

---

### Route 21: POST /api/v1/kot/:id/print

**Purpose:** Print KOT ticket to kitchen printer
**Authentication:** Required (JWT Bearer Token)
**Middleware:** authMiddleware → tenantMiddleware → validateParams(kotIdParamSchema)
**Authorization:** WAITER, KITCHEN, MANAGER, OWNER

#### URL Parameters:

```
- id: KOT ID (UUID, required)
```

#### Request Body:

```json
{}
```

(No body required - POST to trigger print action)

#### Success Response (200):

```json
{
  "id": "kot-001-uuid",
  "orderId": "order-001-uuid",
  "printed": true,
  "printedAt": "2025-11-12T19:32:00Z",
  "message": "KOT printed successfully"
}
```

#### Error Response (400):

```json
{
  "error": "KOT already printed"
}
```

#### Database Changes:

```
Updated:
- KOT { printed: true, printedAt: now() }

Audit Log:
- KOT_PRINTED action recorded
```

---

# MENU ROUTES

## (7 Routes - Menu Management)

### Route 22: GET /api/v1/menu/:tenantId

**Purpose:** Get all menu items
**Authentication:** Required (JWT Bearer Token)
**Middleware:** authMiddleware → tenantMiddleware → validateParams(tenantIdParamSchema) → validateQuery(menuQuerySchema)
**Authorization:** All authenticated users

#### URL Parameters:

```
- tenantId: UUID (required)
```

#### Query Parameters (Optional):

```
- category: string (filter by category)
- branchId: UUID
- page: positive integer (default: 1)
- limit: positive integer, 1-100 (default: 50)
```

#### Success Response (200):

```json
{
  "items": [
    {
      "id": "item-001-uuid",
      "tenantId": "tenant-pizzahub-001-uuid",
      "sku": "PIZZA-001",
      "name": "Margherita Pizza",
      "description": "Classic pizza with tomato, mozzarella, and basil",
      "category": "Pizza",
      "price": "350.00",
      "costPrice": "150.00",
      "isInventoryTracked": true,
      "isActive": true,
      "createdAt": "2025-11-10T10:00:00Z"
    },
    {
      "id": "item-002-uuid",
      "tenantId": "tenant-pizzahub-001-uuid",
      "sku": "PIZZA-002",
      "name": "Paneer Pizza",
      "description": "Pizza with paneer, peppers, and onions",
      "category": "Pizza",
      "price": "400.00",
      "costPrice": "180.00",
      "isInventoryTracked": true,
      "isActive": true,
      "createdAt": "2025-11-10T10:00:00Z"
    }
  ],
  "total": 4,
  "page": 1,
  "limit": 50
}
```

---

### Route 23: POST /api/v1/menu/:tenantId

**Purpose:** Create new menu item
**Authentication:** Required (JWT Bearer Token)
**Middleware:** authMiddleware → tenantMiddleware → validateParams(tenantIdParamSchema) → validateRequest(createMenuItemSchema)
**Authorization:** MANAGER, OWNER

#### URL Parameters:

```
- tenantId: UUID (required)
```

#### Request Body:

```json
{
  "sku": "PIZZA-003",
  "name": "Margherita Pizza",
  "description": "Classic pizza with tomato, mozzarella, and basil",
  "category": "Pizza",
  "price": 350,
  "costPrice": 150,
  "isInventoryTracked": true
}
```

#### Request Validation Rules:

```
- sku: string (optional)
- name: string, 1-100 characters (required)
- description: string, 0-500 characters (optional)
- category: string, 0-50 characters (optional)
- price: positive number (required)
- costPrice: positive number (optional)
- isInventoryTracked: boolean (optional)
```

#### Success Response (201):

```json
{
  "id": "item-001-uuid",
  "tenantId": "tenant-pizzahub-001-uuid",
  "sku": "PIZZA-003",
  "name": "Margherita Pizza",
  "description": "Classic pizza with tomato, mozzarella, and basil",
  "category": "Pizza",
  "price": "350.00",
  "costPrice": "150.00",
  "isInventoryTracked": true,
  "isActive": true,
  "createdAt": "2025-11-12T10:00:00Z",
  "updatedAt": "2025-11-12T10:00:00Z"
}
```

#### Database Changes:

```
Created:
- Product { id, tenantId, sku, name, description, category, price, costPrice, isInventoryTracked, isActive }

Audit Log:
- MENU_ITEM_CREATED action recorded
```

---

### Route 24: GET /api/v1/menu/:tenantId/item/:itemId

**Purpose:** Get specific menu item details
**Authentication:** Required (JWT Bearer Token)
**Middleware:** authMiddleware → tenantMiddleware → validateParams(tenantIdParamSchema)
**Authorization:** All authenticated users

#### URL Parameters:

```
- tenantId: UUID (required)
- itemId: UUID (required)
```

#### Success Response (200):

```json
{
  "id": "item-001-uuid",
  "tenantId": "tenant-pizzahub-001-uuid",
  "sku": "PIZZA-001",
  "name": "Margherita Pizza",
  "description": "Classic pizza with tomato, mozzarella, and basil",
  "category": "Pizza",
  "price": "350.00",
  "costPrice": "150.00",
  "isInventoryTracked": true,
  "isActive": true,
  "stock": {
    "qty": 98,
    "minQty": 20,
    "status": "OK"
  },
  "createdAt": "2025-11-10T10:00:00Z",
  "updatedAt": "2025-11-10T10:00:00Z"
}
```

---

### Route 25: PUT /api/v1/menu/:tenantId/:itemId

**Purpose:** Update menu item
**Authentication:** Required (JWT Bearer Token)
**Middleware:** authMiddleware → tenantMiddleware → validateParams(tenantIdParamSchema) → validateRequest(updateMenuItemSchema)
**Authorization:** MANAGER, OWNER

#### URL Parameters:

```
- tenantId: UUID (required)
- itemId: UUID (required)
```

#### Request Body (at least one field):

```json
{
  "name": "Margherita Pizza Premium",
  "description": "Updated description",
  "category": "Premium Pizza",
  "price": 380,
  "costPrice": 160,
  "isInventoryTracked": true
}
```

#### Request Validation Rules:

```
- name: string, 1-100 characters (optional)
- description: string, 0-500 characters (optional)
- category: string, 0-50 characters (optional)
- price: positive number (optional)
- costPrice: positive number (optional)
- isInventoryTracked: boolean (optional)
- NOTE: At least one field must be provided
```

#### Success Response (200):

```json
{
  "id": "item-001-uuid",
  "tenantId": "tenant-pizzahub-001-uuid",
  "sku": "PIZZA-001",
  "name": "Margherita Pizza Premium",
  "description": "Updated description",
  "category": "Premium Pizza",
  "price": "380.00",
  "costPrice": "160.00",
  "isInventoryTracked": true,
  "isActive": true,
  "updatedAt": "2025-11-12T11:00:00Z"
}
```

#### Database Changes:

```
Updated:
- Product { name, description, category, price, costPrice, isInventoryTracked, updatedAt: now() }

Audit Log:
- MENU_ITEM_UPDATED action recorded with old and new values
```

---

### Route 26: PATCH /api/v1/menu/:tenantId/:itemId/deactivate

**Purpose:** Deactivate menu item (soft delete)
**Authentication:** Required (JWT Bearer Token)
**Middleware:** authMiddleware → tenantMiddleware → validateParams(tenantIdParamSchema)
**Authorization:** MANAGER, OWNER

#### URL Parameters:

```
- tenantId: UUID (required)
- itemId: UUID (required)
```

#### Request Body:

```json
{}
```

(No body required)

#### Success Response (200):

```json
{
  "id": "item-003-uuid",
  "name": "Coca Cola",
  "isActive": false,
  "deactivatedAt": "2025-11-12T12:00:00Z",
  "message": "Menu item deactivated successfully"
}
```

#### Database Changes:

```
Updated:
- Product { isActive: false, updatedAt: now() }

Audit Log:
- MENU_ITEM_DEACTIVATED action recorded
```

---

### Route 27: GET /api/v1/menu/:tenantId/categories

**Purpose:** Get all menu categories
**Authentication:** Required (JWT Bearer Token)
**Middleware:** authMiddleware → tenantMiddleware → validateParams(tenantIdParamSchema)
**Authorization:** All authenticated users

#### URL Parameters:

```
- tenantId: UUID (required)
```

#### Success Response (200):

```json
{
  "categories": ["Pizza", "Beverages", "Starters", "Desserts", "Premium Pizza"],
  "total": 5
}
```

---

### Route 28: GET /api/v1/menu/:tenantId/category/:category

**Purpose:** Get menu items by category
**Authentication:** Required (JWT Bearer Token)
**Middleware:** authMiddleware → tenantMiddleware → validateParams(tenantIdParamSchema)
**Authorization:** All authenticated users

#### URL Parameters:

```
- tenantId: UUID (required)
- category: string, max 50 characters (required)
```

#### Success Response (200):

```json
{
  "category": "Pizza",
  "items": [
    {
      "id": "item-001-uuid",
      "tenantId": "tenant-pizzahub-001-uuid",
      "sku": "PIZZA-001",
      "name": "Margherita Pizza",
      "price": "350.00",
      "isActive": true
    },
    {
      "id": "item-002-uuid",
      "tenantId": "tenant-pizzahub-001-uuid",
      "sku": "PIZZA-002",
      "name": "Paneer Pizza",
      "price": "400.00",
      "isActive": true
    }
  ],
  "total": 2
}
```

---

# ORDER ROUTES

## (2 Routes - Order Management)

### Route 29: POST /api/v1/orders/

**Purpose:** Create new order
**Authentication:** Required (JWT Bearer Token)
**Middleware:** authMiddleware → tenantMiddleware → validateRequest(createOrderSchema)
**Authorization:** WAITER, MANAGER, OWNER

#### Request Body:

```json
{
  "branchId": "branch-001-uuid",
  "tableId": "table-05-uuid",
  "items": [
    {
      "productId": "item-001-uuid",
      "qty": 2,
      "price": 350,
      "specialRequest": "Extra cheese"
    },
    {
      "productId": "item-003-uuid",
      "qty": 2,
      "price": 50,
      "specialRequest": null
    }
  ],
  "tax": 40,
  "discount": 0,
  "notes": "Customer is VIP, serve quickly"
}
```

#### Request Validation Rules:

```
- branchId: UUID (required)
- tableId: UUID (optional)
- items: array of objects (required, minimum 1 item)
  - productId: UUID (required)
  - qty: positive integer (required)
  - price: positive number (required)
  - specialRequest: string, max 200 characters (optional)
- tax: number, minimum 0 (optional)
- discount: number, minimum 0 (optional)
- notes: string, max 500 characters (optional)
```

#### Success Response (201):

```json
{
  "id": "order-001-uuid",
  "tenantId": "tenant-pizzahub-001-uuid",
  "branchId": "branch-001-uuid",
  "tableId": "table-05-uuid",
  "items": [
    {
      "id": "orderitem-001-uuid",
      "productId": "item-001-uuid",
      "productName": "Margherita Pizza",
      "qty": 2,
      "price": "350.00",
      "total": "700.00",
      "specialRequest": "Extra cheese",
      "status": "PENDING"
    },
    {
      "id": "orderitem-002-uuid",
      "productId": "item-003-uuid",
      "productName": "Coca Cola",
      "qty": 2,
      "price": "50.00",
      "total": "100.00",
      "status": "PENDING"
    }
  ],
  "subtotal": "800.00",
  "tax": "40.00",
  "discount": "0.00",
  "total": "840.00",
  "status": "PENDING",
  "createdAt": "2025-11-12T19:31:00Z",
  "updatedAt": "2025-11-12T19:31:00Z"
}
```

#### Database Changes:

```
Created:
- Order { id, tenantId, branchId, tableId, subtotal, tax, discount, total, status: PENDING }
- OrderItem (multiple) { id, orderId, productId, qty, price, total, specialRequest, status: PENDING }
- KOT { id, orderId, branchId, items, printed: false }

Updated:
- StockItem { qty: qty - order.item.qty } (for each item if inventory tracked)

Audit Log:
- ORDER_CREATED action recorded
```

---

### Route 30: GET /api/v1/orders/:id

**Purpose:** Get order details
**Authentication:** Required (JWT Bearer Token)
**Middleware:** authMiddleware → tenantMiddleware → validateParams(orderIdParamSchema)
**Authorization:** All authenticated users (of same tenant)

#### URL Parameters:

```
- id: Order ID (UUID, required)
```

#### Success Response (200):

```json
{
  "id": "order-001-uuid",
  "tenantId": "tenant-pizzahub-001-uuid",
  "branchId": "branch-001-uuid",
  "tableId": "table-05-uuid",
  "items": [
    {
      "id": "orderitem-001-uuid",
      "productId": "item-001-uuid",
      "productName": "Margherita Pizza",
      "qty": 2,
      "price": "350.00",
      "total": "700.00",
      "specialRequest": "Extra cheese",
      "status": "PENDING"
    },
    {
      "id": "orderitem-002-uuid",
      "productId": "item-003-uuid",
      "productName": "Coca Cola",
      "qty": 2,
      "price": "50.00",
      "total": "100.00",
      "status": "PENDING"
    }
  ],
  "subtotal": "800.00",
  "tax": "40.00",
  "discount": "0.00",
  "total": "840.00",
  "status": "PENDING",
  "createdBy": {
    "id": "user-005-uuid",
    "name": "Suresh Waiter"
  },
  "createdAt": "2025-11-12T19:31:00Z",
  "updatedAt": "2025-11-12T19:31:00Z"
}
```

#### Error Response (404):

```json
{
  "error": "Order not found"
}
```

---

End of PART 1 (Routes 1-30)

**Continue to PART 2 for remaining 27 routes:**

- REPORT ROUTES (6 routes)
- STAFF ROUTES (7 routes)
- SUBSCRIPTION ROUTES (9 routes)
- TENANT ROUTES (3 routes)
- UPLOAD ROUTES (1 route)

---

**Prepared by:** Technical Documentation
**Date:** November 12, 2025
**Status:** PART 1 COMPLETE ✅
