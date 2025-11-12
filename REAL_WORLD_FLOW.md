# REAL-WORLD FLOW: Complete SaaS Restaurant Management System

## Complete Scenario: Day 1 - New Restaurant Customer Onboarding Through Day Operations

---

## **PHASE 1: ONBOARDING (Day 1 - Restaurant Owner Registration)**

### **STEP 1: Restaurant Owner Registers**

**Endpoint:** `POST /api/v1/auth/register`
**Middleware:** None (Public)
**Who:** Restaurant Owner (New customer)
**What Happens:**

- Owner provides email, password, and restaurant name
- System creates: Tenant record + User record (OWNER role)
- User assigned to that tenant
- Returns: `accessToken` + `refreshToken` + `tenantId`

```
Request:
POST http://localhost:3000/api/v1/auth/register
{
  "email": "owner@pizzahub.com",
  "password": "SecurePass123",
  "name": "John Pizza",
  "tenantName": "Pizza Hub Bangalore"
}

Response (201 Created):
{
  "user": {
    "id": "user-001",
    "email": "owner@pizzahub.com",
    "name": "John Pizza",
    "tenantId": "tenant-pizzahub-001",
    "role": "OWNER",
    "branchId": null
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

System stores in DB:
├── Tenant { id: "tenant-pizzahub-001", name: "Pizza Hub Bangalore", currency: "INR" }
├── User { id: "user-001", tenantId: "tenant-pizzahub-001", email: "owner@pizzahub.com", role: "OWNER" }
└── Branch { id: "branch-001", tenantId: "tenant-pizzahub-001", name: "Main Branch" }
```

---

### **STEP 2: ADMIN Creates Subscription for New Restaurant**

**Endpoint:** `POST /api/subscriptions/admin`
**Middleware:** `authMiddleware` (Admin only - no tenantMiddleware)
**Who:** Platform Admin
**What Happens:**

- Admin creates subscription for the new restaurant
- Sets plan (STARTER/PROFESSIONAL/ENTERPRISE)
- Sets billing cycle (MONTHLY/YEARLY)
- Sets amount

```
Request:
POST http://localhost:3000/api/v1/subscriptions/admin
Authorization: Bearer <ADMIN_TOKEN>
{
  "tenantId": "tenant-pizzahub-001",
  "plan": "STARTER",
  "billingCycle": "MONTHLY",
  "amount": 5000
}

Response (201 Created):
{
  "id": "sub-001",
  "tenantId": "tenant-pizzahub-001",
  "provider": "razorpay",
  "status": "ACTIVE",
  "plan": "STARTER",
  "amount": 5000,
  "billingCycle": "MONTHLY",
  "currency": "INR",
  "currentPeriodStart": "2025-11-09T00:00:00Z",
  "currentPeriodEnd": "2025-12-09T00:00:00Z",
  "createdAt": "2025-11-09T10:30:00Z"
}

System stores in DB:
└── Subscription {
      id: "sub-001",
      tenantId: "tenant-pizzahub-001",
      plan: "STARTER",
      amount: 5000,
      status: "ACTIVE"
    }
```

**DATABASE STATE AFTER STEP 2:**

```
Platform Owner (You) Controls:
├── Tenant: "Pizza Hub Bangalore" (tenantId: tenant-pizzahub-001)
│   ├── Subscription: STARTER - ₹5000/month - ACTIVE
│   ├── Owner User: John Pizza (can manage their restaurant)
│   └── Can have multiple branches
│
├── Tenant: "Burger King Delhi" (tenantId: tenant-burger-002)
│   ├── Subscription: PROFESSIONAL - ₹10000/month - ACTIVE
│   ├── Owner User: Raj Burger
│   └── Can have multiple branches
│
└── Tenant: "Samosa House Mumbai" (tenantId: tenant-samosa-003)
    ├── Subscription: STARTER - ₹5000/month - PAST_DUE
    ├── Owner User: Priya Samosa
    └── Can have multiple branches
```

---

## **PHASE 2: RESTAURANT SETUP (Day 1 - Owner Sets Up Restaurant)**

### **STEP 3: Owner Adds Staff Members**

**Endpoint:** `POST /api/v1/staff/{tenantId}`
**Middleware:** `authMiddleware` → `tenantMiddleware`
**Who:** Restaurant Owner
**What Happens:**

- Owner adds staff with different roles (ADMIN, MANAGER, WAITER, KITCHEN, ACCOUNTANT)
- Each staff member gets a User record linked to tenant

```
Request:
POST http://localhost:3000/api/v1/staff/tenant-pizzahub-001
Authorization: Bearer <OWNER_TOKEN>
{
  "email": "manager@pizzahub.com",
  "name": "Ramesh Manager",
  "password": "ManagerPass123",
  "role": "MANAGER",
  "branchId": "branch-001"
}

Response (201 Created):
{
  "id": "user-002",
  "email": "manager@pizzahub.com",
  "name": "Ramesh Manager",
  "tenantId": "tenant-pizzahub-001",
  "role": "MANAGER",
  "branchId": "branch-001",
  "isActive": true
}

System stores in DB:
└── User {
      id: "user-002",
      tenantId: "tenant-pizzahub-001",
      email: "manager@pizzahub.com",
      role: "MANAGER",
      branchId: "branch-001"
    }
```

**ADD MORE STAFF:**

```
Add Kitchen Staff:
POST /api/v1/staff/tenant-pizzahub-001
Authorization: Bearer <OWNER_TOKEN>
{
  "email": "kitchen@pizzahub.com",
  "name": "Chef Ramesh",
  "role": "KITCHEN",
  "branchId": "branch-001"
}
→ Creates User { role: "KITCHEN", tenantId: "tenant-pizzahub-001" }

Add Accountant:
POST /api/v1/staff/tenant-pizzahub-001
Authorization: Bearer <OWNER_TOKEN>
{
  "email": "accounts@pizzahub.com",
  "name": "Rakesh Accounts",
  "role": "ACCOUNTANT",
  "branchId": "branch-001"
}
→ Creates User { role: "ACCOUNTANT", tenantId: "tenant-pizzahub-001" }
```

---

### **STEP 4: Owner Creates Menu Items**

**Endpoint:** `POST /api/v1/menu/{tenantId}`
**Middleware:** `authMiddleware` → `tenantMiddleware`
**Who:** Restaurant Owner or Manager
**What Happens:**

- Creates menu items with prices, categories
- Items linked to tenant
- Can be tracked in inventory

```
Request:
POST http://localhost:3000/api/v1/menu/tenant-pizzahub-001
Authorization: Bearer <OWNER_TOKEN>
{
  "name": "Margherita Pizza",
  "category": "Pizza",
  "price": 350,
  "description": "Fresh mozzarella and basil pizza",
  "isInventoryTracked": true
}

Response (201 Created):
{
  "id": "item-001",
  "tenantId": "tenant-pizzahub-001",
  "name": "Margherita Pizza",
  "category": "Pizza",
  "price": 350,
  "sku": "PIZZA-001",
  "isInventoryTracked": true,
  "isActive": true
}

System stores in DB:
└── Product {
      id: "item-001",
      tenantId: "tenant-pizzahub-001",
      name: "Margherita Pizza",
      price: 350.00 (Decimal),
      category: "Pizza"
    }
```

**ADD MORE MENU ITEMS:**

```
Add Paneer Pizza:
POST /api/v1/menu/tenant-pizzahub-001
{
  "name": "Paneer Pizza",
  "category": "Pizza",
  "price": 400,
  "isInventoryTracked": true
}

Add Coke:
POST /api/v1/menu/tenant-pizzahub-001
{
  "name": "Coca Cola",
  "category": "Beverages",
  "price": 50,
  "isInventoryTracked": false
}

Add Garlic Bread:
POST /api/v1/menu/tenant-pizzahub-001
{
  "name": "Garlic Bread",
  "category": "Starters",
  "price": 150,
  "isInventoryTracked": true
}
```

**GET MENU:**

```
GET http://localhost:3000/api/v1/menu/tenant-pizzahub-001
Authorization: Bearer <OWNER_TOKEN>

Response:
{
  "items": [
    { "id": "item-001", "name": "Margherita Pizza", "price": 350, "category": "Pizza" },
    { "id": "item-002", "name": "Paneer Pizza", "price": 400, "category": "Pizza" },
    { "id": "item-003", "name": "Coca Cola", "price": 50, "category": "Beverages" },
    { "id": "item-004", "name": "Garlic Bread", "price": 150, "category": "Starters" }
  ]
}
```

---

### **STEP 5: Owner Sets Up Inventory Stock**

**Endpoint:** `POST /api/v1/inventory/{tenantId}`
**Middleware:** `authMiddleware` → `tenantMiddleware`
**Who:** Owner or Manager
**What Happens:**

- Creates stock items for tracked products
- Sets minimum quantity for reordering
- Tracks quantity available

```
Request:
POST http://localhost:3000/api/v1/inventory/tenant-pizzahub-001
Authorization: Bearer <OWNER_TOKEN>
{
  "productId": "item-001",
  "qty": 100,
  "minQty": 20,
  "branchId": "branch-001"
}

Response (201 Created):
{
  "id": "stock-001",
  "tenantId": "tenant-pizzahub-001",
  "productId": "item-001",
  "branchId": "branch-001",
  "qty": 100,
  "minQty": 20
}

System stores in DB:
└── StockItem {
      id: "stock-001",
      tenantId: "tenant-pizzahub-001",
      productId: "item-001",
      qty: 100,
      minQty: 20
    }
```

---

## **PHASE 3: DAILY OPERATIONS (Day 2+ - Normal Business)**

### **STEP 6: Waiter Takes Order from Customer**

**Endpoint:** `POST /api/v1/orders/`
**Middleware:** `authMiddleware` → `tenantMiddleware`
**Who:** Waiter (WAITER role)
**What Happens:**

- Creates order for table
- Calculates total from items
- Sets order status to PENDING
- Deducts inventory

```
Request:
POST http://localhost:3000/api/v1/orders/
Authorization: Bearer <WAITER_TOKEN>
{
  "tenantId": "tenant-pizzahub-001",
  "branchId": "branch-001",
  "tableId": "table-05",
  "items": [
    { "productId": "item-001", "qty": 2, "price": 350 },  // 2x Margherita = 700
    { "productId": "item-003", "qty": 2, "price": 50 }    // 2x Coke = 100
  ],
  "tax": 5,
  "discount": 0
}

Response (201 Created):
{
  "id": "order-001",
  "tenantId": "tenant-pizzahub-001",
  "branchId": "branch-001",
  "tableId": "table-05",
  "total": 815.00,
  "tax": 40,
  "items": [
    { "id": "item-001", "qty": 2, "price": 350, "status": "PENDING" },
    { "id": "item-003", "qty": 2, "price": 50, "status": "PENDING" }
  ],
  "status": "PENDING",
  "createdAt": "2025-11-10T19:30:00Z"
}

System stores in DB:
├── Order {
│     id: "order-001",
│     tenantId: "tenant-pizzahub-001",
│     tableId: "table-05",
│     total: 815.00 (Decimal),
│     status: "PENDING"
│   }
├── OrderItem { orderId: "order-001", productId: "item-001", qty: 2 }
└── OrderItem { orderId: "order-001", productId: "item-003", qty: 2 }

Stock Updated:
├── StockItem { productId: "item-001", qty: 98 (was 100, -2) }
└── StockItem { productId: "item-003", qty: 98 (was 100, -2) }
```

---

### **STEP 7: Order Sent to Kitchen (KOT - Kitchen Order Ticket)**

**Endpoint:** `POST /api/v1/kot/{id}/print`
**Middleware:** `authMiddleware` → `tenantMiddleware`
**Who:** Waiter or Manager
**What Happens:**

- System creates KOT from order
- Kitchen receives ticket with items
- KOT marked as printed when sent to printer

```
KOT Created (automatic from order):
{
  "id": "kot-001",
  "orderId": "order-001",
  "tenantId": "tenant-pizzahub-001",
  "branchId": "branch-001",
  "payload": {
    "tableNo": 5,
    "items": [
      { "name": "Margherita Pizza", "qty": 2, "specialRequest": "" },
      { "name": "Coca Cola", "qty": 2, "specialRequest": "" }
    ]
  },
  "printed": false
}

Request:
POST http://localhost:3000/api/v1/kot/kot-001/print
Authorization: Bearer <WAITER_TOKEN>

Response:
{
  "id": "kot-001",
  "printed": true,
  "printedAt": "2025-11-10T19:31:00Z"
}

System stores in DB:
└── KOT { id: "kot-001", printed: true, payload: {...} }
```

**GET UNPRINTED KOTs IN KITCHEN:**

```
GET http://localhost:3000/api/v1/kot/branch/branch-001?printed=false
Authorization: Bearer <KITCHEN_TOKEN>

Response:
{
  "kots": [
    { "id": "kot-001", "payload": { "items": [...] }, "printed": true }
  ]
}
```

---

### **STEP 8: Check Low Stock Inventory**

**Endpoint:** `GET /api/v1/inventory/{tenantId}/low-stock`
**Middleware:** `authMiddleware` → `tenantMiddleware`
**Who:** Manager or Accountant
**What Happens:**

- Checks items below minimum quantity
- Manager can reorder

```
Request:
GET http://localhost:3000/api/v1/inventory/tenant-pizzahub-001/low-stock
Authorization: Bearer <MANAGER_TOKEN>

Response:
{
  "lowStockItems": [
    {
      "id": "stock-002",
      "productId": "item-002",
      "productName": "Paneer Pizza",
      "qty": 5,
      "minQty": 20,
      "status": "CRITICAL"
    }
  ]
}

Alert: Only 5 units of Paneer Pizza left (minimum is 20)
→ Manager needs to order immediately
```

---

### **STEP 9: Update Inventory (Stock Movement)**

**Endpoint:** `PUT /api/v1/inventory/{itemId}`
**Middleware:** `authMiddleware` → `tenantMiddleware`
**Who:** Manager
**What Happens:**

- Updates stock quantity (purchase, wastage, adjustment)
- Creates stock movement record for audit

```
Request (Received new stock):
PUT http://localhost:3000/api/v1/inventory/stock-002
Authorization: Bearer <MANAGER_TOKEN>
{
  "type": "PURCHASE",
  "qty": 50,
  "reference": "PO-12345"
}

Response:
{
  "id": "stock-002",
  "productId": "item-002",
  "qty": 55,  // was 5, +50
  "minQty": 20
}

System stores in DB:
├── StockItem { id: "stock-002", qty: 55 }
└── StockMovement {
      type: "PURCHASE",
      qty: 50,
      reference: "PO-12345",
      tenantId: "tenant-pizzahub-001"
    }
```

---

### **STEP 10: Manager Views Dashboard Analytics**

**Endpoint:** `GET /api/v1/dashboard/overview/{tenantId}`
**Middleware:** `authMiddleware` → `tenantMiddleware`
**Who:** Owner or Manager
**What Happens:**

- Shows real-time statistics
- Sales, orders, revenue

```
Request:
GET http://localhost:3000/api/v1/dashboard/overview/tenant-pizzahub-001
Authorization: Bearer <MANAGER_TOKEN>

Response:
{
  "totalOrders": 45,
  "totalRevenue": 25000.00,
  "totalCustomers": 30,
  "averageOrderValue": 556.00,
  "topItems": [
    { "name": "Margherita Pizza", "qty": 120 },
    { "name": "Paneer Pizza", "qty": 95 }
  ]
}
```

**GET SALES ANALYTICS:**

```
GET http://localhost:3000/api/v1/dashboard/analytics/tenant-pizzahub-001?from=2025-11-01&to=2025-11-10
Authorization: Bearer <MANAGER_TOKEN>

Response:
{
  "daily": [
    { "date": "2025-11-01", "revenue": 5000, "orders": 10 },
    { "date": "2025-11-02", "revenue": 5500, "orders": 12 },
    { "date": "2025-11-03", "revenue": 6000, "orders": 13 }
  ],
  "total": 25000
}
```

---

### **STEP 11: Generate Sales Report**

**Endpoint:** `GET /api/v1/report/sales/{tenantId}`
**Middleware:** `authMiddleware` → `tenantMiddleware`
**Who:** Manager or Accountant
**What Happens:**

- Generates detailed sales report with filters

```
Request:
GET http://localhost:3000/api/v1/report/sales/tenant-pizzahub-001?from=2025-11-01&to=2025-11-10
Authorization: Bearer <ACCOUNTANT_TOKEN>

Response:
{
  "period": "2025-11-01 to 2025-11-10",
  "totalSales": 25000.00,
  "totalOrders": 45,
  "avgOrderValue": 556.00,
  "topItems": [
    { "name": "Margherita Pizza", "qty": 120, "revenue": 42000 },
    { "name": "Paneer Pizza", "qty": 95, "revenue": 38000 }
  ],
  "paymentMethods": {
    "CASH": 15000,
    "CARD": 10000
  }
}
```

---

### **STEP 12: Generate Inventory Report**

**Endpoint:** `GET /api/v1/report/inventory/{tenantId}`
**Middleware:** `authMiddleware` → `tenantMiddleware`
**Who:** Manager
**What Happens:**

- Shows stock levels, movements, alerts

```
Request:
GET http://localhost:3000/api/v1/report/inventory/tenant-pizzahub-001
Authorization: Bearer <MANAGER_TOKEN>

Response:
{
  "items": [
    {
      "id": "stock-001",
      "productName": "Margherita Pizza",
      "currentQty": 65,
      "minQty": 20,
      "status": "OK"
    },
    {
      "id": "stock-002",
      "productName": "Paneer Pizza",
      "currentQty": 55,
      "minQty": 20,
      "status": "OK"
    }
  ],
  "lowStock": 0,
  "outOfStock": 0
}
```

---

### **STEP 13: Process Payment for Order**

**Endpoint:** `POST /api/v1/billing/{tenantId}/invoices/{invoiceId}/payments`
**Middleware:** `authMiddleware` → `tenantMiddleware`
**Who:** Accountant or Manager
**What Happens:**

- Creates invoice from order
- Records payment
- Updates subscription billing

```
Request (Create Invoice from Order):
POST http://localhost:3000/api/v1/billing/tenant-pizzahub-001
Authorization: Bearer <ACCOUNTANT_TOKEN>
{
  "orderId": "order-001",
  "invoiceNumber": "INV-001",
  "amount": 815.00,
  "tax": 40.00
}

Response:
{
  "id": "invoice-001",
  "tenantId": "tenant-pizzahub-001",
  "invoiceNumber": "INV-001",
  "amount": 815.00,
  "status": "DRAFT",
  "createdAt": "2025-11-10T19:35:00Z"
}

Request (Process Payment):
POST http://localhost:3000/api/v1/billing/tenant-pizzahub-001/invoices/invoice-001/payments
Authorization: Bearer <ACCOUNTANT_TOKEN>
{
  "method": "CASH",
  "amount": 815.00,
  "reference": "CASH-PAYMENT-001"
}

Response:
{
  "id": "payment-001",
  "invoiceId": "invoice-001",
  "method": "CASH",
  "amount": 815.00,
  "status": "COMPLETED",
  "reference": "CASH-PAYMENT-001"
}

System stores in DB:
├── Invoice { id: "invoice-001", status: "PAID" }
└── Payment { invoiceId: "invoice-001", status: "COMPLETED" }
```

**GET BILLING SUMMARY:**

```
GET http://localhost:3000/api/v1/billing/tenant-pizzahub-001/summary
Authorization: Bearer <ACCOUNTANT_TOKEN>

Response:
{
  "totalRevenue": 25000.00,
  "totalPaid": 22000.00,
  "totalPending": 3000.00,
  "totalOverdue": 0.00,
  "invoicesThisMonth": 45
}
```

---

### **STEP 14: Staff Performance Report**

**Endpoint:** `GET /api/v1/report/staff/{tenantId}`
**Middleware:** `authMiddleware` → `tenantMiddleware`
**Who:** Manager or Owner
**What Happens:**

- Shows each staff member's performance

```
Request:
GET http://localhost:3000/api/v1/report/staff/tenant-pizzahub-001
Authorization: Bearer <MANAGER_TOKEN>

Response:
{
  "staff": [
    {
      "id": "user-003",
      "name": "Suresh Waiter",
      "role": "WAITER",
      "ordersHandled": 15,
      "revenue": 8000.00,
      "avgOrderValue": 533.00
    },
    {
      "id": "user-004",
      "name": "Ramesh Waiter",
      "role": "WAITER",
      "ordersHandled": 12,
      "revenue": 7000.00,
      "avgOrderValue": 583.00
    }
  ]
}
```

---

### **STEP 15: Table Booking System**

**Endpoint:** `POST /api/v1/bookings/`
**Middleware:** `authMiddleware` → `tenantMiddleware`
**Who:** Waiter or Manager (taking phone bookings)
**What Happens:**

- Creates table reservation
- Tracks deposit

```
Request:
POST http://localhost:3000/api/v1/bookings/
Authorization: Bearer <WAITER_TOKEN>
{
  "tenantId": "tenant-pizzahub-001",
  "branchId": "branch-001",
  "customerName": "Rajesh Singh",
  "customerPhone": "9876543210",
  "partySize": 4,
  "startTime": "2025-11-10T20:00:00Z",
  "endTime": "2025-11-10T21:30:00Z",
  "deposit": 500
}

Response:
{
  "id": "booking-001",
  "customerName": "Rajesh Singh",
  "partySize": 4,
  "startTime": "2025-11-10T20:00:00Z",
  "status": "CONFIRMED",
  "deposit": 500.00
}

System stores in DB:
└── Booking {
      id: "booking-001",
      tenantId: "tenant-pizzahub-001",
      customerName: "Rajesh Singh",
      status: "CONFIRMED"
    }
```

**GET BOOKINGS FOR BRANCH:**

```
GET http://localhost:3000/api/v1/bookings/branch/branch-001
Authorization: Bearer <MANAGER_TOKEN>

Response:
{
  "bookings": [
    { "id": "booking-001", "customerName": "Rajesh Singh", "partySize": 4, "status": "CONFIRMED" },
    { "id": "booking-002", "customerName": "Priya Sharma", "partySize": 2, "status": "PENDING" }
  ]
}
```

---

## **PHASE 4: ADMIN CONTROLS (Platform Level - Your Dashboard)**

### **STEP 16: Admin Views All Subscriptions**

**Endpoint:** `GET /api/subscriptions/admin`
**Middleware:** `authMiddleware` (Admin only)
**Who:** Platform Admin (You)
**What Happens:**

- Lists all customer subscriptions
- Shows status, plan, revenue

```
Request:
GET http://localhost:3000/api/v1/subscriptions/admin
Authorization: Bearer <YOUR_ADMIN_TOKEN>

Response:
{
  "subscriptions": [
    {
      "id": "sub-001",
      "tenantId": "tenant-pizzahub-001",
      "tenantName": "Pizza Hub Bangalore",
      "plan": "STARTER",
      "amount": 5000,
      "status": "ACTIVE",
      "billingCycle": "MONTHLY",
      "currentPeriodEnd": "2025-12-09T00:00:00Z"
    },
    {
      "id": "sub-002",
      "tenantId": "tenant-burger-002",
      "tenantName": "Burger King Delhi",
      "plan": "PROFESSIONAL",
      "amount": 10000,
      "status": "ACTIVE",
      "billingCycle": "MONTHLY",
      "currentPeriodEnd": "2025-12-09T00:00:00Z"
    },
    {
      "id": "sub-003",
      "tenantId": "tenant-samosa-003",
      "tenantName": "Samosa House Mumbai",
      "plan": "STARTER",
      "amount": 5000,
      "status": "PAST_DUE",
      "currentPeriodEnd": "2025-11-09T00:00:00Z"
    }
  ]
}
```

---

### **STEP 17: Admin Updates Subscription (Upgrade/Downgrade)**

**Endpoint:** `PATCH /api/subscriptions/admin/{tenantId}`
**Middleware:** `authMiddleware` (Admin only)
**Who:** Platform Admin
**What Happens:**

- Upgrades or downgrades customer plan
- Updates billing amount

```
Request (Upgrade Pizza Hub from STARTER to PROFESSIONAL):
PATCH http://localhost:3000/api/v1/subscriptions/admin/tenant-pizzahub-001
Authorization: Bearer <YOUR_ADMIN_TOKEN>
{
  "plan": "PROFESSIONAL",
  "amount": 10000
}

Response:
{
  "id": "sub-001",
  "tenantId": "tenant-pizzahub-001",
  "plan": "PROFESSIONAL",
  "amount": 10000,
  "status": "ACTIVE"
}

System stores in DB:
└── Subscription {
      id: "sub-001",
      plan: "PROFESSIONAL",
      amount: 10000.00
    }
```

---

### **STEP 18: Admin Cancels Subscription**

**Endpoint:** `DELETE /api/subscriptions/admin/{tenantId}`
**Middleware:** `authMiddleware` (Admin only)
**Who:** Platform Admin
**What Happens:**

- Cancels subscription
- Restaurant loses access to features

```
Request:
DELETE http://localhost:3000/api/v1/subscriptions/admin/tenant-samosa-003
Authorization: Bearer <YOUR_ADMIN_TOKEN>

Response:
{
  "id": "sub-003",
  "tenantId": "tenant-samosa-003",
  "status": "CANCELLED",
  "cancelledAt": "2025-11-10T15:00:00Z"
}

System stores in DB:
└── Subscription {
      id: "sub-003",
      status: "CANCELLED"
    }
```

---

### **STEP 19: Admin Checks Expiring Subscriptions**

**Endpoint:** `GET /api/subscriptions/admin/expiring/soon`
**Middleware:** `authMiddleware` (Admin only)
**Who:** Platform Admin
**What Happens:**

- Shows subscriptions expiring in next 7 days
- For renewal reminders

```
Request:
GET http://localhost:3000/api/v1/subscriptions/admin/expiring/soon
Authorization: Bearer <YOUR_ADMIN_TOKEN>

Response:
{
  "expiringSubscriptions": [
    {
      "id": "sub-005",
      "tenantId": "tenant-cafe-005",
      "tenantName": "Coffee House Mumbai",
      "plan": "STARTER",
      "expiresIn": 3,
      "currentPeriodEnd": "2025-11-13T00:00:00Z"
    }
  ]
}

Action: Send renewal email to Coffee House
```

---

### **STEP 20: Admin Gets SaaS Dashboard Metrics**

**Endpoint:** `GET /api/subscriptions/admin/dashboard/metrics`
**Middleware:** `authMiddleware` (Admin only)
**Who:** Platform Admin (You - for business metrics)
**What Happens:**

- Shows total revenue, active customers, churn

```
Request:
GET http://localhost:3000/api/v1/subscriptions/admin/dashboard/metrics
Authorization: Bearer <YOUR_ADMIN_TOKEN>

Response:
{
  "metrics": {
    "totalActiveSubscriptions": 45,
    "totalMonthlyRevenue": 250000.00,
    "totalCustomers": 50,
    "activePlanBreakdown": {
      "STARTER": 25,
      "PROFESSIONAL": 15,
      "ENTERPRISE": 5
    },
    "subscriptionStatus": {
      "ACTIVE": 45,
      "PAST_DUE": 3,
      "CANCELLED": 2
    },
    "mrr": 250000.00,
    "churnRate": "5%"
  }
}

Dashboard shows:
├── Active Customers: 45
├── Monthly Revenue: ₹2,50,000
├── Past Due: 3 (need follow-up)
└── Churn Rate: 5%
```

---

### **STEP 21: Admin Checks Trial Subscriptions**

**Endpoint:** `GET /api/subscriptions/admin/trials/expiring`
**Middleware:** `authMiddleware` (Admin only)
**Who:** Platform Admin
**What Happens:**

- Shows free trials about to expire

```
Request:
GET http://localhost:3000/api/v1/subscriptions/admin/trials/expiring
Authorization: Bearer <YOUR_ADMIN_TOKEN>

Response:
{
  "expiringTrials": [
    {
      "id": "sub-006",
      "tenantId": "tenant-noodle-006",
      "tenantName": "Noodle House Bangalore",
      "plan": "STARTER",
      "trialEndsAt": "2025-11-12T00:00:00Z",
      "daysLeft": 2
    }
  ]
}

Action: Send "upgrade now" email before trial expires
```

---

## **PHASE 5: BULK OPERATIONS**

### **STEP 22: Owner Bulk Imports Staff/Menu/Inventory**

**Endpoint:** `POST /api/v1/upload/bulk`
**Middleware:** `authMiddleware` → `tenantMiddleware`
**Who:** Owner or Manager
**What Happens:**

- Uploads CSV file
- System parses and creates bulk records

```
Request:
POST http://localhost:3000/api/v1/upload/bulk
Authorization: Bearer <OWNER_TOKEN>
Content-Type: multipart/form-data

file: staff_list.csv
type: "staff"

CSV Content:
name,email,role,branchId
Chef Ram,chef@pizzahub.com,KITCHEN,branch-001
Waiter Suresh,suresh@pizzahub.com,WAITER,branch-001
Manager Rakesh,rakesh@pizzahub.com,MANAGER,branch-001

Response:
{
  "id": "bulk-001",
  "tenantId": "tenant-pizzahub-001",
  "filename": "staff_list.csv",
  "type": "staff",
  "status": "PROCESSING",
  "successCount": 0,
  "errors": 0
}

After processing:
{
  "id": "bulk-001",
  "status": "COMPLETED",
  "successCount": 3,
  "errors": 0
}

System creates:
├── User { name: "Chef Ram", role: "KITCHEN", tenantId: "tenant-pizzahub-001" }
├── User { name: "Waiter Suresh", role: "WAITER", tenantId: "tenant-pizzahub-001" }
└── User { name: "Manager Rakesh", role: "MANAGER", tenantId: "tenant-pizzahub-001" }
```

---

## **COMPLETE REQUEST FLOW SUMMARY**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        COMPLETE SYSTEM FLOW                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  PUBLIC LAYER (No Authentication Required)                                    │
│  ├─ POST /api/v1/auth/register         → Create restaurant tenant            │
│  ├─ POST /api/v1/auth/login            → Login user, get tokens              │
│  └─ POST /api/v1/auth/refresh          → Refresh expired token               │
│                                                                                 │
│  ADMIN LAYER (Admin Authentication Required)                                 │
│  ├─ GET  /api/v1/subscriptions/admin                → View all subscriptions  │
│  ├─ POST /api/v1/subscriptions/admin                → Create subscription     │
│  ├─ PATCH /api/v1/subscriptions/admin/:tenantId     → Update subscription     │
│  ├─ DELETE /api/v1/subscriptions/admin/:tenantId    → Cancel subscription     │
│  ├─ GET  /api/v1/subscriptions/admin/expiring/soon  → Expiring subs          │
│  ├─ GET  /api/v1/subscriptions/admin/trials/*       → Trial management       │
│  └─ GET  /api/v1/subscriptions/admin/dashboard/metrics → Revenue metrics      │
│                                                                                 │
│  TENANT MANAGEMENT (Auth + Admin)                                             │
│  ├─ POST /api/v1/tenants/                 → Create new restaurant (admin)      │
│  ├─ GET  /api/v1/tenants/                 → List all tenants (admin)          │
│  └─ GET  /api/v1/tenants/:id              → Get tenant details (admin)        │
│                                                                                 │
│  CUSTOMER SUBSCRIPTION VIEW (Auth + Tenant)                                   │
│  └─ GET  /api/v1/subscriptions/:tenantId  → View own subscription             │
│                                                                                 │
│  RESTAURANT OPERATIONS (Auth + Tenant)                                        │
│  ├─ MENU MANAGEMENT:                                                          │
│  │  ├─ GET  /api/v1/menu/:tenantId                  → Get menu                │
│  │  ├─ POST /api/v1/menu/:tenantId                  → Add menu item           │
│  │  ├─ GET  /api/v1/menu/:tenantId/item/:itemId     → Get item details        │
│  │  ├─ PUT  /api/v1/menu/:tenantId/:itemId          → Update item             │
│  │  ├─ PATCH /api/v1/menu/:tenantId/:itemId/deactivate → Deactivate item    │
│  │  ├─ GET  /api/v1/menu/:tenantId/categories       → Get categories          │
│  │  └─ GET  /api/v1/menu/:tenantId/category/:cat    → Get items by category   │
│  │                                                                              │
│  │  STAFF MANAGEMENT:                                                          │
│  │  ├─ GET  /api/v1/staff/:tenantId                → List all staff           │
│  │  ├─ POST /api/v1/staff/:tenantId                → Add staff                │
│  │  ├─ GET  /api/v1/staff/:tenantId/:staffId       → Get staff details        │
│  │  ├─ PUT  /api/v1/staff/:tenantId/:staffId       → Update staff             │
│  │  ├─ PATCH /api/v1/staff/:tenantId/:staffId/deactivate → Deactivate staff │
│  │  ├─ POST /api/v1/staff/:tenantId/:staffId/role  → Assign role             │
│  │  └─ GET  /api/v1/staff/:tenantId/branch/:branchId → Get branch staff      │
│  │                                                                              │
│  │  INVENTORY MANAGEMENT:                                                      │
│  │  ├─ GET  /api/v1/inventory/:tenantId            → Get all stock            │
│  │  ├─ GET  /api/v1/inventory/:tenantId/low-stock  → Get low stock items      │
│  │  ├─ POST /api/v1/inventory/:tenantId            → Create stock item        │
│  │  ├─ PUT  /api/v1/inventory/:itemId              → Update stock qty         │
│  │  └─ DELETE /api/v1/inventory/:itemId            → Delete stock item        │
│  │                                                                              │
│  │  ORDER & BILLING:                                                           │
│  │  ├─ POST /api/v1/orders/                         → Create order             │
│  │  ├─ GET  /api/v1/orders/:id                      → Get order details        │
│  │  ├─ POST /api/v1/billing/:tenantId               → Create invoice           │
│  │  ├─ GET  /api/v1/billing/:tenantId               → Get invoices             │
│  │  ├─ GET  /api/v1/billing/:tenantId/summary       → Billing summary          │
│  │  ├─ GET  /api/v1/billing/:tenantId/invoices/:id  → Invoice details          │
│  │  └─ POST /api/v1/billing/:tenantId/invoices/:id/payments → Process payment │
│  │                                                                              │
│  │  KOT (KITCHEN ORDERS):                                                      │
│  │  ├─ GET  /api/v1/kot/branch/:branchId           → Get KOTs for branch       │
│  │  └─ POST /api/v1/kot/:id/print                  → Mark KOT as printed      │
│  │                                                                              │
│  │  BOOKINGS:                                                                  │
│  │  ├─ POST /api/v1/bookings/                       → Create reservation       │
│  │  └─ GET  /api/v1/bookings/branch/:branchId      → Get branch bookings      │
│  │                                                                              │
│  │  ANALYTICS & REPORTS:                                                       │
│  │  ├─ GET  /api/v1/dashboard/overview/:tenantId   → Dashboard overview        │
│  │  ├─ GET  /api/v1/dashboard/analytics/:tenantId  → Sales analytics           │
│  │  ├─ GET  /api/v1/dashboard/charts/:tenantId     → Revenue charts            │
│  │  ├─ GET  /api/v1/dashboard/top-products/:tenantId → Top products           │
│  │  ├─ GET  /api/v1/report/sales/:tenantId         → Sales report              │
│  │  ├─ GET  /api/v1/report/inventory/:tenantId     → Inventory report          │
│  │  ├─ GET  /api/v1/report/staff/:tenantId         → Staff performance         │
│  │  ├─ GET  /api/v1/report/payment/:tenantId       → Payment report            │
│  │  ├─ GET  /api/v1/report/dashboard/:tenantId     → Dashboard summary         │
│  │  └─ POST /api/v1/report/export/sales/:tenantId  → Export data               │
│  │                                                                              │
│  │  BULK OPERATIONS:                                                           │
│  │  └─ POST /api/v1/upload/bulk                     → Bulk import CSV           │
│  │                                                                              │
│  └─ (All above require Auth + Tenant validation)                             │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## **DATABASE STATE AFTER ALL OPERATIONS**

```
PLATFORM OWNER (YOU) LEVEL:
├── 50 Restaurants (50 Tenants)
│   ├── Tenant-1: Pizza Hub (sub: ACTIVE, MRR: ₹5000)
│   ├── Tenant-2: Burger King (sub: ACTIVE, MRR: ₹10000)
│   ├── Tenant-3: Samosa House (sub: CANCELLED)
│   └── Tenant-50: ...
│
└── Total MRR: ₹2,50,000

EACH TENANT HAS:
├── 1 Owner User (OWNER role)
├── 5-10 Staff Users (MANAGER, WAITER, KITCHEN, ACCOUNTANT)
├── 20-50 Menu Items
├── 50-100 Inventory Items (with qty tracking)
├── 100-500 Orders (per month)
├── 100-500 Invoices (per month)
├── 50-100 Table Bookings (per month)
├── 100-500 KOT tickets (per month)
└── 50-100 Stock Movements (per month)
```

---

## **SECURITY FLOW EXAMPLE**

```
SCENARIO: Restaurant B Owner tries to access Restaurant A's data

Request:
GET http://localhost:3000/api/v1/menu/tenant-pizzahub-001
Authorization: Bearer <BURGER_KING_OWNER_TOKEN>
(Token contains: { userId: "user-999", tenantId: "tenant-burger-002" })

MIDDLEWARE CHAIN:
1. authMiddleware
   ✅ Token is valid
   ✅ Extract: tenantId = "tenant-burger-002"

2. tenantMiddleware
   ⚠️  Check: user.tenantId ("tenant-burger-002") === req.params.tenantId ("tenant-pizzahub-001")?
   ❌ NO MATCH!

   RESPONSE: 403 Forbidden
   {
     "error": "Forbidden - Tenant mismatch"
   }

RESULT: Burger King owner CANNOT access Pizza Hub data ✅ SECURE
```

---

## **REAL-WORLD TESTING CHECKLIST**

- ✅ New restaurant registration (Step 1-2)
- ✅ Staff management (Step 3)
- ✅ Menu setup (Step 4)
- ✅ Inventory tracking (Step 5)
- ✅ Order creation (Step 6)
- ✅ KOT printing (Step 7)
- ✅ Low stock alerts (Step 8)
- ✅ Stock updates (Step 9)
- ✅ Dashboard analytics (Step 10)
- ✅ Sales reports (Step 11)
- ✅ Inventory reports (Step 12)
- ✅ Payment processing (Step 13)
- ✅ Staff performance (Step 14)
- ✅ Table bookings (Step 15)
- ✅ Subscription management (Step 16-19)
- ✅ Metrics dashboard (Step 20)
- ✅ Trial management (Step 21)
- ✅ Bulk imports (Step 22)
- ✅ Multi-tenant isolation (Security test)
- ✅ Token refresh (Step 1)

---

## **22 REAL-WORLD ROUTES IN CORRECT ORDER**

| #   | Endpoint                                   | Method | Purpose             | Who        | Auth |
| --- | ------------------------------------------ | ------ | ------------------- | ---------- | ---- |
| 1   | `/auth/register`                           | POST   | Register restaurant | Public     | ❌   |
| 2   | `/subscriptions/admin`                     | POST   | Create subscription | Admin      | ✅   |
| 3   | `/staff/:tenantId`                         | POST   | Add staff           | Owner      | ✅   |
| 4   | `/menu/:tenantId`                          | POST   | Create menu item    | Owner      | ✅   |
| 5   | `/menu/:tenantId`                          | GET    | Get menu            | Owner      | ✅   |
| 6   | `/inventory/:tenantId`                     | POST   | Create stock item   | Manager    | ✅   |
| 7   | `/orders/`                                 | POST   | Create order        | Waiter     | ✅   |
| 8   | `/kot/:id/print`                           | POST   | Print KOT           | Waiter     | ✅   |
| 9   | `/inventory/:tenantId/low-stock`           | GET    | Check low stock     | Manager    | ✅   |
| 10  | `/inventory/:itemId`                       | PUT    | Update stock        | Manager    | ✅   |
| 11  | `/dashboard/overview/:tenantId`            | GET    | Dashboard           | Manager    | ✅   |
| 12  | `/dashboard/analytics/:tenantId`           | GET    | Sales analytics     | Manager    | ✅   |
| 13  | `/report/sales/:tenantId`                  | GET    | Sales report        | Accountant | ✅   |
| 14  | `/report/inventory/:tenantId`              | GET    | Inventory report    | Manager    | ✅   |
| 15  | `/billing/:tenantId`                       | POST   | Create invoice      | Accountant | ✅   |
| 16  | `/billing/:tenantId/invoices/:id/payments` | POST   | Process payment     | Accountant | ✅   |
| 17  | `/report/staff/:tenantId`                  | GET    | Staff report        | Manager    | ✅   |
| 18  | `/bookings/`                               | POST   | Create booking      | Waiter     | ✅   |
| 19  | `/subscriptions/admin`                     | GET    | View all subs       | Admin      | ✅   |
| 20  | `/subscriptions/admin/:tenantId`           | PATCH  | Update sub          | Admin      | ✅   |
| 21  | `/subscriptions/admin/dashboard/metrics`   | GET    | SaaS metrics        | Admin      | ✅   |
| 22  | `/upload/bulk`                             | POST   | Bulk import         | Owner      | ✅   |

---

END OF REAL-WORLD DOCUMENTATION
