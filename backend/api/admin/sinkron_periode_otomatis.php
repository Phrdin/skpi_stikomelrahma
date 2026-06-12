<?php
// File ini tidak untuk diakses langsung via HTTP, melainkan di-include
require_once __DIR__ . '/../../konfigurasi/database.php';

try {
    $bulan_sekarang = (int)date('n'); // 1-12
    $tahun_sekarang = (int)date('Y');

    // Ambil pengaturan periode
    $stmtPeriode = $pdo->query("SELECT * FROM pengaturan_periode");
    $periodes = $stmtPeriode->fetchAll(PDO::FETCH_ASSOC);

    $periode_aktif = null;
    $nama_periode_aktif = '';

    foreach ($periodes as $p) {
        $mulai = (int)$p['bulan_mulai'];
        $selesai = (int)$p['bulan_selesai'];
        
        // Logika untuk rentang bulan yang melintasi tahun (misal: Sept - Feb)
        if ($mulai > $selesai) {
            if ($bulan_sekarang >= $mulai || $bulan_sekarang <= $selesai) {
                $periode_aktif = $p;
                // Jika bulan <= selesai (misal Feb 2027), maka itu masih bagian dari tahun mulai 2026
                $tahun_periode = ($bulan_sekarang <= $selesai) ? $tahun_sekarang - 1 : $tahun_sekarang;
                $nama_periode_aktif = $tahun_periode . "-" . $p['nama_periode'];
            }
        } else {
            if ($bulan_sekarang >= $mulai && $bulan_sekarang <= $selesai) {
                $periode_aktif = $p;
                $nama_periode_aktif = $tahun_sekarang . "-" . $p['nama_periode'];
            }
        }
    }

    if ($periode_aktif && $nama_periode_aktif) {
        // Cek apakah periode ini sudah pernah disinkronkan
        $stmtCek = $pdo->prepare("SELECT COUNT(*) FROM riwayat_sinkron_semester WHERE kode_sinkron = ?");
        $stmtCek->execute([$nama_periode_aktif]);
        
        if ($stmtCek->fetchColumn() == 0) {
            // BELUM SINKRON! LAKUKAN SINKRONISASI SEKARANG
            $pdo->beginTransaction();

            // 1. Naikkan semester_aktif HANYA untuk mahasiswa dengan status yang lanjut_semester = 1
            $pdo->exec("UPDATE mahasiswa SET semester_aktif = semester_aktif + 1 WHERE id_status IN (SELECT id_status FROM master_status_mahasiswa WHERE lanjut_semester = 1)");

            // Catatan: semester_berjalan sekarang dihitung otomatis secara matematis di API
            // dan tidak lagi disimpan di database.
            
            // 2. Catat riwayat
            $stmtInsert = $pdo->prepare("INSERT INTO riwayat_sinkron_semester (kode_sinkron) VALUES (?)");
            $stmtInsert->execute([$nama_periode_aktif]);

            $pdo->commit();
        }
    }
} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    // Silently fail (tidak perlu die atau echo karena script ini di-include background)
    error_log("Gagal sinkron_periode_otomatis: " . $e->getMessage());
}
?>
