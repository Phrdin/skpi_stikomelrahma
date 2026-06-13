import React from 'react';
import Sidebar from '../../components/Sidebar';
import ActionMenu from '../../components/ActionMenu';
import { Edit3, KeyRound, Trash2 } from 'lucide-react';

const KelolaPengguna = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-8">
        <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Manajemen Pengguna Sistem</h2>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold transition">
              + Tambah Pengguna
            </button>
          </div>
          
          <div className="overflow-visible pb-32">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="p-3 border-b-2 font-semibold">NIM / NIP</th>
                  <th className="p-3 border-b-2 font-semibold">Nama Lengkap</th>
                  <th className="p-3 border-b-2 font-semibold">Peran</th>
                  <th className="p-3 border-b-2 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50 transition">
                  <td className="p-3 text-gray-800 font-bold">10123001</td>
                  <td className="p-3 text-gray-600">Pahrudin</td>
                  <td className="p-3">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold border border-blue-200 uppercase">
                      Mahasiswa
                    </span>
                  </td>
                  <td className="p-3 text-center relative">
                    <ActionMenu>
                        <button className="flex items-center gap-2 text-blue-600"><Edit3 size={16}/> Edit Pengguna</button>
                        <button className="flex items-center gap-2 text-yellow-600"><KeyRound size={16}/> Reset Sandi</button>
                        <button className="flex items-center gap-2 text-red-600"><Trash2 size={16}/> Hapus Akun</button>
                    </ActionMenu>
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50 transition">
                  <td className="p-3 text-gray-800 font-bold">001</td>
                  <td className="p-3 text-gray-600">Admin Kemahasiswaan</td>
                  <td className="p-3">
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold border border-purple-200 uppercase">
                      Admin
                    </span>
                  </td>
                  <td className="p-3 text-center relative">
                    <ActionMenu>
                        <button className="flex items-center gap-2 text-blue-600"><Edit3 size={16}/> Edit Pengguna</button>
                        <button className="flex items-center gap-2 text-yellow-600"><KeyRound size={16}/> Reset Sandi</button>
                        <button className="flex items-center gap-2 text-red-600"><Trash2 size={16}/> Hapus Akun</button>
                    </ActionMenu>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default KelolaPengguna;
