const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Serve static files (HTML, JS, CSS, etc.)

app.use(express.static(__dirname));
app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/js'));
app.use(express.static(__dirname + '/questions'));
app.use(express.static(__dirname + '/html'));

const rooms = {}; // Store rooms in memory

io.on('connection', (socket) => {
    console.log('✅ A user connected');

    // Create a new room
    socket.on('createRoom', (username) => {
        const roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
        rooms[roomCode] = { players: [username], host: socket.id };
        socket.join(roomCode);
        socket.emit('roomCreated', roomCode);
        console.log(`Room ${roomCode} created by ${username}`);
    });

    // Join an existing room
    socket.on('joinRoom', ({ username, roomCode }) => {
        if (rooms[roomCode]) {
            if (!rooms[roomCode].players.includes(username)) {
                rooms[roomCode].players.push(username);
            }
            socket.join(roomCode);

            // Update all players in the room
            io.to(roomCode).emit('playerJoined', rooms[roomCode].players);

            // Notify the joining player to go to the play page
            socket.emit('roomJoined', roomCode);

            console.log(`${username} joined room ${roomCode}`);
        } else {
            socket.emit('error', 'Room not found');
        }
    });

    socket.on('disconnect', () => {
        console.log('❌ A user disconnected');
        // (Optional: handle player removal and room cleanup here)
    });
});

// Allow connections from any device on the network
http.listen(3000, '0.0.0.0', () => {
    console.log('🚀 Server running on your local network');
    console.log('🌐 Access it from other devices using your local IP, like: http://10.101.12.34:3000/home.html');
});
