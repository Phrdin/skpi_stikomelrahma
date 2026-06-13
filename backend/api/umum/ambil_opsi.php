<?php
require '../../konfigurasi/cors.php';
require '../../konfigurasi/database.php';

$aksi = isset($_GET['aksi']) ? $_GET['aksi'] : 'opsi_filter';

try {
    if ($aksi == 'opsi_filter') {
        // 1. Ambil Data Semester
        $stmtSmt = $pdo->query("SELECT id, semester as nama_semester FROM pengaturan_semester ORDER BY semester ASC");
        $semester = $stmtSmt->fetchAll(PDO::FETCH_ASSOC);

        // 2. Ambil Data Angkatan
        $stmtAkt = $pdo->query("SELECT id, tahun, nama_angkatan FROM angkatan WHERE status_aktif = 1 ORDER BY tahun DESC");
        $angkatan = $stmtAkt->fetchAll(PDO::FETCH_ASSOC);

        // 3. Ambil Data Prodi
        $stmtProdi = $pdo->query("SELECT id_prodi, nama_prodi, jenjang, gelar_lulusan, masa_studi_tahun FROM master_prodi ORDER BY id_prodi ASC");
        $prodi = $stmtProdi->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "status" => "sukses",
            "semester" => $semester,
            "angkatan" => $angkatan,
            "prodi" => $prodi
        ]);
        exit;
    }
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "pesan" => $e->getMessage()]);
}

