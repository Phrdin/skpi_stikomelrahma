<?php
require '../../konfigurasi/cors.php';
require '../../konfigurasi/database.php';
require '../../keamanan/CekToken.php';

$aksi = isset($_GET['aksi']) ? $_GET['aksi'] : 'ambil';

try {
    // SEMUA USER BISA AMBIL DATA SEMESTER (Untuk melihat target poin)
    if ($aksi == 'ambil') {
        verifikasiTokenDanPeran($pdo);
        $stmt = $pdo->query("SELECT * FROM pengaturan_semester ORDER BY semester ASC");
        echo json_encode(["status" => "sukses", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        exit;
    }

    // HANYA ADMIN YANG BISA UPDATE TARGET POIN
    if ($aksi == 'update') {
        verifikasiTokenDanPeran($pdo, 'admin');
        
        $input = json_decode(file_get_contents("php://input"), true);
        if (!$input) {
            echo json_encode(["status" => "error", "pesan" => "Data tidak valid"]);
            exit;
        }

        $pdo->beginTransaction();
        foreach ($input as $row) {
            if (isset($row['id']) && isset($row['target_poin'])) {
                $stmt = $pdo->prepare("UPDATE pengaturan_semester SET target_poin = ? WHERE id = ?");
                $stmt->execute([$row['target_poin'], $row['id']]);
            }
        }
        $pdo->commit();

        echo json_encode(["status" => "sukses", "pesan" => "Pengaturan poin semester berhasil diperbarui"]);
        exit;
    }

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode(["status" => "error", "pesan" => "Server Error: " . $e->getMessage()]);
}
?>
