<?php
$host = 'localhost';
$db   = 'db_skpi'; // Di hostinger biasanya ada awalan, misal u123456_db_skpi
$user = 'db_skpi'; // Di hostinger biasanya ada awalan, misal u123456_db_skpi
$pass = 'SKPI_stikom*123'; 

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die(json_encode(["status" => "error", "pesan" => "Koneksi Database Gagal: " . $e->getMessage()]));
}
?>