<?php
// Ambil origin dari request yang masuk
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

// Daftar domain yang diizinkan mengakses API (Whitelist)
// Ganti / tambahkan domain production Akang di bawah ini nanti (contoh: 'https://skpi-elrahma.ac.id')
$allowed_origins = [
    'http://localhost:5173', // Port standar Vite React
    'http://localhost:3000'  // Alternatif port React
];

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: " . $origin);
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, authorization, X-Requested-With");

// Tangani "preflight" request otomatis dari React/Axios
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>