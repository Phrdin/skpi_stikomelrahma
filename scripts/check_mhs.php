<?php
require 'backend/konfigurasi/database.php';
print_r($pdo->query('DESCRIBE mahasiswa')->fetchAll(PDO::FETCH_ASSOC));
