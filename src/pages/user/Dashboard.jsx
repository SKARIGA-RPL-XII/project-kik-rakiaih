import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { authService } from "../../utils/auth";
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const Dashboard = () => {
  const [stats, setStats] = useState({ totalBookings: 0, upcomingBookings: 0, completedBookings: 0 });
  const [fields, setFields] = useState([]);
  const [activeBooking, setActiveBooking] = useState(null); // ✅ Simpan booking yang lagi jalan
  const [timeLeft, setTimeLeft] = useState(""); // ✅ State buat timer
  const [loading, setLoading] = useState(true);

  const user = authService.getUser();

  useEffect(() => {
    fetchDashboard();
    
  }, []);

  // ✅ Timer Logic: Berjalan setiap detik
  useEffect(() => {
    if (!activeBooking) return;

    const timer = setInterval(() => {
      const now = new Date();
      
      // Buat objek waktu selesai (hari ini + jam endTime)
      const [hours, minutes] = activeBooking.endTime.split(":");
      const target = new Date();
      target.setHours(parseInt(hours), parseInt(minutes), 0);

      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft("Waktu Habis!");
        clearInterval(timer);
        // Refresh dashboard otomatis kalau waktu habis biar lapangan muncul lagi
        fetchDashboard(); 
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${h}j ${m}m ${s}d`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeBooking]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const userId = user?.userId;
      const now = new Date();
      const dateStr = formatDate(now);
      const startTime = now.getHours().toString().padStart(2, "0") + ":00";
      const endTime = (now.getHours() + 1).toString().padStart(2, "0") + ":00";

      const [bRes, aRes] = await Promise.all([
        fetch(`http://localhost:5014/api/Bookings/user/${userId}`),
        fetch(`http://localhost:5014/api/Fields/available?date=${dateStr}&startTime=${startTime}&endTime=${endTime}`),
      ]);

      const bookings = await bRes.json();
      const availableFields = await aRes.json();

  

      // ✅ Cari booking yang statusnya Approved & sedang berjalan saat ini
      const currentBooking = bookings.find(b => {
  const bStatus = b.status ?? b.Status;
  const bStart = b.startTime ?? b.StartTime;
  const bEnd = b.endTime ?? b.EndTime;
  const bDate = b.bookingDate ?? b.BookingDate;

  if (!bStart || !bEnd) return false;

  const [hStart] = bStart.split(":");
  const [hEnd] = bEnd.split(":");
  const now = new Date();
  const currentHour = now.getHours();
  
  // ✅ PERBAIKAN: Bandingkan tanggal dengan mengabaikan jam (YYYY-MM-DD)
  const bookingDateOnly = new Date(bDate).toISOString().split('T')[0];
  const todayDateOnly = now.toLocaleDateString('en-CA'); // Hasilnya format YYYY-MM-DD sesuai lokal

  const isToday = formatDate(bDate) === formatDate(new Date()); 
  const isApproved = bStatus === 1;
  const isTimeMatch = currentHour >= parseInt(hStart) && currentHour < parseInt(hEnd);

  // Debug tambahan untuk memastikan mana yang False
  console.log(`Cek Lapangan ${b.field?.fieldName}: isToday=${isToday}, isApproved=${isApproved}, isTimeMatch=${isTimeMatch}`);

  return isToday && isApproved && isTimeMatch;
});

      setActiveBooking(currentBooking);
      setStats({
        totalBookings: bookings.length || 0,
        upcomingBookings: bookings.filter((b) => b.status === 1).length,
        completedBookings: bookings.filter((b) => b.status === 3).length,
      });
      setFields(Array.isArray(availableFields) ? availableFields : []);
    } catch (err) {
      console.error("Error fetching dashboard:", err);
    } finally {
      setLoading(false);
    }

    
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* 🟢 Widget Booking Aktif (Hanya muncul jika ada booking jalan) */}
      {activeBooking && (
        <div className="mb-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl animate-pulse">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-green-100 text-sm font-bold uppercase tracking-wider">Sedang Berlangsung 🏟️</p>
              <h3 className="text-2xl font-black mt-1">{activeBooking.field?.fieldName}</h3>
              <p className="text-green-50">{activeBooking.startTime} - {activeBooking.endTime}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-green-100 uppercase">Sisa Waktu</p>
              <p className="text-3xl font-mono font-black">{timeLeft}</p>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-700 rounded-2xl shadow-lg p-8 mb-8 flex justify-between items-center flex-wrap gap-4">
        <div className="text-white">
          <h2 className="text-3xl font-bold mb-2">Selamat Datang, {user?.fullName || "Olahragawan"}! 👋</h2>
          <p className="text-purple-100 text-lg">Siap untuk bermain olahraga hari ini?</p>
        </div>
        <Link to="/user/booking" className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors shadow-md">
          Book Lapangan
        </Link>
      </div>

      {/* Stats Cards - Sama seperti kode kamu */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-pink-500">
           <div className="flex items-center gap-4">
             <span className="text-4xl">📅</span>
             <div>
               <p className="text-3xl font-bold text-gray-800">{stats.totalBookings}</p>
               <p className="text-sm text-gray-500 font-medium">Total Booking</p>
             </div>
           </div>
        </div>
        {/* ... Card lainnya (Upcoming & Selesai) tetap sama ... */}
      </div>

      {/* Lapangan Tersedia - Sama seperti kode kamu */}
      <div className="mt-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Lapangan Tersedia Jam Ini</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {fields.map((f) => (
             /* Konten Card Lapangan kamu tetap sama di sini */
             <div key={f.fieldId} className="bg-white rounded-2xl shadow-sm p-4 border">
                <h4 className="font-bold">{f.fieldName}</h4>
                <p className="text-pink-500 font-black">Rp {f.pricePerHour.toLocaleString()}</p>
                <Link to={`/user/booking?fieldId=${f.fieldId}`} className="block mt-4 text-center bg-purple-600 text-white p-2 rounded-lg">Booking</Link>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;