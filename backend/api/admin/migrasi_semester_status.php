<?php
require '../../konfigurasi/database.php';

try {
    $pdo->beginTransaction();

    // 1. Create master_status_mahasiswa
    $pdo->exec("CREATE TABLE IF NOT EXISTS master_status_mahasiswa (
        id_status INT AUTO_INCREMENT PRIMARY KEY,
        nama_status VARCHAR(50) NOT NULL,
        izin_akses_skpi TINYINT(1) DEFAULT 0,
        lanjut_semester TINYINT(1) DEFAULT 0
    )");

    // 2. Insert default statuses
    $pdo->exec("INSERT IGNORE INTO master_status_mahasiswa (id_status, nama_status, izin_akses_skpi, lanjut_semester) VALUES 
        (1, 'Aktif', 1, 1),
        (2, 'Cuti', 0, 0),
        (3, 'Lulus', 0, 0),
        (4, 'DO', 0, 0),
        (5, 'Keluar', 0, 0)
    ");

    // 3. Create pengaturan_periode
    $pdo->exec("CREATE TABLE IF NOT EXISTS pengaturan_periode (
        id_periode INT AUTO_INCREMENT PRIMARY KEY,
        nama_periode VARCHAR(50) NOT NULL,
        bulan_mulai INT NOT NULL,
        bulan_selesai INT NOT NULL
    )");
    
    $stmt = $pdo->query("SELECT COUNT(*) FROM pengaturan_periode");
    if ($stmt->fetchColumn() == 0) {
        $pdo->exec("INSERT INTO pengaturan_periode (nama_periode, bulan_mulai, bulan_selesai) VALUES 
            ('Ganjil', 9, 2),
            ('Genap', 3, 8)
        ");
    }

    // 4. Create riwayat_sinkron_semester
    $pdo->exec("CREATE TABLE IF NOT EXISTS riwayat_sinkron_semester (
        kode_sinkron VARCHAR(50) PRIMARY KEY,
        tanggal_dieksekusi DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // 5. Cek kolom semester_berjalan, jika ada kita abaikan karena akan dihitung on-the-fly
    $stmt = $pdo->query("SHOW COLUMNS FROM mahasiswa LIKE 'semester_berjalan'");
    if ($stmt->rowCount() > 0) {
        $pdo->exec("ALTER TABLE mahasiswa DROP COLUMN semester_berjalan");
    }

    $stmt = $pdo->query("SHOW COLUMNS FROM mahasiswa LIKE 'id_status'");
    if ($stmt->rowCount() == 0) {
        $pdo->exec("ALTER TABLE mahasiswa ADD COLUMN id_status INT DEFAULT 1 AFTER gelar");
        
        $pdo->exec("UPDATE mahasiswa SET id_status = 1 WHERE status_mahasiswa = 'Aktif' OR status_mahasiswa IS NULL");
        $pdo->exec("UPDATE mahasiswa SET id_status = 2 WHERE status_mahasiswa = 'Cuti'");
        $pdo->exec("UPDATE mahasiswa SET id_status = 3 WHERE status_mahasiswa = 'Lulus'");
        $pdo->exec("UPDATE mahasiswa SET id_status = 4 WHERE status_mahasiswa = 'DO'");
        $pdo->exec("UPDATE mahasiswa SET id_status = 5 WHERE status_mahasiswa = 'Keluar'");

        $pdo->exec("ALTER TABLE mahasiswa DROP COLUMN status_mahasiswa");
    }

    $pdo->commit();
    echo "Migrasi berhasil dieksekusi.";

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo "Gagal migrasi: " . $e->getMessage();
}
?>
