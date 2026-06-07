<?php
require '../../konfigurasi/cors.php';
require '../../konfigurasi/database.php';
require '../../keamanan/CekToken.php';

$aksi = isset($_GET['aksi']) ? $_GET['aksi'] : 'ambil';

try {
    // --- AKSI: AMBIL DATA ---
    if ($aksi == 'ambil') {
        verifikasiTokenDanPeran($pdo); // Semua user bisa ambil data (Mhs/Admin)
        $stmt = $pdo->query("SELECT * FROM master_kategori_skpi ORDER BY kategori_utama ASC, bobot DESC");
        echo json_encode(["status" => "sukses", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        exit;
    }

    // --- AKSI: AMBIL OPSI KATEGORI UTAMA ---
    if ($aksi == 'ambil_opsi') {
        verifikasiTokenDanPeran($pdo, 'admin'); // HANYA ADMIN
        $stmt = $pdo->query("SELECT DISTINCT kategori_utama FROM master_kategori_skpi ORDER BY kategori_utama ASC");
        echo json_encode(["status" => "sukses", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        exit;
    }

    // --- AKSI: IMPORT CSV (EXCEL) ---
    if ($aksi == 'import') {
        verifikasiTokenDanPeran($pdo, 'admin'); // HANYA ADMIN
        if (!isset($_FILES['file_csv'])) {
            echo json_encode(["status" => "error", "pesan" => "File CSV tidak terdeteksi!"]);
            exit;
        }

        $file = $_FILES['file_csv']['tmp_name'];
        $handle = fopen($file, "r");
        
        // Lewati baris 1 (Header Excel)
        fgetcsv($handle);

        $pdo->beginTransaction();
        $jumlah = 0;
        
        while (($row = fgetcsv($handle, 1000, ",")) !== FALSE) {
            $sql = "INSERT INTO master_kategori_skpi (kategori_utama, nama_kegiatan, tingkat, partisipasi, bobot, dasar_penilaian) VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $row[0] ?? '-',
                $row[1] ?? '-',
                $row[2] ?? '-',
                $row[3] ?? '-',
                (int)($row[4] ?? 0),
                $row[5] ?? '-'
            ]);
            $jumlah++;
        }
        
        fclose($handle);
        $pdo->commit();

        echo json_encode(["status" => "sukses", "pesan" => "$jumlah data berhasil diimport!"]);
        exit;
    }

    // --- AKSI: SIMPAN MANUAL (DARI MODAL REACT) ---
    if ($aksi == 'simpan') {
        verifikasiTokenDanPeran($pdo, 'admin'); // HANYA ADMIN
        $input = json_decode(file_get_contents("php://input"), true);
        if (!$input) exit;

        $id     = isset($input['id_master_kategori']) ? $input['id_master_kategori'] : null;
        $kat    = $input['kategori_utama'];
        $nama   = $input['nama_kegiatan'];
        $ting   = $input['tingkat'];
        $part   = $input['partisipasi'];
        $bobot  = (int)$input['bobot'];
        $dasar  = isset($input['dasar_penilaian']) ? $input['dasar_penilaian'] : 'Sertifikat/SK';

        if ($id) {
            // EDIT
            $sql = "UPDATE master_kategori_skpi SET kategori_utama=?, nama_kegiatan=?, tingkat=?, partisipasi=?, bobot=?, dasar_penilaian=? WHERE id_master_kategori=?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$kat, $nama, $ting, $part, $bobot, $dasar, $id]);
            echo json_encode(["status" => "sukses", "pesan" => "Kategori berhasil diperbarui!"]);
        } else {
            // TAMBAH
            $sql = "INSERT INTO master_kategori_skpi (kategori_utama, nama_kegiatan, tingkat, partisipasi, bobot, dasar_penilaian) VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$kat, $nama, $ting, $part, $bobot, $dasar]);
            echo json_encode(["status" => "sukses", "pesan" => "Kategori manual berhasil ditambahkan!"]);
        }
        exit;
    }

    // --- AKSI: HAPUS SATU DATA ---
    if ($aksi == 'hapus') {
        verifikasiTokenDanPeran($pdo, 'admin'); // HANYA ADMIN
        $id = $_GET['id'];
        $stmt = $pdo->prepare("DELETE FROM master_kategori_skpi WHERE id_master_kategori = ?");
        $stmt->execute([$id]);
        echo json_encode(["status" => "sukses", "pesan" => "Kategori berhasil dihapus"]);
        exit;
    }

    // --- AKSI: HAPUS SEMUA DATA (RESET) ---
    if ($aksi == 'hapus_semua') {
        verifikasiTokenDanPeran($pdo, 'admin'); // HANYA ADMIN
        $pdo->exec("DELETE FROM master_kategori_skpi");
        // Reset Auto Increment agar ID mulai dari 1 lagi
        $pdo->exec("ALTER TABLE master_kategori_skpi AUTO_INCREMENT = 1");
        
        echo json_encode(["status" => "sukses", "pesan" => "Seluruh data master kategori telah dikosongkan!"]);
        exit;
    }

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode(["status" => "error", "pesan" => "Server Error: " . $e->getMessage()]);
}

