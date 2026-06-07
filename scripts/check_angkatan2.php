<?php
require 'backend/konfigurasi/database.php';
$stmt = $pdo->query("SELECT * FROM angkatan");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
$stmt2 = $pdo->query("SELECT meta_key, meta_value FROM pengaturan WHERE meta_key = 'skpi_background_image'");
print_r($stmt2->fetchAll(PDO::FETCH_ASSOC));
?>
