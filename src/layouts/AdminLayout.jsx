// src/layouts/AdminLayout.jsx
import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarClock, 
  Trophy, 
  Users, 
  CreditCard, 
  BarChart3,
  LogOut 
} from 'lucide-react';
const AdminLayout = ({ user, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin' },
  { icon: <CalendarClock size={20} />, label: 'Kelola Booking', path: '/admin/bookings' },
  { icon: <Trophy size={20} />, label: 'Kelola Lapangan', path: '/admin/fields' },
  { icon: <Users size={20} />, label: 'Kelola Member', path: '/admin/members' },
  { icon: <CreditCard size={20} />, label: 'Kelola Payment', path: '/admin/payments' },
  { icon: <BarChart3 size={20} />, label: 'Laporan', path: '/admin/reports' },
];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 z-50 ${collapsed ? 'w-20' : 'w-64'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 p-6 border-b border-gray-700">
          <span className="text-3xl">🏟️</span>
          {!collapsed && <h2 className="text-xl font-bold">SportVenue</h2>}
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } ${collapsed ? 'justify-center' : ''}`
              }
            >
              <span className="text-xl">{item.icon}</span>
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Collapse Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium"
          >
            {collapsed ? '➡️' : '⬅️'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Navbar */}
        <header className="sticky top-0 z-40 bg-white shadow-sm">
          <div className="flex items-center justify-between px-8 py-4">
            <h3 className="text-lg font-semibold text-gray-800">Admin Panel</h3>
            
            <div className="flex items-center gap-4">
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-pink-600 flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-gray-800">Administrator</p>
                  <p className="text-xs text-pink-500 font-medium">Admin</p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="px-5 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-pink-500 hover:text-white hover:border-pink-500 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;