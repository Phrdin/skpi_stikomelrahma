<?php
require 'backend/konfigurasi/database.php';
try {
    $pdo->exec("ALTER TABLE kegiatan_mahasiswa MODIFY COLUMN status_validasi VARCHAR(50) DEFAULT 'Menunggu'");
    $pdo->exec("ALTER TABLE kegiatan_mahasiswa CHANGE alasan_tolak catatan_admin TEXT DEFAULT NULL");
    echo "Sukses update tabel kegiatan_mahasiswa\n";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Unknown column') !== false) {
        echo "Kolom mungkin sudah diubah.\n";
    } else {
        echo "Error: " . $e->getMessage() . "\n";
    }
}
?>
