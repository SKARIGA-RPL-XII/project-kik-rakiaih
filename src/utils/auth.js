// src/utils/auth.js

// src/utils/auth.js

const USER_KEY = 'user_data';

export const authService = {
  login: (userData) => {
    // userData biasanya: { userId, role, username, email, fullName, token }
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    
    const expiry = new Date().getTime() + (24 * 60 * 60 * 1000); 
    localStorage.setItem('auth_expiry', expiry.toString());
  },

  getAuthData: () => {
    const expiry = localStorage.getItem('auth_expiry');
    
    if (expiry && new Date().getTime() > parseInt(expiry)) {
      authService.logout();
      return null;
    }

    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null; 
  },

  getUser: () => {
    // Karena user_data kamu berisi objek user + token secara flat,
    // kita kembalikan semua datanya di sini.
    return authService.getAuthData();
  },

  isAuthenticated: () => {
    return authService.getUser() !== null;
  },

  logout: () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('auth_expiry');
  }
};

//   // Fungsi baru yang dibutuhkan oleh Bookings.jsx
//   getAuthData: () => {
//     const expiry = localStorage.getItem('auth_expiry');
    
//     if (expiry && new Date().getTime() > parseInt(expiry)) {
//       authService.logout();
//       return null;
//     }

//     const data = localStorage.getItem(USER_KEY);
//     return data ? JSON.parse(data) : null; // Mengembalikan { token, user }
//   },

//   getUser: () => {
//     const data = authService.getAuthData();
//     return data ? data.user : null;
//   },

//   isAuthenticated: () => {
//     return authService.getUser() !== null;
//   }
// };