<?php
file_put_contents("debug_register.log", file_get_contents("php://input")); 

error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include 'connexion_bdd.php';

$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';
$date_naissance = $data['date_naissance'] ?? '';
$sexe = $data['sexe'] ?? '';
$character_name = $data['character_name'] ?? '';

if (empty($email) || empty($password) || empty($date_naissance) || empty($sexe) || empty($character_name)) {
    echo json_encode(["error" => "Tous les champs sont requis"]);
    exit;
}

// Vérifie si l'email existe déjà
$sql_check = "SELECT id FROM users WHERE email = ?";
$stmt_check = $conn->prepare($sql_check);
$stmt_check->bind_param("s", $email);
$stmt_check->execute();
$result_check = $stmt_check->get_result();

if ($result_check->num_rows > 0) {
    echo json_encode(["error" => "Cet email est déjà utilisé"]);
    exit;
}

// Hash du mot de passe
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// Insertion de l'utilisateur
$sql = "INSERT INTO users (email, password, date_naissance, sexe) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssss", $email, $hashed_password, $date_naissance, $sexe);

if ($stmt->execute()) {
    $user_id = $stmt->insert_id; // Récupérer l'ID du nouvel utilisateur

    // Insérer le personnage choisi
    $sql_character = "INSERT INTO character_selection (user_id, character_name) VALUES (?, ?)";
    $stmt_character = $conn->prepare($sql_character);
    $stmt_character->bind_param("is", $user_id, $character_name);
    $stmt_character->execute();

    echo json_encode(["success" => true, "user_id" => $user_id]);
} else {
    echo json_encode(["error" => "Erreur lors de l'inscription"]);
}

$stmt->close();
$stmt_character->close();
$conn->close();
?>
