import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { authService } from "../../utils/auth"; // ✅ Import authService

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    completedBookings: 0,
  });
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Get user dari localStorage
  const user = authService.getUser();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const userId = user?.userId;
      if (!userId) {
        console.error("User ID tidak ditemukan");
        setLoading(false);
        return;
      }

      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];
      const startTime = now.getHours().toString().padStart(2, "0") + ":00";
      const endTime = (now.getHours() + 1).toString().padStart(2, "0") + ":00";

      // 1. Tambahkan aRes di sini untuk menampung response ketersediaan
      const [bRes, fRes, aRes] = await Promise.all([
        fetch(`http://localhost:5014/api/Bookings/user/${userId}`),
        fetch("http://localhost:5014/api/Fields"),
        fetch(`http://localhost:5014/api/Fields/available?date=${dateStr}&startTime=${startTime}&endTime=${endTime}`),
      ]);

      // 2. Ubah response menjadi JSON
      const bookings = await bRes.json();
      // const fieldsData = await fRes.json(); // fRes ini data semua lapangan (bisa hapus jika tidak dipakai)
      const availableFields = await aRes.json(); // ✅ Ambil data lapangan yang tersedia

      console.log("Bookings for user", userId, ":", bookings);

      setStats({
        totalBookings: bookings.length || 0,
        upcomingBookings: bookings.filter((b) => b.Status === 1 || b.status === 1).length,
        completedBookings: bookings.filter((b) => b.Status === 3 || b.status === 3).length,
      });

      // ✅ Sekarang availableFields sudah terdefinisi dan bisa digunakan
      setFields(Array.isArray(availableFields) ? availableFields : []);

    } catch (err) {
      console.error("Error fetching dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-700 rounded-2xl shadow-lg p-8 mb-8 flex justify-between items-center flex-wrap gap-4">
        <div className="text-white">
          <h2 className="text-3xl font-bold mb-2">
            Selamat Datang, {user?.fullName || user?.FullName}! 👋
          </h2>
          <p className="text-purple-100 text-lg">
            Siap untuk bermain olahraga hari ini?
          </p>
        </div>
        <Link
          to="/user/booking"
          className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors shadow-md"
        >
          Book Lapangan
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-pink-500 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <span className="text-4xl">📅</span>
            <div>
              <p className="text-3xl font-bold text-gray-800">
                {stats.totalBookings}
              </p>
              <p className="text-sm text-gray-500 font-medium">Total Booking</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <span className="text-4xl">⏳</span>
            <div>
              <p className="text-3xl font-bold text-gray-800">
                {stats.upcomingBookings}
              </p>
              <p className="text-sm text-gray-500 font-medium">Upcoming</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <span className="text-4xl">✅</span>
            <div>
              <p className="text-3xl font-bold text-gray-800">
                {stats.completedBookings}
              </p>
              <p className="text-sm text-gray-500 font-medium">Selesai</p>
            </div>
          </div>
        </div>
      </div>

      {/* Available Fields */}
      <div className="mt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">
              Lapangan Tersedia
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Menampilkan semua lapangan kosong untuk jadwal:
              <span className="font-semibold text-purple-600 ml-1">
                {new Date().getHours().toString().padStart(2, "0")}:00 -{" "}
                {(new Date().getHours() + 1).toString().padStart(2, "0")}:00
              </span>
            </p>
          </div>
          <Link
            to="/user/booking"
            className="text-pink-500 font-semibold hover:text-pink-600 transition-colors flex items-center gap-1 bg-pink-50 px-4 py-2 rounded-lg"
          >
            Lihat Semua Jadwal <span>→</span>
          </Link>
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {fields.length > 0 ? (
            fields.map((f) => (
              <div
                key={f.fieldId || f.FieldId}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 group"
              >
                {/* Header Image/Gradient Area */}
                <div className="h-40 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center relative">
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="bg-white/90 backdrop-blur-sm text-green-600 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      Ready Now
                    </span>
                  </div>

                  {/* Type Badge */}
                  <span className="bg-black/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-white border border-white/30">
                    {f.fieldType?.typeName ||
                      f.FieldType?.TypeName ||
                      "General Field"}
                  </span>
                </div>

                {/* Content Area */}
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-purple-600 transition-colors">
                    {f.fieldName || f.FieldName}
                  </h4>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex -space-x-1">
                      {/* Visual hiasan icon kecil */}
                      <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px]">
                        📍
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">Main Arena</span>
                  </div>

                  <div className="border-t border-gray-50 pt-4 mt-2">
                    <p className="text-gray-400 text-xs mb-1">Harga per jam:</p>
                    <p className="text-2xl font-black text-pink-500">
                      Rp{" "}
                      {Number(f.pricePerHour || f.PricePerHour).toLocaleString(
                        "id-ID",
                      )}
                    </p>
                  </div>

                  <Link
                    to={`/user/booking?fieldId=${f.fieldId || f.FieldId}`}
                    className="mt-5 block w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center rounded-xl font-bold hover:shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all active:scale-95"
                  >
                    Booking Sekarang
                  </Link>
                </div>
              </div>
            ))
          ) : (
            /* Empty State */
            <div className="col-span-full py-20 px-4 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 text-5xl">
                🏟️
              </div>
              <h4 className="text-2xl font-bold text-gray-800 mb-2">
                Semua Lapangan Terisi
              </h4>
              <p className="text-gray-500 max-w-sm mx-auto">
                Wah, sepertinya semua lapangan sedang penuh untuk jam ini. Coba
                pilih jadwal di jam atau hari yang lain ya!
              </p>
              <Link
                to="/user/booking"
                className="mt-6 px-8 py-3 bg-white text-purple-600 border-2 border-purple-600 rounded-xl font-bold hover:bg-purple-50 transition-colors"
              >
                Lihat Kalender Jadwal
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
