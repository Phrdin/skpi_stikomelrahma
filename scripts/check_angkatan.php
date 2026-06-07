<?php
require 'backend/konfigurasi/database.php';
$stmt = $pdo->query("SELECT * FROM angkatan");
$res = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($res);
?>
