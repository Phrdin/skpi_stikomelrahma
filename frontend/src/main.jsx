import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; 

// Mengambil data pengguna dari Konteks
import { PenyediaPengguna } from './context/InfoPengguna.jsx';

// --- INTERCEPTOR FETCH GLOBAL UNTUK RBAC TOKEN ---
const originalFetch = window.fetch;
window.fetch = async (resource, config = {}) => {
  const penggunaRaw = sessionStorage.getItem('pengguna');
  if (penggunaRaw && typeof resource === 'string' && resource.includes('/backend/')) {
    try {
      const pengguna = JSON.parse(penggunaRaw);
      if (pengguna && pengguna.token) {
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${pengguna.token}`
        };
      }
    } catch (e) {}
  }
  return originalFetch(resource, config);
};
// -------------------------------------------------

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PenyediaPengguna>
      <App />
    </PenyediaPengguna>
  </React.StrictMode>,
);
