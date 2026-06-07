<?php
require __DIR__ . '/../../konfigurasi/database.php';

try {
    // 1. Membersihkan tabel kegiatan_mahasiswa dari kolom sampah
    echo "Membersihkan tabel kegiatan_mahasiswa...\n";
    
    // Drop Foreign Keys first
    $fks = ['kegiatan_mahasiswa_ibfk_2', 'kegiatan_mahasiswa_ibfk_3'];
    foreach ($fks as $fk) {
        try {
            $pdo->exec("ALTER TABLE kegiatan_mahasiswa DROP FOREIGN KEY $fk");
            echo "- FK $fk dihapus.\n";
        } catch (Exception $e) {
            // Mungkin sudah dihapus
        }
    }

    $cols_to_drop = ['id_kategori', 'id_semester', 'id_jenis_kegiatan'];
    $current_cols = $pdo->query("DESCRIBE kegiatan_mahasiswa")->fetchAll(PDO::FETCH_COLUMN);
    
    foreach ($cols_to_drop as $col) {
        if (in_array($col, $current_cols)) {
            $pdo->exec("ALTER TABLE kegiatan_mahasiswa DROP COLUMN $col");
            echo "- Kolom $col dihapus.\n";
        }
    }

    // 2. Menambah kolom di tabel mahasiswa untuk SKPI Resmi
    echo "Menambah kolom di tabel mahasiswa...\n";
    
    $mhs_cols = $pdo->query("DESCRIBE mahasiswa")->fetchAll(PDO::FETCH_COLUMN);
    
    if (!in_array('gelar', $mhs_cols)) {
        $pdo->exec("ALTER TABLE mahasiswa ADD COLUMN gelar VARCHAR(50) DEFAULT 'S.Kom'");
        echo "- Kolom gelar ditambahkan.\n";
    }
    
    if (!in_array('tahun_lulus', $mhs_cols)) {
        $pdo->exec("ALTER TABLE mahasiswa ADD COLUMN tahun_lulus VARCHAR(4) DEFAULT '2028'");
        echo "- Kolom tahun_lulus ditambahkan.\n";
    }

    echo "Migrasi Database Langkah 1 BERHASIL!\n";

} catch (Exception $e) {
    echo "Gagal Migrasi: " . $e->getMessage() . "\n";
}
?>
