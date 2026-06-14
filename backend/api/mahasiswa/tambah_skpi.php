<?php
require '../../konfigurasi/cors.php';
require '../../konfigurasi/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['nomor_induk'])) {
        $nim = $_POST['nomor_induk'];
        
        // Data yang dikirim dari React hanya ID dan waktu_pelaksanaan
        $id_master = $_POST['id_master_kategori'];
        $waktu_pelaksanaan = isset($_POST['waktu_pelaksanaan']) ? $_POST['waktu_pelaksanaan'] : null;

        try {
            // CEK STATUS MAHASISWA DAN IZIN AKSES
            $stmtCek = $pdo->prepare("SELECT s.izin_akses_skpi, s.nama_status FROM mahasiswa m JOIN master_status_mahasiswa s ON m.id_status = s.id_status WHERE m.nomor_induk = ?");
            $stmtCek->execute([$nim]);
            $statusMhs = $stmtCek->fetch();

            if (!$statusMhs || $statusMhs['izin_akses_skpi'] != 1) {
                echo json_encode(["status" => "error", "pesan" => "Status Anda saat ini adalah " . ($statusMhs['nama_status'] ?? 'Tidak Dikenal') . ". Anda tidak dapat mengunggah ajuan SKPI."]);
                exit();
            }

            // AMBIL DATA DARI MASTER (Agar Poin & Judul Aman / Tidak Bisa Dimanipulasi Mahasiswa)
            $stmtMaster = $pdo->prepare("SELECT nama_kegiatan, bobot FROM master_kategori_skpi WHERE id_master_kategori = ?");
            $stmtMaster->execute([$id_master]);
            $master = $stmtMaster->fetch();

            if (!$master) {
                echo json_encode(["status" => "error", "pesan" => "Kategori kegiatan tidak valid!"]);
                exit();
            }

            $judul = $master['nama_kegiatan'];
            $poin  = $master['bobot'];

            // 1. Proses upload file sertifikat
            if (!isset($_FILES['sertifikat'])) {
                echo json_encode(["status" => "error", "pesan" => "File sertifikat tidak ditemukan"]);
                exit();
            }

            $file = $_FILES['sertifikat'];
            $ekstensi = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            
            // Validasi Keamanan: Cek Ekstensi dan MIME Type
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mime = finfo_file($finfo, $file['tmp_name']);
            finfo_close($finfo);

            $ekstensi_diizinkan = ['pdf', 'jpg', 'jpeg', 'png'];
            $mime_diizinkan = ['application/pdf', 'image/jpeg', 'image/png'];

            if (!in_array($ekstensi, $ekstensi_diizinkan) || !in_array($mime, $mime_diizinkan)) {
                echo json_encode(["status" => "error", "pesan" => "Tipe file tidak valid. Hanya izinkan PDF, JPG, dan PNG."]);
                exit();
            }

            $nama_file_baru = "SKPI_" . $nim . "_" . time() . "." . $ekstensi;
            
            // Pastikan folder ini sudah dibuat di server!
            $tujuan = "../../unggahan/arsip_sertifikat/" . $nama_file_baru;

            if (move_uploaded_file($file['tmp_name'], $tujuan)) {
                
                $semester_ditempuh = isset($_POST['semester_ditempuh']) ? $_POST['semester_ditempuh'] : 1;

                // 2. Simpan ke database
                $sql = "INSERT INTO kegiatan_mahasiswa 
                        (nomor_induk, id_master_kategori, judul_kegiatan, file_bukti, status_validasi, poin, waktu_pelaksanaan, semester_ditempuh) 
                        VALUES (?, ?, ?, ?, 'Menunggu', ?, ?, ?)";
                
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$nim, $id_master, $judul, $nama_file_baru, $poin, $waktu_pelaksanaan, $semester_ditempuh]);

                echo json_encode(["status" => "sukses", "pesan" => "Alhamdulillah, ajuan berhasil dikirim!"]);
            } else {
                echo json_encode(["status" => "error", "pesan" => "Gagal mengunggah file ke folder tujuan"]);
            }

        } catch (PDOException $e) {
            echo json_encode(["status" => "gagal", "pesan" => "Kendala database: " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "error", "pesan" => "Data NIM tidak lengkap"]);
    }
}
?>

