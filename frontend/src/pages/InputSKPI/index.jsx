import React, { useContext, useState, useEffect } from 'react';
import { KonteksPengguna } from '../../context/InfoPengguna';
import { CloudUpload, FileText, Info, CheckCircle, AlertTriangle, X, Loader2, MessageCircle } from 'lucide-react';
import Swal from 'sweetalert2';

const InputSKPI = () => {
  const { pengguna } = useContext(KonteksPengguna);
  
  // State Loading & Data Master
  const [loading, setLoading] = useState(false);
  const [masterKategori, setMasterKategori] = useState([]);
  
  // State Opsi Dropdown
  const [opsiKategori, setOpsiKategori] = useState([]);
  const [opsiKegiatan, setOpsiKegiatan] = useState([]);
  const [opsiTingkat, setOpsiTingkat] = useState([]);
  const [opsiPartisipasi, setOpsiPartisipasi] = useState([]);

  // State Form Utama
  const [formData, setFormData] = useState({
    id_master_kategori: '',
    kategori_utama: '',
    nama_kegiatan: '',
    tingkat: '',
    partisipasi: '',
    poin: 0,
    semester_ditempuh: 1,
    waktu_pelaksanaan: ''
  });
  
  const [fileSertifikat, setFileSertifikat] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [panduanFile, setPanduanFile] = useState(null);
  const [showPanduan, setShowPanduan] = useState(false);

  // 1. Ambil Data Master dari Database
  useEffect(() => {
    const fetchMaster = async () => {
      try {
        const res = await fetch('https://skpi-stikomelrahma.my.id/backend/api/admin/kelola_kategori.php?aksi=ambil');
        const hasil = await res.json();
        if (hasil.status === 'sukses') {
          setMasterKategori(hasil.data);
          const kategoriUnik = [...new Set(hasil.data.map(item => item.kategori_utama))];
          setOpsiKategori(kategoriUnik);
        }
      } catch (err) {
        console.error("Gagal mengambil master kategori");
      }
    };
    
    const fetchPanduan = async () => {
      try {
        const res = await fetch('https://skpi-stikomelrahma.my.id/backend/api/admin/pengaturan.php?aksi=ambil');
        const hasil = await res.json();
        if (hasil.status === 'sukses' && hasil.data.skpi_panduan_file) {
          setPanduanFile(hasil.data.skpi_panduan_file);
        }
      } catch (err) {}
    };

    const fetchSemesterAktif = async () => {
      if (!pengguna?.nomor_induk) return;
      try {
        const res = await fetch(`https://skpi-stikomelrahma.my.id/backend/api/umum/ambil_ringkasan.php?nim=${pengguna.nomor_induk}&peran=${pengguna.peran}`);
        const hasil = await res.json();
        if (hasil.status === 'sukses' && hasil.data.semester_aktif) {
          setFormData(prev => ({ ...prev, semester_ditempuh: hasil.data.semester_aktif }));
        }
      } catch (err) {}
    };

    fetchMaster();
    fetchPanduan();
    fetchSemesterAktif();
  }, [pengguna]);

  // 2. Logika Dropdown Bertingkat (Dependent Dropdown)
  useEffect(() => {
    if (formData.kategori_utama) {
      const filtered = masterKategori.filter(item => item.kategori_utama === formData.kategori_utama);
      setOpsiKegiatan([...new Set(filtered.map(item => item.nama_kegiatan))]);
    } else {
      setOpsiKegiatan([]);
    }
    setOpsiTingkat([]); setOpsiPartisipasi([]);
    setFormData(prev => ({ ...prev, id_master_kategori: '', nama_kegiatan: '', tingkat: '', partisipasi: '', poin: 0 }));
  }, [formData.kategori_utama, masterKategori]);

  useEffect(() => {
    if (formData.nama_kegiatan) {
      const filtered = masterKategori.filter(item => 
        item.kategori_utama === formData.kategori_utama && 
        item.nama_kegiatan === formData.nama_kegiatan
      );
      setOpsiTingkat([...new Set(filtered.map(item => item.tingkat))]);
    } else {
      setOpsiTingkat([]);
    }
    setOpsiPartisipasi([]);
    setFormData(prev => ({ ...prev, id_master_kategori: '', tingkat: '', partisipasi: '', poin: 0 }));
  }, [formData.nama_kegiatan, formData.kategori_utama, masterKategori]);

  useEffect(() => {
    if (formData.tingkat) {
      const filtered = masterKategori.filter(item => 
        item.kategori_utama === formData.kategori_utama && 
        item.nama_kegiatan === formData.nama_kegiatan &&
        item.tingkat === formData.tingkat
      );
      setOpsiPartisipasi([...new Set(filtered.map(item => item.partisipasi))]);
    } else {
      setOpsiPartisipasi([]);
    }
    setFormData(prev => ({ ...prev, id_master_kategori: '', partisipasi: '', poin: 0 }));
  }, [formData.tingkat, formData.nama_kegiatan, formData.kategori_utama, masterKategori]);

  // 3. Set Kredit & ID Master Otomatis Berdasarkan Pilihan Terakhir
  useEffect(() => {
    const match = masterKategori.find(item => 
      item.kategori_utama === formData.kategori_utama &&
      item.nama_kegiatan === formData.nama_kegiatan &&
      item.tingkat === formData.tingkat &&
      item.partisipasi === formData.partisipasi
    );
    if (match) {
      setFormData(prev => ({ ...prev, poin: match.bobot, id_master_kategori: match.id_master_kategori }));
    }
  }, [formData.partisipasi, formData.tingkat, formData.nama_kegiatan, formData.kategori_utama, masterKategori]);

  // 4. Validasi File & Preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return Swal.fire('Format Salah', 'Gunakan format JPG, PNG, atau PDF', 'error');
    }

    if (file.size > 10 * 1024 * 1024) {
      return Swal.fire('Terlalu Besar', 'Maksimal ukuran file adalah 10MB', 'error');
    }

    setFileSertifikat(file);
    if (file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl('pdf_icon'); 
    }
  };

  // 5. Kirim Data ke Backend
  const handleSimpan = async (e) => {
    e.preventDefault();
    if (!fileSertifikat) return Swal.fire('Peringatan', 'Sertifikat belum dipilih!', 'warning');
    if (formData.kredit === 0) return Swal.fire('Peringatan', 'Harap lengkapi pilihan kegiatan!', 'warning');

    setLoading(true);
    const dataKirim = new FormData();
    dataKirim.append('nomor_induk', pengguna.nomor_induk);
    dataKirim.append('id_master_kategori', formData.id_master_kategori);
    dataKirim.append('semester_ditempuh', formData.semester_ditempuh);
    dataKirim.append('waktu_pelaksanaan', formData.waktu_pelaksanaan);
    dataKirim.append('sertifikat', fileSertifikat);

    try {
      const response = await fetch('https://skpi-stikomelrahma.my.id/backend/api/mahasiswa/tambah_skpi.php', {
        method: 'POST',
        body: dataKirim,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      const hasil = await response.json();
      if (hasil.status === 'sukses') {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: hasil.pesan,
          confirmButtonColor: '#2563eb'
        });
        // Reset Form
        setFormData({ id_master_kategori: '', kategori_utama: '', nama_kegiatan: '', tingkat: '', partisipasi: '', poin: 0, semester_ditempuh: 1, waktu_pelaksanaan: '' });
        setFileSertifikat(null);
        setPreviewUrl(null);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Menyimpan',
          text: hasil.pesan || 'Data tidak dapat disimpan. Silakan periksa kembali isian form Anda.',
          confirmButtonColor: '#ef4444'
        });
      }
    } catch (error) {
      console.error(error);
      let pesanError = 'Terjadi kesalahan tidak terduga pada server. Coba lagi beberapa saat.';
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          pesanError = 'Gagal terhubung ke server. Periksa koneksi internet Anda atau server sedang gangguan.';
      } else if (error.message.includes('JSON')) {
          pesanError = 'Respon server tidak valid. Mungkin ukuran file terlalu besar (batas server PHP) atau terjadi maintenance.';
      } else if (error.message.includes('HTTP Error: 413')) {
          pesanError = 'File sertifikat yang Anda unggah terlalu besar melebihi batas maksimal server.';
      } else if (error.message.includes('HTTP Error:')) {
          pesanError = 'Terjadi kesalahan saat mengunggah: ' + error.message;
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Gagal Upload/Koneksi',
        text: pesanError,
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  if (pengguna && pengguna.izin_akses_skpi == 0) {
    return (
      <div className="animate-in fade-in duration-500 pb-20">
        <div className="bg-red-50 p-6 md:p-10 rounded-3xl border border-red-200 flex flex-col items-center justify-center text-center mt-10 max-w-2xl mx-auto shadow-sm">
          <AlertTriangle size={64} className="text-red-500 mb-4 animate-bounce" />
          <h2 className="text-2xl md:text-3xl font-black text-red-700 mb-2 uppercase italic tracking-tight">Akses Terkunci</h2>
          <p className="text-red-600 mb-8 leading-relaxed">
            Status Anda saat ini adalah <strong>{pengguna.nama_status || 'Tidak Dikenal'}</strong>. Akun yang belum aktif atau sedang dalam masa cuti tidak diizinkan untuk menambah ajuan SKPI baru.
          </p>
          
          <div className="bg-white p-6 rounded-2xl w-full border border-gray-100 shadow-sm flex flex-col items-center">
            <h3 className="font-bold text-gray-800 mb-2">Butuh Bantuan?</h3>
            <p className="text-sm text-gray-500 mb-4">Jika Anda merasa status ini adalah sebuah kesalahan, atau Anda sudah menyelesaikan kewajiban administrasi, silakan hubungi admin akademik kami.</p>
            <a 
              href="https://wa.me/6281234567890?text=Halo%20Admin,%20saya%20ingin%20mengaktifkan%20kembali%20status%20SKPI%20saya" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors shadow-md hover:shadow-lg"
            >
              <MessageCircle size={18} /> Chat Admin via WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSimpan} className="animate-in fade-in duration-500 pb-20">
      {/* Header EDOM Style */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-gray-900">Input SKPI</span>
          </h2>
          <p className="text-sm font-medium text-gray-500 mt-1 flex items-center gap-1">
            Tambah Ajuan Sertifikat & Kegiatan
          </p>
        </div>
        
        {panduanFile && (
          <button 
            type="button" 
            onClick={() => setShowPanduan(true)} 
            className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-bold text-xs uppercase hover:bg-emerald-100 transition-colors border border-emerald-100 shadow-sm"
          >
            <FileText size={16} /> Lihat Panduan Bobot SKPI
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* KOLOM FORM (KIRI) */}
        <div className="lg:col-span-3">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-5">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Waktu Pelaksanaan</label>
                <input 
                  type="date"
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl font-medium text-sm outline-none focus:border-blue-600 transition-all"
                  value={formData.waktu_pelaksanaan || ''} 
                  onChange={(e) => setFormData({...formData, waktu_pelaksanaan: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Semester Ditempuh</label>
                <select 
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl font-medium text-sm outline-none focus:border-blue-600 transition-all"
                  value={formData.semester_ditempuh} 
                  onChange={(e) => setFormData({...formData, semester_ditempuh: parseInt(e.target.value)})}
                  required
                >
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Kategori Utama</label>
              <select className="w-full p-3 bg-white border border-gray-200 rounded-xl font-medium text-sm outline-none focus:border-blue-600 transition-all"
                value={formData.kategori_utama} onChange={(e) => setFormData({...formData, kategori_utama: e.target.value})}>
                <option value="">-- Pilih Kategori --</option>
                {opsiKategori.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Pilih Nama Kegiatan</label>
              <select className="w-full p-3 bg-white border border-gray-200 rounded-xl font-medium text-sm outline-none focus:border-blue-600 transition-all disabled:opacity-50 disabled:bg-gray-50"
                disabled={!formData.kategori_utama}
                value={formData.nama_kegiatan} onChange={(e) => setFormData({...formData, nama_kegiatan: e.target.value})}>
                <option value="">-- Pilih Kegiatan --</option>
                {opsiKegiatan.map(keg => <option key={keg} value={keg}>{keg}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Tingkat</label>
                <select className="w-full p-3 bg-white border border-gray-200 rounded-xl font-medium text-sm outline-none focus:border-blue-600 transition-all disabled:opacity-50 disabled:bg-gray-50"
                  disabled={!formData.nama_kegiatan}
                  value={formData.tingkat} onChange={(e) => setFormData({...formData, tingkat: e.target.value})}>
                  <option value="">-- Pilih Tingkat --</option>
                  {opsiTingkat.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Partisipasi</label>
                <select className="w-full p-3 bg-white border border-gray-200 rounded-xl font-medium text-sm outline-none focus:border-blue-600 transition-all disabled:opacity-50 disabled:bg-gray-50"
                  disabled={!formData.tingkat}
                  value={formData.partisipasi} onChange={(e) => setFormData({...formData, partisipasi: e.target.value})}>
                  <option value="">-- Pilih Partisipasi --</option>
                  {opsiPartisipasi.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center mt-6">
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase mb-0.5">Kredit yang didapat:</p>
                <p className="text-xs font-medium text-blue-600 italic">Terisi otomatis</p>
              </div>
              <div className="text-3xl font-bold text-blue-700">{formData.poin}</div>
            </div>
          </div>
        </div>

        {/* KOLOM PREVIEW (KANAN) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Preview Lampiran</h4>
            
            <div className="w-full aspect-[4/3] bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center relative overflow-hidden group transition-all hover:border-blue-400">
              {previewUrl ? (
                previewUrl === 'pdf_icon' ? (
                  <div className="flex flex-col items-center gap-3">
                    <FileText size={48} className="text-red-500" />
                    <span className="text-xs font-semibold text-gray-500 uppercase">PDF Terpilih</span>
                  </div>
                ) : (
                  <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                )
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <CloudUpload size={36} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                  <span className="text-xs font-medium text-gray-500 text-center px-4">
                    Pilih file sertifikat<br/>(JPG/PNG/PDF)<br/>
                    <span className="text-[10px] text-blue-500 font-bold mt-1 inline-block">* Maksimal 10 MB</span>
                  </span>
                </div>
              )}
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" />
            </div>

            {fileSertifikat && (
              <div className="mt-4 w-full flex items-center justify-between bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                <div className="flex items-center gap-2 overflow-hidden">
                  <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                  <p className="text-xs font-medium text-emerald-700 truncate">{fileSertifikat.name}</p>
                </div>
                <button type="button" onClick={(e) => {e.preventDefault(); setFileSertifikat(null); setPreviewUrl(null);}} className="text-red-400 hover:text-red-600 transition-colors ml-2">
                  <X size={16}/>
                </button>
              </div>
            )}
          </div>

          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-blue-900 shadow-sm relative overflow-hidden">
            <h5 className="font-semibold text-sm mb-2 flex items-center gap-2"><Info size={16} className="text-blue-600"/> Petunjuk</h5>
            <p className="text-xs leading-relaxed text-blue-800">
              Gunakan file asli hasil scan. Pastikan tulisan terbaca jelas agar admin mudah memvalidasi kredit Anda.
            </p>
          </div>

          {/* TOMBOL SUBMIT DI KANAN BAWAH */}
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold uppercase text-sm shadow-sm flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-all">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <CloudUpload size={18}/>}
            {loading ? 'Mengirim Data...' : 'Kirim Ajuan Sertifikat'}
          </button>
        </div>
      </div>
      {/* MODAL PANDUAN */}
      {showPanduan && panduanFile && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-4xl h-[90vh] flex flex-col rounded-2xl shadow-xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 bg-emerald-50 border-b border-emerald-100 flex justify-between items-center">
              <div className="flex items-center gap-3 text-emerald-800">
                <FileText size={20} />
                <h3 className="text-lg font-black uppercase italic">Panduan Bobot Kredit SKPI</h3>
              </div>
              <button onClick={() => setShowPanduan(false)} className="p-2 text-gray-400 hover:bg-white rounded-xl transition-colors hover:text-red-500"><X size={20}/></button>
            </div>
            <div className="flex-1 bg-gray-50 p-4 overflow-hidden relative">
              <iframe 
                src={`https://skpi-stikomelrahma.my.id/backend/unggahan/panduan_skpi/${panduanFile}`} 
                className="w-full h-full rounded-xl border border-gray-200 bg-white"
                title="Panduan SKPI"
              />
            </div>
          </div>
        </div>
      )}

    </form>
  );
};

export default InputSKPI;
