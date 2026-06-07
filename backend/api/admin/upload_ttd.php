<?php
require '../../konfigurasi/cors.php';
require '../../konfigurasi/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['ttd_file'])) {
        $file = $_FILES['ttd_file'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        
        if ($ext !== 'png') {
            echo json_encode(["status" => "error", "pesan" => "Hanya file PNG transparan yang diizinkan!"]);
            exit;
        }

        $nama_file = "ttd_pejabat_" . time() . ".png";
        $tujuan = "../../unggahan/tanda_tangan/" . $nama_file;

        if (move_uploaded_file($file['tmp_name'], $tujuan)) {
            // Cek apakah key sudah ada
            $cek = $pdo->prepare("SELECT id FROM pengaturan WHERE meta_key = 'skpi_ttd_pejabat'");
            $cek->execute();
            if ($cek->rowCount() > 0) {
                $stmt = $pdo->prepare("UPDATE pengaturan SET meta_value = ? WHERE meta_key = 'skpi_ttd_pejabat'");
                $stmt->execute([$nama_file]);
            } else {
                $stmt = $pdo->prepare("INSERT INTO pengaturan (meta_key, meta_value) VALUES ('skpi_ttd_pejabat', ?)");
                $stmt->execute([$nama_file]);
            }

            echo json_encode(["status" => "sukses", "file" => $nama_file]);
        } else {
            echo json_encode(["status" => "error", "pesan" => "Gagal mengunggah file"]);
        }
    }
}
?>
