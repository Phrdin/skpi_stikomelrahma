import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import ActionMenu from '../../components/ActionMenu';
import { Pencil, Trash2, Eye, EyeOff, Download, Upload, Plus, Search, Filter, Printer, User, Shield, X } from 'lucide-react';

const DataMahasiswa = () => {
  const [daftar, setDaftar] = useState([]);
  const [opsiAngkatan, setOpsiAngkatan] = useState([]);
  const [opsiStatus, setOpsiStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [cari, setCari] = useState('');
  const [filtAkt, setFiltAkt] = useState('');
  const [limit, setLimit] = useState(10);
  
  const [terpilih, setTerpilih] = useState([]);
  const [idAngkatanImport, setIdAngkatanImport] = useState('');
  const [showLihatModal, setShowLihatModal] = useState(false);
  const [dataLihat, setDataLihat] = useState(null);
  const [showPasswordDetail, setShowPasswordDetail] = useState(false);
  const [form, setForm] = useState({ 
    nomor_induk: '', nama_lengkap: '', id_angkatan: '', kata_sandi: '', 
    program_studi: '', tempat_lahir: '', tanggal_lahir: '', jenis_kelamin: '', 
    no_hp: '', email: '', alamat: '', nik: '', agama: '', semester_aktif: '', 
    semester_berjalan: '', gelar: '', tahun_lulus: '', id_status: 1,
    is_edit: false 
  });

  const ambilData = async () => {
    setLoading(true);
    setTerpilih([]); 
    try {
      const res = await fetch(`https://skpi-stikomelrahma.my.id/backend/api/admin/ambil_semua_mahasiswa.php?aksi=ambil&cari=${cari}&angkatan=${filtAkt}`);
      const hasil = await res.json();
      if (hasil.status === 'sukses') setDaftar(hasil.data);
      
      const resA = await fetch('https://skpi-stikomelrahma.my.id/backend/api/umum/ambil_opsi.php?aksi=opsi_filter');
      const hasilA = await resA.json();
      if (hasilA.status === 'sukses') setOpsiAngkatan(hasilA.angkatan);
      
      const resS = await fetch('https://skpi-stikomelrahma.my.id/backend/api/admin/kelola_status.php?aksi=ambil');
      const hasilS = await resS.json();
      if (hasilS.status === 'sukses') setOpsiStatus(hasilS.data);
    } catch (err) { console.error("Gagal ambil data"); }
    finally { setLoading(false); }
  };

  useEffect(() => { ambilData(); }, [cari, filtAkt]);

  const handleExport = () => {
    const dataExport = daftar.map(m => ({
      NIM: m.nomor_induk,
      Nama_Lengkap: m.nama_lengkap,
      Angkatan: m.nama_angkatan || m.angkatan,
      Program_Studi: m.program_studi || '-',
      Tempat_Lahir: m.tempat_lahir || '-',
      Tanggal_Lahir: m.tanggal_lahir || '-',
      Jenis_Kelamin: m.jenis_kelamin || '-',
      Agama: m.agama || '-',
      NIK: m.nik || '-',
      No_HP: m.no_hp || '-',
      Email: m.email || '-',
      Alamat: m.alamat || '-',
      Semester_Aktif: m.semester_aktif || '-',
      Semester_Berjalan: m.semester_berjalan || '-',
      Tahun_Lulus: m.tahun_lulus || '-',
      Gelar: m.gelar || '-',
      Status_Mahasiswa: m.status_mahasiswa_text || 'Aktif',
      Total_Poin: m.total_poin || 0
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Mahasiswa");
    XLSX.writeFile(workbook, `Data_Mahasiswa_SKPI_${new Date().toLocaleDateString()}.xlsx`);
  };

  const handleHapus = (nim, nama) => {
    const isMassal = Array.isArray(nim);
    Swal.fire({
      title: isMassal ? `Hapus ${terpilih.length} Mahasiswa?` : `Hapus ${nama}?`,
      text: "Data profil dan akun login akan dihapus permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await fetch(`https://skpi-stikomelrahma.my.id/backend/api/admin/ambil_semua_mahasiswa.php?aksi=hapus_massal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nims: isMassal ? nim : [nim] })
        });
        const hasil = await res.json();
        if (hasil.status === 'sukses') { Swal.fire('Terhapus!', hasil.pesan, 'success'); ambilData(); }
      }
    });
  };

  const simpanData = async (e) => {
    e.preventDefault();
    const res = await fetch('https://skpi-stikomelrahma.my.id/backend/api/admin/ambil_semua_mahasiswa.php?aksi=simpan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const hasil = await res.json();
    if (hasil.status === 'sukses') { Swal.fire('Berhasil', hasil.pesan, 'success'); setShowModal(false); ambilData(); }
  };

  const eksekusiImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setShowImportModal(false);
    Swal.fire({ title: 'Import Data...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    const fData = new FormData();
    fData.append('file_csv', file);
    fData.append('id_angkatan', idAngkatanImport);
    const res = await fetch('https://skpi-stikomelrahma.my.id/backend/api/admin/ambil_semua_mahasiswa.php?aksi=import', { method: 'POST', body: fData });
    const hasil = await res.json();
    if (hasil.status === 'sukses') { Swal.fire('Sukses!', hasil.pesan, 'success'); ambilData(); }
  };

  const handleDownloadTemplate = () => {
    const headers = [[
      'NIM', 'Nama Lengkap', 'Password', 'Program Studi', 'Tempat Lahir', 
      'Tanggal Lahir (YYYY-MM-DD)', 'Jenis Kelamin', 'Agama', 'NIK', 'No. HP', 
      'Email', 'Alamat', 'Semester Aktif', 'Tahun Lulus', 'Gelar'
    ]];
    const worksheet = XLSX.utils.aoa_to_sheet(headers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "Template_Import_Mahasiswa.csv");
  };

  return (
    <div className="animate-in fade-in duration-500 pb-10">
        {/* Header EDOM Style */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-gray-900">Manajemen Pengguna</span>
            </h2>
            <p className="text-sm font-medium text-gray-500 mt-1 flex items-center gap-1">
              <span className="text-gray-400"><Filter size={14}/></span>
              Sistem / Kelola Akun & Hak Akses
            </p>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <button onClick={handleExport} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-800 text-white px-5 py-2.5 rounded-full font-semibold shadow-sm hover:bg-gray-900 transition-all text-sm">
              <Download size={16} /> Export CSV
            </button>
            <button onClick={() => setShowImportModal(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-emerald-600 px-5 py-2.5 rounded-full font-semibold shadow-sm border border-emerald-500 hover:bg-emerald-50 transition-all text-sm">
              <Upload size={16} /> Import CSV
            </button>
            <button onClick={() => { 
                setForm({ 
                  nomor_induk:'', nama_lengkap:'', id_angkatan:'', kata_sandi:'', 
                  program_studi: '', tempat_lahir: '', tanggal_lahir: '', jenis_kelamin: '', 
                  no_hp: '', email: '', alamat: '', nik: '', agama: '', semester_aktif: '', 
                  semester_berjalan: '', gelar: '', tahun_lulus: '', id_status: 1,
                  is_edit: false 
                }); 
                setShowModal(true); 
              }} 
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-full font-semibold shadow-sm hover:bg-blue-700 transition-all text-sm">
              <Plus size={16} /> Tambah User
            </button>
          </div>
        </div>

        {/* Toolbar Filter EDOM Style */}
        <div className="bg-gray-50/50 p-3 rounded-2xl mb-4 flex flex-col md:flex-row gap-3 items-center">
          <div className="flex gap-2 w-full md:w-auto">
            <select className="w-32 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 outline-none focus:border-blue-600" value={limit} onChange={(e) => setLimit(e.target.value)}>
                <option value="10">10 Baris</option>
                <option value="50">50 Baris</option>
                <option value="100">100 Baris</option>
            </select>
            <div className="relative flex-1 md:w-48">
              <select className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 outline-none focus:border-blue-600 appearance-none" value={filtAkt} onChange={(e) => setFiltAkt(e.target.value)}>
                  <option value="">Semua Angkatan</option>
                  {opsiAngkatan.map(a => <option key={a.id} value={a.id}>{a.nama_angkatan}</option>)}
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>
          </div>
          <div className="relative flex-1 w-full">
            <input type="text" placeholder="Cari nama atau username..." className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 outline-none focus:border-blue-600 transition-all" 
              value={cari} onChange={(e) => setCari(e.target.value)} />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
          
          {terpilih.length > 0 && (
            <div className="w-full md:w-auto flex justify-end">
                <button onClick={() => handleHapus(terpilih)} className="flex items-center justify-center gap-2 bg-red-500 text-white px-5 py-2.5 rounded-full font-semibold shadow-sm hover:bg-red-600 transition-all text-sm w-full md:w-auto">
                  <Trash2 size={16} /> Hapus Terpilih
                </button>
            </div>
          )}
        </div>

        {/* Tabel Mahasiswa EDOM Style */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
                <thead className="border-b border-gray-100 text-gray-800 text-sm font-semibold">
                <tr>
                    <th className="py-4 px-4 w-12 text-center">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer" 
                        onChange={(e) => {
                            if (e.target.checked) setTerpilih(daftar.slice(0, limit).map(m => m.nomor_induk));
                            else setTerpilih([]);
                        }} 
                        checked={terpilih.length === daftar.slice(0, limit).length && daftar.length > 0} 
                        />
                    </th>
                    <th className="py-4 px-4 text-center w-16">No</th>
                    <th className="py-4 px-4">Nama Lengkap</th>
                    <th className="py-4 px-4">Identitas Akun</th>
                    <th className="py-4 px-4 text-center">Hak Akses</th>
                    <th className="py-4 px-4 text-center">Afiliasi Kelas</th>
                    <th className="py-4 px-4 text-center w-36">Aksi</th>
                </tr>
                </thead>
                <tbody className="text-sm text-gray-700">
                {loading ? (
                    <tr><td colSpan="7" className="p-12 text-center text-gray-500 animate-pulse font-medium">Memuat data...</td></tr>
                ) : daftar.slice(0, limit).map((m, i) => (
                    <tr key={i} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${terpilih.includes(m.nomor_induk) ? 'bg-blue-50/30' : ''}`}>
                    <td className="py-4 px-4 text-center">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer" 
                        checked={terpilih.includes(m.nomor_induk)} 
                        onChange={() => {
                            setTerpilih(prev => prev.includes(m.nomor_induk) ? prev.filter(id => id !== m.nomor_induk) : [...prev, m.nomor_induk]);
                        }} 
                        />
                    </td>
                    <td className="py-4 px-4 text-center font-medium text-gray-500">{i + 1}</td>
                    <td className="py-4 px-4 font-semibold text-gray-800">
                        {m.nama_lengkap}
                    </td>
                    <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-gray-500 font-medium">
                            <User size={14} className="text-gray-400" />
                            {m.nomor_induk}
                        </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center justify-center bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-semibold border border-blue-100">
                            Mahasiswa
                        </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center justify-center bg-gray-50 text-blue-600 border border-gray-200 px-3 py-1 rounded-md text-xs font-semibold">
                            {m.nama_angkatan || '-'}
                        </span>
                        <div className="text-emerald-500 font-bold mt-1 text-xs">{m.total_poin} Poin SKPI</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                            <button onClick={() => { setDataLihat(m); setShowLihatModal(true); }} className="text-sky-500 hover:text-sky-600 transition-colors" title="Lihat Profil">
                                <Eye size={16} strokeWidth={2.5} />
                            </button>
                            <button onClick={() => { setForm({...m, is_edit: true}); setShowModal(true); }} className="text-amber-500 hover:text-amber-600 transition-colors" title="Edit Data">
                                <Pencil size={16} strokeWidth={2.5} />
                            </button>
                            <button onClick={() => handleHapus(m.nomor_induk, m.nama_lengkap)} className="text-red-500 hover:text-red-600 transition-colors" title="Hapus User">
                                <Trash2 size={16} strokeWidth={2.5} />
                            </button>
                            {parseInt(m.total_poin || 0) >= 250 && (
                                <button onClick={() => window.open(`/cetak-draft/${m.nomor_induk}`, '_blank')} className="text-emerald-500 hover:text-emerald-600 transition-colors" title="Cetak Draft SKPI">
                                    <Printer size={16} strokeWidth={2.5} />
                                </button>
                            )}
                        </div>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        </div>

      {/* MODAL IMPORT */}
      {showImportModal && (
        <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-md flex items-center justify-center z-[150] p-4">
          <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl p-10 animate-in zoom-in duration-300">
            <h3 className="text-2xl font-black text-blue-900 uppercase mb-6 italic tracking-tighter text-center">Import Mahasiswa</h3>
            <div className="space-y-6">
              <div className="space-y-2 text-center">
                <label className="font-black text-gray-400 uppercase text-[9px] block mb-2">1. Pilih Angkatan Target:</label>
                <select className="w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-600" value={idAngkatanImport} onChange={e => setIdAngkatanImport(e.target.value)}>
                    <option value="">-- Pilih Angkatan --</option>
                    {opsiAngkatan.map(a => <option key={a.id} value={a.id}>{a.nama_angkatan}</option>)}
                </select>
              </div>
              <div className="bg-amber-50 p-6 md:p-8 rounded-3xl border border-amber-100 text-amber-800 text-[10px] font-bold leading-relaxed">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                  <p className="font-black uppercase tracking-widest text-center md:text-left text-[11px]">Aturan Kolom CSV (A - O):</p>
                  <button onClick={handleDownloadTemplate} className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-black uppercase text-[9px] shadow-sm transition-all flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Download Template
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center text-[9px]">
                    <div className="p-2.5 bg-white rounded-xl border border-amber-100 shadow-sm"><span className="text-red-500">*</span> A: NIM</div>
                    <div className="p-2.5 bg-white rounded-xl border border-amber-100 shadow-sm"><span className="text-red-500">*</span> B: Nama</div>
                    <div className="p-2.5 bg-white rounded-xl border border-amber-100 shadow-sm">C: Password</div>
                    <div className="p-2.5 bg-white rounded-xl border border-amber-100 shadow-sm">D: Prodi</div>
                    <div className="p-2.5 bg-white rounded-xl border border-amber-100 shadow-sm">E: Tmpt Lahir</div>
                    <div className="p-2.5 bg-white rounded-xl border border-amber-100 shadow-sm">F: Tgl Lahir</div>
                    <div className="p-2.5 bg-white rounded-xl border border-amber-100 shadow-sm">G: Gender</div>
                    <div className="p-2.5 bg-white rounded-xl border border-amber-100 shadow-sm">H: Agama</div>
                    <div className="p-2.5 bg-white rounded-xl border border-amber-100 shadow-sm">I: NIK</div>
                    <div className="p-2.5 bg-white rounded-xl border border-amber-100 shadow-sm">J: No. HP</div>
                    <div className="p-2.5 bg-white rounded-xl border border-amber-100 shadow-sm">K: Email</div>
                    <div className="p-2.5 bg-white rounded-xl border border-amber-100 shadow-sm">L: Alamat</div>
                    <div className="p-2.5 bg-white rounded-xl border border-amber-100 shadow-sm">M: Semester</div>
                    <div className="p-2.5 bg-white rounded-xl border border-amber-100 shadow-sm">N: Thn Lulus</div>
                    <div className="p-2.5 bg-white rounded-xl border border-amber-100 shadow-sm">O: Gelar</div>
                </div>
                <p className="mt-5 text-center text-red-500 italic text-[10px]">* Wajib diisi. Kolom lainnya (C - O) opsional / boleh dibiarkan kosong.</p>
              </div>
              {idAngkatanImport && (
                <label className="block w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-center cursor-pointer shadow-lg hover:bg-blue-700 uppercase tracking-widest text-[11px] animate-in slide-in-from-bottom-2">
                    3. PILIH FILE & UPLOAD
                    <input type="file" accept=".csv" className="hidden" onChange={eksekusiImport} />
                </label>
              )}
              <button onClick={() => setShowImportModal(false)} className="w-full text-center font-black text-gray-300 uppercase text-[10px] pt-2">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FORM TAMBAH / EDIT */}
      {showModal && (
        <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-md flex items-center justify-center z-[150] p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl p-8 md:p-10 animate-in zoom-in duration-300 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 p-3 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
              <X size={20}/>
            </button>
            <h3 className="text-2xl font-black text-blue-900 uppercase mb-8 italic tracking-tighter text-center">{form.is_edit ? 'Edit Mahasiswa' : 'Tambah Mahasiswa'}</h3>
            <form onSubmit={simpanData} className="space-y-6 font-sans">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Kolom Kiri: Akademik & Akun */}
                <div className="space-y-4">
                  <h4 className="font-black text-blue-400 text-[10px] uppercase tracking-[0.2em] mb-2 border-b pb-2">Data Akademik & Akun</h4>
                  
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-2">NIM *</label>
                    <input type="text" placeholder="Masukkan NIM" className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-600 text-sm" value={form.nomor_induk} onChange={e => setForm({...form, nomor_induk: e.target.value})} required disabled={form.is_edit} />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-2">Nama Lengkap *</label>
                    <input type="text" placeholder="Masukkan Nama Lengkap" className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-600 text-sm" value={form.nama_lengkap} onChange={e => setForm({...form, nama_lengkap: e.target.value})} required />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-2">Angkatan *</label>
                      <select className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-600 cursor-pointer text-sm" value={form.id_angkatan} onChange={e => setForm({...form, id_angkatan: e.target.value})} required>
                          <option value="">Pilih Angkatan</option>
                          {opsiAngkatan.map(a => <option key={a.id} value={a.id}>{a.nama_angkatan}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-2">Password Akun</label>
                      <input type="password" placeholder="Kosongkan jika tidak diubah" className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-600 text-sm" value={form.kata_sandi} onChange={e => setForm({...form, kata_sandi: e.target.value})} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-2">Program Studi</label>
                      <select className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-600 cursor-pointer text-sm" value={form.program_studi || ''} onChange={e => setForm({...form, program_studi: e.target.value})}>
                          <option value="">-- Pilih Program Studi --</option>
                          <option value="Informatika">Informatika</option>
                          <option value="Teknik Informatika">Teknik Informatika</option>
                          <option value="Sistem Informasi">Sistem Informasi</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-2">Status Mahasiswa</label>
                      <select className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-600 cursor-pointer text-sm" value={form.id_status || 1} onChange={e => setForm({...form, id_status: e.target.value})}>
                          {opsiStatus.map(s => <option key={s.id_status} value={s.id_status}>{s.nama_status}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-2">Semester Aktif</label>
                      <input type="number" placeholder="Cth: 1, 2, 3" className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-600 text-sm" value={form.semester_aktif || ''} onChange={e => setForm({...form, semester_aktif: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-2">Semester Berjalan</label>
                      <input type="number" placeholder="Cth: 1, 2, 3" className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-600 text-sm" value={form.semester_berjalan || ''} onChange={e => setForm({...form, semester_berjalan: e.target.value})} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-2">Tahun Lulus</label>
                      <input type="text" placeholder="Cth: 2028" className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-600 text-sm" value={form.tahun_lulus || ''} onChange={e => setForm({...form, tahun_lulus: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-2">Gelar Kelulusan</label>
                      <input type="text" placeholder="Contoh: S.Kom" className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-600 text-sm" value={form.gelar || ''} onChange={e => setForm({...form, gelar: e.target.value})} />
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Data Pribadi */}
                <div className="space-y-4">
                  <h4 className="font-black text-emerald-400 text-[10px] uppercase tracking-[0.2em] mb-2 border-b pb-2">Data Pribadi</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-2">Tempat Lahir</label>
                      <input type="text" placeholder="Masukkan Kota Lahir" className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-600 text-sm" value={form.tempat_lahir || ''} onChange={e => setForm({...form, tempat_lahir: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-2">Tanggal Lahir</label>
                      <input type="date" className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-600 text-sm text-gray-500" value={form.tanggal_lahir || ''} onChange={e => setForm({...form, tanggal_lahir: e.target.value})} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-2">Jenis Kelamin</label>
                      <select className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-600 cursor-pointer text-sm" value={form.jenis_kelamin || ''} onChange={e => setForm({...form, jenis_kelamin: e.target.value})}>
                          <option value="">Pilih Gender</option>
                          <option value="Laki-laki">Laki-laki</option>
                          <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-2">Agama</label>
                      <input type="text" placeholder="Contoh: Islam" className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-600 text-sm" value={form.agama || ''} onChange={e => setForm({...form, agama: e.target.value})} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-2">Nomor Induk Kependudukan (NIK)</label>
                    <input type="text" placeholder="Masukkan 16 Digit NIK" className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-600 text-sm" value={form.nik || ''} onChange={e => setForm({...form, nik: e.target.value})} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-2">Nomor Handphone</label>
                      <input type="text" placeholder="Contoh: 08123456789" className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-600 text-sm" value={form.no_hp || ''} onChange={e => setForm({...form, no_hp: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-2">Alamat Email</label>
                      <input type="email" placeholder="Contoh: email@domain.com" className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-600 text-sm" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-2">Alamat Tempat Tinggal Lengkap</label>
                    <textarea placeholder="Masukkan Alamat Lengkap..." className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-600 text-sm h-24 resize-none" value={form.alamat || ''} onChange={e => setForm({...form, alamat: e.target.value})}></textarea>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 font-black text-gray-400 uppercase text-[10px] py-4 bg-gray-50 hover:bg-gray-100 rounded-[1.5rem] transition-all">Batal</button>
                <button type="submit" className="flex-[2] bg-blue-600 text-white py-4 rounded-[1.5rem] font-black uppercase shadow-lg shadow-blue-100 text-[11px] tracking-widest transition-all active:scale-95 hover:bg-blue-700">Simpan Data Mahasiswa</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL LIHAT PROFIL */}
      {showLihatModal && dataLihat && (
        <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-md flex items-center justify-center z-[150] p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl animate-in zoom-in duration-300 relative">
            <button onClick={() => { setShowLihatModal(false); setShowPasswordDetail(false); }} className="absolute top-8 right-8 p-3 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
              <X size={20}/>
            </button>
            <div className="p-8 md:p-10">
              <h3 className="text-2xl font-black text-blue-900 uppercase mb-8 italic tracking-tighter text-center">Profil Mahasiswa</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
                {/* Kolom Kiri */}
                <div className="space-y-4">
                  <h4 className="font-black text-blue-400 text-[10px] uppercase tracking-[0.2em] mb-2 border-b pb-2">Data Akademik & Akun</h4>
                  
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">NIM / Nama Lengkap</label>
                    <div className="font-black text-blue-950 text-sm uppercase">{dataLihat.nomor_induk} - {dataLihat.nama_lengkap}</div>
                  </div>
                  
                  <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                    <label className="block text-[10px] font-black text-amber-600/70 uppercase tracking-widest mb-1">Kata Sandi Akun</label>
                    <div className="flex items-center justify-between">
                      <div className="font-mono font-bold text-amber-800 tracking-wider">
                        {showPasswordDetail ? (dataLihat.sandi_mentah || dataLihat.nomor_induk) : '••••••••'}
                      </div>
                      <button onClick={() => setShowPasswordDetail(!showPasswordDetail)} className="p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg transition-colors">
                        {showPasswordDetail ? <EyeOff size={16}/> : <Eye size={16}/>}
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status Mahasiswa</label>
                        <div className={`font-black text-sm uppercase ${dataLihat.status_mahasiswa_text === 'Aktif' ? 'text-green-500' : 'text-amber-500'}`}>{dataLihat.status_mahasiswa_text || 'Aktif'}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Angkatan</label>
                        <div className="font-bold text-gray-700 text-sm uppercase">{dataLihat.nama_angkatan || '-'}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Program Studi</label>
                        <div className="font-bold text-gray-700 text-sm uppercase">{dataLihat.program_studi || '-'}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Sem Aktif / Berjalan</label>
                        <div className="font-bold text-gray-700 text-sm uppercase">{dataLihat.semester_aktif || '-'} / {dataLihat.semester_berjalan || '-'}</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Gelar Kelulusan</label>
                    <div className="font-bold text-gray-700 text-sm uppercase">{dataLihat.gelar || '-'}</div>
                  </div>
                </div>

                {/* Kolom Kanan */}
                <div className="space-y-4">
                  <h4 className="font-black text-emerald-400 text-[10px] uppercase tracking-[0.2em] mb-2 border-b pb-2">Data Pribadi</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tempat, Tgl Lahir</label>
                        <div className="font-bold text-gray-700 text-sm">{dataLihat.tempat_lahir || '-'}, {dataLihat.tanggal_lahir || '-'}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Jenis Kelamin</label>
                        <div className="font-bold text-gray-700 text-sm">{dataLihat.jenis_kelamin || '-'}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Agama</label>
                        <div className="font-bold text-gray-700 text-sm">{dataLihat.agama || '-'}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">NIK</label>
                        <div className="font-bold text-gray-700 text-sm">{dataLihat.nik || '-'}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">No. HP</label>
                        <div className="font-bold text-gray-700 text-sm">{dataLihat.no_hp || '-'}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email</label>
                        <div className="font-bold text-gray-700 text-sm">{dataLihat.email || '-'}</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Alamat Lengkap</label>
                    <div className="font-bold text-gray-700 text-sm">{dataLihat.alamat || '-'}</div>
                  </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
                <button onClick={() => { setShowLihatModal(false); setShowPasswordDetail(false); }} className="px-12 py-4 bg-gray-100 text-gray-500 hover:bg-blue-600 hover:text-white rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all">Tutup</button>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataMahasiswa;
