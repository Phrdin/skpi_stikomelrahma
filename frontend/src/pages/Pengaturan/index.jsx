import React, { useState, useEffect, useContext } from 'react';
import { KonteksPengguna } from '../../context/InfoPengguna';
import Swal from 'sweetalert2';
import {
  Calendar, GraduationCap, ShieldCheck, Lock, Save,
  RefreshCcw, Trash2, Plus, Users, Edit3, X, Info,
  FileText, Signature, Image as ImageIcon, Loader2, AlertCircle,
  AlignLeft, AlignCenter, AlignRight, Bold, Type, Palette, ArrowLeftToLine, ArrowRightToLine
} from 'lucide-react';

const Pengaturan = () => {
  const { pengguna } = useContext(KonteksPengguna);
  const [tabAktif, setTabAktif] = useState('akademik');

  // --- STATE STATUS MAHASISWA ---
  const [dataStatus, setDataStatus] = useState([]);
  const [showModalStatus, setShowModalStatus] = useState(false);
  const [formStatus, setFormStatus] = useState({ id_status: '', nama_status: '', deskripsi: '', izin_akses_skpi: 1 });

  // --- STATE PERIODE ---
  const [dataPeriode, setDataPeriode] = useState([]);
  const [showModalPeriode, setShowModalPeriode] = useState(false);
  const [formPeriode, setFormPeriode] = useState({ id_periode: '', nama_periode: '', tanggal_mulai: '', tanggal_selesai: '', is_aktif: 0 });

  // --- STATE PROGRAM STUDI ---
  const [dataProdi, setDataProdi] = useState([]);
  const [showModalProdi, setShowModalProdi] = useState(false);
  const [formProdi, setFormProdi] = useState({ id_prodi: '', nama_prodi: '', jenjang: 'S1', gelar_lulusan: '', masa_studi_tahun: 4 });

  // --- STATE AKADEMIK & ANGKATAN ---
  const [dataKredit, setDataKredit] = useState([]);
  const [daftarAngkatan, setDaftarAngkatan] = useState([]);
  const [inputAngkatan, setInputAngkatan] = useState({ tahun: '', nama_angkatan: '', keterangan: '' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [dataEdit, setDataEdit] = useState({ id: '', tahun: '', nama_angkatan: '', keterangan: '' });

  // --- STATE SKPI RESMI ---
  const [skpiSettings, setSkpiSettings] = useState({
    skpi_format_nomor: '',
    skpi_nama_pejabat: '',
    skpi_nidn_pejabat: '',
    skpi_ttd_pejabat: '',
    skpi_background1_image: '',
    skpi_background2_image: '',
    skpi_pos_nama: '',
    skpi_pos_nim: '',
    skpi_pos_ttl: '',
    skpi_pos_prodi: '',
    skpi_pos_gelar: '',
    skpi_pos_lulus: '',
    skpi_pos_foto: '',
    skpi_pos_tabel: '',
    skpi_pos_ttd: '',
    skpi_panduan_file: '',
    panduan_admin_teks: ''
  });
  const [loadingSKPI, setLoadingSKPI] = useState(false);

  const ambilAngkatan = async () => {
    try {
      const res = await fetch('https://skpi-stikomelrahma.my.id/backend/api/umum/ambil_opsi.php?aksi=opsi_filter');
      const hasil = await res.json();
      if (hasil.status === 'sukses') setDaftarAngkatan(hasil.angkatan);
    } catch (err) { console.error("Gagal ambil data"); }
  };

  const ambilSemester = async () => {
    try {
      const res = await fetch('https://skpi-stikomelrahma.my.id/backend/api/admin/kelola_semester.php?aksi=ambil');
      const hasil = await res.json();
      if (hasil.status === 'sukses') setDataKredit(hasil.data.map(d => ({ sem: d.semester, min: d.target_poin, id: d.id })));
    } catch (err) { console.error("Gagal ambil data semester"); }
  };

  const ambilStatus = async () => {
    try {
      const res = await fetch('https://skpi-stikomelrahma.my.id/backend/api/admin/kelola_status.php?aksi=ambil');
      const hasil = await res.json();
      if (hasil.status === 'sukses') setDataStatus(hasil.data);
    } catch (err) { console.error("Gagal ambil data status"); }
  };

  const ambilPeriode = async () => {
    try {
      const res = await fetch('https://skpi-stikomelrahma.my.id/backend/api/admin/pengaturan_periode.php?aksi=ambil');
      const hasil = await res.json();
      if (hasil.status === 'sukses') setDataPeriode(hasil.data);
    } catch (err) { console.error("Gagal ambil data periode"); }
  };

  const ambilProdi = async () => {
    try {
      const res = await fetch('https://skpi-stikomelrahma.my.id/backend/api/admin/kelola_prodi.php?aksi=ambil');
      const hasil = await res.json();
      if (hasil.status === 'sukses') setDataProdi(hasil.data);
    } catch (err) { console.error("Gagal ambil data prodi"); }
  };

  const ambilPengaturanSKPI = async () => {
    try {
      const res = await fetch('https://skpi-stikomelrahma.my.id/backend/api/admin/pengaturan.php?aksi=ambil');
      const hasil = await res.json();
      if (hasil.status === 'sukses') {
        setSkpiSettings({
          skpi_format_nomor: hasil.data.skpi_format_nomor || '[NIM]/SKPI-ER/[YEAR]',
          skpi_nama_pejabat: hasil.data.skpi_nama_pejabat || '',
          skpi_nidn_pejabat: hasil.data.skpi_nidn_pejabat || '',
          skpi_ttd_pejabat: hasil.data.skpi_ttd_pejabat || '',
          skpi_background1_image: hasil.data.skpi_background1_image || '',
          skpi_background2_image: hasil.data.skpi_background2_image || '',
          skpi_pos_nama: hasil.data.skpi_pos_nama || '',
          skpi_pos_nim: hasil.data.skpi_pos_nim || '',
          skpi_pos_ttl: hasil.data.skpi_pos_ttl || '',
          skpi_pos_prodi: hasil.data.skpi_pos_prodi || '',
          skpi_pos_gelar: hasil.data.skpi_pos_gelar || '',
          skpi_pos_lulus: hasil.data.skpi_pos_lulus || '',
          skpi_pos_foto: hasil.data.skpi_pos_foto || '',
          skpi_pos_tabel: hasil.data.skpi_pos_tabel || '',
          skpi_pos_ttd: hasil.data.skpi_pos_ttd || '',
          skpi_panduan_file: hasil.data.skpi_panduan_file || '',
          panduan_admin_teks: hasil.data.panduan_admin_teks || ''
        });
      }
    } catch (err) { console.error("Gagal ambil pengaturan SKPI"); }
  };

  const simpanPengaturanSKPI = async (e) => {
    if (e) e.preventDefault();
    setLoadingSKPI(true);
    try {
      const res = await fetch('https://skpi-stikomelrahma.my.id/backend/api/admin/pengaturan.php?aksi=simpan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(skpiSettings)
      });
      const hasil = await res.json();
      if (hasil.status === 'sukses') Swal.fire('Tersimpan!', hasil.pesan, 'success');
      else Swal.fire('Gagal', hasil.pesan, 'error');
    } catch (err) { Swal.fire('Error', 'Gagal simpan ke server', 'error'); }
    finally { setLoadingSKPI(false); }
  };

  const handleHapusAngkatan = async (id) => {
    const konfirmasi = await Swal.fire({
      title: 'Hapus Angkatan?',
      text: "Data angkatan ini akan dihapus!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });
    if (!konfirmasi.isConfirmed) return;
    try {
      const res = await fetch('https://skpi-stikomelrahma.my.id/backend/api/admin/kelola_angkatan.php?aksi=hapus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if ((await res.json()).status === 'sukses') {
        Swal.fire('Dihapus!', 'Data angkatan berhasil dihapus.', 'success');
        ambilAngkatan();
      }
    } catch (err) { console.error(err); }
  };

  const handleUploadTTD = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'image/png') return Swal.fire('Format Salah', 'Gunakan file PNG transparan', 'error');
    const formData = new FormData();
    formData.append('ttd_file', file);
    setLoadingSKPI(true);
    try {
      const res = await fetch('https://skpi-stikomelrahma.my.id/backend/api/admin/upload_ttd.php', { method: 'POST', body: formData });
      const hasil = await res.json();
      if (hasil.status === 'sukses') {
        setSkpiSettings(prev => ({ ...prev, skpi_ttd_pejabat: hasil.file }));
        Swal.fire('Berhasil!', 'Tanda tangan diperbarui.', 'success');
      }
    } catch (err) { console.error(err); }
    finally { setLoadingSKPI(false); }
  };

  const handleUploadTemplate = async (e, jenis_page = 1) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file_template', file);
    formData.append('jenis_page', jenis_page);
    setLoadingSKPI(true);
    try {
      const res = await fetch('https://skpi-stikomelrahma.my.id/backend/api/admin/upload_template.php', { method: 'POST', body: formData });
      const hasil = await res.json();
      if (hasil.status === 'sukses') {
        ambilPengaturanSKPI();
        Swal.fire('Berhasil!', 'Template background diperbarui.', 'success');
      } else {
        Swal.fire('Gagal', hasil.pesan, 'error');
      }
    } catch (err) { console.error(err); }
    finally { setLoadingSKPI(false); }
  };

  const handleUploadPanduan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') return Swal.fire('Format Salah', 'Gunakan file PDF', 'error');
    const formData = new FormData();
    formData.append('file_panduan', file);
    setLoadingSKPI(true);
    try {
      const res = await fetch('https://skpi-stikomelrahma.my.id/backend/api/admin/upload_panduan.php', { method: 'POST', body: formData });
      const hasil = await res.json();
      if (hasil.status === 'sukses') {
        setSkpiSettings(prev => ({ ...prev, skpi_panduan_file: hasil.file }));
        Swal.fire('Berhasil!', 'Panduan SKPI diperbarui.', 'success');
      } else {
        Swal.fire('Gagal', hasil.pesan, 'error');
      }
    } catch (err) { console.error(err); }
    finally { setLoadingSKPI(false); }
  };

  useEffect(() => { ambilAngkatan(); ambilSemester(); ambilPengaturanSKPI(); ambilStatus(); ambilPeriode(); ambilProdi(); }, []);

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h2 className="text-3xl md:text-5xl font-black text-blue-950 uppercase italic tracking-tighter leading-none">Konfigurasi Sistem</h2>
          <div className="h-1.5 w-20 bg-blue-600 mt-4 rounded-full shadow-lg"></div>
        </div>
      </div>

      <div className="flex bg-white p-2 rounded-[2rem] shadow-sm border mb-10 overflow-x-auto no-scrollbar gap-2">
        <TabButton aktif={tabAktif === 'akademik'} onClick={() => setTabAktif('akademik')} ikon={<GraduationCap size={18} />} label="Akademik & Angkatan" />
        <TabButton aktif={tabAktif === 'prodi'} onClick={() => setTabAktif('prodi')} ikon={<AlignLeft size={18} />} label="Program Studi" />
        <TabButton aktif={tabAktif === 'status'} onClick={() => setTabAktif('status')} ikon={<Users size={18} />} label="Status Mahasiswa" />
        <TabButton aktif={tabAktif === 'periode'} onClick={() => setTabAktif('periode')} ikon={<Calendar size={18} />} label="Periode Sinkronisasi" />
        <TabButton aktif={tabAktif === 'skpi'} onClick={() => setTabAktif('skpi')} ikon={<FileText size={18} />} label="SKPI Resmi" />
        <TabButton aktif={tabAktif === 'panduan'} onClick={() => setTabAktif('panduan')} ikon={<Info size={18} />} label="Panduan Admin" />
        <TabButton aktif={tabAktif === 'keamanan'} onClick={() => setTabAktif('keamanan')} ikon={<Lock size={18} />} label="Ganti Password" />
      </div>

      <div className="min-h-[500px]">
        {tabAktif === 'akademik' && (
          <PanelAkademik
            dataKredit={dataKredit}
            daftarAngkatan={daftarAngkatan}
            inputAngkatan={inputAngkatan}
            setInputAngkatan={setInputAngkatan}
            bukaEdit={(data) => { setDataEdit(data); setShowEditModal(true); }}
            setDataEdit={setDataEdit}
            setShowEditModal={setShowEditModal}
            handleUpdateTarget={(id, val) => setDataKredit(dataKredit.map(p => p.id === id ? { ...p, min: parseInt(val) || 0 } : p))}
            handleHapusAngkatan={handleHapusAngkatan}
            onSaveSemester={async () => {
              try {
                const res = await fetch('https://skpi-stikomelrahma.my.id/backend/api/admin/kelola_semester.php?aksi=update', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(dataKredit.map(p => ({ id: p.id, target_poin: p.min })))
                });
                const h = await res.json();
                if (h.status === 'sukses') Swal.fire('Tersimpan', '', 'success');
              } catch (e) { console.error(e); }
            }}
          />
        )}
        {tabAktif === 'skpi' && (
          <PanelSKPI
            settings={skpiSettings}
            setSettings={setSkpiSettings}
            onSave={simpanPengaturanSKPI}
            onUpload={handleUploadTTD}
            onUploadTemplate={handleUploadTemplate}
            onUploadPanduan={handleUploadPanduan}
            loading={loadingSKPI}
          />
        )}
        {tabAktif === 'panduan' && (
          <PanelPanduan 
            settings={skpiSettings} 
            setSettings={setSkpiSettings} 
            onSave={simpanPengaturanSKPI} 
            loading={loadingSKPI} 
          />
        )}
        {tabAktif === 'status' && (
          <PanelStatus 
            dataStatus={dataStatus} 
            bukaEdit={(data) => { setFormStatus(data); setShowModalStatus(true); }}
            setFormStatus={setFormStatus}
            setShowModalStatus={setShowModalStatus}
            handleHapus={async (id) => {
              const konfirmasi = await Swal.fire({ title: 'Hapus Status?', text: "Data akan dihapus!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#9ca3af', confirmButtonText: 'Ya, Hapus!' });
              if (konfirmasi.isConfirmed) {
                const res = await fetch(`https://skpi-stikomelrahma.my.id/backend/api/admin/kelola_status.php?aksi=hapus`, { method: 'POST', body: JSON.stringify({ id_status: id }) });
                if ((await res.json()).status === 'sukses') { Swal.fire('Terhapus!', '', 'success'); ambilStatus(); } else Swal.fire('Gagal', 'Masih ada mahasiswa menggunakan status ini', 'error');
              }
            }}
          />
        )}
        {tabAktif === 'prodi' && (
          <PanelProdi 
            dataProdi={dataProdi} 
            bukaEdit={(data) => { setFormProdi(data); setShowModalProdi(true); }}
            setFormProdi={setFormProdi}
            setShowModalProdi={setShowModalProdi}
            handleHapus={async (id) => {
              const konfirmasi = await Swal.fire({ title: 'Hapus Prodi?', text: "Data akan dihapus!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#9ca3af', confirmButtonText: 'Ya, Hapus!' });
              if (konfirmasi.isConfirmed) {
                const res = await fetch(`https://skpi-stikomelrahma.my.id/backend/api/admin/kelola_prodi.php?aksi=hapus`, { method: 'POST', body: JSON.stringify({ id_prodi: id }) });
                const result = await res.json();
                if (result.status === 'sukses') { Swal.fire('Terhapus!', '', 'success'); ambilProdi(); } 
                else Swal.fire('Gagal', result.pesan, 'error');
              }
            }}
          />
        )}
        {tabAktif === 'periode' && (
          <PanelPeriode 
            dataPeriode={dataPeriode} 
            bukaEdit={(data) => { setFormPeriode(data); setShowModalPeriode(true); }}
            setFormPeriode={setFormPeriode}
            setShowModalPeriode={setShowModalPeriode}
            handleHapus={async (id) => {
              const konfirmasi = await Swal.fire({ title: 'Hapus Periode?', text: "Data akan dihapus!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#9ca3af', confirmButtonText: 'Ya, Hapus!' });
              if (!konfirmasi.isConfirmed) return;
              const res = await fetch(`https://skpi-stikomelrahma.my.id/backend/api/admin/pengaturan_periode.php?aksi=hapus`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id_periode: id }) });
              if ((await res.json()).status === 'sukses') { Swal.fire('Dihapus!', '', 'success'); ambilPeriode(); }
            }}
            handleSetAktif={async (id) => {
              const res = await fetch(`https://skpi-stikomelrahma.my.id/backend/api/admin/pengaturan_periode.php?aksi=set_aktif`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id_periode: id }) });
              if ((await res.json()).status === 'sukses') { Swal.fire('Diperbarui!', '', 'success'); ambilPeriode(); }
            }}
          />
        )}
        {tabAktif === 'keamanan' && (
          <PanelKeamanan pengguna={pengguna} />
        )}
      </div>

      {/* MODAL TAMBAH/EDIT ANGKATAN */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white p-8 rounded-[3rem] w-full max-w-md shadow-2xl scale-in-center">
            <h3 className="font-black text-blue-900 text-xl uppercase mb-6">{dataEdit.id ? 'Edit Data Angkatan' : 'Tambah Angkatan Baru'}</h3>
            <div className="space-y-4">
              <InputGroup label="Tahun" value={dataEdit.tahun} onChange={e => setDataEdit({ ...dataEdit, tahun: e.target.value })} />
              <InputGroup label="Nama Angkatan" value={dataEdit.nama_angkatan} onChange={e => setDataEdit({ ...dataEdit, nama_angkatan: e.target.value })} />
              <div className="flex gap-3">
                <button onClick={() => setShowEditModal(false)} className="w-1/3 bg-gray-100 text-gray-600 py-5 rounded-3xl font-black uppercase">Batal</button>
                <button onClick={async () => {
                  const aksi = dataEdit.id ? 'edit' : 'tambah';
                  const res = await fetch(`https://skpi-stikomelrahma.my.id/backend/api/admin/kelola_angkatan.php?aksi=${aksi}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dataEdit)
                  });
                  if ((await res.json()).status === 'sukses') { setShowEditModal(false); ambilAngkatan(); Swal.fire(dataEdit.id ? 'Diperbarui!' : 'Ditambahkan!', '', 'success'); }
                }} className="w-2/3 bg-blue-600 text-white py-5 rounded-3xl font-black uppercase">Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PRODI */}
      {showModalProdi && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white p-8 rounded-[3rem] w-full max-w-md shadow-2xl scale-in-center">
            <h3 className="font-black text-blue-900 text-xl uppercase mb-6">{formProdi.id_prodi ? 'Edit Prodi' : 'Tambah Prodi'}</h3>
            <div className="space-y-4">
              <InputGroup label="Nama Program Studi" value={formProdi.nama_prodi} onChange={e => setFormProdi({ ...formProdi, nama_prodi: e.target.value })} />
              <div className="text-left space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest">Jenjang Pendidikan</label>
                <select className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-blue-600 shadow-inner" value={formProdi.jenjang} onChange={e => setFormProdi({...formProdi, jenjang: e.target.value})}>
                  <option value="S1">S1 (Strata 1)</option>
                  <option value="D3">D3 (Diploma 3)</option>
                </select>
              </div>
              <InputGroup label="Gelar Lulusan (Contoh: S.Kom)" value={formProdi.gelar_lulusan} onChange={e => setFormProdi({ ...formProdi, gelar_lulusan: e.target.value })} />
              <InputGroup type="number" label="Masa Studi Normal (Dalam Tahun)" value={formProdi.masa_studi_tahun} onChange={e => setFormProdi({ ...formProdi, masa_studi_tahun: e.target.value })} />
              
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowModalProdi(false)} className="w-1/3 bg-gray-100 text-gray-600 py-5 rounded-3xl font-black uppercase">Batal</button>
                <button onClick={async () => {
                  const res = await fetch(`https://skpi-stikomelrahma.my.id/backend/api/admin/kelola_prodi.php?aksi=simpan`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formProdi)
                  });
                  if ((await res.json()).status === 'sukses') { setShowModalProdi(false); ambilProdi(); Swal.fire('Tersimpan!', '', 'success'); }
                }} className="w-2/3 bg-blue-600 text-white py-5 rounded-3xl font-black uppercase">Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL STATUS MAHASISWA */}
      {showModalStatus && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white p-8 rounded-[3rem] w-full max-w-md shadow-2xl scale-in-center">
            <h3 className="font-black text-blue-900 text-xl uppercase mb-6">{formStatus.id_status ? 'Edit Status' : 'Tambah Status'}</h3>
            <div className="space-y-4">
              <InputGroup label="Nama Status" value={formStatus.nama_status} onChange={e => setFormStatus({ ...formStatus, nama_status: e.target.value })} />
              <InputGroup label="Deskripsi" value={formStatus.deskripsi} onChange={e => setFormStatus({ ...formStatus, deskripsi: e.target.value })} />
              <div className="text-left space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest">Izin Akses SKPI</label>
                <select className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-blue-600 shadow-inner" value={formStatus.izin_akses_skpi} onChange={e => setFormStatus({...formStatus, izin_akses_skpi: e.target.value})}>
                  <option value={1}>Diizinkan</option>
                  <option value={0}>Tidak Diizinkan</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowModalStatus(false)} className="w-1/3 bg-gray-100 text-gray-600 py-5 rounded-3xl font-black uppercase">Batal</button>
                <button onClick={async () => {
                  const aksi = formStatus.id_status ? 'edit' : 'tambah';
                  const res = await fetch(`https://skpi-stikomelrahma.my.id/backend/api/admin/kelola_status.php?aksi=${aksi}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formStatus)
                  });
                  if ((await res.json()).status === 'sukses') { setShowModalStatus(false); ambilStatus(); Swal.fire('Tersimpan!', '', 'success'); }
                }} className="w-2/3 bg-blue-600 text-white py-5 rounded-3xl font-black uppercase">Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PERIODE */}
      {showModalPeriode && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white p-8 rounded-[3rem] w-full max-w-md shadow-2xl scale-in-center">
            <h3 className="font-black text-blue-900 text-xl uppercase mb-6">{formPeriode.id_periode ? 'Edit Periode' : 'Tambah Periode'}</h3>
            <div className="space-y-4">
              <InputGroup label="Nama Periode" value={formPeriode.nama_periode} onChange={e => setFormPeriode({ ...formPeriode, nama_periode: e.target.value })} />
              <InputGroup label="Tanggal Mulai (MM-DD)" value={formPeriode.tanggal_mulai} onChange={e => setFormPeriode({ ...formPeriode, tanggal_mulai: e.target.value })} />
              <InputGroup label="Tanggal Selesai (MM-DD)" value={formPeriode.tanggal_selesai} onChange={e => setFormPeriode({ ...formPeriode, tanggal_selesai: e.target.value })} />
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowModalPeriode(false)} className="w-1/3 bg-gray-100 text-gray-600 py-5 rounded-3xl font-black uppercase">Batal</button>
                <button onClick={async () => {
                  const aksi = formPeriode.id_periode ? 'edit' : 'tambah';
                  const res = await fetch(`https://skpi-stikomelrahma.my.id/backend/api/admin/pengaturan_periode.php?aksi=${aksi}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formPeriode)
                  });
                  if ((await res.json()).status === 'sukses') { setShowModalPeriode(false); ambilPeriode(); Swal.fire('Tersimpan!', '', 'success'); }
                }} className="w-2/3 bg-blue-600 text-white py-5 rounded-3xl font-black uppercase">Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TabButton = ({ aktif, onClick, ikon, label }) => (
  <button onClick={onClick} className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-[10px] uppercase transition-all whitespace-nowrap ${aktif ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}>
    {ikon} {label}
  </button>
);

const PanelAkademik = ({ dataKredit, daftarAngkatan, bukaEdit, setDataEdit, setShowEditModal, handleUpdateTarget, handleHapusAngkatan, onSaveSemester }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h4 className="font-black text-blue-900 uppercase italic flex items-center gap-3"><Users className="text-blue-600" /> Data Angkatan</h4>
        <button onClick={() => { setDataEdit({ tahun: '', nama_angkatan: '' }); setShowEditModal(true); }} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl font-black text-[10px] uppercase hover:bg-blue-600 hover:text-white transition-colors">
          + Tambah
        </button>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        {daftarAngkatan.map(ang => (
          <div key={ang.id} className="flex justify-between items-center p-5 bg-gray-50 rounded-3xl border border-gray-100">
            <div><p className="font-black text-blue-900 text-[11px] uppercase">{ang.nama_angkatan}</p><p className="text-[9px] text-gray-400 font-bold uppercase">Tahun {ang.tahun}</p></div>
            <div className="flex gap-2">
              <button onClick={() => bukaEdit(ang)} className="p-2.5 bg-white text-amber-500 rounded-xl shadow-sm border border-amber-50 hover:bg-amber-50 transition-colors" title="Edit Angkatan"><Edit3 size={14} /></button>
              <button onClick={() => handleHapusAngkatan(ang.id)} className="p-2.5 bg-white text-red-500 rounded-xl shadow-sm border border-red-50 hover:bg-red-50 transition-colors" title="Hapus Angkatan"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
      <h4 className="font-black text-blue-900 uppercase italic mb-6 flex items-center gap-3"><ShieldCheck className="text-emerald-500" /> Target Kredit UAS</h4>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {dataKredit.map((p) => (
          <div key={p.sem} className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center">
            <span className="font-black text-gray-400 text-[10px] uppercase">Smt {p.sem}</span>
            <input type="number" value={p.min} onChange={(e) => handleUpdateTarget(p.id, e.target.value)} className="w-16 bg-white p-2 rounded-xl text-center font-black text-blue-600 outline-none" />
          </div>
        ))}
      </div>
      <button onClick={onSaveSemester} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2"><Save size={16} /> Simpan Target</button>
    </div>
  </div>
);

const PanelStatus = ({ dataStatus, bukaEdit, setFormStatus, setShowModalStatus, handleHapus }) => (
  <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
    <div className="flex justify-between items-center mb-6">
      <h4 className="font-black text-blue-900 uppercase italic flex items-center gap-3"><Users className="text-blue-600" /> Master Status Mahasiswa</h4>
      <button onClick={() => { setFormStatus({ id_status: '', nama_status: '', deskripsi: '', izin_akses_skpi: 1 }); setShowModalStatus(true); }} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl font-black text-[10px] uppercase hover:bg-blue-600 hover:text-white transition-colors">
        + Tambah
      </button>
    </div>
    <div className="space-y-3">
      {dataStatus.map(st => (
        <div key={st.id_status} className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 bg-gray-50 rounded-3xl border border-gray-100 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <p className="font-black text-blue-900 text-sm uppercase">{st.nama_status}</p>
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${st.izin_akses_skpi == 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {st.izin_akses_skpi == 1 ? 'Diizinkan Akses SKPI' : 'Akses SKPI Ditolak'}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-1">{st.deskripsi || 'Tidak ada deskripsi'}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => bukaEdit(st)} className="p-2.5 bg-white text-amber-500 rounded-xl shadow-sm border border-amber-50 hover:bg-amber-50 transition-colors" title="Edit Status"><Edit3 size={14} /></button>
            <button onClick={() => handleHapus(st.id_status)} className="p-2.5 bg-white text-red-500 rounded-xl shadow-sm border border-red-50 hover:bg-red-50 transition-colors" title="Hapus Status"><Trash2 size={14} /></button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const PanelProdi = ({ dataProdi, bukaEdit, setFormProdi, setShowModalProdi, handleHapus }) => (
  <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
    <div className="flex justify-between items-center mb-6">
      <h4 className="font-black text-blue-900 uppercase italic flex items-center gap-3"><AlignLeft className="text-blue-600" /> Master Program Studi</h4>
      <button onClick={() => { setFormProdi({ id_prodi: '', nama_prodi: '', jenjang: 'S1', gelar_lulusan: '', masa_studi_tahun: 4 }); setShowModalProdi(true); }} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl font-black text-[10px] uppercase hover:bg-blue-600 hover:text-white transition-colors">
        + Tambah
      </button>
    </div>
    <div className="space-y-3">
      {dataProdi.map(pr => (
        <div key={pr.id_prodi} className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 bg-gray-50 rounded-3xl border border-gray-100 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <p className="font-black text-blue-900 text-sm uppercase">{pr.nama_prodi}</p>
              <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase bg-blue-100 text-blue-700">
                {pr.jenjang}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-1">Gelar: <span className="font-bold">{pr.gelar_lulusan}</span> • Masa Studi: <span className="font-bold">{pr.masa_studi_tahun} Tahun</span></p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => bukaEdit(pr)} className="p-2.5 bg-white text-amber-500 rounded-xl shadow-sm border border-amber-50 hover:bg-amber-50 transition-colors" title="Edit Prodi"><Edit3 size={14} /></button>
            <button onClick={() => handleHapus(pr.id_prodi)} className="p-2.5 bg-white text-red-500 rounded-xl shadow-sm border border-red-50 hover:bg-red-50 transition-colors" title="Hapus Prodi"><Trash2 size={14} /></button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const PanelPeriode = ({ dataPeriode, bukaEdit, setFormPeriode, setShowModalPeriode, handleHapus, handleSetAktif }) => (
  <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
    <div className="flex justify-between items-center mb-6">
      <h4 className="font-black text-blue-900 uppercase italic flex items-center gap-3"><Calendar className="text-blue-600" /> Pengaturan Periode & Sinkronisasi</h4>
      <button onClick={() => { setFormPeriode({ id_periode: '', nama_periode: '', tanggal_mulai: '', tanggal_selesai: '', is_aktif: 0 }); setShowModalPeriode(true); }} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl font-black text-[10px] uppercase hover:bg-blue-600 hover:text-white transition-colors">
        + Tambah
      </button>
    </div>
    <div className="space-y-3">
      {dataPeriode.map(pr => (
        <div key={pr.id_periode} className={`flex flex-col md:flex-row justify-between items-start md:items-center p-5 rounded-3xl border ${pr.is_aktif == 1 ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-gray-50 border-gray-100'} gap-4`}>
          <div>
            <div className="flex items-center gap-3">
              <p className="font-black text-blue-900 text-sm uppercase">{pr.nama_periode}</p>
              {pr.is_aktif == 1 && <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase bg-blue-600 text-white shadow-sm">Periode Aktif Saat Ini</span>}
            </div>
            <p className="text-xs text-gray-500 font-bold uppercase mt-1 tracking-widest">{pr.tanggal_mulai} s/d {pr.tanggal_selesai}</p>
          </div>
          <div className="flex gap-2 items-center w-full md:w-auto">
            {pr.is_aktif == 0 && (
              <button onClick={() => handleSetAktif(pr.id_periode)} className="flex-1 md:flex-none px-4 py-2.5 bg-white text-emerald-600 font-black text-[10px] uppercase tracking-widest rounded-xl shadow-sm border border-emerald-100 hover:bg-emerald-50 transition-colors">Set Aktif</button>
            )}
            <button onClick={() => bukaEdit(pr)} className="p-2.5 bg-white text-amber-500 rounded-xl shadow-sm border border-amber-50 hover:bg-amber-50 transition-colors" title="Edit Periode"><Edit3 size={14} /></button>
            <button onClick={() => handleHapus(pr.id_periode)} className="p-2.5 bg-white text-red-500 rounded-xl shadow-sm border border-red-50 hover:bg-red-50 transition-colors" title="Hapus Periode"><Trash2 size={14} /></button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const VisualEditor = ({ settings, setSettings, onSave, loading }) => {
  const [activeItems, setActiveItems] = useState([]);
  const [pageAktif, setPageAktif] = useState(1);
  const [toolbarPos, setToolbarPos] = useState({ x: 0, y: 0 });

  const handleDragStart = (e, key) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;

    let newActiveItems = [...activeItems];
    if (e.shiftKey || e.ctrlKey) {
      if (newActiveItems.includes(key)) {
        newActiveItems = newActiveItems.filter(item => item !== key);
      } else {
        newActiveItems.push(key);
      }
    } else {
      if (!newActiveItems.includes(key)) {
        newActiveItems = [key];
      }
    }
    setActiveItems(newActiveItems);

    let initialPositions = {};
    newActiveItems.forEach(item => {
      try {
        if (settings[item]) initialPositions[item] = JSON.parse(settings[item]);
        else initialPositions[item] = { top: 0, left: 0 };
      } catch (err) { initialPositions[item] = { top: 0, left: 0 }; }
    });

    const handleMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      setSettings(prev => {
        const updatedSettings = { ...prev };
        newActiveItems.forEach(item => {
          const currentPos = initialPositions[item];
          const newPos = { ...currentPos };

          if (newPos.top !== undefined) newPos.top = Math.round(currentPos.top + dy);
          if (newPos.left !== undefined) newPos.left = Math.round(currentPos.left + dx);
          if (newPos.bottom !== undefined) newPos.bottom = Math.round(currentPos.bottom - dy);
          if (newPos.right !== undefined) newPos.right = Math.round(currentPos.right - dx);

          updatedSettings[item] = JSON.stringify(newPos);
        });
        return updatedSettings;
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleToolbarDrag = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const currentX = toolbarPos.x;
    const currentY = toolbarPos.y;

    const onMouseMove = (moveEvent) => {
      setToolbarPos({
        x: currentX + (moveEvent.clientX - startX),
        y: currentY + (moveEvent.clientY - startY)
      });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const getStyle = (key) => {
    try {
      if (settings[key]) {
        const p = JSON.parse(settings[key]);
        return {
          top: p.top !== undefined ? p.top + 'px' : 'auto',
          left: p.left !== undefined ? p.left + 'px' : 'auto',
          bottom: p.bottom !== undefined ? p.bottom + 'px' : 'auto',
          right: p.right !== undefined ? p.right + 'px' : 'auto',
          fontSize: p.fontSize ? p.fontSize + 'px' : 'inherit',
          color: p.color || 'inherit',
          fontFamily: p.fontFamily || 'inherit',
          textAlign: p.textAlign || 'inherit',
          fontWeight: p.fontWeight || 'inherit',
        };
      }
    } catch (e) { }
    return { top: '0px', left: '0px' };
  };

  const handleStyleChange = (prop, value) => {
    try {
      setSettings(prev => {
        const updatedSettings = { ...prev };
        activeItems.forEach(key => {
          let currentPos = {};
          if (updatedSettings[key]) currentPos = JSON.parse(updatedSettings[key]);
          currentPos[prop] = value;
          updatedSettings[key] = JSON.stringify(currentPos);
        });
        return updatedSettings;
      });
    } catch (e) { console.error(e); }
  };

  const handleAlign = (alignmentType) => {
    if (activeItems.length < 2) return;
    setSettings(prev => {
      const updatedSettings = { ...prev };
      let positions = activeItems.map(key => {
        let pos = { left: 0 };
        if (updatedSettings[key]) {
          try { pos = JSON.parse(updatedSettings[key]); } catch(e) {}
        }
        return { key, left: pos.left || 0 };
      });
      
      let targetLeft = 0;
      if (alignmentType === 'left') {
        targetLeft = Math.min(...positions.map(p => p.left));
      } else if (alignmentType === 'right') {
        targetLeft = Math.max(...positions.map(p => p.left));
      }
      
      activeItems.forEach(key => {
        let currentPos = {};
        if (updatedSettings[key]) {
          try { currentPos = JSON.parse(updatedSettings[key]); } catch(e) {}
        }
        currentPos.left = targetLeft;
        updatedSettings[key] = JSON.stringify(currentPos);
      });
      return updatedSettings;
    });
  };

  const getActiveStyleValue = (prop, defaultVal = '') => {
    if (activeItems.length === 0 || !settings[activeItems[0]]) return defaultVal;
    try {
      const p = JSON.parse(settings[activeItems[0]]);
      return p[prop] || defaultVal;
    } catch (e) { return defaultVal; }
  };

  const renderItem = (key, content, defaultSize = null) => (
    <div
      onMouseDown={(e) => handleDragStart(e, key)}
      className={`absolute cursor-move transition-transform select-none border-2 border-dashed hover:bg-blue-400/10 group ${activeItems.includes(key) ? 'border-red-500 ring-2 ring-red-500 bg-red-100/30 z-50' : 'border-blue-400/50 z-40'}`}
      style={{ ...getStyle(key), width: defaultSize?.width, height: defaultSize?.height }}
    >
      <div className="absolute -top-6 left-0 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {key.replace('skpi_pos_', '')}
      </div>
      {/* Jika content berupa element teks (p), kita force unset class tailwind bawaan agar inline style bisa menimpa, jika bukan biarkan apa adanya */}
      {React.isValidElement(content) && content.type === 'p' 
        ? React.cloneElement(content, { className: content.props.className.replace(/text-gray-900|text-\[15px\]|font-bold/g, '') }) 
        : content}
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col items-center">

      {/* TABS HALAMAN & BUTTONS */}
      <div className="w-full flex flex-col xl:flex-row justify-between items-center bg-gray-100 p-4 rounded-3xl mb-6 shadow-inner gap-4">
        <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-gray-200 gap-2">
          <button
            onClick={() => setPageAktif(1)}
            className={`px-6 py-3 rounded-xl font-black text-[11px] uppercase transition-all ${pageAktif === 1 ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Halaman 1 (Identitas)
          </button>
          <button
            onClick={() => setPageAktif(2)}
            className={`px-6 py-3 rounded-xl font-black text-[11px] uppercase transition-all ${pageAktif === 2 ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Halaman 2 (Tabel)
          </button>
        </div>

        <div className="flex gap-3">
          <a href="/skpi-resmi?preview=true" className="bg-white border-2 border-blue-100 text-blue-600 px-6 py-3 rounded-xl font-black text-[10px] uppercase shadow-sm hover:bg-blue-50 transition-all flex items-center gap-2">
            Pratinjau PDF SKPI
          </a>
          <button
            onClick={onSave}
            disabled={loading}
            className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {loading ? 'Menyimpan...' : 'Simpan Koordinat'}
          </button>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-[3rem] overflow-auto shadow-inner relative flex-1 max-h-[800px] border-4 border-gray-100 custom-scrollbar">
        <div className="sticky top-6 left-6 z-50 inline-flex flex-col gap-2 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl text-[11px] font-black uppercase text-blue-900 shadow-lg border-2 border-blue-100 pointer-events-auto w-max">
            Geser kotak biru untuk memposisikan teks
          </div>
          
          {/* FLOATING TOOLBAR (HANYA MUNCUL JIKA ADA ITEM DIPILIH) */}
          {activeItems.length > 0 && !activeItems.some(i => i.includes('foto') || i.includes('tabel')) && (
            <div 
              className="bg-white/95 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border-2 border-blue-100 flex flex-col gap-4 animate-in fade-in w-72 pointer-events-auto"
              style={{ transform: `translate(${toolbarPos.x}px, ${toolbarPos.y}px)` }}
            >
              <div 
                className="flex justify-between items-center cursor-move p-2 -m-2 mb-0 hover:bg-gray-50 rounded-xl transition-colors" 
                onMouseDown={handleToolbarDrag}
                title="Tahan dan geser panel ini"
              >
                <span className="font-black text-xs text-red-600 uppercase tracking-widest pointer-events-none">{activeItems.length} Elemen Terpilih</span>
                <button onMouseDown={e => e.stopPropagation()} onClick={() => setActiveItems([])} className="text-gray-400 hover:text-red-500 bg-red-50 hover:bg-red-100 p-1 rounded-full transition-colors"><X size={14}/></button>
              </div>
              
              <div className="flex flex-col gap-3">
                {/* Font Size & Color */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase flex items-center gap-1"><Type size={10}/> Ukuran Font (px)</label>
                    <input type="number" value={getActiveStyleValue('fontSize', '15')} onChange={e => handleStyleChange('fontSize', e.target.value)} className="bg-gray-100 p-2 rounded-xl text-xs font-bold text-gray-800 outline-none w-full border border-transparent focus:border-blue-400" />
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase flex items-center gap-1"><Palette size={10}/> Warna Teks</label>
                    <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-xl border border-transparent focus-within:border-blue-400">
                      <input type="color" value={getActiveStyleValue('color', '#111827')} onChange={e => handleStyleChange('color', e.target.value)} className="w-6 h-6 rounded cursor-pointer border-none p-0 bg-transparent" />
                      <span className="text-[10px] font-bold text-gray-700 uppercase">{getActiveStyleValue('color', '#111827')}</span>
                    </div>
                  </div>
                </div>

                {/* Font Family */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase">Jenis Font (Font Family)</label>
                  <select value={getActiveStyleValue('fontFamily', 'inherit')} onChange={e => handleStyleChange('fontFamily', e.target.value)} className="bg-gray-100 p-2 rounded-xl text-xs font-bold text-gray-800 outline-none w-full border border-transparent focus:border-blue-400">
                    <option value="inherit">Sesuai Tema (Default)</option>
                    <option value="'Poppins', sans-serif">Poppins</option>
                    <option value="'Arial', sans-serif">Arial</option>
                    <option value="'Times New Roman', serif">Times New Roman</option>
                    <option value="'Courier New', monospace">Courier New</option>
                  </select>
                </div>

                {/* Text Alignment & Formatting */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase">Teks Align & Format</label>
                  <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                    <button onClick={() => handleStyleChange('textAlign', 'left')} className={`flex-1 flex justify-center p-2 rounded-lg transition-colors ${getActiveStyleValue('textAlign', 'left') === 'left' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:bg-gray-200'}`} title="Align Left"><AlignLeft size={14}/></button>
                    <button onClick={() => handleStyleChange('textAlign', 'center')} className={`flex-1 flex justify-center p-2 rounded-lg transition-colors ${getActiveStyleValue('textAlign', 'left') === 'center' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:bg-gray-200'}`} title="Align Center"><AlignCenter size={14}/></button>
                    <button onClick={() => handleStyleChange('textAlign', 'right')} className={`flex-1 flex justify-center p-2 rounded-lg transition-colors ${getActiveStyleValue('textAlign', 'left') === 'right' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:bg-gray-200'}`} title="Align Right"><AlignRight size={14}/></button>
                    <div className="w-px bg-gray-300 mx-1"></div>
                    <button onClick={() => handleStyleChange('fontWeight', getActiveStyleValue('fontWeight', 'bold') === 'bold' ? 'normal' : 'bold')} className={`flex-1 flex justify-center p-2 rounded-lg transition-colors ${getActiveStyleValue('fontWeight', 'bold') === 'bold' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-400 hover:bg-gray-200'}`} title="Bold Text"><Bold size={14}/></button>
                  </div>
                </div>

                {/* Spatial Alignment */}
                {activeItems.length > 1 && (
                  <div className="flex flex-col gap-1 pt-2 border-t border-blue-100 mt-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase">Samakan Koordinat (Posisi X)</label>
                    <div className="flex gap-2">
                      <button onClick={() => handleAlign('left')} className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 p-2 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-colors">
                        <ArrowLeftToLine size={12}/> Rata Kiri
                      </button>
                      <button onClick={() => handleAlign('right')} className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 p-2 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-colors">
                        Rata Kanan <ArrowRightToLine size={12}/>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-center w-full min-w-max pb-20 pt-2">
          <div
            className="relative bg-white shadow-2xl origin-top transition-all duration-500 shrink-0"
            style={{ width: '794px', height: '1123px', transform: 'scale(1)' }}
          >
          {pageAktif === 1 ? (
            <>
              {settings.skpi_background1_image ? (
                <img src={`https://skpi-stikomelrahma.my.id/backend/unggahan/template_skpi/${settings.skpi_background1_image}`} className="w-full h-full object-cover pointer-events-none" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 font-black text-2xl uppercase border-4 border-dashed border-gray-200">Belum Ada Background Hal 1</div>
              )}
              {renderItem('skpi_pos_nomor', <p className="text-white font-bold text-sm tracking-widest whitespace-nowrap">241107001/SKPI-ER/2026</p>)}
              {renderItem('skpi_pos_foto', <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs font-bold uppercase rounded-md border-2 border-dashed border-gray-300">FOTO 2x3</div>, { width: 120, height: 180 })}
              {renderItem('skpi_pos_nama', <p className="font-bold text-gray-900 text-[15px] uppercase whitespace-nowrap">[NAMA MAHASISWA]</p>)}
              {renderItem('skpi_pos_nim', <p className="font-bold text-gray-900 text-[15px] uppercase">[NIM]</p>)}
              {renderItem('skpi_pos_ttl', <p className="font-bold text-gray-900 text-[15px] uppercase whitespace-nowrap">[TEMPAT, TANGGAL LAHIR]</p>)}
              {renderItem('skpi_pos_prodi', <p className="font-bold text-gray-900 text-[15px] uppercase">[PROGRAM STUDI]</p>)}
              {renderItem('skpi_pos_gelar', <p className="font-bold text-gray-900 text-[15px] uppercase">[GELAR]</p>)}
              {renderItem('skpi_pos_lulus', <p className="font-bold text-gray-900 text-[15px] uppercase">[TARGET LULUS]</p>)}
            </>
          ) : (
            <>
              {settings.skpi_background2_image ? (
                <img src={`https://skpi-stikomelrahma.my.id/backend/unggahan/template_skpi/${settings.skpi_background2_image}`} className="w-full h-full object-cover pointer-events-none" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 font-black text-2xl uppercase border-4 border-dashed border-gray-200">Belum Ada Background Hal 2</div>
              )}
              {renderItem('skpi_pos_nomor', <p className="text-white font-bold text-sm tracking-widest whitespace-nowrap">241107001/SKPI-ER/2026</p>)}
              {renderItem('skpi_pos_tabel', (
                <div className="w-full h-full border-4 border-blue-200 bg-blue-50/50 flex flex-col items-center justify-center font-black text-blue-400 uppercase text-xl">
                  <p>TABEL KEGIATAN SKPI</p>
                  <p className="text-[10px] mt-2 font-bold text-gray-500">Tanda Tangan akan otomatis menempel di bawah tabel pada halaman terakhir</p>
                </div>
              ), { width: 660, height: 350 })}
            </>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

const PanelSKPI = ({ settings, setSettings, onSave, onUpload, onUploadTemplate, onUploadPanduan, loading }) => (
  <>
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-in slide-in-from-bottom-5 duration-500">
      <div className="space-y-8">
        {/* TTD */}
        <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-gray-100 text-center">
          <h4 className="font-black text-blue-900 uppercase italic mb-8 flex justify-center items-center gap-3"><Signature className="text-blue-600" /> Tanda Tangan Pejabat</h4>
          <div className="relative group bg-gray-50 p-8 rounded-[2rem] border-2 border-dashed border-gray-200">
            {settings.skpi_ttd_pejabat ? <img src={`https://skpi-stikomelrahma.my.id/backend/unggahan/tanda_tangan/${settings.skpi_ttd_pejabat}`} className="max-h-32 mx-auto drop-shadow-lg" /> : <div className="py-10 text-gray-300 font-black uppercase text-[10px]">Upload PNG Transparan</div>}
            <input type="file" accept="image/png" className="absolute inset-0 opacity-0 cursor-pointer z-50" onChange={onUpload} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <InputGroup label="Nama Pejabat" value={settings.skpi_nama_pejabat} onChange={e => setSettings({ ...settings, skpi_nama_pejabat: e.target.value })} />
            <InputGroup label="NIDN / NIP" value={settings.skpi_nidn_pejabat} onChange={e => setSettings({ ...settings, skpi_nidn_pejabat: e.target.value })} />
          </div>
          <button onClick={onSave} disabled={loading} className="mt-6 w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Simpan Data Pejabat
          </button>
        </div>

        {/* BACKGROUND */}
        <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-gray-100">
          <h4 className="font-black text-blue-900 uppercase italic mb-8 flex items-center gap-3"><ImageIcon className="text-emerald-500" /> Template Background SKPI</h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3 text-center">
              <label className="text-[10px] font-black uppercase tracking-widest text-blue-900">Background Halaman 1</label>
              <div className="relative rounded-[2rem] overflow-hidden border-4 border-white shadow-xl bg-gray-50 min-h-[150px] flex items-center justify-center group">
                {settings.skpi_background1_image ? <img src={`https://skpi-stikomelrahma.my.id/backend/unggahan/template_skpi/${settings.skpi_background1_image}`} className="w-full h-full object-cover" /> : <div className="text-gray-300 font-black uppercase text-[9px] px-4 text-center">Klik Upload Hal 1</div>}
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-50" onChange={(e) => onUploadTemplate(e, 1)} />
                <div className="absolute inset-0 bg-emerald-600/20 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"><button className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase">Ganti Gambar</button></div>
              </div>
            </div>

            <div className="space-y-3 text-center">
              <label className="text-[10px] font-black uppercase tracking-widest text-blue-900">Background Halaman 2</label>
              <div className="relative rounded-[2rem] overflow-hidden border-4 border-white shadow-xl bg-gray-50 min-h-[150px] flex items-center justify-center group">
                {settings.skpi_background2_image ? <img src={`https://skpi-stikomelrahma.my.id/backend/unggahan/template_skpi/${settings.skpi_background2_image}`} className="w-full h-full object-cover" /> : <div className="text-gray-300 font-black uppercase text-[9px] px-4 text-center">Klik Upload Hal 2</div>}
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-50" onChange={(e) => onUploadTemplate(e, 2)} />
                <div className="absolute inset-0 bg-emerald-600/20 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"><button className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase">Ganti Gambar</button></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-gray-100">
          <h4 className="font-black text-blue-900 uppercase italic mb-8 flex items-center gap-3"><FileText className="text-blue-600" /> Format Nomor</h4>
          <InputGroup label="Format Nomor Surat" value={settings.skpi_format_nomor} onChange={e => setSettings({ ...settings, skpi_format_nomor: e.target.value })} />
          <p className="text-[10px] font-bold text-gray-400 uppercase mt-4 mb-6">Tersedia: [NIM], [YEAR], [MONTH]</p>
          <button onClick={onSave} disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Simpan Format Nomor
          </button>
        </div>

        {/* PANDUAN SKPI */}
        <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-gray-100 text-center">
          <h4 className="font-black text-blue-900 uppercase italic mb-8 flex justify-center items-center gap-3"><FileText className="text-emerald-500" /> Panduan Bobot SKPI (PDF)</h4>
          <div className="relative group bg-gray-50 p-8 rounded-[2rem] border-2 border-dashed border-gray-200">
            {settings.skpi_panduan_file ? (
              <div className="flex flex-col items-center gap-3">
                <FileText size={40} className="text-emerald-500" />
                <p className="text-xs font-bold text-gray-600">{settings.skpi_panduan_file}</p>
                <div className="flex gap-2">
                  <a href={`https://skpi-stikomelrahma.my.id/backend/unggahan/panduan_skpi/${settings.skpi_panduan_file}`} target="_blank" rel="noreferrer" className="bg-blue-100 text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase z-50 relative">Buka Preview</a>
                  <button className="bg-emerald-100 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase relative pointer-events-none">Ganti PDF</button>
                </div>
              </div>
            ) : (
              <div className="py-10 text-gray-300 font-black uppercase text-[10px]">Upload Panduan PDF</div>
            )}
            <input type="file" accept="application/pdf" className="absolute inset-0 opacity-0 cursor-pointer z-[40]" onChange={onUploadPanduan} />
          </div>
          <p className="text-[10px] font-bold text-gray-400 mt-4 leading-relaxed">
            * Panduan ini akan muncul di halaman Mahasiswa pada saat melakukan Input SKPI. Jika ada revisi pedoman terbaru, cukup upload file PDF yang baru untuk menggantikannya.
          </p>
        </div>
      </div>
    </div>

    <div className="mt-8 space-y-8">
      {/* VISUAL EDITOR */}
      <div className="bg-white p-6 rounded-[3.5rem] shadow-sm border border-gray-100 flex flex-col h-full relative xl:col-span-2">
        <VisualEditor settings={settings} setSettings={setSettings} onSave={onSave} loading={loading} />
      </div>
    </div>
  </>
);

const PlaceholderItem = ({ code, desc }) => (
  <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-50"><code className="text-[11px] font-black text-blue-600">{code}</code><span className="text-[10px] font-bold text-gray-400 uppercase">{desc}</span></div>
);

const PanelKeamanan = ({ pengguna }) => {
  const [passwordLama, setPasswordLama] = useState('');
  const [passwordBaru, setPasswordBaru] = useState('');
  const [konfirmasiPassword, setKonfirmasiPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async () => {
    if (!passwordLama || !passwordBaru || !konfirmasiPassword) {
      return Swal.fire('Error', 'Semua kolom harus diisi!', 'warning');
    }
    if (passwordBaru !== konfirmasiPassword) {
      return Swal.fire('Error', 'Konfirmasi password tidak cocok!', 'warning');
    }

    setLoading(true);
    try {
      const res = await fetch('https://skpi-stikomelrahma.my.id/backend/api/admin/ganti_password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomor_induk: pengguna?.nomor_induk,
          password_lama: passwordLama,
          password_baru: passwordBaru
        })
      });
      const hasil = await res.json();
      if (hasil.status === 'sukses') {
        Swal.fire('Berhasil!', hasil.pesan, 'success');
        setPasswordLama('');
        setPasswordBaru('');
        setKonfirmasiPassword('');
      } else {
        Swal.fire('Gagal', hasil.pesan, 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Gagal terhubung ke server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-[2rem] mx-auto flex items-center justify-center text-red-500 mb-6 shadow-lg">
          <Lock size={32} />
        </div>
        <h3 className="text-2xl font-black text-blue-900 uppercase italic mb-10">Perbarui Kata Sandi</h3>
        <div className="space-y-4">
          <input 
            type="password" 
            placeholder="Password Saat Ini" 
            value={passwordLama}
            onChange={(e) => setPasswordLama(e.target.value)}
            className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-blue-600" 
          />
          <input 
            type="password" 
            placeholder="Password Baru" 
            value={passwordBaru}
            onChange={(e) => setPasswordBaru(e.target.value)}
            className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-blue-600" 
          />
          <input 
            type="password" 
            placeholder="Konfirmasi Password Baru" 
            value={konfirmasiPassword}
            onChange={(e) => setKonfirmasiPassword(e.target.value)}
            className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-blue-600" 
          />
          <button 
            onClick={handleUpdatePassword}
            disabled={loading}
            className="w-full bg-gray-900 text-white py-5 rounded-3xl font-black uppercase shadow-xl mt-6 flex items-center justify-center gap-3 transition-all hover:bg-black disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCcw size={18} />} 
            {loading ? 'Menyimpan...' : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  );
};

const PanelPanduan = ({ settings, setSettings, onSave, loading }) => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-gray-100">
        <h3 className="text-2xl font-black text-blue-900 uppercase italic mb-6">Panduan Admin</h3>
        <p className="text-xs font-medium text-gray-500 mb-6">Teks ini akan muncul jika Admin menekan tombol Panduan Penggunaan di sidebar/header.</p>
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Isi Panduan Penggunaan</label>
          <textarea
            className="w-full h-[400px] p-5 bg-gray-50 rounded-3xl font-medium text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-600 shadow-inner resize-none"
            placeholder="Ketik panduan penggunaan untuk admin di sini..."
            value={settings.panduan_admin_teks || ''}
            onChange={(e) => setSettings({ ...settings, panduan_admin_teks: e.target.value })}
          />
        </div>
        <div className="mt-8">
          <button 
            onClick={onSave} 
            disabled={loading} 
            className="w-full bg-blue-600 text-white py-4 rounded-3xl font-black uppercase shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Simpan Panduan Admin
          </button>
        </div>
      </div>
    </div>
  );
};

const InputGroup = ({ label, value, onChange, type = "text" }) => (
  <div className="text-left space-y-2">
    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest">{label}</label>
    <input 
      type={type} 
      value={value} 
      onChange={onChange} 
      className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-blue-600 shadow-inner" 
    />
  </div>
);

export default Pengaturan;
