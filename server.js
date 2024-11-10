const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const players = {
    // [socketId]: {
    //     username: string,
    //     score: number,
    //     cookieSize: number,
    //     powerups: {
    //         doublePower: boolean
    //     }
    // }
}; 
let hostId = null;
let gameTimer = null;
let gameStarted = false;
let timeRemaining = 0;
let timerInterval = null;

function resetGame() {
    if (gameStarted) {  // Only determine winner if a game was in progress
        // Find the winner
        let maxScore = -1;
        let winner = null;
        
        Object.entries(players).forEach(([id, player]) => {
            if (player.score > maxScore) {
                maxScore = player.score;
                winner = player;
            }
        });
        
        // Announce winner before resetting
        if (winner) {
            io.emit("gameOver", {
                winner: winner.username,
                score: winner.score
            });
        }
    }
    
    gameStarted = false;
    timeRemaining = 0;
    if (timerInterval) clearInterval(timerInterval);
    
    // Reset all players' scores and cookie sizes
    Object.keys(players).forEach(playerId => {
        players[playerId].score = 0;
        players[playerId].cookieSize = 100;
    });
    
    io.emit("gameReset");
    io.emit("updatePlayers", players);
}

io.on("connection", (socket) => {
    socket.on("newPlayer", (data) => {
        players[socket.id] = { 
            username: data.username, 
            score: 0,
            cookieSize: 100,
            powerups: {
                doublePower: false
            }
        };
        });
        if (hostId === null) {
            hostId = socket.id;
            io.to(hostId).emit("setHost");
        }
        socket.emit("gameState", { 
            gameStarted,
            timeRemaining,
            hostId: socket.id === hostId
        });
        io.emit("updatePlayers", players);
    });

    socket.on("setTimer", (time) => {
        if (socket.id === hostId) {
            gameTimer = time;
            io.emit("timerSet", gameTimer);
        }
    });

    socket.on("startGame", () => {
        if (socket.id === hostId && !gameStarted) {
            gameStarted = true;
            timeRemaining = gameTimer;
            
            if (timerInterval) clearInterval(timerInterval);
            
            timerInterval = setInterval(() => {
                timeRemaining--;
                io.emit("timerUpdate", timeRemaining);
                
                if (timeRemaining <= 0) {
                    clearInterval(timerInterval);
                    resetGame();
                }
            }, 1000);
            
            io.emit("gameStarted", timeRemaining);
        }
    });

socket.on("applyPowerup", (data) => {
    if (players[socket.id] && gameStarted) {
        if (data.type === 'doublePower') {
            players[socket.id].powerups.doublePower = true;
        }
    }
});

// Modify the cookieClicked handler to account for double power
socket.on("cookieClicked", () => {
    if (players[socket.id] && gameStarted) {
        const clickPower = players[socket.id].powerups.doublePower ? 2 : 1;
        players[socket.id].score += clickPower;
        players[socket.id].cookieSize = Math.min(300, players[socket.id].cookieSize + 5);
        io.emit("updatePlayers", players);
    }
});

    socket.on("disconnect", () => {
        delete players[socket.id];
        if (socket.id === hostId) {
            hostId = Object.keys(players)[0] || null;
            if (hostId) {
                io.to(hostId).emit("setHost");
            } else {
                resetGame();
            }
        }
        io.emit("updatePlayers", players);
    });
});

app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
