<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require '../../konfigurasi/database.php'; 

$method = $_SERVER['REQUEST_METHOD'];

// ==========================================
// 1. LOGIKA AMBIL SEMUA ANTREAN (GET)
// ==========================================
if ($method === 'GET') {
    try {
        // Ambil data yang masih berstatus 'menunggu'
        $sql = "SELECT k.*, p.nama_lengkap, m.kategori_utama, m.tingkat, m.partisipasi 
                FROM kegiatan_mahasiswa k
                JOIN pengguna p ON k.nomor_induk = p.nomor_induk
                LEFT JOIN master_kategori_skpi m ON k.id_master_kategori = m.id_master_kategori
                WHERE LOWER(k.status_validasi) = 'menunggu'
                ORDER BY k.id ASC";
        
        $stmt = $pdo->query($sql);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["status" => "sukses", "data" => $data]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "gagal", "pesan" => "Gagal ambil data: " . $e->getMessage()]);
    }
    exit();
}

// ==========================================
// 2. LOGIKA PROSES VALIDASI (POST)
// ==========================================
if ($method === 'POST') {
    // Ambil data JSON dari React
    $json = file_get_contents("php://input");
    $data = json_decode($json);

    if (isset($data->id) && isset($data->status)) {
        $id = $data->id;
        $status = $data->status; // 'Disetujui', 'Revisi', atau 'Ditolak'
        $alasan = $data->alasan ?? '';

        try {
            require '../../keamanan/CekToken.php';
            $user = verifikasiTokenDanPeran($pdo, 'admin');
            $id_admin = $user['id'];

            // Update status validasi di database
            $sql = "UPDATE kegiatan_mahasiswa SET status_validasi = ?, catatan_admin = ?, id_validator = ?, tanggal_validasi = CURRENT_TIMESTAMP WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$status, $alasan, $id_admin, $id]);

            echo json_encode([
                "status" => "sukses", 
                "pesan" => "Data berhasil diperbarui menjadi " . $status
            ]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "gagal", "pesan" => "Gagal update database: " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "error", "pesan" => "Data kiriman tidak lengkap"]);
    }
    exit();
}
?>

