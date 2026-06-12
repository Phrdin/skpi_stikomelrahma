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
        // Kita juga perlu nge-join mahasiswa dan master_status_mahasiswa jika peran=mahasiswa untuk ambil izin_akses_skpi
        $sql = "SELECT p.id, p.nomor_induk, p.nama_lengkap, p.peran, p.wajib_ganti_sandi, p.kata_sandi as hash_sandi, 
                       m.id_status, s.nama_status, s.izin_akses_skpi
                FROM pengguna p 
                LEFT JOIN mahasiswa m ON p.nomor_induk = m.nomor_induk 
                LEFT JOIN master_status_mahasiswa s ON m.id_status = s.id_status
                WHERE p.nomor_induk = ? AND p.status_aktif = 1";
        $stmt = $pdo->prepare($sql);
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

            // Jalankan sinkronisasi periode otomatis di background
            require_once __DIR__ . '/../api/admin/sinkron_periode_otomatis.php';

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