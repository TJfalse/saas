import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingCart,
  Users,
  Receipt,
  Calendar,
  Package,
  FileText,
  Printer,
  Upload,
  ChevronRight,
} from 'lucide-react'
import { useUIStore } from '@/store'
import { useAuthStore } from '@/store'

interface NavItem {
  path: string
  label: string
  icon: React.ReactNode
  roles?: string[]
  children?: NavItem[]
}

const navItems: NavItem[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard size={20} />,
  },
  {
    path: '/menu',
    label: 'Menu',
    icon: <UtensilsCrossed size={20} />,
    roles: ['OWNER', 'MANAGER'],
  },
  {
    path: '/orders',
    label: 'Orders',
    icon: <ShoppingCart size={20} />,
  },
  {
    path: '/staff',
    label: 'Staff',
    icon: <Users size={20} />,
    roles: ['OWNER', 'MANAGER'],
  },
  {
    path: '/billing',
    label: 'Billing',
    icon: <Receipt size={20} />,
    roles: ['OWNER', 'MANAGER'],
  },
  {
    path: '/bookings',
    label: 'Bookings',
    icon: <Calendar size={20} />,
  },
  {
    path: '/inventory',
    label: 'Inventory',
    icon: <Package size={20} />,
    roles: ['OWNER', 'MANAGER'],
  },
  {
    path: '/reports',
    label: 'Reports',
    icon: <FileText size={20} />,
    roles: ['OWNER', 'MANAGER'],
  },
  {
    path: '/kot',
    label: 'KOT',
    icon: <Printer size={20} />,
  },
  {
    path: '/upload',
    label: 'Upload',
    icon: <Upload size={20} />,
    roles: ['OWNER', 'MANAGER'],
  },
]

export const Sidebar: React.FC = () => {
  const { isSidebarOpen, closeSidebar } = useUIStore()
  const { user } = useAuthStore()
  const [expandedItems, setExpandedItems] = React.useState<string[]>([])

  const toggleExpand = (path: string) => {
    setExpandedItems((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    )
  }

  const isNavItemVisible = (item: NavItem): boolean => {
    if (!item.roles) return true
    return item.roles.includes(user?.role || '')
  }

  const visibleItems = navItems.filter(isNavItemVisible)

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-slate-900 text-white shadow-lg transition-transform duration-300 z-40 md:relative md:top-0 md:h-screen ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="overflow-y-auto h-full">
          <nav className="p-4 space-y-2">
            {visibleItems.map((item) => (
              <div key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => closeSidebar()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      isActive
                        ? 'bg-primary-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`
                  }
                >
                  {item.icon}
                  <span className="flex-1 text-sm font-medium">{item.label}</span>
                  {item.children && (
                    <ChevronRight
                      size={16}
                      className={`transition ${
                        expandedItems.includes(item.path) ? 'rotate-90' : ''
                      }`}
                    />
                  )}
                </NavLink>

                {/* Children items */}
                {item.children && expandedItems.includes(item.path) && (
                  <div className="ml-4 mt-2 space-y-1 border-l border-slate-700">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        onClick={() => closeSidebar()}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${
                            isActive
                              ? 'text-primary-400'
                              : 'text-slate-400 hover:text-slate-200'
                          }`
                        }
                      >
                        <span>{child.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  )
}
