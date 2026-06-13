import React, { useEffect, useState, useCallback } from 'react';
import { 
  CheckCircle, Loader2, Search, Printer, UploadCloud, X, Download, Image as ImageIcon
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import ActionMenu from '../../components/ActionMenu';

const PermohonanCetak = () => {
  const [antrean, setAntrean] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pencarian, setPencarian] = useState("");
  const navigate = useNavigate();

  const [showUpload, setShowUpload] = useState(false);
  const [targetUpload, setTargetUpload] = useState(null);
  const [fileScan, setFileScan] = useState(null);

  const ambilData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('https://skpi-stikomelrahma.my.id/backend/api/admin/cetak_skpi.php?aksi=semua_admin');
      const hasil = await res.json();
      if (hasil.status === 'sukses') {
        setAntrean(hasil.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    ambilData();
  }, [ambilData]);

  const handleBukaUpload = (item) => {
    setTargetUpload(item);
    setFileScan(null);
    setShowUpload(true);
  };

  const handleDownloadFoto = async (fileName, nim) => {
    Swal.fire({ title: 'Mengunduh Foto...', didOpen: () => Swal.showLoading() });
    try {
      const response = await fetch(`https://skpi-stikomelrahma.my.id/backend/api/umum/proxy_gambar.php?file=foto_formal/${fileName}`);
      if (!response.ok) throw new Error('Gagal');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `FOTO_${nim}.jpg`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      Swal.close();
    } catch (error) {
      Swal.fire('Error', 'Foto tidak ditemukan atau gagal diunduh.', 'error');
    }
  };

  const handleDownloadFile = async (fileName, nim) => {
    Swal.fire({ title: 'Mengunduh Dokumen...', didOpen: () => Swal.showLoading() });
    try {
      const response = await fetch(`https://skpi-stikomelrahma.my.id/backend/unggahan/arsip_sertifikat/${fileName}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SKPI_RESMI_${nim}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      Swal.close();
    } catch (error) {
      Swal.fire('Error', 'Gagal mengunduh dokumen, file mungkin tidak ditemukan.', 'error');
    }
  };

  const handleKirimSKPI = async (e) => {
    e.preventDefault();
    if (!fileScan) {
      return Swal.fire('Peringatan', 'Silakan pilih file PDF scan terlebih dahulu!', 'warning');
    }

    Swal.fire({ title: 'Mengunggah Dokumen...', didOpen: () => Swal.showLoading() });
    
    const formData = new FormData();
    formData.append('aksi', 'upload_final');
    formData.append('id', targetUpload.id);
    formData.append('file_scan', fileScan);

    try {
      const res = await fetch('https://skpi-stikomelrahma.my.id/backend/api/admin/cetak_skpi.php', {
        method: 'POST',
        body: formData
      });
      const hasil = await res.json();
      
      if (hasil.status === 'sukses') {
        Swal.fire({
          title: 'Berhasil!',
          text: 'Klik OK untuk mengirim WhatsApp ke mahasiswa bahwa SKPI mereka sudah jadi.',
          icon: 'success'
        }).then(() => {
          setShowUpload(false);
          ambilData();
          
          // Asumsi nomor HP ada atau kita pakai dummy untuk simulasi
          const isUpdate = targetUpload.status === 'Selesai';
          const judulPesan = isUpdate ? 'DIPERBARUI' : 'SELESAI';
          const introPesan = isUpdate 
            ? 'Dokumen SKPI Resmi Anda baru saja diperbarui di dalam sistem.' 
            : 'Selamat! Dokumen SKPI Resmi Anda telah selesai divalidasi, ditandatangani, dan dicap oleh *Pimpinan STIKOM El Rahma*.';
          
          const pesanWA = `*DOKUMEN SKPI RESMI ${judulPesan}* 🎉\n\nHalo *${targetUpload.nama_lengkap}*,\n\n${introPesan}\n\nSilakan login ke sistem akademik untuk mengunduh _softfile_ (PDF) SKPI Anda. Dokumen fisik asli (_hardcopy_) dapat diambil di *Ruang Layanan Akademik* pada jam kerja.\n\nTerima kasih dan sukses selalu! ✨`;
          const urlWA = `https://api.whatsapp.com/send?text=${encodeURIComponent(pesanWA)}`;
          window.open(urlWA, '_blank');
        });
      } else {
        Swal.fire('Gagal', hasil.pesan, 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Terjadi kesalahan saat mengunggah', 'error');
    }
  };

  const dataFilter = Array.isArray(antrean) ? antrean.filter(item => 
    (item.nama_lengkap || "").toLowerCase().includes(pencarian.toLowerCase()) ||
    (item.nomor_induk || "").includes(pencarian)
  ) : [];

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      {/* Header EDOM Style */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-gray-900">Permohonan Cetak SKPI</span>
          </h2>
          <p className="text-sm font-medium text-gray-500 mt-1 flex items-center gap-1">
            Penerbitan Dokumen Resmi Final
          </p>
        </div>

        {/* Search */}
        <div className="relative flex-1 md:w-64 max-w-sm">
          <input 
            type="text" 
            placeholder="Cari Mahasiswa..." 
            className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 outline-none focus:border-blue-600 transition-all"
            value={pencarian}
            onChange={(e) => setPencarian(e.target.value)}
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>
      </div>

      {/* Tabel EDOM Style */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="border-b border-gray-100 text-gray-800 text-sm font-semibold">
              <tr>
                <th className="py-4 px-4 w-16 text-center">No</th>
                <th className="py-4 px-4">Mahasiswa</th>
                <th className="py-4 px-4">Waktu Pengajuan</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-4 text-center w-40">Aksi / Tindakan</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {loading ? (
                <tr><td colSpan="5" className="p-12 text-center text-gray-500 animate-pulse font-medium">Memuat data...</td></tr>
              ) : dataFilter.length > 0 ? (
                dataFilter.map((item, i) => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4 text-center font-medium text-gray-500">{i + 1}</td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-800">{item.nama_lengkap}</div>
                      <div className="text-gray-500 text-xs">{item.nomor_induk}</div>
                    </td>
                    <td className="py-4 px-4 font-medium text-gray-600">
                      {new Date(item.tanggal_pengajuan).toLocaleString('id-ID')}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold ${item.status === 'Selesai' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                        <div className="flex justify-center">
                          <ActionMenu>
                            {item.status !== 'Selesai' ? (
                              <>
                                <button onClick={() => navigate(`/cetak-draft/${item.nomor_induk}`)} className="flex items-center gap-2 text-blue-600">
                                  <Printer size={16} /> Cetak Draft
                                </button>
                                {item.foto_formal && (
                                  <button onClick={() => handleDownloadFoto(item.foto_formal, item.nomor_induk)} className="flex items-center gap-2 text-purple-600">
                                    <ImageIcon size={16} /> Download Foto
                                  </button>
                                )}
                                <button onClick={() => handleBukaUpload(item)} className="flex items-center gap-2 text-emerald-600">
                                  <UploadCloud size={16} /> Upload Scan Final
                                </button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => navigate(`/cetak-draft/${item.nomor_induk}`)} className="flex items-center gap-2 text-blue-600">
                                  <Printer size={16} /> Cetak Draft
                                </button>
                                {item.foto_formal && (
                                  <button onClick={() => handleDownloadFoto(item.foto_formal, item.nomor_induk)} className="flex items-center gap-2 text-purple-600">
                                    <ImageIcon size={16} /> Download Foto
                                  </button>
                                )}
                                {item.file_scan_skpi && (
                                  <button onClick={() => handleDownloadFile(item.file_scan_skpi, item.nomor_induk)} className="flex items-center gap-2 text-sky-600">
                                    <Download size={16} /> Download Asli
                                  </button>
                                )}
                                <button onClick={() => handleBukaUpload(item)} className="flex items-center gap-2 text-emerald-600">
                                  <UploadCloud size={16} /> Upload Ulang Scan
                                </button>
                              </>
                            )}
                          </ActionMenu>
                        </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-400 font-medium italic">
                    Belum ada permohonan cetak SKPI.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL UPLOAD FINAL */}
      {showUpload && targetUpload && (
        <div className="fixed inset-0 bg-blue-950/40 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 bg-emerald-50 border-b flex justify-between items-center text-emerald-900">
              <div className="flex items-center gap-3">
                <UploadCloud size={20} />
                <h3 className="text-xl font-black uppercase italic tracking-tighter">
                  {targetUpload.status === 'Selesai' ? 'Ganti SKPI Final' : 'Upload SKPI Final'}
                </h3>
              </div>
              <button onClick={() => setShowUpload(false)} className="p-2 bg-white text-gray-400 rounded-xl hover:text-red-500"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleKirimSKPI} className="p-8 space-y-6">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Mahasiswa Tujuan</p>
                <p className="font-black text-blue-950 uppercase">{targetUpload.nama_lengkap}</p>
                <p className="text-[10px] font-bold text-gray-500">{targetUpload.nomor_induk}</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pilih File Scan (PDF Bercap & TTD)</label>
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={(e) => setFileScan(e.target.files[0])}
                  className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-xs"
                  required
                />
              </div>

              <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-3xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all">
                Kirim & Selesaikan
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PermohonanCetak;
