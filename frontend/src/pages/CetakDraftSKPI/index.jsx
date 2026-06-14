import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Loader2, ArrowLeft, Printer } from 'lucide-react';
import Swal from 'sweetalert2';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const CetakDraftSKPI = () => {
  const { nim } = useParams();
  const navigate = useNavigate();
  const [dataSKPI, setDataSKPI] = useState(null);
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
      setLoading(true);
      try {
        const token = sessionStorage.getItem('token');
        const res = await fetch(`https://skpi-stikomelrahma.my.id/backend/api/mahasiswa/ambil_skpi_resmi.php?nim=${nim}&preview=true`, { 
          headers: { 'Authorization': `Bearer ${token}` } 
        });
        const hasil = await res.json();
        
        if (hasil.status === 'sukses') {
          setDataSKPI(hasil.data);
        } else {
           Swal.fire('Error', hasil.pesan || 'Gagal memuat data SKPI Mahasiswa', 'error');
           navigate('/permohonan-cetak');
        }
      } catch (err) {
        Swal.fire('Error', 'Terjadi kesalahan koneksi', 'error');
        navigate('/permohonan-cetak');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [nim, navigate]);

  const handleDownloadPDF = async () => {
    if (!targetPdfRef.current) return;
    setIsProcessing(true);
    
    Swal.fire({
      title: 'Menyiapkan Draft SKPI',
      text: 'Mohon tunggu, sedang merender dokumen multi-halaman untuk dicetak fisik...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const pages = targetPdfRef.current.querySelectorAll('.pdf-page');
      const pdf = new jsPDF('p', 'mm', 'a4'); 

      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], {
          scale: 3,
          useCORS: true,
          logging: false
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        if (i > 0) {
          pdf.addPage(); 
        }
        
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      }

      // Auto trigger print dialog using jsPDF's autoPrint
      pdf.autoPrint();
      
      // Save for backup or open in new tab
      window.open(pdf.output('bloburl'), '_blank');
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Dokumen Draft SKPI siap dicetak.',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Terjadi kesalahan saat merender PDF.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
        <p className="font-black text-[10px] text-gray-400 uppercase tracking-widest">Menyiapkan Data SKPI Mahasiswa...</p>
      </div>
    );
  }

  if (!dataSKPI) return null;

  return (
    <div className="animate-in fade-in duration-700 pb-20 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors font-bold text-[11px] uppercase tracking-widest mb-6">
            <ArrowLeft size={16} /> Kembali ke Permohonan
          </button>
          <h2 className="text-3xl md:text-5xl font-black text-blue-950 uppercase italic tracking-tighter leading-none">Draft SKPI Resmi</h2>
          <div className="h-1.5 w-20 bg-blue-600 mt-4 rounded-full shadow-lg"></div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mt-4 flex items-center gap-2">
             Milik Mahasiswa: {dataSKPI.biodata.nama_lengkap} ({nim})
          </p>
        </div>
        
        <button 
          onClick={handleDownloadPDF}
          disabled={isProcessing}
          className="bg-blue-600 text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
          {isProcessing ? 'Mempersiapkan Print...' : 'Cetak Dokumen Fisik'}
        </button>
      </div>

      {/* KONTAINER UNTUK RENDER PDF */}
      <div className="flex flex-col items-start lg:items-center gap-12 bg-gray-100 p-4 md:p-8 rounded-3xl overflow-x-auto relative max-w-full" ref={targetPdfRef}>
        
        <div className="pdf-page bg-white shadow-2xl relative shrink-0 overflow-hidden" style={{ width: '794px', height: '1123px', transform: `scale(${scale})`, transformOrigin: 'top center', marginBottom: `-${1123 * (1 - scale)}px` }}>
          <img src={dataSKPI.pengaturan?.skpi_background1_image ? `https://skpi-stikomelrahma.my.id/backend/api/umum/proxy_gambar.php?file=template_skpi/${dataSKPI.pengaturan.skpi_background1_image}` : "/bg_skpi_1.jpg"} alt="Background SKPI 1" className="absolute inset-0 w-full h-full object-cover z-0" crossOrigin="anonymous" />
          <div className="absolute inset-0 z-10">
            <div className="absolute" style={getPos('skpi_pos_nomor', { top: 125, left: 470 })}>
               <p className="text-white font-bold text-sm tracking-widest">
                 {dataSKPI.biodata.nomor_induk}/SKPI-ER/{new Date().getFullYear()}
               </p>
            </div>
            <div className="absolute inset-0">
               <div className="absolute" style={getPos('skpi_pos_foto', { top: 375, left: 90, width: 120, height: 180 })}>
                  {dataSKPI.biodata.foto_formal ? (
                    <img 
                      src={`https://skpi-stikomelrahma.my.id/backend/api/umum/proxy_gambar.php?file=foto_formal/${dataSKPI.biodata.foto_formal}`} 
                      crossOrigin="anonymous" alt="Foto Mahasiswa" className="w-full h-full object-cover rounded-md"
                      data-html2canvas-ignore="true"
                    />
                  ) : (
                    <div data-html2canvas-ignore="true" className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs font-bold uppercase rounded-md border-2 border-dashed border-gray-300">
                      Tanpa Foto
                    </div>
                  )}
               </div>
               <div className="absolute" style={getPos('skpi_pos_nama', { top: 380, left: 280 })}>
                  <p className="uppercase whitespace-nowrap">{dataSKPI.biodata.nama_lengkap}</p>
               </div>
               <div className="absolute" style={getPos('skpi_pos_nim', { top: 380, left: 530 })}>
                  <p className="uppercase">{dataSKPI.biodata.nomor_induk}</p>
               </div>
               <div className="absolute" style={getPos('skpi_pos_ttl', { top: 435, left: 280 })}>
                  <p className="uppercase whitespace-nowrap">{dataSKPI.biodata.tempat_lahir}, {dataSKPI.biodata.tanggal_lahir}</p>
               </div>
               <div className="absolute" style={getPos('skpi_pos_prodi', { top: 435, left: 530 })}>
                  <p className="uppercase">{dataSKPI.biodata.program_studi || 'Informatika'}</p>
               </div>
               <div className="absolute" style={getPos('skpi_pos_gelar', { top: 490, left: 280 })}>
                  <p className="uppercase">{dataSKPI.biodata.gelar || 'S.KOM'}</p>
               </div>
               <div className="absolute" style={getPos('skpi_pos_lulus', { top: 490, left: 530 })}>
                  <p className="uppercase">{dataSKPI.biodata.tahun_lulus || '-'}</p>
               </div>
            </div>
          </div>
        </div>

        {/* ======================= HALAMAN 2 & SETERUSNYA : TRANSKRIP ======================= */}
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
                <img src={dataSKPI.pengaturan?.skpi_background2_image ? `https://skpi-stikomelrahma.my.id/backend/api/umum/proxy_gambar.php?file=template_skpi/${dataSKPI.pengaturan.skpi_background2_image}` : "/bg_skpi_2.jpg"} alt={`Background 2 Page ${pageIndex}`} className="absolute inset-0 w-full h-full object-cover z-0" crossOrigin="anonymous" />
                <div className="absolute inset-0 z-10">
                  <div className="absolute" style={getPos('skpi_pos_nomor', { top: 125, left: 470 })}>
                     <p className="text-white font-bold text-sm tracking-widest">
                       {dataSKPI.biodata.nomor_induk}/SKPI-ER/{new Date().getFullYear()}
                     </p>
                  </div>

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
                        {chunk.length > 0 ? chunk.map((item, idx) => {
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
                        }) : (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-500 font-bold uppercase italic">Kosong</td></tr>
                          )
                        }
                        {isLastPage && dataSKPI.kegiatan.length > 0 && (
                          <tr className="bg-gray-50/80">
                            <td colSpan="5" className="py-2.5 pr-6 text-right font-black uppercase text-sm text-blue-950">Total Kredit</td>
                            <td className="py-2.5 text-center font-black text-lg text-blue-900" style={{ width: '60px' }}>{dataSKPI.total_poin}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                    {isLastPage && (
                      <div className="flex justify-end mt-6">
                        <div className="text-center w-64">
                          <p className="text-[12px] font-bold text-gray-800 mb-1">Sukabumi, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          <p className="text-[12px] font-bold text-gray-800 mb-1">Wakil Ketua I,</p>
                          <div className="h-20 w-full flex items-center justify-center my-2 relative">
                            {dataSKPI.pengaturan?.skpi_ttd_pejabat ? (
                              <img src={`https://skpi-stikomelrahma.my.id/backend/api/umum/proxy_gambar.php?file=tanda_tangan/${dataSKPI.pengaturan.skpi_ttd_pejabat}`} crossOrigin="anonymous" alt="Tanda Tangan" className="max-h-full max-w-full object-contain mix-blend-multiply" />
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

export default CetakDraftSKPI;
