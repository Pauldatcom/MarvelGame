// import { setupUI } from "./ui.js";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";



if (!localStorage.getItem("user_id")) {
  console.error("❌ Aucun user_id trouvé dans localStorage !");
  window.location.href = "index.html"; // Redirige vers la connexion si l'utilisateur n'est pas connecté
}


document.body.style.overflow = "hidden";
document.documentElement.style.overflow = "hidden";

const gameMusic = new Audio("public/sounds/CONVERSATION.mp3"); // Remplace par ton fichier
gameMusic.loop = true; // La musique tourne en boucle
gameMusic.volume = 0.2; // Volume de départ (ajuste si nécessaire)
document.body.appendChild(gameMusic);
const obstacles = [];
const obstacleTypes = [];
const MAX_OBSTACLES = 8;
const obstacleSpawnCount = 1; // Nombre d'obstacles à générer à chaque intervalle
const obstacleSpacing = 200
const characters = {
  mme_fantastic: "public/models/mmefantastic.glb",
  the_thing: "public/models/the_thingtexturedno_rig.glb",
  human_torch: "public/models/Humantorch.glb",
  mr_kang: "public/models/kang6.glb",
};
let flameModel, portalModel, rockModel;
 let animationId; // Déclaration globale de l'animation
 let isPaused = false;

const loader = new GLTFLoader();


loader.load('public/models/flame.glb', (gltf) => {
  flameModel = gltf.scene; 
});

loader.load('public/models/ObstacleShield.glb', (gltf) => {
  portalModel = gltf.scene;
});

loader.load('public/models/ObstacleDisque.glb', (gltf) => {
  rockModel = gltf.scene;
  rockModel.rotation.x = Math.PI / 2;
});


window.onload = function() {
  let selectedCharacter = localStorage.getItem("selectedCharacter") || "the_thing"; // Défaut au cas où fetch échoue
  localStorage.setItem("selectedCharacter", selectedCharacter);
    console.log("Personnage sélectionné :", selectedCharacter);
    const userId = localStorage.getItem("user_id");

    if (!userId) {
        console.error("❌ Aucun user_id trouvé, redirection vers la connexion...");
        window.location.href = "secondConnexion.html";
    } else {
        fetch(`http://localhost/MARVELRUNNER/get_character.php?user_id=${userId}`)
        .then(response => response.json())
        .then(data => {
            console.log("Réponse du serveur :", data);
            if (data.error) {
                console.error("❌ Erreur : " + data.error);
            } else {
                let selectedCharacter = data.character_name;
                localStorage.setItem("selectedCharacter", selectedCharacter);
                console.log("✅ Personnage sélectionné :", selectedCharacter);
                initGame(selectedCharacter);
            }
        })
        .catch(error => {
            console.error("Erreur Fetch:", error);
        });
    }
    
    console.log("🔍 Vérification avant initGame :", selectedCharacter);
    
  
  gameMusic.play().catch(error => console.log("Lecture automatique bloquée :", error));
  
};



function initGame(selectedCharacter) {
  console.log("🚀 Début de initGame - isPaused =", isPaused);
  
  const scene = new THREE.Scene();
  function showGameTips(scene) {
    const tipsContainer = document.createElement("div");
    tipsContainer.id = "gameTips";
    tipsContainer.style.position = "absolute";
    tipsContainer.style.top = "50%";
    tipsContainer.style.left = "50%";
    tipsContainer.style.transform = "translate(-50%, -50%)";
    tipsContainer.style.width = "80%";
    tipsContainer.style.maxWidth = "600px";
    tipsContainer.style.background = "rgba(0, 0, 0, 0.8)";
    tipsContainer.style.padding = "20px";
    tipsContainer.style.borderRadius = "10px";
    tipsContainer.style.boxShadow = "0px 0px 20px rgba(255, 255, 255, 0.8)";
    tipsContainer.style.color = "white";
    tipsContainer.style.textAlign = "center";
    tipsContainer.style.fontFamily = "'Comic Sans MS', sans-serif";
    tipsContainer.style.zIndex = "1000";
    tipsContainer.innerHTML = `
      <div class="title" style="font-size: 28px; font-weight: bold; color: #ffcc00; text-shadow: 2px 2px 8px rgba(255, 204, 0, 0.8);">
        Astuces
      </div>
      <div class="tips" style="font-size: 20px; line-height: 1.6;">
        ➜ <strong style="color: #00ccff;">Flèche Haut</strong> : Sauter<br />
        ➜ <strong style="color: #00ccff;">Flèche Gauche</strong> : Aller à gauche<br />
        ➜ <strong style="color: #00ccff;">Flèche Droite</strong> : Aller à droite<br />
        ➜ <strong style="color: #00ccff;">Bouton P</strong> : Activer le pouvoir (toutes les 30s, dure 15s)
      </div>
    `;
  
    document.body.appendChild(tipsContainer);
  
    // Faire disparaître le message après 3 secondes
    setTimeout(() => {
      tipsContainer.style.opacity = "0";
      setTimeout(() => tipsContainer.remove(), 500);
    }, 3000);
  }

showGameTips(scene);
  const wallShaderMaterial = new THREE.ShaderMaterial({ // Shaders GLSL , Variables globale , VertexShader "vUv" coordonnes
    uniforms: {
        time: { value: 0 },
        opacity: { value: 0.6 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        uniform float opacity;
        varying vec2 vUv;
        
        void main() {
            float wave = sin(vUv.y * 10.0 + time * 2.0) * 0.5 + 0.5;
            vec3 color = mix(vec3(0.0, 0.1, 0.5), vec3(0.2, 0.6, 1.0), wave);
            gl_FragColor = vec4(color, opacity * wave);
        }
    `,
    transparent: true
});
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 10, 18);
  const wallGeometry = new THREE.BoxGeometry(2, 10, 350);

const leftWall = new THREE.Mesh(wallGeometry, wallShaderMaterial);
const rightWall = new THREE.Mesh(wallGeometry, wallShaderMaterial);

leftWall.position.set(-12, 5, 0); // Ajuste à ta piste
rightWall.position.set(12, 5, 0);

scene.add(leftWall);
scene.add(rightWall);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  document.body.appendChild(renderer.domElement);

   // Ajout d'une lumière ambiante plus intense pour éclairer la piste
  
  
  const loader = new GLTFLoader();
  let trackModels = []; // Déclaration correcte en dehors de la boucle

  loader.load('public/models/trackmodele3d.glb', (gltf) => {
    for (let i = 0; i < 5; i++) {
      const trackModel = gltf.scene.clone(); // Cloner le modèle chargé
      trackModel.scale.set(25, 0.5, 50);
      trackModel.position.set(0, -1, -40 * i);
      scene.add(trackModel);
      trackModels.push(trackModel);
    }

    function animateTrack() {
      trackModels.forEach((trackModel) => {
        trackModel.position.z += 0.5;
        if (trackModel.position.z > 20) trackModel.position.z -= 200;
      });
      requestAnimationFrame(animateTrack);
    }
    animateTrack();
  }, undefined, (error) => {
    console.error('Erreur de chargement du modèle 3D:', error);
  })

  
  let powerAvailable = true;
  let powerActive = false;

  // Création du conteneur de l'indicateur de pouvoir
const powerIndicator = document.createElement("div");
powerIndicator.style.position = "absolute";
powerIndicator.style.left = "20px";
powerIndicator.style.top = "100px";
powerIndicator.style.width = "50px";
powerIndicator.style.height = "50px";
powerIndicator.style.borderRadius = "50%";
powerIndicator.style.background = "red"; // Commence en red car le pouvoir est indisponible
powerIndicator.style.border = "3px solid white";
powerIndicator.style.boxShadow = "0 0 10px rgba(255, 255, 255, 0.8)";
document.body.appendChild(powerIndicator);

// Fonction pour mettre à jour l'indicateur
function updatePowerIndicator(available) {
  powerIndicator.style.background = available ? "green" : "red";
}

setTimeout(() => {
  powerAvailable = true;
  updatePowerIndicator(true); // Passe en vert après 30 sec
}, 30000);


// Modification de l'événement pour activer le pouvoir
window.addEventListener('keydown', (e) => {
  if (e.key === 'p' && powerAvailable && !powerActive) {
    powerActive = true;
    powerAvailable = false;
    activatePower();
    
    // Change l'indicateur en rouge pendant la recharge
    updatePowerIndicator(false);

    setTimeout(() => { 
      powerActive = false; 
    }, 15000); // Pouvoir dure 15 secondes

    setTimeout(() => { 
      powerAvailable = true; 
      updatePowerIndicator(true); // Passe en vert quand le pouvoir est prêt
    }, 30000); // Recharge de 30 secondes
  }
});
  

  window.addEventListener('keydown', (e) => {
    if (e.key === 'p' && powerAvailable && !powerActive) {
      powerActive = true;
      powerAvailable = false;
      activatePower();
      setTimeout(() => { powerActive = false; }, 15000); // Pouvoir de 15 secondes
      setTimeout(() => { powerAvailable = true; }, 30000); // Recharge de 30 secondes
    }
  });

  function activatePower() {
    console.log('Pouvoir activé !');
    // Rendre le personnage invincible
    character.userData.invincible = true;
    let blinkInterval = setInterval(() => {
      character.visible = !character.visible; // Alterne la visibilité
  }, 200); // Change toutes les 200ms (tu peux ajuster)

  setTimeout(() => {
      clearInterval(blinkInterval);  // Arrête le clignotement
      character.visible = true;      // Remet visible
      character.userData.invincible = false;
      console.log('Pouvoir terminé');
  }, 15000); // Pouvoir pendant 15 secondes
}


let obstacleInterval = setInterval(createObstacles, 2000);
let gameOverElement;
let isGameOver = false;


// Game Over Display
function showGameOver() {
  checkBestScore();
  gameOverElement = document.createElement("div");
  gameOverElement.id = "gameOverElement";
  gameOverElement.style.position = "fixed";
  gameOverElement.style.top = "0";
  gameOverElement.style.left = "0";
  gameOverElement.style.width = "100%";
  gameOverElement.style.height = "100%";
  gameOverElement.style.background = "black";
  gameOverElement.style.display = "flex";
  gameOverElement.style.flexDirection = "column";
  gameOverElement.style.alignItems = "center";
  gameOverElement.style.justifyContent = "center";
  gameOverElement.style.opacity = "0"; // Apparition immédiate
  gameOverElement.style.transition = "opacity 2s ease-in-out";
  gameOverElement.style.zIndex = "9999";

  const gameOverText = document.createElement("div");
  gameOverText.innerText = "GAME OVER";
  gameOverText.style.fontSize = "80px";
  gameOverText.style.fontWeight = "bold";
  gameOverText.style.color = "red";
  gameOverText.style.fontFamily = "'Press Start 2P', sans-serif"; // Police type rétro
  gameOverText.style.textShadow = "0 0 10px crimson, 0 0 10px darkred, 0 0 10px red";
  gameOverText.style.animation = "shake 1.5s ease-in-out infinite alternate";
  gameOverText.style.marginBottom = "80px"; // Espacement augmenté pour que les boutons soient bien en dessous
    // Conteneur des boutons
    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.flexDirection = "column";
    buttonContainer.style.alignItems = "center"; // Centrage horizontal
    buttonContainer.style.gap = "20px";
    buttonContainer.style.marginTop = "20px";
  
    // Bouton "Recommencer"
    const restartButton = document.createElement("button");
    restartButton.innerText = "Recommencer";
    restartButton.style.padding = "15px 30px";
    restartButton.style.fontSize = "20px";
    restartButton.style.fontWeight = "bold";
    restartButton.style.background = "#007BFF";
    restartButton.style.color = "white";
    restartButton.style.border = "none";
    restartButton.style.cursor = "pointer";
    restartButton.style.transition = "0.3s";
    restartButton.onmouseover = () => restartButton.style.background = "darkred";
    restartButton.onmouseout = () => restartButton.style.background = "crimson";
    restartButton.onclick = restartGame;
  
    // Bouton "Quitter"
    const quitButton = document.createElement("button");
    quitButton.innerText = "Quitter";
    quitButton.style.padding = "15px 30px";
    quitButton.style.fontSize = "20px";
    quitButton.style.fontWeight = "bold";
    quitButton.style.background = "DC3545";
    quitButton.style.color = "white";
    quitButton.style.border = "none";
    quitButton.style.cursor = "pointer";
    quitButton.style.transition = "0.3s";
    quitButton.onmouseover = () => quitButton.style.background = "darkgray";
    quitButton.onmouseout = () => quitButton.style.background = "gray";
    quitButton.onclick = () => window.location.href = "selectionCharater.html"; // Redirection au menu de sélection
  
    buttonContainer.appendChild(restartButton);
    buttonContainer.appendChild(quitButton);
    

  gameOverElement.appendChild(gameOverText);
  gameOverElement.appendChild(buttonContainer);
  document.body.appendChild(gameOverElement);


  clearInterval(obstacleInterval);
  cancelAnimationFrame(animationId);
  setTimeout(() => {
    gameOverElement.style.opacity = "1";
  }, 100);
  isGameOver = true;
}

// const style = document.createElement("style"); // Effect the game over shaking 
// style.innerHTML = `
//   @keyframes shake {
//     0% { transform: translateX(-2px) rotate(-1deg); }
//     50% { transform: translateX(2px) rotate(1deg); }
//     100% { transform: translateX(-2px) rotate(-1deg); }
//   }
// `;
// document.head.appendChild(style);


const collisionSound = new Audio('public/sounds/songcollision1.mp3');
collisionSound.volume = 0.7;  // Volume à 70%
// Collision Detection
function checkCollision(obstacle) {
  if (character.userData.invincible) return false;
  const boxB = new THREE.Box3().setFromObject(obstacle);
  
  boxB.expandByScalar(0.2);
  
  if (characterHitbox.intersectsBox(boxB)) {
    collisionSound.play();
    return true;
  }
  return false;
}
// Video Background Setup
const video = document.createElement("video");
video.src =
  "public/models/Gen-3 Alpha Turbo 1253773931, i want a video of th, Cropped - IMG 7webp, M 5.mp4";
video.loop = true;
video.muted = true;
video.play();
const videoTexture = new THREE.VideoTexture(video);
scene.background = videoTexture;

// Lighting Setup (to prevent black objects)
const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);


selectedCharacter = selectedCharacter.toLowerCase().replace(/\s+/g, "_");
// Character Setup
const loaderCharacter = new GLTFLoader();
let character,
  isJumping = false,
  jumpVelocity = 0;
const lanes = [-5, 0, 5];
let characterLane = 1;
loaderCharacter.load(characters[selectedCharacter], (gltf) => {
  
  character = gltf.scene;
  character.scale.set(1.2, 1.2, 1.2);
  character.position.set(lanes[characterLane], 1, 5);
  character.rotation.y = Math.PI;
  scene.add(character);

  // On définit la taille désirée pour la hitbox (largeur, hauteur, profondeur)
  const hitboxSize = new THREE.Vector3(1, 1.5, 1); // Ajuste ces valeurs selon ton modèle
  // On positionne la hitbox de façon à couvrir le bas du personnage (ajustement vertical)
  characterHitbox.setFromCenterAndSize(
    character.position.clone().add(new THREE.Vector3(0, hitboxSize.y / 2, 0)),
    hitboxSize
  );
  if (selectedCharacter === "mr_kang") {
    character.rotation.y = Math.PI * 2; // Tourne Kang dans l'autre sens
  }
});

let characterHitbox = new THREE.Box3();


function updateCharacterHitbox() {
  if (character) {
    // On récupère la taille actuelle (si jamais tu veux la changer dynamiquement)
    const hitboxSize = characterHitbox.getSize(new THREE.Vector3());
    // On repositionne la hitbox au centre du personnage, en ajoutant une offset verticale
    characterHitbox.setFromCenterAndSize(
      character.position.clone().add(new THREE.Vector3(0, hitboxSize.y / 2, 0)),
      hitboxSize
    );
  }
}




// Enlever les barres de scroll de la page
window.addEventListener('load', () => {
  document.body.style.overflow = 'hidden';
});

// Keyboard Controls without Camera Movement
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" && characterLane > 0) {
    characterLane--;
    character.position.x = lanes[characterLane];
  }
  if (e.key === "ArrowRight" && characterLane < lanes.length - 1) {
    characterLane++;
    character.position.x = lanes[characterLane];
  }
  if (e.key === "ArrowUp" && !isJumping) {
    isJumping = true;
    jumpVelocity = 0.3;
  }
    if (e.key.toLowerCase() === 'S' && !isJumping) {
      e.preventDefault();
      if (character.position.y > 0){
        jumpVelocity = -1;
      }
      return false;
    }
  if (character) character.position.x = lanes[characterLane];
  
});


const trackWidth = 25;
const laneCount = 3;
const laneWidth = (trackWidth / laneCount) * 1;
lanes [0] = -laneWidth;
lanes [1] = 0;
lanes [2] = laneWidth;

let gameSpeed = 0.4;
function increaseSpeed() {
  if (score % 1000 === 0) gameSpeed += 0.3; 
}

// Obstacle Management (Flames, Portals, Rocks)
const laneObstacles = {
  [-8]:'rock',
  [0]:'flame',
  [8]:'portal'
};


function createObstacle(type, zPos, lane) {
  let obstacle;
  let height = 0.5;
  switch (type) {
    case "flame":
      if (flameModel) obstacle = flameModel.clone();
      obstacle.scale.set(5, 5, 5);
      height = 1.2;
      break;
     case "portal":
       if (portalModel) obstacle = portalModel.clone();
      obstacle.scale.set(10, 10, 10);
      height = 1;
       break;
       case "rock":
        if (rockModel) obstacle = rockModel.clone();
        rockModel.rotation.x = Math.PI / 2;
       obstacle.scale.set(5, 5, 5);
       height = 1;
        break;
  }
  if (obstacle) {
    if (zPos > -5) zPos = -50; // Assure que l'obstacle n'apparaisse pas trop proche du joueur
    obstacle.position.set(lane, height, zPos);
    scene.add(obstacle);
    obstacles.push(obstacle)
  }
}

// Paramètres pour le spawn des obstacles
; // Distance minimale entre les obstacles

function createObstacles() {
  if (obstacles.length >= MAX_OBSTACLES) return;
  const lanes = [-8, 0, 8];
  for (let i = 0; i < obstacleSpawnCount; i++) {
    const lane = lanes[Math.floor(Math.random() * lanes.length)];
    const types = ["rock", "flame", "portal"];
    const type = types[Math.floor(Math.random() * types.length)];
    const zPos = -200 - (i * obstacleSpacing) - Math.random() * 100; // Ajout de l'espacement
    createObstacle(type, zPos, lane);
  };
};

setInterval(createObstacles, 1000); // Créer des obstacles régulièrement sur chaque lane


// Création des obstacles avec une position initiale suffisamment loin
setTimeout(() => {
  const initialZPos = -300; // Position initiale loin du personnage
  const existingLanes = []; // Suivi des voies utilisées
  for (let i = 0; i < 10; i++) {
    const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    createObstacle(type, initialZPos - i * 40, existingLanes); // Espacement entre les obstacles
  }
}, 5000); // Temporisation pour donner du temps au joueur

// Fonction pour gérer le mouvement des obstacles
function handleObstacles() {
  obstacles.forEach((obs) => {
    obs.position.z += gameSpeed;
    // Lorsque l'obstacle dépasse la zone visible, on le repositionne avec un décalage aléatoire
    if (obs.position.z > 5) {
      // Réinitialisation avec un offset aléatoire pour éviter l'empilement
      obs.position.z = -300 - Math.random() * 100;
      // Changer de voie de manière aléatoire
      const lanes = [-8, 0, 8];
      obs.position.x = lanes[Math.floor(Math.random() * lanes.length)];
    }
    // Vérification de collision
    if (checkCollision(obs)) {
      showGameOver();
    }
  });
}

function handleJump() {
  if (isJumping && character?.position) {
    character.position.y += jumpVelocity;
    jumpVelocity -= 0.01;
    if (character.position.y <= 0) {
      character.position.y = 0;
      isJumping = false;
    }
  }
}


function restartGame() {
  if (isGameOver) {
    document.body.removeChild(gameOverElement);
    score = 0;
    scoreElement.innerText = `Score: ${score}`;
    character.position.set(0, 1, 5);
    

    obstacles.forEach((obstacle) => {
      scene.remove(obstacle);
    });
    obstacles.length = 0;
    
    isGameOver = false;

    obstacleInterval = setInterval(createObstacles, 2000);
    
    animate();
  }
}


window.addEventListener("keydown", restartGame);

// const { scoreElement, bestScoreElement, updateScoreDisplay, checkBestScore } = setupUI(gameMusic, animate, () => isPaused = true, () => isPaused = false);




// Suppression de l'ancien conteneur UI et création d'un nouveau à gauche
// const uiContainer = document.createElement("div");
// uiContainer.style.position = "absolute";
// uiContainer.style.left = "20px";
// uiContainer.style.bottom = "20px";
// uiContainer.style.display = "flex";
// uiContainer.style.display = "grid";
// uiContainer.style.gridTemplateAreas = `
//   ".  P  ."
//   ". up ."
//   "left . right"
//   ". down ."
// `;
// uiContainer.style.gap = "5px";
// // uiContainer.style.flexDirection = "column"; // Empile les boutons verticalement
// // uiContainer.style.justifyContent = "center"; // Centre verticalement
// // uiContainer.style.alignItems = "center";     // Centre horizontalement
// uiContainer.style.gap = "15px";
// document.body.appendChild(uiContainer);


// // Fonction pour créer des boutons interactifs
// function createButton(iconPath, action) {
//   const button = document.createElement("div");
//   button.style.width = "80px";
//   button.style.height = "80px";
//   button.style.display = "flex";
//   button.style.alignItems = "center";
//   button.style.justifyContent = "center";
//   button.style.cursor = "pointer";

//   const iconButton = document.createElement("img");
//   iconButton.src = iconPath;
//   iconButton.style.width = "50px";
//   iconButton.style.height = "50px";

//   button.appendChild(iconButton);
//     uiContainer.appendChild(button);
//     return button;
// }

// // Simuler les actions du jeu
// function moveLeft() { console.log("Déplacement à gauche"); }
// function moveRight() { console.log("Déplacement à droite"); }
// function jump() { console.log("Saut"); }
// function down(){}




// // Ajout des boutons
// const leftButton = createButton("public/icons/arrow-left-line.svg", moveLeft);
// const rightButton = createButton("public/icons/arrow-right-line.svg", moveRight);
// const upButton = createButton("public/icons/arrow-up-line.svg", jump);
// const downButton = createButton("public/icons/arrow-down-line.svg", down,);


// leftButton.style.gridArea = "left";
// rightButton.style.gridArea = "right";
// upButton.style.gridArea = "up";
// downButton.style.gridArea = "down";

// createButton("P", ActivatePower);


const gameTitle = document.createElement("div");
gameTitle.innerText = "ESCAPE FROM KANG";
gameTitle.style.position = "absolute";
gameTitle.style.top = "30%";
gameTitle.style.left = "20px";
gameTitle.style.transform = "translateY(-50%)";
gameTitle.style.fontSize = "40px";
gameTitle.style.color = "#00ffff";
gameTitle.style.fontFamily = "Marvel, sans-serif";
gameTitle.style.textTransform = "uppercase";
gameTitle.style.textShadow = "3px 3px 15px rgba(0, 255, 255, 0.9)";
document.body.appendChild(gameTitle);

let bestScore = localStorage.getItem("bestScore") || 0;
let score = 0;


const scoreElement = document.createElement("div");
scoreElement.style.position = "absolute";
scoreElement.style.top = "20px";
scoreElement.style.left = "50%";
scoreElement.style.transform = "translateX(-50%)";
scoreElement.style.color = "#ffffff";
scoreElement.style.fontSize = "24px";
scoreElement.style.fontWeight = "bold";
scoreElement.style.fontFamily = "Marvel, sans-serif";
document.body.appendChild(scoreElement);


const bestScoreElement = document.createElement("div");
bestScoreElement.style.position = "absolute";
bestScoreElement.style.top = "50px";
bestScoreElement.style.left = "50%";
bestScoreElement.style.transform = "translateX(-50%)";
bestScoreElement.style.color = "gold";
bestScoreElement.style.fontSize = "22px";
bestScoreElement.style.fontWeight = "bold";
bestScoreElement.style.fontFamily = "Marvel, sans-serif";
document.body.appendChild(bestScoreElement);


function updateScoreDisplay() {
  scoreElement.innerText = `Score: ${score}`;
  bestScoreElement.innerText = `Meilleur Score: ${bestScore}`;
}


function checkBestScore() {
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("bestScore", bestScore); 
  }
}

const menuIcon = document.createElement("img");
menuIcon.src = "public/icons/settings.svg";  
menuIcon.style.width = "40px";
menuIcon.style.height = "40px";
menuIcon.style.position = "absolute";
menuIcon.style.top = "20px";
menuIcon.style.right = "20px";
menuIcon.style.cursor = "pointer";
menuIcon.style.zIndex = "1000"; 

document.body.appendChild(menuIcon);



const SettingsMenu = document.createElement("div");
SettingsMenu.style.position = "absolute";
SettingsMenu.style.top = "0";
SettingsMenu.style.right = "0";
SettingsMenu.style.width = "250px";
SettingsMenu.style.height = "100%";
SettingsMenu.style.display = "flex";
SettingsMenu.style.flexDirection = "column";
SettingsMenu.style.alignItems = "center";
SettingsMenu.style.justifyContent = "center";
SettingsMenu.style.gap = "20px";
SettingsMenu.style.boxShadow = "5px 0 15px rgba(0,0,0,0.5)";
SettingsMenu.style.display = "none"; 
SettingsMenu.style.zIndex = "999";


document.body.appendChild(SettingsMenu);



const resumeButton = document.createElement("button")

resumeButton.innerText = "Reprendre";
resumeButton.style.padding = "10px 20px";
resumeButton.style.fontSize = "18px";


resumeButton.addEventListener("click", () => {
  SettingsMenu.style.display = "none"; 
  animate(); 
});

const startMusicButton = document.createElement("button");
startMusicButton.innerText = "Activer la musique";
startMusicButton.style.padding = "10px 20px";
startMusicButton.style.fontSize = "18px";

startMusicButton.addEventListener("click", () => {
  gameMusic.play().then(() => {
    console.log("Musique de jeu activée !");
    startMusicButton.style.display = "none"; 
  }).catch(error => console.error("Erreur de lecture automatique :", error));
});

SettingsMenu.appendChild(startMusicButton);

const muteButton = document.createElement("button");
muteButton.innerText = "Couper la musique";
muteButton.style.padding = "10px 20px";
muteButton.style.fontSize = "18px";
muteButton.addEventListener("click", () => {
  gameMusic.muted = !gameMusic.muted;
  muteButton.innerText = gameMusic.muted ? "Activer la musique" : "Couper la musique";
});
SettingsMenu.appendChild(muteButton);

const volumeSlider = document.createElement("input");
volumeSlider.type = "range";
volumeSlider.min = "0";
volumeSlider.max = "1";
volumeSlider.step = "0.01";
volumeSlider.value = gameMusic.volume;

volumeSlider.addEventListener("input", (e) => {
  gameMusic.volume = e.target.value;
});

SettingsMenu.appendChild(volumeSlider);

const quitButton = document.createElement("button");
quitButton.innerText = "Quitter";
quitButton.style.padding = "10px 20px";
quitButton.style.fontSize = "18px";
quitButton.addEventListener("click", () => {
  window.location.href = "selectionCharater.html"; 
});


SettingsMenu.appendChild(resumeButton);
SettingsMenu.appendChild(muteButton);
SettingsMenu.appendChild(quitButton);



// // Vérifie si la fonction animate existe
// if (typeof animate === 'undefined') {
//   function animate() {
//     animationId = requestAnimationFrame(animate);
//     // Ajoute ici les appels nécessaires pour le rendu du jeu
//   }
// }

menuIcon.addEventListener("click", () => {
  SettingsMenu.style.display = SettingsMenu.style.display === "none" ? "flex" : "none";
  if (SettingsMenu.style.display === "flex") {
    cancelAnimationFrame(animationId); 
  } else {
    animate(); 
  }
});

function animateWalls() {
  wallShaderMaterial.uniforms.time.value += 0.05;
  requestAnimationFrame(animateWalls);
}
animateWalls();


function animate() {
  if (isPaused) return;
  
  animationId = requestAnimationFrame(animate);
  handleJump();
  handleObstacles();
  increaseSpeed();
  updateCharacterHitbox();
  score += 1;
  scoreElement.innerText = `Score: ${score}`;
  updateScoreDisplay();

  obstacles.forEach((obstacle) => {
    obstacle.position.z += 0.3;
    if (obstacle.position.z > 5) obstacle.position.z = -300;
    if (checkCollision(obstacle)) {
      showGameOver();
    }
  });

  renderer.render(scene, camera);
}



  animate();
}

// // Classement des meilleurs scores
// const leaderboard = document.createElement("div");
// leaderboard.style.position = "absolute";
// leaderboard.style.top = "120px";
// leaderboard.style.left = "20px";
// leaderboard.style.color = "#ffffff";
// leaderboard.style.fontSize = "24px";
// leaderboard.style.fontFamily = "Marvel, sans-serif";
// document.body.appendChild(leaderboard);
 let bestScore = localStorage.getItem("bestScore") || 0;
 let score = 0;
 let highScores = [0, 0, 0];

// function updateScore() {
//     score += 1;
//     scoreElement.innerText = `Score: ${score}`;
   
//     if (score > highScores[2]) {
//         highScores[2] = score;
//         highScores.sort((a, b) => b - a);
//     }
   
//     leaderboard.innerHTML = `
//         <div>Top Scores:</div>
//         <div>1st: ${highScores[0]}</div>
//         <div>2nd: ${highScores[1]}</div>
//         <div>3rd: ${highScores[2]}</div>
//     `;
//     requestAnimationFrame(updateScore);
// }
// updateScore();