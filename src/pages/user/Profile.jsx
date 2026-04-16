import React, { useState, useEffect } from 'react';
import { authService } from '../../utils/auth';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ fullName: '', phone: '', address: '' });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Ambil user data
  const currentUser = authService.getUser();

  useEffect(() => {
    // Pastikan fetchUser dipanggil hanya jika currentUser ada
    if (currentUser) {
      fetchUser();
    } else {
      console.error('No current user found in storage');
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    setLoading(true);
    try {
      // Ambil ulang dari storage untuk memastikan data terbaru
      const storedUser = authService.getUser(); 
      console.log("Data dari storage:", storedUser);

      // Gunakan nama properti yang sesuai dengan screenshot (userId)
      const userId = storedUser?.userId; 
      
      if (!userId) {
        console.error('User ID masih tidak ditemukan. Isi storedUser:', storedUser);
        setLoading(false);
        return;
      }

      const res = await fetch(`http://localhost:5014/api/Users/${userId}`);
      
      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }
      
      const data = await res.json();
      
      setUser(data);
      // Sinkronkan form dengan data dari backend
      setForm({ 
        fullName: data.fullName || data.FullName || '', 
        phone: data.phone || data.Phone || '', 
        address: data.address || data.Address || '' 
      });
    } catch (err) {
      console.error('Error fetching user:', err);
      // Jangan alert jika gagal fetch awal agar tidak mengganggu UX, 
      // cukup tampilkan state error di UI jika perlu
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const userId = user?.userId || user?.UserId;
      
      const updateData = {
        // Tetap sertakan data lama yang tidak diubah agar tidak NULL di DB
        username: user.username || user.Username,
        email: user.email || user.Email,
        fullName: form.fullName,
        phone: form.phone,
        address: form.address,
        role: user.role ?? user.Role
      };

      const res = await fetch(`http://localhost:5014/api/Users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) throw new Error('Failed to update profile');

      // ✅ Update data di localStorage agar navbar/komponen lain ikut update
      const updatedLocalStorageUser = {
        ...currentUser,
        fullName: form.fullName
      };
      // Gunakan method yang sesuai di authService Anda untuk update storage
      localStorage.setItem('user', JSON.stringify(updatedLocalStorageUser));

      alert('Profil berhasil diupdate!');
      setEditing(false);
      fetchUser(); // Refresh data
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Gagal mengupdate profil');
    }
  };

  // State loading yang lebih informatif
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
           <div className="text-gray-500 font-medium">Memuat Profil...</div>
        </div>
      </div>
    );
  }

  // Jika Loading selesai tapi user tetap tidak ada
  if (!user && !loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Sesi berakhir atau data tidak ditemukan. Silakan login kembali.</div>
      </div>
    );
  }

  // Helper untuk akses properti yang case-insensitive
  const userFullName = user?.fullName || user?.FullName || 'User';
  const userEmail = user?.email || user?.Email || '';
  const userPhone = user?.phone || user?.Phone || '';
  const userAddress = user?.address || user?.Address || '';
  const userRole = user?.role ?? user?.Role;

  const getRoleText = (role) => {
    const roles = { 0: 'Customer', 1: 'Admin' };
    return roles[role] || 'User';
  };

  return (
    <div className="max-w-5xl mx-auto p-6 min-h-screen bg-gray-50">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-8 pb-4 border-b">Profil Saya</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full flex items-center justify-center text-white text-4xl font-black shadow-lg mx-auto">
                {userFullName.charAt(0).toUpperCase()}
              </div>
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-800">{userFullName}</h3>
            <p className="text-gray-500 text-sm mb-4">{userEmail}</p>
            <span className="inline-block px-4 py-1 bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider rounded-full">
              {getRoleText(userRole)}
            </span>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
              <h4 className="font-bold text-gray-700">Informasi Pribadi</h4>
              {!editing && (
                <button 
                  onClick={() => setEditing(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                  </svg>
                  Edit Profil
                </button>
              )}
            </div>

            <div className="p-8">
              {!editing ? (
                <div className="grid grid-cols-1 gap-y-6">
                  <div className="flex flex-col sm:flex-row sm:border-b sm:border-gray-50 pb-4">
                    <span className="text-sm font-medium text-gray-400 w-full sm:w-1/3">Nama Lengkap</span>
                    <span className="text-gray-800 font-semibold">{userFullName}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:border-b sm:border-gray-50 pb-4">
                    <span className="text-sm font-medium text-gray-400 w-full sm:w-1/3">Alamat Email</span>
                    <span className="text-gray-800 font-semibold">{userEmail}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:border-b sm:border-gray-50 pb-4">
                    <span className="text-sm font-medium text-gray-400 w-full sm:w-1/3">Nomor Telepon</span>
                    <span className="text-gray-800 font-semibold">{userPhone}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row pb-4">
                    <span className="text-sm font-medium text-gray-400 w-full sm:w-1/3">Alamat Lengkap</span>
                    <span className="text-gray-800 font-semibold">{userAddress || '-'}</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-bold text-gray-600">Nama Lengkap</label>
                    <input 
                      type="text" 
                      name="fullName" 
                      value={form.fullName} 
                      onChange={handleChange} 
                      required 
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-bold text-gray-600">Nomor Telepon</label>
                    <input 
                      type="text" 
                      name="phone" 
                      value={form.phone} 
                      onChange={handleChange} 
                      required 
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-bold text-gray-600">Alamat</label>
                    <textarea 
                      name="address" 
                      value={form.address} 
                      onChange={handleChange} 
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    ></textarea>
                  </div>
                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-50">
                    <button 
                      type="button" 
                      className="px-6 py-2 text-gray-500 font-semibold hover:bg-gray-100 rounded-xl transition"
                      onClick={() => setEditing(false)}
                    >
                      Batal
                    </button>
                    <button 
                      type="submit" 
                      className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-200 transition transform active:scale-95"
                    >
                      Simpan Perubahan
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;