<?php
require_once __DIR__ . '/konfigurasi/cors.php';
require_once __DIR__ . '/konfigurasi/database.php';


$request_uri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

header('Content-Type: application/json');

if (strpos($request_uri, '/login') !== false && $method == 'POST') {
    require_once __DIR__ . '/pengendali/Otentikasi.php';
    login($pdo); 
} 
else {
    http_response_code(404);
    echo json_encode(["status" => "error", "pesan" => "Endpoint tidak ditemukan. URL: " . $request_uri]);
}
?>