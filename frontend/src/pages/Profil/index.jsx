import React, { useContext, useState, useEffect } from 'react';
import { KonteksPengguna } from '../../context/InfoPengguna';
import { User, Mail, Phone, MapPin, GraduationCap, Calendar, BookOpen, Edit3, X, Save, Shield, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

const Profil = () => {
  const { pengguna } = useContext(KonteksPengguna);
  const [loadingFetch, setLoadingFetch] = useState(true);
  const [loadingSimpan, setLoadingSimpan] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [daftarAngkatan, setDaftarAngkatan] = useState([]);
  const [passwordForm, setPasswordForm] = useState({ password_lama: '', password_baru: '', konfirmasi_password: '' });

  const [profil, setProfil] = useState({
    nama_lengkap: '',
    program_studi: 'Informatika',
    angkatan: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: '',
    no_hp: '',
    email: '',
    alamat: '',
    nik: '',
    agama: '',
    semester_aktif: 1,
    foto_formal: '',
    gelar: '',
    tahun_lulus: '',
    status_mahasiswa: 'Aktif'
  });

  const [formData, setFormData] = useState({ ...profil });

 // Ganti bagian useEffect di Profil/index.jsx dengan ini:

useEffect(() => {
  let isMounted = true; 

  const fetchData = async () => {
    if (!pengguna?.nomor_induk) {
      if (isMounted) setLoadingFetch(false); // Jangan loading jika user tidak ada
      return;
    }
    
    setLoadingFetch(true);
    try {
      const resProfil = await fetch(`https://skpi-stikomelrahma.my.id/backend/api/umum/update_profil.php?nim=${pengguna.nomor_induk}`);
      const hasilProfil = await resProfil.json();
      
      const resAngkatan = await fetch(`https://skpi-stikomelrahma.my.id/backend/api/umum/update_profil.php?type=angkatan`);
      const hasilAngkatan = await resAngkatan.json();

      if (isMounted) {
        if (hasilProfil.status === 'sukses') {
          setProfil(hasilProfil.data);
          setFormData(hasilProfil.data);
        }
        if (hasilAngkatan.status === 'sukses') {
          setDaftarAngkatan(hasilAngkatan.data);
        }
      }
    } catch (err) {
      console.error("Gagal sinkronisasi data");
    } finally {
      // INI KUNCINYA: Pastikan loading mati meskipun error atau pindah halaman
      if (isMounted) setLoadingFetch(false);
    }
  };

  fetchData();

  return () => {
    isMounted = false; // Flag dimatikan saat komponen ditinggalkan
    setLoadingFetch(false); // Paksa state loading jadi false
  };
}, [pengguna]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSimpan = async (e) => {
    e.preventDefault();
    setLoadingSimpan(true);
    try {
      const response = await fetch('https://skpi-stikomelrahma.my.id/backend/api/umum/update_profil.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomor_induk: pengguna.nomor_induk, ...formData }),
      });
      const hasil = await response.json();
      
      if (hasil.status === 'sukses') {
        setProfil({ ...formData });
        setShowModal(false);
        Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Profil disimpan permanen.', timer: 1500, showConfirmButton: false });
      } else {
        Swal.fire('Gagal', hasil.pesan, 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Gagal menyimpan ke server.', 'error');
    } finally {
      setLoadingSimpan(false);
    }
  };

  const handleGantiPassword = async (e) => {
    e.preventDefault();
    if (passwordForm.password_baru !== passwordForm.konfirmasi_password) {
      return Swal.fire('Error', 'Konfirmasi password baru tidak cocok!', 'error');
    }
    
    setLoadingSimpan(true);
    try {
      const response = await fetch('https://skpi-stikomelrahma.my.id/backend/api/umum/ganti_password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomor_induk: pengguna.nomor_induk,
          password_lama: passwordForm.password_lama,
          password_baru: passwordForm.password_baru
        })
      });
      const hasil = await response.json();
      
      if (hasil.status === 'sukses') {
        setShowPasswordModal(false);
        setPasswordForm({ password_lama: '', password_baru: '', konfirmasi_password: '' });
        Swal.fire('Berhasil', hasil.pesan, 'success');
      } else {
        Swal.fire('Gagal', hasil.pesan, 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Gagal memproses ke server.', 'error');
    } finally {
      setLoadingSimpan(false);
    }
  };

  const handleUploadFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      Swal.fire('Gagal', 'Hanya gambar JPG/PNG yang diizinkan', 'error');
      return;
    }
    
    const formDataFile = new FormData();
    
    // Validasi ukuran 5MB di sisi klien
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire('Terlalu Besar', 'Maksimal ukuran foto adalah 5MB', 'error');
      return;
    }

    formDataFile.append('foto_formal', file);
    
    setLoadingSimpan(true);
    try {
      const res = await fetch('https://skpi-stikomelrahma.my.id/backend/api/umum/upload_foto.php', {
        method: 'POST',
        body: formDataFile
      });
      const hasil = await res.json();
      if (hasil.status === 'sukses') {
        setProfil(p => ({ ...p, foto_formal: hasil.file }));
        Swal.fire('Berhasil', 'Foto formal diperbarui', 'success');
      } else {
        Swal.fire('Gagal', hasil.pesan, 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Gagal upload foto', 'error');
    } finally {
      setLoadingSimpan(false);
    }
  };

  if (loadingFetch) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-blue-400">
        <Loader2 size={40} className="animate-spin mb-4" />
        <p className="font-black text-[10px] uppercase tracking-[0.4em]">Menyinkronkan Data...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      {/* Header EDOM Style */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-gray-900">Profil Mahasiswa</span>
          </h2>
          <p className="text-sm font-medium text-gray-500 mt-1 flex items-center gap-1">
            Data Diri & Akademik
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KARTU IDENTITAS KIRI */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="relative mb-6">
              {profil.foto_formal ? (
                <img src={`https://skpi-stikomelrahma.my.id/backend/unggahan/foto_formal/${profil.foto_formal}`} alt="Foto" className="w-32 h-32 object-cover rounded-2xl shadow-sm border border-gray-100" />
              ) : (
                <div className="w-32 h-32 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                  <User size={64} />
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-xl cursor-pointer shadow-sm hover:bg-blue-700 transition-all">
                <Edit3 size={16} />
                <input type="file" accept="image/jpeg, image/png" className="hidden" onChange={handleUploadFoto} disabled={loadingSimpan} />
              </label>
            </div>
            <h3 className="text-lg font-bold text-gray-800 leading-tight">{profil.nama_lengkap || 'User'}</h3>
            <p className="text-blue-600 font-medium text-sm mt-1">{pengguna?.nomor_induk}</p>
            <button onClick={() => { setFormData({...profil}); setShowModal(true); }} className="w-full mt-8 bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm shadow-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
              <Edit3 size={16} /> Lengkapi Biodata
            </button>
            <button onClick={() => setShowPasswordModal(true)} className="w-full mt-3 bg-white text-gray-700 border border-gray-200 py-3 rounded-xl font-semibold text-sm shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
              <Shield size={16} /> Ganti Password
            </button>
          </div>
        </div>

        {/* DETAIL INFO KANAN */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <InfoRow ikon={<BookOpen size={18}/>} label="Program Studi" nilai={profil.program_studi} />
              <InfoRow ikon={<Shield size={18}/>} label="Status Mahasiswa" nilai={profil.status_mahasiswa || 'Aktif'} />
              <InfoRow ikon={<Shield size={18}/>} label="NIK" nilai={profil.nik || '-'} />
              <InfoRow ikon={<GraduationCap size={18}/>} label="Angkatan" nilai={profil.angkatan || '-'} />
              <InfoRow ikon={<BookOpen size={18}/>} label="Semester Aktif" nilai={`Semester ${profil.semester_aktif || 1}`} />
              <InfoRow ikon={<Calendar size={18}/>} label="Tgl Lahir" nilai={`${profil.tempat_lahir || '-'}, ${profil.tanggal_lahir || '-'}`} />
              <InfoRow ikon={<Shield size={18}/>} label="Agama" nilai={profil.agama || '-'} />
              <InfoRow ikon={<Shield size={18}/>} label="Jenis Kelamin" nilai={profil.jenis_kelamin || '-'} />
              <InfoRow ikon={<GraduationCap size={18}/>} label="Gelar Akademik" nilai={profil.gelar || '-'} />
              <InfoRow ikon={<Calendar size={18}/>} label="Tahun Lulus" nilai={profil.tahun_lulus || '-'} />
              <InfoRow ikon={<Phone size={18}/>} label="WhatsApp" nilai={profil.no_hp || '-'} />
              <InfoRow ikon={<Mail size={18}/>} label="Email" nilai={profil.email || '-'} />
            </div>
            <div className="mt-8 pt-6 border-t border-gray-100 flex items-start gap-4">
              <div className="p-3 bg-gray-50 rounded-xl text-gray-400"><MapPin size={20}/></div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Alamat Lengkap</p>
                <p className="text-sm font-medium text-gray-800 leading-relaxed">{profil.alamat || 'Belum diatur'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL EDIT */}
      {showModal && (
        <div className="fixed inset-0 bg-blue-950/50 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 bg-gray-50/50 border-b flex justify-between items-center text-blue-900">
              <h3 className="text-xl font-black uppercase italic tracking-tighter">Update Biodata</h3>
              <button onClick={() => setShowModal(false)} className="p-2 bg-white text-gray-400 hover:text-red-500 rounded-xl shadow-sm"><X size={20}/></button>
            </div>

            <form onSubmit={handleSimpan} className="p-8 md:p-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
              
              <div className="mb-8 bg-blue-50/50 border border-blue-100 p-5 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-blue-800">
                  <div className="p-3 bg-blue-100 rounded-2xl shrink-0"><Shield size={20} /></div>
                  <p className="text-[10px] md:text-xs font-bold leading-relaxed">
                    Sebagian besar biodata Anda <span className="font-black text-blue-900">dikunci</span> demi keamanan. Jika terdapat kesalahan data pada kolom yang terkunci, silakan hubungi Admin Akademik.
                  </p>
                </div>
                <a href="https://wa.me/6287864183121?text=Halo%20Layanan%20Akademik,%20saya%20ingin%20memperbaiki%20kesalahan%20pada%20biodata%20SKPI%20saya..." target="_blank" rel="noreferrer" className="w-full md:w-auto text-center shrink-0 bg-green-500 hover:bg-green-600 text-white px-5 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 transition-all active:scale-95">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.393.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.101.824z"/></svg>
                  Layanan Akademik
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputGroup label="Nama Lengkap" name="nama_lengkap" value={formData.nama_lengkap} disabled />
                
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest">Program Studi</label>
                  <input type="text" value="Informatika" disabled className="w-full p-4 bg-gray-100 border-none rounded-2xl font-bold text-xs cursor-not-allowed text-gray-400 shadow-inner" />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest">Angkatan</label>
                  <select name="angkatan" value={formData.angkatan} disabled className="w-full p-4 bg-gray-100 border-none rounded-2xl font-bold text-xs outline-none cursor-not-allowed text-gray-400 shadow-inner">
                    <option value="">Pilih Angkatan...</option>
                    {daftarAngkatan.map((item, index) => (
                      <option key={index} value={item.tahun}>{item.nama_angkatan} ({item.tahun})</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest">Jenis Kelamin</label>
                  <select name="jenis_kelamin" value={formData.jenis_kelamin} disabled className="w-full p-4 bg-gray-100 border-none rounded-2xl font-bold text-xs outline-none cursor-not-allowed text-gray-400 shadow-inner">
                    <option value="">Pilih...</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <InputGroup label="NIK (Nomor Induk Kependudukan)" name="nik" value={formData.nik || ''} disabled />
                <InputGroup label="Agama" name="agama" value={formData.agama || ''} disabled />
                
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest">Semester Aktif</label>
                  <select name="semester_aktif" value={formData.semester_aktif || 1} disabled className="w-full p-4 bg-gray-100 border-none rounded-2xl font-bold text-xs outline-none cursor-not-allowed text-gray-400 shadow-inner">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <InputGroup label="Tempat Lahir" name="tempat_lahir" value={formData.tempat_lahir} disabled />
                <InputGroup label="Tgl Lahir" name="tanggal_lahir" type="date" value={formData.tanggal_lahir} disabled />
                <InputGroup label="Gelar (S.Kom/dll)" name="gelar" value={formData.gelar || ''} disabled />
                <InputGroup label="Estimasi Tahun Lulus" name="tahun_lulus" value={formData.tahun_lulus || ''} disabled />
                <InputGroup label="WhatsApp" name="no_hp" value={formData.no_hp} onChange={handleChange} required />
                <InputGroup label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
              </div>

              <div className="mt-5 space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest">Alamat Lengkap</label>
                <textarea name="alamat" value={formData.alamat} onChange={handleChange} rows="3" className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-blue-600 shadow-inner"></textarea>
              </div>

              <button type="submit" disabled={loadingSimpan} className="w-full mt-10 bg-blue-600 text-white py-5 rounded-3xl font-black uppercase text-[11px] tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
                {loadingSimpan ? 'Menyimpan...' : <><Save size={18}/> Simpan Data</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GANTI PASSWORD */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-blue-950/50 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 bg-gray-50/50 border-b flex justify-between items-center text-blue-900">
              <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2"><Shield size={20}/> Ganti Password</h3>
              <button onClick={() => setShowPasswordModal(false)} className="p-2 bg-white text-gray-400 hover:text-red-500 rounded-xl shadow-sm"><X size={20}/></button>
            </div>

            <form onSubmit={handleGantiPassword} className="p-8 md:p-10">
              <div className="space-y-4">
                <InputGroup 
                  label="Password Lama" 
                  type="password" 
                  required 
                  value={passwordForm.password_lama} 
                  onChange={e => setPasswordForm(p => ({...p, password_lama: e.target.value}))} 
                />
                <InputGroup 
                  label="Password Baru" 
                  type="password" 
                  required 
                  value={passwordForm.password_baru} 
                  onChange={e => setPasswordForm(p => ({...p, password_baru: e.target.value}))} 
                />
                <InputGroup 
                  label="Konfirmasi Password Baru" 
                  type="password" 
                  required 
                  value={passwordForm.konfirmasi_password} 
                  onChange={e => setPasswordForm(p => ({...p, konfirmasi_password: e.target.value}))} 
                />
              </div>

              <button type="submit" disabled={loadingSimpan} className="w-full mt-8 bg-blue-600 text-white py-4 rounded-3xl font-black uppercase text-[11px] tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 hover:bg-blue-700 transition-all">
                {loadingSimpan ? 'Memproses...' : 'Simpan Password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ ikon, label, nilai }) => (
  <div className="flex items-center gap-4 text-left">
    <div className="p-3 bg-blue-50 rounded-xl text-blue-600">{ikon}</div>
    <div className="overflow-hidden">
      <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5">{label}</p>
      <p className="text-sm font-bold text-gray-800 truncate">{nilai}</p>
    </div>
  </div>
);

const InputGroup = ({ label, name, ...props }) => (
  <div className="space-y-2">
    <label className="text-xs font-semibold text-gray-500 uppercase ml-1">{label}</label>
    <input name={name} {...props} className={`w-full p-3 border rounded-xl text-sm font-medium outline-none focus:border-blue-600 transition-all ${props.disabled ? 'bg-gray-50 border-gray-100 cursor-not-allowed text-gray-500' : 'bg-white border-gray-200 text-gray-800'}`} />
  </div>
);

export default Profil;
