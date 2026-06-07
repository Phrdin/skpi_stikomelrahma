<?php
require 'backend/konfigurasi/database.php';
print_r($pdo->query('DESCRIBE angkatan')->fetchAll(PDO::FETCH_ASSOC));
print_r($pdo->query('SELECT * FROM angkatan')->fetchAll(PDO::FETCH_ASSOC));
