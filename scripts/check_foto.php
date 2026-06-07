<?php
require 'backend/konfigurasi/database.php';
$stmt = $pdo->query("SELECT foto_formal FROM mahasiswa WHERE nomor_induk='2411070015'");
print_r($stmt->fetch());
?>
