import React, { useContext, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { KonteksPengguna } from '../context/InfoPengguna';

const RuteTerproteksi = ({ children }) => {
  const { pengguna, logout } = useContext(KonteksPengguna);
  const location = useLocation();
  const navigate = useNavigate();

  // Mencegah akses via bfcache (Back button)
  useEffect(() => {
    const dataSimpanan = sessionStorage.getItem('pengguna');
    if (!dataSimpanan) {
      if (pengguna && typeof logout === 'function') {
        logout();
      }
      navigate('/login', { replace: true });
    }
    
    // Cegah cache halaman di level browser (BFCache)
    window.onpageshow = function(event) {
      if (event.persisted && !sessionStorage.getItem('pengguna')) {
        window.location.reload();
      }
    };
  }, [location, pengguna, navigate, logout]);

  // Jika tidak ada data pengguna, lempar ke login
  if (!pengguna || !sessionStorage.getItem('pengguna')) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RuteTerproteksi;
