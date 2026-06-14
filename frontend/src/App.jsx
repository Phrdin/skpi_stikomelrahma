import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 1. Import Provider (Pastikan namanya sinkron dengan export di filenya)
import { PenyediaPengguna } from './context/InfoPengguna';
import Layout from './components/Layout';
import RuteTerproteksi from './routes/RuteTerproteksi';

// Halaman
import Login from './pages/Masuk/Login.jsx';
import Beranda from './pages/Beranda/index';
import Profil from './pages/Profil';
import InputSKPI from './pages/InputSKPI';
import StatusAjuan from './pages/StatusAjuan';
import CetakSertifikat from './pages/CetakSertifikat';
import SKPIResmi from './pages/SKPIResmi';

// Admin
import ValidasiSKPI from './pages/ValidasiSKPI';
import CetakSKPI from './pages/CetakSKPI';
import DataMahasiswa from './pages/DataMahasiswa';
import Pengaturan from './pages/Pengaturan';
import KelolaKategori from './pages/KelolaKategori';
import PermohonanCetak from './pages/PermohonanCetak';
import CetakDraftSKPI from './pages/CetakDraftSKPI';
import PanduanAdmin from './pages/PanduanAdmin';

function App() {
  return (
    // DISINI HARUS SAMA DENGAN IMPORT DI ATAS
    <PenyediaPengguna> 
      <BrowserRouter>
        <Routes>
          {/* Rute Tanpa Sidebar */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Rute Dengan Sidebar (Dibungkus Layout) */}
          <Route path="/*" element={
            <RuteTerproteksi>
              <Layout>
                <Routes>
                  {/* Mahasiswa */}
                  <Route path="/beranda" element={<Beranda />} />
                  <Route path="/profil" element={<Profil />} />
                  <Route path="/input-skpi" element={<InputSKPI />} />
                  <Route path="/status-ajuan" element={<StatusAjuan />} />
                  <Route path="/cetak-sertifikat" element={<CetakSertifikat />} />
                  <Route path="/skpi-resmi" element={<SKPIResmi />} />

                  {/* Admin */}
                  <Route path="/validasi-skpi" element={<ValidasiSKPI />} />
                  <Route path="/cetak-skpi" element={<CetakSKPI />} />
                  <Route path="/data-mahasiswa" element={<DataMahasiswa />} />
                  <Route path="/pengaturan" element={<Pengaturan />} />
                  <Route path="/kategori" element={<KelolaKategori />} />
                  <Route path="/permohonan-cetak" element={<PermohonanCetak />} />
                  <Route path="/cetak-draft/:nim" element={<CetakDraftSKPI />} />
                  <Route path="/panduan-admin" element={<PanduanAdmin />} />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/beranda" replace />} />
                </Routes>
              </Layout>
            </RuteTerproteksi>
          } />
        </Routes>
      </BrowserRouter>
    </PenyediaPengguna> 
  );
}

export default App;
