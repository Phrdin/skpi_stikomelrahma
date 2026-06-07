<?php
require 'backend/konfigurasi/database.php';

$keys = [
    'skpi_format_nomor' => '[NIM]/SKPI-ER/[YEAR]',
    'skpi_nama_pejabat' => '',
    'skpi_nidn_pejabat' => '',
    'skpi_ttd_pejabat' => '',
    'skpi_background_image' => ''
];

echo "Memulai sinkronisasi database...\n";

foreach ($keys as $k => $v) {
    $stmt = $pdo->prepare("SELECT id FROM pengaturan WHERE meta_key = ?");
    $stmt->execute([$k]);
    if (!$stmt->fetch()) {
        $ins = $pdo->prepare("INSERT INTO pengaturan (meta_key, meta_value) VALUES (?, ?)");
        $ins->execute([$k, $v]);
        echo "- Kunci $k BERHASIL ditambahkan.\n";
    } else {
        echo "- Kunci $k sudah ada.\n";
    }
}

echo "Sinkronisasi selesai!";
?>
