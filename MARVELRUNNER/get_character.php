<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

include 'connexion_bdd.php';

$user_id = $_GET['user_id'] ?? 0;
if ($user_id == 0) {
    echo json_encode(["error" => "ID utilisateur manquant"]);
    exit;
}

// ✅ Récupère uniquement le dernier personnage sélectionné par l'utilisateur
$sql = "SELECT character_name FROM character_selection WHERE user_id = ? ORDER BY id DESC LIMIT 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$data = $result->fetch_assoc();

echo json_encode($data ?: ["error" => "Aucun personnage trouvé"]);

$stmt->close();
$conn->close();
?>

