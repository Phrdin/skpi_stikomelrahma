<?php
require '../../konfigurasi/cors.php';
require '../../konfigurasi/database.php';
require '../../keamanan/CekToken.php';

$aksi = isset($_GET['aksi']) ? $_GET['aksi'] : 'ambil';

try {
    // SEMUA USER BISA AMBIL DATA MASTER STATUS (Untuk dropdown dll)
    if ($aksi == 'ambil') {
        $stmt = $pdo->query("SELECT * FROM master_status_mahasiswa ORDER BY id_status ASC");
        echo json_encode(["status" => "sukses", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        exit;
    }

    // HANYA ADMIN
    verifikasiTokenDanPeran($pdo, 'admin');

    if ($aksi == 'tambah') {
        $input = json_decode(file_get_contents("php://input"), true);
        if (!empty($input['nama_status'])) {
            $izin = isset($input['izin_akses_skpi']) ? (int)$input['izin_akses_skpi'] : 0;
            $lanjut = isset($input['lanjut_semester']) ? (int)$input['lanjut_semester'] : 0;

            $stmt = $pdo->prepare("INSERT INTO master_status_mahasiswa (nama_status, izin_akses_skpi, lanjut_semester) VALUES (?, ?, ?)");
            $stmt->execute([$input['nama_status'], $izin, $lanjut]);
            
            echo json_encode(["status" => "sukses", "pesan" => "Status berhasil ditambahkan"]);
        } else {
            echo json_encode(["status" => "error", "pesan" => "Nama status tidak boleh kosong"]);
        }
        exit;
    }

    if ($aksi == 'edit') {
        $input = json_decode(file_get_contents("php://input"), true);
        if (!empty($input['id_status']) && !empty($input['nama_status'])) {
            $izin = isset($input['izin_akses_skpi']) ? (int)$input['izin_akses_skpi'] : 0;
            $lanjut = isset($input['lanjut_semester']) ? (int)$input['lanjut_semester'] : 0;

            $stmt = $pdo->prepare("UPDATE master_status_mahasiswa SET nama_status = ?, izin_akses_skpi = ?, lanjut_semester = ? WHERE id_status = ?");
            $stmt->execute([$input['nama_status'], $izin, $lanjut, $input['id_status']]);
            
            echo json_encode(["status" => "sukses", "pesan" => "Status berhasil diperbarui"]);
        } else {
            echo json_encode(["status" => "error", "pesan" => "Data tidak lengkap"]);
        }
        exit;
    }

    if ($aksi == 'hapus') {
        $input = json_decode(file_get_contents("php://input"), true);
        if (!empty($input['id_status'])) {
            // Cek apakah ada mahasiswa yang pakai status ini
            $cek = $pdo->prepare("SELECT COUNT(*) FROM mahasiswa WHERE id_status = ?");
            $cek->execute([$input['id_status']]);
            if ($cek->fetchColumn() > 0) {
                echo json_encode(["status" => "error", "pesan" => "Gagal dihapus: Status ini sedang digunakan oleh mahasiswa"]);
                exit;
            }

            $stmt = $pdo->prepare("DELETE FROM master_status_mahasiswa WHERE id_status = ?");
            $stmt->execute([$input['id_status']]);
            
            echo json_encode(["status" => "sukses", "pesan" => "Status berhasil dihapus"]);
        } else {
            echo json_encode(["status" => "error", "pesan" => "ID status tidak valid"]);
        }
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "pesan" => "Server Error: " . $e->getMessage()]);
}
?>
