import { apiClient } from './client'
import {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  MenuItem,
  CreateMenuItemPayload,
  UpdateMenuItemPayload,
  Order,
  CreateOrderPayload,
  Staff,
  CreateStaffPayload,
  UpdateStaffPayload,
  AssignRolePayload,
  Invoice,
  CreateInvoicePayload,
  Payment,
  ProcessPaymentPayload,
  Booking,
  CreateBookingPayload,
  InventoryItem,
  CreateInventoryPayload,
  UpdateInventoryPayload,
  DashboardOverview,
  SalesAnalytics,
  TopProduct,
  SalesReport,
  InventoryReport,
  StaffPerformanceReport,
  PaymentReport,
  KOT,
  BulkUploadResponse,
  Tenant,
  CreateTenantPayload,
  Branch,
} from '../types/api.types'

// ============================================================================
// AUTH ENDPOINTS (3 endpoints)
// ============================================================================

export const authService = {
  register: (payload: RegisterPayload) => apiClient.post<AuthResponse>('/auth/register', payload),
  login: (payload: LoginPayload) => apiClient.post<AuthResponse>('/auth/login', payload),
  refresh: (refreshToken: string) =>
    apiClient.post<AuthResponse>('/auth/refresh', { refreshToken }),
}

// ============================================================================
// TENANT ENDPOINTS (2 endpoints)
// ============================================================================

export const tenantService = {
  create: (payload: CreateTenantPayload) => apiClient.post<Tenant>('/tenants', payload),
  get: (id: string) => apiClient.get<Tenant>(`/tenants/${id}`),
}

// ============================================================================
// MENU ENDPOINTS (7 endpoints)
// ============================================================================

export const menuService = {
  // GET /menu/:tenantId - List all menu items
  getAll: (tenantId: string) => apiClient.get<MenuItem[]>(`/menu/${tenantId}`),

  // POST /menu/:tenantId - Create menu item
  create: (tenantId: string, payload: CreateMenuItemPayload) =>
    apiClient.post<MenuItem>(`/menu/${tenantId}`, payload),

  // GET /menu/:tenantId/item/:itemId - Get menu item by ID
  getById: (tenantId: string, itemId: string) =>
    apiClient.get<MenuItem>(`/menu/${tenantId}/item/${itemId}`),

  // PUT /menu/:tenantId/:itemId - Update menu item
  update: (tenantId: string, itemId: string, payload: UpdateMenuItemPayload) =>
    apiClient.put<MenuItem>(`/menu/${tenantId}/${itemId}`, payload),

  // PATCH /menu/:tenantId/:itemId/deactivate - Deactivate menu item
  deactivate: (tenantId: string, itemId: string) =>
    apiClient.patch<MenuItem>(`/menu/${tenantId}/${itemId}/deactivate`, {}),

  // GET /menu/:tenantId/categories - Get menu categories
  getCategories: (tenantId: string) => apiClient.get<string[]>(`/menu/${tenantId}/categories`),

  // GET /menu/:tenantId/category/:category - Get items by category
  getByCategory: (tenantId: string, category: string) =>
    apiClient.get<MenuItem[]>(`/menu/${tenantId}/category/${category}`),
}

// ============================================================================
// ORDER ENDPOINTS (2 endpoints)
// ============================================================================

export const orderService = {
  // POST /orders - Create order
  create: (payload: CreateOrderPayload) => apiClient.post<Order>('/orders', payload),

  // GET /orders/:id - Get order details
  getById: (id: string) => apiClient.get<Order>(`/orders/${id}`),
}

// ============================================================================
// STAFF ENDPOINTS (7 endpoints)
// ============================================================================

export const staffService = {
  // GET /staff/:tenantId - List all staff
  getAll: (tenantId: string) => apiClient.get<Staff[]>(`/staff/${tenantId}`),

  // POST /staff/:tenantId - Create staff
  create: (tenantId: string, payload: CreateStaffPayload) =>
    apiClient.post<Staff>(`/staff/${tenantId}`, payload),

  // GET /staff/:tenantId/:staffId - Get staff by ID
  getById: (tenantId: string, staffId: string) =>
    apiClient.get<Staff>(`/staff/${tenantId}/${staffId}`),

  // PUT /staff/:tenantId/:staffId - Update staff
  update: (tenantId: string, staffId: string, payload: UpdateStaffPayload) =>
    apiClient.put<Staff>(`/staff/${tenantId}/${staffId}`, payload),

  // PATCH /staff/:tenantId/:staffId/deactivate - Deactivate staff
  deactivate: (tenantId: string, staffId: string) =>
    apiClient.patch<Staff>(`/staff/${tenantId}/${staffId}/deactivate`, {}),

  // POST /staff/:tenantId/:staffId/role - Assign role
  assignRole: (tenantId: string, staffId: string, payload: AssignRolePayload) =>
    apiClient.post<Staff>(`/staff/${tenantId}/${staffId}/role`, payload),

  // GET /staff/:tenantId/branch/:branchId - Get staff by branch
  getByBranch: (tenantId: string, branchId: string) =>
    apiClient.get<Staff[]>(`/staff/${tenantId}/branch/${branchId}`),
}

// ============================================================================
// BILLING ENDPOINTS (5 endpoints)
// ============================================================================

export const billingService = {
  // GET /billing/:tenantId/summary - Get billing summary
  getSummary: (tenantId: string) =>
    apiClient.get<{ totalRevenue: number; pendingInvoices: number }>(
      `/billing/${tenantId}/summary`
    ),

  // GET /billing/:tenantId - Get invoices list
  getInvoices: (tenantId: string) => apiClient.get<Invoice[]>(`/billing/${tenantId}`),

  // POST /billing/:tenantId - Create invoice
  createInvoice: (tenantId: string, payload: CreateInvoicePayload) =>
    apiClient.post<Invoice>(`/billing/${tenantId}`, payload),

  // GET /billing/:tenantId/invoices/:invoiceId - Get invoice by ID
  getInvoiceById: (tenantId: string, invoiceId: string) =>
    apiClient.get<Invoice>(`/billing/${tenantId}/invoices/${invoiceId}`),

  // POST /billing/:tenantId/invoices/:invoiceId/payments - Process payment
  processPayment: (tenantId: string, invoiceId: string, payload: ProcessPaymentPayload) =>
    apiClient.post<Payment>(`/billing/${tenantId}/invoices/${invoiceId}/payments`, payload),
}

// ============================================================================
// BOOKING ENDPOINTS (2 endpoints)
// ============================================================================

export const bookingService = {
  // POST /bookings - Create booking
  create: (payload: CreateBookingPayload) => apiClient.post<Booking>('/bookings', payload),

  // GET /bookings/branch/:branchId - List bookings by branch
  getByBranch: (branchId: string) => apiClient.get<Booking[]>(`/bookings/branch/${branchId}`),
}

// ============================================================================
// INVENTORY ENDPOINTS (5 endpoints)
// ============================================================================

export const inventoryService = {
  // GET /inventory/:tenantId/low-stock - Get low stock items
  getLowStock: (tenantId: string) => apiClient.get<InventoryItem[]>(`/inventory/${tenantId}/low-stock`),

  // GET /inventory/:tenantId - Get all inventory items
  getAll: (tenantId: string) => apiClient.get<InventoryItem[]>(`/inventory/${tenantId}`),

  // POST /inventory/:tenantId - Create inventory item
  create: (tenantId: string, payload: CreateInventoryPayload) =>
    apiClient.post<InventoryItem>(`/inventory/${tenantId}`, payload),

  // PUT /inventory/:itemId - Update inventory item
  update: (itemId: string, payload: UpdateInventoryPayload) =>
    apiClient.put<InventoryItem>(`/inventory/${itemId}`, payload),

  // DELETE /inventory/:itemId - Delete inventory item
  delete: (itemId: string) => apiClient.delete<{ success: boolean }>(`/inventory/${itemId}`),
}

// ============================================================================
// DASHBOARD ENDPOINTS (4 endpoints)
// ============================================================================

export const dashboardService = {
  // GET /dashboard/overview/:tenantId - Get dashboard overview
  getOverview: (tenantId: string) =>
    apiClient.get<DashboardOverview>(`/dashboard/overview/${tenantId}`),

  // GET /dashboard/analytics/:tenantId - Get sales analytics
  getSalesAnalytics: (tenantId: string, startDate?: string, endDate?: string) =>
    apiClient.get<SalesAnalytics[]>(`/dashboard/analytics/${tenantId}`, {
      params: { startDate, endDate },
    }),

  // GET /dashboard/charts/:tenantId - Get revenue charts
  getRevenueCharts: (tenantId: string, period?: string) =>
    apiClient.get<Array<{ date: string; revenue: number }>>(
      `/dashboard/charts/${tenantId}`,
      { params: { period } }
    ),

  // GET /dashboard/top-products/:tenantId - Get top products
  getTopProducts: (tenantId: string, limit?: number) =>
    apiClient.get<TopProduct[]>(`/dashboard/top-products/${tenantId}`, {
      params: { limit },
    }),
}

// ============================================================================
// REPORT ENDPOINTS (6 endpoints)
// ============================================================================

export const reportService = {
  // GET /reports/sales/:tenantId - Get sales report
  getSalesReport: (
    tenantId: string,
    startDate?: string,
    endDate?: string,
    groupBy?: string
  ) =>
    apiClient.get<SalesReport>(`/reports/sales/${tenantId}`, {
      params: { startDate, endDate, groupBy },
    }),

  // GET /reports/inventory/:tenantId - Get inventory report
  getInventoryReport: (tenantId: string) =>
    apiClient.get<InventoryReport>(`/reports/inventory/${tenantId}`),

  // GET /reports/staff/:tenantId - Get staff performance report
  getStaffPerformanceReport: (tenantId: string, startDate?: string, endDate?: string) =>
    apiClient.get<StaffPerformanceReport[]>(`/reports/staff/${tenantId}`, {
      params: { startDate, endDate },
    }),

  // GET /reports/payment/:tenantId - Get payment report
  getPaymentReport: (tenantId: string, startDate?: string, endDate?: string) =>
    apiClient.get<PaymentReport>(`/reports/payment/${tenantId}`, {
      params: { startDate, endDate },
    }),

  // GET /reports/dashboard/:tenantId - Get dashboard summary report
  getDashboardSummary: (tenantId: string) =>
    apiClient.get<DashboardOverview>(`/reports/dashboard/${tenantId}`),

  // POST /reports/export/sales/:tenantId - Export sales data
  exportSalesData: (tenantId: string, format?: string, startDate?: string, endDate?: string) =>
    apiClient.post<BulkUploadResponse>(`/reports/export/sales/${tenantId}`, {}, {
      params: { format, startDate, endDate },
    }),
}

// ============================================================================
// KOT ENDPOINTS (2 endpoints)
// ============================================================================

export const kotService = {
  // GET /kot/branch/:branchId - List KOT by branch
  getByBranch: (branchId: string, status?: string) =>
    apiClient.get<KOT[]>(`/kot/branch/${branchId}`, { params: { status } }),

  // POST /kot/:id/print - Print KOT
  print: (id: string) => apiClient.post<{ success: boolean }>(`/kot/${id}/print`, {}),
}

// ============================================================================
// UPLOAD ENDPOINTS (1 endpoint)
// ============================================================================

export const uploadService = {
  // POST /upload/bulk - Bulk upload
  bulkUpload: (formData: FormData, type?: string) =>
    apiClient.uploadFile<BulkUploadResponse>('/upload/bulk', formData, {
      params: { type },
    }),
}

// ============================================================================
// TOTAL: 45 ENDPOINTS
// ============================================================================
// Auth: 3, Tenant: 2, Menu: 7, Order: 2, Staff: 7, Billing: 5,
// Booking: 2, Inventory: 5, Dashboard: 4, Report: 6, KOT: 2, Upload: 1
// ============================================================================
