<?php
require '../../konfigurasi/cors.php';
require '../../konfigurasi/database.php';
require '../../keamanan/CekToken.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // 1. Verifikasi token pengguna yang login
    $user = verifikasiTokenDanPeran($pdo);
    
    // Pastikan parameter nim sesuai dengan token, kecuali Admin
    $nim_target = isset($_GET['nim']) ? $_GET['nim'] : $user['nomor_induk'];
    
    if (strtolower($user['peran']) !== 'admin' && $user['nomor_induk'] !== $nim_target) {
        echo json_encode(["status" => "error", "pesan" => "Anda tidak berhak melihat data ini"]);
        exit;
    }

    try {
        // Cek mode preview (untuk admin)
        $is_preview = isset($_GET['preview']) && $_GET['preview'] == 'true' && strtolower($user['peran']) === 'admin';

        // 2. Ambil Biodata Mahasiswa
        $stmtMhs = $pdo->prepare("SELECT p.nomor_induk, p.nama_lengkap, 
                                  pr.nama_prodi as program_studi, m.angkatan, m.tempat_lahir, m.tanggal_lahir, 
                                  m.jenis_kelamin, m.no_hp, m.alamat, m.nik, m.agama, m.foto_formal,
                                  pr.gelar_lulusan as gelar, m.tahun_lulus
                                  FROM pengguna p
                                  LEFT JOIN mahasiswa m ON p.nomor_induk = m.nomor_induk
                                  LEFT JOIN master_prodi pr ON m.id_prodi = pr.id_prodi
                                  WHERE p.nomor_induk = ?");
        $stmtMhs->execute([$nim_target]);
        $biodata = $stmtMhs->fetch(PDO::FETCH_ASSOC);

        if (!$biodata) {
            if ($is_preview) {
                // Beri data dummy jika Admin sedang preview
                $biodata = [
                    "nomor_induk" => "22010101",
                    "nama_lengkap" => "MAHASISWA PREVIEW",
                    "program_studi" => "Informatika",
                    "tempat_lahir" => "Jakarta",
                    "tanggal_lahir" => "2000-01-01",
                    "foto_formal" => "",
                    "gelar" => "S.KOM",
                    "tahun_lulus" => "2026"
                ];
            } else {
                echo json_encode(["status" => "error", "pesan" => "Data mahasiswa tidak ditemukan"]);
                exit;
            }
        }

        // 3. Ambil Semua Kegiatan yang sudah DISETUJUI (ACC)
        $stmtKegiatan = $pdo->prepare("SELECT k.judul_kegiatan, m.tingkat, m.partisipasi, k.poin, k.waktu_pelaksanaan, k.dibuat_pada
                                       FROM kegiatan_mahasiswa k
                                       LEFT JOIN master_kategori_skpi m ON k.id_master_kategori = m.id_master_kategori
                                       WHERE k.nomor_induk = ? AND LOWER(k.status_validasi) = 'disetujui'
                                       ORDER BY k.dibuat_pada ASC");
        $stmtKegiatan->execute([$nim_target]);
        $kegiatan = $stmtKegiatan->fetchAll(PDO::FETCH_ASSOC);

        // 4. Hitung Total Poin
        $total_poin = 0;
        foreach ($kegiatan as $k) {
            $total_poin += (int)$k['poin'];
        }

        if ($is_preview && $total_poin < 250) {
            $total_poin = 250; // Paksa lewat validasi di frontend
            if (empty($kegiatan)) {
                $kegiatan = [
                    [
                        "judul_kegiatan" => "Contoh Kegiatan 1",
                        "tingkat" => "Nasional",
                        "partisipasi" => "Peserta",
                        "waktu_pelaksanaan" => "2025-01-01",
                        "poin" => 100
                    ],
                    [
                        "judul_kegiatan" => "Contoh Kegiatan 2",
                        "tingkat" => "Lokal",
                        "partisipasi" => "Ketua",
                        "waktu_pelaksanaan" => "2026-01-01",
                        "poin" => 150
                    ]
                ];
            }
        }

        // 5. Ambil Pengaturan (Template, TTD, dll)
        $stmtPengaturan = $pdo->query("SELECT meta_key, meta_value FROM pengaturan");
        $pengaturan = [];
        while ($row = $stmtPengaturan->fetch(PDO::FETCH_ASSOC)) {
            $pengaturan[$row['meta_key']] = $row['meta_value'];
        }

        // 6. Kembalikan Response
        echo json_encode([
            "status" => "sukses",
            "data" => [
                "biodata" => $biodata,
                "kegiatan" => $kegiatan,
                "total_poin" => $total_poin,
                "pengaturan" => $pengaturan
            ]
        ]);

    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "pesan" => "Gagal mengambil data SKPI: " . $e->getMessage()]);
    }
}
?>
