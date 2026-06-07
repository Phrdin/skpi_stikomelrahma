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

// --- GET: AMBIL DATA ---
if ($method === 'GET') {
    $nim = $_GET['nim'] ?? '';
    try {
        $sql = "SELECT k.id, k.id_master_kategori, m.kategori_utama, m.nama_kegiatan as master_nama_kegiatan, 
                       m.tingkat, m.partisipasi, k.judul_kegiatan, k.status_validasi, k.poin, 
                       k.file_bukti, k.catatan_admin, k.waktu_pelaksanaan, k.dibuat_pada 
                FROM kegiatan_mahasiswa k
                LEFT JOIN master_kategori_skpi m ON k.id_master_kategori = m.id_master_kategori
                WHERE k.nomor_induk = ? 
                ORDER BY k.id DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$nim]);
        echo json_encode(["status" => "sukses", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "gagal", "pesan" => $e->getMessage()]);
    }
    exit();
}

// --- POST: SIMPAN EDIT ---
if ($method === 'POST') {
    $id = $_POST['id'] ?? '';
    $id_master = $_POST['id_master_kategori'] ?? '';
    $waktu_pelaksanaan = $_POST['waktu_pelaksanaan'] ?? '';

    try {
        $cek = $pdo->prepare("SELECT status_validasi, file_bukti FROM kegiatan_mahasiswa WHERE id = ?");
        $cek->execute([$id]);
        $dataLama = $cek->fetch(PDO::FETCH_ASSOC);

        // Gunakan strtolower agar pengecekan tidak error karena besar/kecil huruf
        $statusLama = strtolower($dataLama['status_validasi']);
        if (!$dataLama || ($statusLama !== 'menunggu' && $statusLama !== 'revisi')) {
            echo json_encode(["status" => "error", "pesan" => "Hanya ajuan yang menunggu atau revisi yang boleh diedit"]);
            exit();
        }

        // Ambil Data Master Baru
        $stmtMaster = $pdo->prepare("SELECT nama_kegiatan, bobot FROM master_kategori_skpi WHERE id_master_kategori = ?");
        $stmtMaster->execute([$id_master]);
        $master = $stmtMaster->fetch(PDO::FETCH_ASSOC);

        if (!$master) {
            echo json_encode(["status" => "error", "pesan" => "Kategori kegiatan tidak valid!"]);
            exit();
        }

        $judul = $master['nama_kegiatan'];
        $poin  = $master['bobot'];

        $nama_file_final = $dataLama['file_bukti'];

        if (isset($_FILES['sertifikat']) && $_FILES['sertifikat']['error'] === 0) {
            $file = $_FILES['sertifikat'];
            $ekstensi = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            $ekstensi_diizinkan = ['pdf', 'jpg', 'jpeg', 'png'];
            
            if (!in_array($ekstensi, $ekstensi_diizinkan)) {
                echo json_encode(["status" => "error", "pesan" => "Tipe file tidak valid."]);
                exit();
            }

            $nama_file_baru = "EDIT_" . time() . "_" . preg_replace("/[^a-zA-Z0-9.]/", "_", $file['name']);
            if (move_uploaded_file($file['tmp_name'], "../../unggahan/arsip_sertifikat/" . $nama_file_baru)) {
                $nama_file_final = $nama_file_baru;
            }
        }

        $stmt = $pdo->prepare("UPDATE kegiatan_mahasiswa SET id_master_kategori = ?, judul_kegiatan = ?, waktu_pelaksanaan = ?, poin = ?, file_bukti = ?, status_validasi = 'Menunggu', catatan_admin = NULL WHERE id = ?");
        $stmt->execute([$id_master, $judul, $waktu_pelaksanaan, $poin, $nama_file_final, $id]);

        echo json_encode(["status" => "sukses", "pesan" => "Perubahan ajuan berhasil disimpan!"]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "gagal", "pesan" => $e->getMessage()]);
    }
    exit();
}
?>
