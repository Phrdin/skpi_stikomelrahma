<?php
require '../../konfigurasi/cors.php';
header("Content-Type: application/json");
require '../../konfigurasi/database.php';

if (isset($_FILES['file_template'])) {
    $file = $_FILES['file_template'];
    $ekstensi = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    
    if (!in_array($ekstensi, ['jpg', 'jpeg', 'png'])) {
        echo json_encode(["status" => "gagal", "pesan" => "Hanya file gambar (JPG/PNG) yang diperbolehkan!"]);
        exit();
    }

    $target_dir = "../../unggahan/template_skpi/";
    if (!is_dir($target_dir)) mkdir($target_dir, 0777, true);

    $nama_file = "template_skpi_" . time() . "." . $ekstensi; 
    $target_file = $target_dir . $nama_file;

    $page = isset($_POST['jenis_page']) && $_POST['jenis_page'] == '2' ? 'skpi_background2_image' : 'skpi_background1_image';

    if (move_uploaded_file($file["tmp_name"], $target_file)) {
        // Cek apakah key sudah ada
        $cek = $pdo->prepare("SELECT id FROM pengaturan WHERE meta_key = ?");
        $cek->execute([$page]);
        
        if ($cek->rowCount() > 0) {
            $stmt = $pdo->prepare("UPDATE pengaturan SET meta_value = ? WHERE meta_key = ?");
            $stmt->execute([$nama_file, $page]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO pengaturan (meta_key, meta_value) VALUES (?, ?)");
            $stmt->execute([$page, $nama_file]);
        }

        echo json_encode(["status" => "sukses", "pesan" => "Template berhasil diupload", "file" => $nama_file, "page" => $page]);
    } else {
        echo json_encode(["status" => "gagal", "pesan" => "Gagal upload file"]);
    }
}

