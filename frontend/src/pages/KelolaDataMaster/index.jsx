import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Swal from 'sweetalert2';

const KelolaKategori = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ kategori_utama: '', nama_kegiatan: '', tingkat: '', partisipasi: '', bobot: '' });

  const ambilData = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://skpi-stikomelrahma.my.id/backend/api/admin/kelola_kategori.php?aksi=ambil');
      const hasil = await res.json();
      if (hasil.status === 'sukses') setData(hasil.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { ambilData(); }, []);

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file_csv', file);

    Swal.fire({ 
        title: 'Sedang Memproses...', 
        text: 'Mengimport data dari file Excel Akang', 
        allowOutsideClick: false, 
        didOpen: () => Swal.showLoading() 
    });

    try {
      const res = await fetch('https://skpi-stikomelrahma.my.id/backend/api/admin/kelola_kategori.php?aksi=import', {
        method: 'POST',
        body: formData
      });
      const hasil = await res.json();
      if (hasil.status === 'sukses') {
        Swal.fire('Berhasil!', hasil.pesan, 'success');
        ambilData();
      } else { Swal.fire('Gagal', hasil.pesan, 'error'); }
    } catch (err) { Swal.fire('Error', 'Gagal koneksi ke server', 'error'); }
  };

  const handleHapus = (id) => {
    Swal.fire({
      title: 'Hapus Kategori?',
      text: "Data kategori ini akan hilang permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus!',
      confirmButtonColor: '#ef4444'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await fetch(`https://skpi-stikomelrahma.my.id/backend/api/admin/kelola_kategori.php?aksi=hapus&id=${id}`);
        const hasil = await res.json();
        if (hasil.status === 'sukses') {
          Swal.fire('Terhapus!', hasil.pesan, 'success');
          ambilData();
        }
      }
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-[11px] font-sans">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-black text-blue-900 uppercase tracking-tighter italic">Master Kategori</h2>
            <p className="text-gray-400 font-bold uppercase text-[9px] tracking-[0.3em]">Pedoman Kredit SKPI STIKOM El Rahma</p>
          </div>
          <div className="flex gap-3">
            <label className="bg-green-600 text-white px-6 py-4 rounded-2xl font-black cursor-pointer shadow-lg shadow-green-100 hover:scale-105 active:scale-95 transition-all">
              IMPORT EXCEL (.CSV)
              <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
            </label>
            <button 
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-black shadow-lg shadow-blue-100 hover:scale-105 active:scale-95 transition-all uppercase">
              + Tambah Manual
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b font-black text-gray-400 uppercase">
              <tr>
                <th className="p-6">Kategori</th>
                <th className="p-6">Detail Kegiatan</th>
                <th className="p-6 text-center">Tingkat</th>
                <th className="p-6 text-center">Partisipasi</th>
                <th className="p-6 text-center text-blue-600">Bobot</th>
                <th className="p-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="p-20 text-center animate-pulse font-black text-blue-200 text-sm uppercase tracking-widest">Sinkronisasi Data...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan="6" className="p-20 text-center font-bold text-gray-300 uppercase">Belum ada data. Silakan Import Excel!</td></tr>
              ) : data.map((item, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-blue-50/20 transition-all">
                  <td className="p-6 font-bold text-gray-400 uppercase">{item.kategori_utama}</td>
                  <td className="p-6 font-black text-blue-900 uppercase leading-tight max-w-xs">{item.nama_kegiatan}</td>
                  <td className="p-6 text-center font-bold text-gray-400">{item.tingkat || '-'}</td>
                  <td className="p-6 text-center font-bold text-gray-400">{item.partisipasi || '-'}</td>
                  <td className="p-6 text-center font-black text-blue-600 text-sm">{item.bobot}</td>
                  <td className="p-6 text-center">
                    <button onClick={() => handleHapus(item.id)} className="bg-red-50 text-red-500 px-4 py-2 rounded-xl font-black hover:bg-red-500 hover:text-white transition-all uppercase text-[9px]">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH MANUAL (POPUP) */}
      {showModal && (
        <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10 animate-in zoom-in duration-300">
            <h3 className="text-2xl font-black text-blue-900 uppercase mb-6 tracking-tighter">Tambah Kategori</h3>
            <div className="space-y-4">
              <input type="text" className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="Kategori Utama" value={form.kategori_utama} onChange={(e) => setForm({...form, kategori_utama: e.target.value})} />
              <textarea className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold h-24" placeholder="Nama Kegiatan" value={form.nama_kegiatan} onChange={(e) => setForm({...form, nama_kegiatan: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" className="p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="Tingkat" value={form.tingkat} onChange={(e) => setForm({...form, tingkat: e.target.value})} />
                <input type="number" className="p-4 bg-gray-50 border-none rounded-2xl font-bold" placeholder="Bobot" value={form.bobot} onChange={(e) => setForm({...form, bobot: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowModal(false)} className="flex-1 py-4 font-black uppercase text-gray-400">Batal</button>
                <button onClick={() => setShowModal(false)} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase shadow-lg shadow-blue-100">Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KelolaKategori;
