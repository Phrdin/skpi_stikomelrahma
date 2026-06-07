<?php
require 'backend/konfigurasi/database.php';
$stmt = $pdo->query("SELECT CONSTRAINT_NAME, COLUMN_NAME 
                    FROM information_schema.KEY_COLUMN_USAGE 
                    WHERE TABLE_SCHEMA = 'skpi_stikom' 
                    AND TABLE_NAME = 'kegiatan_mahasiswa' 
                    AND REFERENCED_TABLE_NAME IS NOT NULL");
foreach ($stmt->fetchAll() as $row) {
    echo "FK: {$row['CONSTRAINT_NAME']} on {$row['COLUMN_NAME']}\n";
}
