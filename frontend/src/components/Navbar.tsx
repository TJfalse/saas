import React from 'react'
import { LogOut, Menu, X, Bell, User, Settings } from 'lucide-react'
import { useAuthStore, useUIStore } from '@/store'
import { useNavigate } from 'react-router-dom'

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore()
  const { isMobileMenuOpen, toggleMobileMenu } = useUIStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">☕</span>
            </div>
            <span className="hidden sm:block font-bold text-lg text-slate-900">
              CafeSaaS
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-slate-100 rounded-lg transition">
                <Bell size={20} className="text-slate-600" />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition">
                <Settings size={20} className="text-slate-600" />
              </button>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
                <User size={18} className="text-primary-600" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-900">{user?.name || user?.email}</p>
                <p className="text-xs text-slate-500">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 p-2 hover:bg-slate-100 rounded-lg transition"
                title="Logout"
              >
                <LogOut size={18} className="text-slate-600" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center gap-3 pb-4">
              <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
                <User size={18} className="text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{user?.name || user?.email}</p>
                <p className="text-xs text-slate-500">{user?.role}</p>
              </div>
            </div>
            <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-100 rounded-lg">
              <Bell size={18} className="text-slate-600" />
              <span className="text-sm">Notifications</span>
            </button>
            <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-100 rounded-lg">
              <Settings size={18} className="text-slate-600" />
              <span className="text-sm">Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-100 rounded-lg text-secondary-600"
            >
              <LogOut size={18} />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
