<?php
// Izinkan data diambil oleh React untuk kebutuhan cetak
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require '../../konfigurasi/database.php';

// Kita ambil NIM mahasiswa yang ingin dicetak datanya
$nim = $_GET['nim'] ?? '';

if ($nim) {
    try {
        /* Catatan: Kita hanya ambil data yang statusnya 'Disetujui'.
           Yang ditolak atau masih menunggu tidak akan muncul di lembar SKPI.
        */
        $sql = "SELECT k.judul_kegiatan, k.poin_final 
                FROM kegiatan_mahasiswa k
                JOIN pengguna p ON k.id_mahasiswa = p.id
                WHERE p.nomor_induk = ? AND k.status_validasi = 'Disetujui'
                ORDER BY k.id ASC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$nim]);
        $data = $stmt->fetchAll();

        echo json_encode(["status" => "sukses", "data" => $data]);

    } catch (PDOException $e) {
        echo json_encode(["status" => "gagal", "pesan" => $e->getMessage()]);
    }
}
?>

