<?php
require '../../konfigurasi/cors.php';
require '../../konfigurasi/database.php';
require '../../keamanan/CekToken.php';

$aksi = isset($_GET['aksi']) ? $_GET['aksi'] : 'ambil';

try {
    if ($aksi == 'ambil') {
        $stmt = $pdo->query("SELECT * FROM pengaturan_periode ORDER BY id_periode ASC");
        echo json_encode(["status" => "sukses", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        exit;
    }

    if ($aksi == 'update') {
        verifikasiTokenDanPeran($pdo, 'admin');
        
        $input = json_decode(file_get_contents("php://input"), true);
        if (!$input) {
            echo json_encode(["status" => "error", "pesan" => "Data tidak valid"]);
            exit;
        }

        $pdo->beginTransaction();
        foreach ($input as $row) {
            if (isset($row['id_periode']) && isset($row['bulan_mulai']) && isset($row['bulan_selesai'])) {
                $stmt = $pdo->prepare("UPDATE pengaturan_periode SET bulan_mulai = ?, bulan_selesai = ? WHERE id_periode = ?");
                $stmt->execute([$row['bulan_mulai'], $row['bulan_selesai'], $row['id_periode']]);
            }
        }
        $pdo->commit();

        echo json_encode(["status" => "sukses", "pesan" => "Pengaturan periode berhasil diperbarui"]);
        exit;
    }

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode(["status" => "error", "pesan" => "Server Error: " . $e->getMessage()]);
}
?>
