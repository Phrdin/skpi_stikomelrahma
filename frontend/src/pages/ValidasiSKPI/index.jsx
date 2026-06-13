import React, { useEffect, useState, useCallback } from 'react';
import { 
  CheckCircle, XCircle, Eye, Loader2, AlertCircle, 
  User, RefreshCcw, Search, FileText, X, Filter 
} from 'lucide-react';
import Swal from 'sweetalert2';
import ActionMenu from '../../components/ActionMenu';

const ValidasiSKPI = () => {
  const [antrean, setAntrean] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pencarian, setPencarian] = useState("");
  
  const [showDetail, setShowDetail] = useState(false);
  const [showBerkas, setShowBerkas] = useState(false);
  const [targetItem, setTargetItem] = useState(null);

  // 1. Fungsi Ambil Data (GET)
  const ambilAntrean = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('https://skpi-stikomelrahma.my.id/backend/api/admin/ambil_semua_ajuan.php');
      const hasil = await res.json();
      if (hasil.status === 'sukses') {
        setAntrean(hasil.data || []);
      } else {
        setAntrean([]);
      }
    } catch (err) {
      console.error("Koneksi gagal:", err);
      setAntrean([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    ambilAntrean();
  }, [ambilAntrean]);

  // 2. Fungsi Validasi (POST)
  const tanganiValidasi = async (id, aksi) => {
    let alasan = "";
    
    if (aksi === 'Ditolak' || aksi === 'Revisi') {
      const { value: text, isConfirmed } = await Swal.fire({
        title: aksi === 'Revisi' ? 'Catatan Revisi' : 'Alasan Penolakan',
        input: 'textarea',
        inputPlaceholder: aksi === 'Revisi' ? 'Contoh: Sertifikat kurang jelas, mohon upload ulang...' : 'Contoh: Kegiatan tidak sesuai dengan panduan...',
        showCancelButton: true,
        confirmButtonColor: aksi === 'Revisi' ? '#f59e0b' : '#ef4444',
        inputValidator: (value) => { if (!value) return 'Catatan/Alasan wajib diisi!' }
      });
      if (!isConfirmed) return;
      alasan = text;
    } else {
      const confirm = await Swal.fire({
        title: 'Setujui Berkas?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10b981'
      });
      if (!confirm.isConfirmed) return;
    }

    Swal.fire({ title: 'Memproses...', didOpen: () => Swal.showLoading() });

    try {
      const res = await fetch('https://skpi-stikomelrahma.my.id/backend/api/admin/ambil_semua_ajuan.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: id, 
          status: aksi, 
          alasan: alasan 
        })
      });
      
      const hasil = await res.json();
      if (hasil.status === 'sukses') {
        Swal.fire('Berhasil!', hasil.pesan, 'success');
        ambilAntrean();
        setShowDetail(false); // Tutup detail jika sedang dibuka
      } else {
        Swal.fire('Gagal', hasil.pesan, 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Gagal memproses data.', 'error');
    }
  };

  const dataFilter = Array.isArray(antrean) ? antrean.filter(item => 
    (item.nama_lengkap || "").toLowerCase().includes(pencarian.toLowerCase()) ||
    (item.nomor_induk || "").includes(pencarian)
  ) : [];

  if (loading && antrean.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-blue-600">
        <Loader2 size={40} className="animate-spin mb-4" />
        <p className="font-semibold text-gray-500">Menghubungkan ke Database...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      {/* Header EDOM Style */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-gray-900">Validasi SKPI</span>
          </h2>
          <p className="text-sm font-medium text-gray-500 mt-1 flex items-center gap-1">
            <span className="text-gray-400"><Filter size={14}/></span>
            Manajemen / Tinjau Pengajuan Kegiatan
          </p>
        </div>

        {/* Toolbar Filter EDOM Style */}
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-64">
            <input 
              type="text" 
              placeholder="Cari nama atau kegiatan..." 
              className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 outline-none focus:border-blue-600 transition-all"
              value={pencarian}
              onChange={(e) => setPencarian(e.target.value)}
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
          <button onClick={ambilAntrean} className="flex items-center justify-center bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-gray-600 shadow-sm hover:bg-gray-50 transition-all">
            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Tabel Validasi EDOM Style */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="border-b border-gray-100 text-gray-800 text-sm font-semibold">
              <tr>
                <th className="py-4 px-4 text-center w-16">No</th>
                <th className="py-4 px-4">Pengaju</th>
                <th className="py-4 px-4">Informasi Kegiatan</th>
                <th className="py-4 px-4 text-center">Poin</th>
                <th className="py-4 px-4 text-center w-48">Aksi & Validasi</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {dataFilter.length > 0 ? (
                dataFilter.map((item, i) => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4 text-center font-medium text-gray-500">{i + 1}</td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-800">{item.nama_lengkap}</div>
                      <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-0.5">
                        <User size={12} className="text-gray-400" />
                        {item.nomor_induk}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-medium text-gray-700 leading-tight">{item.judul_kegiatan}</p>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center justify-center bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold border border-blue-100">
                        {item.poin} Poin
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center">
                        <ActionMenu>
                          <button onClick={() => {setTargetItem(item); setShowBerkas(true);}} className="flex items-center gap-2 text-sky-600">
                            <Eye size={16} /> Pratinjau Berkas
                          </button>
                          <button onClick={() => {setTargetItem(item); setShowDetail(true);}} className="flex items-center gap-2 text-gray-600">
                            <FileText size={16} /> Lihat Detail
                          </button>
                          <button onClick={() => tanganiValidasi(item.id, 'Disetujui')} className="flex items-center gap-2 text-emerald-600">
                            <CheckCircle size={16} /> Setujui Pengajuan
                          </button>
                          <button onClick={() => tanganiValidasi(item.id, 'Revisi')} className="flex items-center gap-2 text-amber-600">
                            <AlertCircle size={16} /> Minta Revisi
                          </button>
                          <button onClick={() => tanganiValidasi(item.id, 'Ditolak')} className="flex items-center gap-2 text-red-600">
                            <XCircle size={16} /> Tolak Pengajuan
                          </button>
                        </ActionMenu>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-medium">
                    <AlertCircle size={40} className="mx-auto mb-3 opacity-30" />
                    Antrean Validasi Kosong
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL BERKAS */}
      {showBerkas && targetItem && (
        <div className="fixed inset-0 bg-blue-950/40 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-4xl h-[90vh] flex flex-col rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 bg-gray-50 border-b flex justify-between items-center">
              <h3 className="text-lg font-black text-blue-950 uppercase italic tracking-tighter">Pratinjau Berkas</h3>
              <button onClick={() => setShowBerkas(false)} className="p-2 bg-white text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors"><X size={20}/></button>
            </div>
            <div className="flex-1 bg-gray-100 p-4 overflow-hidden relative">
               {targetItem.file_bukti.toLowerCase().endsWith('.pdf') ? (
                 <iframe 
                   src={`https://skpi-stikomelrahma.my.id/backend/unggahan/arsip_sertifikat/${targetItem.file_bukti}`} 
                   className="w-full h-full rounded-2xl border-none"
                   title="PDF Preview"
                 />
               ) : (
                 <img 
                   src={`https://skpi-stikomelrahma.my.id/backend/unggahan/arsip_sertifikat/${targetItem.file_bukti}`} 
                   alt="Berkas Sertifikat" 
                   className="w-full h-full object-contain rounded-2xl"
                 />
               )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETAIL */}
      {showDetail && targetItem && (
        <div className="fixed inset-0 bg-blue-950/40 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Detail Pengajuan</h3>
              <button onClick={() => setShowDetail(false)} className="p-2 bg-white text-gray-400 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"><X size={20}/></button>
            </div>
            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-6">
                  <InfoItem label="Nama Kegiatan" nilai={targetItem.judul_kegiatan} />
                  <InfoItem label="Kategori Utama" nilai={targetItem.kategori_utama || '-'} />
                  <InfoItem label="Tingkat" nilai={targetItem.tingkat || '-'} />
                  <InfoItem label="Peran / Partisipasi" nilai={targetItem.partisipasi || '-'} />
                  <InfoItem label="Waktu Pelaksanaan" nilai={targetItem.waktu_pelaksanaan || '-'} />
               </div>
               <div className="space-y-6 flex flex-col justify-between">
                  <div className="p-5 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Bobot Poin</p>
                    <p className="text-3xl font-bold text-blue-700">{targetItem.poin} PTS</p>
                  </div>
                  
                  <div className="p-5 border border-gray-200 rounded-xl bg-gray-50">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Pengaju</p>
                    <p className="text-sm font-bold text-gray-900 mb-1">{targetItem.nama_lengkap}</p>
                    <p className="text-xs text-gray-500">{targetItem.nomor_induk}</p>
                  </div>
                  
                  {/* Aksi Cepat di Dalam Detail */}
                  <div className="grid grid-cols-2 gap-3 pt-4">
                     <button onClick={() => tanganiValidasi(targetItem.id, 'Disetujui')} className="bg-emerald-50 text-emerald-700 border border-emerald-200 p-2.5 rounded-lg font-semibold text-sm shadow-sm hover:bg-emerald-100 transition-all flex items-center justify-center gap-2">
                       <CheckCircle size={16}/> Setuju
                     </button>
                     <button onClick={() => tanganiValidasi(targetItem.id, 'Revisi')} className="bg-amber-50 text-amber-700 border border-amber-200 p-2.5 rounded-lg font-semibold text-sm shadow-sm hover:bg-amber-100 transition-all flex items-center justify-center gap-2">
                       <AlertCircle size={16}/> Revisi
                     </button>
                     <button onClick={() => tanganiValidasi(targetItem.id, 'Ditolak')} className="col-span-2 bg-red-50 text-red-700 border border-red-200 p-2.5 rounded-lg font-semibold text-sm shadow-sm hover:bg-red-100 transition-all flex items-center justify-center gap-2">
                       <XCircle size={16}/> Tolak Pengajuan
                     </button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const InfoItem = ({ label, nilai }) => (
  <div className="space-y-1">
    <p className="text-xs font-semibold text-gray-500 uppercase">{label}</p>
    <p className="text-sm font-medium text-gray-900 leading-tight">{nilai}</p>
  </div>
);

export default ValidasiSKPI;
