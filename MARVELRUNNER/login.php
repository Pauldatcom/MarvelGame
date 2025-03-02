<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

session_start();
require_once 'connexion_bdd.php'; 


if (!$conn) {
    echo json_encode(["error" => "Échec de connexion à la base de données"]);
    exit;
}

// Get the data in Json 
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['email']) || !isset($data['password'])) {
    echo json_encode(["error" => "Email et mot de passe requis"]);
    exit;
}

$email = $data['email'];
$password = $data['password'];

//Check if the id is real 
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


