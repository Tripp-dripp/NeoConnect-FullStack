const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

// Create a new express app and server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const players = {}; // Store player data by socket ID

// Serve static files from the current directory
app.use(express.static(__dirname));

io.on("connection", (socket) => {
    console.log("New player connected:", socket.id);

    // Handle new player joining
    socket.on("newPlayer", (data) => {
        const { username } = data;
        
        // Add player data to the players object
        players[socket.id] = {
            username: username,
            score: 0,
            cookieSize: 100
        };
        
        console.log(`Player joined: ${username} (ID: ${socket.id})`);
        
        // Send updated player list to all clients
        io.emit("updatePlayers", players);
    });

    // Handle cookie click event
    socket.on("cookieClicked", () => {
        if (players[socket.id]) {
            players[socket.id].score += 1; // Increment the player's score
            players[socket.id].cookieSize += 5; // Increase cookie size
        }
        
        console.log(
            `Player ${players[socket.id].username} (ID: ${socket.id}) score: ${players[socket.id].score}`
        );
        
        // Send updated player data to all clients
        io.emit("updatePlayers", players);
    });

    // Handle player disconnecting
    socket.on("disconnect", () => {
        if (players[socket.id]) {
            console.log(`Player disconnected: ${players[socket.id].username}`);
            delete players[socket.id]; // Remove player from list
        }
        
        // Send updated player list to all clients
        io.emit("updatePlayers", players);
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
