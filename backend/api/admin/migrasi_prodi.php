<?php
// API ini khusus dijalankan sekali untuk migrasi struktur tabel prodi
require '../../konfigurasi/database.php';

try {
    // 1. Create master_prodi
    $pdo->exec("CREATE TABLE IF NOT EXISTS master_prodi (
        id_prodi INT AUTO_INCREMENT PRIMARY KEY,
        nama_prodi VARCHAR(100) NOT NULL,
        jenjang VARCHAR(20) NOT NULL DEFAULT 'S1',
        gelar_lulusan VARCHAR(50) NOT NULL,
        masa_studi_tahun INT NOT NULL DEFAULT 4,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    
    // Cek apakah data kosong
    $stmt = $pdo->query("SELECT COUNT(*) FROM master_prodi");
    if ($stmt->fetchColumn() == 0) {
        // Insert data bawaan
        $pdo->exec("INSERT INTO master_prodi (nama_prodi, jenjang, gelar_lulusan, masa_studi_tahun) VALUES 
            ('Informatika', 'S1', 'S.Kom', 4),
            ('Manajemen', 'S1', 'S.M', 4),
            ('Pendidikan', 'S1', 'S.Pd', 4)
        ");
    }

    // 2. Tambah id_prodi di mahasiswa
    $stmt = $pdo->query("SHOW COLUMNS FROM mahasiswa LIKE 'id_prodi'");
    if ($stmt->rowCount() == 0) {
        $pdo->exec("ALTER TABLE mahasiswa ADD COLUMN id_prodi INT DEFAULT 1 AFTER id_angkatan");
        
        // Coba sinkronkan data yang lama jika kolom lamanya masih ada
        $stmt_old = $pdo->query("SHOW COLUMNS FROM mahasiswa LIKE 'program_studi'");
        if ($stmt_old->rowCount() > 0) {
            $pdo->exec("UPDATE mahasiswa SET id_prodi = 1 WHERE program_studi LIKE '%Informatika%' OR program_studi IS NULL");
            $pdo->exec("UPDATE mahasiswa SET id_prodi = 2 WHERE program_studi LIKE '%Manajemen%'");
            $pdo->exec("UPDATE mahasiswa SET id_prodi = 3 WHERE program_studi LIKE '%Pendidikan%'");
            
            // Hapus kolom lama agar bersih
            $pdo->exec("ALTER TABLE mahasiswa DROP COLUMN program_studi");
        }

        $stmt_old_gelar = $pdo->query("SHOW COLUMNS FROM mahasiswa LIKE 'gelar'");
        if ($stmt_old_gelar->rowCount() > 0) {
            $pdo->exec("ALTER TABLE mahasiswa DROP COLUMN gelar");
        }
        
        // Tahun lulus dibiarkan, tapi nanti logic aplikasinya yang mengaturnya secara dinamis / auto-fill
    }

    echo "Migrasi Program Studi Berhasil!";

} catch (Exception $e) {
    echo "Gagal: " . $e->getMessage();
}
?>
