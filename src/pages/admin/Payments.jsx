import React, { useState, useEffect } from 'react';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    const res = await fetch('http://localhost:5014/api/Payments');
    setPayments(await res.json());
  };

  const confirmPayment = async (id) => {
    await fetch(`http://localhost:5014/api/Payments/${id}/confirm`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmedBy: 1 }),
    });
    fetchPayments();
  };

  const statusColorClass = (s) => {
    return {
      Pending: 'bg-amber-100 text-amber-600',
      Confirmed: 'bg-green-100 text-green-600',
      Failed: 'bg-red-100 text-red-600'
    }[s] || 'bg-gray-100 text-gray-600';
  };

  const filtered = filter === 'All' ? payments : payments.filter(p => p.status === filter);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Kelola Payment</h2>
        
        <div className="flex bg-white p-1 rounded-lg shadow-sm border border-gray-200">
          {['All', 'Pending', 'Confirmed', 'Failed'].map(s => (
            <button 
              key={s} 
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                filter === s ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`} 
              onClick={() => setFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">No</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Customer</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Lapangan</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Metode</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Jumlah</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Tanggal</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-center">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((p, i) => (
                <tr key={p.paymentId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-700">{i + 1}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.booking?.customerName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.booking?.fieldName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.paymentMethod}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">Rp {Number(p.amount).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(p.paymentDate).toLocaleDateString('id-ID')}</td>
                  <td className="px-6 py-4 text-sm text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${statusColorClass(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    <div className="flex justify-center items-center space-x-2">
                      {p.status === 'Pending' && (
                        <>
                          <button 
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs transition" 
                            onClick={() => confirmPayment(p.paymentId)}
                          >
                            Konfirmasi
                          </button>
                          <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition">
                            Tolak
                          </button>
                        </>
                      )}
                      {p.paymentProofUrl && (
                        <a 
                          href={p.paymentProofUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="bg-blue-100 text-blue-600 hover:bg-blue-200 px-3 py-1 rounded text-xs transition font-medium"
                        >
                          Bukti
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-gray-500">Tidak ada data pembayaran ditemukan.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payments;