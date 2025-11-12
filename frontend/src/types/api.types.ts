// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Auth Types
export interface User {
  id: string
  email: string
  name?: string
  role: 'OWNER' | 'MANAGER' | 'STAFF' | 'KITCHEN'
  tenantId: string
  branchId?: string
  isActive: boolean
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  name: string
  tenantName: string
}

export interface RefreshTokenPayload {
  refreshToken: string
}

// Tenant Types
export interface Tenant {
  id: string
  name: string
  email: string
  domain: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateTenantPayload {
  name: string
  email: string
  password: string
  domain: string
  branchName: string
}

export interface Branch {
  id: string
  tenantId: string
  name: string
  address?: string
  phone?: string
  isActive: boolean
  createdAt: string
}

// Menu Types
export interface MenuItem {
  id: string
  tenantId: string
  sku: string
  name: string
  price: number
  category: string
  description?: string
  costPrice?: number
  isInventoryTracked: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateMenuItemPayload {
  name: string
  price: number
  category?: string
  description?: string
  sku?: string
  costPrice?: number
  isInventoryTracked?: boolean
}

export interface UpdateMenuItemPayload extends Partial<CreateMenuItemPayload> {}

// Order Types
export interface OrderItem {
  id: string
  orderId: string
  menuItemId: string
  quantity: number
  price: number
  notes?: string
}

export interface Order {
  id: string
  tenantId: string
  branchId: string
  status: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED'
  items: OrderItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CreateOrderPayload {
  branchId: string
  items: Array<{
    menuItemId: string
    quantity: number
    notes?: string
  }>
  tax?: number
  discount?: number
  notes?: string
}

// Staff Types
export interface Staff {
  id: string
  tenantId: string
  branchId?: string
  email: string
  name?: string
  role: 'MANAGER' | 'STAFF' | 'KITCHEN'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateStaffPayload {
  email: string
  password: string
  name?: string
  role: 'MANAGER' | 'STAFF' | 'KITCHEN'
  branchId?: string
}

export interface UpdateStaffPayload extends Partial<Omit<CreateStaffPayload, 'password'>> {}

export interface AssignRolePayload {
  role: 'MANAGER' | 'STAFF' | 'KITCHEN'
}

// Billing Types
export interface Invoice {
  id: string
  tenantId: string
  invoiceNumber: string
  amount: number
  tax: number
  discount: number
  finalAmount: number
  status: 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED'
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export interface CreateInvoicePayload {
  orderId: string
  amount: number
  tax?: number
  discount?: number
  dueDate?: string
}

export interface Payment {
  id: string
  invoiceId: string
  amount: number
  method: 'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER' | 'WALLET' | 'CHEQUE'
  status: 'COMPLETED' | 'FAILED' | 'PENDING'
  reference?: string
  paidAt: string
  createdAt: string
}

export interface ProcessPaymentPayload {
  amount: number
  method: 'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER' | 'WALLET' | 'CHEQUE'
  reference?: string
}

// Booking Types
export interface Booking {
  id: string
  tenantId: string
  branchId: string
  customerName: string
  customerPhone?: string
  partySize: number
  startTime: string
  endTime: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  deposit?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CreateBookingPayload {
  branchId: string
  tableId?: string
  customerName: string
  customerPhone?: string
  partySize: number
  startTime: string
  endTime: string
  deposit?: number
  notes?: string
}

// Inventory Types
export interface InventoryItem {
  id: string
  tenantId: string
  productId: string
  qty: number
  minQty: number
  createdAt: string
  updatedAt: string
}

export interface CreateInventoryPayload {
  productId: string
  qty: number
  minQty?: number
}

export interface UpdateInventoryPayload {
  qty?: number
  minQty?: number
}

// Dashboard Types
export interface DashboardOverview {
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  avgOrderValue: number
  pendingOrders: number
}

export interface SalesAnalytics {
  date: string
  sales: number
  orders: number
}

export interface TopProduct {
  id: string
  name: string
  sales: number
  revenue: number
  quantity: number
}

// Report Types
export interface SalesReport {
  totalSales: number
  totalOrders: number
  avgOrderValue: number
  byCategory: Array<{
    category: string
    sales: number
    orders: number
  }>
  byProduct: TopProduct[]
}

export interface InventoryReport {
  totalItems: number
  lowStockItems: number
  items: InventoryItem[]
}

export interface StaffPerformanceReport {
  staffId: string
  name: string
  ordersHandled: number
  totalSales: number
  avgOrderValue: number
}

export interface PaymentReport {
  totalPayments: number
  totalAmount: number
  byMethod: Array<{
    method: string
    count: number
    amount: number
  }>
}

// KOT Types
export interface KOT {
  id: string
  tenantId: string
  branchId: string
  orderItems: OrderItem[]
  status: 'PENDING' | 'PRINTED' | 'COMPLETED'
  createdAt: string
  updatedAt: string
}

// File Upload Types
export interface BulkUploadResponse {
  success: number
  failed: number
  errors: Array<{
    row: number
    error: string
  }>
}
