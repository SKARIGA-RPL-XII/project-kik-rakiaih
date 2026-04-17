import React, { useState, useEffect } from 'react';
import { authService } from '../../utils/auth';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  // Ambil data admin yang login dari localStorage
  const admin = authService.getUser();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5014/api/Payments');
      const data = await res.json();
      setPayments(data);
    } catch (err) {
      console.error("Gagal mengambil data pembayaran:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (paymentId) => {
    if (!window.confirm("Apakah Anda yakin ingin menyetujui pembayaran ini?")) return;

    try {
      const res = await fetch(`http://localhost:5014/api/Payments/${paymentId}/confirm`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          confirmedBy: admin?.userId || 1 
        }),
      });

      if (res.ok) {
        alert("Pembayaran berhasil dikonfirmasi!");
        fetchPayments(); // Refresh tabel
      } else {
        alert("Gagal mengonfirmasi pembayaran.");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Terjadi kesalahan koneksi.");
    }
  };

  const getStatusLabel = (s) => {
    const map = { 0: 'Pending', 1: 'Confirmed', 2: 'Failed' };
    return typeof s === 'number' ? map[s] : s;
  };

  const statusColor = (s) => {
    const status = getStatusLabel(s);
    if (status === 'Confirmed') return 'bg-green-100 text-green-700 border-green-200';
    if (status === 'Failed') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-amber-100 text-amber-700 border-amber-200';
  };

  const filteredPayments = filter === 'All' 
    ? payments 
    : payments.filter(p => getStatusLabel(p.status ?? p.Status) === filter);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">Kelola Pembayaran</h2>
            <p className="text-gray-500 mt-1">Verifikasi bukti transfer dari customer di sini.</p>
          </div>
          
          <div className="flex bg-white shadow-sm border border-gray-200 p-1 rounded-xl">
            {['All', 'Pending', 'Confirmed', 'Failed'].map(s => (
              <button 
                key={s}
                onClick={() => setFilter(s)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                  filter === s ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-indigo-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Customer & Lapangan</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Jumlah</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Metode</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPayments.map((p) => (
                <tr key={p.paymentId || p.PaymentId} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="px-6 py-5">
                    <div className="font-bold text-gray-900">{p.booking?.customerName || 'No Name'}</div>
                    <div className="text-sm text-indigo-600 font-medium italic">{p.booking?.fieldName || 'Unnamed Field'}</div>
                  </td>
                  <td className="px-6 py-5 font-mono font-bold text-gray-800">
                    Rp {Number(p.amount).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-600">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs font-semibold">{p.paymentMethod === 1 ? 'Transfer' : 'E-Wallet'}</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${statusColor(p.status ?? p.Status)}`}>
                      {getStatusLabel(p.status ?? p.Status)}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center items-center gap-3">
                      {/* Tombol Aksi hanya muncul jika status masih Pending (0) */}
                      {getStatusLabel(p.status ?? p.Status) === 'Pending' && (
                        <button 
                          onClick={() => handleConfirm(p.paymentId || p.PaymentId)}
                          className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-lg shadow-green-200 transition-transform hover:scale-110"
                          title="Setujui Pembayaran"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                        </button>
                      )}
                      
                      {/* Tombol Lihat Bukti */}
                      {p.paymentProofUrl && (
                        <a 
                          href={p.paymentProofUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
                          title="Lihat Bukti Transfer"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPayments.length === 0 && (
            <div className="p-20 text-center text-gray-400 italic">
              Tidak ada data pembayaran ditemukan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payments;