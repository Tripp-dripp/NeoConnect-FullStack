// Connect to the server
const socket = io();

// HTML elements
const usernameContainer = document.getElementById("username-container");
const usernameInput = document.getElementById("username-input");
const startButton = document.getElementById("start-button");
const gameContainer = document.getElementById("game-container");
const usernameDisplay = document.getElementById("username-display");
const scoreDisplay = document.getElementById("score-display");
const cookieImage = document.getElementById("cookie");
const otherPlayersContainer = document.getElementById("other-players");

// Game variables
let score = 0;
let cookieSize = 100;
const maxCookieSize = 300;
const growthStep = 5;
let username = "";

// Handle new player join
startButton.addEventListener("click", () => {
    username = usernameInput.value.trim();
    if (username) {
        usernameContainer.style.display = "none";
        gameContainer.classList.remove("hidden");

        // Display the player's username
        usernameDisplay.textContent = `Player: ${username}`;
        
        // Notify server of new player
        socket.emit('newPlayer', { username }); // Send username only
    } else {
        alert("Please enter a username to start.");
    }
});

// Handle cookie click to increase size and score
cookieImage.addEventListener("click", () => {
    if (cookieSize < maxCookieSize) {
        cookieSize += growthStep;
        cookieImage.style.width = `${cookieSize}px`;
    }
    score++;
    scoreDisplay.textContent = `Score: ${score}`;
    
    socket.emit('cookieClicked');  // Notify server of the click
});

// Listen for updates from server
socket.on('updatePlayers', (players) => {
    otherPlayersContainer.innerHTML = ""; // Clear previous player list
    for (const id in players) {
        const player = players[id];

        // Skip rendering for the current player
        if (id === socket.id) continue;

        // Create a container for each other player's cookie and score
        const playerDiv = document.createElement("div");
        playerDiv.classList.add("other-player");

        // Show other player's username
        const playerUsername = document.createElement("p");
        playerUsername.textContent = `${player.username}`;
        
        // Display the other player's cookie and score
        const playerCookieContainer = document.createElement("div");
        playerCookieContainer.classList.add("cookie-container");

        const playerCookieImage = document.createElement("img");
        playerCookieImage.src = "images/playerCookie.png";
        playerCookieImage.style.width = `${player.cookieSize}px`;
        
        const playerScore = document.createElement("p");
        playerScore.textContent = `Score: ${player.score}`;
        
        // Append cookie and score to the player's container
        playerCookieContainer.appendChild(playerCookieImage);
        playerCookieContainer.appendChild(playerScore);

        // Append username and cookie container to playerDiv
        playerDiv.appendChild(playerUsername);
        playerDiv.appendChild(playerCookieContainer);
        
        // Add playerDiv to the otherPlayersContainer
        otherPlayersContainer.appendChild(playerDiv);

        // Adjust cookie position if it exceeds the screen boundary
        adjustCookiePosition(playerCookieImage);
    }
});

// Function to adjust cookie position
function adjustCookiePosition(cookie) {
    const cookieRect = cookie.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Check if the cookie is going out of bounds
    if (cookieRect.right > windowWidth) {
        cookie.style.transform = `translateX(${-cookieRect.width}px)`; // Move it left
    } else if (cookieRect.left < 0) {
        cookie.style.transform = `translateX(${cookieRect.width}px)`; // Move it right
    }
    if (cookieRect.bottom > windowHeight) {
        cookie.style.transform = `translateY(${-cookieRect.height}px)`; // Move it up
    } else if (cookieRect.top < 0) {
        cookie.style.transform = `translateY(${cookieRect.height}px)`; // Move it down
    }
}
