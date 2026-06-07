<?php
require '../../konfigurasi/cors.php';
require '../../konfigurasi/database.php';
require '../../keamanan/CekToken.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Verifikasi token (semua user login bisa upload foto profil mereka)
    $user = verifikasiTokenDanPeran($pdo);
    $nim = $user['nomor_induk'];

    if (!isset($_FILES['foto_formal'])) {
        echo json_encode(["status" => "error", "pesan" => "File foto tidak ditemukan"]);
        exit;
    }

    $file = $_FILES['foto_formal'];
    $ekstensi = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($ekstensi, ['jpg', 'jpeg', 'png']) || !in_array($mime, ['image/jpeg', 'image/png'])) {
        echo json_encode(["status" => "error", "pesan" => "Format foto harus JPG/PNG."]);
        exit;
    }

    // Maksimal 5MB
    if ($file['size'] > 5 * 1024 * 1024) {
        echo json_encode(["status" => "error", "pesan" => "Ukuran foto maksimal 5MB."]);
        exit;
    }

    $nama_file_baru = "FOTO_" . $nim . "_" . time() . "." . $ekstensi;
    $target_dir = "../../unggahan/foto_formal/";
    
    if (!is_dir($target_dir)) {
        mkdir($target_dir, 0777, true);
    }

    $tujuan = $target_dir . $nama_file_baru;

    if (move_uploaded_file($file['tmp_name'], $tujuan)) {
        try {
            // Update tabel mahasiswa
            $stmt = $pdo->prepare("UPDATE mahasiswa SET foto_formal = ? WHERE nomor_induk = ?");
            $stmt->execute([$nama_file_baru, $nim]);
            
            echo json_encode(["status" => "sukses", "pesan" => "Foto formal berhasil diunggah", "file" => $nama_file_baru]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "pesan" => "Gagal update database: " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "error", "pesan" => "Gagal memindahkan file foto"]);
    }
}
?>
