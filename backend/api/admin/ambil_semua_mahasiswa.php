<?php
// 1. Header CORS & JSON
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

// 2. Koneksi Database
require '../../konfigurasi/database.php';
require '../../keamanan/CekToken.php';

// SEMUA AKSI DI FILE INI HANYA BOLEH DIAKSES OLEH ADMIN!
verifikasiTokenDanPeran($pdo, 'admin');

$aksi = isset($_GET['aksi']) ? $_GET['aksi'] : 'ambil';

try {
    // --- AKSI: AMBIL DATA MAHASISWA ---
    if ($aksi == 'ambil') {
        $cari = isset($_GET['cari']) ? $_GET['cari'] : '';
        $id_akt = isset($_GET['angkatan']) ? $_GET['angkatan'] : '';

        // Query Utama dengan Subquery Poin (Lebih Aman dari Error 500)
        // Kita ambil data dari tabel, tapi semester_berjalan akan dihitung dinamis
        $sql = "SELECT 
                    m.*, 
                    a.nama_angkatan,
                    a.tahun as angkatan_tahun,
                    p.sandi_mentah,
                    s.nama_status as status_mahasiswa_text,
                    pr.nama_prodi as program_studi,
                    pr.gelar_lulusan as gelar,
                    pr.jenjang,
                    (SELECT IFNULL(SUM(poin), 0) 
                     FROM kegiatan_mahasiswa 
                     WHERE nomor_induk = m.nomor_induk AND status_validasi = 'disetujui') as total_poin
                FROM mahasiswa m 
                LEFT JOIN angkatan a ON m.id_angkatan = a.id
                LEFT JOIN pengguna p ON m.nomor_induk = p.nomor_induk
                LEFT JOIN master_status_mahasiswa s ON m.id_status = s.id_status
                LEFT JOIN master_prodi pr ON m.id_prodi = pr.id_prodi";
        
        $conditions = [];
        $params = [];
        
        if ($cari) {
            $conditions[] = "(m.nomor_induk LIKE ? OR m.nama_lengkap LIKE ?)";
            $params[] = "%$cari%";
            $params[] = "%$cari%";
        }
        if ($id_akt) {
            $conditions[] = "m.id_angkatan = ?";
            $params[] = $id_akt;
        }

        if (count($conditions) > 0) {
            $sql .= " WHERE " . implode(" AND ", $conditions);
        }

        $sql .= " ORDER BY m.nama_lengkap ASC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $bulan_sekarang = (int)date('n');
        $tahun_sekarang = (int)date('Y');
        foreach ($data as &$row) {
            $tahun_angkatan = (int)($row['angkatan_tahun'] ?? 0);
            if ($tahun_angkatan > 0) {
                $selisih_tahun = $tahun_sekarang - $tahun_angkatan;
                if ($bulan_sekarang >= 9) {
                    $row['semester_berjalan'] = ($selisih_tahun * 2) + 1;
                } else if ($bulan_sekarang < 3) {
                    $row['semester_berjalan'] = (($selisih_tahun - 1) * 2) + 1;
                } else {
                    $row['semester_berjalan'] = (($selisih_tahun - 1) * 2) + 2;
                }
                if ($row['semester_berjalan'] < 1) $row['semester_berjalan'] = 1;
            } else {
                $row['semester_berjalan'] = $row['semester_aktif'] ?? 1;
            }
        }

        echo json_encode(["status" => "sukses", "data" => $data]);
        exit;
    }

    // --- AKSI: IMPORT CSV ---
    if ($aksi == 'import') {
        if (!isset($_POST['id_angkatan']) || !isset($_FILES['file_csv'])) {
            echo json_encode(["status" => "error", "pesan" => "Data tidak lengkap"]);
            exit;
        }

        $id_angkatan_pilihan = $_POST['id_angkatan']; 
        $file = $_FILES['file_csv']['tmp_name'];
        $handle = fopen($file, "r");
        fgetcsv($handle); // Lewati header

        // Ambil tahun angkatan untuk kolom 'angkatan'
        $stT = $pdo->prepare("SELECT tahun FROM angkatan WHERE id = ?");
        $stT->execute([$id_angkatan_pilihan]);
        $thn = $stT->fetchColumn() ?: date('Y');

        $pdo->beginTransaction();
        $count = 0;
        while (($row = fgetcsv($handle, 1000, ",")) !== FALSE) {
            $nim = isset($row[0]) ? trim($row[0]) : ''; 
            if(empty($nim)) continue; // Lewati jika baris kosong

            $nama = isset($row[1]) ? trim($row[1]) : ''; 
            $pass = isset($row[2]) ? trim($row[2]) : '';
            
            $prodi_str = !empty($row[3]) ? trim($row[3]) : '';
            $stmtP = $pdo->prepare("SELECT id_prodi FROM master_prodi WHERE nama_prodi LIKE ? LIMIT 1");
            $stmtP->execute(["%$prodi_str%"]);
            $id_prodi = $stmtP->fetchColumn() ?: 1;

            $tempat_lahir = !empty($row[4]) ? trim($row[4]) : null;
            $tgl_lahir = !empty($row[5]) ? trim($row[5]) : null;
            $jk = !empty($row[6]) ? trim($row[6]) : null;
            $agama = !empty($row[7]) ? trim($row[7]) : null;
            $nik = !empty($row[8]) ? trim($row[8]) : null;
            $no_hp = !empty($row[9]) ? trim($row[9]) : null;
            $email = !empty($row[10]) ? trim($row[10]) : null;
            $alamat = !empty($row[11]) ? trim($row[11]) : null;
            $sem_aktif = (!empty($row[12]) && is_numeric($row[12])) ? trim($row[12]) : null;
            $thn_lulus = !empty($row[13]) ? trim($row[13]) : null;
            // $row[14] is Gelar, ignored because it's from master_prodi

            // Simpan Profil
            $sql_mahasiswa = "INSERT INTO mahasiswa (
                nomor_induk, nama_lengkap, id_angkatan, angkatan, 
                id_prodi, tempat_lahir, tanggal_lahir, jenis_kelamin, 
                agama, nik, no_hp, email, alamat, semester_aktif, semester_berjalan, tahun_lulus
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE 
                nama_lengkap=?, id_angkatan=?, angkatan=?, 
                id_prodi=?, tempat_lahir=?, tanggal_lahir=?, jenis_kelamin=?, 
                agama=?, nik=?, no_hp=?, email=?, alamat=?, semester_aktif=?, semester_berjalan=?, tahun_lulus=?";
                
            $params_mahasiswa = [
                $nim, $nama, $id_angkatan_pilihan, $thn,
                $id_prodi, $tempat_lahir, $tgl_lahir, $jk,
                $agama, $nik, $no_hp, $email, $alamat, $sem_aktif, $sem_aktif, $thn_lulus,
                // Update params
                $nama, $id_angkatan_pilihan, $thn,
                $id_prodi, $tempat_lahir, $tgl_lahir, $jk,
                $agama, $nik, $no_hp, $email, $alamat, $sem_aktif, $sem_aktif, $thn_lulus
            ];
            
            $pdo->prepare($sql_mahasiswa)->execute($params_mahasiswa);

            // Simpan Akun
            if (!empty($pass)) {
                $pass_hash = password_hash($pass, PASSWORD_DEFAULT);
                $pdo->prepare("INSERT INTO pengguna (nomor_induk, nama_lengkap, kata_sandi, sandi_mentah, peran, status_aktif) 
                              VALUES (?, ?, ?, ?, 'mahasiswa', 1) 
                              ON DUPLICATE KEY UPDATE nama_lengkap=?, kata_sandi=?, sandi_mentah=?")
                    ->execute([$nim, $nama, $pass_hash, $pass, $nama, $pass_hash, $pass]);
            } else {
                $pdo->prepare("INSERT INTO pengguna (nomor_induk, nama_lengkap, peran, status_aktif) 
                              VALUES (?, ?, 'mahasiswa', 1) 
                              ON DUPLICATE KEY UPDATE nama_lengkap=?")
                    ->execute([$nim, $nama, $nama]);
            }
            $count++;
        }
        fclose($handle);
        $pdo->commit();
        echo json_encode(["status" => "sukses", "pesan" => "$count Data Berhasil Dimasukkan!"]);
        exit;
    }

    // --- AKSI: SIMPAN MANUAL (TAMBAH / EDIT) ---
    if ($aksi == 'simpan') {
        $input = json_decode(file_get_contents("php://input"), true);
        $nim = $input['nomor_induk'] ?? ''; 
        $nama = $input['nama_lengkap'] ?? '';
        $id_akt = $input['id_angkatan'] ?? ''; 
        
        $id_prodi = $input['id_prodi'] ?? 1;
        $tempat_lahir = $input['tempat_lahir'] ?? null;
        $tgl_lahir = $input['tanggal_lahir'] ?? null;
        if (empty($tgl_lahir)) $tgl_lahir = null;
        
        $jk = $input['jenis_kelamin'] ?? null;
        $no_hp = $input['no_hp'] ?? null;
        $email = $input['email'] ?? null;
        $alamat = $input['alamat'] ?? null;
        $nik = $input['nik'] ?? null;
        $agama = $input['agama'] ?? null;
        $sem_aktif = $input['semester_aktif'] ?? null;
        if ($sem_aktif === '') $sem_aktif = null;
        // $gelar = $input['gelar'] ?? null; // Dihitung dari relasi prodi
        $thn_lulus = $input['tahun_lulus'] ?? null;
        $id_status = $input['id_status'] ?? 1; // 1 = Aktif
        $semester_berjalan = $input['semester_berjalan'] ?? ($sem_aktif ?? 1);
        
        $stT = $pdo->prepare("SELECT tahun FROM angkatan WHERE id = ?"); 
        $stT->execute([$id_akt]); 
        $thn = $stT->fetchColumn();

        $pdo->beginTransaction();
        
        $sql_mahasiswa = "INSERT INTO mahasiswa (
            nomor_induk, nama_lengkap, id_angkatan, angkatan, 
            id_prodi, tempat_lahir, tanggal_lahir, jenis_kelamin, 
            no_hp, email, alamat, nik, agama, semester_aktif, semester_berjalan, tahun_lulus, id_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
        ON DUPLICATE KEY UPDATE 
            nama_lengkap=?, id_angkatan=?, angkatan=?, 
            id_prodi=?, tempat_lahir=?, tanggal_lahir=?, jenis_kelamin=?, 
            no_hp=?, email=?, alamat=?, nik=?, agama=?, semester_aktif=?, semester_berjalan=?, tahun_lulus=?, id_status=?";
            
        $params_mahasiswa = [
            $nim, $nama, $id_akt, $thn,
            $id_prodi, $tempat_lahir, $tgl_lahir, $jk,
            $no_hp, $email, $alamat, $nik, $agama, $sem_aktif, $semester_berjalan, $thn_lulus, $id_status,
            $nama, $id_akt, $thn,
            $id_prodi, $tempat_lahir, $tgl_lahir, $jk,
            $no_hp, $email, $alamat, $nik, $agama, $sem_aktif, $semester_berjalan, $thn_lulus, $id_status
        ];
        
        $pdo->prepare($sql_mahasiswa)->execute($params_mahasiswa);
        
        // Cek apakah password kosong saat update (agar tidak tertimpa hash kosong)
        if (!empty($input['kata_sandi'])) {
            $pass_hash = password_hash($input['kata_sandi'], PASSWORD_DEFAULT);
            $pdo->prepare("INSERT INTO pengguna (nomor_induk, nama_lengkap, kata_sandi, sandi_mentah, peran, status_aktif) VALUES (?, ?, ?, ?, 'mahasiswa', 1) ON DUPLICATE KEY UPDATE nama_lengkap=?, kata_sandi=?, sandi_mentah=?")->execute([$nim, $nama, $pass_hash, $input['kata_sandi'], $nama, $pass_hash, $input['kata_sandi']]);
        } else {
            // Jika kosong, abaikan update password
            $pdo->prepare("INSERT INTO pengguna (nomor_induk, nama_lengkap, peran, status_aktif) VALUES (?, ?, 'mahasiswa', 1) ON DUPLICATE KEY UPDATE nama_lengkap=?")->execute([$nim, $nama, $nama]);
        }
        $pdo->commit();
        
        echo json_encode(["status" => "sukses", "pesan" => "Data Berhasil Disimpan!"]);
        exit;
    }

    // --- AKSI: HAPUS SATUAN & MASSAL ---
    if ($aksi == 'hapus_massal' || $aksi == 'hapus') {
        $input = json_decode(file_get_contents("php://input"), true);
        $nims = isset($input['nims']) ? $input['nims'] : [$_GET['nim']];
        
        if (!empty($nims)) {
            $pdo->beginTransaction();
            $placeholders = str_repeat('?,', count($nims) - 1) . '?';
            
            $pdo->prepare("DELETE FROM mahasiswa WHERE nomor_induk IN ($placeholders)")->execute($nims);
            $pdo->prepare("DELETE FROM pengguna WHERE nomor_induk IN ($placeholders)")->execute($nims);
            
            $pdo->commit();
            echo json_encode(["status" => "sukses", "pesan" => "Data Berhasil Dihapus!"]);
        } else {
            echo json_encode(["status" => "error", "pesan" => "Tidak ada data dipilih"]);
        }
        exit;
    }

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500); // Memberikan kode 500 ke browser jika error database
    echo json_encode(["status" => "error", "pesan" => $e->getMessage()]);
}

