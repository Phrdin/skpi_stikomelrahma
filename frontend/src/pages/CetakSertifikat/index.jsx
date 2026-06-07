import React, { useEffect, useState, useContext, useRef } from 'react';
import { KonteksPengguna } from '../../context/InfoPengguna';
import { Download, FileText, Loader2, Printer, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Swal from 'sweetalert2';

const CetakSertifikat = () => {
  const { pengguna } = useContext(KonteksPengguna);
  const [riwayat, setRiwayat] = useState([]);
  const [layout, setLayout] = useState([]);
  const [setting, setSetting] = useState({ warna_font_sertifikat: '#000000' });
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [targetDownload, setTargetDownload] = useState(null);
  const sertifikatRef = useRef();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [resRiw, resLay, resSet] = await Promise.all([
          fetch(`https://skpi-stikomelrahma.my.id/backend/api/mahasiswa/ambil_riwayat_sertifikat.php?nim=${pengguna.nomor_induk}`),
          fetch('https://skpi-stikomelrahma.my.id/backend/api/admin/visual_editor.php?aksi=ambil'),
          fetch('https://skpi-stikomelrahma.my.id/backend/api/admin/pengaturan.php?aksi=ambil')
        ]);

        const hasRiw = await resRiw.json();
        const hasLay = await resLay.json();
        const hasSet = await resSet.json();

        if (hasRiw.status === 'sukses') setRiwayat(hasRiw.data);
        if (hasLay.status === 'sukses') setLayout(hasLay.elemen);
        if (hasSet.status === 'sukses') setSetting(hasSet.data);
      } catch (err) {
        console.error("Gagal sinkronisasi data cetak");
      } finally {
        setLoading(false);
      }
    };
    if (pengguna?.nomor_induk) loadData();
  }, [pengguna]);

  const handleDownload = (item) => {
    setTargetDownload(item);
    setIsProcessing(true);
    
    Swal.fire({
      title: 'Menyiapkan PDF',
      text: 'Sedang merender sertifikat resolusi tinggi...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    // Timeout untuk memastikan DOM render tersembunyi sudah update dengan data item terbaru
    setTimeout(() => {
      const element = sertifikatRef.current;
      html2canvas(element, { 
        scale: 4, // Kualitas Super HD
        useCORS: true,
        width: 842,
        height: 595
      }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a4' });
        pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
        pdf.save(`SKPI_SMT${item.semester}_${pengguna.nomor_induk}.pdf`);
        
        setIsProcessing(false);
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Sertifikat Anda telah berhasil diunduh.',
          timer: 2000,
          showConfirmButton: false
        });
      });
    }, 1200);
  };

  const getStyle = (id) => {
    const el = layout.find(item => item.element_id === id);
    if (!el) return { display: 'none' };
    
    if (id === 'nama_peserta') {
      return {
        position: 'absolute',
        left: '0',
        right: '0',
        top: `${el.posisi_y}px`,
        fontSize: `${el.ukuran_font}px`,
        fontWeight: '900',
        color: setting.warna_font_sertifikat || '#000',
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
        textTransform: 'uppercase',
        letterSpacing: '1px'
      };
    }

    return {
      position: 'absolute',
      left: `${el.posisi_x}px`,
      top: `${el.posisi_y}px`,
      fontSize: `${el.ukuran_font}px`,
      fontWeight: 'bold',
      color: setting.warna_font_sertifikat || '#000',
      fontFamily: 'Arial, sans-serif'
    };
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      {/* HEADER SECTION EDOM STYLE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-gray-900">Arsip Sertifikat</span>
          </h2>
          <p className="text-sm font-medium text-gray-500 mt-1 flex items-center gap-1">
            Unduh Dokumen Resmi SKPI Anda
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-20 opacity-50">
          <Loader2 size={36} className="animate-spin text-blue-600 mb-4" />
          <p className="font-semibold text-xs text-gray-500 uppercase tracking-widest">Sinkronisasi Dokumen...</p>
        </div>
      ) : riwayat.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {riwayat.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <FileText size={20} />
                </div>
                <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <ShieldCheck size={14}/> Valid
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-800 mb-1">Semester {item.semester}</h3>
              <p className="text-xs font-medium text-gray-500 mb-6">No Seri: {item.nomor_seri}</p>
              
              <button 
                onClick={() => handleDownload(item)}
                disabled={isProcessing}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {isProcessing && targetDownload?.id === item.id ? (
                   <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Printer size={18} />
                )}
                Cetak Sertifikat
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-16 text-center border border-dashed border-gray-200">
          <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-700">Belum ada sertifikat terbit</h3>
          <p className="text-sm font-medium text-gray-500 mt-1">Pastikan poin Anda sudah memenuhi syarat UAS semester ini.</p>
        </div>
      )}

      {/* AREA RENDER TERSEMBUNYI (OFF-SCREEN) */}
      <div style={{ position: 'absolute', left: '-10000px', top: 0 }}>
        <div 
          ref={sertifikatRef}
          style={{ 
            width: '842px', height: '595px', 
            backgroundColor: 'white', position: 'relative', overflow: 'hidden' 
          }}
        >
          {/* Background Template Asli dari Admin */}
          <img 
            src={`https://skpi-stikomelrahma.my.id/backend/gambar/template_asli.jpg?v=${new Date().getTime()}`} 
            style={{ width: '100%', height: '100%', objectFit: 'fill' }} 
            crossOrigin="anonymous"
            alt="Template"
          />
          
          {/* Teks Nama (Mengikuti Posisi dari Visual Editor Admin) */}
          <div style={getStyle('nama_peserta')}>
            {pengguna?.nama_lengkap?.toUpperCase()}
          </div>
          
          {/* Teks Nomor Sertifikat (Mengikuti Posisi dari Visual Editor Admin) */}
          <div style={getStyle('nomor_sertifikat')}>
            {targetDownload?.nomor_seri}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CetakSertifikat;
