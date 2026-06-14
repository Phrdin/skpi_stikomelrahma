<?php
require '../../konfigurasi/cors.php';
header("Content-Type: application/json");

require '../../konfigurasi/database.php';

$aksi = isset($_GET['aksi']) ? $_GET['aksi'] : '';

if ($aksi == 'ambil') {
    $stmt = $pdo->query("SELECT meta_key, meta_value FROM pengaturan");
    $data = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $data[$row['meta_key']] = $row['meta_value'];
    }
    echo json_encode(["status" => "sukses", "data" => $data]);
} elseif ($aksi == 'simpan') {
    $input = json_decode(file_get_contents("php://input"), true);
    if ($input) {
        try {
            $pdo->beginTransaction();
            foreach ($input as $key => $value) {
                $stmt = $pdo->prepare("UPDATE pengaturan SET meta_value = ? WHERE meta_key = ?");
                $stmt->execute([$value, $key]);
                if ($stmt->rowCount() == 0) {
                    $stmtCek = $pdo->prepare("SELECT COUNT(*) FROM pengaturan WHERE meta_key = ?");
                    $stmtCek->execute([$key]);
                    if ($stmtCek->fetchColumn() == 0) {
                        $stmtIns = $pdo->prepare("INSERT INTO pengaturan (meta_key, meta_value) VALUES (?, ?)");
                        $stmtIns->execute([$key, $value]);
                    }
                }
            }
            $pdo->commit();
            echo json_encode(["status" => "sukses", "pesan" => "Pengaturan berhasil diperbarui!"]);
        } catch (Exception $e) {
            $pdo->rollBack();
            echo json_encode(["status" => "error", "pesan" => $e->getMessage()]);
        }
    }
}

