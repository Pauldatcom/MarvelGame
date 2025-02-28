<?php
// ✅ Active le mode debug pour voir les erreurs
error_reporting(E_ALL);
ini_set('display_errors', 1);

// ✅ Ajoute les headers CORS et JSON
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

session_start();
require_once 'connexion_bdd.php'; // ✅ Vérifie que ce fichier existe et contient la connexion

// ✅ Vérifie si la connexion est bien établie
if (!$conn) {
    echo json_encode(["error" => "Échec de connexion à la base de données"]);
    exit;
}

// ✅ Récupère les données envoyées en JSON
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['email']) || !isset($data['password'])) {
    echo json_encode(["error" => "Email et mot de passe requis"]);
    exit;
}

$email = $data['email'];
$password = $data['password'];

// ✅ Vérifie si l'utilisateur existe
$sql = "SELECT id, password FROM users WHERE email = ?";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode(["error" => "Erreur SQL : " . $conn->error]);
    exit;
}

$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if ($user && password_verify($password, $user['password'])) {
    $_SESSION['user_id'] = $user['id'];
    echo json_encode(["success" => true, "user_id" => $user['id']]);
} else {
    echo json_encode(["error" => "Identifiants incorrects"]);
}

$stmt->close();
$conn->close();
?>


