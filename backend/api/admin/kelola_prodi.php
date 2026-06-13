<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require '../../konfigurasi/cors.php';
require '../../konfigurasi/database.php';
require '../../keamanan/CekToken.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

verifikasiTokenDanPeran($pdo, 'admin');

$aksi = isset($_GET['aksi']) ? $_GET['aksi'] : '';

try {
    if ($aksi == 'ambil') {
        $stmt = $pdo->query("SELECT * FROM master_prodi ORDER BY id_prodi ASC");
        echo json_encode(["status" => "sukses", "data" => $stmt->fetchAll()]);
    } 
    elseif ($aksi == 'simpan') {
        $input = json_decode(file_get_contents("php://input"), true);
        
        if (isset($input['id_prodi']) && $input['id_prodi']) {
            $stmt = $pdo->prepare("UPDATE master_prodi SET nama_prodi = ?, jenjang = ?, gelar_lulusan = ?, masa_studi_tahun = ? WHERE id_prodi = ?");
            $stmt->execute([$input['nama_prodi'], $input['jenjang'], $input['gelar_lulusan'], $input['masa_studi_tahun'], $input['id_prodi']]);
            echo json_encode(["status" => "sukses", "pesan" => "Data berhasil diperbarui"]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO master_prodi (nama_prodi, jenjang, gelar_lulusan, masa_studi_tahun) VALUES (?, ?, ?, ?)");
            $stmt->execute([$input['nama_prodi'], $input['jenjang'], $input['gelar_lulusan'], $input['masa_studi_tahun']]);
            echo json_encode(["status" => "sukses", "pesan" => "Data berhasil ditambahkan"]);
        }
    } 
    elseif ($aksi == 'hapus') {
        $input = json_decode(file_get_contents("php://input"), true);
        
        // Pastikan tidak dihapus jika sedang dipakai
        $stmt_cek = $pdo->prepare("SELECT COUNT(*) FROM mahasiswa WHERE id_prodi = ?");
        $stmt_cek->execute([$input['id_prodi']]);
        if ($stmt_cek->fetchColumn() > 0) {
            echo json_encode(["status" => "error", "pesan" => "Tidak dapat dihapus, Program Studi ini masih dipakai oleh mahasiswa!"]);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM master_prodi WHERE id_prodi = ?");
        $stmt->execute([$input['id_prodi']]);
        echo json_encode(["status" => "sukses", "pesan" => "Data berhasil dihapus"]);
    } 
    else {
        echo json_encode(["status" => "error", "pesan" => "Aksi tidak valid"]);
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "pesan" => $e->getMessage()]);
}
?>
