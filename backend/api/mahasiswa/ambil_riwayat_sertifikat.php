<?php
require '../../konfigurasi/cors.php';
header("Content-Type: application/json");

require '../../konfigurasi/database.php';

// Pastikan NIM ada di URL
if (!isset($_GET['nim']) || empty($_GET['nim'])) {
    echo json_encode(["status" => "error", "pesan" => "NIM tidak ditemukan"]);
    exit;
}

$nim = $_GET['nim'];

try {
    // Perhatikan JOIN-nya, kita hubungkan ke tabel pengguna lewat p.nomor_induk
    $sql = "SELECT ser.*, sem.nama_semester, sem.tahun_ajaran 
            FROM sertifikat ser
            JOIN semester sem ON ser.id_semester = sem.id 
            JOIN pengguna p ON ser.id_mahasiswa = p.id
            WHERE p.nomor_induk = ?
            ORDER BY ser.tanggal_terbit DESC";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$nim]);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "sukses",
        "data" => $data
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "status" => "error", 
        "pesan" => $e->getMessage()
    ]);
}

