# 🔐 ADMIN USERS IN CAFÉ SAAS SYSTEM

## Clear Admin Hierarchy

There are **TWO types of admin users** in this SaaS system:

---

## 1. 🎯 SUPER ADMIN (Platform Owner)

**Role Name in Code:** `ADMIN` or `OWNER`

### Who They Are:

- The company/organization that owns and operates the SaaS platform
- The people managing the platform infrastructure
- Think: The CEO, CTO, Billing Manager of the Café SaaS Company

### How Many:

- **Only 1-5 per company** (typically)
- Example: Your Café SaaS company might have 1-3 super admins

### What They Manage:

```
├─ All Restaurants/Tenants in the system
├─ All Subscriptions (view, create, update, cancel)
├─ All Invoices and Payments
├─ All Customers (who subscribed)
├─ SaaS Metrics (MRR, ARR, Churn Rate)
├─ Trial Conversions
├─ Subscription Renewals
└─ Platform-wide Settings
```

### Exclusive Admin Endpoints (13 routes):

```
✅ GET  /api/v1/subscriptions/admin                        Dashboard of all subscriptions
✅ POST /api/v1/subscriptions/admin                        Create subscription
✅ PATCH /api/v1/subscriptions/admin/:tenantId            Update subscription
✅ DELETE /api/v1/subscriptions/admin/:tenantId           Cancel subscription
✅ GET /api/v1/subscriptions/admin/expiring/soon          Find expiring subscriptions
✅ GET /api/v1/subscriptions/admin/trials/expiring        Find expiring trials
✅ GET /api/v1/subscriptions/admin/trials/expired         Find ready-to-charge trials
✅ GET /api/v1/subscriptions/admin/dashboard/metrics      View MRR, ARR metrics
✅ GET /api/v1/tenants                                    List ALL restaurants
✅ GET /api/v1/billing (all tenants)                      View all invoices
✅ POST /api/v1/billing/:tenantId                         Create invoices
✅ VIEW /api/v1/report/*                                  View all reports
└─ Full access to all data in system
```

### Code Role Check:

```typescript
// In controllers, super admin is verified as:
if (req.user?.role !== Role.ADMIN && req.user?.role !== Role.OWNER) {
  return res.status(403).json({ error: "Admin access required" });
}
```

### Responsibilities:

- ✅ Monitor subscription metrics (MRR, ARR)
- ✅ Handle customer onboarding (create subscription)
- ✅ Track trial conversions
- ✅ Manage subscription renewals
- ✅ Handle payment collection
- ✅ Customer support escalations
- ✅ View business analytics
- ✅ Manage platform users (other admins)

---

## 2. 👨‍💼 TENANT OWNER (Restaurant Owner)

**Role Name in Code:** `OWNER` (at tenant level)

### Who They Are:

- The restaurant/café owner who signed up for the platform
- The person who manages their own restaurant
- NOT a platform super admin

### How Many Per Restaurant:

- **Usually 1 per restaurant** (the owner)
- Can have multiple if restaurant has co-owners

### What They Manage:

```
├─ Their own restaurant only (1 Tenant)
├─ Their own menu items
├─ Their own staff
├─ Their own inventory
├─ Their own orders
├─ Their own bookings
├─ Their own dashboard/reports
└─ Their own invoices/billing
```

### Routes They Can Access:

```
✅ GET  /api/v1/subscriptions/:tenantId              View own subscription
✅ GET  /api/v1/menu/:tenantId                       Manage own menu
✅ POST /api/v1/menu/:tenantId                       Add menu items
✅ GET  /api/v1/orders                               View orders
✅ GET  /api/v1/staff/:tenantId                      Manage own staff
✅ GET  /api/v1/inventory/:tenantId                  Manage own inventory
✅ GET  /api/v1/dashboard/:tenantId                  Own dashboard
✅ GET  /api/v1/report/*                             Own reports
❌ CANNOT access /api/v1/subscriptions/admin/*       (no admin routes)
❌ CANNOT see other restaurants' data
❌ CANNOT manage billing (that's platform's job)
```

### Restrictions:

- Can only access their own tenantId
- Tenant middleware enforces this:
  ```typescript
  if (userTenantId !== tenantId) {
    return res.status(403).json({ error: "Forbidden - Tenant mismatch" });
  }
  ```

---

## 3. 👨‍💼 BRANCH MANAGER (Manager at Restaurant)

**Role Name in Code:** `MANAGER`

### Who They Are:

- Manager working at one restaurant
- Manages a specific branch
- Lower level than restaurant owner

### What They Manage:

- Can create/process orders
- Can manage inventory for their branch
- Can view branch dashboard
- Can view staff performance

### Routes:

```
✅ POST /api/v1/orders           Create orders
✅ GET  /api/v1/inventory        View inventory
✅ GET  /api/v1/dashboard        Branch dashboard
❌ CANNOT change subscription
❌ CANNOT manage staff (owner only)
❌ CANNOT access admin routes
```

---

## 4. 👨‍🍳 STAFF (Chef/Waiter/Cashier)

**Role Name in Code:** `STAFF`, `CASHIER`, `CHEF`, `WAITER`

### What They Can Do:

- Create/view orders
- View menu items
- Print KOTs (Kitchen Order Tickets)
- View bookings

### Routes:

```
✅ POST /api/v1/orders           Create orders
✅ POST /api/v1/kot/:id/print    Print tickets
✅ GET  /api/v1/menu             View menu
❌ CANNOT access financial data
❌ CANNOT manage staff
❌ CANNOT access admin routes
```

---

## 📊 ADMIN STRUCTURE COMPARISON TABLE

| Feature           | Super Admin                       | Tenant Owner      | Manager             | Staff               |
| ----------------- | --------------------------------- | ----------------- | ------------------- | ------------------- |
| **Manages**       | All restaurants                   | Own restaurant    | One branch          | Just works          |
| **Subscription**  | View all, Create/Update/Cancel ✅ | View own only     | Cannot access ❌    | Cannot access ❌    |
| **Billing**       | Manage all invoices ✅            | View own invoices | Cannot access ❌    | Cannot access ❌    |
| **Menu Items**    | Cannot edit                       | Can manage ✅     | Can view            | Can view            |
| **Orders**        | Cannot create                     | View/Create ✅    | Create/View ✅      | Create/View ✅      |
| **Staff**         | Cannot edit                       | Can manage ✅     | View own team       | Cannot manage ❌    |
| **Inventory**     | Cannot edit                       | Can manage ✅     | Can manage ✅       | Cannot manage ❌    |
| **Reports**       | View all ✅                       | View own          | View own            | Cannot access ❌    |
| **SaaS Metrics**  | View (MRR,ARR) ✅                 | Cannot view       | Cannot view         | Cannot view         |
| **Tenant Access** | All tenants                       | Own tenant only   | Own tenant only     | Own tenant only     |
| **Number**        | 1-5 per company                   | 1 per restaurant  | 1-10 per restaurant | Many per restaurant |

---

## 🔐 AUTHENTICATION FLOW FOR ADMINS

### Super Admin Login:

```
1. POST /api/v1/auth/login
   - Email: admin@cafecompany.com
   - Password: ****

2. JWT payload contains:
   {
     "userId": "admin-1",
     "tenantId": "platform-admin-tenant",
     "role": "ADMIN",           ← This is the key!
     "email": "admin@cafecompany.com"
   }

3. Super Admin can now access /subscriptions/admin routes
   - Middleware checks: req.user?.role === "ADMIN"
```

### Restaurant Owner Login:

```
1. POST /api/v1/auth/login
   - Email: owner@myrestaurant.com
   - Password: ****

2. JWT payload contains:
   {
     "userId": "user-123",
     "tenantId": "restaurant-xyz",
     "role": "OWNER",           ← Only their restaurant!
     "email": "owner@myrestaurant.com"
   }

3. Owner can access /api/v1/* routes with their tenantId only
   - Middleware checks: userTenantId === paramTenantId
```

---

## 📋 HOW MANY ADMINS IN YOUR SYSTEM?

### **Typically:**

```
┌─ Your Café SaaS Company
│  ├─ 1-3 Super Admins (manage platform)
│  ├─ 1 Billing Admin (manage payments)
│  └─ 1 Support Admin (handle tickets)
│
├─ Restaurant #1 → 1 Owner (not a super admin)
├─ Restaurant #2 → 1 Owner (not a super admin)
├─ Restaurant #3 → 1 Owner (not a super admin)
└─ Restaurant #N → 1 Owner (not a super admin)
```

### Example Numbers:

- **Small deployment:** 1 super admin (you) + 10 restaurants = 11 total admin-level users
- **Medium deployment:** 3 super admins + 100 restaurants = 103 total admin-level users
- **Large deployment:** 5 super admins + 1000 restaurants = 1005 total admin-level users

---

## ⚠️ CRITICAL DIFFERENCE

### Super Admin ≠ Restaurant Owner

```
❌ WRONG: Restaurant owner is not a "super admin"
   They are "OWNER" role but LIMITED to their tenant

✅ CORRECT: Only your company's staff with Role.ADMIN
   can access /subscriptions/admin/* routes

   ALL restaurant owners with Role.OWNER
   can ONLY access their own restaurant data
```

---

## 🔑 KEY CODE REFERENCES

### Where Admin Check Happens:

```typescript
// File: src/controllers/subscription.controller.ts

export const getAllSubscriptions = async (
  req: Request & any,
  res: Response,
  next: NextFunction
) => {
  // SUPER ADMIN CHECK:
  if (req.user?.role !== Role.ADMIN && req.user?.role !== Role.OWNER) {
    return res.status(403).json({ error: "Admin access required" });
  }

  // Only ADMIN can see ALL subscriptions
  const result = await SubscriptionService.getAllSubscriptions(...);
  return successResponse(res, result, "Subscriptions fetched");
};
```
 
### Where Tenant Check Happens:

```typescript
// File: src/middlewares/tenant.middleware.ts

export default function tenantMiddleware(
  req: Request & any,
  res: Response,
  next: NextFunction
) {
  const { tenantId } = req.params;
  const userTenantId = req.user?.tenantId;

  // TENANT ISOLATION CHECK:
  if (userTenantId !== tenantId) {
    return res.status(403).json({ error: "Forbidden - Tenant mismatch" });
  }

  // Restaurant owner can only see their restaurant
  req.tenantId = tenantId;
  next();
}
```

---

## 🚀 SUMMARY

### **How Many Admins Are There?**

1. **Super Admins (ADMIN/OWNER role in platform tenant):** 1-5

   - They manage subscriptions, billing, all restaurants
   - Access all `/admin` endpoints

2. **Restaurant Owners (OWNER role in restaurant tenant):** 1 per restaurant

   - They manage only their restaurant
   - Cannot access `/admin` endpoints
   - Tenant middleware prevents cross-tenant access

3. **Branch Managers (MANAGER role):** 1-10 per restaurant

   - Limited to their branch
   - No admin access

4. **Staff (STAFF/CASHIER/CHEF role):** Many per restaurant
   - Limited to operations (orders, KOT)
   - No admin access

### **In Your Code:**

- Role `ADMIN` / `OWNER` (in platform) = Super Admin ✅
- Role `OWNER` (in restaurant) = Restaurant Owner ✅
- Role `MANAGER` = Branch Manager ✅
- Role `STAFF` = Employee ✅

---

**Total System:** Usually **1-5 super admins** + **1 owner per restaurant** + managers and staff
