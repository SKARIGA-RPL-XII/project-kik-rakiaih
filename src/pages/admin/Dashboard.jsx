import React, { useState, useEffect } from "react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalMembers: 0,
    totalFields: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData(); // ✅ Ganti dengan fungsi yang benar
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchStats(), fetchRecentBookings()]);
    } catch (err) {
      console.error("Error loading dashboard:", err);
    } finally {
      setLoading(false); // ✅ Pastikan loading di-set false
    }
  };

  const fetchRecentBookings = async () => {
    try {
      const res = await fetch("http://localhost:5014/api/Bookings");

      // ✅ Cek status response
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      console.log("Bookings data:", data); // ✅ Debug: cek data yang diterima

      if (Array.isArray(data)) {
        setRecentBookings(data.slice(0, 5));
      } else {
        console.error("Data bukan array:", data);
      }
    } catch (err) {
      console.error("Gagal mengambil bookings:", err);
    }
  };

  const fetchStats = async () => {
    try {
      const [payRes, memRes, fieldRes, bookRes] = await Promise.all([
        fetch("http://localhost:5014/api/Payments"),
        fetch("http://localhost:5014/api/Memberships"),
        fetch("http://localhost:5014/api/Fields"),
        fetch("http://localhost:5014/api/Bookings"),
      ]);

      const payments = await payRes.json();
      const members = await memRes.json();
      const fields = await fieldRes.json();
      const bookings = await bookRes.json();

      const totalRevenue = Array.isArray(payments)
        ? payments
            .filter((p) => p.status === "Confirmed" || p.status === 1)
            .reduce((sum, p) => sum + (p.amount || 0), 0)
        : 0;

      setStats({
        totalBookings: bookings.length || 0,
        totalRevenue,
        totalMembers: members.length || 0,
        totalFields: fields.length || 0,
      });
    } catch (err) {
      console.error("Gagal mengambil statistik:", err);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-700",
      Approved: "bg-green-100 text-green-700",
      Rejected: "bg-red-100 text-red-700",
      Completed: "bg-blue-100 text-blue-700",
      Cancelled: "bg-gray-100 text-gray-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <span className="text-4xl">💰</span>
            <div>
              <p className="text-3xl font-bold text-gray-800">
                Rp {Number(stats.totalRevenue).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <span className="text-4xl">👥</span>
            <div>
              <p className="text-3xl font-bold text-gray-800">
                {stats.totalMembers}
              </p>
              <p className="text-sm text-gray-500 font-medium">Total Member</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <span className="text-4xl">🏅</span>
            <div>
              <p className="text-3xl font-bold text-gray-800">
                {stats.totalFields}
              </p>
              <p className="text-sm text-gray-500 font-medium">
                Total Lapangan
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          5 Transaksi Terbaru
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                  Lapangan
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                  Tanggal
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentBookings.length > 0 ? (
                recentBookings.map((b) => (
                  <tr
                    key={b.bookingId}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-gray-900">
                        {b.user?.fullName || "Guest"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {b.user?.email || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {b.field?.fieldName || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {b.bookingDate
                        ? new Date(b.bookingDate).toLocaleDateString("id-ID")
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-700">
                      Rp {(b.finalPrice || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(b.status)}`}
                      >
                        {typeof b.status === "number"
                          ? [
                              "Pending",
                              "Approved",
                              "Rejected",
                              "Completed",
                              "Cancelled",
                            ][b.status]
                          : b.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-10 text-center text-gray-400"
                  >
                    {loading
                      ? "Sedang memuat data..."
                      : "Belum ada transaksi terbaru."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
