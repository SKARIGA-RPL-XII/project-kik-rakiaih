import React, { useState, useEffect } from 'react';

const Membership = () => {
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMembership(); }, []);

  const fetchMembership = async () => {
    const userId = 1; // From auth
    const res = await fetch(`http://localhost:5014/api/Users/${userId}`);
    const user = await res.json();
    setMembership(user.membership);
    setLoading(false);
  };

  const packages = [
    { type: 'Regular', discount: 10, price: 100000, features: ['Diskon 10%', 'Prioritas booking', 'Berlaku 1 bulan'], color: 'from-blue-500 to-blue-700' },
    { type: 'Premium', discount: 15, price: 250140, features: ['Diskon 15%', 'Prioritas booking', 'Berlaku 3 bulan', 'Akses lapangan VIP'], color: 'from-purple-500 to-purple-700' },
    { type: 'VIP', discount: 20, price: 501400, features: ['Diskon 20%', 'Prioritas booking', 'Berlaku 6 bulan', 'Akses semua lapangan', 'Fasilitas premium'], color: 'from-amber-400 to-amber-600' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  const typeLabel = (t) => ['Regular', 'Premium', 'VIP'][t] || t;

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen bg-gray-50">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-8 border-b pb-4">Membership</h2>

      {/* Bagian Status Membership Saat Ini */}
      <div className="mb-12">
        {membership ? (
          <div className="relative overflow-hidden bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 shadow-2xl text-white max-w-2xl mx-auto transform transition hover:scale-[1.02]">
            {/* Dekorasi Kartu */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-5 rounded-full"></div>
            
            <div className="flex justify-between items-start relative z-10">
              <div>
                <span className="bg-blue-500 text-xs font-bold uppercase px-3 py-1 rounded-full tracking-wider">
                  Member Aktif
                </span>
                <h3 className="text-4xl font-black mt-4 tracking-tight">
                  {typeLabel(membership.membershipType)}
                </h3>
                <p className="text-blue-300 text-lg font-medium mt-1">
                  {membership.discountPercentage}% Diskon di setiap booking
                </p>
              </div>
              <div className="text-right">
                <span className={`px-4 py-1.5 rounded-lg text-sm font-bold border-2 ${
                  membership.status === 'Active' ? 'border-green-400 text-green-400' : 'border-red-400 text-red-400'
                }`}>
                  {membership.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="mt-12 flex justify-between items-end relative z-10">
              <div className="space-y-1">
                <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold">Masa Berlaku</p>
                <p className="text-sm font-mono">
                  {new Date(membership.startDate).toLocaleDateString('id-ID')} — {new Date(membership.endDate).toLocaleDateString('id-ID')}
                </p>
              </div>
              <div className="text-gray-500 font-bold text-xl italic opacity-30">VIRTUAL CARD</div>
            </div>
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center max-w-2xl mx-auto shadow-sm">
            <div className="text-5xl mb-4">🎁</div>
            <h3 className="text-xl font-bold text-gray-700">Belum Ada Membership</h3>
            <p className="text-gray-500 mt-2">Dapatkan berbagai keuntungan dan diskon khusus dengan bergabung menjadi member kami.</p>
          </div>
        )}
      </div>

      {/* Daftar Paket */}
      <div className="mt-16">
        <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">Pilih Paket Membership</h3>
        <p className="text-gray-500 text-center mb-10">Upgrade level member Anda untuk keuntungan lebih maksimal</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <div 
              key={pkg.type} 
              className="bg-white rounded-3xl shadow-lg border border-gray-100 flex flex-col overflow-hidden hover:shadow-2xl transition duration-300 transform hover:-translate-y-2"
            >
              <div className={`bg-gradient-to-br ${pkg.color} p-6 text-white text-center`}>
                <h4 className="text-2xl font-bold uppercase tracking-wide">{pkg.type}</h4>
                <div className="mt-4 flex items-baseline justify-center">
                  <span className="text-sm font-medium mr-1 uppercase">Rp</span>
                  <span className="text-4xl font-black">{Number(pkg.price).toLocaleString()}</span>
                </div>
              </div>

              <div className="p-8 flex-grow">
                <div className="bg-orange-50 text-orange-600 font-bold py-2 px-4 rounded-xl text-center mb-6">
                  {pkg.discount}% Hemat biaya booking
                </div>
                
                <ul className="space-y-4 mb-8">
                  {pkg.features.map((f, i) => (
                    <li key={i} className="flex items-start text-gray-600 text-sm">
                      <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <button className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-md">
                  Pilih Paket Sekarang
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Membership;