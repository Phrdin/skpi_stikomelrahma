<?php
require '../../konfigurasi/cors.php';
require '../../konfigurasi/database.php'; 

$method = $_SERVER['REQUEST_METHOD'];

// --- GET: AMBIL DATA ---
if ($method === 'GET') {
    if (isset($_GET['type']) && $_GET['type'] === 'angkatan') {
        try {
            $stmt = $pdo->query("SELECT tahun, nama_angkatan FROM angkatan ORDER BY tahun DESC");
            echo json_encode(["status" => "sukses", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "pesan" => $e->getMessage()]);
        }
        exit();
    }

    $nim = $_GET['nim'] ?? '';
    try {
        $sql = "SELECT p.nama_lengkap, m.* FROM pengguna p 
                LEFT JOIN mahasiswa m ON p.nomor_induk = m.nomor_induk 
                WHERE p.nomor_induk = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$nim]);
        echo json_encode(["status" => "sukses", "data" => $stmt->fetch(PDO::FETCH_ASSOC)]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "pesan" => $e->getMessage()]);
    }
    exit();
}

// --- POST: SIMPAN DATA ---
if ($method === 'POST') {
    $json = file_get_contents("php://input");
    $data = json_decode($json);

    if (isset($data->nomor_induk)) {
        $nim = $data->nomor_induk;
        $hp = $data->no_hp;
        $email = $data->email;
        $alamat = $data->alamat;
        
        try {
            $pdo->beginTransaction();
            // Cek Mahasiswa
            $stmt_cek = $pdo->prepare("SELECT id FROM mahasiswa WHERE nomor_induk = ?");
            $stmt_cek->execute([$nim]);
            
            if ($stmt_cek->fetch()) {
                $sql = "UPDATE mahasiswa SET no_hp=?, email=?, alamat=? WHERE nomor_induk=?";
                $pdo->prepare($sql)->execute([$hp, $email, $alamat, $nim]);
            } else {
                $sql = "INSERT INTO mahasiswa (nomor_induk, no_hp, email, alamat, status_mahasiswa) VALUES (?, ?, ?, ?, 'Aktif')";
                $pdo->prepare($sql)->execute([$nim, $hp, $email, $alamat]);
            }
            $pdo->commit();
            echo json_encode(["status" => "sukses", "pesan" => "Tersimpan!"]);
        } catch (PDOException $e) {
            $pdo->rollBack();
            echo json_encode(["status" => "gagal", "pesan" => $e->getMessage()]);
        }
    }
}
?>

