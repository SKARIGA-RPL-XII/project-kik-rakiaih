import React, { useState, useEffect } from 'react';
import { authService } from '../../utils/auth'; // ✅ Import authService

const Profile = () => {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ fullName: '', phone: '', address: '' });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // ✅ Get user dari localStorage
  const currentUser = authService.getUser();

  useEffect(() => { 
    fetchUser(); 
  }, []);

  const fetchUser = async () => {
    setLoading(true);
    try {
      // ✅ Gunakan userId dari user yang login
      const userId = currentUser?.userId;
      
      if (!userId) {
        console.error('User ID tidak ditemukan');
        setLoading(false);
        return;
      }

      const res = await fetch(`http://localhost:5014/api/Users/${userId}`);
      
      if (!res.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const data = await res.json();
      console.log('User data:', data); // Debug
      
      setUser(data);
      setForm({ 
        fullName: data.FullName || data.fullName, 
        phone: data.Phone || data.phone, 
        address: data.Address || data.address || '' 
      });
    } catch (err) {
      console.error('Error fetching user:', err);
      alert('Gagal memuat data profil');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const userId = user.UserId || user.userId;
      
      // ✅ Prepare data sesuai format backend
      const updateData = {
        username: user.Username || user.username,
        email: user.Email || user.email,
        fullName: form.fullName,
        phone: form.phone,
        address: form.address,
        role: user.Role ?? user.role
      };

      const res = await fetch(`http://localhost:5014/api/Users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        throw new Error('Failed to update profile');
      }

      // ✅ Update localStorage dengan data baru
      const updatedUser = {
        ...currentUser,
        fullName: form.fullName
      };
      authService.login(updatedUser);

      alert('Profil berhasil diupdate!');
      setEditing(false);
      fetchUser();
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Gagal mengupdate profil');
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-pulse text-gray-500 font-medium">Loading Profile...</div>
      </div>
    );
  }

  // ✅ Handle both PascalCase and camelCase
  const userFullName = user.FullName || user.fullName || 'User';
  const userEmail = user.Email || user.email || '';
  const userPhone = user.Phone || user.phone || '';
  const userAddress = user.Address || user.address || '';
  const userRole = user.Role ?? user.role;
  
  // Map role number to text
  const getRoleText = (role) => {
    const roles = {
      0: 'Customer',
      1: 'Admin'
    };
    return typeof role === 'number' ? roles[role] : role;
  };

  return (
    <div className="max-w-5xl mx-auto p-6 min-h-screen bg-gray-50">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-8 pb-4 border-b">Profil Saya</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Basic Info */}
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

        {/* Right Column: Detailed Info / Form */}
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
                      onClick={() => {
                        setEditing(false);
                        setForm({ 
                          fullName: userFullName, 
                          phone: userPhone, 
                          address: userAddress 
                        });
                      }}
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