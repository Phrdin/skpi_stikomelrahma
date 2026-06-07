<?php
require 'backend/konfigurasi/database.php';

try {
    $nim_target = '2411070015'; // Contoh NIM dari screenshot
    
    echo "Testing Query 1 (Biodata)...\n";
    $sql1 = "SELECT p.nomor_induk, p.nama_lengkap, 
              m.program_studi, m.angkatan, m.tempat_lahir, m.tanggal_lahir, 
              m.jenis_kelamin, m.no_hp, m.alamat, m.nik, m.agama, m.foto_formal
              FROM pengguna p
              LEFT JOIN mahasiswa m ON p.nomor_induk = m.nomor_induk
              WHERE p.nomor_induk = ?";
    $stmt1 = $pdo->prepare($sql1);
    $stmt1->execute([$nim_target]);
    echo "Query 1 Success!\n";

    echo "Testing Query 2 (Kegiatan)...\n";
    $sql2 = "SELECT k.judul_kegiatan, m.tingkat, m.partisipasi, k.poin, k.semester_ditempuh, k.dibuat_pada
               FROM kegiatan_mahasiswa k
               LEFT JOIN master_kategori_skpi m ON k.id_master_kategori = m.id
               WHERE k.nomor_induk = ? AND LOWER(k.status_validasi) = 'disetujui'
               ORDER BY k.semester_ditempuh ASC, k.dibuat_pada ASC";
    $stmt2 = $pdo->prepare($sql2);
    $stmt2->execute([$nim_target]);
    echo "Query 2 Success!\n";

} catch (Exception $e) {
    echo "Error found: " . $e->getMessage() . "\n";
}
