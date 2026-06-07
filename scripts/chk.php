<?php
require 'backend/konfigurasi/database.php';
print_r($pdo->query("SELECT meta_key, meta_value FROM pengaturan WHERE meta_key LIKE '%background%'")->fetchAll(PDO::FETCH_ASSOC));
?>
