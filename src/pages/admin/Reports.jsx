import React, { useState, useEffect } from 'react';

const Reports = () => {
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [bRes, pRes] = await Promise.all([
      fetch('http://localhost:5014/api/Bookings'),
      fetch('http://localhost:5014/api/Payments'),
    ]);
    setBookings(await bRes.json());
    setPayments(await pRes.json());
  };

  const confirmedPayments = payments.filter(p => p.status === 'Confirmed');
  const totalRevenue = confirmedPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalBookings = bookings.length;
  const approvedBookings = bookings.filter(b => b.status === 'Approved' || b.status === 'Completed').length;
  const cancelledBookings = bookings.filter(b => b.status === 'Cancelled' || b.status === 'Rejected').length;

  const fieldCount = {};
  bookings.forEach(b => {
    const name = `${b.field?.fieldName || 'N/A'} (${b.field?.typeName || 'N/A'})`;
    fieldCount[name] = (fieldCount[name] || 0) + 1;
  });

  const sortedFields = Object.entries(fieldCount).sort((a, b) => b[1] - a[1]);
  const maxCount = sortedFields[0]?.[1] || 1;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Laporan</h2>
        <div className="flex bg-white p-1 rounded-lg shadow-sm border border-gray-200">
          {['week', 'month', 'year'].map(p => (
            <button 
              key={p} 
              className={`px-4 py-1 rounded-md text-sm font-medium capitalize transition-all ${
                period === p ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'
              }`} 
              onClick={() => setPeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Revenue', value: `Rp ${Number(totalRevenue).toLocaleString()}`, icon: '💰', color: 'border-green-500' },
          { label: 'Total Booking', value: totalBookings, icon: '📅', color: 'border-blue-500' },
          { label: 'Booking Berhasil', value: approvedBookings, icon: '✅', color: 'border-rose-500' },
          { label: 'Dibatalkan', value: cancelledBookings, icon: '❌', color: 'border-amber-500' },
        ].map((stat, idx) => (
          <div key={idx} className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${stat.color} flex items-center space-x-4`}>
            <span className="text-3xl">{stat.icon}</span>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl font-bold text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Field Popularity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Popularitas Lapangan</h3>
          <div className="space-y-4">
            {sortedFields.map(([name, count]) => (
              <div key={name} className="space-y-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{name}</span>
                  <span className="font-bold text-blue-600">{count}x</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {sortedFields.length === 0 && <p className="text-center py-4 text-gray-500">Belum ada data</p>}
          </div>
        </div>

        {/* Recent Payment History Table */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Riwayat Pembayaran Terakhir</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100">
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Lapangan</th>
                  <th className="pb-3 font-semibold text-right">Jumlah</th>
                  <th className="pb-3 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {confirmedPayments.slice(0, 5).map((p) => (
                  <tr key={p.paymentId}>
                    <td className="py-3 font-medium text-gray-800">{p.booking?.customerName}</td>
                    <td className="py-3 text-gray-600">{p.booking?.fieldName}</td>
                    <td className="py-3 text-right font-semibold text-green-600">Rp {p.amount.toLocaleString()}</td>
                    <td className="py-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-50 text-green-600 border border-green-100">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;