import React, { useState, useEffect } from 'react';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ userId: '', membershipType: 0, startDate: '', endDate: '', discountPercentage: '', status: 0 });

  useEffect(() => {
    fetchMembers();
    fetchUsers();
  }, []);

  const fetchMembers = async () => { 
    const res = await fetch('http://localhost:5014/api/Memberships'); 
    setMembers(await res.json()); 
  };

  const fetchUsers = async () => { 
    const res = await fetch('http://localhost:5014/api/Users'); 
    setUsers(await res.json()); 
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `http://localhost:5014/api/Memberships/${editId}` : 'http://localhost:5014/api/Memberships';
    await fetch(url, { 
      method, 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(form) 
    });
    fetchMembers();
    closeModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus membership ini?')) {
      await fetch(`http://localhost:5014/api/Memberships/${id}`, { method: 'DELETE' });
      fetchMembers();
    }
  };

  const openModal = (member = null) => {
    if (member) {
      setEditId(member.membershipId);
      setForm({ 
        userId: member.userId, 
        membershipType: member.membershipType, 
        startDate: member.startDate?.slice(0,10), 
        endDate: member.endDate?.slice(0,10), 
        discountPercentage: member.discountPercentage, 
        status: member.status 
      });
    } else {
      setEditId(null);
      setForm({ userId: '', membershipType: 0, startDate: '', endDate: '', discountPercentage: '', status: 0 });
    }
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const typeLabel = (t) => ['Regular', 'Premium', 'VIP'][t] || t;
  const statusLabel = (s) => ['Active', 'Expired'][s] || s;
  const statusColorClass = (s) => s === 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600';

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Kelola Member</h2>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center shadow-md"
          onClick={() => openModal()}
        >
          <span className="mr-2 text-xl font-bold">+</span> Tambah Member
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">No</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Nama</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Email</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Tipe</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Diskon</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Periode</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((m, i) => (
                <tr key={m.membershipId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-700">{i + 1}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{m.user?.fullName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{m.user?.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 font-medium">{typeLabel(m.membershipType)}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{m.discountPercentage}%</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(m.startDate).toLocaleDateString('id-ID')} - {new Date(m.endDate).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${statusColorClass(m.status)}`}>
                      {statusLabel(m.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    <div className="flex justify-center space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded hover:bg-blue-50 transition" 
                        onClick={() => openModal(m)}
                      >
                        Edit
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-800 font-medium px-3 py-1 rounded hover:bg-red-50 transition" 
                        onClick={() => handleDelete(m.membershipId)}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">{editId ? 'Edit' : 'Tambah'} Membership</h3>
              <button className="text-gray-400 hover:text-gray-600 text-xl" onClick={closeModal}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-semibold text-gray-700">User</label>
                <select 
                  name="userId" 
                  value={form.userId} 
                  onChange={handleChange} 
                  required 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">Pilih User</option>
                  {users.filter(u => u.role === 'Customer').map(u => (
                    <option key={u.userId} value={u.userId}>{u.fullName} - {u.email}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Tipe Membership</label>
                  <select 
                    name="membershipType" 
                    value={form.membershipType} 
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value={0}>Regular</option>
                    <option value={1}>Premium</option>
                    <option value={2}>VIP</option>
                  </select>
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Diskon (%)</label>
                  <input 
                    type="number" 
                    name="discountPercentage" 
                    value={form.discountPercentage} 
                    onChange={handleChange} 
                    placeholder="10" 
                    required 
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Tanggal Mulai</label>
                  <input 
                    type="date" 
                    name="startDate" 
                    value={form.startDate} 
                    onChange={handleChange} 
                    required 
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Tanggal Berakhir</label>
                  <input 
                    type="date" 
                    name="endDate" 
                    value={form.endDate} 
                    onChange={handleChange} 
                    required 
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-sm font-semibold text-gray-700">Status</label>
                <select 
                  name="status" 
                  value={form.status} 
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value={0}>Active</option>
                  <option value={1}>Expired</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition" 
                  onClick={closeModal}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;