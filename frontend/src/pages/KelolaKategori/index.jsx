import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { FileSpreadsheet, Download, Plus, Info, X, Trash2, Edit3, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import ActionMenu from '../../components/ActionMenu';

const KelolaKategori = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [opsiKategori, setOpsiKategori] = useState([]);
  const [kategoriLainnya, setKategoriLainnya] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const [form, setForm] = useState({ 
    id_master_kategori: null, 
    kategori_utama: '', 
    nama_kegiatan: '', 
    tingkat: '', 
    partisipasi: '', 
    bobot: '', 
    dasar_penilaian: 'Sertifikat/SK' 
  });
  const [loadingUpload, setLoadingUpload] = useState(false);

  const getToken = () => {
    try {
      const pengguna = JSON.parse(sessionStorage.getItem('pengguna'));
      return pengguna?.token || '';
    } catch { return ''; }
  };

  const ambilData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch('https://skpi-stikomelrahma.my.id/backend/api/admin/kelola_kategori.php?aksi=ambil', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const hasil = await res.json();
      if (hasil.status === 'sukses') setData(hasil.data);
      
      const resOpsi = await fetch('https://skpi-stikomelrahma.my.id/backend/api/admin/kelola_kategori.php?aksi=ambil_opsi', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const hasilOpsi = await resOpsi.json();
      if (hasilOpsi.status === 'sukses') setOpsiKategori(hasilOpsi.data.map(d => d.kategori_utama));
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { ambilData(); }, []);

  const resetForm = () => {
    setForm({ id_master_kategori: null, kategori_utama: '', nama_kegiatan: '', tingkat: '', partisipasi: '', bobot: '', dasar_penilaian: 'Sertifikat/SK' });
    setKategoriLainnya(false);
    setShowModal(false);
  };

  const handleEdit = (item) => {
    setForm({
      id_master_kategori: item.id_master_kategori,
      kategori_utama: item.kategori_utama,
      nama_kegiatan: item.nama_kegiatan,
      tingkat: item.tingkat,
      partisipasi: item.partisipasi,
      bobot: item.bobot,
      dasar_penilaian: item.dasar_penilaian
    });
    setShowModal(true);
  };

  const handleSimpanManual = async () => {
    if(!form.kategori_utama || !form.nama_kegiatan || !form.bobot) {
      return Swal.fire('Error', 'Kolom Kategori, Kegiatan, dan Bobot wajib diisi!', 'warning');
    }
    
    try {
      const token = getToken();
      const res = await fetch('https://skpi-stikomelrahma.my.id/backend/api/admin/kelola_kategori.php?aksi=simpan', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const hasil = await res.json();
      if(hasil.status === 'sukses') {
        Swal.fire('Berhasil', hasil.pesan, 'success');
        resetForm();
        ambilData();
      } else {
        Swal.fire('Gagal', hasil.pesan, 'error');
      }
    } catch(err) {
      Swal.fire('Error', 'Gagal menghubungi server', 'error');
    }
  };

  const handleHapus = async (id) => {
    const result = await Swal.fire({
      title: 'Hapus Kategori?',
      text: "Data yang dihapus tidak bisa dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!'
    });

    if (result.isConfirmed) {
      try {
        const token = getToken();
        const res = await fetch(`https://skpi-stikomelrahma.my.id/backend/api/admin/kelola_kategori.php?aksi=hapus&id=${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const hasil = await res.json();
        if (hasil.status === 'sukses') {
          Swal.fire('Terhapus!', hasil.pesan, 'success');
          ambilData();
        } else {
          Swal.fire('Gagal', hasil.pesan, 'error');
        }
      } catch (e) {
        Swal.fire('Error', 'Gagal menghubungi server', 'error');
      }
    }
  };

  const handleHapusSemua = async () => {
    const result = await Swal.fire({
      title: 'KOSONGKAN SEMUA DATA?',
      text: "PERINGATAN: Seluruh data Master Kategori SKPI akan dihapus permanen. Aksi ini tidak bisa dibatalkan!",
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, KOSONGKAN!'
    });

    if (result.isConfirmed) {
      try {
        const token = getToken();
        const res = await fetch('https://skpi-stikomelrahma.my.id/backend/api/admin/kelola_kategori.php?aksi=hapus_semua', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const hasil = await res.json();
        if (hasil.status === 'sukses') {
          Swal.fire('Selesai!', hasil.pesan, 'success');
          ambilData();
        } else {
          Swal.fire('Gagal', hasil.pesan, 'error');
        }
      } catch (e) {
        Swal.fire('Error', 'Gagal menghubungi server', 'error');
      }
    }
  };

  const handleUploadCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoadingUpload(true);
    const formData = new FormData();
    formData.append('file_csv', file);

    try {
      const token = getToken();
      const res = await fetch('https://skpi-stikomelrahma.my.id/backend/api/admin/kelola_kategori.php?aksi=import', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const hasil = await res.json();
      if(hasil.status === 'sukses') {
        Swal.fire('Berhasil', hasil.pesan, 'success');
        ambilData();
      } else {
        Swal.fire('Gagal', hasil.pesan, 'error');
      }
    } catch(err) {
      Swal.fire('Error', 'Gagal mengupload file', 'error');
    } finally {
      setLoadingUpload(false);
      e.target.value = null; // reset input
    }
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["kategori_utama", "nama_kegiatan", "tingkat", "partisipasi", "bobot", "dasar_penilaian"],
      ["Kegiatan Wajib", "Pesantren Mahasiswa", "Lokal", "Peserta", "5", "Sertifikat"],
      ["Kegiatan Wajib", "Kewirausahaan", "Lokal", "Ketua", "4", "Sertifikat"]
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Template_Kategori_SKPI.csv");
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h2 className="text-3xl md:text-5xl font-black text-blue-900 uppercase italic tracking-tighter leading-none">Master Kategori</h2>
          <div className="h-1.5 w-20 bg-blue-600 mt-4 rounded-full shadow-lg"></div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={() => setShowGuide(true)} className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-2xl font-bold text-xs hover:bg-gray-200 transition-all">
            <Info size={16} /> Panduan
          </button>
          
          <button onClick={downloadTemplate} className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2.5 rounded-2xl font-bold text-xs hover:bg-green-200 transition-all">
            <Download size={16} /> Template CSV
          </button>
          
          <label className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2.5 rounded-2xl font-bold text-xs hover:bg-blue-200 transition-all cursor-pointer">
            {loadingUpload ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
            {loadingUpload ? 'Mengunggah...' : 'Upload CSV'}
            <input type="file" accept=".csv" className="hidden" onChange={handleUploadCSV} disabled={loadingUpload} />
          </label>
          
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-2xl font-bold text-xs shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">
            <Plus size={16} /> Tambah Manual
          </button>
          
          <button onClick={handleHapusSemua} className="flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2.5 rounded-2xl font-bold text-xs hover:bg-red-200 transition-all">
            <Trash2 size={16} /> Reset
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border p-6 overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Kategori Utama</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nama Kegiatan</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tingkat & Partisipasi</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Bobot</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium">
                  {data.slice((currentPage - 1) * limit, currentPage * limit).map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-blue-50/50 transition-colors">
                      <td className="p-4">
                        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-bold">
                          {item.kategori_utama}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-gray-700">{item.nama_kegiatan}</td>
                      <td className="p-4">
                        <div className="text-xs text-gray-500">
                          {item.tingkat && <span className="font-semibold text-gray-700">{item.tingkat}</span>}
                          {item.tingkat && item.partisipasi && ' - '}
                          {item.partisipasi && <span>{item.partisipasi}</span>}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-black text-xs">
                          {item.bobot}
                        </div>
                      </td>
                      <td className="p-4 flex justify-center gap-2">
                        <ActionMenu>
                          <button onClick={() => handleEdit(item)} className="flex items-center gap-2 text-blue-600">
                            <Edit3 size={16} /> Edit Kategori
                          </button>
                          <button onClick={() => handleHapus(item.id_master_kategori)} className="flex items-center gap-2 text-red-600">
                            <Trash2 size={16} /> Hapus Kategori
                          </button>
                        </ActionMenu>
                      </td>
                    </tr>
                  ))}
                  {data.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-10 text-center text-gray-400 font-bold">Belum ada data kategori. Silakan upload CSV atau tambah manual.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination Controls */}
            {Math.ceil(data.length / limit) > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50/50 gap-4">
                <span className="text-xs font-semibold text-gray-500">
                  Menampilkan {(currentPage - 1) * limit + 1} - {Math.min(currentPage * limit, data.length)} dari {data.length} Kategori
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl">
                    {currentPage} / {Math.ceil(data.length / limit)}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(data.length / limit), p + 1))}
                    disabled={currentPage === Math.ceil(data.length / limit)}
                    className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL TAMBAH / EDIT MANUAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white p-8 rounded-[3rem] w-full max-w-xl shadow-2xl scale-in-center">
            <h3 className="font-black text-blue-900 text-xl uppercase mb-6">
              {form.id_master_kategori ? 'Edit Kategori' : 'Tambah Kategori Manual'}
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kategori Utama *</label>
                {!kategoriLainnya ? (
                  <div className="flex gap-2">
                    <select 
                      className="flex-1 p-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600"
                      value={form.kategori_utama}
                      onChange={(e) => {
                        if(e.target.value === 'Lainnya') setKategoriLainnya(true);
                        else setForm({...form, kategori_utama: e.target.value});
                      }}
                    >
                      <option value="">-- Pilih Kategori --</option>
                      {opsiKategori.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                      <option value="Lainnya">+ Kategori Baru</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      className="flex-1 p-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="Ketik Kategori Baru..."
                      value={form.kategori_utama}
                      onChange={(e) => setForm({...form, kategori_utama: e.target.value})}
                    />
                    <button onClick={() => setKategoriLainnya(false)} className="px-4 bg-gray-100 rounded-2xl text-xs font-bold text-gray-500">Batal</button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nama Kegiatan *</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Contoh: Juara 1 Lomba Nasional"
                  value={form.nama_kegiatan}
                  onChange={(e) => setForm({...form, nama_kegiatan: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tingkat</label>
                  <input type="text" className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600" placeholder="Contoh: Nasional" value={form.tingkat} onChange={(e) => setForm({...form, tingkat: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Partisipasi</label>
                  <input type="text" className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600" placeholder="Contoh: Juara 1" value={form.partisipasi} onChange={(e) => setForm({...form, partisipasi: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dasar Penilaian</label>
                  <input type="text" className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600" placeholder="Sertifikat / SK" value={form.dasar_penilaian} onChange={(e) => setForm({...form, dasar_penilaian: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bobot *</label>
                  <input type="number" className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600" placeholder="Misal: 5" value={form.bobot} onChange={(e) => setForm({...form, bobot: e.target.value})} />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={resetForm} className="flex-1 font-black uppercase text-gray-400 hover:text-gray-600 transition-colors">Batal</button>
                <button onClick={handleSimpanManual} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PANDUAN */}
      {showGuide && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white p-8 rounded-[3rem] w-full max-w-2xl shadow-2xl relative">
            <button onClick={() => setShowGuide(false)} className="absolute top-6 right-6 p-2 bg-gray-100 text-gray-400 rounded-full hover:bg-red-100 hover:text-red-500 transition-all">
              <X size={20} />
            </button>
            <h3 className="font-black text-blue-900 text-2xl uppercase mb-4 flex items-center gap-3">
              <Info className="text-blue-500" /> Panduan Kelola Kategori
            </h3>
            <div className="prose prose-sm prose-blue text-gray-600 max-h-[60vh] overflow-y-auto">
              <p>Halaman ini digunakan untuk mengelola <b>Master Data Kategori SKPI</b> yang nantinya akan dipilih oleh mahasiswa saat input ajuan sertifikat.</p>
              <h4>Cara Mengisi Data:</h4>
              <ul>
                <li><b>Upload CSV:</b> Anda bisa memasukkan ratusan data sekaligus menggunakan Excel (Save as CSV berpemisah koma). Download template CSV untuk melihat format kolomnya.</li>
                <li><b>Tambah Manual:</b> Digunakan jika Anda hanya ingin menambah 1 atau 2 kategori spesifik tanpa harus upload CSV.</li>
              </ul>
              <h4>Penjelasan Kolom:</h4>
              <ul>
                <li><b>Kategori Utama:</b> Kelompok besar kegiatan (Misal: Kegiatan Wajib, Prestasi, Organisasi).</li>
                <li><b>Nama Kegiatan:</b> Rincian kegiatannya (Misal: Pesantren Mahasiswa, Juara 1 Lomba Web).</li>
                <li><b>Tingkat:</b> Level cakupan kegiatan (Nasional, Internasional, Lokal). Kosongkan jika tidak relevan.</li>
                <li><b>Partisipasi:</b> Peran mahasiswa (Ketua, Anggota, Peserta). Kosongkan jika tidak relevan.</li>
                <li><b>Bobot:</b> Angka kredit SKPI yang didapat dari kegiatan ini (misal: 10, 5, 2).</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KelolaKategori;
