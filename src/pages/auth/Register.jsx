import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', fullName: '', phone: '', address: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5014/api/Auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const msg = await res.text();
        setError(msg);
        return;
      }

      navigate('/login');
    } catch {
      setError('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-10">
      <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl">
        <div className="text-center mb-8">
          <span className="text-5xl">🏟️</span>
          <h1 className="text-3xl font-bold text-slate-800 mt-2">Daftar Akun</h1>
          <p className="text-slate-500 text-sm">Bergabunglah dengan komunitas SportVenue</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Username</label>
            <input type="text" name="username" onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none" placeholder="johndoe" required />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Lengkap</label>
            <input type="text" name="fullName" onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none" placeholder="John Doe" required />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
            <input type="email" name="email" onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none" placeholder="john@example.com" required />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Telepon</label>
            <input type="text" name="phone" onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none" placeholder="0812..." required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Alamat</label>
            <input type="text" name="address" onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none" placeholder="Alamat lengkap..." />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
            <input type="password" name="password" onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none" placeholder="••••••••" required />
          </div>

          <div className="md:col-span-2">
            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200 mb-2">{error}</div>}
            <button type="submit" disabled={loading} className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold transition duration-300 shadow-lg">
              {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Sudah punya akun? <Link to="/login" className="text-rose-600 font-bold hover:underline">Login di sini</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;