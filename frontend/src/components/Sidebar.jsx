import React, { useContext, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { KonteksPengguna } from '../context/InfoPengguna';
import { Menu, X, LayoutDashboard, User, FileText, History, Printer, CheckSquare, Database, Users, Settings, LogOut } from 'lucide-react';

const Sidebar = () => {
  const { pengguna, logout } = useContext(KonteksPengguna);
  const [buka, setBuka] = useState(false);
  const navigasi = useNavigate();
  const lokasi = useLocation();

  const dapatkanJudul = () => {
    const path = lokasi.pathname;
    const mapJudul = {
      '/beranda': 'DASHBOARD UTAMA',
      '/data-mahasiswa': 'MANAJEMEN MAHASISWA',
      '/validasi-skpi': 'VALIDASI BERKAS SKPI',
      '/kategori': 'MASTER KATEGORI', // Tambahkan ini agar tidak default
      '/pengaturan': 'KONFIGURASI POIN',
      '/profil': 'PROFIL SAYA',
      '/input-skpi': 'INPUT SERTIFIKAT',
      '/status-ajuan': 'RIWAYAT AJUAN',
      '/cetak-sertifikat': 'ARSIP SERTIFIKAT',
      '/skpi-resmi': 'CETAK SKPI RESMI',
      '/permohonan-cetak': 'PERMOHONAN CETAK'
    };
    return mapJudul[path] || 'SKPI EL RAHMA';
  };

  const handleKeluar = () => {
    logout(); // Hapus session di Context
    sessionStorage.clear(); // Bersihkan semua sisa data di browser
    sessionStorage.clear();

    // Gunakan replace agar history browser terhapus, mencegah tombol "back" kembali masuk
    window.location.replace('/login');
  };

  const MenuLink = ({ to, children, icon: Icon }) => (
    <NavLink
      to={to}
      onClick={() => setBuka(false)}
      className={({ isActive }) => `
        flex items-center gap-3 p-4 rounded-2xl transition-all duration-300
        ${isActive
          ? 'bg-blue-600 shadow-lg shadow-blue-900/40 text-white translate-x-1'
          : 'hover:bg-white/10 text-blue-100 hover:text-white'}
      `}
    >
      {Icon && <Icon size={18} />}
      <span className="font-black text-[10px] tracking-widest uppercase">{children}</span>
    </NavLink>
  );

  return (
    <>
      {/* ==========================================
          HEADER TOPBAR (MUNCUL DI MOBILE)
          Naikkan Z-Index ke 110 agar selalu di depan
      ========================================== */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-white border-b z-[110] flex justify-between items-center px-6 shadow-sm">
        <button
          onClick={() => setBuka(true)}
          className="p-3 bg-blue-50 text-blue-900 rounded-2xl hover:bg-blue-100 transition-all active:scale-90"
        >
          <Menu size={24} />
        </button>

        <div className="text-right">
          <h2 className="font-black text-blue-900 uppercase text-[11px] tracking-tighter italic leading-none">
            {dapatkanJudul()}
          </h2>
          <p className="text-[8px] font-bold text-gray-400 mt-1 uppercase tracking-widest leading-none">
            {pengguna?.peran} Session
          </p>
        </div>
      </header>

      {/* ==========================================
          SIDEBAR CORE
      ========================================== */}

      {/* Overlay Gelap */}
      {buka && (
        <div
          onClick={() => setBuka(false)}
          className="fixed inset-0 bg-blue-950/60 backdrop-blur-sm z-[120] lg:hidden animate-in fade-in duration-300"
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-[130] w-72 bg-[#1e3a8a] text-white p-6 transform transition-transform duration-500 ease-in-out flex flex-col
        ${buka ? 'translate-x-0' : '-translate-x-full'} 
        lg:relative lg:translate-x-0 lg:flex lg:min-h-screen print:hidden shadow-2xl
      `}>

        <div className="mb-10 p-2 border-b border-white/10 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter text-white leading-none">
              SKPI <span className="text-blue-400">EL RAHMA</span>
            </h1>
            <p className="text-[9px] opacity-40 uppercase font-black tracking-[0.2em] mt-2">
              Online System v1.0
            </p>
          </div>
          <button onClick={() => setBuka(false)} className="lg:hidden p-2 bg-white/10 rounded-xl hover:bg-red-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <p className="text-[9px] text-blue-400/50 mb-4 ml-2 font-black tracking-[0.3em] uppercase">Utama</p>

          <MenuLink to="/beranda" icon={LayoutDashboard}>Dashboard</MenuLink>

          {pengguna?.peran === 'mahasiswa' && (
            <div className="space-y-2 pt-4">
              <p className="text-[9px] text-blue-400/50 mb-4 ml-2 font-black tracking-[0.3em] uppercase">Layanan</p>
              <MenuLink to="/profil" icon={User}>Profil Saya</MenuLink>
              <MenuLink to="/input-skpi" icon={FileText}>Input Sertifikat</MenuLink>
              <MenuLink to="/status-ajuan" icon={History}>Riwayat Ajuan</MenuLink>
              <MenuLink to="/skpi-resmi" icon={Printer}>Cetak SKPI</MenuLink>
            </div>
          )}

          {pengguna?.peran === 'admin' && (
            <div className="space-y-2 pt-4">
              <p className="text-[9px] text-blue-400/50 mb-4 ml-2 font-black tracking-[0.3em] uppercase">Manajemen</p>
              <MenuLink to="/validasi-skpi" icon={CheckSquare}>Validasi Ajuan</MenuLink>
              <MenuLink to="/permohonan-cetak" icon={Printer}>Permohonan Cetak</MenuLink>
              <MenuLink to="/kategori" icon={Database}>Master Kategori</MenuLink>
              <MenuLink to="/data-mahasiswa" icon={Users}>Data Mahasiswa</MenuLink>
              <p className="text-[9px] text-blue-400/50 mt-6 mb-4 ml-2 font-black tracking-[0.3em] uppercase">Sistem</p>
              <MenuLink to="/pengaturan" icon={Settings}>Pengaturan</MenuLink>
            </div>
          )}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-6 p-3 bg-white/5 rounded-2xl border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-xs shadow-lg ring-2 ring-white/10 text-white uppercase">
              {pengguna?.nama_lengkap?.substring(0, 2) || 'AD'}
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-black truncate leading-none text-white">{pengguna?.nama_lengkap || 'Admin'}</p>
              <p className="text-[9px] opacity-40 truncate mt-1 tracking-widest text-blue-200">{pengguna?.nomor_induk || 'Staff'}</p>
            </div>
          </div>
          <button
            onClick={handleKeluar}
            className="w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-4 rounded-2xl font-black transition-all duration-300 text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            KELUAR APLIKASI
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
