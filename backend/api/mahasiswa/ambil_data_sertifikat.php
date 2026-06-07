<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require '../../konfigurasi/database.php';

$nim = $_GET['nim'] ?? '';

try {
    // 1. Ambil ambang batas poin dari pengaturan
    $stmt_set = $pdo->prepare("SELECT meta_value FROM pengaturan WHERE meta_key = 'min_skor_skpi'");
    $stmt_set->execute();
    $standar = $stmt_set->fetchColumn() ?: 50;

    // 2. Ambil data user dan hitung total poin disetujui
    $sql = "SELECT p.nama_lengkap, p.nomor_induk, 
            SUM(CASE WHEN k.status_validasi = 'Disetujui' THEN k.poin_final ELSE 0 END) as total_poin
            FROM pengguna p
            LEFT JOIN kegiatan_mahasiswa k ON p.id = k.id_mahasiswa
            WHERE p.nomor_induk = ?
            GROUP BY p.id";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$nim]);
    $user = $stmt->fetch();

    if ($user) {
        $poin_mhs = (int)$user['total_poin'];
        echo json_encode([
            "status" => "sukses",
            "layak" => ($poin_mhs >= (int)$standar),
            "data" => [
                "nama" => $user['nama_lengkap'],
                "nim" => $user['nomor_induk'],
                "poin" => $poin_mhs,
                "target" => (int)$standar,
                "nomor_seri" => "CERT-".date('Y')."-".$user['nomor_induk']
            ]
        ]);
    }
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "pesan" => $e->getMessage()]);
}

