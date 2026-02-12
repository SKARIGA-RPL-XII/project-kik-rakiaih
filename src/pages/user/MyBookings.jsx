import React, { useState, useEffect } from 'react';
import { authService } from '../../utils/auth'; // ✅ Import authService

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('All');
  const [showPayment, setShowPayment] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ paymentMethod: 0, paymentProofUrl: '', notes: '' });
  const [loading, setLoading] = useState(true);
  
  // ✅ Get user dari localStorage
  const user = authService.getUser();

  useEffect(() => { 
    fetchBookings(); 
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // ✅ Gunakan userId dari user yang login
      const userId = user?.userId;
      
      if (!userId) {
        console.error('User ID tidak ditemukan');
        setLoading(false);
        return;
      }

      const res = await fetch(`http://localhost:5014/api/Bookings/user/${userId}`);
      const data = await res.json();
      
      console.log('User bookings:', data); // Debug
      setBookings(data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const openPayment = (booking) => {
    setSelectedBooking(booking);
    setShowPayment(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const body = { 
        bookingId: selectedBooking.BookingId || selectedBooking.bookingId, 
        amount: selectedBooking.FinalPrice || selectedBooking.finalPrice,
        ...paymentForm 
      };

      const res = await fetch('http://localhost:5014/api/Payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        alert('Pembayaran berhasil diupload! Menunggu konfirmasi admin.');
        setShowPayment(false);
        setPaymentForm({ paymentMethod: 0, paymentProofUrl: '', notes: '' });
        fetchBookings();
      } else {
        alert('Gagal upload pembayaran');
      }
    } catch (err) {
      console.error('Error submitting payment:', err);
      alert('Gagal upload pembayaran');
    }
  };

  const getStatusColor = (status) => {
    // ✅ Handle both string and number status
    const statusMap = {
      0: 'Pending',
      1: 'Approved',
      2: 'Rejected',
      3: 'Completed',
      4: 'Cancelled'
    };
    
    const statusText = typeof status === 'number' ? statusMap[status] : status;
    
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-700',
      Approved: 'bg-green-100 text-green-700',
      Rejected: 'bg-red-100 text-red-700',
      Completed: 'bg-blue-100 text-blue-700',
      Cancelled: 'bg-gray-100 text-gray-700'
    };
    return colors[statusText] || 'bg-gray-100 text-gray-700';
  };

  const getStatusText = (status) => {
    const statusMap = {
      0: 'Pending',
      1: 'Approved',
      2: 'Rejected',
      3: 'Completed',
      4: 'Cancelled'
    };
    return typeof status === 'number' ? statusMap[status] : status;
  };

  const getPaymentStatusColor = (status) => {
    const statusMap = {
      0: 'Pending',
      1: 'Confirmed',
      2: 'Failed'
    };
    
    const statusText = typeof status === 'number' ? statusMap[status] : status;
    
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-700',
      Confirmed: 'bg-green-100 text-green-700',
      Failed: 'bg-red-100 text-red-700'
    };
    return colors[statusText] || 'bg-gray-100 text-gray-700';
  };

  const getPaymentStatusText = (status) => {
    const statusMap = {
      0: 'Pending',
      1: 'Confirmed',
      2: 'Failed'
    };
    return typeof status === 'number' ? statusMap[status] : status;
  };

  // ✅ Filter berdasarkan status (handle both string and number)
  const filtered = filter === 'All' 
    ? bookings 
    : bookings.filter(b => {
        const statusText = getStatusText(b.Status ?? b.status);
        return statusText === filter;
      });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Riwayat Booking Saya</h2>
        <div className="flex gap-2 flex-wrap">
          {['All', 'Pending', 'Approved', 'Completed', 'Rejected'].map(s => (
            <button 
              key={s} 
              onClick={() => setFilter(s)} 
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                filter === s 
                  ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-pink-500 hover:text-pink-500'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map(b => (
          <div key={b.BookingId || b.bookingId} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-bold text-gray-800">
                  {b.Field?.FieldName || b.field?.fieldName} - {b.Field?.FieldType?.TypeName || b.field?.typeName || 'Field'}
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(b.BookingDate || b.bookingDate).toLocaleDateString('id-ID')} • {(b.StartTime || b.startTime)?.slice(0,5)} - {(b.EndTime || b.endTime)?.slice(0,5)}
                </p>
              </div>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(b.Status ?? b.status)}`}>
                  {getStatusText(b.Status ?? b.status)}
                </span>
                {(b.Payment || b.payment) && (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor((b.Payment || b.payment).Status ?? (b.Payment || b.payment).status)}`}>
                    Payment: {getPaymentStatusText((b.Payment || b.payment).Status ?? (b.Payment || b.payment).status)}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <span className="text-2xl font-bold text-pink-500">
                Rp {Number(b.FinalPrice || b.finalPrice).toLocaleString('id-ID')}
              </span>
              {/* ✅ Show payment button only if status is Pending (0) and no payment yet */}
              {(b.Status === 0 || b.status === 0 || getStatusText(b.Status ?? b.status) === 'Pending') && !(b.Payment || b.payment) && (
                <button 
                  onClick={() => openPayment(b)} 
                  className="px-5 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Upload Pembayaran
                </button>
              )}
            </div>
          </div>
        ))}
        
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <p className="text-gray-400">Belum ada booking dengan status {filter}</p>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPayment && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Upload Pembayaran</h3>
              <button 
                onClick={() => setShowPayment(false)} 
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handlePaymentSubmit} className="p-6">
              <div className="bg-pink-50 border-l-4 border-pink-500 p-4 rounded mb-5">
                <p className="text-sm text-gray-700 mb-1">
                  <strong>Lapangan:</strong> {selectedBooking.Field?.FieldName || selectedBooking.field?.fieldName}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Total:</strong> Rp {Number(selectedBooking.FinalPrice || selectedBooking.finalPrice).toLocaleString('id-ID')}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Metode Pembayaran</label>
                <select 
                  value={paymentForm.paymentMethod} 
                  onChange={e => setPaymentForm({ ...paymentForm, paymentMethod: parseInt(e.target.value) })} 
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                >
                  <option value={0}>Cash</option>
                  <option value={1}>Transfer Bank</option>
                  <option value={2}>E-Wallet</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bukti Pembayaran (URL)</label>
                <input 
                  type="text" 
                  value={paymentForm.paymentProofUrl} 
                  onChange={e => setPaymentForm({ ...paymentForm, paymentProofUrl: e.target.value })} 
                  placeholder="https://..." 
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all" 
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Catatan</label>
                <textarea 
                  value={paymentForm.notes} 
                  onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })} 
                  placeholder="Catatan tambahan..." 
                  rows="3" 
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button 
                  type="button" 
                  onClick={() => setShowPayment(false)} 
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;