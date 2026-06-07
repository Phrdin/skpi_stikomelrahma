<?php
require '../../konfigurasi/database.php';

try {
    $sql = "CREATE TABLE IF NOT EXISTS permohonan_cetak_skpi (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nomor_induk VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'Diproses Admin',
        file_scan_skpi VARCHAR(255) NULL,
        tanggal_pengajuan TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        tanggal_selesai TIMESTAMP NULL,
        FOREIGN KEY (nomor_induk) REFERENCES pengguna(nomor_induk) ON DELETE CASCADE
    )";
    $pdo->exec($sql);
    echo "Tabel permohonan_cetak_skpi berhasil dibuat.";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
