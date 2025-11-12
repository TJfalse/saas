import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '../types/api.types'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  setUser: (user: User) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: true }),
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken, isAuthenticated: true }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// ============================================================================
// UI State
// ============================================================================

interface UIState {
  isSidebarOpen: boolean
  isNotificationOpen: boolean
  isMobileMenuOpen: boolean

  toggleSidebar: () => void
  toggleNotifications: () => void
  toggleMobileMenu: () => void
  closeSidebar: () => void
  closeNotifications: () => void
  closeMobileMenu: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  isNotificationOpen: false,
  isMobileMenuOpen: false,

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleNotifications: () =>
    set((state) => ({ isNotificationOpen: !state.isNotificationOpen })),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  closeNotifications: () => set({ isNotificationOpen: false }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
}))

// ============================================================================
// Notification State
// ============================================================================

export interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}

interface NotificationState {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],

  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          ...notification,
          id: Math.random().toString(36).substr(2, 9),
        },
      ],
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearNotifications: () => set({ notifications: [] }),
}))

// ============================================================================
// Menu/Tenant Data State
// ============================================================================

interface DataState {
  tenantId: string | null
  branchId: string | null

  setTenantId: (id: string) => void
  setBranchId: (id: string) => void
  reset: () => void
}

export const useDataStore = create<DataState>()(
  persist(
    (set) => ({
      tenantId: null,
      branchId: null,

      setTenantId: (tenantId) => set({ tenantId }),
      setBranchId: (branchId) => set({ branchId }),
      reset: () => set({ tenantId: null, branchId: null }),
    }),
    {
      name: 'data-store',
    }
  )
)
