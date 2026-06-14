import React, { useState, useEffect } from 'react';
import { Info, Loader2 } from 'lucide-react';

const PanduanAdmin = () => {
  const [panduan, setPanduan] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPanduan = async () => {
      try {
        const res = await fetch('https://skpi-stikomelrahma.my.id/backend/api/admin/pengaturan.php?aksi=ambil');
        const hasil = await res.json();
        if (hasil.status === 'sukses' && hasil.data.panduan_admin_teks) {
          setPanduan(hasil.data.panduan_admin_teks);
        } else {
          setPanduan('Belum ada panduan. Silakan tambahkan di halaman Pengaturan.');
        }
      } catch (err) {
        setPanduan('Gagal memuat panduan.');
      } finally {
        setLoading(false);
      }
    };
    fetchPanduan();
  }, []);

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h2 className="text-3xl md:text-5xl font-black text-blue-900 uppercase italic tracking-tighter leading-none">Panduan Penggunaan</h2>
          <div className="h-1.5 w-20 bg-blue-600 mt-4 rounded-full shadow-lg"></div>
        </div>
      </div>

      <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-gray-100 min-h-[60vh]">
        <h3 className="font-black text-blue-900 text-xl uppercase mb-6 flex items-center gap-3">
          <Info className="text-blue-500" /> Panduan Admin
        </h3>
        {loading ? (
          <div className="flex items-center gap-3 text-gray-500"><Loader2 className="animate-spin" /> Memuat...</div>
        ) : (
          <div className="prose prose-sm prose-blue text-gray-700 whitespace-pre-wrap max-w-none">
            {panduan}
          </div>
        )}
      </div>
    </div>
  );
};

export default PanduanAdmin;
