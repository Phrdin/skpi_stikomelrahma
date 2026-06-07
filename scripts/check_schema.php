<?php
require 'backend/konfigurasi/database.php';
echo "--- TABLE: angkatan ---\n";
try {
    $stmt = $pdo->query("DESCRIBE angkatan");
    while($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
        print_r($r);
    }
} catch (Exception $e) { echo $e->getMessage() . "\n"; }

echo "--- TABLE: kegiatan_mahasiswa ---\n";
try {
    $stmt = $pdo->query("DESCRIBE kegiatan_mahasiswa");
    while($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
        print_r($r);
    }
} catch (Exception $e) { echo $e->getMessage() . "\n"; }
?>
