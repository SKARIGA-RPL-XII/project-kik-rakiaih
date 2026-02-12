import React, { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import myLogo from "../assets/logo.png";
import { authService } from "../utils/auth"; // ✅ Import authService

const UserLayout = ({ onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // ✅ Get user dari localStorage
  const user = authService.getUser();

  // Efek untuk deteksi scroll agar navbar berubah saat di-scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    { icon: "🏠", label: "Beranda", path: "/user" },
    { icon: "📅", label: "Booking", path: "/user/booking" },
    { icon: "📋", label: "Riwayat", path: "/user/my-bookings" },
    { icon: "⭐", label: "Member", path: "/user/membership" },
    { icon: "👤", label: "Profil", path: "/user/profile" },
  ];

  // ✅ Get user data dengan fallback
  const userFullName = user?.fullName || user?.FullName || 'User';
  const userEmail = user?.email || user?.Email || '';
  const userInitial = userFullName.charAt(0).toUpperCase();

  // ✅ Get role text
  const getRoleText = (role) => {
    const roles = {
      0: 'Customer',
      1: 'Admin'
    };
    return typeof role === 'number' ? roles[role] : role;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      {/* Navbar Modern */}
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled 
            ? "bg-white/80 backdrop-blur-md shadow-md py-2" 
            : "bg-white py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            
            {/* Logo Section */}
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="p-1 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                <img
                  src={myLogo}
                  alt="Logo SportVenue"
                  className="h-9 w-auto object-contain"
                />
              </div>
              <div className="flex flex-col">
                <h2 className="text-xl font-extrabold text-slate-900 leading-none tracking-tight">
                  SportVenue
                </h2>
                <span className="text-[10px] text-pink-600 font-bold tracking-[0.2em] uppercase">
                  Management
                </span>
              </div>
            </div>

            {/* Desktop Menu - Pill Style */}
            <nav className="hidden md:flex items-center bg-slate-100/50 p-1 rounded-2xl border border-slate-200">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/user"}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
                      isActive
                        ? "bg-white text-pink-600 shadow-sm ring-1 ring-slate-200"
                        : "text-slate-500 hover:text-slate-900"
                    }`
                  }
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* User Profile Card - ✅ Dynamic Data */}
              <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800 leading-none">
                    {userFullName}
                  </p>
                  <span className="text-[11px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                    ● {getRoleText(user?.role)}
                  </span>
                </div>
                <div className="relative group">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white font-bold shadow-lg shadow-pink-200 transition-transform group-hover:rotate-6">
                    {userInitial}
                  </div>
                </div>
              </div>

              {/* Logout Button - Minimalist */}
              <button
                onClick={onLogout}
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 transition-all"
                title="Logout"
              >
                <span className="text-lg">🚪</span>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-600"
              >
                {menuOpen ? "✕" : "☰"}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown - Glass Style */}
        {menuOpen && (
          <div className="md:hidden absolute w-full bg-white/95 backdrop-blur-lg border-b border-slate-200 shadow-2xl animate-in slide-in-from-top">
            <div className="p-4 space-y-2">
              {/* ✅ Mobile User Info */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl mb-2 border border-pink-100">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white font-bold shadow">
                  {userInitial}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{userFullName}</p>
                  <p className="text-xs text-slate-500">{userEmail}</p>
                </div>
              </div>

              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/user"}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                      isActive
                        ? "bg-pink-600 text-white"
                        : "text-slate-600 hover:bg-slate-50"
                    }`
                  }
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-4 px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
              >
                <span className="text-xl">🚪</span> Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content dengan Animation */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 min-h-[70vh] p-6 sm:p-10">
          <Outlet />
        </div>
      </main>

      {/* Footer Minimalist */}
      <footer className="py-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100">
           <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
           <p className="text-xs font-semibold text-slate-400">
             © 2026 SportVenue Platform. All rights reserved.
           </p>
        </div>
      </footer>
    </div>
  );
};

export default UserLayout;