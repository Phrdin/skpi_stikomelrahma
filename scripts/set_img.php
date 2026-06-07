<?php
require 'backend/konfigurasi/database.php';
// Cek apakah ada
$stmt = $pdo->query("SELECT * FROM pengaturan WHERE meta_key = 'skpi_background_image'");
if ($stmt->rowCount() == 0) {
    $pdo->exec("INSERT INTO pengaturan (meta_key, meta_value) VALUES ('skpi_background_image', 'bg_skpi_1.jpg')");
    echo 'Inserted';
} else {
    $pdo->exec("UPDATE pengaturan SET meta_value = 'bg_skpi_1.jpg' WHERE meta_key = 'skpi_background_image'");
    echo 'Updated';
}
?>
