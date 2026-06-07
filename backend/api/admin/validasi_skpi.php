<?php
// Izinkan admin kirim keputusan validasi
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require '../../konfigurasi/database.php';

$data = json_decode(file_get_contents("php://input"));

    require '../../keamanan/CekToken.php';
    $user = verifikasiTokenDanPeran($pdo, 'admin'); // Pastikan yang validasi adalah Admin
    $id_admin = $user['id'];

    if (isset($data->id) && isset($data->status)) {
        try {
            $poin = ($data->status === 'disetujui') ? 10 : 0;

            $sql = "UPDATE kegiatan_mahasiswa SET status_validasi = ?, poin = ?, id_validator = ?, tanggal_validasi = CURRENT_TIMESTAMP WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([strtolower($data->status), $poin, $id_admin, $data->id]);

        echo json_encode(["status" => "sukses", "pesan" => "Validasi berhasil diproses!"]);

    } catch (PDOException $e) {
        echo json_encode(["status" => "gagal", "pesan" => $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "pesan" => "Data kurang lengkap"]);
}
?>

