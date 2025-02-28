<?php   
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

include 'connexion_bdd.php';

$data = json_decode(file_get_contents("php://input"), true);
$user_id = $data['user_id'] ?? null;
$character_name = $data['character_name'] ?? null;

if (!$user_id || !$character_name) {
    echo json_encode(["error" => "user_id ou character_name manquant"]);
    exit;
}

$sql = "INSERT INTO character_selection (user_id, character_name) VALUES (?, ?) ON DUPLICATE KEY UPDATE character_name = VALUES(character_name)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("is", $user_id, $character_name);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["error" => "Erreur lors de l'enregistrement"]);
}

$stmt->close();
$conn->close();
?>

