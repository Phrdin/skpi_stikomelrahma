<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require '../../konfigurasi/database.php'; 

$method = $_SERVER['REQUEST_METHOD'];

// --- GET: AMBIL STATUS PERMOHONAN ---
if ($method === 'GET') {
    if (isset($_GET['nim'])) {
        $nim = $_GET['nim'];
        try {
            $sql = "SELECT id, status, file_scan_skpi, tanggal_pengajuan, tanggal_selesai 
                    FROM permohonan_cetak_skpi 
                    WHERE nomor_induk = ? 
                    ORDER BY id DESC LIMIT 1";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$nim]);
            $data = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($data) {
                echo json_encode(["status" => "sukses", "data" => $data]);
            } else {
                echo json_encode(["status" => "sukses", "data" => null, "pesan" => "Belum mengajukan"]);
            }
        } catch (PDOException $e) {
            echo json_encode(["status" => "gagal", "pesan" => $e->getMessage()]);
        }
    }
    // --- GET ALL UNTUK ADMIN ---
    else if (isset($_GET['aksi']) && $_GET['aksi'] === 'semua_admin') {
        try {
            $sql = "SELECT p.*, u.nama_lengkap, b.foto_formal 
                    FROM permohonan_cetak_skpi p
                    JOIN pengguna u ON p.nomor_induk = u.nomor_induk
                    LEFT JOIN mahasiswa b ON p.nomor_induk = b.nomor_induk
                    ORDER BY p.id DESC";
            $stmt = $pdo->query($sql);
            echo json_encode(["status" => "sukses", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "gagal", "pesan" => $e->getMessage()]);
        }
    }
    exit();
}

// --- POST: AJUKAN CETAK ATAU UPDATE OLEH ADMIN ---
if ($method === 'POST') {
    // Membaca JSON body jika form data tidak digunakan
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Jika upload file (multipart/form-data), $_POST akan terisi
    $aksi = $_POST['aksi'] ?? ($input['aksi'] ?? '');

    if ($aksi === 'ajukan') {
        $nim = $input['nim'] ?? '';
        if (!$nim) {
            echo json_encode(["status" => "error", "pesan" => "NIM tidak ditemukan."]);
            exit();
        }

        try {
            // Cek apakah sudah pernah mengajukan dan belum selesai (mencegah double)
            $cek = $pdo->prepare("SELECT id FROM permohonan_cetak_skpi WHERE nomor_induk = ? AND status = 'Diproses Admin'");
            $cek->execute([$nim]);
            if ($cek->fetch()) {
                echo json_encode(["status" => "error", "pesan" => "Anda sudah memiliki pengajuan yang sedang diproses!"]);
                exit();
            }

            $sql = "INSERT INTO permohonan_cetak_skpi (nomor_induk, status) VALUES (?, 'Diproses Admin')";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$nim]);
            echo json_encode(["status" => "sukses", "pesan" => "Pengajuan cetak SKPI berhasil dikirim!"]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "gagal", "pesan" => $e->getMessage()]);
        }
        exit();
    }
    
    if ($aksi === 'upload_final') {
        $id = $_POST['id'] ?? '';
        
        if (!isset($_FILES['file_scan']) || $_FILES['file_scan']['error'] !== 0) {
            echo json_encode(["status" => "error", "pesan" => "File scan PDF tidak valid atau belum diunggah."]);
            exit();
        }

        $file = $_FILES['file_scan'];
        $ekstensi = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        
        if ($ekstensi !== 'pdf') {
            echo json_encode(["status" => "error", "pesan" => "Hanya file PDF yang diizinkan."]);
            exit();
        }

        $nama_file_baru = "SKPI_RESMI_" . time() . "_" . preg_replace("/[^a-zA-Z0-9.]/", "_", $file['name']);
        
        // Simpan ke direktori yang sama atau buat folder baru khusus final
        $folder_tujuan = "../../unggahan/arsip_sertifikat/";
        
        if (move_uploaded_file($file['tmp_name'], $folder_tujuan . $nama_file_baru)) {
            try {
                $sql = "UPDATE permohonan_cetak_skpi 
                        SET status = 'Selesai', file_scan_skpi = ?, tanggal_selesai = CURRENT_TIMESTAMP 
                        WHERE id = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$nama_file_baru, $id]);
                echo json_encode(["status" => "sukses", "pesan" => "Dokumen SKPI Final berhasil diunggah!"]);
            } catch (PDOException $e) {
                echo json_encode(["status" => "gagal", "pesan" => $e->getMessage()]);
            }
        } else {
            echo json_encode(["status" => "error", "pesan" => "Gagal menyimpan file PDF."]);
        }
        exit();
    }
}
?>
