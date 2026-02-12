// src/utils/auth.js

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export const authService = {
  // Simpan token dan user data
  login: (userData) => {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    // Set expiry 1 hari dari sekarang
    const expiry = new Date().getTime() + (24 * 60 * 60 * 1000); // 1 hari dalam milliseconds
    localStorage.setItem('auth_expiry', expiry.toString());
  },

  // Logout - hapus semua data
  logout: () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('auth_expiry');
  },

  // Get user data
  getUser: () => {
    const expiry = localStorage.getItem('auth_expiry');
    
    // Cek apakah token sudah expired
    if (expiry && new Date().getTime() > parseInt(expiry)) {
      // Token expired, logout otomatis
      authService.logout();
      return null;
    }

    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  // Check apakah user sudah login
  isAuthenticated: () => {
    return authService.getUser() !== null;
  }
};