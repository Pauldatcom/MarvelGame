<?php
header('Content-Type: application/json');
ob_start(); // Get all parasite on display
error_reporting(E_ALL);
ini_set('display_errors', 1);


// Get the info from the .env
$envFile = __DIR__ . '/.env';
if (!file_exists($envFile)) {
    echo json_encode(["success" => false, "error" => "Fichier .env introuvable"]);
    exit;
}

$env = parse_ini_file($envFile);
if (!$env) {
    echo json_encode(["success" => false, "error" => "Erreur de lecture du fichier .env"]);
    exit;
}


$servername = $env['DB_HOST'] ?? 'localhost';
$username = $env['DB_USER'] ?? 'root';
$password = $env['DB_PASS'] ?? '';
$dbname = $env['DB_NAME'] ?? '';

if (!$servername || !$username || !$dbname) {
    echo json_encode(["success" => false, "error" => "Valeurs de connexion manquantes"]);
    exit;
}

// Create the connexion
$conn = new mysqli($servername, $username, $password, $dbname);


if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Connexion échouée : " . $conn->connect_error]);
    exit;
}

echo json_encode(["success" => true, "message" => "Connexion réussie"]);
ob_end_clean();
?>
