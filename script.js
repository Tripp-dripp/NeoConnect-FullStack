const socket = io();

// HTML elements that won't be recreated
const usernameContainer = document.getElementById("username-container");
const usernameInput = document.getElementById("username-input");
const startButton = document.getElementById("start-button");
const gameContainer = document.getElementById("game-container");

// HTML elements that will be recreated - use 'let'
let scoreDisplay;
let cookieImage;
let otherPlayersContainer;

// Game variables
let score = 0;
let cookieSize = 100;
const maxCookieSize = 300;
const growthStep = 5;
let username = "";
let isHost = false;
let gameStarted = false;

// Create main game structure
function createGameStructure() {
    gameContainer.innerHTML = `
        <div id="main-game-area">
            <div id="host-controls"></div>
            <div id="game-info">
                <div id="player-info">
                    <h3>Player: ${username}</h3>
                    <p id="score-display">Score: 0</p>
                </div>
                <div id="timer-display">Time: --:--</div>
            </div>
            <img src="images/playerCookie.png" id="cookie" style="opacity: 0.5">
        </div>
        <div id="scrollable-container">
            <div id="other-players" class="players-list"></div>
        </div>
    `;

    // Reassign element references after creating structure
    cookieImage = document.getElementById("cookie");
    scoreDisplay = document.getElementById("score-display");
    otherPlayersContainer = document.getElementById("other-players");
    
    // Add click handler for cookie
    setupCookieClickHandler();
}

function setupCookieClickHandler() {
    cookieImage.addEventListener("click", () => {
        if (!gameStarted) {
            alert("Please wait for the host to start the game!");
            return;
        }
        
        if (cookieSize < maxCookieSize) {
            cookieSize += growthStep;
            cookieImage.style.width = `${cookieSize}px`;
        }
        score++;
        scoreDisplay.textContent = `Score: ${score}`;
        
        socket.emit('cookieClicked');
    });
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

socket.on("setHost", () => {
    isHost = true;
    const hostControls = document.getElementById("host-controls");
    hostControls.style.display = "block";
    hostControls.innerHTML = `
        <input type="number" id="timer-input" placeholder="Time (seconds)" min="1">
        <button id="set-timer-btn">Set Timer</button>
        <button id="start-game-btn">Start Game</button>
    `;

    document.getElementById("set-timer-btn").onclick = () => {
        const time = parseInt(document.getElementById("timer-input").value);
        if (time > 0) socket.emit("setTimer", time);
    };

    document.getElementById("start-game-btn").onclick = () => {
        socket.emit("startGame");
    };
});

socket.on("gameState", (state) => {
    gameStarted = state.gameStarted;
    isHost = state.hostId;
    if (cookieImage) {
        cookieImage.style.opacity = gameStarted ? "1" : "0.5";
    }
    if (state.timeRemaining) {
        document.getElementById("timer-display").textContent = 
            `Time: ${formatTime(state.timeRemaining)}`;
    }
});

socket.on("timerSet", (time) => {
    const timerDisplay = document.getElementById("timer-display");
    if (timerDisplay) {
        timerDisplay.textContent = `Time: ${formatTime(time)}`;
    }
});

socket.on("timerUpdate", (time) => {
    const timerDisplay = document.getElementById("timer-display");
    if (timerDisplay) {
        timerDisplay.textContent = `Time: ${formatTime(time)}`;
    }
});

socket.on("gameStarted", (time) => {
    gameStarted = true;
    if (cookieImage) {
        cookieImage.style.opacity = "1";
    }
    const timerDisplay = document.getElementById("timer-display");
    if (timerDisplay) {
        timerDisplay.textContent = `Time: ${formatTime(time)}`;
    }
    if (isHost) {
        const startGameBtn = document.getElementById("start-game-btn");
        if (startGameBtn) {
            startGameBtn.disabled = true;
        }
    }
});

socket.on("gameReset", () => {
    gameStarted = false;
    score = 0;
    cookieSize = 100;
    if (cookieImage) {
        cookieImage.style.opacity = "0.5";
        cookieImage.style.width = "100px";
    }
    if (scoreDisplay) {
        scoreDisplay.textContent = "Score: 0";
    }
    const timerDisplay = document.getElementById("timer-display");
    if (timerDisplay) {
        timerDisplay.textContent = "Time: --:--";
    }
    if (isHost) {
        const startGameBtn = document.getElementById("start-game-btn");
        if (startGameBtn) {
            startGameBtn.disabled = false;
        }
    }
});

startButton.addEventListener("click", () => {
    username = usernameInput.value.trim();
    if (username) {
        usernameContainer.style.display = "none";
        gameContainer.classList.remove("hidden");
        createGameStructure();
        socket.emit('newPlayer', { username });
    } else {
        alert("Please enter a username to start.");
    }
});

socket.on('updatePlayers', (players) => {
    if (!otherPlayersContainer) return;
    
    otherPlayersContainer.innerHTML = "";

    for (const id in players) {
        const player = players[id];
        if (id === socket.id) {
            score = player.score;
            cookieSize = player.cookieSize;
            if (cookieImage) {
                cookieImage.style.width = `${player.cookieSize}px`;
            }
            if (scoreDisplay) {
                scoreDisplay.textContent = `Score: ${player.score}`;
            }
            continue;
        }

        const playerDiv = document.createElement("div");
        playerDiv.classList.add("other-player");
        
        playerDiv.innerHTML = `
            <p>${player.username}</p>
            <div class="cookie-container">
                <img src="images/playerCookie.png" style="width: ${player.cookieSize}px">
                <p>Score: ${player.score}</p>
            </div>
        `;
        
        otherPlayersContainer.appendChild(playerDiv);
    }
});

// Prevent double-click selection
document.addEventListener('dblclick', function(event) {
    event.preventDefault();
}, { passive: false });
