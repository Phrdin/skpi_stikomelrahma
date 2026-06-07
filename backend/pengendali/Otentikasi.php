<?php
function login($pdo) {
    // Ambil data JSON dari React
    $json_input = file_get_contents("php://input");
    $data = json_decode($json_input);

    if (!isset($data->nomor_induk) || !isset($data->kata_sandi)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "pesan" => "NIM/NIP dan Kata Sandi wajib diisi!"]);
        return;
    }

    // Gunakan trim() untuk membersihkan spasi tak terlihat di awal/akhir teks
    $nomor_induk = trim($data->nomor_induk);
    $kata_sandi = trim($data->kata_sandi);

    try {
        // Cari user di database berdasarkan NIM (tanpa password dulu)
        $stmt = $pdo->prepare("SELECT id, nomor_induk, nama_lengkap, peran, wajib_ganti_sandi, kata_sandi as hash_sandi FROM pengguna WHERE nomor_induk = ? AND status_aktif = 1");
        $stmt->execute([$nomor_induk]);
        $user = $stmt->fetch();

        // Verifikasi apakah user ada dan password cocok (baik sudah di-hash maupun masih plain text)
        if ($user && (password_verify($kata_sandi, $user['hash_sandi']) || $kata_sandi === $user['hash_sandi'])) {
            
            // JIKA masih menggunakan plain text (belum di-hash), kita perbaiki otomatis di belakang layar
            if ($kata_sandi === $user['hash_sandi']) {
                $new_hash = password_hash($kata_sandi, PASSWORD_DEFAULT);
                $pdo->prepare("UPDATE pengguna SET kata_sandi = ?, sandi_mentah = ? WHERE nomor_induk = ?")->execute([$new_hash, $kata_sandi, $nomor_induk]);
            } else {
                // Pastikan sandi_mentah terisi bagi user lama yang sudah di-hash
                $pdo->prepare("UPDATE pengguna SET sandi_mentah = ? WHERE nomor_induk = ? AND sandi_mentah IS NULL")->execute([$kata_sandi, $nomor_induk]);
            }

            // --- BUAT TOKEN UNTUK RBAC ---
            $token = bin2hex(random_bytes(32)); // Token acak yang kuat
            $pdo->prepare("UPDATE pengguna SET token = ? WHERE nomor_induk = ?")->execute([$token, $nomor_induk]);
            $user['token'] = $token;

            // Hapus password dari response agar aman
            unset($user['hash_sandi']);

            // Jika berhasil login
            http_response_code(200);
            echo json_encode([
                "status" => "sukses",
                "pesan" => "Login berhasil",
                "data" => $user
            ]);
        } else {
            // Jika gagal
            http_response_code(401);
            echo json_encode([
                "status" => "error", 
                "pesan" => "Kredensial salah atau pengguna tidak ditemukan."
            ]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "pesan" => "Error Database: " . $e->getMessage()]);
    }
}
?>