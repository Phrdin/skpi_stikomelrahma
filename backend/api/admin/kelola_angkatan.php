<?php
require '../../konfigurasi/cors.php';
header("Content-Type: application/json");

require '../../konfigurasi/database.php';

$aksi = isset($_GET['aksi']) ? $_GET['aksi'] : '';

if ($aksi == 'tambah') {
    $input = json_decode(file_get_contents("php://input"), true);
    if (isset($input['tahun']) && isset($input['nama_angkatan'])) {
        try {
            $stmt = $pdo->prepare("INSERT INTO angkatan (tahun, nama_angkatan, keterangan, status_aktif) VALUES (?, ?, ?, 1)");
            $stmt->execute([$input['tahun'], $input['nama_angkatan'], $input['keterangan'] ?? '']);
            echo json_encode(["status" => "sukses", "pesan" => "Data angkatan berhasil ditambahkan"]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "pesan" => $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "error", "pesan" => "Data tidak lengkap"]);
    }
} elseif ($aksi == 'edit') {
    $input = json_decode(file_get_contents("php://input"), true);
    
    if (isset($input['id']) && isset($input['tahun']) && isset($input['nama_angkatan'])) {
        $id = $input['id'];
        $tahun = $input['tahun'];
        $nama_angkatan = $input['nama_angkatan'];
        
        try {
            $stmt = $pdo->prepare("UPDATE angkatan SET tahun = ?, nama_angkatan = ? WHERE id = ?");
            $stmt->execute([$tahun, $nama_angkatan, $id]);
            echo json_encode(["status" => "sukses", "pesan" => "Data angkatan berhasil diperbarui"]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "pesan" => $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "error", "pesan" => "Data tidak lengkap"]);
    }
} elseif ($aksi == 'hapus') {
    $input = json_decode(file_get_contents("php://input"), true);
    if (isset($input['id'])) {
        try {
            $stmt = $pdo->prepare("DELETE FROM angkatan WHERE id = ?");
            $stmt->execute([$input['id']]);
            echo json_encode(["status" => "sukses", "pesan" => "Data angkatan berhasil dihapus"]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "pesan" => $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "error", "pesan" => "ID tidak valid"]);
    }
} else {
    echo json_encode(["status" => "error", "pesan" => "Aksi tidak valid"]);
}
?>
