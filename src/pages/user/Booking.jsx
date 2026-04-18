import React, { useState, useEffect } from "react";
import { authService } from "../../utils/auth";
import { useNavigate } from "react-router-dom";

const getLocalToday = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Booking = () => {
  const [fields, setFields] = useState([]); // Semua lapangan
  const [availableIds, setAvailableIds] = useState([]); // ID lapangan yang tersedia hasil filter
  const [form, setForm] = useState({
    bookingDate: getLocalToday(), // Default tanggal hari ini
    startTime: "",
    endTime: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [hasChecked, setHasChecked] = useState(false); // Status apakah sudah filter atau belum
  const navigate = useNavigate();

  const user = authService.getUser();

  useEffect(() => {
    fetchAvailableFields();
  }, []);

  const fetchAvailableFields = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const dateStr = getLocalToday();
      
      // Ambil jam sekarang dan jam berikutnya untuk filter awal
      const currentHour = now.getHours();
      const startTime = currentHour.toString().padStart(2, "0") + ":00";
      const endTime = (currentHour + 1).toString().padStart(2, "0") + ":00";

      // Panggil API Available (Logika yang sama dengan Dashboard)
      const url = `http://localhost:5014/api/Fields/available?date=${dateStr}&startTime=${startTime}&endTime=${endTime}`;
      const res = await fetch(url);
      const data = await res.json();
      
      setFields(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Gagal mengambil lapangan tersedia:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFields = async () => {
    try {
      const res = await fetch("http://localhost:5014/api/Fields");
      const data = await res.json();
      setFields(data);
    } catch (err) {
      console.error("❌ Error fetching fields:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setHasChecked(false); // Reset status filter jika waktu diubah
  };

  const checkAvailability = async () => {
    if (!form.bookingDate || !form.startTime || !form.endTime) {
      alert("Pilih tanggal dan waktu terlebih dahulu");
      return;
    }

    const start = parseInt(form.startTime.split(":")[0]);
    const end = parseInt(form.endTime.split(":")[0]);

    if (end <= start) {
      alert("Waktu selesai harus lebih besar dari waktu mulai!");
      return;
    }

    setLoading(true);
    try {
      const url = `http://localhost:5014/api/Fields/available?date=${form.bookingDate}&startTime=${form.startTime}&endTime=${form.endTime}`;
      const res = await fetch(url);
      const data = await res.json();
      
      // Simpan hanya ID lapangan yang tersedia
      const ids = data.map(f => f.fieldId || f.FieldId);
      setAvailableIds(ids);
      setHasChecked(true);
    } catch (err) {
      alert("Gagal mengecek ketersediaan");
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (field) => {
  const authData = JSON.parse(localStorage.getItem('auth_data'));
  const token = authData?.token;

  // 1. Validasi Awal
  if (!user) {
    alert("Silakan login terlebih dahulu!");
    navigate("/login");
    return;
  }

  if (!form.startTime || !form.endTime) {
    alert("Tentukan jam mulai dan selesai terlebih dahulu!");
    return;
  }

  const start = parseInt(form.startTime.split(":")[0]);
  const end = parseInt(form.endTime.split(":")[0]);
  if (end <= start) {
    alert("Waktu selesai harus lebih besar dari waktu mulai!");
    return;
  }

  setLoading(true);

  try {
    // ✅ 2. CEK KETERSEDIAAN OTOMATIS
    const checkUrl = `http://localhost:5014/api/Fields/available?date=${form.bookingDate}&startTime=${form.startTime}&endTime=${form.endTime}`;
    const checkRes = await fetch(checkUrl);
    const availableFields = await checkRes.json();

    // Apakah lapangan ini masih ada di daftar tersedia?
    const isAvailable = availableFields.some(af => (af.fieldId || af.FieldId) === field.fieldId);

    if (!isAvailable) {
      alert("Maaf, lapangan ini sudah penuh di jam tersebut.");
      setLoading(false); // Jangan lupa matikan loading
      return;
    }

    // ✅ 3. JALANKAN PROSES BOOKING (Jika tersedia)
    const durationHours = end - start;
    const totalPrice = durationHours * field.pricePerHour;

    const body = {
      userId: user.userId,
      fieldId: field.fieldId,
      bookingDate: form.bookingDate,
      startTime: form.startTime + ":00",
      endTime: form.endTime + ":00",
      durationHours: durationHours,
      totalPrice: totalPrice,
      discountAmount: 0,
      finalPrice: totalPrice,
      status: 0,
      notes: form.notes || "",
    };

    const res = await fetch("http://localhost:5014/api/Bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      alert("Booking Berhasil! Alihkan ke pembayaran...");
      navigate("/user/my-bookings");
    } else {
      const errorText = await res.text();
      alert("Gagal: " + errorText);
    }

  } catch (err) {
    // ✅ Catch ini akan menangkap error dari cek ketersediaan MAUPUN proses booking
    console.error("Error:", err);
    alert("Terjadi kesalahan jaringan atau server.");
  } finally {
    // ✅ Finally ini akan memastikan loading mati apa pun yang terjadi
    setLoading(false);
  }

  
};

  // Logika Filter: Tampilkan semua jika belum cek, tampilkan yang tersedia jika sudah cek
  const displayedFields = hasChecked 
    ? fields.filter(f => availableIds.includes(f.fieldId)) 
    : fields;

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Pesan Lapangan</h2>
        <p className="text-gray-500">Cari waktu terbaik untuk tim kamu bermain.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filter */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-100 p-6 border border-gray-100 sticky top-24">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 00-2 2z"/></svg>
              Atur Jadwal
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-1">Tanggal</label>
                <input type="date" name="bookingDate" value={form.bookingDate} onChange={handleChange} min={getLocalToday()} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-1">Mulai</label>
                  <input type="time" name="startTime" value={form.startTime} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-1">Selesai</label>
                  <input type="time" name="endTime" value={form.endTime} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-1">Catatan</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Contoh: Butuh wasit..." rows="2" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm resize-none"></textarea>
              </div>

              <button 
                onClick={checkAvailability}
                disabled={loading || !form.startTime || !form.endTime}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {loading ? "Mengecek..." : "Atur Waktu"}
              </button>
            </div>
          </div>
        </div>

        {/* List Lapangan */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayedFields.map((f) => (
              <div key={f.fieldId} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
                {/* Image Section */}
                <div className="relative h-48 bg-gray-200">
                  <img 
                    src={f.imageUrl || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1000&auto=format&fit=crop"} 
                    alt={f.fieldName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur shadow-sm rounded-full text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                      {f.fieldType?.typeName || 'General'}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xl font-bold text-gray-800">{f.fieldName}</h4>
                    <div className="text-right">
                      <p className="text-lg font-black text-indigo-600">Rp {f.pricePerHour.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Per Jam</p>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-6 h-10">
                    {f.description || "Nikmati fasilitas lapangan olahraga terbaik dengan standar internasional."}
                  </p>

                  <button 
                    onClick={() => handleBook(f)}
                    disabled={!hasChecked || loading}
                    className={`w-full py-3 rounded-xl font-bold transition-all ${
                      hasChecked 
                      ? 'bg-gray-900 text-white hover:bg-indigo-600 shadow-lg' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {!hasChecked ? "Tentukan Waktu Dahulu" : "Pesan Sekarang"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {displayedFields.length === 0 && (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-medium">Maaf, tidak ada lapangan tersedia di jam tersebut.</p>
              <button onClick={() => setHasChecked(false)} className="mt-2 text-indigo-600 font-bold hover:underline">Lihat semua lapangan</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Booking;