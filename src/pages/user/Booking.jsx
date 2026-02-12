import React, { useState, useEffect } from "react";
import { authService } from "../../utils/auth"; // ✅ Import authService
import { useNavigate } from "react-router-dom"; // ✅ Import navigate

const Booking = () => {
  const [fields, setFields] = useState([]);
  const [form, setForm] = useState({
    bookingDate: "",
    startTime: "",
    endTime: "",
    notes: "",
  });
  const [available, setAvailable] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Get user dari localStorage
  const user = authService.getUser();

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      const res = await fetch("http://localhost:5014/api/Fields");
      const data = await res.json();
      console.log("✅ Fields loaded:", data);
      setFields(data);
    } catch (err) {
      console.error("❌ Error fetching fields:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`📝 ${name} changed to:`, value);
    setForm({ ...form, [name]: value });
  };

  const checkAvailability = async () => {
    console.log("🔍 Checking availability with form:", form);

    if (!form.bookingDate || !form.startTime || !form.endTime) {
      alert("Pilih tanggal dan waktu terlebih dahulu");
      return;
    }

    // ✅ Validasi: End time harus lebih besar dari start time
    const start = parseInt(form.startTime.split(":")[0]);
    const end = parseInt(form.endTime.split(":")[0]);

    if (end <= start) {
      alert("Waktu selesai harus lebih besar dari waktu mulai!");
      return;
    }

    setLoading(true);
    try {
      const url = `http://localhost:5014/api/Fields/available?date=${form.bookingDate}&startTime=${form.startTime}&endTime=${form.endTime}`;
      console.log("📡 Fetching:", url);

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error("Gagal mengecek ketersediaan");
      }

      const data = await res.json();
      console.log("✅ Available fields:", data);
      setAvailable(data);

      if (data.length === 0) {
        alert("Maaf, tidak ada lapangan tersedia untuk waktu yang dipilih");
      }
    } catch (err) {
      console.error("❌ Error checking availability:", err);
      alert("Gagal mengecek ketersediaan lapangan");
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (fieldId) => {
    console.log("🎫 Booking field:", fieldId);
    const authData = authService.getAuthData(); // ✅ Gunakan helper untuk ambil token & user
    const token = authData?.token;
    // ✅ Validasi user login
    if (!user) {
      alert("Silakan login terlebih dahulu!");
      navigate("/login");
      return;
    }

    // ✅ Validasi form
    if (!form.bookingDate || !form.startTime || !form.endTime) {
      alert("Data booking tidak lengkap!");
      return;
    }

    setLoading(true);

    // ✅ Calculate duration and price
    const start = parseInt(form.startTime.split(":")[0]);
    const end = parseInt(form.endTime.split(":")[0]);
    const durationHours = end - start;

    // ✅ Find selected field to get price
    const selectedField = available.find(
      (f) => (f.FieldId || f.fieldId) === fieldId,
    );

    if (!selectedField) {
      alert("Lapangan tidak ditemukan!");
      setLoading(false);
      return;
    }

    const pricePerHour =
      selectedField.PricePerHour || selectedField.pricePerHour || 0;
    const totalPrice = durationHours * pricePerHour;

    const body = {
      userId: user.userId, // ✅ Dari user yang login
      fieldId: fieldId,
      bookingDate: form.bookingDate + "T00:00:00", // ✅ Format ISO
      startTime: form.startTime + ":00", // ✅ Format HH:mm:ss
      endTime: form.endTime + ":00",
      durationHours: durationHours,
      totalPrice: totalPrice,
      discountAmount: 0,
      finalPrice: totalPrice,
      status: 0, // Pending
      notes: form.notes || "",
    };

    console.log("📤 Sending booking:", body);

    try {
      const res = await fetch("http://localhost:5014/api/Bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Kirim token agar tidak dianggap "unauthorized"
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Booking failed:", errorText);
        alert("Gagal booking: " + errorText);
        return;
      }

      const data = await res.json();
      console.log("✅ Booking success:", data);

      alert(`Booking berhasil! 
      Lapangan: ${selectedField.FieldName || selectedField.fieldName}
      Durasi: ${durationHours} jam
      Total: Rp ${totalPrice.toLocaleString("id-ID")}

      Silakan lakukan pembayaran di halaman My Bookings`);

      // ✅ Reset form
      setForm({ bookingDate: "", startTime: "", endTime: "", notes: "" });
      setAvailable([]);

      // ✅ Redirect ke my bookings
      setTimeout(() => {
        navigate("/user/my-bookings");
      }, 1500);
    } catch (err) {
      console.error("❌ Network error:", err);
      alert("Gagal melakukan booking. Periksa koneksi Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Booking Lapangan
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Form */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6 h-fit sticky top-24">
          <h3 className="text-lg font-semibold text-gray-800 mb-5">
            Pilih Tanggal & Waktu
          </h3>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tanggal
            </label>
            <input
              type="date"
              name="bookingDate"
              value={form.bookingDate}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]} // ✅ Tidak bisa pilih tanggal lalu
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Waktu Mulai
              </label>
              <input
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Waktu Selesai
              </label>
              <input
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Catatan (Opsional)
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Tambahkan catatan..."
              rows="3"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all resize-none"
            ></textarea>
          </div>

          <button
            onClick={checkAvailability}
            disabled={
              loading || !form.bookingDate || !form.startTime || !form.endTime
            }
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Mengecek..." : "Cek Ketersediaan"}
          </button>
        </div>

        {/* Available Fields */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-5">
              Lapangan Tersedia
              {available.length > 0 && (
                <span className="ml-2 text-sm text-gray-500">
                  ({available.length} lapangan)
                </span>
              )}
            </h3>

            {available.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🏟️</div>
                <p className="text-gray-400 text-sm">
                  Pilih tanggal dan waktu untuk melihat lapangan yang tersedia
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {available.map((f) => {
                  // ✅ Handle both PascalCase and camelCase
                  const fieldId = f.FieldId || f.fieldId;
                  const fieldName = f.FieldName || f.fieldName;
                  const typeName =
                    f.FieldType?.TypeName || f.fieldType?.typeName || "Field";
                  const pricePerHour = f.PricePerHour || f.pricePerHour || 0;
                  const description =
                    f.Description ||
                    f.description ||
                    "Lapangan berkualitas dengan fasilitas lengkap";

                  return (
                    <div
                      key={fieldId}
                      className="bg-gray-50 rounded-xl p-5 border-l-4 border-pink-500 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-lg font-bold text-gray-800">
                            {fieldName}
                          </h4>
                          <span className="inline-block px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-xs font-semibold mt-1">
                            {typeName}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-600">
                            Rp {pricePerHour.toLocaleString("id-ID")}
                          </p>
                          <p className="text-xs text-gray-500">per jam</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        {description}
                      </p>

                      {/* ✅ Info durasi dan total harga */}
                      {form.startTime && form.endTime && (
                        <div className="bg-white rounded-lg p-3 mb-4 border border-gray-200">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Durasi:</span>
                            <span className="font-bold">
                              {parseInt(form.endTime.split(":")[0]) -
                                parseInt(form.startTime.split(":")[0])}{" "}
                              jam
                            </span>
                          </div>
                          <div className="flex justify-between text-sm mt-1">
                            <span className="text-gray-600">Total Harga:</span>
                            <span className="font-bold text-pink-600">
                              Rp{" "}
                              {(
                                (parseInt(form.endTime.split(":")[0]) -
                                  parseInt(form.startTime.split(":")[0])) *
                                pricePerHour
                              ).toLocaleString("id-ID")}
                            </span>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => handleBook(fieldId)}
                        disabled={loading}
                        className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Booking..." : "Book Sekarang"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
