import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { authService } from "./utils/auth";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminBookings from "./pages/admin/Bookings";
import AdminFields from "./pages/admin/Fields";
import AdminMembers from "./pages/admin/Members";
import AdminPayments from "./pages/admin/Payments";
import AdminReports from "./pages/admin/Reports";

// User Pages
import UserDashboard from "./pages/user/Dashboard";
import UserBooking from "./pages/user/Booking";
import UserMyBookings from "./pages/user/MyBookings";
import UserMembership from "./pages/user/Membership";
import UserProfile from "./pages/user/Profile";

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // ✅ Load user dari localStorage saat app start (HANYA SEKALI)
  useEffect(() => {
    if (!initialized) {
      const savedUser = authService.getUser();
      if (savedUser) {
        setUser(savedUser);
      }
      setLoading(false);
      setInitialized(true);
    }
  }, [initialized]);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  const ProtectedRoute = ({ children, role }) => {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      );
    }

    if (!user) {
      return <Navigate to="/login" replace />;
    }

    // ✅ Jika role tidak sesuai, redirect ke halaman yang benar
    if (role !== undefined && user.role !== role) {
      const redirectPath = user.role === 1 ? "/admin" : "/user";
      return <Navigate to={redirectPath} replace />;
    }

    return children;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route
          path="/login"
          element={
            !user ? (
              <Login onLogin={handleLogin} />
            ) : (
              <Navigate to={user.role === 1 ? "/admin" : "/user"} replace />
            )
          }
        />
        <Route
          path="/register"
          element={
            !user ? (
              <Register />
            ) : (
              <Navigate to={user.role === 1 ? "/admin" : "/user"} replace />
            )
          }
        />

        {/* ✅ Admin Routes (Role 1) - DIPERBAIKI */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role={1}>
              <AdminLayout user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="fields" element={<AdminFields />} />
          <Route path="members" element={<AdminMembers />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>

        {/* ✅ User Routes (Role 0) */}
        <Route
          path="/user"
          element={
            <ProtectedRoute role={0}>
              <UserLayout onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserDashboard />} />
          <Route path="booking" element={<UserBooking />} />
          <Route path="my-bookings" element={<UserMyBookings />} />
          <Route path="membership" element={<UserMembership />} />
          <Route path="profile" element={<UserProfile />} />
        </Route>

        {/* Default Redirect Logic */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate to={user.role === 1 ? "/admin" : "/user"} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Catch All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;