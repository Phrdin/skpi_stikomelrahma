<?php
require 'backend/konfigurasi/database.php';
$pdo->exec("INSERT INTO pengaturan (meta_key, meta_value) VALUES ('skpi_background1_image', 'bg_skpi_1.jpg') ON DUPLICATE KEY UPDATE meta_value = 'bg_skpi_1.jpg'");
$pdo->exec("INSERT INTO pengaturan (meta_key, meta_value) VALUES ('skpi_background2_image', 'bg_skpi_2.jpg') ON DUPLICATE KEY UPDATE meta_value = 'bg_skpi_2.jpg'");
echo 'Updated';
?>
