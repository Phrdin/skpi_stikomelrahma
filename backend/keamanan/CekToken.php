<?php
// backend/keamanan/CekToken.php
function verifikasiTokenDanPeran($pdo, $peran_dibutuhkan = null) {
    // Fallback check untuk header Authorization
    $authHeader = '';
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    } else {
        $headers = apache_request_headers();
        $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : (isset($headers['authorization']) ? $headers['authorization'] : '');
    }
    
    if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(["status" => "error", "pesan" => "Akses Ditolak. Token tidak ditemukan."]);
        exit();
    }
    
    $token = $matches[1];
    
    // Cari pengguna berdasarkan token
    $stmt = $pdo->prepare("SELECT id, nomor_induk, nama_lengkap, peran FROM pengguna WHERE token = ? AND status_aktif = 1");
    $stmt->execute([$token]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        http_response_code(401);
        echo json_encode(["status" => "error", "pesan" => "Token tidak valid atau kadaluarsa."]);
        exit();
    }
    
    // Jika butuh peran spesifik (RBAC)
    if ($peran_dibutuhkan !== null && strtolower($user['peran']) !== strtolower($peran_dibutuhkan)) {
        http_response_code(403);
        echo json_encode(["status" => "error", "pesan" => "Hak Akses Ditolak. Anda bukan " . $peran_dibutuhkan . "."]);
        exit();
    }
    
    // Kembalikan data user jika sukses
    return $user;
}
?>
