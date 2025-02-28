// export function setupUI(gameMusic, animate, pauseGame, resumeGame) {
//     // 📌 Titre du jeu
//     const gameTitle = document.createElement("div");
//     gameTitle.innerText = "ESCAPE FROM KANG";
//     gameTitle.style.position = "absolute";
//     gameTitle.style.top = "30%";
//     gameTitle.style.left = "20px";
//     gameTitle.style.transform = "translateY(-50%)";
//     gameTitle.style.fontSize = "40px";
//     gameTitle.style.color = "#00ffff";
//     gameTitle.style.fontFamily = "Marvel, sans-serif";
//     gameTitle.style.textTransform = "uppercase";
//     gameTitle.style.textShadow = "3px 3px 15px rgba(0, 255, 255, 0.9)";
//     document.body.appendChild(gameTitle);

//     // 📌 Score
//     let bestScore = localStorage.getItem("bestScore") || 0;
//     let score = 0;

//     const scoreElement = document.createElement("div");
//     scoreElement.style.position = "absolute";
//     scoreElement.style.top = "20px";
//     scoreElement.style.left = "50%";
//     scoreElement.style.transform = "translateX(-50%)";
//     scoreElement.style.color = "#ffffff";
//     scoreElement.style.fontSize = "24px";
//     scoreElement.style.fontWeight = "bold";
//     scoreElement.style.fontFamily = "Marvel, sans-serif";
//     document.body.appendChild(scoreElement);



//     const bestScoreElement = document.createElement("div");
//     bestScoreElement.style.position = "absolute";
//     bestScoreElement.style.top = "50px";
//     bestScoreElement.style.left = "50%";
//     bestScoreElement.style.transform = "translateX(-50%)";
//     bestScoreElement.style.color = "gold";
//     bestScoreElement.style.fontSize = "22px";
//     bestScoreElement.style.fontWeight = "bold";
//     bestScoreElement.style.fontFamily = "Marvel, sans-serif";
//     document.body.appendChild(bestScoreElement);

        
//         function updateScoreDisplay() {
//             scoreElement.innerText = `Score: ${score}`;
//             bestScoreElement.innerText = `Meilleur Score: ${bestScore}`;
//         }
    

//     function checkBestScore() {
//         if (score > bestScore) {
//             bestScore = score;
//             localStorage.setItem("bestScore", bestScore);
//         }
//     }

    
//     const menuIcon = document.createElement("img");
//     menuIcon.src = "public/icons/settings.svg";
//     menuIcon.style.width = "40px";
//     menuIcon.style.height = "40px";
//     menuIcon.style.position = "absolute";
//     menuIcon.style.top = "20px";
//     menuIcon.style.right = "20px";
//     menuIcon.style.cursor = "pointer";
//     menuIcon.style.zIndex = "1000";
//     document.body.appendChild(menuIcon);

    
//     const SettingsMenu = document.createElement("div");
//     SettingsMenu.id = "settingsMenu";
//     SettingsMenu.style.position = "absolute";
//     SettingsMenu.style.top = "0";
//     SettingsMenu.style.right = "0";
//     SettingsMenu.style.width = "250px";
//     SettingsMenu.style.height = "100%";
//     SettingsMenu.style.display = "flex";

//     SettingsMenu.style.flexDirection = "column";
//     SettingsMenu.style.alignItems = "center";
//     SettingsMenu.style.justifyContent = "center";
//     SettingsMenu.style.gap = "20px";
//     SettingsMenu.style.boxShadow = "5px 0 15px rgba(0,0,0,0.5)";
//     SettingsMenu.style.display = "none";
//     SettingsMenu.style.zIndex = "999";
//     document.body.appendChild(SettingsMenu);

//     menuIcon.addEventListener("click", () => {

//         SettingsMenu.style.display = "flex";
//         pauseGame(); 
//     });
    

//     // 📌 Boutons du menu pause
//     const resumeButton = document.createElement("button");
//     resumeButton.innerText = "Reprendre";
//     resumeButton.style.padding = "10px 20px";
//     resumeButton.style.fontSize = "18px";
//     resumeButton.addEventListener("click", () => {
//         SettingsMenu.style.display = "none";
//         resumeGame(); 
//         animate();
//     });

//     const startMusicButton = document.createElement("button");
//     startMusicButton.innerText = "Activer la musique";
//     startMusicButton.style.padding = "10px 20px";
//     startMusicButton.style.fontSize = "18px";
//     startMusicButton.addEventListener("click", () => {
//         gameMusic.play().then(() => {
//             startMusicButton.style.display = "none";
//         }).catch(error => console.error("Erreur de lecture :", error));
//     });

//     const muteButton = document.createElement("button");
//     muteButton.innerText = "Couper la musique";
//     muteButton.style.padding = "10px 20px";
//     muteButton.style.fontSize = "18px";
//     muteButton.addEventListener("click", () => {
//         gameMusic.muted = !gameMusic.muted;
//         muteButton.innerText = gameMusic.muted ? "Activer la musique" : "Couper la musique";
//     });

//     const volumeSlider = document.createElement("input");
//     volumeSlider.type = "range";
//     volumeSlider.min = "0";
//     volumeSlider.max = "1";
//     volumeSlider.step = "0.01";
//     volumeSlider.value = gameMusic.volume;
//     volumeSlider.addEventListener("input", (e) => {
//         gameMusic.volume = e.target.value;
//     });

//     const quitButton = document.createElement("button");
//     quitButton.innerText = "Quitter";
//     quitButton.style.padding = "10px 20px";
//     quitButton.style.fontSize = "18px";
//     quitButton.addEventListener("click", () => {     
//         window.location.href = "selectionCharacter.html";
//     });

//     SettingsMenu.appendChild(resumeButton);
//     SettingsMenu.appendChild(startMusicButton);
//     SettingsMenu.appendChild(muteButton);
//     SettingsMenu.appendChild(volumeSlider);
//     SettingsMenu.appendChild(quitButton);

//     return { scoreElement, bestScoreElement, updateScoreDisplay, checkBestScore };
// }
