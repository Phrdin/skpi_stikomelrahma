<?php
require __DIR__ . '/../../konfigurasi/database.php';

try {
    echo "Memulai pembersihan tabel yang tidak terpakai...\n";
    
    // Daftar tabel yang akan dihapus
    $tabel_hapus = [
        'jenis_kegiatan',
        'kategori_kegiatan',
        'kategori_skpi',
        'semester',
        'sertifikat'
    ];

    // Matikan check foreign key sementara agar bisa menghapus tabel yang punya relasi
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");

    foreach ($tabel_hapus as $tabel) {
        $pdo->exec("DROP TABLE IF EXISTS $tabel");
        echo "- Tabel $tabel BERHASIL dihapus.\n";
    }

    // Hidupkan kembali check foreign key
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");

    echo "\nBERHASIL! Database Akang sekarang sudah bersih dan ramping.";

} catch (Exception $e) {
    echo "Gagal membersihkan tabel: " . $e->getMessage();
}
?>
