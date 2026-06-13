import React, { useContext, useEffect, useState, useCallback } from 'react';
import { KonteksPengguna } from '../../context/InfoPengguna';
import { Eye, Edit3, X, Loader2, UploadCloud, AlertCircle, FileSearch, Clock, CheckCircle2, XCircle, Calendar, Award, Save } from 'lucide-react';
import Swal from 'sweetalert2';
import ActionMenu from '../../components/ActionMenu';

const StatusAjuan = () => {
  const { pengguna } = useContext(KonteksPengguna);
  const [daftarAjuan, setDaftarAjuan] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showDetail, setShowDetail] = useState(false);
  const [showBerkas, setShowBerkas] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [target, setTarget] = useState(null);
  const [fileBaru, setFileBaru] = useState(null);

  // States untuk Edit Dropdown
  const [masterKategori, setMasterKategori] = useState([]);
  const [opsiKategori, setOpsiKategori] = useState([]);
  const [opsiKegiatan, setOpsiKegiatan] = useState([]);
  const [opsiTingkat, setOpsiTingkat] = useState([]);
  const [opsiPartisipasi, setOpsiPartisipasi] = useState([]);
  
  const [formData, setFormData] = useState({
    id_master_kategori: '',
    kategori_utama: '',
    nama_kegiatan: '',
    tingkat: '',
    partisipasi: '',
    poin: 0,
    waktu_pelaksanaan: ''
  });

  const ambilData = useCallback(async () => {
    if (!pengguna?.nomor_induk) return;
    setLoading(true);
    try {
      const respon = await fetch(`https://skpi-stikomelrahma.my.id/backend/api/mahasiswa/ambil_status_ajuan.php?nim=${pengguna.nomor_induk}`);
      const hasil = await respon.json();
      if (hasil.status === 'sukses') {
        setDaftarAjuan(hasil.data);
      }
    } catch (error) {
      console.error("Gagal sinkronisasi data");
    } finally {
      setLoading(false);
    }
  }, [pengguna?.nomor_induk]);

  // Ambil Data Master Kategori
  useEffect(() => {
    const fetchMaster = async () => {
      try {
        const res = await fetch('https://skpi-stikomelrahma.my.id/backend/api/admin/kelola_kategori.php?aksi=ambil');
        const hasil = await res.json();
        if (hasil.status === 'sukses') {
          setMasterKategori(hasil.data);
          const kategoriUnik = [...new Set(hasil.data.map(item => item.kategori_utama))];
          setOpsiKategori(kategoriUnik);
        }
      } catch (err) {
        console.error("Gagal mengambil master kategori");
      }
    };
    fetchMaster();
    ambilData();
  }, [ambilData]);

  // Logika Dependent Dropdown untuk Form Edit
  useEffect(() => {
    if (formData.kategori_utama) {
      const filtered = masterKategori.filter(item => item.kategori_utama === formData.kategori_utama);
      setOpsiKegiatan([...new Set(filtered.map(item => item.nama_kegiatan))]);
    } else {
      setOpsiKegiatan([]);
    }
  }, [formData.kategori_utama, masterKategori]);

  useEffect(() => {
    if (formData.nama_kegiatan) {
      const filtered = masterKategori.filter(item => 
        item.kategori_utama === formData.kategori_utama && 
        item.nama_kegiatan === formData.nama_kegiatan
      );
      setOpsiTingkat([...new Set(filtered.map(item => item.tingkat))]);
    } else {
      setOpsiTingkat([]);
    }
  }, [formData.nama_kegiatan, formData.kategori_utama, masterKategori]);

  useEffect(() => {
    if (formData.tingkat) {
      const filtered = masterKategori.filter(item => 
        item.kategori_utama === formData.kategori_utama && 
        item.nama_kegiatan === formData.nama_kegiatan &&
        item.tingkat === formData.tingkat
      );
      setOpsiPartisipasi([...new Set(filtered.map(item => item.partisipasi))]);
    } else {
      setOpsiPartisipasi([]);
    }
  }, [formData.tingkat, formData.nama_kegiatan, formData.kategori_utama, masterKategori]);

  useEffect(() => {
    const match = masterKategori.find(item => 
      item.kategori_utama === formData.kategori_utama &&
      item.nama_kegiatan === formData.nama_kegiatan &&
      item.tingkat === formData.tingkat &&
      item.partisipasi === formData.partisipasi
    );
    if (match) {
      setFormData(prev => ({ ...prev, poin: match.bobot, id_master_kategori: match.id_master_kategori }));
    }
  }, [formData.partisipasi, formData.tingkat, formData.nama_kegiatan, formData.kategori_utama, masterKategori]);

  const bukaModalEdit = (item) => {
    setTarget(item);
    setFormData({
      id_master_kategori: item.id_master_kategori || '',
      kategori_utama: item.kategori_utama || '',
      nama_kegiatan: item.master_nama_kegiatan || '',
      tingkat: item.tingkat || '',
      partisipasi: item.partisipasi || '',
      poin: item.poin || 0,
      waktu_pelaksanaan: item.waktu_pelaksanaan || ''
    });
    setFileBaru(null);
    setShowEdit(true);
  };

  const handleSimpanEdit = async (e) => {
    e.preventDefault();
    if (!formData.id_master_kategori) {
       return Swal.fire('Peringatan', 'Harap lengkapi semua isian kategori!', 'warning');
    }

    Swal.fire({ title: 'Menyimpan...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    const fData = new FormData();
    fData.append('id', target.id);
    fData.append('id_master_kategori', formData.id_master_kategori);
    fData.append('waktu_pelaksanaan', formData.waktu_pelaksanaan);
    if (fileBaru) fData.append('sertifikat', fileBaru);

    try {
      const res = await fetch('https://skpi-stikomelrahma.my.id/backend/api/mahasiswa/ambil_status_ajuan.php', {
        method: 'POST',
        body: fData
      });
      const hasil = await res.json();
      if (hasil.status === 'sukses') {
        Swal.fire({ icon: 'success', title: 'Berhasil!', text: hasil.pesan, timer: 1500 });
        setShowEdit(false);
        ambilData(); 
      } else {
        Swal.fire('Gagal', hasil.pesan, 'error');
      }
    } catch (err) { Swal.fire('Error', 'Gagal menyambung ke server', 'error'); }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      {/* Header EDOM Style */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-gray-900">Riwayat Ajuan</span>
          </h2>
          <p className="text-sm font-medium text-gray-500 mt-1 flex items-center gap-1">
            Status Validasi Sertifikat & Kegiatan
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible">
        <div className="overflow-x-visible pb-16">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 font-semibold text-gray-500 uppercase text-xs">
                <th className="px-6 py-4 w-16 text-center">No</th>
                <th className="px-6 py-4">Informasi Kegiatan</th>
                <th className="px-6 py-4 text-center">Status Validasi</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {loading ? (
                <tr><td colSpan="4" className="p-16 text-center animate-pulse"><Loader2 size={24} className="animate-spin text-blue-600 mx-auto" /></td></tr>
              ) : daftarAjuan.length > 0 ? (
                daftarAjuan.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-all">
                    <td className="px-6 py-4 text-center font-medium text-gray-400">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800">{item.judul_kegiatan}</div>
                      <div className="text-xs text-blue-600 font-semibold mt-1">Poin: {item.poin}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <StatusBadge status={item.status_validasi} />
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end">
                          <ActionMenu>
                            <button onClick={() => { setTarget(item); setShowDetail(true); }} className="flex items-center gap-2 text-blue-600">
                              <Eye size={16} /> Detail
                            </button>
                            {item.status_validasi && (item.status_validasi.toLowerCase() === 'menunggu' || item.status_validasi.toLowerCase() === 'revisi') && (
                              <button 
                                onClick={() => bukaModalEdit(item)}
                                className="flex items-center gap-2 text-amber-600"
                              >
                                <Edit3 size={16} /> Edit
                              </button>
                            )}
                          </ActionMenu>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="p-16 text-center text-gray-400 font-medium">Belum ada data pengajuan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL EDIT FULL */}
      {showEdit && target && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl animate-in zoom-in duration-300 custom-scrollbar">
            <div className="p-6 bg-white border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><Edit3 size={20} /></div>
                <h3 className="text-lg font-bold text-gray-800">Perbaiki Ajuan SKPI</h3>
              </div>
              <button onClick={() => setShowEdit(false)} className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSimpanEdit} className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Waktu Pelaksanaan</label>
                  <input 
                    type="date"
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl font-medium text-sm outline-none focus:border-blue-600 transition-all"
                    value={formData.waktu_pelaksanaan} 
                    onChange={(e) => setFormData({...formData, waktu_pelaksanaan: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Kategori Utama</label>
                  <select className="w-full p-3 bg-white border border-gray-200 rounded-xl font-medium text-sm outline-none focus:border-blue-600 transition-all"
                    value={formData.kategori_utama} onChange={(e) => setFormData({...formData, kategori_utama: e.target.value, nama_kegiatan: '', tingkat: '', partisipasi: ''})}>
                    <option value="">-- Pilih Kategori --</option>
                    {opsiKategori.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Nama Kegiatan</label>
                  <select className="w-full p-3 bg-white border border-gray-200 rounded-xl font-medium text-sm outline-none focus:border-blue-600 transition-all disabled:opacity-50 disabled:bg-gray-50"
                    value={formData.nama_kegiatan} onChange={(e) => setFormData({...formData, nama_kegiatan: e.target.value, tingkat: '', partisipasi: ''})}
                    disabled={!formData.kategori_utama}>
                    <option value="">-- Pilih Kegiatan --</option>
                    {opsiKegiatan.map(keg => <option key={keg} value={keg}>{keg}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Tingkat</label>
                  <select className="w-full p-3 bg-white border border-gray-200 rounded-xl font-medium text-sm outline-none focus:border-blue-600 transition-all disabled:opacity-50 disabled:bg-gray-50"
                    value={formData.tingkat} onChange={(e) => setFormData({...formData, tingkat: e.target.value, partisipasi: ''})}
                    disabled={!formData.nama_kegiatan}>
                    <option value="">-- Pilih Tingkat --</option>
                    {opsiTingkat.map(tkt => <option key={tkt} value={tkt}>{tkt}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Peran / Partisipasi</label>
                  <select className="w-full p-3 bg-white border border-gray-200 rounded-xl font-medium text-sm outline-none focus:border-blue-600 transition-all disabled:opacity-50 disabled:bg-gray-50"
                    value={formData.partisipasi} onChange={(e) => setFormData({...formData, partisipasi: e.target.value})}
                    disabled={!formData.tingkat}>
                    <option value="">-- Pilih Partisipasi --</option>
                    {opsiPartisipasi.map(prn => <option key={prn} value={prn}>{prn}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Akumulasi Poin</label>
                  <div className="w-full p-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm text-center border border-blue-100">
                    {formData.poin} PTS
                  </div>
                </div>

              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Ganti File Bukti (Opsional)</label>
                <input type="file" className="w-full p-3 bg-white border border-gray-200 rounded-xl font-medium text-sm" onChange={e => setFileBaru(e.target.files[0])} accept=".jpg,.jpeg,.png,.pdf" />
                <p className="text-xs text-gray-400 ml-1">Kosongkan jika tidak ingin mengganti file sebelumnya.</p>
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold uppercase text-sm shadow-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-all">
                <Save size={18}/> Kirim Perbaikan Ajuan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETAIL */}
      {showDetail && target && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 bg-white border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Detail Sertifikat</h3>
              <button onClick={() => setShowDetail(false)} className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors"><X size={20}/></button>
            </div>
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-6">
                  <InfoItem label="Nama Kegiatan" nilai={target.judul_kegiatan} />
                  <InfoItem label="Waktu Pelaksanaan" nilai={target.waktu_pelaksanaan || '-'} />
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Akumulasi Poin</p>
                    <p className="text-2xl font-bold text-blue-700">{target.poin} <span className="text-sm">PTS</span></p>
                  </div>
               </div>
               <div className="space-y-6">
                  <StatusBadge status={target.status_validasi} besar />
                  
                  {target.catatan_admin && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-xs font-semibold text-amber-600 uppercase mb-1 flex items-center gap-2"><AlertCircle size={16} /> Catatan Admin</p>
                      <p className="text-sm text-amber-800 font-medium leading-relaxed">{target.catatan_admin}</p>
                    </div>
                  )}

                  <button onClick={() => setShowBerkas(true)} className="flex items-center justify-center gap-2 w-full bg-blue-50 text-blue-600 py-3 rounded-xl font-bold text-sm hover:bg-blue-100 transition-all border border-blue-100">
                    <Eye size={18} /> Buka Berkas
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BERKAS */}
      {showBerkas && target && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-4xl h-[90vh] flex flex-col rounded-2xl shadow-xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 bg-white border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Pratinjau Berkas</h3>
              <button onClick={() => setShowBerkas(false)} className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"><X size={20}/></button>
            </div>
            <div className="flex-1 bg-gray-50 p-4 overflow-hidden relative">
               {target.file_bukti.toLowerCase().endsWith('.pdf') ? (
                 <iframe 
                   src={`https://skpi-stikomelrahma.my.id/backend/unggahan/arsip_sertifikat/${target.file_bukti}`} 
                   className="w-full h-full rounded-xl border border-gray-200 bg-white"
                   title="PDF Preview"
                 />
               ) : (
                 <img 
                   src={`https://skpi-stikomelrahma.my.id/backend/unggahan/arsip_sertifikat/${target.file_bukti}`} 
                   alt="Berkas Sertifikat" 
                   className="w-full h-full object-contain rounded-xl border border-gray-200 bg-white"
                 />
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status, besar }) => {
  const text = status ? status.toLowerCase() : '';
  const isOk = text === 'disetujui';
  const isNo = text === 'ditolak';
  const isRev = text === 'revisi';
  const color = isOk ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : isNo ? 'bg-red-50 text-red-600 border-red-100' : isRev ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100';
  const Icon = isOk ? CheckCircle2 : isNo ? XCircle : isRev ? AlertCircle : Clock;
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold ${color} ${besar ? 'text-sm px-4 py-2 w-full justify-center' : 'text-xs'}`}>
       <Icon size={besar ? 18 : 14} /> <span className="capitalize">{status || 'Menunggu'}</span>
    </div>
  );
};

const InfoItem = ({ label, nilai }) => (
  <div className="space-y-1">
    <p className="text-xs font-semibold text-gray-500 uppercase">{label}</p>
    <p className="text-sm font-bold text-gray-800">{nilai}</p>
  </div>
);

export default StatusAjuan;
