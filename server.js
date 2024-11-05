const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// Initialize Express and HTTP server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public')); // Serve static files from 'public' folder

// Store player data
let players = {};

io.on('connection', (socket) => {
    console.log('A player connected:', socket.id);

    // Add new player to the players object
    socket.on('newPlayer', (username) => {
        players[socket.id] = { username, score: 0, cookieSize: 100 };
        io.emit('updatePlayers', players); // Send all players to everyone
    });

    // Update player score and cookie size
    socket.on('cookieClicked', () => {
        if (players[socket.id]) {
            players[socket.id].score += 1;
            players[socket.id].cookieSize = Math.min(players[socket.id].cookieSize + 5, 300);
            io.emit('updatePlayers', players); // Broadcast updated players to everyone
        }
    });

    // Handle player disconnect
    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        delete players[socket.id];
        io.emit('updatePlayers', players); // Update everyone on disconnect
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
