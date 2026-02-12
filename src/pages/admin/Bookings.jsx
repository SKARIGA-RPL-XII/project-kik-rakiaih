import React, { useState, useEffect } from 'react';
import { authService } from '../../utils/auth';
const Booking = () => {
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    date: '',
    startTime: '',
    endTime: ''
  });

  // 1. Ambil data lapangan saat komponen dimuat
  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      const res = await fetch('http://localhost:5014/api/Fields');
      const data = await res.json();
      setFields(data);
    } catch (err) {
      console.error("Gagal mengambil data lapangan:", err);
    }
  };

  // 2. Fungsi Cek Ketersediaan (Penting: Konversi Date ke ISO/UTC)
  const checkAvailability = async (e) => {
    e.preventDefault();
    if (!form.date || !form.startTime || !form.endTime) return alert("Isi semua data!");

    setLoading(true);
    try {
      // Kita kirim tanggal dalam format YYYY-MM-DD
      const query = `date=${form.date}&startTime=${form.startTime}&endTime=${form.endTime}`;
      const res = await fetch(`http://localhost:5014/api/Fields/available?${query}`);
      
      if (!res.ok) throw new Error("Gagal mengecek ketersediaan");
      
      const availableFields = await res.json();
      setFields(availableFields);
      alert(availableFields.length > 0 ? "Lapangan tersedia ditemukan!" : "Maaf, tidak ada lapangan tersedia.");
    } catch (err) {
      alert("Terjadi kesalahan saat cek jadwal.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Fungsi Hitung Harga
  const calculateTotal = () => {
    if (!selectedField || !form.startTime || !form.endTime) return 0;
    const start = parseInt(form.startTime.split(':')[0]);
    const end = parseInt(form.endTime.split(':')[0]);
    const duration = end - start;
    return duration > 0 ? duration * selectedField.pricePerHour : 0;
  };

  // 4. Fungsi POST Booking (Handle Checkout)
  const handleBook = async () => {
    const user = authService.getUser();
  const authData = authService.getAuthData();
  
  if (!user || !authData?.token) {
    alert("Silakan login terlebih dahulu!");
    navigate('/login');
    return;
  }

    const totalPrice = calculateTotal();
    if (totalPrice <= 0) return alert("Durasi waktu tidak valid!");

    const payload = {
      fieldId: selectedField.fieldId,
      userId: userData.userId,
      // Pastikan Date dikirim dengan Kind=Utc agar PostgreSQL tidak error
      bookingDate: new Date(form.date).toISOString(),
      // TimeSpan di .NET butuh format HH:mm:ss
      startTime: form.startTime + ":00",
      endTime: form.endTime + ":00",
      totalPrice: totalPrice,
      status: 0 // 0 biasanya 'Pending' di Enum backend
    };

    try {
      const res = await fetch('http://localhost:5014/api/Bookings', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.token}` // ✅ Ini kuncinya
      },
      body: JSON.stringify(payload)
    });

      if (res.ok) {
        alert("Booking berhasil dibuat! Silakan cek status di Dashboard.");
        // Reset form atau redirect
        setSelectedField(null);
      } else {
        const err = await res.json();
        alert("Gagal booking: " + (err.message || "Jadwal mungkin sudah bentrok"));
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Booking Lapangan</h2>

      {/* Filter Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-100">
        <form onSubmit={checkAvailability} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
            <input type="date" className="w-full border rounded-lg p-2" 
              onChange={(e) => setForm({...form, date: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jam Mulai</label>
            <input type="time" className="w-full border rounded-lg p-2" 
              onChange={(e) => setForm({...form, startTime: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jam Selesai</label>
            <input type="time" className="w-full border rounded-lg p-2" 
              onChange={(e) => setForm({...form, endTime: e.target.value})} required />
          </div>
          <button type="submit" disabled={loading} className="bg-pink-600 text-white py-2 rounded-lg font-bold hover:bg-pink-700 transition">
            {loading ? "Mengecek..." : "Cek Ketersediaan"}
          </button>
        </form>
      </div>

      {/* List Lapangan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {fields.map(field => (
          <div key={field.fieldId} className={`border rounded-xl p-4 transition-all ${selectedField?.fieldId === field.fieldId ? 'ring-2 ring-pink-500 bg-pink-50' : 'bg-white'}`}>
            <h3 className="text-xl font-bold text-gray-800">{field.fieldName}</h3>
            <p className="text-gray-500 mb-4">{field.typeName}</p>
            <div className="flex justify-between items-center">
              <span className="text-pink-600 font-bold">Rp {field.pricePerHour?.toLocaleString()}/jam</span>
              <button onClick={() => setSelectedField(field)} className="px-4 py-2 border border-pink-500 text-pink-500 rounded-lg hover:bg-pink-500 hover:text-white transition">
                Pilih
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Ringkasan & Checkout */}
      {selectedField && (
        <div className="mt-12 bg-gray-900 text-white p-8 rounded-2xl shadow-xl">
          <h3 className="text-2xl font-bold mb-4">Ringkasan Pesanan</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <p>Lapangan: <span className="font-bold">{selectedField.fieldName}</span></p>
            <p>Tanggal: <span className="font-bold">{form.date}</span></p>
            <p>Waktu: <span className="font-bold">{form.startTime} - {form.endTime}</span></p>
            <p className="text-xl">Total Harga: <span className="text-pink-400 font-bold">Rp {calculateTotal().toLocaleString()}</span></p>
          </div>
          <button onClick={handleBook} className="w-full bg-pink-600 py-3 rounded-xl font-bold text-lg hover:bg-pink-500 transition shadow-lg">
            Konfirmasi Booking Sekarang
          </button>
        </div>
      )}
    </div>
  );
};

export default Booking;