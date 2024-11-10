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
let shopOpen = false;
let shopItems = [
    {
        id: 1,
        title: "Auto Clicker",
        description: "Clicks automatically every second",
        price: 100,
        owned: 0
    },
    {
        id: 2,
        title: "Mr. Coffee's Steam Brew",
        description: "Doubles your clicking power permanently!",
        price: 150,
        owned: 0
    }
];

// Create main game structure
function createGameStructure() {
    // Add background image
    document.body.insertAdjacentHTML('afterbegin', `
        <img src="images/background.png" class="background-image">
    `);

    // Add shop button and sidebar with correct image path
    document.body.insertAdjacentHTML('beforeend', `
        <img src="images/shopTab.png" alt="Shop" class="shop-tab-button" id="shopTabButton">
        <div class="shop-sidebar" id="shopSidebar">
            <div class="shop-content">
                <div class="shop-header">
                    <h2>Mr. Coffee's Shop</h2>
                </div>
                <div id="shopItems"></div>
            </div>
        </div>
    `);

    // Rest of the game structure remains the same
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

    cookieImage = document.getElementById("cookie");
    scoreDisplay = document.getElementById("score-display");
    otherPlayersContainer = document.getElementById("other-players");
    
    setupCookieClickHandler();
    setupShopHandlers();
    updateShopDisplay();
    loadGameState();
}

function setupShopHandlers() {
    const shopTabButton = document.getElementById('shopTabButton');
    const shopSidebar = document.getElementById('shopSidebar');

    shopTabButton.addEventListener('click', () => {
        shopOpen = !shopOpen;
        shopSidebar.classList.toggle('open', shopOpen);
    });
}

function updateShopDisplay() {
    const shopItemsContainer = document.getElementById('shopItems');
    shopItemsContainer.innerHTML = shopItems.map(item => `
        <div class="shop-item ${item.owned > 0 ? 'owned' : ''}" onclick="purchaseItem(${item.id})">
            <img src="images/mrCoffee.png" alt="Shop Item" class="shop-item-image">
            <div class="shop-item-info">
                <div class="shop-item-title">${item.title} ${item.owned > 0 ? '(Active)' : ''}</div>
                <div class="shop-item-description">${item.description}</div>
            </div>
            <div class="shop-item-price">${item.price}</div>
        </div>
    `).join('');
}

function purchaseItem(itemId) {
    if (!gameStarted) {
        alert("Please wait for the game to start!");
        return;
    }

    const item = shopItems.find(i => i.id === itemId);
    if (!item || item.owned > 0) return; // Prevent buying the same item multiple times
    
    if (score >= item.price) {
        score -= item.price;
        item.owned += 1;
        scoreDisplay.textContent = `Score: ${score}`;
        
        // Apply item effects
        switch(itemId) {
            case 1: // Auto Clicker
                setInterval(() => {
                    if (gameStarted) {
                        socket.emit('cookieClicked');
                    }
                }, 1000);
                break;
            case 2: // Steam Brew
                socket.emit('applyPowerup', { type: 'doublePower' });
                break;
        }
        
        updateShopDisplay();
        socket.emit('updateScore', score);
    } else {
        alert("Not enough points!");
    }
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

socket.on("gameOver", ({ winner, score }) => {
    const winnerBanner = document.createElement("div");
    winnerBanner.style.position = "fixed";
    winnerBanner.style.top = "50%";
    winnerBanner.style.left = "50%";
    winnerBanner.style.transform = "translate(-50%, -50%)";
    winnerBanner.style.background = "rgba(255, 215, 0, 0.95)";
    winnerBanner.style.padding = "20px";
    winnerBanner.style.borderRadius = "10px";
    winnerBanner.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
    winnerBanner.style.zIndex = "1000";
    winnerBanner.innerHTML = `
        <h2 style="margin: 0 0 10px 0; color: #333;">🎉 Game Over! 🎉</h2>
        <p style="margin: 0; font-size: 1.2em; color: #333;">
            Winner: <strong>${winner}</strong><br>
            Final Score: <strong>${score}</strong>
        </p>
    `;
    
    document.body.appendChild(winnerBanner);
    
    setTimeout(() => {
        document.body.removeChild(winnerBanner);
    }, 5000);
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

// Prevent double-click selection
document.addEventListener('dblclick', function(event) {
    event.preventDefault();
}, { passive: false });
