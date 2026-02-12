import React, { useState, useEffect } from 'react';

const Fields = () => {
  const [fields, setFields] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ fieldTypeId: 1, fieldName: '', description: '', pricePerHour: '', status: 0, imageUrl: '' });

  useEffect(() => { fetchFields(); }, []);

  const fetchFields = async () => {
    const res = await fetch('http://localhost:5014/api/Fields');
    setFields(await res.json());
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Payload bersih: Hanya kirim data yang memang diinput oleh user
  const payload = {
    fieldTypeId: parseInt(form.fieldTypeId),
    fieldName: form.fieldName,
    description: form.description || "",
    pricePerHour: parseFloat(form.pricePerHour),
    status: parseInt(form.status),
    imageUrl: form.imageUrl || ""
  };

  // Jika Edit, kirim fieldId di dalam body (biasanya diminta oleh .NET PUT)
  if (editId) {
    payload.fieldId = editId;
  }

  const method = editId ? 'PUT' : 'POST';
  const url = editId ? `http://localhost:5014/api/Fields/${editId}` : 'http://localhost:5014/api/Fields';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert(editId ? "Lapangan berhasil diperbarui!" : "Lapangan berhasil ditambahkan!");
      fetchFields();
      closeModal();
    } else {
      const errorData = await res.json();
      console.error("Detail Error:", errorData);
      alert("Gagal menyimpan: " + (errorData.title || "Terjadi kesalahan validasi"));
    }
  } catch (error) {
    console.error("Network Error:", error);
    alert("Koneksi ke server gagal.");
  }
};

  const handleDelete = async (id) => {
    if (window.confirm('Hapus lapangan ini?')) {
      await fetch(`http://localhost:5014/api/Fields/${id}`, { method: 'DELETE' });
      fetchFields();
    }
  };

  const openModal = (field = null) => {
  if (field) {
    setEditId(field.fieldId);
    setForm({ 
      // Ambil ID-nya saja, pastikan default ke 1 jika null
      fieldTypeId: field.fieldTypeId || field.fieldType?.fieldTypeId || 1, 
      fieldName: field.fieldName, 
      description: field.description || '', 
      pricePerHour: field.pricePerHour, 
      status: field.status, 
      imageUrl: field.imageUrl || '' 
    });
  } else {
    setEditId(null);
    setForm({ fieldTypeId: 1, fieldName: '', description: '', pricePerHour: '', status: 0, imageUrl: '' });
  }
  setShowModal(true);
};

  const closeModal = () => setShowModal(false);

  const getStatusBadge = (status) => {
    const badges = {
      0: 'bg-green-100 text-green-700',
      1: 'bg-yellow-100 text-yellow-700',
      2: 'bg-red-100 text-red-700'
    };
    const labels = ['Available', 'Maintenance', 'Unavailable'];
    return { class: badges[status], label: labels[status] };
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Kelola Lapangan</h2>
        <button onClick={() => openModal()} className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity">
          + Tambah Lapangan
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">No</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Lapangan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Jenis</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Harga/Jam</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fields.map((f, i) => {
                const badge = getStatusBadge(f.status);
                return (
                  <tr key={f.fieldId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-700">{i + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{f.fieldName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{f.fieldType?.typeName}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-700">Rp {Number(f.pricePerHour).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.class}`}>{badge.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openModal(f)} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md text-xs font-semibold hover:bg-blue-200 transition-colors">Edit</button>
                        <button onClick={() => handleDelete(f.fieldId)} className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md text-xs font-semibold hover:bg-red-200 transition-colors">Hapus</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">{editId ? 'Edit' : 'Tambah'} Lapangan</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Jenis Lapangan</label>
                <select name="fieldTypeId" value={form.fieldTypeId} onChange={handleChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all">
                  <option value={1}>Futsal</option>
                  <option value={2}>Badminton</option>
                  <option value={3}>Basket</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lapangan</label>
                <input type="text" name="fieldName" value={form.fieldName} onChange={handleChange} placeholder="Contoh: Lapangan A" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi</label>
                <input type="text" name="description" value={form.description} onChange={handleChange} placeholder="Deskripsi lapangan" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Harga / Jam (Rp)</label>
                  <input type="number" name="pricePerHour" value={form.pricePerHour} onChange={handleChange} placeholder="50140" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select name="status" value={form.status} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all">
                    <option value={0}>Available</option>
                    <option value={1}>Maintenance</option>
                    <option value={2}>Unavailable</option>
                  </select>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL</label>
                <input type="text" name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="URL gambar" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fields;