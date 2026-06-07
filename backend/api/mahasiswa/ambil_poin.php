<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require '../../konfigurasi/database.php';

// Ambil parameter NIM (bisa kosong kalau admin)
$nim = isset($_GET['nim']) ? $_GET['nim'] : '';

try {
    // --- DATA UMUM (SELALU DIHITUNG UNTUK ADMIN) ---
    // 1. Hitung Total Mahasiswa Terdaftar
    $q_mhs = $pdo->query("SELECT COUNT(*) FROM pengguna WHERE peran = 'mahasiswa'");
    $total_mhs_sistem = $q_mhs->fetchColumn();

    // 2. Hitung Statistik Global (Seluruh Kampus)
    $q_global = $pdo->query("
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status_validasi = 'disetujui' THEN 1 ELSE 0 END) as acc,
            SUM(CASE WHEN status_validasi = 'menunggu' THEN 1 ELSE 0 END) as pen
        FROM kegiatan_mahasiswa
    ");
    $global = $q_global->fetch(PDO::FETCH_ASSOC);

    // --- DATA KHUSUS (JIKA NIM DIISI / MAHASISWA LOGIN) ---
    $data_sekarang = ["semester" => "Panel Admin", "total_poin" => 0];
    $histori = [];
    $total_ajuan = (int)$global['total'];
    $total_disetujui = (int)$global['acc'];
    $total_pending = (int)$global['pen'];

    if (!empty($nim)) {
        // 1. Ambil Semester Aktif (Jika ada)
        $stmt_sem = $pdo->query("SELECT id, nama_semester, tahun_ajaran FROM semester WHERE status_aktif = 1 LIMIT 1");
        $sem_aktif = $stmt_sem->fetch(PDO::FETCH_ASSOC);

        // 2. Hitung Poin Pribadi Mahasiswa
        $q_pribadi = $pdo->prepare("
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status_validasi = 'disetujui' THEN 1 ELSE 0 END) as acc,
                SUM(CASE WHEN status_validasi = 'menunggu' THEN 1 ELSE 0 END) as pen,
                SUM(CASE WHEN status_validasi = 'disetujui' THEN poin ELSE 0 END) as total_poin
            FROM kegiatan_mahasiswa 
            WHERE nomor_induk = ?
        ");
        $q_pribadi->execute([$nim]);
        $res_pribadi = $q_pribadi->fetch(PDO::FETCH_ASSOC);

            // Override variabel untuk response Mahasiswa
            $total_ajuan = (int)$res_pribadi['total'];
            $total_disetujui = (int)$res_pribadi['acc'];
            $total_pending = (int)$res_pribadi['pen'];
            $data_sekarang = [
                "semester" => $sem_aktif ? $sem_aktif['nama_semester'] . " " . $sem_aktif['tahun_ajaran'] : "Tidak Ada Semester Aktif",
                "total_poin" => (int)$res_pribadi['total_poin']
            ];

            // 4. Ambil Riwayat (Histori)
            $stmt_histori = $pdo->prepare("
                SELECT s.nama_semester, s.tahun_ajaran, ser.total_poin 
                FROM sertifikat ser 
                JOIN semester s ON ser.id_semester = s.id 
                JOIN pengguna p ON ser.id_mahasiswa = p.id
                WHERE p.nomor_induk = ? 
                ORDER BY s.tahun_ajaran DESC
            ");
            $stmt_histori->execute([$nim]);
            $histori = $stmt_histori->fetchAll(PDO::FETCH_ASSOC);
        }
    }

    // KIRIM RESPONSE JSON
    echo json_encode([
        "status" => "sukses",
        "total_mahasiswa_sistem" => (int)$total_mhs_sistem,
        "total_ajuan" => $total_ajuan,
        "total_disetujui" => $total_disetujui,
        "total_pending" => $total_pending,
        "data_sekarang" => $data_sekarang,
        "histori" => $histori
    ]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "pesan" => $e->getMessage()]);
}

