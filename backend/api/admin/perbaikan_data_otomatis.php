<?php
require __DIR__ . '/../../konfigurasi/database.php';

try {
    echo "Memulai perbaikan data lama...\n";
    
    // 1. Ambil semua data kegiatan yang id_master_kategori-nya masih NULL
    $stmt = $pdo->query("SELECT id, judul_kegiatan, poin FROM kegiatan_mahasiswa WHERE id_master_kategori IS NULL");
    $data_lama = $stmt->fetchAll();
    
    $jumlah_diperbaiki = 0;
    
    foreach ($data_lama as $row) {
        // 2. Cari di master kategori yang namanya mirip dan poinnya sama
        $stmtMaster = $pdo->prepare("SELECT id_master_kategori FROM master_kategori_skpi 
                                     WHERE nama_kegiatan = ? AND bobot = ? 
                                     LIMIT 1");
        $stmtMaster->execute([$row['judul_kegiatan'], $row['poin']]);
        $master = $stmtMaster->fetch();
        
        if ($master) {
            // 3. Update data lama dengan ID yang ditemukan
            $update = $pdo->prepare("UPDATE kegiatan_mahasiswa SET id_master_kategori = ? WHERE id = ?");
            $update->execute([$master['id_master_kategori'], $row['id']]);
            $jumlah_diperbaiki++;
        }
    }
    
    echo "Selesai! Berhasil memperbaiki $jumlah_diperbaiki data lama.\n";
    echo "Sekarang database Akang sudah sinkron kembali!";

} catch (Exception $e) {
    echo "Gagal memperbaiki data: " . $e->getMessage();
}
?>
