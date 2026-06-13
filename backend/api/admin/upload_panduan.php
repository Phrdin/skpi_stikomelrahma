<?php
require '../../konfigurasi/cors.php';
header("Content-Type: application/json");
require '../../konfigurasi/database.php';

if (isset($_FILES['file_panduan'])) {
    $file = $_FILES['file_panduan'];
    $ekstensi = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    
    if ($ekstensi !== 'pdf') {
        echo json_encode(["status" => "gagal", "pesan" => "Hanya file PDF yang diperbolehkan!"]);
        exit();
    }

    $target_dir = "../../unggahan/panduan_skpi/";
    if (!is_dir($target_dir)) mkdir($target_dir, 0777, true);

    // Boleh diganti sesuai nama asli file atau buat unique name
    $nama_file = "panduan_skpi_" . time() . "." . $ekstensi; 
    $target_file = $target_dir . $nama_file;
    $key_pengaturan = "skpi_panduan_file";

    if (move_uploaded_file($file["tmp_name"], $target_file)) {
        // Cek apakah key sudah ada
        $cek = $pdo->prepare("SELECT id FROM pengaturan WHERE meta_key = ?");
        $cek->execute([$key_pengaturan]);
        
        if ($cek->rowCount() > 0) {
            $stmt = $pdo->prepare("UPDATE pengaturan SET meta_value = ? WHERE meta_key = ?");
            $stmt->execute([$nama_file, $key_pengaturan]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO pengaturan (meta_key, meta_value) VALUES (?, ?)");
            $stmt->execute([$key_pengaturan, $nama_file]);
        }

        echo json_encode(["status" => "sukses", "pesan" => "Panduan SKPI berhasil diupload", "file" => $nama_file]);
    } else {
        echo json_encode(["status" => "gagal", "pesan" => "Gagal upload file"]);
    }
}
