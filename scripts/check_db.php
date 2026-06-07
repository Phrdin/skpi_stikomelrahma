<?php
require 'backend/konfigurasi/database.php';
$stmt = $pdo->query("SELECT meta_key, meta_value FROM pengaturan");
print_r($stmt->fetchAll(PDO::FETCH_KEY_PAIR));
?>
