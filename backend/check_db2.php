<?php
require 'konfigurasi/database.php';
$stmt = $pdo->query('SHOW COLUMNS FROM pengguna');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
