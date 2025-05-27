// homescript.js

const socket = io();

// Handle "Start New Quiz" button click
document.querySelector('.create-game').addEventListener('click', () => {
    const username = document.querySelector('.username-input').value.trim();

    localStorage.setItem("currentUser", username);

    socket.emit('createRoom', username);
});

// Handle "Join Now" button click
document.querySelector('.join-game-btn').addEventListener('click', () => {
    const username = document.querySelector('.username-input').value.trim();
    const roomCode = document.querySelector('.code-input').value.trim();

    if (!roomCode) {
        alert('Please enter a room code.');
        return;
    }

    localStorage.setItem("currentUser", username);

    socket.emit('joinRoom', { username, roomCode });
});

// When room is successfully created, redirect to the quiz page
socket.on('roomCreated', (roomCode) => {
    window.location.href = `play.html?room=${roomCode}`;
});

// When a player joins a room
socket.on('playerJoined', (players) => {
    console.log('Players in room:', players);
});

// If an error occurs (e.g., room doesn't exist)
socket.on('error', (msg) => {
    alert(msg);
});

socket.on('error', (msg) => {
    console.error('Socket error:', msg);
    alert(msg);
});

// When a player successfully joins a room
socket.on('roomJoined', (roomCode) => {
    window.location.href = `play.html?room=${roomCode}`;
});