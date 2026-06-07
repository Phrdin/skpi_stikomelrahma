<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: *');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

if (!isset($_GET['file'])) {
    http_response_code(400);
    exit;
}

$fileParam = $_GET['file'];
// Mencegah directory traversal
$fileParam = str_replace(array('../', '..\\'), '', $fileParam);

$path = __DIR__ . '/../../unggahan/' . $fileParam;

if (file_exists($path)) {
    $mime = mime_content_type($path);
    header('Content-Type: ' . $mime);
    readfile($path);
} else {
    http_response_code(404);
}
?>
