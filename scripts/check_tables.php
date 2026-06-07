<?php
require 'backend/konfigurasi/database.php';
print_r($pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_ASSOC));
