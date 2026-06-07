import React, { useContext, useState, useEffect } from 'react';
import { KonteksPengguna } from '../../context/InfoPengguna';
import { useNavigate } from 'react-router-dom';
import { LogIn, Lock, User, Loader2, MessageCircle, GraduationCap, ShieldCheck, Zap, Smartphone, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';

const Login = () => {
  const { login } = useContext(KonteksPengguna);
  const [data, setData] = useState({ nomor_induk: '', kata_sandi: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigasi = useNavigate();

  useEffect(() => {
    document.body.style.overflow = 'auto';
    // Mencegah user yang sudah login mengakses halaman login
    if (sessionStorage.getItem('pengguna')) {
      navigasi('/beranda', { replace: true });
    }
  }, [navigasi]);

  const handleMasuk = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('https://skpi-stikomelrahma.my.id/backend/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const hasil = await res.json();

      if (hasil.status === 'sukses') {
        login(hasil.data);
        
        // Cek kekuatan kata sandi yang baru saja dimasukkan
        const sandi = data.kata_sandi;
        const isKuat = sandi.length >= 8 && /[A-Z]/.test(sandi) && /[0-9]/.test(sandi);
        
        if (!isKuat) {
          Swal.fire({
            icon: 'warning',
            title: 'Kata Sandi Kurang Kuat!',
            text: 'Demi keamanan, kata sandi Anda saat ini disarankan untuk segera diganti karena terlalu mudah ditebak. Pastikan kata sandi minimal 8 karakter dan mengandung huruf besar serta angka.',
            confirmButtonText: 'Saya Mengerti',
            confirmButtonColor: '#2563eb'
          }).then(() => {
            navigasi('/beranda');
          });
        } else {
          navigasi('/beranda');
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Masuk',
          text: hasil.pesan,
          confirmButtonColor: '#2563eb'
        });
      }
    } catch (err) {
      Swal.fire('Error', 'Gagal terhubung ke server backend.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLupaSandi = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Lupa Kata Sandi Akun SKPI?',
      icon: 'question',
      html:
        '<p style="font-size: 11px; color: #999; margin-bottom: 15px; text-transform: uppercase; font-weight: bold;">Verifikasi Identitas Akun SKPI</p>' +
        '<input id="swal-input1" class="swal2-input" style="font-size: 13px; border-radius: 12px;" placeholder="Nama Lengkap">' +
        '<input id="swal-input2" class="swal2-input" style="font-size: 13px; border-radius: 12px;" placeholder="NIM / Nomor Induk">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Kirim Permintaan',
      confirmButtonColor: '#22c55e',
      cancelButtonText: 'Batal',
      preConfirm: () => {
        const nama = document.getElementById('swal-input1').value;
        const nim = document.getElementById('swal-input2').value;
        if (!nama || !nim) {
          Swal.showValidationMessage('Nama dan NIM wajib diisi!');
        }
        return [nama, nim];
      }
    });

    if (formValues) {
      const [nama, nim] = formValues;
      const noAdmin = "628886175214"; // GANTI DENGAN NOMOR ADMIN ASLI
      
      // FORMAT PESAN DENGAN PERMINTAAN KONFIRMASI KEMBALI
      const pesan = `Halo Admin SKPI STIKOM El Rahma,\n\nSaya lupa kata sandi *AKUN SKPI* saya. Berikut data saya:\n\n📌 *Nama:* ${nama}\n📌 *NIM:* ${nim}\n\nMohon bantuannya untuk melakukan reset kata sandi akun SKPI saya. *Minta tolong untuk dicek dan dikonfirmasi kembali jika sudah diperbarui.* Terima kasih banyak.`;
      
      const url = `https://wa.me/${noAdmin}?text=${encodeURIComponent(pesan)}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="min-h-screen flex items-stretch font-sans bg-white">
      {/* Kiri - Banner Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 relative overflow-hidden flex-col justify-center px-16 lg:px-24">
        {/* Latar Belakang / Watermark */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
          <GraduationCap size={600} className="text-blue-900" />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center p-1 shadow-lg shrink-0">
               <img 
                 src="https://stikomelrahma.ac.id/wp-content/uploads/2023/01/cropped-logo-stikom-el-rahma-3.png" 
                 alt="Logo STIKOM El Rahma" 
                 className="w-full h-full object-contain rounded-full"
                 onError={(e) => { 
                   e.target.onerror = null; 
                   e.target.src = 'https://ui-avatars.com/api/?name=STIKOM&background=ffffff&color=2563eb&font-size=0.3';
                 }}
               />
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-semibold backdrop-blur-sm shadow-sm">
              <span className="bg-white text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">SKPI</span>
              <span>STIKOM El Rahma Bogor</span>
            </div>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
            SKPI <br />
            <span className="text-yellow-400">STIKOM El Rahma Bogor</span>
          </h1>

          <p className="text-blue-100 text-lg mb-12 max-w-lg leading-relaxed">
            Portal terpadu untuk pengelolaan Surat Keterangan Pendamping Ijazah (SKPI). Wujudkan ekosistem pendidikan yang transparan dan terintegrasi.
          </p>
        </div>
      </div>

      {/* Kanan - Form Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        <div className="w-full max-w-md animate-in slide-in-from-bottom-4 duration-700 fade-in">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-600/30">
              <User className="text-white" size={40} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Selamat Datang</h2>
            <p className="text-gray-500">Masuk menggunakan kredensial akademik Anda.</p>
          </div>

          <form onSubmit={handleMasuk} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">NIM / NIDN / USERNAME</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="text" 
                  placeholder="Ketik ID Anda..." 
                  className="block w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none font-medium"
                  value={data.nomor_induk}
                  onChange={(e) => setData({...data, nomor_induk: e.target.value})}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Kata Sandi</label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Ketik kata sandi..." 
                  className="block w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none font-medium"
                  value={data.kata_sandi}
                  onChange={(e) => setData({...data, kata_sandi: e.target.value})}
                  autoComplete="current-password"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="text-right mt-2">
                <button 
                  type="button"
                  onClick={handleLupaSandi}
                  className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                >
                  Lupa Kata Sandi?
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-orange-500/30 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <LogIn size={20} />
              )}
              <span>{loading ? 'VERIFIKASI...' : 'MASUK SISTEM'}</span>
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-gray-100 text-center">
            <p className="text-xs font-medium text-gray-400">
              Jelajahi Info Kampus
            </p>
            <p className="text-xs text-gray-400 mt-1">
              &darr;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
