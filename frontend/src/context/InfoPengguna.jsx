import React, { createContext, useState } from 'react';

export const KonteksPengguna = createContext();

// Nama fungsi disamakan dengan yang diminta main.jsx
export const PenyediaPengguna = ({ children }) => {
  const [pengguna, setPengguna] = useState(() => {
    const dataSimpanan = sessionStorage.getItem('pengguna');
    return dataSimpanan ? JSON.parse(dataSimpanan) : null;
  });

  const login = (data) => {
    setPengguna(data);
    sessionStorage.setItem('pengguna', JSON.stringify(data));
  };

  const logout = () => {
    setPengguna(null);
    sessionStorage.removeItem('pengguna');
  };

  return (
    <KonteksPengguna.Provider value={{ pengguna, setPengguna, login, logout }}>
      {children}
    </KonteksPengguna.Provider>
  );
};
