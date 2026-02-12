import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import bgLapangan from "../../assets/lapangan.png";
import myLogo from '../../assets/logo.png';
import { authService } from '../../utils/auth';

const Login = ({ onLogin }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5014/api/Auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        setError("Email atau password salah");
        return;
      }

      const data = await res.json();
      
      // ✅ Simpan ke localStorage
      const userData = { 
        userId: data.userId, 
        role: data.role,
        username: data.username,
        email: data.email,
        fullName: data.fullName,
        token: data.token
      };
      
      authService.login(userData);
      onLogin(userData);
      
      // Redirect berdasarkan role
      navigate(data.role === 1 ? '/admin' : '/user');
      
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat px-4 relative"
      style={{
        backgroundImage: `url(${bgLapangan})`,
        backgroundPosition: "center 70%",
      }}
    >
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      <div className="relative z-10 bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <img 
              src={myLogo} 
              alt="Logo SportVenue" 
              className="h-20 w-auto object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mt-2">SportVenue</h1>
          <p className="text-slate-500 text-sm">Silahkan masuk ke akun Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none transition"
              placeholder="Email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none transition"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold transition duration-300 disabled:opacity-50"
          >
            {loading ? "Mohon Tunggu..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Belum punya akun?{" "}
          <Link
            to="/register"
            className="text-rose-600 font-bold hover:underline"
          >
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;