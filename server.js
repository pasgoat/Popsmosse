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
const QUESTION_TIME = 15000; // 15 seconds per question
const ANSWER_REVEAL_TIME = 5000; // 5 seconds to show the correct answer
const allQuestions = [
    { image: "question1.png", answer: "ozil" },
    { image: "question2.png", answer: "cantabria" },
    { image: "question3.png", answer: "djokovic" },
    { image: "question4.png", answer: "brady" },
    { image: "question5.png", answer: "arcteryx" },
    { image: "question6.png", answer: "yakko's world" },
    { image: "question7.png", answer: "kosovo" },
    { image: "question8.png", answer: "syria" },
    { image: "question9.png", answer: "paramore" },
    { image: "question10.png", answer: "4chan" },
    { image: "question11.png", answer: "spiderman" },
    { image: "question12.png", answer: "penn" },
    { image: "question13.png", answer: "zendaya" },
    { image: "question14.png", answer: "skoda" },
    { image: "question15.png", answer: "the name of the rose" },
    { image: "question16.png", answer: "mulan" },
    { image: "question17.png", answer: "kill bill" },
    { image: "question18.png", answer: "21 savage" },
    { image: "question19.png", answer: "chili pepper" },
    { image: "question20.png", answer: "markiplier" }
];

function startQuiz(roomCode) {
    const room = rooms[roomCode];
    if (!room) return;

    function sendNextQuestion() {
        const question = allQuestions[Math.floor(Math.random() * allQuestions.length)];
        room.currentQuestion = question;
        room.answeredPlayers = new Set(); // 🔄 Reset for new question

        io.to(roomCode).emit('newQuestion', { 
            image: question.image,
            duration: QUESTION_TIME / 1000
        });

        setTimeout(() => {
            io.to(roomCode).emit('revealAnswer', { answer: question.answer });

            setTimeout(() => {
                sendNextQuestion();
            }, ANSWER_REVEAL_TIME);
        }, QUESTION_TIME);
    }

    sendNextQuestion();
}



io.on('connection', (socket) => {
    console.log('✅ A user connected');

    // Create a new room
    socket.on('createRoom', (username) => {
    const roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    rooms[roomCode] = {
    players: [{ name: username, score: 0, answeredQuestions: new Set() }],
    host: socket.id
    };

    socket.join(roomCode);
    socket.emit('roomCreated', roomCode);
    });

    //Join an existing room
    socket.on('joinRoom', ({ username, roomCode }) => {
    if (rooms[roomCode]) {
        const existingPlayer = rooms[roomCode].players.find(p => p.name === username);
        if (!existingPlayer) {
            rooms[roomCode].players.push({ name: username, score: 0, answeredQuestions: new Set() });
        }

        socket.join(roomCode);
        io.to(roomCode).emit('playerJoined', rooms[roomCode].players);
        socket.emit('roomJoined', roomCode);
        // Only start if first player joined
        if (rooms[roomCode].players.length === 1) {
            startQuiz(roomCode);
        }
    } else {
        socket.emit('error', 'Room not found');
    }

    socket.on('submitAnswer', ({ roomCode, username, answer }) => {
    const room = rooms[roomCode];
    if (!room || !room.currentQuestion) return;

    const correctAnswer = room.currentQuestion.answer.toLowerCase();
    const userAnswer = answer.toLowerCase();

    // ✅ Prevent multiple submissions for the same question
    if (room.answeredPlayers && room.answeredPlayers.has(username)) {
        return;
    }

    if (userAnswer === correctAnswer) {
        const player = room.players.find(p => p.name === username);
        if (player) {
            player.score += 10;
            room.answeredPlayers.add(username); // 🚫 Mark as answered
            io.to(roomCode).emit('playerJoined', room.players);
            console.log(`✅ ${username} answered correctly!`);
        }
    }
    });



    });

    // Handle answer submission
    socket.on('correctAnswer', ({ roomCode, username }) => {
    if (rooms[roomCode]) {
        const player = rooms[roomCode].players.find(p => p.name === username);
        if (player) {
            const currentQuestionId = rooms[roomCode].currentQuestion.image;
            if (player.answeredQuestions.has(currentQuestionId)) return;

            player.score += 10;
            io.to(roomCode).emit('playerJoined', rooms[roomCode].players);
            console.log(`✅ ${username} answered correctly in room ${roomCode}`);
            }
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
    const os = require('os');

    const interfaces = os.networkInterfaces();
    let serverIP;

    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
        // Skip over internal (i.e. 127.0.0.1) and non-IPv4 addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                serverIP = iface.address;
                break;
            }
        }
        if (serverIP) break;
    }   

    console.log('🌐 Access it from other devices using your local IP, like: http://' + serverIP + ':3000/home.html');
});
