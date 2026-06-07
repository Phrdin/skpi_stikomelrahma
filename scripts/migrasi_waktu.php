<?php
require 'backend/konfigurasi/database.php';

try {
    // 1. Ubah semester_ditempuh jadi waktu_periode (VARCHAR)
    // Kita cek dulu apakah kolom waktu_periode sudah ada
    $check = $pdo->query("SHOW COLUMNS FROM kegiatan_mahasiswa LIKE 'waktu_periode'");
    if (!$check->fetch()) {
        $pdo->exec("ALTER TABLE kegiatan_mahasiswa ADD COLUMN waktu_periode VARCHAR(100) AFTER status_validasi");
        // Migrasi data lama dari semester_ditempuh ke waktu_periode
        $pdo->exec("UPDATE kegiatan_mahasiswa SET waktu_periode = CONCAT('Semester ', semester_ditempuh)");
        echo "Kolom waktu_periode BERHASIL ditambahkan.\n";
    }

    echo "Sinkronisasi database selesai!";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
