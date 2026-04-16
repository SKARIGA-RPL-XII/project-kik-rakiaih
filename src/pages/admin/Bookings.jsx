import React, { useState, useEffect } from 'react';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch('http://localhost:5014/api/Bookings');
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error("Gagal mengambil data booking:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Approve atau Reject booking
  const updateStatus = async (bookingId, status) => {
    try {
      const res = await fetch(`http://localhost:5014/api/Bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }) // 1 = Approved, 2 = Rejected
      });

      if (res.ok) {
        alert(`Booking berhasil di-${status === 1 ? 'approve' : 'reject'}!`);
        fetchBookings(); // ✅ Refresh list
      }
    } catch (err) {
      alert("Gagal update status booking.");
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      0: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
      1: { label: 'Approved', color: 'bg-green-100 text-green-700' },
      2: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
      3: { label: 'Completed', color: 'bg-blue-100 text-blue-700' },
    };
    const s = map[status] || { label: 'Unknown', color: 'bg-gray-100 text-gray-700' };
    return <span className={`px-2 py-1 rounded-full text-xs font-bold ${s.color}`}>{s.label}</span>;
  };

  if (loading) return <div className="p-6">Memuat data booking...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Manajemen Booking</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-left text-sm font-medium text-gray-600">User</th>
              <th className="p-4 text-left text-sm font-medium text-gray-600">Lapangan</th>
              <th className="p-4 text-left text-sm font-medium text-gray-600">Tanggal</th>
              <th className="p-4 text-left text-sm font-medium text-gray-600">Waktu</th>
              <th className="p-4 text-left text-sm font-medium text-gray-600">Total</th>
              <th className="p-4 text-left text-sm font-medium text-gray-600">Status</th>
              <th className="p-4 text-left text-sm font-medium text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bookings.map(booking => (
              <tr key={booking.bookingId} className="hover:bg-gray-50">
                <td className="p-4">
                  <p className="font-medium">{booking.user?.fullName}</p>
                  <p className="text-sm text-gray-500">{booking.user?.email}</p>
                </td>
                <td className="p-4">{booking.field?.fieldName}</td>
                <td className="p-4">{new Date(booking.bookingDate).toLocaleDateString('id-ID')}</td>
                <td className="p-4">{booking.startTime?.slice(0,5)} - {booking.endTime?.slice(0,5)}</td>
                <td className="p-4 text-pink-600 font-bold">Rp {booking.finalPrice?.toLocaleString()}</td>
                <td className="p-4">{getStatusBadge(booking.status)}</td>
                <td className="p-4">
                  {/* ✅ Hanya tampil tombol aksi kalau status masih Pending */}
                  {booking.status === 0 && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(booking.bookingId, 1)}
                        className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(booking.bookingId, 2)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {bookings.length === 0 && (
          <div className="p-12 text-center text-gray-400">Belum ada booking masuk.</div>
        )}
      </div>
    </div>
  );
};

export default AdminBookings;