import React, { useContext, useEffect, useState, useMemo } from 'react';
import { KonteksPengguna } from '../../context/InfoPengguna';
import { useNavigate } from 'react-router-dom';
import { 
  Award, CheckCircle2, Clock, FileText, TrendingUp, 
  AlertCircle, Download, Zap, PartyPopper, Users, BellRing, ArrowRight 
} from 'lucide-react';

const Beranda = () => {
  const { pengguna } = useContext(KonteksPengguna);
  const navigasi = useNavigate();
  const [statistik, setStatistik] = useState({
    total: 0, disetujui: 0, menunggu: 0, total_poin: 0, total_mahasiswa: 0, angkatan: ''
  });

  const ambilRingkasan = async () => {
    if (!pengguna?.nomor_induk) return;
    try {
      const res = await fetch(`https://skpi-stikomelrahma.my.id/backend/api/umum/ambil_ringkasan.php?nim=${pengguna.nomor_induk}&peran=${pengguna.peran}`);
      const hasil = await res.json();
      if (hasil.status === 'sukses') setStatistik(hasil.data);
    } catch (err) {
      console.error("Gagal mengambil data ringkasan");
    }
  };

  useEffect(() => { 
    ambilRingkasan(); 
  }, [pengguna]);

  const semester = statistik.semester_aktif || 1;
  const targetUas = statistik.target_semester_ini || 50;
  const poinUas = parseInt(statistik.total_poin, 10) || 0; // Gunakan akumulasi kredit total
  const lulusUas = targetUas > 0 && poinUas >= targetUas;
  const persenUas = targetUas > 0 ? Math.min(Math.floor((poinUas / targetUas) * 100), 100) : 0;

  const targetSkpi = 250;
  const poinSkpi = parseInt(statistik.total_poin, 10) || 0;
  const lulusSkpi = targetSkpi > 0 && poinSkpi >= targetSkpi;
  const persenSkpi = targetSkpi > 0 ? Math.min(Math.floor((poinSkpi / targetSkpi) * 100), 100) : 0;

  const isAdmin = pengguna?.peran === 'admin';

  let statusPanel = {
    bg: 'bg-gray-100 text-gray-400 opacity-60',
    iconBg: 'bg-gray-200',
    icon: <AlertCircle size={36} />,
    title: 'Belum Memenuhi Syarat',
    desc: `Anda masih harus mengumpulkan kredit untuk memenuhi syarat UAS maupun SKPI.`
  };

  if (lulusSkpi) {
    statusPanel = {
      bg: 'bg-blue-900 text-white',
      iconBg: 'bg-white/10',
      icon: <Award size={36} className="text-yellow-400" />,
      title: 'SKPI Resmi Siap Dicetak!',
      desc: 'Selamat! Anda telah memenuhi syarat lulus 250+ kredit. Anda sekarang dapat mencetak dokumen SKPI resmi kampus.'
    };
  } else if (lulusUas) {
    statusPanel = {
      bg: 'bg-emerald-600 text-white',
      iconBg: 'bg-white/20',
      icon: <CheckCircle2 size={36} className="text-white" />,
      title: 'Syarat UAS Terpenuhi!',
      desc: `Luar biasa! Kredit Anda untuk syarat UAS Semester ${semester} sudah tercapai. Silakan tunjukkan layar ini ke bagian akademik untuk verifikasi UAS.`
    };
  }

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      
      {/* 1. HEADER DINAMIS EDOM STYLE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 leading-none">
            Halo, <span className="text-blue-600">{isAdmin ? 'Staff' : pengguna?.nama_lengkap?.split(' ')[0]}!</span>
          </h2>
          <p className="text-sm font-medium text-gray-500 mt-2">
            {isAdmin ? 'Panel Kendali Administrasi' : `Semester ${semester} • Angkatan ${statistik.angkatan || '-'}`}
          </p>
        </div>

        {/* NOTIFIKASI OTOMATIS */}
        {isAdmin ? (
          statistik.menunggu > 0 ? (
            <div 
              onClick={() => navigasi('/validasi-skpi')}
              className="bg-amber-50 text-amber-700 p-4 rounded-xl border border-amber-200 shadow-sm flex items-center gap-4 cursor-pointer hover:bg-amber-100 transition-all"
            >
              <div className="p-2 bg-amber-100 rounded-lg">
                <BellRing size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-600 uppercase mb-0.5">Pemberitahuan Sistem</p>
                <p className="text-sm font-bold">Ada {statistik.menunggu} Ajuan Menunggu!</p>
              </div>
              <ArrowRight size={18} className="ml-2 text-amber-500" />
            </div>
          ) : (
            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-200 shadow-sm flex items-center gap-4 transition-all">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CheckCircle2 size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-600 uppercase mb-0.5">Status Kerja</p>
                <p className="text-sm font-bold">Semua Ajuan Telah Terproses</p>
              </div>
            </div>
          )
        ) : (
          /* NOTIFIKASI MAHASISWA (SYARAT UAS) */
          <div className={`p-4 rounded-xl border shadow-sm flex items-center gap-4 transition-all ${lulusUas ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
            <div className={`p-2 rounded-lg ${lulusUas ? 'bg-emerald-100' : 'bg-blue-100'}`}>
              {lulusUas ? <PartyPopper size={20} className="text-emerald-600" /> : <Zap size={20} className="text-blue-600" />}
            </div>
            <div>
              <p className={`text-xs font-semibold uppercase mb-0.5 ${lulusUas ? 'text-emerald-600' : 'text-blue-600'}`}>Status UAS Semester {semester}</p>
              <p className="text-sm font-bold">
                {lulusUas ? 'Memenuhi Syarat UAS!' : `Kurang ${targetUas - poinUas} Kredit lagi`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. KARTU STATISTIK */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <CardStat onClick={isAdmin ? () => navigasi('/validasi-skpi') : undefined} label="Total Ajuan" nilai={statistik.total} ikon={<FileText size={24}/>} warna="blue" />
        <CardStat onClick={isAdmin ? () => navigasi('/validasi-skpi') : undefined} label="Disetujui" nilai={statistik.disetujui} ikon={<CheckCircle2 size={24}/>} warna="emerald" />
        <CardStat onClick={isAdmin ? () => navigasi('/validasi-skpi') : undefined} label="Menunggu" nilai={statistik.menunggu} ikon={<Clock size={24}/>} warna="amber" />
        <CardStat 
          onClick={isAdmin ? () => navigasi('/data-mahasiswa') : undefined}
          label={isAdmin ? "Total Mahasiswa" : "Kredit Akumulasi"} 
          nilai={isAdmin ? statistik.total_mahasiswa : statistik.total_poin} 
          ikon={isAdmin ? <Users size={24}/> : <Award size={24}/>} 
          warna="indigo" highlight 
        />
      </div>

      {/* 3. TAMPILAN KHUSUS MAHASISWA */}
      {!isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">Syarat UAS Semester {semester}</h3>
                    <p className="text-sm font-medium text-gray-500 mt-1">Target Kredit Khusus Semester Ini: {targetUas} Kredit</p>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">{persenUas}%</p>
                </div>
                <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden mb-6">
                  <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: `${persenUas}%` }}></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                    <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Target Semester {semester}</p>
                    <p className="text-2xl font-bold text-blue-900">{targetUas} <small className="text-xs font-medium">Kredit</small></p>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-center">
                    <p className="text-xs font-semibold text-indigo-600 uppercase mb-1">Total Kredit</p>
                    <p className="text-2xl font-bold text-indigo-900">{poinUas} <small className="text-xs font-medium">Kredit</small></p>
                  </div>
                </div>
            </div>

            {/* PROGRESS SKPI AKHIR (KELULUSAN) */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                 <CheckCircle2 size={18} className="text-emerald-500"/> Syarat Minimal Kredit UAS
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {(statistik.target_semua_semester || []).map((item) => (
                   <div key={item.semester} className={`p-4 rounded-xl border flex flex-col items-center justify-center transition-all ${semester === parseInt(item.semester) ? 'border-blue-600 bg-blue-50' : 'border-gray-100 bg-gray-50'}`}>
                      <p className={`text-xs font-semibold uppercase ${semester === parseInt(item.semester) ? 'text-blue-600' : 'text-gray-500'}`}>Semester {item.semester}</p>
                      <p className={`text-lg font-bold mt-1 ${semester === parseInt(item.semester) ? 'text-blue-900' : 'text-gray-700'}`}>{item.target_poin} <small className="text-[10px] font-medium">Kredit</small></p>
                   </div>
                 ))}
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-end mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
                      <Award size={18} className="text-indigo-500"/> Akumulasi SKPI Akhir
                    </h3>
                    <p className="text-sm font-medium text-gray-500">Target Penerbitan: {targetSkpi} Kredit</p>
                  </div>
                  <p className="text-2xl font-bold text-indigo-600">{persenSkpi}%</p>
              </div>
              <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${persenSkpi}%` }}></div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className={`p-6 md:p-8 rounded-2xl h-full flex flex-col justify-between shadow-sm border ${statusPanel.bg === 'bg-blue-900 text-white' ? 'bg-blue-600 text-white border-blue-600' : (statusPanel.bg === 'bg-emerald-600 text-white' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white border-gray-200 text-gray-800')}`}>
              <div>
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${statusPanel.bg === 'bg-blue-900 text-white' ? 'bg-white/20' : (statusPanel.bg === 'bg-emerald-600 text-white' ? 'bg-white/20' : 'bg-gray-100')}`}>
                  {statusPanel.icon}
                </div>
                <h4 className="text-xl font-bold mb-4">
                  {statusPanel.title}
                </h4>
                <p className={`text-sm font-medium leading-relaxed ${statusPanel.bg === 'bg-blue-900 text-white' || statusPanel.bg === 'bg-emerald-600 text-white' ? 'text-white/90' : 'text-gray-500'}`}>
                  {statusPanel.desc}
                </p>
              </div>
              {lulusSkpi && (
                <button onClick={() => navigasi('/skpi-resmi')} className="mt-8 bg-white text-blue-600 w-full py-3 rounded-xl font-semibold text-sm shadow-sm flex items-center justify-center gap-2 hover:bg-blue-50 transition-all">
                  <Download size={18} /> Unduh SKPI
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. FOOTER KHUSUS ADMIN (TAMPIL JIKA KOSONG) */}
      {isAdmin && statistik.menunggu === 0 && (
        <div className="mt-8 bg-emerald-50 p-8 rounded-2xl border border-emerald-100 flex items-center gap-6">
           <div className="p-4 bg-emerald-100 rounded-xl">
              <PartyPopper size={32} className="text-emerald-600" />
           </div>
           <div>
              <h3 className="text-xl font-bold text-emerald-800 mb-1">Kerja Bagus, Staff!</h3>
              <p className="text-sm font-medium text-emerald-600">Seluruh berkas pengajuan mahasiswa telah divalidasi hari ini.</p>
           </div>
        </div>
      )}
    </div>
  );
};

const CardStat = ({ label, nilai, ikon, warna, highlight, onClick }) => {
  const themes = {
    blue: "text-blue-600 bg-blue-50",
    emerald: "text-emerald-600 bg-emerald-50",
    amber: "text-amber-600 bg-amber-50",
    indigo: "text-indigo-600 bg-indigo-50",
  };
  return (
    <div 
      onClick={onClick}
      className={`bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4 transition-all hover:shadow-md ${highlight ? 'border-indigo-100' : 'border-gray-100'} ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:border-blue-200' : ''}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${themes[warna]}`}>
        {ikon}
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase">{label}</p>
        <p className={`text-2xl font-bold ${highlight ? 'text-indigo-600' : 'text-gray-800'}`}>{nilai}</p>
      </div>
    </div>
  );
};

export default Beranda;
