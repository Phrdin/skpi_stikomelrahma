import React, { useEffect, useState, useContext, useRef } from 'react';
import { KonteksPengguna } from '../../context/InfoPengguna';
import { Download, Loader2, AlertTriangle, CheckCircle, FileText, Printer, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const SKPIResmi = () => {
  const { pengguna } = useContext(KonteksPengguna);
  const navigate = useNavigate();
  const [dataSKPI, setDataSKPI] = useState(null);
  const [statusCetak, setStatusCetak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scale, setScale] = useState(1);
  
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 850) {
        setScale((w - 40) / 794);
      } else {
        setScale(1);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const targetPdfRef = useRef();

  // Helper untuk membaca koordinat dari pengaturan (database)
  const getPos = (key, defaultPos) => {
    try {
      if (dataSKPI?.pengaturan?.[key]) {
        const dbPos = JSON.parse(dataSKPI.pengaturan[key]);
        return { 
          ...defaultPos, 
          ...dbPos,
          top: dbPos.top !== undefined ? dbPos.top + 'px' : defaultPos.top + 'px',
          left: dbPos.left !== undefined ? dbPos.left + 'px' : defaultPos.left + 'px',
          width: dbPos.width !== undefined ? dbPos.width + 'px' : defaultPos.width ? defaultPos.width + 'px' : 'auto',
          height: dbPos.height !== undefined ? dbPos.height + 'px' : defaultPos.height ? defaultPos.height + 'px' : 'auto',
          fontSize: dbPos.fontSize ? dbPos.fontSize + 'px' : '15px',
          color: dbPos.color || '#111827',
          fontFamily: dbPos.fontFamily || 'inherit',
          textAlign: dbPos.textAlign || 'left',
          fontWeight: dbPos.fontWeight || 'bold',
        };
      }
    } catch (e) {
      console.error("Gagal parse koordinat:", key);
    }
    
    return {
      ...defaultPos,
      top: defaultPos.top + 'px',
      left: defaultPos.left + 'px',
      width: defaultPos.width ? defaultPos.width + 'px' : 'auto',
      height: defaultPos.height ? defaultPos.height + 'px' : 'auto',
      fontSize: '15px',
      color: '#111827',
      fontWeight: 'bold',
      textAlign: 'left'
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!pengguna?.nomor_induk) return;
      
      const searchParams = new URLSearchParams(window.location.search);
      const isPreview = searchParams.get('preview') === 'true';
      
      setLoading(true);
      try {
        const token = sessionStorage.getItem('token');
        let url = `https://skpi-stikomelrahma.my.id/backend/api/mahasiswa/ambil_skpi_resmi.php?nim=${pengguna.nomor_induk}`;
        if (isPreview) url += '&preview=true';
        
        const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        const hasil = await res.json();
        
        if (hasil.status === 'sukses') {
          setDataSKPI(hasil.data);
          
          if (hasil.data.total_poin < 250) {
            Swal.fire({
              icon: 'error',
              title: 'Akses Ditolak',
              text: 'Kredit SKPI Anda belum mencapai 250. Silakan kumpulkan lebih banyak kredit.'
            }).then(() => { navigate('/beranda'); });
            return;
          }

          // Cek Status Pengajuan Cetak
          const resCetak = await fetch(`https://skpi-stikomelrahma.my.id/backend/api/admin/cetak_skpi.php?nim=${pengguna.nomor_induk}`);
          const hasilCetak = await resCetak.json();
          if (hasilCetak.status === 'sukses') {
            setStatusCetak(hasilCetak.data);
          }

        } else {
           Swal.fire('Error', hasil.pesan || 'Gagal memuat data SKPI', 'error');
           navigate('/beranda');
        }
      } catch (err) {
        Swal.fire('Error', 'Terjadi kesalahan koneksi', 'error');
        navigate('/beranda');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [pengguna, navigate]);

  const handleAjukanCetak = async () => {
    Swal.fire({
      title: 'Konfirmasi Cetak SKPI',
      text: 'Kredit Anda sudah mencukupi! Sistem akan mengajukan pencetakan dokumen SKPI Resmi ke Layanan Akademik untuk divalidasi dan ditandatangani. Lanjutkan?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Ajukan Cetak!',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#2563eb'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsProcessing(true);
        try {
          const res = await fetch('https://skpi-stikomelrahma.my.id/backend/api/admin/cetak_skpi.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aksi: 'ajukan', nim: pengguna.nomor_induk })
          });
          const hasil = await res.json();
          if (hasil.status === 'sukses') {
            Swal.fire({
              title: 'Berhasil Diajukan!',
              text: 'Klik OK untuk memberitahu Admin Akademik melalui WhatsApp.',
              icon: 'success',
              confirmButtonColor: '#10b981'
            }).then(() => {
              const pesanWA = `*PERMOHONAN CETAK SKPI RESMI* 🎓\n\nHalo *Admin Layanan Akademik*,\n\nMahasiswa berikut telah memenuhi syarat Kredit SKPI dan memohon pencetakan dokumen resmi:\n• Nama: *${pengguna.nama_lengkap}*\n• NIM: *${pengguna.nomor_induk}*\n• Total Kredit: *${dataSKPI.total_poin} Kredit*\n\nMohon segera diproses dan divalidasi.\nTerima kasih! 🙏`;
              const urlWA = `https://api.whatsapp.com/send?phone=6287864183121&text=${encodeURIComponent(pesanWA)}`;
              window.open(urlWA, '_blank');
              window.location.reload();
            });
          } else {
            Swal.fire('Gagal', hasil.pesan, 'error');
          }
        } catch (err) {
          Swal.fire('Error', 'Terjadi kesalahan sistem', 'error');
        } finally {
          setIsProcessing(false);
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 size={36} className="animate-spin text-blue-600 mb-4" />
        <p className="font-semibold text-xs text-gray-500 uppercase tracking-widest">Menyiapkan Data SKPI...</p>
      </div>
    );
  }

  if (!dataSKPI) return null;

  return (
    <div className="animate-in fade-in duration-500 pb-20 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors font-bold text-xs uppercase tracking-widest mb-4">
            <ArrowLeft size={16} /> Kembali
          </button>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-gray-900">Penerbitan SKPI</span>
          </h2>
          <p className="text-sm font-medium text-emerald-600 mt-1 flex items-center gap-1.5">
             <CheckCircle size={16} className="text-emerald-500"/> Syarat 250 Kredit Terpenuhi
          </p>
        </div>
        
        {/* LOGIKA TOMBOL STATUS CETAK */}
        {statusCetak?.status === 'Selesai' ? (
          <a 
            href={`https://skpi-stikomelrahma.my.id/backend/unggahan/arsip_sertifikat/${statusCetak.file_scan_skpi}`} 
            target="_blank" rel="noreferrer"
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-emerald-700 transition-all"
          >
            <Download size={18} /> Download SKPI Resmi
          </a>
        ) : statusCetak?.status === 'Diproses Admin' ? (
          <button disabled className="bg-amber-500 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm opacity-90 cursor-not-allowed">
            <Loader2 size={18} className="animate-spin" /> Sedang Diproses Admin
          </button>
        ) : (
          <button 
            onClick={handleAjukanCetak}
            disabled={isProcessing}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
            {isProcessing ? 'Memproses...' : 'Ajukan Cetak SKPI'}
          </button>
        )}
      </div>

      {statusCetak?.status === 'Selesai' ? (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex gap-3 mb-8 items-start shadow-sm">
          <CheckCircle className="text-emerald-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-emerald-800 font-bold text-sm mb-1">SKPI Resmi Telah Terbit</h4>
            <p className="text-emerald-700 text-xs font-medium leading-relaxed">
              Dokumen SKPI Anda telah selesai divalidasi, ditandatangani, dan dicap oleh Pimpinan. Silakan unduh softcopy-nya menggunakan tombol di atas. Dokumen fisik (hardcopy) asli dapat diambil di Ruang Layanan Akademik.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 mb-8 items-start">
          <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-amber-800 font-bold text-sm mb-1">Peringatan Penting</h4>
            <p className="text-amber-700 text-xs font-medium leading-relaxed">
              Dokumen di bawah ini adalah pratinjau (preview) draft sistem. Dokumen resmi harus ditandatangani oleh pimpinan kampus dan memiliki stempel basah.
            </p>
          </div>
        </div>
      )}

      {/* KONTAINER UNTUK RENDER PDF */}
      <div className="flex flex-col items-center gap-8 bg-gray-50 border border-gray-200 p-8 rounded-2xl overflow-x-auto relative opacity-80 hover:opacity-100 transition-opacity" ref={targetPdfRef}>
        
        {/* ======================= HALAMAN 1 : BIODATA ======================= */}
        <div className="pdf-page bg-white shadow-2xl relative shrink-0 overflow-hidden" style={{ width: '794px', height: '1123px', transform: `scale(${scale})`, transformOrigin: 'top center', marginBottom: `-${1123 * (1 - scale)}px` }}>
          {/* Background Template Akang */}
          <img src={dataSKPI.pengaturan?.skpi_background1_image ? `https://skpi-stikomelrahma.my.id/backend/api/umum/proxy_gambar.php?file=template_skpi/${dataSKPI.pengaturan.skpi_background1_image}` : "/bg_skpi_1.jpg"} alt="Background SKPI 1" className="absolute inset-0 w-full h-full object-cover z-0" crossOrigin="anonymous" />
          
          {/* Layer Text Dinamis */}
          <div className="absolute inset-0 z-10">
            
            {/* Nomor Surat (Tepat di dalam kotak biru atas) */}
            <div className="absolute" style={getPos('skpi_pos_nomor', { top: 125, left: 470 })}>
               <p className="text-white font-bold text-sm tracking-widest">
                 {dataSKPI.biodata.nomor_induk}/SKPI-ER/{new Date().getFullYear()}
               </p>
            </div>

            {/* Area Identitas Diri (Absolute Position) */}
            <div className="absolute inset-0">
               
               {/* KOTAK FOTO KIRI */}
               <div className="absolute" style={getPos('skpi_pos_foto', { top: 375, left: 90, width: 120, height: 180 })}>
                  {dataSKPI.biodata.foto_formal ? (
                    <img 
                      src={`https://skpi-stikomelrahma.my.id/backend/api/umum/proxy_gambar.php?file=foto_formal/${dataSKPI.biodata.foto_formal}`} 
                      crossOrigin="anonymous"
                      alt="Foto Mahasiswa" 
                      className="w-full h-full object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs font-bold uppercase rounded-md border-2 border-dashed border-gray-300">
                      Tanpa Foto
                    </div>
                  )}
               </div>

               {/* KOLOM NAMA */}
               <div className="absolute" style={getPos('skpi_pos_nama', { top: 380, left: 280 })}>
                  <p className="uppercase whitespace-nowrap">{dataSKPI.biodata.nama_lengkap}</p>
               </div>

               {/* KOLOM NIM */}
               <div className="absolute" style={getPos('skpi_pos_nim', { top: 380, left: 530 })}>
                  <p className="uppercase">{dataSKPI.biodata.nomor_induk}</p>
               </div>

               {/* KOLOM TEMPAT, TANGGAL LAHIR */}
               <div className="absolute" style={getPos('skpi_pos_ttl', { top: 435, left: 280 })}>
                  <p className="uppercase whitespace-nowrap">{dataSKPI.biodata.tempat_lahir}, {dataSKPI.biodata.tanggal_lahir}</p>
               </div>

               {/* KOLOM PRODI */}
               <div className="absolute" style={getPos('skpi_pos_prodi', { top: 435, left: 530 })}>
                  <p className="uppercase">{dataSKPI.biodata.program_studi || 'Informatika'}</p>
               </div>

               {/* KOLOM GELAR */}
               <div className="absolute" style={getPos('skpi_pos_gelar', { top: 490, left: 280 })}>
                  <p className="uppercase">{dataSKPI.biodata.gelar || 'S.KOM'}</p>
               </div>

               {/* KOLOM TAHUN LULUS */}
               <div className="absolute" style={getPos('skpi_pos_lulus', { top: 490, left: 530 })}>
                  <p className="uppercase">{dataSKPI.biodata.tahun_lulus || '-'}</p>
               </div>

            </div>

          </div>
        </div>

        {/* ======================= HALAMAN 2 & SETERUSNYA : TRANSKRIP KEGIATAN ======================= */}
        {(() => {
          const ITEMS_PER_PAGE = 10; 
          const chunks = [];
          
          if (!dataSKPI.kegiatan || dataSKPI.kegiatan.length === 0) {
            chunks.push([]);
          } else {
            for (let i = 0; i < dataSKPI.kegiatan.length; i += ITEMS_PER_PAGE) {
              chunks.push(dataSKPI.kegiatan.slice(i, i + ITEMS_PER_PAGE));
            }
          }

          let globalItemIndex = 0;

          return chunks.map((chunk, pageIndex) => {
            const isLastPage = pageIndex === chunks.length - 1;

            return (
              <div key={`page-2-${pageIndex}`} className="pdf-page bg-white shadow-2xl relative shrink-0 overflow-hidden" style={{ width: '794px', height: '1123px', transform: `scale(${scale})`, transformOrigin: 'top center', marginBottom: `-${1123 * (1 - scale)}px` }}>
                {/* Background Template */}
                <img src={dataSKPI.pengaturan?.skpi_background2_image ? `https://skpi-stikomelrahma.my.id/backend/api/umum/proxy_gambar.php?file=template_skpi/${dataSKPI.pengaturan.skpi_background2_image}` : "/bg_skpi_2.jpg"} alt={`Background SKPI 2 Page ${pageIndex+1}`} className="absolute inset-0 w-full h-full object-cover z-0" crossOrigin="anonymous" />
                
                {/* Layer Text Dinamis */}
                <div className="absolute inset-0 z-10">
                  
                  {/* Nomor Surat */}
                  <div className="absolute" style={getPos('skpi_pos_nomor', { top: 125, left: 470 })}>
                     <p className="text-white font-bold text-sm tracking-widest">
                       {dataSKPI.biodata.nomor_induk}/SKPI-ER/{new Date().getFullYear()}
                     </p>
                  </div>

                  {/* TABEL KEGIATAN MAHASISWA & TTD */}
                  <div className="absolute w-[694px]" style={getPos('skpi_pos_tabel', { top: 235, left: 50 })}>
                    <table className="w-full text-left border-collapse">
                      <thead className="invisible">
                        <tr>
                          <th style={{ width: '50px' }}>No</th>
                          <th>Nama Kegiatan</th>
                          <th style={{ width: '130px' }}>Tingkat</th>
                          <th style={{ width: '120px' }}>Partisipasi</th>
                          <th style={{ width: '130px' }}>Waktu Pelaksanaan</th>
                          <th style={{ width: '60px' }}>Kredit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chunk.length > 0 ? (
                          chunk.map((item, idx) => {
                            globalItemIndex++;
                            return (
                              <tr key={idx} className="border-b border-gray-300/50 text-[13px]">
                                <td className="py-1.5 text-center text-gray-800 font-medium">{globalItemIndex}</td>
                                <td className="py-1.5 text-gray-900 font-bold pr-4">{item.judul_kegiatan}</td>
                                <td className="py-1.5 text-gray-700 text-center">{item.tingkat}</td>
                                <td className="py-1.5 text-gray-700 text-center">{item.partisipasi}</td>
                                <td className="py-1.5 text-gray-700 text-center">{item.waktu_pelaksanaan || '-'}</td>
                                <td className="py-1.5 text-center font-black text-blue-900">{item.poin}</td>
                              </tr>
                            );
                          })
                        ) : (
                            <tr>
                              <td colSpan="6" className="p-8 text-center text-gray-500 font-bold uppercase italic">
                                Belum ada riwayat kegiatan yang disetujui.
                              </td>
                            </tr>
                          )
                        }
                        
                        {/* BARIS TOTAL POIN HANYA DI HALAMAN TERAKHIR / HALAMAN TTD */}
                        {isLastPage && dataSKPI.kegiatan.length > 0 && (
                          <tr className="bg-gray-50/80">
                            <td colSpan="5" className="py-2.5 pr-6 text-right font-black uppercase text-sm text-blue-950">
                              Total Kredit SKPI Terkumpul
                            </td>
                            <td className="py-2.5 text-center font-black text-lg text-blue-900" style={{ width: '60px' }}>
                              {dataSKPI.total_poin}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                    {/* TANDA TANGAN OTOMATIS */}
                    {isLastPage && (
                      <div className="flex justify-end mt-6">
                        <div className="text-center w-64">
                          <p className="text-[12px] font-bold text-gray-800 mb-1">Sukabumi, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          <p className="text-[12px] font-bold text-gray-800 mb-1">Wakil Ketua I,</p>
                          
                          <div className="h-20 w-full flex items-center justify-center my-2 relative">
                            {dataSKPI.pengaturan?.skpi_ttd_pejabat ? (
                              <img 
                                src={`https://skpi-stikomelrahma.my.id/backend/api/umum/proxy_gambar.php?file=tanda_tangan/${dataSKPI.pengaturan.skpi_ttd_pejabat}`} 
                                alt="Tanda Tangan" 
                                className="max-h-full max-w-full object-contain mix-blend-multiply"
                                crossOrigin="anonymous"
                              />
                            ) : (
                              <div className="text-gray-300 font-bold text-xs border-2 border-dashed border-gray-200 w-full h-full flex items-center justify-center uppercase">TTD KOSONG</div>
                            )}
                          </div>
                          
                          <p className="text-[13px] font-bold text-gray-900 uppercase underline whitespace-nowrap">{dataSKPI.pengaturan?.skpi_nama_pejabat || '[NAMA PEJABAT]'}</p>
                          <p className="text-[11px] font-bold text-gray-900 uppercase whitespace-nowrap">NIDN/NIP: {dataSKPI.pengaturan?.skpi_nidn_pejabat || '-'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          });
        })()}

      </div>
    </div>
  );
};

export default SKPIResmi;
