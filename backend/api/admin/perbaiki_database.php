<?php
// Script untuk memperbaiki struktur, migrasi prodi, dan menambahkan Relasi (Foreign Key)
require '../../konfigurasi/database.php';

try {
    // 1. Buat master_prodi jika belum ada
    $pdo->exec("CREATE TABLE IF NOT EXISTS master_prodi (
        id_prodi INT AUTO_INCREMENT PRIMARY KEY,
        nama_prodi VARCHAR(100) NOT NULL,
        jenjang VARCHAR(20) NOT NULL DEFAULT 'S1',
        gelar_lulusan VARCHAR(50) NOT NULL,
        masa_studi_tahun INT NOT NULL DEFAULT 4,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    
    $stmt = $pdo->query("SELECT COUNT(*) FROM master_prodi");
    if ($stmt->fetchColumn() == 0) {
        $pdo->exec("INSERT INTO master_prodi (nama_prodi, jenjang, gelar_lulusan, masa_studi_tahun) VALUES 
            ('Informatika', 'S1', 'S.Kom', 4),
            ('Manajemen', 'S1', 'S.M', 4),
            ('Pendidikan', 'S1', 'S.Pd', 4)
        ");
    }

    // 2. Modifikasi kolom tabel Mahasiswa
    $stmt = $pdo->query("SHOW COLUMNS FROM mahasiswa LIKE 'id_prodi'");
    if ($stmt->rowCount() == 0) {
        $pdo->exec("ALTER TABLE mahasiswa ADD COLUMN id_prodi INT DEFAULT 1 AFTER id_angkatan");
        
        $stmt_old = $pdo->query("SHOW COLUMNS FROM mahasiswa LIKE 'program_studi'");
        if ($stmt_old->rowCount() > 0) {
            $pdo->exec("UPDATE mahasiswa SET id_prodi = 1 WHERE program_studi LIKE '%Informatika%' OR program_studi IS NULL");
            $pdo->exec("UPDATE mahasiswa SET id_prodi = 2 WHERE program_studi LIKE '%Manajemen%'");
            $pdo->exec("UPDATE mahasiswa SET id_prodi = 3 WHERE program_studi LIKE '%Pendidikan%'");
            $pdo->exec("ALTER TABLE mahasiswa DROP COLUMN program_studi");
        }
    }

    // Hapus kolom lama yang sudah tidak dipakai
    $kolom_dihapus = ['gelar', 'semester_berjalan', 'status_mahasiswa'];
    foreach ($kolom_dihapus as $kolom) {
        $stmt = $pdo->query("SHOW COLUMNS FROM mahasiswa LIKE '$kolom'");
        if ($stmt->rowCount() > 0) {
            $pdo->exec("ALTER TABLE mahasiswa DROP COLUMN $kolom");
        }
    }

    // Pastikan id_status ada (jika belum ada dari migrasi sebelumnya)
    $stmt = $pdo->query("SHOW COLUMNS FROM mahasiswa LIKE 'id_status'");
    if ($stmt->rowCount() == 0) {
        $pdo->exec("ALTER TABLE mahasiswa ADD COLUMN id_status INT DEFAULT 1");
    }
    
    // 3. Tambahkan RELASI FOREIGN KEY
    $relasi_berhasil = 0;
    
    // Fungsi bantuan untuk cek FK
    function checkFKExists($pdo, $table, $fk_name) {
        $stmt = $pdo->prepare("SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = ?");
        $stmt->execute([$table, $fk_name]);
        return $stmt->rowCount() > 0;
    }

    // Cek kemungkinan ada record mahasiswa dengan id_angkatan yang tidak ada di tabel angkatan (data orphan), 
    // jika ada update ke null agar FK bisa terbuat (tergantung apakah id_angkatan boleh null).
    $pdo->exec("UPDATE mahasiswa m LEFT JOIN angkatan a ON m.id_angkatan = a.id SET m.id_angkatan = NULL WHERE a.id IS NULL");

    // FK Mahasiswa -> Angkatan
    if (!checkFKExists($pdo, 'mahasiswa', 'fk_mahasiswa_angkatan')) {
        $pdo->exec("ALTER TABLE mahasiswa ADD CONSTRAINT fk_mahasiswa_angkatan FOREIGN KEY (id_angkatan) REFERENCES angkatan(id) ON DELETE SET NULL ON UPDATE CASCADE");
        $relasi_berhasil++;
    }

    // FK Mahasiswa -> Prodi
    if (!checkFKExists($pdo, 'mahasiswa', 'fk_mahasiswa_prodi')) {
        $pdo->exec("ALTER TABLE mahasiswa ADD CONSTRAINT fk_mahasiswa_prodi FOREIGN KEY (id_prodi) REFERENCES master_prodi(id_prodi) ON DELETE RESTRICT ON UPDATE CASCADE");
        $relasi_berhasil++;
    }

    // FK Mahasiswa -> Status
    if (!checkFKExists($pdo, 'mahasiswa', 'fk_mahasiswa_status')) {
        $pdo->exec("ALTER TABLE mahasiswa ADD CONSTRAINT fk_mahasiswa_status FOREIGN KEY (id_status) REFERENCES master_status_mahasiswa(id_status) ON DELETE RESTRICT ON UPDATE CASCADE");
        $relasi_berhasil++;
    }

    echo "ANALISIS & PERBAIKAN SELESAI:<br>";
    echo "- Kolom usang dihapus (program_studi, gelar, semester_berjalan).<br>";
    echo "- Kolom relasi dipastikan ada (id_prodi, id_status).<br>";
    echo "- $relasi_berhasil Relasi Antar Tabel (Foreign Key) baru berhasil disambungkan.";

} catch (Exception $e) {
    echo "Gagal memperbaiki database: " . $e->getMessage();
}
?>
