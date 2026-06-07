<?php
require 'backend/konfigurasi/database.php';
try {
    $pdo->exec("UPDATE kegiatan_mahasiswa SET waktu_periode = NULL");
    $pdo->exec("ALTER TABLE kegiatan_mahasiswa CHANGE waktu_periode waktu_pelaksanaan DATE");
    echo "Sukses mengubah kolom waktu_periode menjadi waktu_pelaksanaan DATE\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
