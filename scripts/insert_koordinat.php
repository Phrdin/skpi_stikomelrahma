<?php
require 'backend/konfigurasi/database.php';

$koordinat = [
    'skpi_pos_nomor' => '{"top": 140, "left": 460}',
    'skpi_pos_foto' => '{"top": 375, "left": 90, "width": 135, "height": 180}',
    'skpi_pos_nama' => '{"top": 380, "left": 280}',
    'skpi_pos_nim' => '{"top": 380, "left": 530}',
    'skpi_pos_ttl' => '{"top": 435, "left": 280}',
    'skpi_pos_prodi' => '{"top": 435, "left": 530}',
    'skpi_pos_gelar' => '{"top": 490, "left": 280}',
    'skpi_pos_lulus' => '{"top": 490, "left": 530}',
    'skpi_pos_tabel' => '{"top": 235, "left": 50}',
    'skpi_pos_ttd' => '{"bottom": 60, "right": 50}'
];

foreach ($koordinat as $key => $value) {
    $stmt = $pdo->prepare("SELECT id FROM pengaturan WHERE meta_key = ?");
    $stmt->execute([$key]);
    if (!$stmt->fetch()) {
        $ins = $pdo->prepare("INSERT INTO pengaturan (meta_key, meta_value) VALUES (?, ?)");
        $ins->execute([$key, $value]);
    }
}
echo "Koordinat default berhasil ditambahkan ke database.";
?>
