<?php
require 'backend/konfigurasi/database.php';

function describeTable($pdo, $table) {
    echo "\nStructure of table: $table\n";
    try {
        $stmt = $pdo->query("DESCRIBE $table");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo "- {$row['Field']} ({$row['Type']})\n";
        }
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
}

describeTable($pdo, 'pengguna');
describeTable($pdo, 'mahasiswa');
describeTable($pdo, 'kegiatan_mahasiswa');
describeTable($pdo, 'master_kategori_skpi');
