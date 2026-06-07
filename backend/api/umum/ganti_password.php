<?php
require '../../konfigurasi/cors.php';
require '../../konfigurasi/database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $json = file_get_contents("php://input");
    $data = json_decode($json);

    if (isset($data->nomor_induk) && isset($data->password_lama) && isset($data->password_baru)) {
        $nim = $data->nomor_induk;
        $pwd_lama = $data->password_lama;
        $pwd_baru = $data->password_baru;

        try {
            // Ambil data user
            $stmt = $pdo->prepare("SELECT kata_sandi FROM pengguna WHERE nomor_induk = ?");
            $stmt->execute([$nim]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                // Cek apakah password lama cocok (baik yg hash maupun yg blm dihash)
                if (password_verify($pwd_lama, $user['kata_sandi']) || $pwd_lama === $user['kata_sandi']) {
                    // Enkripsi password baru
                    $hash_baru = password_hash($pwd_baru, PASSWORD_DEFAULT);
                    
                    // Simpan ke database, update kata_sandi (hash) dan sandi_mentah (plain text)
                    $update = $pdo->prepare("UPDATE pengguna SET kata_sandi = ?, sandi_mentah = ?, wajib_ganti_sandi = 0 WHERE nomor_induk = ?");
                    $update->execute([$hash_baru, $pwd_baru, $nim]);

                    echo json_encode(["status" => "sukses", "pesan" => "Kata sandi berhasil diperbarui!"]);
                } else {
                    echo json_encode(["status" => "gagal", "pesan" => "Kata sandi lama salah!"]);
                }
            } else {
                echo json_encode(["status" => "gagal", "pesan" => "Pengguna tidak ditemukan."]);
            }
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "pesan" => "Gagal terhubung ke database: " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "error", "pesan" => "Data tidak lengkap"]);
    }
} else {
    echo json_encode(["status" => "error", "pesan" => "Metode tidak valid"]);
}
?>
