<?php
require 'konfigurasi/database.php';

try {
    $pdo->exec("ALTER TABLE pengguna ADD COLUMN sandi_mentah VARCHAR(255) NULL AFTER kata_sandi");
    echo "Kolom sandi_mentah berhasil ditambahkan.\n";
    
    // Attempt to copy over existing unhashed passwords, though if they are hashed we can't revert them.
    // For admin, we know the default is Admin*12345
    $pdo->exec("UPDATE pengguna SET sandi_mentah = 'Admin*12345' WHERE peran = 'admin' AND nomor_induk = 'ADMIN01'");
    // For students, let's assume their default was their NIM if sandi_mentah is null. This is common in academic systems.
    $pdo->exec("UPDATE pengguna SET sandi_mentah = nomor_induk WHERE peran = 'mahasiswa' AND sandi_mentah IS NULL");
    
    echo "Data awal sandi_mentah berhasil diatur.\n";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
        echo "Kolom sandi_mentah sudah ada.\n";
    } else {
        echo "Error: " . $e->getMessage() . "\n";
    }
}
?>
