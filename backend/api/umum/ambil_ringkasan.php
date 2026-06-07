<?php
require '../../konfigurasi/cors.php';
require '../../konfigurasi/database.php';

$nim = $_GET['nim'] ?? '';
$peran = $_GET['peran'] ?? 'mahasiswa';

try {
    // 1. Ambil nilai minimal skor (Default 250 sesuai dashboard React)
    $stmt_set = $pdo->prepare("SELECT meta_value FROM pengaturan WHERE meta_key = 'min_skor_skpi'");
    $stmt_set->execute();
    $min_skor = $stmt_set->fetchColumn() ?: 250;

    if ($peran === 'admin') {
        // --- LOGIKA DASHBOARD ADMIN ---
        $sql = "SELECT COUNT(*) as total,
                SUM(CASE WHEN LOWER(status_validasi) = 'disetujui' THEN 1 ELSE 0 END) as disetujui,
                SUM(CASE WHEN LOWER(status_validasi) = 'menunggu' THEN 1 ELSE 0 END) as menunggu
                FROM kegiatan_mahasiswa";
        $stmt = $pdo->query($sql);
        $stat = $stmt->fetch(PDO::FETCH_ASSOC);

        $stmt_mhs = $pdo->query("SELECT COUNT(*) FROM pengguna WHERE peran = 'mahasiswa'");
        $total_mhs = $stmt_mhs->fetchColumn();

        echo json_encode([
            "status" => "sukses",
            "data" => [
                "total" => (int)$stat['total'],
                "disetujui" => (int)$stat['disetujui'],
                "menunggu" => (int)$stat['menunggu'],
                "total_mahasiswa" => (int)$total_mhs,
                "min_skor" => (int)$min_skor
            ]
        ]);
    } else {
        // --- LOGIKA DASHBOARD MAHASISWA ---
        // 1. Ambil angkatan dan semester_aktif dari tabel mahasiswa
        $stmt_mhs = $pdo->prepare("SELECT angkatan, semester_aktif FROM mahasiswa WHERE nomor_induk = ?");
        $stmt_mhs->execute([$nim]);
        $mhs_data = $stmt_mhs->fetch(PDO::FETCH_ASSOC);
        
        $angkatan = $mhs_data['angkatan'] ?? date('Y');
        $db_semester = (int)($mhs_data['semester_aktif'] ?? 0);

        if ($db_semester > 0) {
            $smt_aktif = $db_semester;
        } else {
            // Kalkulasi Semester Otomatis berdasarkan selisih bulan sejak September tahun angkatan
            $tahunSekarang = (int)date('Y');
            $bulanSekarang = (int)date('n');
            
            $selisihBulan = (($tahunSekarang - (int)$angkatan) * 12) + $bulanSekarang - 9;
            
            if ($selisihBulan < 0) {
                $smt_aktif = 1;
            } else {
                $smt_aktif = floor($selisihBulan / 6) + 1;
            }
            
            if ($smt_aktif < 1) $smt_aktif = 1;
            if ($smt_aktif > 8) $smt_aktif = 8;
        }

        // 2. Ambil target poin untuk semester aktif
        $stmt_tgt = $pdo->prepare("SELECT target_poin FROM pengaturan_semester WHERE semester = ?");
        $stmt_tgt->execute([$smt_aktif]);
        $target_smt = $stmt_tgt->fetchColumn() ?: 50;

        // 3. Hitung statistik keseluruhan dan khusus semester ini
        $sql = "SELECT COUNT(*) as total,
                SUM(CASE WHEN LOWER(status_validasi) = 'disetujui' THEN 1 ELSE 0 END) as disetujui,
                SUM(CASE WHEN LOWER(status_validasi) = 'menunggu' THEN 1 ELSE 0 END) as menunggu,
                SUM(CASE WHEN LOWER(status_validasi) = 'disetujui' THEN poin ELSE 0 END) as total_poin,
                SUM(CASE WHEN LOWER(status_validasi) = 'disetujui' AND semester_ditempuh = ? THEN poin ELSE 0 END) as poin_semester_ini
                FROM kegiatan_mahasiswa 
                WHERE nomor_induk = ?";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$smt_aktif, $nim]);
        $stat = $stmt->fetch(PDO::FETCH_ASSOC);

        // 4. Ambil target semua semester (1-8)
        $stmt_semua = $pdo->query("SELECT semester, target_poin FROM pengaturan_semester ORDER BY semester ASC");
        $target_semua = $stmt_semua->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "status" => "sukses",
            "data" => [
                "total" => (int)($stat['total'] ?? 0),
                "disetujui" => (int)($stat['disetujui'] ?? 0),
                "menunggu" => (int)($stat['menunggu'] ?? 0),
                "total_poin" => (int)($stat['total_poin'] ?? 0),
                "min_skor" => (int)$min_skor,
                "angkatan" => $angkatan,
                "semester_aktif" => (int)$smt_aktif,
                "target_semester_ini" => (int)$target_smt,
                "poin_semester_ini" => (int)($stat['poin_semester_ini'] ?? 0),
                "target_semua_semester" => $target_semua
            ]
        ]);
    }
} catch (PDOException $e) {
    echo json_encode(["status" => "gagal", "pesan" => $e->getMessage()]);
}
?>

