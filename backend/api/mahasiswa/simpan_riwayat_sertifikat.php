<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require '../../konfigurasi/database.php';

$input = json_decode(file_get_contents("php://input"), true);

if (isset($input['nim'])) {
    $nim = $input['nim'];
    $semester_input = strtoupper($input['semester']); 
    $tahun_sekarang = date('Y');
    $bulan_sekarang = date('m');
    $tanggal_full = date('Y-m-d H:i:s');

    $romawi = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    $bulan_romawi = $romawi[(int)$bulan_sekarang];
    $status_semester = (strpos($semester_input, 'GENAP') !== false) ? 'GENAP' : 'GANJIL';

    try {
        // 1. AMBIL FORMAT NOMOR DARI DATABASE (Tabel Pengaturan)
        $stmt_fmt = $pdo->prepare("SELECT meta_value FROM pengaturan WHERE meta_key = 'format_nomor_sertifikat'");
        $stmt_fmt->execute();
        $format_db = $stmt_fmt->fetchColumn();

        // Jika di database belum ada, gunakan format default permintaan Akang
        if (!$format_db) {
            $format_db = "[NO]/SRT/SKPI-[SEM]/STL/[BLN]/[THN]";
        }

        // 2. HITUNG NOMOR URUT (RESET SETIAP TAHUN)
        $stmt_urut = $pdo->prepare("SELECT COUNT(*) as total FROM sertifikat WHERE YEAR(tanggal_terbit) = ?");
        $stmt_urut->execute([$tahun_sekarang]);
        $row_urut = $stmt_urut->fetch();
        $nomor_baru = str_pad($row_urut['total'] + 1, 3, "0", STR_PAD_LEFT); 

        // 3. RAKIT NOMOR SERI FINAL BERDASARKAN FORMAT
        $nomor_seri_final = str_replace(
            ["[NO]", "[SEM]", "[BLN]", "[THN]"],
            [$nomor_baru, $status_semester, $bulan_romawi, $tahun_sekarang],
            $format_db
        );

        // 4. CARI ID MAHASISWA
        $stmt_user = $pdo->prepare("SELECT id FROM pengguna WHERE nomor_induk = ?");
        $stmt_user->execute([$nim]);
        $user = $stmt_user->fetch();

        if (!$user) {
            echo json_encode(["status" => "error", "pesan" => "Data Mahasiswa tidak ditemukan!"]);
            exit;
        }

        $id_mhs = $user['id'];

        // 5. CEK APAKAH SUDAH PERNAH TERBIT (Agar tidak double nomor urut untuk orang yang sama)
        $cek = $pdo->prepare("SELECT nomor_seri FROM sertifikat WHERE id_mahasiswa = ? AND nomor_seri LIKE ?");
        $cek->execute([$id_mhs, "%$status_semester%/$tahun_sekarang"]);
        $data_lama = $cek->fetch();
        
        if (!$data_lama) {
            // SIMPAN DATA BARU
            $sql = "INSERT INTO sertifikat (id_mahasiswa, id_semester, nomor_seri, total_poin, file_sertifikat, tanggal_terbit) 
                    VALUES (?, (SELECT id FROM semester WHERE nama_semester = ? LIMIT 1), ?, ?, '-', ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$id_mhs, $input['semester'], $nomor_seri_final, $input['total_poin'], $tanggal_full]);
            
            echo json_encode(["status" => "sukses", "nomor_baru" => $nomor_seri_final]);
        } else {
            // Jika sudah ada, kembalikan nomor yang lama agar tidak membengkak nomor urutnya
            echo json_encode(["status" => "sukses", "nomor_baru" => $data_lama['nomor_seri'], "pesan" => "Mengambil data lama"]);
        }

    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "pesan" => "Database Error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "pesan" => "NIM tidak dikirim!"]);
}

