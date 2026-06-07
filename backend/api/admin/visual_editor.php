<?php
require '../../konfigurasi/cors.php';
header("Content-Type: application/json");
require '../../konfigurasi/database.php';

$aksi = $_GET['aksi'] ?? 'ambil';

// 1. Ambil semua koordinat elemen
if ($aksi === 'ambil') {
    $stmt = $pdo->query("SELECT * FROM pengaturan_sertifikat");
    $elemen = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Ambil juga template gambarnya
    $stmt_tpl = $pdo->prepare("SELECT nilai FROM pengaturan_umum WHERE kunci = 'template_sertifikat'");
    $stmt_tpl->execute();
    $template = $stmt_tpl->fetchColumn() ?: 'template_asli.jpg';

    echo json_encode(["status" => "sukses", "elemen" => $elemen, "template" => $template]);
} 

if ($aksi == 'simpan_posisi') {
    // Ambil data JSON dari React
    $input = json_decode(file_get_contents("php://input"), true);
    $elemen_data = $input['elemen'];

    foreach ($elemen_data as $el) {
        $sql = "UPDATE pengaturan_sertifikat SET posisi_x = ?, posisi_y = ?, ukuran_font = ? WHERE element_id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $el['posisi_x'], 
            $el['posisi_y'], 
            $el['ukuran_font'], 
            $el['element_id']
        ]);
    }
    echo json_encode(["status" => "sukses", "pesan" => "Layout Disimpan"]);
    exit;
}

